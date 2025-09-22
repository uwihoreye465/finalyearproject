# Victim and Criminal Record Management APIs

This document provides comprehensive APIs for managing victims and their associated criminal records, including retrieval, editing, and deletion operations.

## Base URL
```
http://localhost:6000/api/v1/victim-criminal
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

## API Endpoints

### 1. Get All Victims with Criminal Records
**GET** `/victims-with-criminal-records`

Retrieves all victims with their associated criminal records, showing the relationship between victims and crimes.

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of records per page (default: 10)
- `search` (optional): Search term to filter by name, ID number, or crime type

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:6000/api/v1/victim-criminal/victims-with-criminal-records?page=1&limit=5&search=john"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "vic_id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "id_number": "1234567890123",
      "date_committed": "2023-01-15",
      "crime_type": "Theft",
      "registered_by": 1,
      "created_at": "2023-01-15T10:30:00Z",
      "criminal_records": [
        {
          "criminal_record_id": 1,
          "crime_type": "Robbery",
          "date_committed": "2023-01-20",
          "registered_by": 1,
          "created_at": "2023-01-20T14:30:00Z",
          "linked_victim_id": 1
        }
      ]
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 5,
    "total": 25,
    "total_pages": 5
  }
}
```

### 2. Get Single Victim with Criminal Records
**GET** `/victims/:vicId/with-criminal-records`

Retrieves a specific victim with all their associated criminal records.

**Path Parameters:**
- `vicId`: Victim ID

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:6000/api/v1/victim-criminal/victims/1/with-criminal-records"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "vic_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "id_number": "1234567890123",
    "date_committed": "2023-01-15",
    "crime_type": "Theft",
    "registered_by": 1,
    "created_at": "2023-01-15T10:30:00Z",
    "criminal_records": [
      {
        "criminal_record_id": 1,
        "crime_type": "Robbery",
        "date_committed": "2023-01-20",
        "registered_by": 1,
        "created_at": "2023-01-20T14:30:00Z",
        "linked_victim_id": 1
      }
    ]
  }
}
```

### 3. Get All Criminal Records with Victim Information
**GET** `/criminal-records-with-victims`

Retrieves all criminal records with their associated victim information.

**Query Parameters:**
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Number of records per page (default: 10)
- `search` (optional): Search term to filter by crime type or victim name

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:6000/api/v1/victim-criminal/criminal-records-with-victims?page=1&limit=5"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "criminal_record_id": 1,
      "crime_type": "Robbery",
      "date_committed": "2023-01-20",
      "registered_by": 1,
      "created_at": "2023-01-20T14:30:00Z",
      "linked_victim_id": 1,
      "victim": {
        "vic_id": 1,
        "first_name": "John",
        "last_name": "Doe",
        "id_number": "1234567890123",
        "date_committed": "2023-01-15",
        "crime_type": "Theft",
        "registered_by": 1,
        "created_at": "2023-01-15T10:30:00Z"
      }
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 5,
    "total": 15,
    "total_pages": 3
  }
}
```

### 4. Update Victim Information
**PUT** `/victims/:vicId`

Updates victim information including name, ID number, date committed, and crime type.

**Path Parameters:**
- `vicId`: Victim ID

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "id_number": "1234567890123",
  "date_committed": "2023-01-15",
  "crime_type": "Theft"
}
```

**Example Request:**
```bash
curl -X PUT -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"John","last_name":"Doe","id_number":"1234567890123","date_committed":"2023-01-15","crime_type":"Theft"}' \
  "http://localhost:6000/api/v1/victim-criminal/victims/1"
```

**Response:**
```json
{
  "success": true,
  "message": "Victim updated successfully",
  "data": {
    "vic_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "id_number": "1234567890123",
    "date_committed": "2023-01-15",
    "crime_type": "Theft",
    "registered_by": 1,
    "created_at": "2023-01-15T10:30:00Z",
    "updated_at": "2023-01-25T15:45:00Z"
  }
}
```

### 5. Update Criminal Record
**PUT** `/criminal-records/:criminalRecordId`

Updates criminal record information including crime type, date committed, and linked victim ID.

**Path Parameters:**
- `criminalRecordId`: Criminal Record ID

**Request Body:**
```json
{
  "crime_type": "Robbery",
  "date_committed": "2023-01-20",
  "vic_id": 1
}
```

**Example Request:**
```bash
curl -X PUT -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"crime_type":"Robbery","date_committed":"2023-01-20","vic_id":1}' \
  "http://localhost:6000/api/v1/victim-criminal/criminal-records/1"
