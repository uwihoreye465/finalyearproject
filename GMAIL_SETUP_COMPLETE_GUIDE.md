# Gmail Email Verification Setup Guide

This guide will help you configure Gmail SMTP for sending real verification emails to users when they sign up.

## 🔧 **Step 1: Enable Gmail 2-Factor Authentication**

1. **Go to your Google Account**: https://myaccount.google.com/
2. **Click "Security"** in the left sidebar
3. **Under "Signing in to Google", click "2-Step Verification"**
4. **Follow the prompts to enable 2-factor authentication**
   - You'll need to verify your phone number
   - Choose your preferred verification method

## 🔑 **Step 2: Generate Gmail App Password**

1. **In your Google Account settings, go to "Security"**
2. **Under "Signing in to Google", click "App passwords"**
3. **Select "Mail" as the app**
4. **Select "Other (Custom name)" as the device**
5. **Enter "FindSinners System" as the name**
6. **Click "Generate"**
7. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

## ⚙️ **Step 3: Create .env File**

Create a `.env` file in your project root with the following content:

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

**Important**: Replace `your-16-character-app-password-here` with the actual App Password from Step 2.

## 🧪 **Step 4: Test Email Configuration**

Run this command to test your Gmail configuration:

```bash
node debug_email.js
```

You should see:
```
✅ SMTP connection successful!
✅ Test email sent successfully!
```

## 🚀 **Step 5: Start Your Server**

```bash
npm start
```

You should see:
```
✅ Gmail SMTP connection verified successfully
✅ Connected to Supabase PostgreSQL database
✅ Database connection successful
🚀 FindSinnerSystem API server running on port 6000
```

## 📧 **Step 6: Test Email Verification Flow**

### **Register a New User**
```bash
curl -X POST http://localhost:6000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "sector": "Kigali",
    "fullname": "Test User",
    "position": "Police Officer",
    "email": "uwihoreyefrancois12@gmail.com",
    "password": "TestPassword123!",
    "role": "staff"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email to verify your account.",
  "data": {
    "user": {
      "id": 1,
      "email": "uwihoreyefrancois12@gmail.com",
      "fullname": "Test User",
      "role": "staff"
    }
  }
}
```

### **Check Your Email**
You should receive a beautiful verification email with:
- Professional design
- Clear verification button
- Verification link
- 24-hour expiration notice

### **Verify Email**
Click the verification button in the email or use the API:
```bash
curl -X GET http://localhost:6000/api/v1/auth/verify-email/YOUR_TOKEN_FROM_EMAIL
```

### **Login (Only Works After Verification)**
```bash
curl -X POST http://localhost:6000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "uwihoreyefrancois12@gmail.com",
    "password": "TestPassword123!"
  }'
```

## 🔄 **Step 7: Test Resend Verification**

If you need to resend the verification email:

```bash
curl -X POST http://localhost:6000/api/v1/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "uwihoreyefrancois12@gmail.com"
  }'
```

## 🎯 **Email Verification Flow**

1. **User registers** → Account created with `is_verified = false`
2. **Verification email sent** → User receives email with verification link
3. **User clicks link** → Account verified (`is_verified = true`)
4. **User can now login** → Login only works for verified users

## 🚨 **Troubleshooting**

### **Common Issues:**

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
   - Check Gmail's security settings

### **Debug Commands:**

```bash
# Test email configuration
node debug_email.js

# Check environment variables
node -e "console.log(process.env.EMAIL_USER, process.env.EMAIL_PASS ? 'SET' : 'NOT SET')"

# Test SMTP connection
node -e "
const nodemailer = require('nodemailer');
const transporter = nodemailer.createTransporter({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
transporter.verify().then(() => console.log('✅ Connected')).catch(err => console.log('❌ Failed:', err.message));
"
```

## 📱 **Email Template Features**

Your verification emails include:
- ✅ Professional branding
- ✅ Mobile-responsive design
- ✅ Clear call-to-action buttons
- ✅ Security warnings
- ✅ 24-hour expiration notice
- ✅ Fallback text link

## 🔒 **Security Features**

- ✅ 24-hour token expiration
- ✅ Unique tokens for each verification
- ✅ Proper email validation
- ✅ Rate limiting protection
- ✅ Secure token generation

## 🎉 **Success Indicators**

You'll know it's working when:
1. ✅ Server starts without email errors
2. ✅ Registration sends verification email
3. ✅ You receive beautiful HTML emails
4. ✅ Login only works after verification
5. ✅ Resend verification works

---

**Your email verification system is now ready! 🚀**
