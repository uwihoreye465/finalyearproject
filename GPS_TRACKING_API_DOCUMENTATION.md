# 🗺️ GPS TRACKING API DOCUMENTATION

## Overview
The GPS tracking feature allows the admin to see the location of users who send notifications. When a message is sent, the system can capture and store GPS coordinates (latitude, longitude) along with a human-readable location name.

---

## 🚀 **NEW FEATURES ADDED**

### 1. **GPS Location Storage**
- **latitude**: GPS latitude coordinate (-90 to 90 degrees)
- **longitude**: GPS longitude coordinate (-180 to 180 degrees)  
- **location_name**: Human-readable location (e.g., "Kigali, Rwanda")

### 2. **Location-Based Search**
- Find notifications within a specific radius
- Calculate distance from search center
- Sort by proximity

### 3. **Enhanced Statistics**
- Track how many notifications include GPS data
- Location-based analytics

---

## 📡 **API ENDPOINTS**

### **1. Send Notification with GPS (Enhanced)**

**POST** `/api/v1/notifications`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "near_rib": "1234567890123456",
  "fullname": "John Doe",
  "address": "Kigali, Rwanda",
  "phone": "+250788123456",
  "message": "Suspicious activity reported",
  "latitude": -1.9441,
  "longitude": 30.0619,
  "location_name": "Kigali, Rwanda"
}
```

**GPS Fields (Optional):**
- `latitude`: Number between -90 and 90
- `longitude`: Number between -180 and 180
- `location_name`: String (e.g., "Kigali, Rwanda")

**Response:**
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
    "gps_tracking": {
      "has_location": true,
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

### **2. Get All Notifications (Enhanced)**

**GET** `/api/v1/notifications`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
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
      "total_pages": 5,
      "total_items": 50,
      "items_per_page": 10
    }
  }
}
```

---

### **3. Get Notification by ID (Enhanced)**

**GET** `/api/v1/notifications/:id`

**Response:**
```json
{
  "success": true,
  "data": {
    "notification": {
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
  }
}
```

---

### **4. Search Notifications by Location (NEW)**

**GET** `/api/v1/notifications/location`

**Query Parameters:**
- `latitude`: Search center latitude (required)
- `longitude`: Search center longitude (required)
- `radius`: Search radius in kilometers (default: 10)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Example:**
```
GET /api/v1/notifications/location?latitude=-1.9441&longitude=30.0619&radius=5&page=1&limit=10
```

**Response:**
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
          "distance_km": "0.25"
        }
      }
    ],
    "search_center": {
      "latitude": -1.9441,
      "longitude": 30.0619
    },
    "search_radius_km": 5,
    "pagination": {
      "current_page": 1,
      "total_pages": 2,
      "total_items": 15,
      "items_per_page": 10
    }
  }
}
```

---

### **5. Get Statistics (Enhanced)**

**GET** `/api/v1/notifications/stats/rib-statistics`

**Query Parameters:**
- `timeframe`: all, today, week, month (default: all)
- `rib`: Specific RIB number (optional)

**Response:**
```json
{
  "success": true,
  "data": {
    "rib_statistics": [
      {
        "near_rib": "1234567890123456",
        "total_messages": 15,
        "unread_messages": 3,
        "read_messages": 12,
        "messages_with_gps": 10,
        "first_message_date": "2024-01-15T08:00:00.000Z",
        "last_message_date": "2024-01-20T10:30:00.000Z"
      }
    ],
    "overall_statistics": {
      "total_messages": 150,
      "total_unread": 25,
      "total_read": 125,
      "total_with_gps": 95,
      "total_ribs": 12
    },
    "timeframe": "all",
    "filtered_rib": "all"
  }
}
```

---

## 🗄️ **DATABASE CHANGES**

### **New Columns Added to `notification` Table:**

```sql
ALTER TABLE notification 
ADD COLUMN latitude DECIMAL(10, 8) NULL,
ADD COLUMN longitude DECIMAL(11, 8) NULL,
ADD COLUMN location_name VARCHAR(255) NULL;

