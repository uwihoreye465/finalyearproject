# Postman Testing Guide for Image Upload

## 🚀 Server Status
✅ Server is running on port 3000 (PID: 27280)

## 📋 Test Cases

### Test 1: Upload Image with Form Data (Multipart)

**Method:** `POST`
**URL:** `http://localhost:6000/api/v1/arrested/`
**Headers:** 
- `Content-Type`: `multipart/form-data` (Postman will set this automatically)

**Body (form-data):**
```
Key                 | Type    | Value
--------------------|---------|------------------
fullname           | Text    | John Doe
crime_type         | Text    | Theft
date_arrested      | Text    | 2024-01-15
arrest_location    | Text    | Kigali, Rwanda
id_type            | Text    | indangamuntu_yumunyarwanda
id_number          | Text    | 1234567890123456
image              | File    | [Select an image file]
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Arrested criminal record created successfully",
  "data": {
    "arrest_id": 123,
    "fullname": "John Doe",
    "image_url": "/uploads/arrested/images/filename.jpg",
    "crime_type": "Theft",
    "date_arrested": "2024-01-15",
    "arrest_location": "Kigali, Rwanda",
    "id_type": "indangamuntu_yumunyarwanda",
    "id_number": "1234567890123456",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Test 2: Upload Without Image (JSON)

**Method:** `POST`
**URL:** `http://localhost:6000/api/v1/arrested/`
**Headers:**
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "fullname": "Jane Smith",
  "crime_type": "Fraud",
  "date_arrested": "2024-01-16",
  "arrest_location": "Huye, Rwanda",
  "id_type": "passport",
  "id_number": "P123456789"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Arrested criminal record created successfully",
  "data": {
    "arrest_id": 124,
    "fullname": "Jane Smith",
    "image_url": null,
    "crime_type": "Fraud",
    "date_arrested": "2024-01-16",
    "arrest_location": "Huye, Rwanda",
    "id_type": "passport",
    "id_number": "P123456789",
    "created_at": "2024-01-16T10:30:00.000Z"
  }
}
```

### Test 3: Test Blob URL Handling (JSON)

**Method:** `POST`
**URL:** `http://localhost:6000/api/v1/arrested/`
**Headers:**
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "fullname": "Bob Wilson",
  "crime_type": "Assault",
  "date_arrested": "2024-01-17",
  "arrest_location": "Musanze, Rwanda",
  "id_type": "indangamuntu_yumunyarwanda",
  "id_number": "9876543210987654",
  "image_url": "blob:http://localhost:62706/8d1380ae-6e9b-40f1-898f-d03353668c7b"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Arrested criminal record created successfully",
  "data": {
    "arrest_id": 125,
    "fullname": "Bob Wilson",
    "image_url": null,
    "crime_type": "Assault",
    "date_arrested": "2024-01-17",
    "arrest_location": "Musanze, Rwanda",
    "id_type": "indangamuntu_yumunyarwanda",
    "id_number": "9876543210987654",
    "created_at": "2024-01-17T10:30:00.000Z"
  }
}
```

### Test 4: Test Placeholder URL Handling (JSON)

**Method:** `POST`
**URL:** `http://localhost:6000/api/v1/arrested/`
**Headers:**
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "fullname": "Alice Johnson",
  "crime_type": "Robbery",
  "date_arrested": "2024-01-18",
  "arrest_location": "Rubavu, Rwanda",
  "id_type": "indangamuntu_yumunyarwanda",
  "id_number": "1111222233334444",
  "image_url": "https://via.placeholder.com/300x200?text=Image+Upload+Failed"
}
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Arrested criminal record created successfully",
  "data": {
    "arrest_id": 126,
    "fullname": "Alice Johnson",
    "image_url": null,
    "crime_type": "Robbery",
    "date_arrested": "2024-01-18",
    "arrest_location": "Rubavu, Rwanda",
    "id_type": "indangamuntu_yumunyarwanda",
    "id_number": "1111222233334444",
    "created_at": "2024-01-18T10:30:00.000Z"
  }
}
```

## 🔍 What to Check in Server Console

When you run these tests, you should see detailed logs like:

```
🚀 ===== NEW ARRESTED RECORD REQUEST =====
📋 Request Method: POST
📋 Request URL: /api/v1/arrested/
📋 Content-Type: multipart/form-data
📋 Headers: { ... }
📋 Body: { ... }
📋 File: {
  fieldname: 'image',
  originalname: 'test-image.jpg',
  filename: '1705123456789-test-image.jpg',
  mimetype: 'image/jpeg',
  size: 12345
}
📝 Processed requestData: { ... }
📸 Image uploaded successfully: /uploads/arrested/images/1705123456789-test-image.jpg
🔍 Debug - finalImageUrl: /uploads/arrested/images/1705123456789-test-image.jpg
🔍 Debug - finalImageUrl type: string
🔍 Debug - arrestData.image_url: /uploads/arrested/images/1705123456789-test-image.jpg
🔍 Debug - arrestData.image_url type: string
```

## 📁 File Structure Check

After successful image upload, check if the file was created:
- **Path:** `uploads/arrested/images/`
- **Filename format:** `{timestamp}-{originalname}`

## 🚨 Error Cases to Test

### Test 5: Missing Required Fields

**Method:** `POST`
**URL:** `http://localhost:6000/api/v1/arrested/`
**Body (raw JSON):**
```json
{
  "crime_type": "Theft"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Full name and crime type are required fields"
}
```

### Test 6: Invalid ID Type

**Method:** `POST`
**URL:** `http://localhost:6000/api/v1/arrested/`
**Body (raw JSON):**
```json
{
  "fullname": "Test User",
  "crime_type": "Theft",
  "id_type": "invalid_type"
}
```

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid ID type. Must be one of: indangamuntu_yumunyarwanda, indangamuntu_yumunyamahanga, indangampunzi, passport, unknown"
}
```

## 📊 Database Verification

After each test, you can verify the database:

1. **Check if record was created:**
   ```sql
   SELECT arrest_id, fullname, image_url, crime_type, created_at 
   FROM criminals_arrested 
   ORDER BY created_at DESC 
   LIMIT 5;
   ```

2. **Check image_url values:**
   ```sql
   SELECT arrest_id, fullname, image_url, 
          CASE 
            WHEN image_url IS NULL THEN 'NULL'
            WHEN image_url = 'NULL' THEN 'STRING_NULL'
            ELSE 'HAS_VALUE'
          END as image_status
   FROM criminals_arrested 
   ORDER BY created_at DESC 
   LIMIT 10;
   ```

## 🎯 Success Criteria

✅ **Test 1:** Image file uploaded and saved to disk, `image_url` contains file path
✅ **Test 2:** Record created with `image_url` as `null`
✅ **Test 3:** Blob URL detected and ignored, `image_url` saved as `null`
✅ **Test 4:** Placeholder URL ignored, `image_url` saved as `null`
✅ **Test 5:** Proper validation error for missing fields
✅ **Test 6:** Proper validation error for invalid ID type

## 🔧 Troubleshooting

If tests fail:

1. **Check server logs** for detailed error messages
2. **Verify uploads directory** exists: `uploads/arrested/images/`
3. **Check file permissions** for the uploads directory
4. **Verify multer configuration** in your routes
5. **Check database connection** and table structure

## 📝 Next Steps

After successful testing:
1. Update Flutter app to use proper image upload methods
2. Remove placeholder URL fallbacks from Flutter
3. Test end-to-end flow from Flutter to backend
