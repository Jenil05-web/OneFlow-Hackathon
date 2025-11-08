// backend/utils/emailService.js
import nodemailer from "nodemailer";

/**
 * Generate OTP
 */
const generateOTP = (length = 6) => {
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

/**
 * Create email transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Send Email using NodeMailer
 * Supports HTML and plain text
 */
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

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

/**
 * Generate HTML template for OTP email
 */
const getOTPEmailTemplate = (otp, type = 'verification') => {
  const isReset = type === 'reset';
  const title = isReset ? 'Password Reset' : 'Email Verification';
  const message = isReset 
    ? 'Use this code to reset your password. This code will expire in 10 minutes.'
    : 'Use this code to verify your email address. This code will expire in 10 minutes.';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - OneFlow</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 20px 0; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 700;">OneFlow</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              <tr>
                <td style="padding: 40px 30px; text-align: center;">
                  <h2 style="color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 700;">${title}</h2>
                  <p style="color: #6b7280; margin: 0 0 30px 0; font-size: 16px; line-height: 1.6;">
                    ${message}
                  </p>
                  
                  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 8px; margin: 30px 0;">
                    <div style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                      ${otp}
                    </div>
                  </div>
                  
                  <p style="color: #9ca3af; margin: 30px 0 0 0; font-size: 14px; line-height: 1.5;">
                    If you didn't request this code, please ignore this email or contact support if you have concerns.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 20px; text-align: center; background-color: #f9fafb;">
            <p style="color: #6b7280; margin: 0; font-size: 12px;">
              © ${new Date().getFullYear()} OneFlow. All rights reserved.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};

/**
 * Send OTP Email
 * @param {string} email - Recipient email
 * @param {string} otp - OTP code
 * @param {string} type - 'verification' or 'reset'
 */
const sendOTPEmail = async (email, otp, type = 'verification') => {
  const isReset = type === 'reset';
  const subject = isReset 
    ? 'OneFlow - Password Reset Code' 
    : 'OneFlow - Email Verification Code';
  
  const html = getOTPEmailTemplate(otp, type);
  const text = isReset
    ? `Your password reset code is: ${otp}. This code will expire in 10 minutes.`
    : `Your email verification code is: ${otp}. This code will expire in 10 minutes.`;

  return await sendEmail({
    to: email,
    subject,
    html,
    text,
  });
};

export { generateOTP, sendEmail, sendOTPEmail };