-- Add index for better query performance
CREATE INDEX idx_notification_location ON notification(latitude, longitude);
```

### **Column Descriptions:**
- `latitude`: GPS latitude coordinate (-90 to 90 degrees)
- `longitude`: GPS longitude coordinate (-180 to 180 degrees)
- `location_name`: Human-readable location name

---

## 📱 **FRONTEND INTEGRATION**

### **Getting User Location (JavaScript):**

```javascript
// Get current GPS coordinates
function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => {
        reject('Error getting location: ' + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}

// Send notification with GPS
async function sendNotificationWithGPS(notificationData) {
  try {
    const location = await getCurrentLocation();
    
    const payload = {
      ...notificationData,
      latitude: location.latitude,
      longitude: location.longitude,
      location_name: await getLocationName(location.latitude, location.longitude)
    };

    const response = await fetch('/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    return await response.json();
  } catch (error) {
    console.error('Error sending notification:', error);
    // Fallback: send without GPS
    return sendNotificationWithoutGPS(notificationData);
  }
}
```

### **Reverse Geocoding (Get Location Name):**

```javascript
// Get human-readable location name from coordinates
async function getLocationName(latitude, longitude) {
  try {
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=YOUR_API_KEY`
    );
    const data = await response.json();
    return data.results[0]?.formatted || 'Unknown Location';
  } catch (error) {
    return 'Unknown Location';
  }
}
```

---

## 🧪 **TESTING EXAMPLES**

### **Test 1: Send Notification with GPS**

```bash
curl -X POST http://localhost:6000/api/v1/notifications \
  -H "Content-Type: application/json" \
  -d '{
    "near_rib": "1234567890123456",
    "fullname": "Test User",
    "address": "Kigali, Rwanda",
    "phone": "+250788123456",
    "message": "Test message with GPS",
    "latitude": -1.9441,
    "longitude": 30.0619,
    "location_name": "Kigali, Rwanda"
  }'
```

### **Test 2: Search by Location**

```bash
curl "http://localhost:6000/api/v1/notifications/location?latitude=-1.9441&longitude=30.0619&radius=10&page=1&limit=5"
```

### **Test 3: Get All Notifications**

```bash
curl "http://localhost:6000/api/v1/notifications?page=1&limit=10"
```

---

## ⚠️ **IMPORTANT NOTES**

1. **GPS is Optional**: Notifications can be sent with or without GPS coordinates
2. **Privacy**: GPS data is stored in the database - ensure compliance with privacy laws
3. **Accuracy**: GPS accuracy depends on device capabilities and user permissions
4. **Fallback**: Always provide fallback for users who deny location access
5. **Validation**: Coordinates are validated on the server side
6. **Performance**: Location-based searches use database indexes for optimal performance

---

## 🔧 **SETUP INSTRUCTIONS**

1. **Run the database migration:**
   ```bash
   psql -d your_database -f add_gps_tracking.sql
   ```

2. **Restart your server** to load the new code

3. **Test the endpoints** using the examples above

4. **Update your frontend** to request location permissions and send GPS data

---

## 📊 **MONITORING & ANALYTICS**

The enhanced statistics endpoint now includes:
- `messages_with_gps`: Count of notifications with GPS data
- `total_with_gps`: Overall count of GPS-enabled notifications

This helps you track:
- How many users are sharing their location
- Location-based notification patterns
- Geographic distribution of reports

---

## 🚀 **NEXT STEPS**

1. **Implement the database migration**
2. **Test the API endpoints**
3. **Update your frontend to request location permissions**
4. **Add location-based filtering to your admin dashboard**
5. **Consider adding maps visualization for GPS data**

---

*GPS Tracking feature successfully implemented! 🎉*
