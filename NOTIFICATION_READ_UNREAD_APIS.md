# ✅ NOTIFICATION READ/UNREAD APIs - COMPLETE!

## 📱 **Comprehensive Read/Unread Management for Notifications!**

### **🔧 Available APIs:**

✅ **Mark Single Notification**: Mark one notification as read/unread  
✅ **Toggle Notification**: Toggle read status of one notification  
✅ **Mark Multiple Notifications**: Mark multiple notifications as read/unread  
✅ **Mark All for User**: Mark all notifications for a user as read/unread  
✅ **Mark by Sector**: Mark all notifications in a sector as read/unread (admin only)  

---

## 🚀 **READ/UNREAD NOTIFICATION APIs:**

### **1. ✅ Mark Single Notification as Read/Unread**

**Endpoint:**
```bash
PATCH https://tracking-criminal.onrender.com/api/v1/notifications/:id/read
Authorization: Bearer <user_token>
```

**Request Body:**
```json
{
  "is_read": true
}
```

**Example Request:**
```bash
PATCH https://tracking-criminal.onrender.com/api/v1/notifications/69/read
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "is_read": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Notification marked as read successfully",
  "data": {
    "notification": {
      "not_id": 69,
      "is_read": true,
      "updated_at": "2025-09-23T18:00:00.000Z"
    },
    "previous_status": false,
    "new_status": true
  }
}
```

### **2. ✅ Toggle Notification Read Status**

**Endpoint:**
```bash
PATCH https://tracking-criminal.onrender.com/api/v1/notifications/:id/toggle-read
Authorization: Bearer <user_token>
```

**Example Request:**
```bash
PATCH https://tracking-criminal.onrender.com/api/v1/notifications/69/toggle-read
Authorization: Bearer <user_token>
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Notification toggled to unread successfully",
  "data": {
    "notification": {
      "not_id": 69,
      "is_read": false,
      "updated_at": "2025-09-23T18:00:00.000Z"
    },
    "previous_status": true,
    "new_status": false
  }
}
```

### **3. ✅ Mark Multiple Notifications as Read/Unread**

**Endpoint:**
```bash
PATCH https://tracking-criminal.onrender.com/api/v1/notifications/mark-multiple-read
Authorization: Bearer <user_token>
```

**Request Body:**
```json
{
  "notification_ids": [69, 70, 71],
  "is_read": true
}
```

**Example Request:**
```bash
PATCH https://tracking-criminal.onrender.com/api/v1/notifications/mark-multiple-read
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "notification_ids": [69, 70, 71],
  "is_read": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "3 notifications marked as read",
  "data": {
    "updated_notifications": [
      { "not_id": 69, "is_read": true },
      { "not_id": 70, "is_read": true },
      { "not_id": 71, "is_read": true }
    ],
    "total_updated": 3,
    "requested_count": 3
  }
}
```

### **4. ✅ Mark All Notifications for User as Read/Unread**

**Endpoint:**
```bash
PATCH https://tracking-criminal.onrender.com/api/v1/notifications/mark-all-read
Authorization: Bearer <user_token>
```

**Request Body:**
```json
{
  "is_read": true
}
```

**Example Request:**
```bash
PATCH https://tracking-criminal.onrender.com/api/v1/notifications/mark-all-read
Authorization: Bearer <user_token>
Content-Type: application/json

{
  "is_read": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "5 notifications marked as read for user",
  "data": {
    "updated_notifications": [
      { "not_id": 69, "is_read": true },
      { "not_id": 70, "is_read": true },
      { "not_id": 71, "is_read": true },
      { "not_id": 72, "is_read": true },
      { "not_id": 73, "is_read": true }
    ],
    "total_updated": 5,
    "user_id": 53,
    "user_role": "near_rib",
    "new_status": true
  }
}
```

**Note:** 
- **Admin users**: Can mark ALL notifications as read/unread
- **Regular users**: Can only mark their assigned notifications as read/unread

### **5. ✅ Mark All Notifications by Sector as Read/Unread (Admin Only)**

**Endpoint:**
```bash
PATCH https://tracking-criminal.onrender.com/api/v1/notifications/mark-by-sector-read
Authorization: Bearer <admin_token>
```

**Request Body:**
```json
{
  "sector": "kicukiro",
  "is_read": true
}
```

**Example Request:**
```bash
PATCH https://tracking-criminal.onrender.com/api/v1/notifications/mark-by-sector-read
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "sector": "kicukiro",
  "is_read": true
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "8 notifications marked as read for sector kicukiro",
  "data": {
    "updated_notifications": [
      { "not_id": 69, "is_read": true, "near_rib": "kicukiro" },
      { "not_id": 70, "is_read": true, "near_rib": "kicukiro" },
      { "not_id": 71, "is_read": true, "near_rib": "kicukiro" }
    ],
    "total_updated": 8,
    "sector": "kicukiro",
    "new_status": true
  }
}
```

**Note:** Only admin users can use this endpoint.

---

## 🧪 **TESTING EXAMPLES:**

### **✅ Test 1: Mark Single Notification as Read**
```bash
curl -X PATCH "https://tracking-criminal.onrender.com/api/v1/notifications/69/read" \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{"is_read": true}'
```

### **✅ Test 2: Toggle Notification Status**
```bash
curl -X PATCH "https://tracking-criminal.onrender.com/api/v1/notifications/69/toggle-read" \
  -H "Authorization: Bearer <user_token>"
```

