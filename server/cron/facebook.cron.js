import { scheduleFacebookLeadSync } from '../services/queues/facebook.queue.js';

export const initializeFacebookSync = async () => {
  try {
    await scheduleFacebookLeadSync({
      pageId: process.env.FB_PAGE_ID,
      accessToken: process.env.FB_ACCESS_TOKEN,
      interval: 5 * 60 * 1000 // 5 minutes
    });
    console.log('⏱ Facebook leads sync scheduled');
  } catch (err) {
    console.error('Failed to schedule Facebook sync:', err);
    throw err;
  }
};