```

**Response:**
```json
{
  "success": true,
  "message": "Criminal record updated successfully",
  "data": {
    "criminal_record_id": 1,
    "crime_type": "Robbery",
    "date_committed": "2023-01-20",
    "vic_id": 1,
    "registered_by": 1,
    "created_at": "2023-01-20T14:30:00Z",
    "updated_at": "2023-01-25T16:00:00Z"
  }
}
```

### 6. Delete Victim and All Associated Criminal Records
**DELETE** `/victims/:vicId`

Deletes a victim and all their associated criminal records. This is a cascading delete operation.

**Path Parameters:**
- `vicId`: Victim ID

**Example Request:**
```bash
curl -X DELETE -H "Authorization: Bearer <token>" \
  "http://localhost:6000/api/v1/victim-criminal/victims/1"
```

**Response:**
```json
{
  "success": true,
  "message": "Victim and all associated criminal records deleted successfully",
  "data": {
    "vic_id": 1,
    "first_name": "John",
    "last_name": "Doe",
    "id_number": "1234567890123",
    "date_committed": "2023-01-15",
    "crime_type": "Theft",
    "registered_by": 1,
    "created_at": "2023-01-15T10:30:00Z"
  }
}
```

### 7. Delete Criminal Record
**DELETE** `/criminal-records/:criminalRecordId`

Deletes a specific criminal record without affecting the associated victim.

**Path Parameters:**
- `criminalRecordId`: Criminal Record ID

**Example Request:**
```bash
curl -X DELETE -H "Authorization: Bearer <token>" \
  "http://localhost:6000/api/v1/victim-criminal/criminal-records/1"
```

**Response:**
```json
{
  "success": true,
  "message": "Criminal record deleted successfully",
  "data": {
    "criminal_record_id": 1,
    "crime_type": "Robbery",
    "date_committed": "2023-01-20",
    "vic_id": 1,
    "registered_by": 1,
    "created_at": "2023-01-20T14:30:00Z"
  }
}
```

### 8. Get Statistics
**GET** `/statistics`

Retrieves comprehensive statistics about victims and criminal records.

**Example Request:**
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:6000/api/v1/victim-criminal/statistics"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total_victims": 150,
    "total_criminal_records": 200,
    "victims_with_criminal_records": 120,
    "victims_without_criminal_records": 30,
    "criminal_records_without_victims": 80
  }
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "message": "First name and last name are required"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Victim not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error retrieving victims and criminal records"
}
```

## Key Features

1. **Relationship Management**: Shows the relationship between victims and their criminal records
2. **Pagination**: All list endpoints support pagination
3. **Search**: Filter results by name, ID number, or crime type
4. **Cascading Delete**: Deleting a victim also deletes all associated criminal records
5. **Statistics**: Get comprehensive statistics about the data
6. **Data Integrity**: Maintains referential integrity between tables

## Usage Examples

### Get all victims with their criminal records (paginated)
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:6000/api/v1/victim-criminal/victims-with-criminal-records?page=1&limit=10"
```

### Search for victims by name
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:6000/api/v1/victim-criminal/victims-with-criminal-records?search=john"
```

### Get a specific victim with all their criminal records
```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:6000/api/v1/victim-criminal/victims/1/with-criminal-records"
```

### Update victim information
```bash
curl -X PUT -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Jane","last_name":"Smith","id_number":"9876543210987","date_committed":"2023-02-10","crime_type":"Fraud"}' \
  "http://localhost:6000/api/v1/victim-criminal/victims/1"
```

### Delete a victim and all their criminal records
```bash
curl -X DELETE -H "Authorization: Bearer <token>" \
  "http://localhost:6000/api/v1/victim-criminal/victims/1"
```

This API system provides complete CRUD operations for managing victims and their criminal records, with proper relationship handling and data integrity.
