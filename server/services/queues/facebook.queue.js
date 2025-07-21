import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.config.js';

export const facebookQueue = new Queue('facebook-leads-queue', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
    removeOnComplete: 1000, // Keep last 1000 completed jobs
    removeOnFail: 5000      // Keep last 5000 failed jobs
  }
});

// Utility to schedule lead sync
export const scheduleFacebookLeadSync = async (options = {}) => {
  await facebookQueue.add(
    'sync-facebook-leads',
    { 
      pageId: options.pageId,
      accessToken: options.accessToken 
    },
    {
      jobId: `facebook-leads-${options.pageId || 'default'}`,
      repeat: { 
        every: options.interval || 5 * 60 * 1000 // Default 5 minutes
      },
      priority: 2
    }
  );
};