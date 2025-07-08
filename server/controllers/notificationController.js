import { isValidObjectId } from '../helper/indexHelper.js';
import Notifications from '../models/notification.js';
import NotificationDeliveries from '../models/notificationDelivery.js';

export const getAllNotifications = async (req, res, next) => {
  try {
    const {
      user: { userId, company },
    } = req;

    const now = new Date();

    const rawNotifications = await Notifications.find({
      deleted: false,
      scheduledFor: { $lte: now },
      $or: [
        { isBroadcast: true },
        { targetCompanies: { $in: company } },
        { targetUser: userId },
      ],
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'deliveries',
        match: { user: userId },
        select: 'isRead createdAt deleted',
      });

    const notifications = rawNotifications
      .map((notification) => {
        const obj = notification.toObject();

        // If there is a delivery for this user and it's marked as deleted, skip this notification
        if (
          obj.deliveries &&
          obj.deliveries.length > 0 &&
          obj.deliveries[0].deleted
        ) {
          return null;
        }

        return {
          ...obj,
          isRead:
            obj.deliveries && obj.deliveries.length > 0
              ? obj.deliveries[0].isRead
              : false,
        };
      })
      .filter(Boolean); // Remove nulls

    // Count unread notifications
    const unreadCount = notifications.filter(
      (n) => n.deliveries.length > 0 && n.deliveries[0].isRead === false
    ).length;

    res.status(200).json({ status: 'success', notifications, unreadCount });
  } catch (err) {
    next(err);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const {
      user: { userId, company },
      params: { id },
    } = req;

    if (!isValidObjectId(id)) {
      throw Error('Notification ID is required');
    }

    // Step 1: Find the notification
    const notification = await Notifications.findOne({
      _id: id,
      deleted: false,
    });

    if (!notification) {
      throw Error('Notification not found');
    }

    // Step 2: Try to find existing delivery
    let delivery = await NotificationDeliveries.findOne({
      notification: id,
      user: userId,
      isRead: false,
    });

    // Step 3: If not found, create it
    if (
      (!delivery && notification.isBroadcast) ||
      (!delivery && notification?.targetCompanies?.includes(String(company)))
    ) {
      delivery = new NotificationDeliveries({
        notification: id,
        user: userId,
        isRead: true,
        deliveredAt: new Date(),
      });
    } else if (!delivery.isRead) {
      delivery.isRead = true;
    }

    await delivery.save();

    res
      .status(200)
      .json({ status: 'success', message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const {
      user: { userId, company },
    } = req;

    const notifications = await Notifications.find({
      deleted: false,
      $or: [
        { isBroadcast: true },
        { targetCompanies: company },
        { targetUser: userId },
      ],
    });

    if (!notifications.length) {
      return res.status(200).json({
        status: 'success',
        message: 'No notifications to mark as read.',
      });
    }

    const notificationIds = notifications.map((n) => n._id);

    // Step 1: Get existing deliveries for this user
    const existingDeliveries = await NotificationDeliveries.find({
      notification: { $in: notificationIds },
      user: userId,
    });

    const existingMap = new Map();
    existingDeliveries.forEach((d) => {
      existingMap.set(d.notification.toString(), d);
    });

    const bulkOps = [];

    for (const notif of notifications) {
      const notifId = notif._id.toString();
      const existing = existingMap.get(notifId);

      if (existing) {
        if (!existing.isRead) {
          bulkOps.push({
            updateOne: {
              filter: { _id: existing._id },
              update: { $set: { isRead: true } },
            },
          });
        }
      } else {
        // only allow delivery creation if user is eligible
        const isUserEligible =
          notif.isBroadcast ||
          (notif.targetCompanies || []).includes(company?.toString());

        if (isUserEligible || notif.targetUser?.toString() === userId) {
          bulkOps.push({
            insertOne: {
              document: {
                notification: notif._id,
                user: userId,
                isRead: true,
                deliveredAt: new Date(),
              },
            },
          });
        }
      }
    }

    if (bulkOps.length) {
      await NotificationDeliveries.bulkWrite(bulkOps);
    }

    res.status(200).json({
      status: 'success',
      message: 'All notifications marked as read.',
    });
  } catch (err) {
    next(err);
  }
};

export const markAsDelete = async (req, res, next) => {
  try {
    const {
      user: { userId },
      params: { id },
    } = req;

    if (!isValidObjectId(id)) {
      throw Error('Notification ID is required');
    }

    // Step 1: Find the notification
    const notification = await Notifications.findOne({
      _id: id,
      deleted: false,
    });

    if (!notification) {
      throw Error('Notification not found');
    }

    // Step 2: Try to find existing delivery
    const delivery = await NotificationDeliveries.findOne({
      notification: id,
      user: userId,
      deleted: false,
    });

    if (!delivery) {
      throw Error('Notification not found');
    }

    delivery.deleted = true;
    await delivery.save();

    res
      .status(200)
      .json({ status: 'success', message: 'Notification marked as read.' });
  } catch (err) {
    next(err);
  }
};
