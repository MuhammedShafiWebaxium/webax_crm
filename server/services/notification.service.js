import Notification from '../models/notification.js';
import NotificationDelivery from '../models/notificationDelivery.js';
import User from '../models/user.js';
import { emitNotification } from '../sockets/socket.js';
import { enqueueNotification } from './queues/notification.queue.js';

export class NotificationService {
  static async scheduleNotification(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (!notification) return;

    const priority = notification.isBroadcast ? 1 : 
                   notification.targetCompanies?.length ? 3 : 5;
    
    await enqueueNotification(notificationId, priority);
  }

  static async processNotification(notificationId) {
    const notification = await Notification.findById(notificationId);
    if (!notification || notification.deleted || notification.hasBeenSent) {
      return;
    }

    const usersToNotify = await this.getRecipients(notification);
    if (!usersToNotify.length) return;

    const pendingUsers = await this.filterDelivered(notification._id, usersToNotify);
    if (!pendingUsers.length) return;

    await this.deliver(notification, pendingUsers);
    
    notification.hasBeenSent = true;
    await notification.save();
  }

  static async getRecipients(notification) {
    if (notification.isBroadcast) {
      const users = await User.find({}, '_id').lean();
      return users.map(u => u._id.toString());
    }
    
    if (notification.targetCompanies?.length) {
      const users = await User.find(
        { company: { $in: notification.targetCompanies } },
        '_id'
      ).lean();
      return users.map(u => u._id.toString());
    }
    
    if (notification.targetUser) {
      return [notification.targetUser.toString()];
    }
    
    return [];
  }

  static async filterDelivered(notificationId, userIds) {
    const delivered = await NotificationDelivery.find({
      notification: notificationId,
      user: { $in: userIds },
      isRead: true
    }).distinct('user');
    
    const deliveredSet = new Set(delivered.map(id => id.toString()));
    return userIds.filter(uid => !deliveredSet.has(uid));
  }

  static async deliver(notification, userIds, batchSize = 50) {
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      await Promise.all(batch.map(userId => this.deliverToUser(notification, userId)));
    }
  }

  static async deliverToUser(notification, userId) {
    try {
      // Emit socket notification
      emitNotification(userId, {
        _id: notification._id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        link: notification.link,
        metadata: notification.metadata,
        createdAt: notification.createdAt
      });

      // Record delivery
      await NotificationDelivery.findOneAndUpdate(
        { user: userId, notification: notification._id },
        { $setOnInsert: { user: userId, notification: notification._id } },
        { upsert: true, new: true }
      );
    } catch (err) {
      console.error(`Failed to deliver to ${userId}:`, err.message);
      throw err;
    }
  }
}