### **✅ Test 3: Mark Multiple Notifications as Read**
```bash
curl -X PATCH "https://tracking-criminal.onrender.com/api/v1/notifications/mark-multiple-read" \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{"notification_ids": [69, 70, 71], "is_read": true}'
```

### **✅ Test 4: Mark All User Notifications as Read**
```bash
curl -X PATCH "https://tracking-criminal.onrender.com/api/v1/notifications/mark-all-read" \
  -H "Authorization: Bearer <user_token>" \
  -H "Content-Type: application/json" \
  -d '{"is_read": true}'
```

### **✅ Test 5: Mark All Sector Notifications as Read (Admin)**
```bash
curl -X PATCH "https://tracking-criminal.onrender.com/api/v1/notifications/mark-by-sector-read" \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"sector": "kicukiro", "is_read": true}'
```

---

## 📱 **FRONTEND INTEGRATION:**

### **✅ Mark Single Notification as Read:**
```javascript
const markNotificationRead = async (notificationId, isRead = true) => {
  try {
    const response = await fetch(`/api/v1/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_read: isRead })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Notification marked as read:', data.data);
      // Update UI
      updateNotificationStatus(notificationId, isRead);
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};
```

### **✅ Toggle Notification Status:**
```javascript
const toggleNotificationRead = async (notificationId) => {
  try {
    const response = await fetch(`/api/v1/notifications/${notificationId}/toggle-read`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${userToken}`
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Notification toggled:', data.data);
      // Update UI
      updateNotificationStatus(notificationId, data.data.new_status);
    }
  } catch (error) {
    console.error('Error toggling notification:', error);
  }
};
```

### **✅ Mark Multiple Notifications:**
```javascript
const markMultipleNotificationsRead = async (notificationIds, isRead = true) => {
  try {
    const response = await fetch('/api/v1/notifications/mark-multiple-read', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        notification_ids: notificationIds, 
        is_read: isRead 
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Multiple notifications marked:', data.data);
      // Update UI for all notifications
      notificationIds.forEach(id => updateNotificationStatus(id, isRead));
    }
  } catch (error) {
    console.error('Error marking multiple notifications:', error);
  }
};
```

### **✅ Mark All User Notifications:**
```javascript
const markAllUserNotificationsRead = async (isRead = true) => {
  try {
    const response = await fetch('/api/v1/notifications/mark-all-read', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ is_read: isRead })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('All user notifications marked:', data.data);
      // Update UI for all notifications
      data.data.updated_notifications.forEach(notification => {
        updateNotificationStatus(notification.not_id, notification.is_read);
      });
    }
  } catch (error) {
    console.error('Error marking all user notifications:', error);
  }
};
```

### **✅ Mark All Sector Notifications (Admin):**
```javascript
const markAllSectorNotificationsRead = async (sector, isRead = true) => {
  try {
    const response = await fetch('/api/v1/notifications/mark-by-sector-read', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${adminToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        sector: sector, 
        is_read: isRead 
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('All sector notifications marked:', data.data);
      // Update UI for all sector notifications
      data.data.updated_notifications.forEach(notification => {
        updateNotificationStatus(notification.not_id, notification.is_read);
      });
    }
  } catch (error) {
    console.error('Error marking sector notifications:', error);
  }
};
```

---

## 🎯 **USE CASES:**

### **✅ For Regular Users:**
- **Mark Individual Notifications**: Mark specific notifications as read/unread
- **Toggle Status**: Quickly toggle read status of notifications
- **Mark Multiple**: Select and mark multiple notifications at once
- **Mark All Assigned**: Mark all their assigned notifications as read/unread

### **✅ For Admin Users:**
- **All User Functions**: Can use all regular user functions
- **Mark All Notifications**: Mark ALL notifications in the system as read/unread
- **Mark by Sector**: Mark all notifications in a specific sector as read/unread
- **Bulk Management**: Efficiently manage large numbers of notifications

---

## 🔧 **PERMISSION LEVELS:**

### **✅ Regular Users:**
- Can mark their assigned notifications as read/unread
- Can use single, toggle, and multiple notification APIs
- Can mark all their assigned notifications

### **✅ Admin Users:**
- Can mark ANY notification as read/unread
- Can mark ALL notifications in the system
- Can mark notifications by sector
- Full access to all read/unread functionality

---

## ✅ **YOUR NOTIFICATION READ/UNREAD APIs ARE READY!**

### **🎉 Available Endpoints:**
- ✅ **PATCH /:id/read** - Mark single notification as read/unread
- ✅ **PATCH /:id/toggle-read** - Toggle notification read status
- ✅ **PATCH /mark-multiple-read** - Mark multiple notifications as read/unread
- ✅ **PATCH /mark-all-read** - Mark all user notifications as read/unread
- ✅ **PATCH /mark-by-sector-read** - Mark all sector notifications (admin only)

### **🔧 Key Features:**
- **Single Notifications**: Mark individual notifications as read/unread
- **Toggle Functionality**: Quick toggle between read/unread states
- **Bulk Operations**: Mark multiple notifications at once
- **User-Specific**: Mark all notifications for a user
- **Sector Management**: Mark all notifications in a sector (admin)
- **Permission Control**: Different access levels for users and admins

**Your notification system now supports comprehensive read/unread management with multiple operation types!** 🚀📱
