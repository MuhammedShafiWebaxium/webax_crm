import cron from 'node-cron';
import { startNotificationCron } from '../helper/notificationHelper.js';

export const registerNotificationCron = () => {
  setTimeout(() => {
    cron.schedule('* * * * *', async () => {
      await startNotificationCron();
    });

  }, 3000); // Delay 3 seconds after server starts
};
