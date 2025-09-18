# 🧪 Victim Evidence File Upload - Postman Testing Guide

## 📋 Prerequisites
- Server running on `http://localhost:6000`
- Postman installed
- Test files ready (images, documents, videos)

## 🔧 Environment Setup

### 1. Create Postman Environment
Create a new environment with these variables:
```
BASE_URL: http://localhost:6000
API_VERSION: v1
```

## 📁 Test Collection Structure

### 1. **Add Victim with Text Evidence Only**
**Method:** `POST`  
**URL:** `{{BASE_URL}}/api/{{API_VERSION}}/victims`  
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

**Expected Response:**
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
        "description": "Footprints, missing animals records",
        "files": [],
        "uploadedAt": "2024-01-01T12:00:00.000Z"
      },
      "date_committed": "2024-03-01",
      "criminal_id": null,
      "created_at": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### 2. **Add Victim with File Evidence**
**Method:** `POST`  
**URL:** `{{BASE_URL}}/api/{{API_VERSION}}/victims`  
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
evidence: [Select file: witness_statement.docx]
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Victim added successfully",
  "data": {
    "victim": {
      "vic_id": 2,
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
          },
          {
            "filename": "evidence-1234567891-footprint_evidence.pdf",
            "originalName": "footprint_evidence.pdf",
            "fileSize": 2345678,
            "fileType": "application/pdf",
            "fileUrl": "http://localhost:6000/uploads/evidence/evidence-1234567891-footprint_evidence.pdf",
            "uploadedAt": "2024-01-01T12:00:00.000Z"
          },
          {
            "filename": "evidence-1234567892-witness_statement.docx",
            "originalName": "witness_statement.docx",
            "fileSize": 3456789,
            "fileType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "fileUrl": "http://localhost:6000/uploads/evidence/evidence-1234567892-witness_statement.docx",
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

### 3. **Upload Single Evidence File**
**Method:** `POST`  
**URL:** `{{BASE_URL}}/api/{{API_VERSION}}/victims/upload-evidence`  
**Headers:**
```
Content-Type: multipart/form-data
```

**Body (form-data):**
```
evidence: [Select file: additional_photo.jpg]
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Evidence file uploaded successfully",
  "data": {
    "file": {
      "filename": "evidence-1234567893-additional_photo.jpg",
      "originalName": "additional_photo.jpg",
      "fileSize": 1234567,
      "fileType": "image/jpeg",
      "fileUrl": "http://localhost:6000/uploads/evidence/evidence-1234567893-additional_photo.jpg",
      "uploadedAt": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

### 4. **Upload Multiple Evidence Files**
**Method:** `POST`  
**URL:** `{{BASE_URL}}/api/{{API_VERSION}}/victims/upload-multiple-evidence`  
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

**Expected Response:**
```json
{
  "success": true,
  "message": "Evidence files uploaded successfully",
  "data": {
    "files": [
      {
        "filename": "evidence-1234567894-video_evidence.mp4",
        "originalName": "video_evidence.mp4",
        "fileSize": 12345678,
        "fileType": "video/mp4",
        "fileUrl": "http://localhost:6000/uploads/evidence/evidence-1234567894-video_evidence.mp4",
        "uploadedAt": "2024-01-01T12:00:00.000Z"
      },
      {
        "filename": "evidence-1234567895-audio_witness.mp3",
        "originalName": "audio_witness.mp3",
        "fileSize": 2345678,
        "fileType": "audio/mpeg",
        "fileUrl": "http://localhost:6000/uploads/evidence/evidence-1234567895-audio_witness.mp3",
        "uploadedAt": "2024-01-01T12:00:00.000Z"
      },
      {
        "filename": "evidence-1234567896-document_scan.pdf",
        "originalName": "document_scan.pdf",
        "fileSize": 3456789,
        "fileType": "application/pdf",
        "fileUrl": "http://localhost:6000/uploads/evidence/evidence-1234567896-document_scan.pdf",
        "uploadedAt": "2024-01-01T12:00:00.000Z"
      }
    ]
  }
}
```

### 5. **Get All Victims**
**Method:** `GET`  
**URL:** `{{BASE_URL}}/api/{{API_VERSION}}/victims`  
**Headers:**
```
Content-Type: application/json
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Victims retrieved successfully",
  "data": {
    "victims": [
      {
        "vic_id": 1,
        "address_now": "Nyagatare District",
        "phone": "+250788567390",
        "victim_email": "farmer@example.com",
        "sinner_identification": "Livestock thief",
        "crime_type": "Animal theft",
        "evidence": {
          "description": "Footprints, missing animals records",
          "files": [],
          "uploadedAt": "2024-01-01T12:00:00.000Z"
        },
        "date_committed": "2024-03-01",
        "criminal_id": null,
        "created_at": "2024-01-01T12:00:00.000Z"
      },
      {
        "vic_id": 2,
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
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 2,
      "itemsPerPage": 10
    }
  }
}
```

### 6. **Get Victim by ID**
**Method:** `GET`  
**URL:** `{{BASE_URL}}/api/{{API_VERSION}}/victims/2`  
**Headers:**
```
Content-Type: application/json
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Victim retrieved successfully",
  "data": {
    "victim": {
      "vic_id": 2,
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

### 7. **Download Evidence File**
**Method:** `GET`  
**URL:** `{{BASE_URL}}/api/{{API_VERSION}}/victims/evidence/evidence-1234567890-crime_scene_photo.jpg`  
**Headers:**
```
Content-Type: application/json
```

**Expected Response:**
- File download (binary content)

### 8. **Delete Evidence File**
**Method:** `DELETE`  
**URL:** `{{BASE_URL}}/api/{{API_VERSION}}/victims/evidence/evidence-1234567890-crime_scene_photo.jpg`  
**Headers:**
```
Content-Type: application/json
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Evidence file deleted successfully"
}
```

## 🧪 Test Scenarios

### Scenario 1: Text Evidence Only
1. Create victim with text evidence
2. Verify evidence is stored as JSON with description
3. Check that files array is empty

### Scenario 2: File Evidence
1. Create victim with file uploads
2. Verify files are uploaded to server
3. Check file URLs are accessible
4. Verify file metadata is stored correctly

### Scenario 3: Mixed Evidence
1. Create victim with both text and files
2. Verify both are stored in evidence JSON
3. Test file download functionality

### Scenario 4: File Management
1. Upload additional files
2. Download files
3. Delete files
4. Verify file operations work correctly

## 📁 Supported File Types

### Images
- JPEG (.jpg, .jpeg)
- PNG (.png)
- GIF (.gif)
- WebP (.webp)

### Documents
- PDF (.pdf)
- Word (.doc, .docx)
- Text (.txt)

### Videos
- MP4 (.mp4)
- AVI (.avi)
- MOV (.mov)
- MPEG (.mpeg)

### Audio
- MP3 (.mp3)
- WAV (.wav)

## ⚠️ Error Testing

### 1. Invalid File Type
**Method:** `POST`  
**URL:** `{{BASE_URL}}/api/{{API_VERSION}}/victims/upload-evidence`  
**Body:** Upload a .exe file

**Expected Response:**
```json
{
  "success": false,
  "message": "Invalid file type. Only images, documents, videos, and audio files are allowed."
}
```

### 2. File Too Large
**Method:** `POST`  
**URL:** `{{BASE_URL}}/api/{{API_VERSION}}/victims/upload-evidence`  
**Body:** Upload a file larger than 10MB

**Expected Response:**
```json
{
  "success": false,
  "message": "File size too large. Max 10MB allowed."
}
```

### 3. Too Many Files
**Method:** `POST`  
**URL:** `{{BASE_URL}}/api/{{API_VERSION}}/victims/upload-multiple-evidence`  
**Body:** Upload more than 5 files

**Expected Response:**
```json
{
  "success": false,
  "message": "Too many files uploaded. Max 5 files allowed."
}
```

## 🎯 Success Criteria

✅ **Text Evidence:** Stored as JSON with description  
✅ **File Evidence:** Uploaded to server and metadata stored  
✅ **File Access:** Files accessible via URLs  
✅ **File Management:** Upload, download, delete operations work  
✅ **Error Handling:** Proper error messages for invalid inputs  
✅ **Data Integrity:** Evidence structure consistent across all operations  

## 📝 Notes

- All file uploads are stored in `uploads/evidence/` directory
- File names are unique with timestamp and random suffix
- Maximum file size: 10MB per file
- Maximum files per upload: 5 files
- Supported file types are validated on both client and server
- Evidence data is stored as JSONB in PostgreSQL for efficient querying
