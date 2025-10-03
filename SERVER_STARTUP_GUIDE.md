# 🚀 SERVER STARTUP GUIDE

## ✅ **Current Status: SERVER IS RUNNING!**

Your FindSinnerSystem API server is now running successfully on port 6000.

---

## 🔧 **How to Start/Stop the Server:**

### **Start Server:**
```bash
cd C:\Users\uwiho\Desktop\BACKENDFRONTEND\findsinnerssystem
npm start
```

### **Alternative Start:**
```bash
cd C:\Users\uwiho\Desktop\BACKENDFRONTEND\findsinnerssystem
node server.js
```

### **Stop Server:**
```bash
# Find the process ID
netstat -ano | findstr :6000

# Kill the process (replace PID with actual number)
taskkill /PID [PID] /F
```

---

## 🧪 **Verify Server is Working:**

### **Health Check:**
```bash
curl http://localhost:6000/api/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "FindSinnerSystem API is running",
  "timestamp": "2025-10-02T07:50:10.967Z"
}
```

### **Test Image Upload:**
```bash
cd C:\Users\uwiho\Desktop\BACKENDFRONTEND\findsinnerssystem
node test_image_upload.js
```

**Expected Response:**
```
✅ Route is working correctly! (401 Unauthorized - needs auth token)
✅ Multipart route is working correctly! (401 Unauthorized - needs auth token)
```

---

## 🚨 **Common Issues & Solutions:**

### **Issue: EADDRINUSE (Port already in use)**
**Error:** `Error: listen EADDRINUSE: address already in use :::6000`

**Solution:**
1. Find the process using port 6000:
   ```bash
   netstat -ano | findstr :6000
   ```

2. Kill the process:
   ```bash
   taskkill /PID [PID] /F
   ```

3. Start the server again:
   ```bash
   npm start
   ```

### **Issue: Database Connection Failed**
**Error:** `❌ DATABASE_URL environment variable is not set!`

**Solution:**
1. Check if `.env` file exists
2. Verify `DATABASE_URL` is set correctly
3. Restart the server

### **Issue: Module Not Found**
**Error:** `Cannot find module 'C:\Users\uwiho\Desktop\BACKENDFRONTEND\server.js'`

**Solution:**
Make sure you're in the correct directory:
```bash
cd C:\Users\uwiho\Desktop\BACKENDFRONTEND\findsinnerssystem
npm start
```

---

## 📋 **Server Information:**

- **Port:** 6000
- **Environment:** development
- **Database:** Supabase PostgreSQL
- **Health Check:** http://localhost:6000/api/health
- **API Base URL:** http://localhost:6000/api/v1

---

## 🎯 **Next Steps:**

1. **✅ Server is running** - You're all set!
2. **Test Flutter app** - Image uploads should now work
3. **Verify image storage** - Check `uploads/arrested/images/` folder
4. **Test with authentication** - Get a valid token for full testing

---

## 🎉 **Success Indicators:**

When everything is working correctly, you should see:
```
✅ Connected to Supabase PostgreSQL database
✅ Database connection successful
🚀 FindSinnerSystem API server running on port 6000
📍 Environment: development
🔗 Health check: http://localhost:6000/api/health
```

**Your server is now ready for image uploads!** 🚀
