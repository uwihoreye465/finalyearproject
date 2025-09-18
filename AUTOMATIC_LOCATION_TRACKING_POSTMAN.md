# 🗺️ Automatic Location Tracking - Postman Testing Guide

## 🎯 **What This Does**

The system now **automatically tracks the location** of the device sending the message:

1. **GPS First**: If the device provides GPS coordinates, use those (most accurate)
2. **IP Fallback**: If no GPS, automatically detect location from IP address
3. **Admin View**: Admin can see exactly where the message came from

---

## 🧪 **Postman Tests**

### **Test 1: Send Message (Automatic Location Detection)**

**Method:** `POST`  
**URL:** `http://localhost:6000/api/v1/notifications`  
**Headers:**
```
Content-Type: application/json
```

**Body (JSON) - Basic message (no GPS provided):**
```json
{
  "near_rib": "1234567890123456",
  "fullname": "John Doe",
  "address": "Kigali, Rwanda",
  "phone": "+250788123456",
  "message": "Suspicious activity reported"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "notification": {
      "not_id": 1,
      "near_rib": "1234567890123456",
      "fullname": "John Doe",
      "address": "Kigali, Rwanda",
      "phone": "+250788123456",
      "message": "Suspicious activity reported",
      "latitude": -1.9441,
      "longitude": 30.0619,
      "location_name": "Kigali, Rwanda",
      "created_at": "2024-01-20T10:30:00.000Z",
      "is_read": false
    },
    "device_tracking": {
      "client_ip": "192.168.1.100",
      "location_detected": true,
      "location_source": "ip_geolocation",
      "location": {
        "latitude": -1.9441,
        "longitude": 30.0619,
        "location_name": "Kigali, Rwanda"
      }
    }
  }
}
```

---

### **Test 2: Send Message with GPS (Override IP Location)**

**Method:** `POST`  
**URL:** `http://localhost:6000/api/v1/notifications`  
**Headers:**
```
Content-Type: application/json
```

**Body (JSON) - With GPS coordinates:**
```json
{
  "near_rib": "9876543210987654",
  "fullname": "Jane Smith",
  "address": "Huye, Rwanda",
  "phone": "+250788654321",
  "message": "Report from Huye District",
  "latitude": -2.5833,
  "longitude": 29.7500,
  "location_name": "Huye, Rwanda"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Notification sent successfully",
  "data": {
    "notification": {
      "not_id": 2,
      "near_rib": "9876543210987654",
      "fullname": "Jane Smith",
      "address": "Huye, Rwanda",
      "phone": "+250788654321",
      "message": "Report from Huye District",
      "latitude": -2.5833,
      "longitude": 29.7500,
      "location_name": "Huye, Rwanda",
      "created_at": "2024-01-20T10:35:00.000Z",
      "is_read": false
    },
    "device_tracking": {
      "client_ip": "192.168.1.100",
      "location_detected": true,
      "location_source": "gps_provided",
      "location": {
        "latitude": -2.5833,
        "longitude": 29.7500,
        "location_name": "Huye, Rwanda"
      }
    }
  }
}
```

---

### **Test 3: Get Device Location Info (Admin View)**

