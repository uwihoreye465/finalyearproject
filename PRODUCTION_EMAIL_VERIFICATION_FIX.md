# 📧 Production Email Verification Fix

## 🎯 **Problem Identified:**
- ✅ **Localhost:** Email verification working (`http://localhost:6000`)
- ❌ **Production:** Email verification NOT working (`https://tracking-criminal.onrender.com`)
- **Issue:** Users can register but don't receive verification emails

## 🔍 **Root Causes:**

### **1. Environment Variables Missing on Render**
Production server doesn't have the required email environment variables.

### **2. SMTP Configuration Issues**
Gmail SMTP settings might not be properly configured for production.

### **3. Email Service Not Initialized**
Email service might be failing to connect on production.

## 🔧 **Solution: Fix Production Email Configuration**

### **Step 1: Set Environment Variables on Render**

Go to your Render dashboard and add these environment variables:

```env
# Email Configuration (CRITICAL)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=uwihoreyefrancois12@gmail.com
EMAIL_PASS=ngjv fqel gbjo rdmt

# Frontend URL (for verification links)
FRONTEND_URL=https://tracking-criminal.onrender.com

# Server Configuration
NODE_ENV=production
PORT=3000

# Database Configuration
DB_HOST=aws-0-eu-west-2.pooler.supabase.com
DB_PORT=6543
DB_NAME=postgres
DB_USER=postgres.ngjvfqelgbjordmt
DB_PASSWORD=Francois123!@#
DB_SSL=true

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_jwt_refresh_secret_key_here
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Trust Proxy (Important for Render)
TRUST_PROXY=true
```

### **Step 2: Verify Gmail App Password**

Make sure your Gmail App Password is correct:
1. **Go to Google Account Settings**
2. **Security → App Passwords**
3. **Verify the password:** `ngjv fqel gbjo rdmt`
4. **If incorrect, generate a new one**

### **Step 3: Test Email Service on Production**

I'll create a test script to verify email configuration:

```javascript
// Test production email service
const testEmail = async () => {
  try {
    const response = await fetch('https://tracking-criminal.onrender.com/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullname: 'Test User',
        email: 'test@example.com',
        password: 'Test123!',
        sector: 'Kigali',
        position: 'Officer',
        role: 'staff'
      })
    });
    
    const result = await response.json();
    console.log('Registration result:', result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### **Step 4: Check Render Logs**

1. **Go to Render Dashboard**
2. **Click on your service**
3. **Go to "Logs" tab**
4. **Look for SMTP connection errors**
5. **Check for email sending errors**

## 🧪 **Testing Steps:**

### **Test 1: Register New User**
```bash
curl -X POST https://tracking-criminal.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test User",
    "email": "test@example.com",
    "password": "Test123!",
    "sector": "Kigali",
    "position": "Officer",
    "role": "staff"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User registered successfully. Please check your email for verification.",
  "data": {
    "userId": 123,
    "email": "test@example.com",
    "requiresVerification": true
  }
}
```

### **Test 2: Check Email Inbox**
- Check the email inbox for `test@example.com`
- Look for verification email from `uwihoreyefrancois12@gmail.com`
- Subject should be: "USER VERIFICATION - Email Verification Required"

### **Test 3: Verify Email**
Click the verification link in the email to complete verification.

## 🔍 **Common Issues & Fixes:**

### **Issue 1: "SMTP connection failed"**
**Fix:** Check EMAIL_PASS environment variable

### **Issue 2: "Email not sent"**
**Fix:** Verify Gmail App Password is correct

### **Issue 3: "Invalid credentials"**
**Fix:** Regenerate Gmail App Password

### **Issue 4: "Rate limit exceeded"**
**Fix:** Wait a few minutes and try again

## 📊 **Debugging Steps:**

### **1. Check Environment Variables**
```bash
# In Render dashboard, verify these are set:
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=uwihoreyefrancois12@gmail.com
EMAIL_PASS=ngjv fqel gbjo rdmt
FRONTEND_URL=https://tracking-criminal.onrender.com
```

### **2. Check Server Logs**
Look for these messages in Render logs:
- ✅ `Gmail SMTP connection verified successfully`
- ❌ `Gmail SMTP connection failed`
- ✅ `Sending verification email...`
- ❌ `Email sending failed`

### **3. Test SMTP Connection**
The server should log SMTP connection status on startup.

## 🚀 **Quick Fix Commands:**

### **1. Update Environment Variables in Render:**
1. Go to Render Dashboard
2. Click your service
3. Go to "Environment" tab
4. Add all the environment variables above
5. Click "Save Changes"
6. Restart the service

### **2. Force Redeploy:**
1. Go to Render Dashboard
2. Click "Manual Deploy"
3. Select "Deploy latest commit"
4. Wait for deployment

### **3. Test After Fix:**
```bash
# Test registration
curl -X POST https://tracking-criminal.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"fullname":"Test","email":"test@example.com","password":"Test123!","sector":"Kigali","position":"Officer","role":"staff"}'
```

## 🎯 **Expected Results After Fix:**

1. **Registration:** ✅ User registered successfully
2. **Email Sent:** ✅ Verification email sent to user
3. **Email Received:** ✅ User receives email in inbox
4. **Verification:** ✅ User can click link to verify
5. **Login:** ✅ User can login after verification

## 📞 **Next Steps:**

1. **Set environment variables** in Render dashboard
2. **Redeploy** the service
3. **Test registration** with a real email
4. **Check email inbox** for verification email
5. **Test verification** process

**The main issue is missing environment variables on Render. Once you set them, email verification will work perfectly!** 🚀
