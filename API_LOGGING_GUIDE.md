# API Console Logging Guide
# FindSinners System - Email Verification Logging

This guide explains the comprehensive console logging I've added to track API calls and email sending.

## 🔍 **What You'll See in Console**

### **1. Registration API Logging**

When you call `POST /api/v1/auth/register`, you'll see:

```
🚀 ===== REGISTRATION API CALLED =====
📅 Timestamp: 2024-01-15T10:30:45.123Z
🌐 IP Address: ::1
📱 User Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
📋 Request Body: {
  sector: 'Kigali',
  fullname: 'Test User',
  position: 'Police Officer',
  email: 'uwihoreyefrancois12@gmail.com',
  role: 'staff',
  password: '[HIDDEN]'
}
🔍 Checking if user already exists...
✅ Email is available for registration
🔐 Hashing password...
✅ Password hashed successfully
🎫 Generating verification token...
✅ Verification token generated: abc123def4...
💾 Inserting user into database...
✅ User inserted successfully with ID: 1
✅ Database transaction committed
📧 Attempting to send verification email...
✅ Verification email sent successfully
📧 Email sent to: uwihoreyefrancois12@gmail.com
✅ Registration API response sent successfully
📊 Response Status: 201
📊 Response Data: {
  success: true,
  message: 'User registered successfully. Please check your email to verify your account.',
  userId: 1,
  email: 'uwihoreyefrancois12@gmail.com'
}
🏁 ===== REGISTRATION API COMPLETED =====
```

### **2. Login API Logging**

When you call `POST /api/v1/auth/login`, you'll see:

```
🔐 ===== LOGIN API CALLED =====
📅 Timestamp: 2024-01-15T10:35:20.456Z
🌐 IP Address: ::1
📱 User Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
📋 Request Body: {
  email: 'uwihoreyefrancois12@gmail.com',
  password: '[HIDDEN]'
}
🔍 Looking for user with email: uwihoreyefrancois12@gmail.com
✅ User found with ID: 1
🔍 Checking email verification status...
📧 User verification status: false
❌ User email not verified
```

**OR** (after verification):

```
🔍 Checking email verification status...
📧 User verification status: true
✅ User email is verified
🔍 Checking user approval status...
👤 User role: staff
✅ User approval status: true
✅ User approval check passed
🔐 Verifying password...
✅ Password verified successfully
🎫 Generating JWT tokens...
✅ JWT tokens generated successfully
📅 Updating last login timestamp...
✅ Last login timestamp updated
✅ Login API response sent successfully
📊 Response Status: 200
📊 Response Data: {
  success: true,
  message: 'Login successful',
  userId: 1,
  email: 'uwihoreyefrancois12@gmail.com',
  role: 'staff'
}
🏁 ===== LOGIN API COMPLETED =====
```

### **3. Email Verification API Logging**

When you call `GET /api/v1/auth/verify-email/:token`, you'll see:

```
✅ ===== EMAIL VERIFICATION API CALLED =====
📅 Timestamp: 2024-01-15T10:40:15.789Z
🌐 IP Address: ::1
📱 User Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
🎫 Verification Token: abc123def456...
🔍 Looking for user with verification token...
✅ Email verification successful
👤 User verified: {
  userId: 1,
  email: 'uwihoreyefrancois12@gmail.com',
  fullname: 'Test User'
}
✅ Email verification API response sent successfully
📊 Response Status: 200
🏁 ===== EMAIL VERIFICATION API COMPLETED =====
```

### **4. Resend Verification API Logging**

When you call `POST /api/v1/auth/resend-verification`, you'll see:

```
🔄 ===== RESEND VERIFICATION API CALLED =====
📅 Timestamp: 2024-01-15T10:45:30.012Z
🌐 IP Address: ::1
📱 User Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36
📧 Request Email: uwihoreyefrancois12@gmail.com
🔍 Looking for user with email: uwihoreyefrancois12@gmail.com
✅ User found with ID: 1
✅ User email not verified, proceeding with resend
🎫 Generating new verification token...
✅ New verification token generated: def456ghi7...
💾 Updating user with new verification token...
✅ User updated with new verification token
📧 Attempting to send resend verification email...
✅ Resend verification email sent successfully
📧 Email sent to: uwihoreyefrancois12@gmail.com
✅ Resend verification API response sent successfully
📊 Response Status: 200
🏁 ===== RESEND VERIFICATION API COMPLETED =====
```

