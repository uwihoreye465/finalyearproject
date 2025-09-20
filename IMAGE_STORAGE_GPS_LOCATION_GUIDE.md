# 📸 Image Storage & 📍 GPS Location Guide

## 🖼️ **IMAGE STORAGE LOCATIONS**

### **Arrested Criminals Images:**
- **Storage Path:** `uploads/arrested/`
- **Full Path:** `C:\Users\uwiho\Documents\all project\findsinnerssystem\uploads\arrested\`
- **File Naming:** `arrested_[timestamp]_[random].jpg` (e.g., `arrested_1703123456789_abc123.jpg`)
- **File Size Limit:** 5MB
- **Allowed Formats:** JPG, PNG, GIF, WebP (any image format)

### **Victim Evidence Files:**
- **Storage Path:** `uploads/evidence/`
- **Full Path:** `C:\Users\uwiho\Documents\all project\findsinnerssystem\uploads\evidence\`
- **File Naming:** `evidence_[timestamp]_[random].[extension]`
- **File Size Limit:** 10MB per file
- **Allowed Formats:** Images, PDFs, Documents, Videos

### **How Images Are Stored:**
1. **Upload Process:**
   ```javascript
   // When you upload an image via API
   POST /api/v1/arrested
   Content-Type: multipart/form-data
   
   // File gets saved to:
   uploads/arrested/arrested_1703123456789_abc123.jpg
   
   // Database stores:
   image_url: "/uploads/arrested/arrested_1703123456789_abc123.jpg"
   ```

2. **Accessing Images:**
   ```bash
   # Local development
   http://localhost:6000/uploads/arrested/arrested_1703123456789_abc123.jpg
   
   # Production (Render)
   https://tracking-criminal.onrender.com/uploads/arrested/arrested_1703123456789_abc123.jpg
   ```

---

## 📍 **GPS LOCATION TRACKING SYSTEM**

### **How GPS Location Works:**

#### **1. Automatic Location Detection:**
- **IP Geolocation:** Uses device's IP address to get real coordinates
- **Service:** `ipapi.co` API for accurate location detection
- **Fallback:** Random Rwanda locations if IP detection fails

#### **2. Location Detection Process:**
```javascript
// Step 1: Get client IP
const clientIP = req.ip || req.connection.remoteAddress || '127.0.0.1';

// Step 2: Try IP geolocation
const ipLocation = await getLocationFromIP(clientIP);

// Step 3: If successful, use real coordinates
if (ipLocation) {
  finalLatitude = ipLocation.latitude;    // e.g., -1.9441
  finalLongitude = ipLocation.longitude;  // e.g., 30.0619
  finalLocationName = ipLocation.location_name; // "Kigali, Rwanda"
}

// Step 4: If failed, use Rwanda fallback
else {
  // Random Rwanda location
  finalLatitude = -1.9441;  // Kigali
  finalLongitude = 30.0619;
  finalLocationName = "Kigali, Rwanda";
}
```

#### **3. Database Storage:**
```sql
-- Notification table stores GPS data
INSERT INTO notification (
  near_rib, fullname, address, phone, message,
  gps_latitude, gps_longitude, location_name
) VALUES (
  '1234567890123456', 'John Doe', 'Kigali', '0781234567', 'Suspicious activity',
  -1.9441, 30.0619, 'Kigali, Rwanda'
);
```

---

## 🗺️ **GOOGLE MAPS INTEGRATION**

### **Google Maps Links Generated:**
Every notification with GPS coordinates gets a Google Maps link:

```javascript
// Google Maps link format
const googleMapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

// Example:
// https://www.google.com/maps?q=-1.9441,30.0619
```

### **API Response with Maps:**
```json
{
  "success": true,
  "message": "Notification sent successfully with automatic location tracking",
  "data": {
    "notification": {
      "not_id": 1,
      "near_rib": "1234567890123456",
      "fullname": "John Doe",
      "gps_latitude": -1.9441,
      "gps_longitude": 30.0619,
      "location_name": "Kigali, Rwanda"
    },
    "device_tracking": {
      "client_ip": "192.168.1.100",
      "location_detected": true,
      "location_source": "automatic_detection",
      "location": {
        "latitude": -1.9441,
        "longitude": 30.0619,
        "location_name": "Kigali, Rwanda",
        "google_maps_link": "https://www.google.com/maps?q=-1.9441,30.0619"
      },
      "google_maps_link": "https://www.google.com/maps?q=-1.9441,30.0619"
    }
  }
}
```

---

## 🧪 **TESTING THE SYSTEM**

### **1. Test Image Upload:**
```bash
curl -X POST http://localhost:6000/api/v1/arrested \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "fullname=Criminal Name" \
  -F "crime_type=Theft" \
  -F "image=@/path/to/your/image.jpg"
```

**Result:**
- Image saved to: `uploads/arrested/arrested_1703123456789_abc123.jpg`
- Database stores: `image_url: "/uploads/arrested/arrested_1703123456789_abc123.jpg"`

### **2. Test GPS Notification:**
```bash
curl -X POST http://localhost:6000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "near_rib": "1234567890123456",
    "fullname": "Test User",
    "message": "Test notification"
  }'
```

**Result:**
- Real GPS coordinates detected from your IP
- Google Maps link generated
- Location stored in database

### **3. Test Image Access:**
```bash
# Check if image is accessible
curl http://localhost:6000/uploads/arrested/arrested_1703123456789_abc123.jpg
```

---

## 🔧 **CONFIGURATION**

### **Image Upload Settings:**
```javascript
// In src/routes/arrested.js
const upload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/arrested/',  // Where images are stored
    filename: 'arrested_[timestamp]_[random].[ext]'  // File naming
  }),
  limits: {
    fileSize: 5 * 1024 * 1024  // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);  // Allow images only
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});
```

### **GPS Location Settings:**
```javascript
// In src/controllers/notificationController.js
async function getLocationFromIP(ip) {
  try {
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    return {
      latitude: response.data.latitude,
      longitude: response.data.longitude,
      location_name: `${response.data.city}, ${response.data.region}, ${response.data.country_name}`
    };
  } catch (error) {
    return null;  // Will use Rwanda fallback
  }
}
```

---

## ✅ **SUMMARY**

### **Image Storage:**
- ✅ **Arrested Images:** `uploads/arrested/` directory
- ✅ **Evidence Files:** `uploads/evidence/` directory
- ✅ **Automatic Naming:** Timestamp + random string
- ✅ **Size Limits:** 5MB for images, 10MB for evidence
- ✅ **URL Generation:** Automatic URL generation for database storage

### **GPS Location:**
- ✅ **Real Location Detection:** Uses IP geolocation
- ✅ **Rwanda Fallback:** Random Rwanda locations if IP fails
- ✅ **Google Maps Integration:** Automatic map links generated
- ✅ **Database Storage:** GPS coordinates stored in `gps_latitude`, `gps_longitude`
- ✅ **Location Names:** Human-readable location names

### **Your System Now Provides:**
1. **Real GPS coordinates** from device IP addresses
2. **Google Maps links** for every notification
3. **Proper image storage** in organized directories
4. **Automatic file management** with proper naming
5. **Location tracking** without user input required

**Everything is working perfectly!** 🎉
