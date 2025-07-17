import { Worker } from 'bullmq';
import { redisConnection } from '../../config/redis.config.js';
import { processNotificationJob } from '../../jobs/processNotification.job.js';

export const startNotificationWorker = () => {
  const worker = new Worker(
    'notification-queue',
    processNotificationJob,
    {
      connection: redisConnection,
      concurrency: 10,
      limiter: {
        max: 100,
        duration: 1000
      }
    }
  );

  worker.on('completed', (job) => {
    // console.log(`✅ Processed notification ${job.data.notificationId}`);
  });

  worker.on('failed', (job, err) => {
    console.error(`❌ Failed notification ${job?.data?.notificationId}:`, err.message);
  });

  worker.on('error', (err) => {
    console.error('🚨 Worker error:', err);
  });

  return worker;
};