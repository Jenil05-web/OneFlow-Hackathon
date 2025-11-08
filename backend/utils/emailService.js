const nodemailer = require('nodemailer');

// Create reusable transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, otp, purpose = 'verification') => {
  const subject =
    purpose === 'verification'
      ? 'Verify Your Email - OTP Code'
      : 'Reset Your Password - OTP Code';

  const message =
    purpose === 'verification'
      ? `Your OTP for email verification is: <strong>${otp}</strong>. This code will expire in 10 minutes.`
      : `Your OTP for password reset is: <strong>${otp}</strong>. This code will expire in 10 minutes.`;

  const mailOptions = {
    from: `"Hackathon Auth" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Hello!</h2>
        <p style="font-size: 16px; color: #555;">${message}</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0;">
          <h1 style="color: #4F46E5; margin: 0;">${otp}</h1>
        </div>
        <p style="font-size: 14px; color: #777;">If you didn't request this, please ignore this email.</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p style="font-size: 12px; color: #999;">This is an automated message, please do not reply.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
    return false;
  }
};

module.exports = { generateOTP, sendOTPEmail };