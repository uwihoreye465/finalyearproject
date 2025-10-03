# Gmail Email Setup Guide for FindSinners System

This guide will help you set up Gmail SMTP for sending real verification emails.

## 🔧 **Step 1: Enable 2-Factor Authentication**

1. Go to your Google Account settings: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "Signing in to Google", click "2-Step Verification"
4. Follow the prompts to enable 2-factor authentication

## 🔑 **Step 2: Generate App Password**

1. In your Google Account settings, go to "Security"
2. Under "Signing in to Google", click "App passwords"
3. Select "Mail" as the app type
4. Select "Other (Custom name)" as the device
5. Enter "FindSinners System" as the name
6. Click "Generate"
7. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

## ⚙️ **Step 3: Configure Environment Variables**

Create a `.env` file in your project root with the following variables:

```env
# Database Configuration
DATABASE_URL=your-supabase-database-url

# Server Configuration
PORT=6000
NODE_ENV=development
FRONTEND_URL=http://localhost:6000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-super-secret-refresh-key-here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Email Configuration (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=uwihoreyefrancois12@gmail.com
EMAIL_PASS=your-16-character-app-password-here

# Session Configuration
SESSION_SECRET=your-session-secret-key-here
```

## 🧪 **Step 4: Test Email Configuration**

Run the server and check the console output. You should see:

```
✅ Gmail SMTP connection verified successfully
```

If you see an error, double-check:
- ✅ 2-factor authentication is enabled
- ✅ App password is correctly copied (16 characters, no spaces)
- ✅ EMAIL_PASS is set in your .env file
- ✅ EMAIL_USER is set to your Gmail address

## 📧 **Step 5: Test Email Verification**

1. Register a new user through the API
2. Check your email inbox for the verification email
3. Click the verification link to verify the email
4. Try logging in with the verified account

## 🔄 **Step 6: Test Resend Verification**

If you need to resend a verification email:

```bash
curl -X POST http://localhost:6000/api/v1/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

## 🚨 **Troubleshooting**

### Common Issues:

1. **"Invalid login" error**
   - Make sure you're using the App Password, not your regular Gmail password
   - Ensure 2-factor authentication is enabled

2. **"Connection timeout" error**
   - Check your internet connection
   - Verify EMAIL_HOST and EMAIL_PORT are correct

3. **"Authentication failed" error**
   - Double-check the App Password (16 characters)
   - Make sure there are no extra spaces in the password

4. **Emails not being received**
   - Check spam/junk folder
   - Verify the email address is correct
   - Check Gmail's "Less secure app access" settings

## 📱 **Email Templates**

The system now includes beautiful HTML email templates with:
- Professional branding
- Clear call-to-action buttons
- Mobile-responsive design
- Security warnings and expiration notices

## 🔒 **Security Notes**

- Never commit your `.env` file to version control
- Use strong, unique passwords for all accounts
- Regularly rotate your App Passwords
- Monitor your Gmail account for suspicious activity

## 📞 **Support**

If you encounter issues:
1. Check the server console for error messages
2. Verify all environment variables are set correctly
3. Test with a simple email first before using in production
4. Check Gmail's security settings and recent activity

---

**Happy coding! 🚀**
