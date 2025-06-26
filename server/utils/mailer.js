import '../config/index.js';
import nodemailer from 'nodemailer';

const mailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

export const sentSupportMail = async (emails, from, companyName, message) => {
  try {
    const mailDetails = {
      from: '"Webaxium" <' + process.env.GMAIL_USER + '>',
      to: emails,
      subject: `Webax CRM Support Request`,
      html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2 style="color: #007BFF;">${companyName} Support Ticket</h2>
            <p>Dear IT Team,</p>
            <p>We need your assistance with the following issue:</p>
            <p><strong>Topic:</strong> ${message}</p>
            <p>Kindly look into this matter at the earliest and let us know if further information is required.</p>
            <p>Thank you for your support!</p>
            <p>Best Regards,</p>
            <p>${from}</p>
          </div>
        `,
    };

    mailTransporter.sendMail(mailDetails, (err, data) => {
      if (err) {
        console.log(err);
        return err;
      } else {
        console.log('Mail sent successfully.');
        return true;
      }
    });
  } catch (err) {
    console.log(err);
    return err;
  }
};
