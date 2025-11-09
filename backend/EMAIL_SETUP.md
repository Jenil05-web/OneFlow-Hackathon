# Email Configuration Guide

This guide will help you set up email functionality for OTP (One-Time Password) sending in the OneFlow application.

## Quick Setup for Gmail (Easiest Method)

### Step 1: Enable 2-Step Verification
1. Go to your Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification**
3. Follow the prompts to enable 2-Step Verification

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter "OneFlow" as the name
5. Click **Generate**
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Configure Environment Variables
Create a `.env` file in the `backend` directory with the following:

```env
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-character-app-password
SMTP_FROM="OneFlow" <no-reply@oneflow.com>
```

**Important:** 
- Use your Gmail address for `SMTP_USER`
- Use the 16-character app password (remove spaces) for `SMTP_PASS`
- Do NOT use your regular Gmail password

## Alternative Email Services

### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### SendGrid (Recommended for Production)
1. Sign up at https://sendgrid.com
2. Create an API key
3. Configure:
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

## Testing Email Configuration

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Test the forgot password flow:
   - Go to `/forgot-password` in your frontend
   - Enter a registered email address
   - Check your email inbox for the OTP code

3. Check server logs:
   - You should see: `📧 Email sent to [email]: [messageId]`
   - If you see errors, check your SMTP credentials

## Troubleshooting

### "Email sending failed" Error
- Verify your SMTP credentials are correct
- For Gmail: Make sure you're using an App Password, not your regular password
- Check that 2-Step Verification is enabled for Gmail
- Verify the email address in `SMTP_USER` is correct

### Emails Going to Spam
- Check your spam/junk folder
- For production, use a professional email service like SendGrid
- Configure SPF and DKIM records for your domain

### Connection Timeout
- Check your firewall settings
- Verify SMTP_PORT is correct (587 for TLS, 465 for SSL)
- Try using `secure: true` for port 465

## Security Notes

- Never commit your `.env` file to version control
- Use App Passwords instead of regular passwords
- For production, use a dedicated email service (SendGrid, Mailgun, etc.)
- Rotate your email credentials regularly

