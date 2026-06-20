import nodemailer from 'nodemailer';

const createTransporter = () => {
  if (!process.env.EMAIL_USER) return null;
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`[Email Mock] To: ${to}, Subject: ${subject}`);
    return { success: true, mock: true };
  }
  await transporter.sendMail({
    from: `"Smart Parking" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
  return { success: true };
};

export const sendVerificationEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Verify Your Email - Smart Parking',
    html: `<h2>Welcome ${user.name}!</h2><p>Click <a href="${url}">here</a> to verify your email.</p>`,
  });
};

export const sendPasswordResetEmail = async (user, token) => {
  const url = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
  return sendEmail({
    to: user.email,
    subject: 'Password Reset - Smart Parking',
    html: `<h2>Password Reset</h2><p>Click <a href="${url}">here</a> to reset your password.</p>`,
  });
};
