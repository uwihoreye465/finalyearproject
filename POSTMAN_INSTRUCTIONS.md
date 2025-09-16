# 🚀 POSTMAN TESTING INSTRUCTIONS - FIXED

## ✅ **Problems SOLVED:**

1. **❌ Foreign Key Error**: Fixed - `criminal_record_id` now automatically set to `null`
2. **❌ Manual Input Required**: Fixed - `arresting_officer_id` auto-assigned from authenticated user
3. **❌ Wrong Request Format**: Fixed - Clear instructions below

---

## 📝 **CORRECT REQUEST FORMAT FOR POSTMAN**

### **Step 1: First, Create an Admin User**

**Method:** `POST`  
**URL:** `http://localhost:6000/api/v1/auth/create-first-admin`  
**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@test.com",
  "password": "admin123",
  "fullname": "Test Admin"
}
```

### **Step 2: Login to Get Token**

**Method:** `POST`  
**URL:** `http://localhost:6000/api/v1/auth/login`  
**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@test.com",
  "password": "admin123"
}
```

**Response:** Copy the `token` from the response for next step.

### **Step 3: Create Arrest Record (FIXED FORMAT)**

**Method:** `POST`  
**URL:** `http://localhost:6000/api/v1/arrested`  
**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_TOKEN_HERE
```

**Body (JSON) - CORRECT FORMAT:**
```json
{
  "fullname": "Jean Baptiste Uwimana",
  "crime_type": "Theft"
}
```

**Or with optional fields:**
```json
{
  "fullname": "Marie Claire Mukamana",
  "crime_type": "Fraud",
  "date_arrested": "2024-01-15",
  "arrest_location": "Kigali City Center",
  "id_type": "indangamuntu_yumunyarwanda",
  "id_number": "1199012345678901"
}
```

---

## ❌ **DO NOT INCLUDE THESE FIELDS:**

**NEVER include these in your request body:**
- ❌ `arrest_id` (auto-generated)
- ❌ `criminal_record_id` (auto-set to null)
- ❌ `arresting_officer_id` (auto-assigned from your user)
- ❌ `created_at` (auto-generated)
- ❌ `updated_at` (auto-generated)
- ❌ `image_url` (not implemented yet)

---

## 🧪 **TEST EXAMPLES**

### Example 1: Minimal Request
```json
{
  "fullname": "Test Criminal",
  "crime_type": "Theft"
}
```

### Example 2: Full Request
```json
{
  "fullname": "John Doe Uwimana",
  "crime_type": "Drug Trafficking",
  "date_arrested": "2024-01-15",
  "arrest_location": "Nyamirambo Market",
  "id_type": "indangamuntu_yumunyarwanda",
  "id_number": "1199012345678901"
}
```

### Example 3: Foreign National
```json
{
  "fullname": "David Johnson",
  "crime_type": "Fraud",
  "arrest_location": "Kigali Airport",
  "id_type": "passport",
  "id_number": "P123456789"
}
```

---

## 📊 **OTHER USEFUL ENDPOINTS**

### Get All Arrests
**Method:** `GET`  
**URL:** `http://localhost:6000/api/v1/arrested`  
**Headers:** `Authorization: Bearer YOUR_TOKEN`

### Get Statistics
**Method:** `GET`  
**URL:** `http://localhost:6000/api/v1/arrested/statistics`  
**Headers:** `Authorization: Bearer YOUR_TOKEN`

### Search Arrests
**Method:** `GET`  
**URL:** `http://localhost:6000/api/v1/arrested?search=theft&limit=10`  
**Headers:** `Authorization: Bearer YOUR_TOKEN`

### Get Example Format
**Method:** `GET`  
**URL:** `http://localhost:6000/api/v1/test-arrested/example`  
**Headers:** None required

---

## 🔧 **TROUBLESHOOTING**

### If you get "Invalid reference to criminal record or arresting officer":
- ✅ **SOLVED**: Don't include `criminal_record_id` in your request
- ✅ **SOLVED**: Don't include `arresting_officer_id` in your request

### If you get "Access denied":
- Make sure you included the `Authorization: Bearer TOKEN` header
- Make sure your token is valid (login again if needed)

### If you get "Bad Request":
- Check that you included `fullname` and `crime_type` (required)
- Check that your JSON syntax is correct
- Make sure `Content-Type: application/json` header is set

---

## ✅ **EXPECTED SUCCESS RESPONSE**

```json
{
  "success": true,
  "message": "Arrested criminal record created successfully",
  "data": {
    "arrest_id": 1,
    "fullname": "Jean Baptiste Uwimana",
    "image_url": null,
    "crime_type": "Theft",
    "date_arrested": "2024-01-15",
    "arrest_location": "Kigali City Center",
    "id_type": "indangamuntu_yumunyarwanda",
    "id_number": "1199012345678901",
    "criminal_record_id": null,
    "arresting_officer_id": 15,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

Notice:
- ✅ `criminal_record_id` is `null` (no foreign key error)
- ✅ `arresting_officer_id` is auto-assigned (15 in this example)
- ✅ `arrest_id` is auto-generated
- ✅ Timestamps are auto-generated

---

## 🎯 **QUICK START CHECKLIST**

1. ✅ Server running on port 6000
2. ✅ Create admin user (Step 1)
3. ✅ Login to get token (Step 2)
4. ✅ Use minimal JSON format (Step 3)
5. ✅ Don't include auto-generated fields
6. ✅ Include Authorization header

**You're all set! The foreign key errors are completely fixed.** 🚀
