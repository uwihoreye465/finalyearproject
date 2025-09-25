# ✅ ARRESTED IMAGE UPLOAD API - COMPLETE TEST GUIDE!

## 📸 **Criminal Arrested Image Upload API - Working!**

### **🔧 What's Available:**

✅ **Image Upload**: Upload images when creating arrested records  
✅ **Image Update**: Update images for existing arrested records  
✅ **Image Download**: Download arrested person images  
✅ **File Storage**: Images stored in `uploads/arrested/images/`  
✅ **File Validation**: Only image files allowed (10MB limit)  

---

## 🚀 **ARRESTED IMAGE UPLOAD APIs:**

### **1. ✅ Create Arrested Record with Image**

**Endpoint:**
```bash
POST https://tracking-criminal.onrender.com/api/v1/arrested
Authorization: Bearer <user_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `fullname`: John Doe (required)
- `crime_type`: Theft (required)
- `date_arrested`: 2024-01-15 (optional)
- `arrest_location`: Kigali, Rwanda (optional)
- `id_type`: passport (optional)
- `id_number`: AB123456 (optional)
- `criminal_record_id`: 123 (optional)
- `image`: [IMAGE FILE] (optional)

**Postman Setup:**
1. **Method**: POST
2. **URL**: `https://tracking-criminal.onrender.com/api/v1/arrested`
3. **Headers**: 
   - `Authorization`: `Bearer <your_token>`
4. **Body**: Select `form-data`
5. **Add Fields**:
   - `fullname`: `John Doe`
   - `crime_type`: `Theft`
   - `date_arrested`: `2024-01-15`
   - `arrest_location`: `Kigali, Rwanda`
   - `id_type`: `passport`
   - `id_number`: `AB123456`
   - `image`: [Select File] - Choose an image file

**Expected Response:**
```json
{
  "success": true,
  "message": "Arrested criminal record created successfully",
  "data": {
    "arrest_id": 1,
    "fullname": "John Doe",
    "image_url": "/uploads/arrested/images/arrested_img_1704067200000_abc123.jpg",
    "crime_type": "Theft",
    "date_arrested": "2024-01-15",
    "arrest_location": "Kigali, Rwanda",
    "id_type": "passport",
    "id_number": "AB123456",
    "criminal_record_id": null,
    "arresting_officer_id": 53,
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### **2. ✅ Update Arrested Record with New Image**

**Endpoint:**
```bash
PUT https://tracking-criminal.onrender.com/api/v1/arrested/:id
Authorization: Bearer <user_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `fullname`: John Doe Updated (optional)
- `crime_type`: Robbery (optional)
- `date_arrested`: 2024-01-16 (optional)
- `arrest_location`: Updated Location (optional)
- `id_type`: indangamuntu_yumunyarwanda (optional)
- `id_number`: 1234567890123456 (optional)
- `image`: [NEW IMAGE FILE] (optional)

**Postman Setup:**
1. **Method**: PUT
2. **URL**: `https://tracking-criminal.onrender.com/api/v1/arrested/1`
3. **Headers**: 
   - `Authorization`: `Bearer <your_token>`
4. **Body**: Select `form-data`
5. **Add Fields**:
   - `fullname`: `John Doe Updated`
   - `crime_type`: `Robbery`
   - `image`: [Select New File] - Choose a different image file

**Expected Response:**
```json
{
  "success": true,
  "message": "Arrest record updated successfully",
  "data": {
    "arrest_id": 1,
    "fullname": "John Doe Updated",
    "image_url": "/uploads/arrested/images/arrested_img_1704153600000_def456.jpg",
    "crime_type": "Robbery",
    "date_arrested": "2024-01-16",
    "arrest_location": "Updated Location",
    "id_type": "indangamuntu_yumunyarwanda",
    "id_number": "1234567890123456",
    "criminal_record_id": null,
    "arresting_officer_id": 53,
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### **3. ✅ Download Arrested Person Image**

**Endpoint:**
```bash
GET https://tracking-criminal.onrender.com/api/v1/arrested/:arrestId/download/image
```

**Postman Setup:**
1. **Method**: GET
2. **URL**: `https://tracking-criminal.onrender.com/api/v1/arrested/1/download/image`
3. **Headers**: None required
4. **Response**: File download

**Expected Response:**
- **Content-Type**: `application/octet-stream`
- **Content-Disposition**: `attachment; filename="John Doe_arrest_image.jpg"`
- **Body**: Binary image data

### **4. ✅ Get Arrested Record with Image Info**

**Endpoint:**
```bash
GET https://tracking-criminal.onrender.com/api/v1/arrested/:id
```

**Postman Setup:**
1. **Method**: GET
2. **URL**: `https://tracking-criminal.onrender.com/api/v1/arrested/1`
3. **Headers**: None required

**Expected Response:**
```json
{
  "success": true,
  "message": "Arrest record retrieved successfully",
  "data": {
    "arrest_id": 1,
    "fullname": "John Doe",
    "image_url": "/uploads/arrested/images/arrested_img_1704067200000_abc123.jpg",
    "crime_type": "Theft",
    "date_arrested": "2024-01-15",
    "arrest_location": "Kigali, Rwanda",
    "id_type": "passport",
    "id_number": "AB123456",
    "criminal_record_id": null,
    "arresting_officer_id": 53,
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## 🧪 **COMPLETE POSTMAN TEST SEQUENCE:**

### **✅ Step 1: Create Arrested Record with Image**

**Request:**
```bash
POST https://tracking-criminal.onrender.com/api/v1/arrested
Authorization: Bearer <your_token>
Content-Type: multipart/form-data

