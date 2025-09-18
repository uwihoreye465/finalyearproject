# 🚀 FIXED API EXAMPLES - All Issues Resolved

## ✅ **FIXES IMPLEMENTED:**

1. **✅ Image URL Fixed**: Now accepts `image_url` from request body
2. **✅ Criminal Record Linking Fixed**: Now accepts `criminal_record_id` from request body  
3. **✅ Victim ID Generation Fixed**: Now creates victims automatically from `victim_info`

---

## 📝 **CORRECT REQUEST FORMATS**

### **1. Arrested Criminal (FIXED)**

**POST** `http://localhost:6000/api/v1/arrested`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (WITH IMAGE URL):**
```json
{
  "fullname": "Test Criminal",
  "crime_type": "Theft",
  "date_arrested": "2024-01-14",
  "arrest_location": "Kigali",
  "id_type": "passport",
  "id_number": "MA827364555",
  "image_url": "https://your-supabase-url.com/criminal-images/filename.jpg",
  "criminal_record_id": 1
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Arrested criminal record created successfully",
  "data": {
    "arrest_id": 8,
    "fullname": "Test Criminal",
    "image_url": "https://your-supabase-url.com/criminal-images/filename.jpg", // ✅ NOT NULL
    "crime_type": "Theft",
    "date_arrested": "2024-01-14",
    "arrest_location": "Kigali",
    "id_type": "passport",
    "id_number": "MA827364555",
    "criminal_record_id": 1, // ✅ NOT NULL if provided
    "arresting_officer_id": 15,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

### **2. Criminal Record with Victim (FIXED)**

**POST** `http://localhost:6000/api/v1/criminal-records`

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body (WITH VICTIM CREATION):**
```json
{
  "id_type": "indangamuntu_yumunyarwanda",
  "id_number": "1199012345678901",
  "phone": "+250784999231",
  "address_now": "Kigali, Kicukiro District",
  "crime_type": "Drug Possession",
  "description": "Caught with illegal substances",
  "date_committed": "2024-01-19T22:00:00.000Z",
  "victim_info": {
    "first_name": "Marie",
    "last_name": "Uwimana",
    "gender": "female",
    "phone": "+250788123456",
    "district": "Kigali",
    "sector": "Kimisagara",
    "id_type": "indangamuntu_yumunyarwanda",
    "id_number": "1198812345678901"
  }
}
```

**Expected Result:**
```json
{
  "success": true,
  "message": "Criminal record created successfully",
  "data": {
    "cri_id": 5,
    "id_type": "indangamuntu_yumunyarwanda",
    "id_number": "1199012345678901",
    "crime_type": "Drug Possession",
    "description": "Caught with illegal substances",
    "date_committed": "2024-01-19T22:00:00.000Z",
    "vic_id": 3, // ✅ NOT NULL - Auto-generated from victim_info
    "registered_by": 15,
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## 🔧 **WHAT WAS FIXED:**

### Issue 1: Image URL Problem ✅
**Before:** `"image_url": null` (always null)
**After:** `"image_url": "https://your-url.com/image.jpg"` (uses provided value)

**Root Cause:** Controller was setting `image_url = null` instead of reading from `req.body`
**Fix:** Now reads `image_url` from request body and uses it

### Issue 2: Criminal Record ID Problem ✅
**Before:** `"criminal_record_id": null` (always null)
**After:** `"criminal_record_id": 1` (uses provided value)

**Root Cause:** Controller was hardcoded to `null`
**Fix:** Now accepts `criminal_record_id` from request body

### Issue 3: Victim ID Problem ✅
**Before:** `"vic_id": null` (always null)
**After:** `"vic_id": 3` (auto-generated from victim_info)

**Root Cause:** No mechanism to create victims automatically
**Fix:** Added `victim_info` parameter that creates victim record first, then uses the generated `vic_id`

---

## 🧪 **TEST EXAMPLES**

### Test 1: Arrested with Image URL
```bash
curl -X POST http://localhost:6000/api/v1/arrested \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fullname": "Test Criminal With Image",
    "crime_type": "Theft",
    "image_url": "https://example.com/criminal.jpg"
  }'
```

### Test 2: Criminal Record with Automatic Victim Creation
```bash
curl -X POST http://localhost:6000/api/v1/criminal-records \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "id_type": "indangamuntu_yumunyarwanda",
    "id_number": "1199012345678901",
    "crime_type": "Assault",
    "description": "Physical assault case",
    "victim_info": {
      "first_name": "John",
      "last_name": "Victim",
      "phone": "+250788123456"
    }
  }'
```

### Test 3: Linking Arrested to Criminal Record
```bash
curl -X POST http://localhost:6000/api/v1/arrested \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fullname": "Criminal Name",
    "crime_type": "Theft",
    "criminal_record_id": 5,
    "image_url": "https://example.com/mugshot.jpg"
  }'
```

---

## 📋 **FIELD REFERENCE**

### Arrested Criminal Fields:
- ✅ `fullname` (required)
- ✅ `crime_type` (required)  
- ✅ `image_url` (optional) - **NOW WORKS**
- ✅ `criminal_record_id` (optional) - **NOW WORKS**
- ✅ `date_arrested` (optional)
- ✅ `arrest_location` (optional)
- ✅ `id_type` (optional)
- ✅ `id_number` (optional)

### Criminal Record Fields:
- ✅ `id_type` (required)
- ✅ `id_number` (required)
- ✅ `crime_type` (required)
- ✅ `victim_info` (optional) - **NEW FEATURE**
- ✅ `vic_id` (optional) - **NOW AUTO-GENERATED**
- ✅ `description` (optional)
- ✅ `date_committed` (optional)

### Victim Info Fields (for auto-creation):
- ✅ `first_name` (recommended)
- ✅ `last_name` (recommended)
- ✅ `gender` (optional)
- ✅ `phone` (optional)
- ✅ `district` (optional)
- ✅ `sector` (optional)
- ✅ `id_type` (optional)
- ✅ `id_number` (optional)

---

## 🎉 **ALL ISSUES RESOLVED!**

Your API now properly handles:
- ✅ Image URLs from request body
- ✅ Criminal record linking
- ✅ Automatic victim creation and linking
- ✅ No more null values where they shouldn't be

**Test your API with the examples above!** 🚀
