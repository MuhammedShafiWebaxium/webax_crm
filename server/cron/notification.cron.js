import cron from 'node-cron';
import { startNotificationCron } from '../helper/notificationHelper.js';

export const registerNotificationCron = () => {
  cron.schedule('* * * * *', async () => {
    await startNotificationCron();
  });
};
