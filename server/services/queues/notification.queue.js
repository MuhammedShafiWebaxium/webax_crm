import { Queue } from 'bullmq';
import { redisConnection } from '../../config/redis.config.js';

export const notificationQueue = new Queue('notification-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 100,
    removeOnFail: 500
  }
});

// Utility function to add notifications to queue
export const enqueueNotification = async (notificationId, priority = 3) => {
  await notificationQueue.add(
    'process-notification',
    { notificationId },
    { 
      jobId: `notification-${notificationId}`,
      priority 
    }
  );
};