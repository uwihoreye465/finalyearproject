# Victim Evidence File Upload API Documentation

## Overview
The victim system now supports file uploads for evidence instead of just text descriptions. Users can upload multiple files (images, documents, videos, audio) as evidence for victim records.

## Supported File Types
- **Images**: JPEG, JPG, PNG, GIF, WebP
- **Documents**: PDF, DOC, DOCX, TXT
- **Videos**: MP4, AVI, MOV
- **Audio**: MP3, WAV, MPEG

## File Limits
- **Maximum file size**: 10MB per file
- **Maximum files per upload**: 5 files
- **Total upload size**: 50MB per request

## API Endpoints

### 1. Upload Single Evidence File
**POST** `/api/v1/victims/upload-evidence`

Upload a single evidence file.

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Body (Form Data):**
- `evidence` (file): The evidence file to upload

**Response:**
```json
{
  "success": true,
  "message": "Evidence file uploaded successfully",
  "data": {
    "filename": "evidence-1703123456789-123456789.jpg",
    "originalName": "photo.jpg",
    "fileSize": 1234567,
    "fileType": "image/jpeg",
    "fileUrl": "http://localhost:6000/uploads/evidence/evidence-1703123456789-123456789.jpg",
    "uploadedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 2. Upload Multiple Evidence Files
**POST** `/api/v1/victims/upload-multiple-evidence`

Upload multiple evidence files at once.

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Body (Form Data):**
- `evidence` (file[]): Array of evidence files to upload (max 5)

**Response:**
```json
{
  "success": true,
  "message": "3 evidence files uploaded successfully",
  "data": {
    "files": [
      {
        "filename": "evidence-1703123456789-123456789.jpg",
        "originalName": "photo1.jpg",
        "fileSize": 1234567,
        "fileType": "image/jpeg",
        "fileUrl": "http://localhost:6000/uploads/evidence/evidence-1703123456789-123456789.jpg",
        "uploadedAt": "2024-01-01T12:00:00.000Z"
      },
      {
        "filename": "evidence-1703123456790-123456790.pdf",
        "originalName": "document.pdf",
        "fileSize": 2345678,
        "fileType": "application/pdf",
        "fileUrl": "http://localhost:6000/uploads/evidence/evidence-1703123456790-123456790.pdf",
        "uploadedAt": "2024-01-01T12:00:00.000Z"
      }
    ],
    "totalFiles": 2,
    "totalSize": 3580245
  }
}
```

### 3. Get Evidence File
**GET** `/api/v1/victims/evidence/:filename`

Download/view an evidence file.

**Parameters:**
- `filename`: The filename of the evidence file

**Response:**
- File download or display (depending on file type)

### 4. Delete Evidence File
**DELETE** `/api/v1/victims/evidence/:filename`

Delete an evidence file.

**Parameters:**
- `filename`: The filename of the evidence file to delete

**Response:**
```json
{
  "success": true,
  "message": "Evidence file deleted successfully"
}
```

### 5. Create Victim Record with Evidence Files
**POST** `/api/v1/victims`

Create a new victim record with evidence files.

**Headers:**
```
Content-Type: multipart/form-data
Authorization: Bearer <token>
```

**Body (Form Data):**
- `id_type` (string): Type of ID (required)
- `id_number` (string): ID number (required)
- `address_now` (string): Current address (required)
- `phone` (string): Phone number (required)
- `victim_email` (string): Email address (optional)
- `sinner_identification` (string): Identification of the perpetrator (required)
- `crime_type` (string): Type of crime (required)
- `evidence_description` (string): Text description of evidence (optional)
- `date_committed` (string): Date crime was committed (required)
- `criminal_id` (string): Criminal ID (optional)
- `evidence` (file[]): Evidence files (optional, max 5)

**Response:**
```json
{
  "success": true,
  "message": "Victim record added successfully",
  "data": {
    "victim": {
      "vic_id": 123,
      "id_type": "indangamuntu_yumunyarwanda",
      "id_number": "1190000000000001",
      "address_now": "Kigali, Rwanda",
      "phone": "+250788123456",
      "victim_email": "victim@example.com",
      "sinner_identification": "John Doe",
      "crime_type": "Theft",
      "evidence": "{\"description\":\"Stolen items photos\",\"files\":[{\"filename\":\"evidence-1703123456789-123456789.jpg\",\"originalName\":\"photo.jpg\",\"fileSize\":1234567,\"fileType\":\"image/jpeg\",\"fileUrl\":\"http://localhost:6000/uploads/evidence/evidence-1703123456789-123456789.jpg\"}],\"uploadedAt\":\"2024-01-01T12:00:00.000Z\"}",
      "date_committed": "2024-01-01",
      "criminal_id": null,
      "created_at": "2024-01-01T12:00:00.000Z"
    },
    "evidence": {
      "files": [
        {
          "filename": "evidence-1703123456789-123456789.jpg",
          "originalName": "photo.jpg",
          "fileSize": 1234567,
          "fileType": "image/jpeg",
          "fileUrl": "http://localhost:6000/uploads/evidence/evidence-1703123456789-123456789.jpg"
        }
      ],
      "totalFiles": 1,
      "hasDescription": true
    }
  }
}
```

## Error Responses

### File Too Large
```json
{
  "success": false,
  "message": "File too large. Maximum size is 10MB per file."
}
```

### Too Many Files
```json
{
  "success": false,
  "message": "Too many files. Maximum 5 files allowed."
}
```

### Invalid File Type
```json
{
  "success": false,
  "message": "File type image/bmp is not allowed. Allowed types: images, PDF, documents, videos, audio"
}
```

### File Not Found
```json
{
  "success": false,
  "message": "Evidence file not found"
}
```

## Database Schema

The `evidence` column in the `victim` table now stores JSON data with the following structure:

```json
{
  "description": "Text description of the evidence",
  "files": [
    {
      "filename": "evidence-1703123456789-123456789.jpg",
      "originalName": "photo.jpg",
      "fileSize": 1234567,
      "fileType": "image/jpeg",
      "fileUrl": "http://localhost:6000/uploads/evidence/evidence-1703123456789-123456789.jpg",
      "uploadedAt": "2024-01-01T12:00:00.000Z"
    }
  ],
  "uploadedAt": "2024-01-01T12:00:00.000Z"
}
```

## File Storage

- Files are stored in the `uploads/evidence/` directory
- Filenames are generated with timestamp and random number for uniqueness
- Original filenames are preserved in the database
- Files are accessible via HTTP at `/uploads/evidence/{filename}`

## Security Considerations

- File type validation prevents malicious uploads
- File size limits prevent storage abuse
- Authentication required for all upload operations
- Files are served statically but access can be controlled

## Testing with Postman

1. **Set up request:**
   - Method: POST
   - URL: `http://localhost:6000/api/v1/victims/upload-evidence`
   - Headers: `Authorization: Bearer <your-token>`

2. **Set up body:**
   - Type: form-data
   - Key: `evidence` (type: File)
   - Value: Select a file from your computer

3. **Send request and check response**

## Migration Required

Before using the file upload feature, run the database migration:

```sql
-- Run this in Supabase SQL Editor
ALTER TABLE victim 
ALTER COLUMN evidence TYPE JSONB USING evidence::JSONB;

CREATE INDEX IF NOT EXISTS idx_victim_evidence ON victim USING GIN (evidence);
```

This migration converts the existing text `evidence` column to JSONB format to support structured file data.
