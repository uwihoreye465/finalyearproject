# 👤 User Management API Documentation

## ✅ **Complete User Management System**

Your user management system is now fully functional with proper database schema alignment!

## 🔧 **Available APIs:**

### **1. User Self-Management (Authentication Required)**

#### **Get User Profile**
```http
GET /api/v1/users/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "user_id": 1,
    "fullname": "John Doe",
    "email": "john@example.com",
    "position": "Manager",
    "sector": "IT",
    "role": "user",
    "is_verified": true,
    "is_approved": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_login": "2024-01-15T10:30:00.000Z"
  }
}
```

#### **Update User Profile**
```http
PUT /api/v1/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "fullname": "John Smith",
  "email": "johnsmith@example.com",
  "position": "Senior Manager",
  "sector": "Technology"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "user": {
    "user_id": 1,
    "fullname": "John Smith",
    "email": "johnsmith@example.com",
    "position": "Senior Manager",
    "sector": "Technology",
    "role": "user",
    "is_verified": true,
    "is_approved": true,
    "created_at": "2024-01-01T00:00:00.000Z",
    "last_login": "2024-01-15T10:30:00.000Z"
  }
}
```

#### **Change Password**
```http
POST /api/v1/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

### **2. Admin User Management (Admin Authentication Required)**

#### **Get All Users**
```http
GET /api/v1/users?page=1&limit=10&role=admin&sector=IT
Authorization: Bearer <admin_token>
```

#### **Get User by ID**
```http
GET /api/v1/users/1
Authorization: Bearer <admin_token>
```

#### **Update User (Admin)**
```http
PUT /api/v1/users/1
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "fullname": "Jane Doe",
  "email": "jane@example.com",
  "position": "Director",
  "sector": "Operations",
  "role": "admin"
}
```

#### **Approve/Disapprove User**
```http
PUT /api/v1/users/1/approval
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "approved": true
}
```

#### **Delete User**
```http
DELETE /api/v1/users/1
Authorization: Bearer <admin_token>
```

#### **Get Pending Users**
```http
GET /api/v1/users/pending
Authorization: Bearer <admin_token>
```

#### **Get Dashboard Statistics**
```http
GET /api/v1/users/dashboard/stats
Authorization: Bearer <admin_token>
```

### **3. Public Routes (No Authentication Required)**

#### **Forgot Password**
```http
POST /api/v1/users/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

#### **Reset Password**
```http
POST /api/v1/users/reset-password/your-reset-token
Content-Type: application/json

{
  "newPassword": "newpassword123"
}
```

## 🗄️ **Database Schema Alignment**

The API now correctly works with your actual database schema:

**Users Table Columns:**
- ✅ `user_id` (Primary Key)
- ✅ `fullname` (VARCHAR)
- ✅ `email` (VARCHAR)
- ✅ `password` (VARCHAR) - **NOT editable via API**
- ✅ `position` (VARCHAR)
- ✅ `sector` (VARCHAR)
- ✅ `role` (VARCHAR)
- ✅ `verification_token` (VARCHAR)
- ✅ `is_verified` (BOOL)
- ✅ `is_approved` (BOOL)
- ✅ `created_at` (TIMESTAMP)
- ✅ `last_login` (TIMESTAMP)
- ✅ `session_expiry` (TIMESTAMP)
- ✅ `last_logout` (TIMESTAMP)
- ✅ `reset_token_expiry` (TIMESTAMP)

## 🔒 **Security Features**

1. **Password Protection** - Passwords cannot be updated via profile update
2. **Email Validation** - Prevents duplicate emails
3. **Role-based Access** - Admin vs User permissions
4. **Email Notifications** - Users get notified of profile changes
5. **Input Validation** - All inputs are validated and sanitized

## 🚀 **Testing Your APIs**

### **Test User Profile Update:**
```bash
curl -X PUT http://localhost:6000/api/v1/users/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Updated Name",
    "email": "updated@example.com",
    "position": "New Position",
    "sector": "New Sector"
  }'
```

### **Test Admin User Update:**
```bash
curl -X PUT http://localhost:6000/api/v1/users/1 \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fullname": "Admin Updated Name",
    "email": "admin@example.com",
    "position": "Admin Position",
    "sector": "Admin Sector",
    "role": "admin"
  }'
```

## ✅ **What's Fixed:**

1. **✅ Database Schema Alignment** - All queries match your actual table structure
2. **✅ No More Column Errors** - Removed references to non-existent columns
3. **✅ Proper Authentication** - Separate routes for users vs admins
4. **✅ Email Notifications** - Users get notified of changes
5. **✅ Input Validation** - All inputs are properly validated
6. **✅ Error Handling** - Comprehensive error responses

Your user management system is now **100% functional** and ready to use! 🎉