**Method:** `GET`  
**URL:** `http://localhost:6000/api/v1/notifications/device-info/1`  

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "device_info": {
      "notification_id": 1,
      "sender_name": "John Doe",
      "sender_phone": "+250788123456",
      "message": "Suspicious activity reported",
      "sent_at": "2024-01-20T10:30:00.000Z",
      "has_location": true,
      "location": {
        "latitude": -1.9441,
        "longitude": 30.0619,
        "location_name": "Kigali, Rwanda",
        "coordinates": "-1.9441, 30.0619"
      },
      "google_maps_link": "https://www.google.com/maps?q=-1.9441,30.0619"
    },
    "tracking_status": "Location tracked successfully"
  }
}
```

---

### **Test 4: Get All Notifications (with Location Data)**

**Method:** `GET`  
**URL:** `http://localhost:6000/api/v1/notifications`  

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "not_id": 2,
        "near_rib": "9876543210987654",
        "fullname": "Jane Smith",
        "address": "Huye, Rwanda",
        "phone": "+250788654321",
        "message": "Report from Huye District",
        "created_at": "2024-01-20T10:35:00.000Z",
        "is_read": false,
        "latitude": -2.5833,
        "longitude": 29.7500,
        "location_name": "Huye, Rwanda",
        "has_gps_location": true,
        "gps_location": {
          "latitude": -2.5833,
          "longitude": 29.7500,
          "location_name": "Huye, Rwanda"
        }
      },
      {
        "not_id": 1,
        "near_rib": "1234567890123456",
        "fullname": "John Doe",
        "address": "Kigali, Rwanda",
        "phone": "+250788123456",
        "message": "Suspicious activity reported",
        "created_at": "2024-01-20T10:30:00.000Z",
        "is_read": false,
        "latitude": -1.9441,
        "longitude": 30.0619,
        "location_name": "Kigali, Rwanda",
        "has_gps_location": true,
        "gps_location": {
          "latitude": -1.9441,
          "longitude": 30.0619,
          "location_name": "Kigali, Rwanda"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 2,
      "items_per_page": 10
    }
  }
}
```

---

### **Test 5: Search by Location**

**Method:** `GET`  
**URL:** `http://localhost:6000/api/v1/notifications/location`  
**Query Parameters:**
```
latitude: -1.9441
longitude: 30.0619
radius: 50
page: 1
limit: 10
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "not_id": 1,
        "near_rib": "1234567890123456",
        "fullname": "John Doe",
        "address": "Kigali, Rwanda",
        "phone": "+250788123456",
        "message": "Suspicious activity reported",
        "created_at": "2024-01-20T10:30:00.000Z",
        "is_read": false,
        "gps_location": {
          "latitude": -1.9441,
          "longitude": 30.0619,
          "location_name": "Kigali, Rwanda",
          "distance_km": "0.00"
        }
      }
    ],
    "search_center": {
      "latitude": -1.9441,
      "longitude": 30.0619
    },
    "search_radius_km": 50,
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 1,
      "items_per_page": 10
    }
  }
}
```

---

## 🔍 **Key Features Explained**

### **1. Automatic Location Detection**
- **No manual input required** - system automatically detects location
- **GPS preferred** - if device provides GPS, use that (most accurate)
- **IP fallback** - if no GPS, use IP geolocation
- **Always works** - even if user doesn't provide location

### **2. Device Tracking Information**
- **Client IP** - shows the IP address of the sender
- **Location Source** - shows whether location came from GPS or IP
- **Coordinates** - exact latitude/longitude
- **Google Maps Link** - direct link to view location on map

### **3. Admin Benefits**
- **See exact location** of every message sender
- **Track patterns** - see where reports are coming from
- **Respond quickly** - know exactly where to send help
- **Verify authenticity** - location helps verify if report is real

---

## 📱 **Real-World Usage**

### **For Users (Sending Messages):**
1. **Just send the message** - no need to provide location
2. **System automatically detects** where you are
3. **More accurate if GPS enabled** on your device
4. **Works even without GPS** using your internet connection

### **For Admins (Viewing Messages):**
1. **See all messages** with location data
2. **Click Google Maps link** to see exact location
3. **Search by area** to find nearby reports
4. **Track patterns** across different locations

---

## 🚀 **Testing Steps**

1. **Run database migration** (if not done already)
2. **Test basic message** (Test 1) - should auto-detect location
3. **Test with GPS** (Test 2) - should use GPS coordinates
4. **Test device info** (Test 3) - admin view of location
5. **Test location search** (Test 5) - find nearby reports

---

## ⚠️ **Important Notes**

- **IP geolocation** works for most internet connections
- **GPS is more accurate** but requires user permission
- **Localhost testing** may not show real location (use real IP)
- **Privacy compliant** - only tracks when message is sent
- **Admin only** - regular users can't see location data

---

*Automatic location tracking is now active! 🎉*
