# 🚀 Port 6000 Configuration Complete

## ✅ **Changes Made:**

### **1. Server Configuration**
- **Updated `server.js`:** Default port changed from 3000 to 6000
- **Updated `app.js`:** Added port 6000 to CORS allowed origins
- **Created `start_port_6000.bat`:** Script to start server on port 6000 with all environment variables

### **2. Environment Variables Set**
```bash
PORT=6000
NODE_ENV=development
FRONTEND_URL=http://localhost:6000
CORS_ORIGIN=http://localhost:6000
```

### **3. CORS Configuration Updated**
Added to allowed origins:
- `http://localhost:6000`
- `http://127.0.0.1:6000`

### **4. Documentation Updated**
- **POSTMAN_TESTING_GUIDE.md:** All URLs changed to port 6000
- **FETCH_APIS_GUIDE.md:** All URLs changed to port 6000

## 🎯 **Current Server Status:**
✅ **Server running on port 6000** (PID: 1800)
✅ **Health check working:** `http://localhost:6000/api/health`
✅ **CORS configured for port 6000**

## 📡 **Updated API Endpoints:**

### **Image Upload (POST)**
```
POST http://localhost:6000/api/v1/arrested/
```

### **Get All Records (GET)**
```
GET http://localhost:6000/api/v1/arrested/
```

### **Get Specific Record (GET)**
```
GET http://localhost:6000/api/v1/arrested/68
```

### **Get Statistics (GET)**
```
GET http://localhost:6000/api/v1/arrested/statistics
```

### **Download Image (GET)**
```
GET http://localhost:6000/api/v1/arrested/68/download/image
```

## 🧪 **Testing in Postman:**

1. **Change all URLs** from `http://localhost:3000` to `http://localhost:6000`
2. **Test image upload** with the new port
3. **Test fetch APIs** with the new port

## 🚀 **How to Start Server on Port 6000:**

### **Option 1: Use the batch file**
```bash
start_port_6000.bat
```

### **Option 2: Manual start**
```bash
set PORT=6000
node server.js
```

### **Option 3: Direct start**
```bash
node server.js
```
(Will automatically use port 6000 as default)

## 🔧 **Troubleshooting:**

If you get port conflicts:
1. **Kill existing processes:** `taskkill /F /IM node.exe`
2. **Check port usage:** `netstat -ano | findstr :6000`
3. **Restart server:** `start_port_6000.bat`

## ✅ **Verification:**

Test these endpoints to confirm everything is working:
- `http://localhost:6000/api/health` - Should return server status
- `http://localhost:6000/api/v1/arrested/` - Should return arrested records
- `http://localhost:6000/api/v1/arrested/statistics` - Should return statistics

## 🎉 **Ready to Use!**

Your server is now configured for port 6000. All your existing functionality (image upload, fetch APIs, authentication) will work exactly the same, just on the new port.

**Update your Postman requests to use `http://localhost:6000` instead of `http://localhost:3000`!** 🚀
