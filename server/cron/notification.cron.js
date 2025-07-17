import Notification from '../models/notification.js';
import { NotificationService } from '../services/notification.service.js';

export const startNotificationCron = async () => {
  try {
    const now = new Date();
    const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);

    const notifications = await Notification.find({
      scheduledFor: { $gte: twoMinutesAgo, $lte: now },
      deleted: false,
      hasBeenSent: false
    }).lean();

    await Promise.all(
      notifications.map(notification => 
        NotificationService.scheduleNotification(notification._id)
      )
    );
  } catch (err) {
    console.error('❌ Notification cron error:', err);
  }
};

// Run every minute
export const setupNotificationCron = () => {
  setInterval(startNotificationCron, 60 * 1000);
};