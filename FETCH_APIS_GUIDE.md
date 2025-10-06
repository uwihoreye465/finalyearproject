# 📡 API Fetch Guide for Arrested Records

## 🎉 **Success! Your Image Upload is Working**

✅ **Image uploaded:** `/uploads/arrested/images/arrested_img_1759761793062_li9nwc.png`
✅ **Record created:** `arrest_id: 68`
✅ **All data saved correctly**

## 📋 **Available Fetch APIs**

### **1. Get All Arrested Records**

**Method:** `GET`
**URL:** `http://localhost:6000/api/v1/arrested/`
**Headers:** None required (public endpoint)

**Query Parameters (optional):**
```
?page=1&limit=10&search=john&crime_type=theft&date_from=2024-01-01&date_to=2024-12-31
```

**Example Request:**
```
GET http://localhost:6000/api/v1/arrested/?page=1&limit=5&search=sdfdfsfds
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Found 1 arrest records",
  "data": {
    "records": [
      {
        "arrest_id": 68,
        "fullname": "sdfdfsfds",
        "image_url": "/uploads/arrested/images/arrested_img_1759761793062_li9nwc.png",
        "crime_type": "sdfsdffsfds",
        "date_arrested": "2024-01-14T22:00:00.000Z",
        "arrest_location": "sfssdfdfdsd",
        "id_type": "indangamuntu_yumunyarwanda",
        "id_number": "1190000000000001",
        "criminal_record_id": null,
        "arresting_officer_id": 15,
        "created_at": "2025-10-06T12:43:13.497Z",
        "updated_at": "2025-10-06T12:43:13.497Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 5
    }
  }
}
```

### **2. Get Single Arrested Record by ID**

**Method:** `GET`
**URL:** `http://localhost:6000/api/v1/arrested/68`
**Headers:** None required (public endpoint)

**Expected Response:**
```json
{
  "success": true,
  "message": "Arrest record retrieved successfully",
  "data": {
    "arrest_id": 68,
    "fullname": "sdfdfsfds",
    "image_url": "/uploads/arrested/images/arrested_img_1759761793062_li9nwc.png",
    "crime_type": "sdfsdffsfds",
    "date_arrested": "2024-01-14T22:00:00.000Z",
    "arrest_location": "sfssdfdfdsd",
    "id_type": "indangamuntu_yumunyarwanda",
    "id_number": "1190000000000001",
    "criminal_record_id": null,
    "arresting_officer_id": 15,
    "created_at": "2025-10-06T12:43:13.497Z",
    "updated_at": "2025-10-06T12:43:13.497Z"
  }
}
```

### **3. Get Statistics**

**Method:** `GET`
**URL:** `http://localhost:6000/api/v1/arrested/statistics`
**Headers:** None required (public endpoint)

**Expected Response:**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "total_arrests": 68,
    "arrests_by_crime_type": {
      "theft": 15,
      "fraud": 8,
      "assault": 12,
      "robbery": 5
    },
    "arrests_by_month": {
      "2024-01": 10,
      "2024-02": 8,
      "2024-03": 12
    },
    "arrests_by_location": {
      "Kigali": 25,
      "Huye": 8,
      "Musanze": 12
    }
  }
}
```

### **4. Download Arrested Person Image**

**Method:** `GET`
**URL:** `http://localhost:6000/api/v1/arrested/68/download/image`
**Headers:** None required (public endpoint)

**Response:** Downloads the image file directly

### **5. Get Image Info (without downloading)**

**Method:** `GET`
**URL:** `http://localhost:6000/api/v1/arrested/68/debug/image`
**Headers:** None required (public endpoint)

**Expected Response:**
```json
{
  "success": true,
  "debug": {
    "arrestId": 68,
    "fullname": "sdfdfsfds",
    "image_url": "/uploads/arrested/images/arrested_img_1759761793062_li9nwc.png",
    "image_url_type": "string",
    "isBuffer": false,
    "image_url_length": 65,
    "image_url_preview": "/uploads/arrested/images/arrested_img_1759761793062_li9nwc.png"
  }
}
```

## 🧪 **Test in Postman**

### **Test 1: Get All Records**
1. **Method:** `GET`
2. **URL:** `http://localhost:6000/api/v1/arrested/`
3. **Send** - Should return your created record

### **Test 2: Get Specific Record**
1. **Method:** `GET`
2. **URL:** `http://localhost:6000/api/v1/arrested/68`
3. **Send** - Should return your specific record

### **Test 3: Search Records**
1. **Method:** `GET`
2. **URL:** `http://localhost:6000/api/v1/arrested/?search=sdfdfsfds`
3. **Send** - Should find your record by name

### **Test 4: Get Statistics**
1. **Method:** `GET`
2. **URL:** `http://localhost:6000/api/v1/arrested/statistics`
3. **Send** - Should return statistics

### **Test 5: Download Image**
1. **Method:** `GET`
2. **URL:** `http://localhost:6000/api/v1/arrested/68/download/image`
3. **Send** - Should download the image file

## 🔍 **Query Parameters for GetAllArrested**

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `page` | number | Page number (default: 1) | `?page=2` |
| `limit` | number | Records per page (max: 100) | `?limit=20` |
| `search` | string | Search by name or crime type | `?search=john` |
| `crime_type` | string | Filter by crime type | `?crime_type=theft` |
| `date_from` | date | Filter from date | `?date_from=2024-01-01` |
| `date_to` | date | Filter to date | `?date_to=2024-12-31` |

## 📱 **For Flutter App**

Use these endpoints in your Flutter app:

```dart
// Get all records
final response = await http.get(
  Uri.parse('http://localhost:6000/api/v1/arrested/'),
);

// Get specific record
final response = await http.get(
  Uri.parse('http://localhost:6000/api/v1/arrested/68'),
);

// Search records
final response = await http.get(
  Uri.parse('http://localhost:6000/api/v1/arrested/?search=sdfdfsfds'),
);

// Get statistics
final response = await http.get(
  Uri.parse('http://localhost:6000/api/v1/arrested/statistics'),
);
```

## 🎯 **Next Steps**

1. **Test all fetch endpoints** in Postman
2. **Verify image downloads** work correctly
3. **Test search functionality** with different parameters
4. **Integrate these APIs** into your Flutter app
5. **Test pagination** with multiple records

**All your fetch APIs are ready! Start testing with the "Get All Records" endpoint.** 🚀
