# 🚀 RENDER EMAIL FIX - Step by Step

## 🎯 **PROBLEM:**
- ✅ Localhost: Registration + Email verification works
- ❌ Production: Registration works, NO verification emails sent

## 🔧 **SOLUTION: Add Environment Variables to Render**

### **Step 1: Go to Render Dashboard**
1. Open: https://dashboard.render.com
2. Click on your service: `tracking-criminal`
3. Click on "Environment" tab

### **Step 2: Add These Environment Variables**

Add these EXACT environment variables to your Render service:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=uwihoreyefrancois12@gmail.com
EMAIL_PASS=ngjv fqel gbjo rdmt
FRONTEND_URL=https://tracking-criminal.onrender.com
NODE_ENV=production
PORT=3000
TRUST_PROXY=true
```

### **Step 3: Save and Restart**
1. Click "Save Changes"
2. Wait for the service to restart (2-3 minutes)

### **Step 4: Test Email Verification**

After restart, test with this command:

```bash
curl -X POST https://tracking-criminal.onrender.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Test User",
    "email": "your-real-email@gmail.com",
    "password": "Test123!",
    "sector": "Kigali",
    "position": "Officer",
    "role": "staff"
  }'
```

**Expected Result:**
- ✅ User registered successfully
- ✅ Verification email sent to your inbox
- ✅ Email from: uwihoreyefrancois12@gmail.com
- ✅ Subject: "USER VERIFICATION - Email Verification Required"

## 🔍 **Why This Happens:**

### **Localhost (Working):**
- Has `.env` file with email configuration
- SMTP connection successful
- Emails sent successfully

### **Production (Not Working):**
- Missing environment variables
- SMTP connection fails
- No emails sent

## 📧 **Email Configuration Details:**

Your email service needs these variables:
- `EMAIL_HOST=smtp.gmail.com`
- `EMAIL_PORT=587`
- `EMAIL_USER=uwihoreyefrancois12@gmail.com`
- `EMAIL_PASS=ngjv fqel gbjo rdmt` (Gmail App Password)
- `FRONTEND_URL=https://tracking-criminal.onrender.com` (for verification links)

## 🧪 **Test After Fix:**

1. **Register a user** with your real email
2. **Check your email inbox**
3. **Look for verification email**
4. **Click the verification link**
5. **Try to login** - should work after verification

## 🚨 **If Still Not Working:**

1. **Check Render Logs:**
   - Go to Render Dashboard
   - Click "Logs" tab
   - Look for SMTP errors

2. **Verify Gmail App Password:**
   - Go to Google Account Settings
   - Security → App Passwords
   - Make sure password is: `ngjv fqel gbjo rdmt`

3. **Check Environment Variables:**
   - Make sure all variables are set correctly
   - No extra spaces or quotes

## 🎯 **Quick Action:**

**Go to Render Dashboard NOW and add those environment variables!**

This will fix your email verification issue immediately. 🚀
