# 🧪 Simple Victim Evidence File Upload - Postman Testing

## 📋 Your Existing Data Structure
```json
{
  "address_now": "Nyagatare District",
  "phone": "+250788567390",
  "victim_email": "farmer@example.com",
  "sinner_identification": "Livestock thief",
  "crime_type": "Animal theft",
  "evidence": "Footprints, missing animals records",
  "date_committed": "2024-03-01",
  "criminal_id": null
}
```

## 🔧 After Migration - Evidence Structure
```json
{
  "evidence": {
    "description": "Footprints, missing animals records",
    "files": [
      {
        "filename": "evidence-1234567890-photo.jpg",
        "originalName": "photo.jpg",
        "fileSize": 1234567,
        "fileType": "image/jpeg",
        "fileUrl": "http://localhost:6000/uploads/evidence/evidence-1234567890-photo.jpg",
        "uploadedAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "uploadedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

## 🧪 Postman Tests

### 1. **Add Victim with Text Evidence**
**Method:** `POST`  
**URL:** `http://localhost:6000/api/v1/victims`  
**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "address_now": "Nyagatare District",
  "phone": "+250788567390",
  "victim_email": "farmer@example.com",
  "sinner_identification": "Livestock thief",
  "crime_type": "Animal theft",
  "evidence_description": "Footprints, missing animals records",
  "date_committed": "2024-03-01",
  "criminal_id": null
}
```

### 2. **Add Victim with File Evidence**
**Method:** `POST`  
**URL:** `http://localhost:6000/api/v1/victims`  
**Headers:**
```
Content-Type: multipart/form-data
```

**Body (form-data):**
```
address_now: Nyagatare District
phone: +250788567390
victim_email: farmer@example.com
sinner_identification: Livestock thief
crime_type: Animal theft
evidence_description: Footprints, missing animals records, photos of crime scene
date_committed: 2024-03-01
criminal_id: null
evidence: [Select file: crime_scene_photo.jpg]
evidence: [Select file: footprint_evidence.pdf]
```

### 3. **Get All Victims**
**Method:** `GET`  
**URL:** `http://localhost:6000/api/v1/victims`  
**Headers:**
```
Content-Type: application/json
```

### 4. **Get Victim by ID**
**Method:** `GET`  
**URL:** `http://localhost:6000/api/v1/victims/1`  
**Headers:**
```
Content-Type: application/json
```

### 5. **Upload Single Evidence File**
**Method:** `POST`  
**URL:** `http://localhost:6000/api/v1/victims/upload-evidence`  
**Headers:**
```
Content-Type: multipart/form-data
```

**Body (form-data):**
```
evidence: [Select file: additional_photo.jpg]
```

### 6. **Upload Multiple Evidence Files**
**Method:** `POST`  
**URL:** `http://localhost:6000/api/v1/victims/upload-multiple-evidence`  
**Headers:**
```
Content-Type: multipart/form-data
```

**Body (form-data):**
```
evidence: [Select file: video_evidence.mp4]
evidence: [Select file: audio_witness.mp3]
evidence: [Select file: document_scan.pdf]
```

### 7. **Download Evidence File**
**Method:** `GET`  
**URL:** `http://localhost:6000/api/v1/victims/evidence/evidence-1234567890-photo.jpg`  
**Headers:**
```
Content-Type: application/json
```

### 8. **Delete Evidence File**
**Method:** `DELETE`  
**URL:** `http://localhost:6000/api/v1/victims/evidence/evidence-1234567890-photo.jpg`  
**Headers:**
```
Content-Type: application/json
```

## 📁 Supported File Types
- **Images:** JPG, PNG, GIF, WebP
- **Documents:** PDF, Word, TXT
- **Videos:** MP4, AVI, MOV, MPEG
- **Audio:** MP3, WAV

## ⚠️ File Limits
- **Max file size:** 10MB per file
- **Max files per upload:** 5 files
- **Total files per victim:** No limit

## 🎯 Expected Response Format

### Success Response
```json
{
  "success": true,
  "message": "Victim added successfully",
  "data": {
    "victim": {
      "vic_id": 1,
      "address_now": "Nyagatare District",
      "phone": "+250788567390",
      "victim_email": "farmer@example.com",
      "sinner_identification": "Livestock thief",
      "crime_type": "Animal theft",
      "evidence": {
        "description": "Footprints, missing animals records, photos of crime scene",
        "files": [
          {
            "filename": "evidence-1234567890-crime_scene_photo.jpg",
            "originalName": "crime_scene_photo.jpg",
            "fileSize": 1234567,
            "fileType": "image/jpeg",
            "fileUrl": "http://localhost:6000/uploads/evidence/evidence-1234567890-crime_scene_photo.jpg",
            "uploadedAt": "2024-01-01T12:00:00.000Z"
          }
        ],
        "uploadedAt": "2024-01-01T12:00:00.000Z"
      },
      "date_committed": "2024-03-01",
      "criminal_id": null,
      "created_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Invalid file type. Only images, documents, videos, and audio files are allowed."
}
```

## 🚀 Quick Start

1. **Run the migration:** `SIMPLE_VICTIM_EVIDENCE_MIGRATION.sql`
2. **Start server:** `npm start`
3. **Test with Postman:** Use the tests above
4. **Upload files:** Test with real image/document files

## 📝 Notes

- **No new columns added** - uses existing `evidence` column
- **Backward compatible** - existing text evidence is preserved
- **File storage** - Files stored in `uploads/evidence/` directory
- **Database storage** - File metadata stored as JSONB in `evidence` column
- **File access** - Direct URLs for file downloads
