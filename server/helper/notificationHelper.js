import Notification from '../models/notification.js';
import NotificationDelivery from '../models/notificationDelivery.js';
import User from '../models/user.js';
import { emitNotification } from '../sockets/socket.js';
import { toDate } from 'date-fns-tz';

export const startNotificationCron = async () => {
  try {
    // console.log('⏱️ Running notification cron...');
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

    // 1. Get active, due notifications
    const notifications = await Notification.find({
      scheduledFor: { $gte: twoMinutesAgo, $lte: now },
      deleted: false,
      hasBeenSent: false,
    });

    for (const notification of notifications) {
      let usersToNotify = [];

      // 2. Determine user target
      if (notification.isBroadcast) {
        usersToNotify = await User.find({}, '_id').lean();
      } else if (notification.targetCompanies?.length) {
        usersToNotify = await User.find(
          { company: { $in: notification.targetCompanies } },
          '_id'
        ).lean();
      } else if (notification.targetUser) {
        usersToNotify.push({
          _id: notification.targetUser,
        });
      } else {
        continue; // No valid targets
      }

      if (!usersToNotify.length) continue;

      const userIds = usersToNotify.map((u) => u._id.toString());

      // 3. Skip already delivered users
      const alreadyDelivered = await NotificationDelivery.find({
        notification: notification._id,
        user: { $in: userIds },
        isRead: true,
      }).distinct('user');

      const deliveredSet = new Set(alreadyDelivered.map((id) => id.toString()));

      const usersPending = userIds.filter((uid) => !deliveredSet.has(uid));

      if (!usersPending.length) continue;

      // 4. Emit notification to online users only
      usersPending.forEach((userId) => {
        try {
          emitNotification(userId, {
            _id: notification._id,
            title: notification.title,
            message: notification.message,
            type: notification.type,
            link: notification.link,
            metadata: notification.metadata,
            createdAt: notification.createdAt,
          });
        } catch (err) {
          console.warn(`⚠️ Emit failed for user ${userId}: ${err.message}`);
        }
      });

      notification.hasBeenSent = true;
      await notification.save();
    }
  } catch (err) {
    console.error('❌ Notification Cron Error:', err.message);
  }
};

export const createNotification = async (data) => {
  const {
    scheduleTime,
    title,
    message,
    type,
    targetUser,
    link,
    metadata,
    isBroadcast,
    createdBy,
  } = data;

  try {
    const IST_TIMEZONE = 'Asia/Kolkata';

    const now = new Date();
    const scheduledFor = scheduleTime
      ? scheduleTime
      : toDate(now, { timeZone: IST_TIMEZONE });

    const notification = await Notification.create({
      title,
      message,
      type,
      targetUser,
      link,
      metadata,
      isBroadcast,
      createdBy,
      scheduledFor,
    });

    if (targetUser) {
      await NotificationDelivery.create({
        user: targetUser,
        notification: notification._id,
      });
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
