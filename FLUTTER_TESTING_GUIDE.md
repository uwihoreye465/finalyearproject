# Flutter Integration Testing Guide
# FindSinners System - Complete Testing Workflow

This guide will help you test the complete email verification flow between your Flutter frontend and backend API.

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    HTTP/API    ┌─────────────────┐
│   Flutter App   │ ◄─────────────► │   Backend API   │
│   (Port 3000)   │                 │   (Port 6000)   │
└─────────────────┘                 └─────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                 ┌─────────────────┐
│   Email Client  │                 │   Gmail SMTP    │
│   (Gmail App)   │                 │   (Port 587)    │
└─────────────────┘                 └─────────────────┘
```

## 🧪 **Testing Checklist**

### **Backend Setup**
- [ ] Backend server running on port 6000
- [ ] Gmail SMTP configured and working
- [ ] CORS configured for Flutter
- [ ] Database connected and working
- [ ] All API endpoints responding

### **Flutter Setup**
- [ ] Flutter app running
- [ ] API service configured
- [ ] Auth provider implemented
- [ ] All screens created
- [ ] Dependencies installed

## 🚀 **Step-by-Step Testing**

### **Step 1: Start Backend**
```bash
cd findsinnerssystem
npm start
```

**Expected Output:**
```
✅ Gmail SMTP connection verified successfully
✅ Connected to Supabase PostgreSQL database
✅ Database connection successful
🚀 FindSinnerSystem API server running on port 6000
📍 Environment: development
🔗 Health check: http://localhost:6000/api/health
```

### **Step 2: Start Flutter App**
```bash
cd your-flutter-project
flutter run
```

**Expected Output:**
```
Flutter run key commands.
r Hot reload. 🔥🔥🔥
R Hot restart.
h List all available interactive commands.
d Detach (terminate "flutter run" but leave application running).
c Clear the screen
q Quit (terminate theflutter run" but leave application running).
```

### **Step 3: Test Registration Flow**

#### **3.1 Open Flutter App**
- App should show Login screen
- Tap "Don't have an account? Register"

#### **3.2 Fill Registration Form**
```
Sector: Kigali
Full Name: Test User
Position: Police Officer
Email: uwihoreyefrancois12@gmail.com
Password: TestPassword123!
Confirm Password: TestPassword123!
```

#### **3.3 Tap Register Button**
**Expected Results:**
- Loading indicator shows
- Success message appears
- Navigate to Email Verification screen
- Backend console shows:
  ```
  📧 Sending verification email...
  📧 To: uwihoreyefrancois12@gmail.com
  📧 Token: abc123def456...
  📧 URL: http://localhost:6000/api/v1/auth/verify-email/abc123def456...
  ✅ Verification email sent successfully
  ```

### **Step 4: Test Email Verification**

#### **4.1 Check Email**
- Open Gmail app or web browser
- Look for email from "FindSinners System"
- Subject: "🔐 Verify Your Email - FindSinners System"

#### **4.2 Verify Email**
**Option A: Click Email Button**
- Click the "✅ Verify My Email" button in the email
- Should redirect to verification success page

**Option B: Use API Directly**
- Copy the verification token from email URL
- Use Postman or curl:
  ```bash
  curl -X GET http://localhost:6000/api/v1/auth/verify-email/YOUR_TOKEN_HERE
  ```

#### **4.3 Expected Results**
- Email verification successful
- Backend console shows verification success
- User account marked as verified

### **Step 5: Test Login Flow**

#### **5.1 Try Login Before Verification**
- Go back to Flutter app
- Try to login with registered credentials
- **Expected**: Login should fail with "Please verify your email before logging in"

#### **5.2 Login After Verification**
- After email verification, try login again
- **Expected**: Login should succeed
- Navigate to Home screen
- User data should be saved locally

### **Step 6: Test Resend Verification**

#### **6.1 From Verification Screen**
- Tap "Resend Verification Email"
- **Expected**: New verification email sent
- Success message appears

#### **6.2 From API**
```bash
curl -X POST http://localhost:6000/api/v1/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "uwihoreyefrancois12@gmail.com"}'
```

## 🔍 **Debugging Guide**

### **Common Issues and Solutions**

#### **1. CORS Errors**
**Error**: `XMLHttpRequest error`
**Solution**: 
- Check backend CORS configuration
- Ensure Flutter origin is allowed
- Verify backend is running on correct port

#### **2. Network Errors**
**Error**: `Connection refused`
**Solution**:
- Verify backend is running
- Check API base URL in Flutter
- Ensure correct port (6000)

#### **3. Email Not Received**
**Error**: No verification email
**Solution**:
- Check Gmail SMTP configuration
- Verify EMAIL_PASS in .env file
- Check spam folder
- Look for verification token in backend console

#### **4. Login Fails After Verification**
**Error**: Login still fails
**Solution**:
- Verify email was actually verified
- Check database for is_verified status
- Clear app data and try again

### **Debug Commands**

#### **Backend Debug**
```bash
# Check if server is running
curl http://localhost:6000/api/health

# Test email configuration
node debug_email.js

# Check database connection
node -e "const pool = require('./src/config/database'); pool.query('SELECT NOW()').then(r => console.log('DB OK:', r.rows[0])).catch(e => console.log('DB Error:', e.message));"
```

#### **Flutter Debug**
```bash
# Check Flutter logs
flutter logs

# Hot reload
r

# Hot restart
R

# Check device info
flutter devices
```

## 📱 **Flutter-Specific Testing**

### **1. Test on Different Platforms**
- **Android**: `flutter run -d android`
- **iOS**: `flutter run -d ios`
- **Web**: `flutter run -d web-server --web-port 3000`

### **2. Test State Persistence**
- Register and verify email
- Close app completely
- Reopen app
- Should stay logged in

### **3. Test Network Handling**
- Register user
- Turn off internet
- Try to login
- Should show network error
- Turn internet back on
- Should work normally

## 🎯 **API Testing with Postman**

### **Import Collection**
1. Open Postman
2. Import `FindSinners_Email_Verification_Postman.json`
3. Set variables:
   - `verification_token`: Token from email
   - `access_token`: Token from login

### **Test Sequence**
1. **Health Check** → Should return success
2. **Register User** → Should send verification email
3. **Resend Verification** → Should send new email
4. **Login (Before)** → Should fail
5. **Verify Email** → Should succeed
6. **Login (After)** → Should succeed
7. **Get Profile** → Should return user data

## 🔧 **Production Testing**

### **1. Update URLs**
```dart
// In ApiService
static const String baseUrl = 'https://your-backend-domain.com/api/v1';
```

### **2. Test HTTPS**
- Ensure backend uses HTTPS
- Update CORS for production domain
- Test SSL certificates

### **3. Test Performance**
- Load testing with multiple users
- Email delivery time testing
- Database performance under load

## 📊 **Success Metrics**

### **Backend Metrics**
- ✅ Server starts without errors
- ✅ Gmail SMTP connection successful
- ✅ All API endpoints responding
- ✅ CORS configured correctly
- ✅ Database queries working

### **Flutter Metrics**
- ✅ App builds and runs successfully
- ✅ All screens navigate correctly
- ✅ API calls work without errors
- ✅ State management working
- ✅ Local storage functioning

### **Integration Metrics**
- ✅ Registration sends verification email
- ✅ Email verification works
- ✅ Login only works after verification
- ✅ Resend verification works
- ✅ User data persists across app restarts

## 🎉 **Complete Flow Test**

### **End-to-End Test**
1. **Start both backend and Flutter**
2. **Register new user** → Email sent
3. **Check email** → Verification link received
4. **Click verification link** → Account verified
5. **Login in Flutter** → Success
6. **Navigate to home** → User data displayed
7. **Close and reopen app** → Still logged in

### **Expected Results**
- ✅ Smooth user experience
- ✅ No errors in console
- ✅ All features working
- ✅ Email delivered quickly
- ✅ State persisted correctly

## 🚀 **Deployment Checklist**

### **Backend Deployment**
- [ ] Environment variables set
- [ ] Gmail SMTP configured
- [ ] CORS updated for production
- [ ] Database connection working
- [ ] SSL certificate installed

### **Flutter Deployment**
- [ ] API URLs updated
- [ ] App signed for release
- [ ] Tested on target devices
- [ ] Performance optimized
- [ ] Error handling implemented

---

**Your Flutter integration is now ready for testing! 🎯**

Follow this guide step by step to ensure everything works perfectly between your Flutter frontend and backend API.
