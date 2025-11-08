// backend/utils/emailService.js
import nodemailer from "nodemailer";

/**
 * Send Email using NodeMailer
 * Supports HTML and plain text
 */
export const sendEmail = async ({ to, subject, html, text }) => {
  try {
    // Create transport (use your .env SMTP credentials)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.SMTP_FROM || '"OneFlow" <no-reply@oneflow.com>',
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    return false;
  }
};
