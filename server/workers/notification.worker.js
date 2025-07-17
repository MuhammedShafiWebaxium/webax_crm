import { Worker } from 'bullmq';
import { redisConnection } from '../config/redis.config.js';
import { processNotificationJob } from '../jobs/processNotification.job.js';

export const notificationWorker = new Worker(
  'notifications',
  processNotificationJob,
  {
    connection: redisConnection,
    concurrency: 20, // Increased from 10
    limiter: {
      max: 100, // 100 jobs/second
      duration: 1000,
    },
    settings: {
      lockDuration: 30000, // 30s job lock
      stalledInterval: 5000, // Check stalled jobs every 5s
    },
  }
);
