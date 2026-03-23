const nodemailer = require('nodemailer');
const { smtp, emailFrom } = require('../config/config');

const transporter = nodemailer.createTransport({
  host: smtp.host,
  port: smtp.port,
  secure: smtp.secure,
  auth: smtp.auth
});

async function sendEmail({ to, subject, html }) {
  if (!smtp.host || smtp.host === 'smtp.example.com') {
    // In development with placeholder config, just log instead of sending.
    // eslint-disable-next-line no-console
    console.log('Mock email:', { to, subject });
    return;
  }

  await transporter.sendMail({
    from: emailFrom,
    to,
    subject,
    html
  });
}

module.exports = { sendEmail };