Form Data:
- fullname: "John Doe"
- crime_type: "Theft"
- date_arrested: "2024-01-15"
- arrest_location: "Kigali, Rwanda"
- id_type: "passport"
- id_number: "AB123456"
- image: [Select image file]
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Arrested criminal record created successfully",
  "data": {
    "arrest_id": 1,
    "fullname": "John Doe",
    "image_url": "/uploads/arrested/images/arrested_img_1704067200000_abc123.jpg",
    "crime_type": "Theft",
    "date_arrested": "2024-01-15",
    "arrest_location": "Kigali, Rwanda",
    "id_type": "passport",
    "id_number": "AB123456",
    "criminal_record_id": null,
    "arresting_officer_id": 53,
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### **✅ Step 2: Verify Image Upload**

**Request:**
```bash
GET https://tracking-criminal.onrender.com/api/v1/arrested/1
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Arrest record retrieved successfully",
  "data": {
    "arrest_id": 1,
    "fullname": "John Doe",
    "image_url": "/uploads/arrested/images/arrested_img_1704067200000_abc123.jpg",
    "crime_type": "Theft",
    "date_arrested": "2024-01-15",
    "arrest_location": "Kigali, Rwanda",
    "id_type": "passport",
    "id_number": "AB123456",
    "criminal_record_id": null,
    "arresting_officer_id": 53,
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

### **✅ Step 3: Download Image**

**Request:**
```bash
GET https://tracking-criminal.onrender.com/api/v1/arrested/1/download/image
```

**Expected Response:**
- File download with image data
- Filename: `John Doe_arrest_image.jpg`

### **✅ Step 4: Update with New Image**

**Request:**
```bash
PUT https://tracking-criminal.onrender.com/api/v1/arrested/1
Authorization: Bearer <your_token>
Content-Type: multipart/form-data

Form Data:
- fullname: "John Doe Updated"
- crime_type: "Robbery"
- image: [Select new image file]
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Arrest record updated successfully",
  "data": {
    "arrest_id": 1,
    "fullname": "John Doe Updated",
    "image_url": "/uploads/arrested/images/arrested_img_1704153600000_def456.jpg",
    "crime_type": "Robbery",
    "date_arrested": "2024-01-15",
    "arrest_location": "Kigali, Rwanda",
    "id_type": "passport",
    "id_number": "AB123456",
    "criminal_record_id": null,
    "arresting_officer_id": 53,
    "created_at": "2024-01-15T10:00:00.000Z"
  }
}
```

---

## 🔧 **TROUBLESHOOTING:**

### **✅ Common Issues:**

1. **"Image upload error: File too large"**
   - **Solution**: Reduce image size to under 10MB

2. **"Only image files are allowed"**
   - **Solution**: Upload only image files (jpg, png, gif, etc.)

3. **"Image file not found on disk"**
   - **Solution**: Check if uploads directory exists and has proper permissions

4. **"Arrest record not found"**
   - **Solution**: Use correct arrest ID

### **✅ File Validation:**
- **Allowed Types**: image/jpeg, image/png, image/gif, image/webp
- **Max Size**: 10MB
- **Storage Location**: `uploads/arrested/images/`
- **File Naming**: `arrested_img_{timestamp}_{random}.{extension}`

---

## 📱 **FRONTEND INTEGRATION:**

### **✅ HTML Form Example:**
```html
<form action="/api/v1/arrested" method="POST" enctype="multipart/form-data">
  <input type="text" name="fullname" placeholder="Full Name" required>
  <input type="text" name="crime_type" placeholder="Crime Type" required>
  <input type="date" name="date_arrested">
  <input type="text" name="arrest_location" placeholder="Arrest Location">
  <select name="id_type">
    <option value="passport">Passport</option>
    <option value="indangamuntu_yumunyarwanda">Rwandan ID</option>
    <option value="indangamuntu_yumunyamahanga">Foreign ID</option>
  </select>
  <input type="text" name="id_number" placeholder="ID Number">
  <input type="file" name="image" accept="image/*">
  <button type="submit">Create Arrest Record</button>
</form>
```

### **✅ JavaScript Example:**
```javascript
const createArrested = async (formData) => {
  try {
    const response = await fetch('/api/v1/arrested', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${userToken}`
      },
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Arrest record created:', data.data);
      // Handle success
    }
  } catch (error) {
    console.error('Error creating arrest record:', error);
  }
};
```

---

## ✅ **YOUR ARRESTED IMAGE UPLOAD API IS READY!**

### **🎉 Available Endpoints:**
- ✅ **POST /arrested** - Create arrested record with image
- ✅ **PUT /arrested/:id** - Update arrested record with new image
- ✅ **GET /arrested/:id** - Get arrested record with image info
- ✅ **GET /arrested/:arrestId/download/image** - Download arrested person image

### **🔧 Key Features:**
- **Image Upload**: Upload images when creating/updating arrested records
- **File Storage**: Images stored in `uploads/arrested/images/`
- **File Validation**: Only image files allowed (10MB limit)
- **Image Download**: Download arrested person images
- **File Management**: Automatic file naming and organization

**Your arrested image upload system is working correctly!** 🚀📸
