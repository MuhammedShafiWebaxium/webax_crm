import { sentSupportMail } from '../utils/mailer.js';

export const sentItTicket = async (req, res, next) => {
  try {
    const {
      user: { companyName, email, role },
      body: { message },
    } = req;

    const trimmedMessage = message?.trim();
    const emails = [
      'shafi.sd@webaxium.com',
      'abhijith.sd@webaxium.com',
      //   'admin@webaxium.com',
    ];
    const from = `${email} (${role?.name})`;

    await sentSupportMail(emails, from, companyName, trimmedMessage);

    res.status(200).json({ status: 'Success' });
  } catch (err) {
    next(err);
  }
};