## 🧪 **Testing the Logging**

### **1. Start Your Server**
```bash
npm start
```

### **2. Run the Test Script**
```bash
node test_api_logging.js
```

### **3. Watch the Console**
You'll see detailed logs for each API call, including:
- ✅ Request details (IP, User Agent, Body)
- ✅ Database operations
- ✅ Email sending attempts
- ✅ Response status and data
- ✅ Error details (if any)

## 📧 **Email Sending Logs**

### **Successful Email Sending**
```
📧 Sending verification email...
📧 To: uwihoreyefrancois12@gmail.com
📧 Token: abc123def456...
📧 URL: http://localhost:6000/api/v1/auth/verify-email/abc123def456...
✅ Verification email sent successfully: <message-id>
📧 Email sent to: uwihoreyefrancois12@gmail.com
```

### **Failed Email Sending**
```
📧 Sending verification email...
📧 To: uwihoreyefrancois12@gmail.com
📧 Token: abc123def456...
📧 URL: http://localhost:6000/api/v1/auth/verify-email/abc123def456...
❌ Error sending verification email: Invalid login: 535 5.7.8 Authentication failed
❌ Full error: Error: Invalid login: 535 5.7.8 Authentication failed

=== VERIFICATION TOKEN FOR TESTING ===
📧 Email: uwihoreyefrancois12@gmail.com
🎫 Verification Token: abc123def456...
🔗 Verification URL: http://localhost:6000/api/v1/auth/verify-email/abc123def456...
=====================================
```

## 🔍 **What Each Log Means**

### **🚀 API Call Logs**
- **Timestamp**: When the API was called
- **IP Address**: Where the request came from
- **User Agent**: What client made the request
- **Request Body**: What data was sent (password hidden)

### **🔍 Database Logs**
- **Checking if user exists**: Validates email availability
- **Password hashing**: Secures the password
- **Token generation**: Creates verification token
- **Database insertion**: Saves user data
- **Transaction commit**: Confirms database changes

### **📧 Email Logs**
- **Email sending attempt**: Shows email service call
- **Email sent successfully**: Confirms email delivery
- **Email sending failed**: Shows error details
- **Verification token**: Logs token for testing

### **📊 Response Logs**
- **Response Status**: HTTP status code
- **Response Data**: What was sent back to client
- **API Completion**: Confirms successful processing

## 🎯 **Benefits of This Logging**

1. **🔍 Debugging**: Easy to see what's happening at each step
2. **📧 Email Tracking**: Know if emails are being sent
3. **🐛 Error Detection**: Quickly identify where problems occur
4. **📊 Performance**: Monitor API response times
5. **🔒 Security**: Track login attempts and verification status
6. **📱 Client Tracking**: See what clients are making requests

## 🚨 **Common Issues You'll See**

### **1. Email Authentication Failed**
```
❌ Gmail SMTP connection failed: Invalid login: 535 5.7.8 Authentication failed
```
**Solution**: Check your Gmail App Password in .env file

### **2. User Already Exists**
```
❌ User already exists with email: uwihoreyefrancois12@gmail.com
```
**Solution**: Use a different email or verify the existing one

### **3. Email Not Verified**
```
❌ User email not verified
```
**Solution**: Check email and click verification link

### **4. Invalid Token**
```
❌ Invalid or expired verification token
```
**Solution**: Use a fresh token from a new email

## 📋 **Testing Checklist**

- [ ] **Server starts** with Gmail SMTP connection
- [ ] **Registration API** logs all steps
- [ ] **Email sending** shows success/failure
- [ ] **Login API** shows verification check
- [ ] **Verification API** logs token validation
- [ ] **Resend API** shows new token generation
- [ ] **All responses** include status and data

## 🎉 **Success Indicators**

You'll know everything is working when you see:
- ✅ **Gmail SMTP connection verified successfully**
- ✅ **Verification email sent successfully**
- ✅ **User email is verified**
- ✅ **Login successful**
- ✅ **All API responses sent successfully**

The comprehensive logging will help you track every step of the email verification process! 🚀
