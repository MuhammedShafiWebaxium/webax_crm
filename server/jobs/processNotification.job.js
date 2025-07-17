import { NotificationService } from '../services/notification.service.js';

export const processNotificationJob = async (job) => {
  const { notificationId } = job.data;
  await NotificationService.processNotification(notificationId);
};