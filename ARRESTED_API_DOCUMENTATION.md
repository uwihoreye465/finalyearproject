# Arrested Criminals API Documentation

## Overview
This API manages arrested criminals records in the FindSinnersSystem. All endpoints require authentication except where noted.

**Base URL:** `http://localhost:6000/api/v1/arrested`

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Endpoints

### 1. Create Arrested Criminal Record
**POST** `/api/v1/arrested`

Creates a new arrested criminal record.

**Authorization:** Admin/Staff only

**Request Body:**
```json
{
  "fullname": "John Doe",
  "crime_type": "Theft",
  "date_arrested": "2024-01-15",
  "arrest_location": "Kigali City Center",
  "id_type": "indangamuntu_yumunyarwanda",
  "id_number": "1234567890123456",
  "criminal_record_id": 1
}
```

**Field Validations:**
- `fullname` (required): String, max 100 characters
- `crime_type` (required): String, max 100 characters
- `date_arrested` (optional): Date in YYYY-MM-DD format, defaults to current date
- `arrest_location` (optional): String, max 200 characters
- `id_type` (optional): One of: `indangamuntu_yumunyarwanda`, `indangamuntu_yumunyamahanga`, `indangampunzi`, `passport`, `unknown`
- `id_number` (optional): String, max 20 characters
- `criminal_record_id` (optional): Integer, must reference existing criminal record

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Arrested criminal record created successfully",
  "data": {
    "arrest_id": 1,
    "fullname": "John Doe",
    "image_url": null,
    "crime_type": "Theft",
    "date_arrested": "2024-01-15",
    "arrest_location": "Kigali City Center",
    "id_type": "indangamuntu_yumunyarwanda",
    "id_number": "1234567890123456",
    "criminal_record_id": 1,
    "arresting_officer_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X POST http://localhost:6000/api/v1/arrested \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fullname": "John Doe",
    "crime_type": "Theft",
    "date_arrested": "2024-01-15",
    "arrest_location": "Kigali City Center",
    "id_type": "indangamuntu_yumunyarwanda",
    "id_number": "1234567890123456"
  }'
```

---

### 2. Get All Arrested Records
**GET** `/api/v1/arrested`

Retrieves all arrested criminal records with pagination and filtering.

**Authorization:** Any authenticated user

**Query Parameters:**
- `page` (optional): Page number, default 1
- `limit` (optional): Records per page, default 10, max 100
- `search` (optional): Search term (searches name, crime type, ID number, location)
- `crime_type` (optional): Filter by specific crime type
- `date_from` (optional): Filter arrests from this date (YYYY-MM-DD)
- `date_to` (optional): Filter arrests until this date (YYYY-MM-DD)

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Found 25 arrest records",
  "data": {
    "records": [
      {
        "arrest_id": 1,
        "fullname": "John Doe",
        "image_url": null,
        "crime_type": "Theft",
        "date_arrested": "2024-01-15",
        "arrest_location": "Kigali City Center",
        "id_type": "indangamuntu_yumunyarwanda",
        "id_number": "1234567890123456",
        "criminal_record_id": 1,
        "arresting_officer_id": 1,
        "created_at": "2024-01-15T10:30:00.000Z",
        "updated_at": "2024-01-15T10:30:00.000Z",
        "criminal_record_crime_type": "Burglary",
        "criminal_record_description": "Previous theft conviction",
        "arresting_officer_name": "Officer Smith",
        "arresting_officer_position": "Police Officer"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

**cURL Examples:**
```bash
# Get all records
curl -X GET "http://localhost:6000/api/v1/arrested" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search for records
curl -X GET "http://localhost:6000/api/v1/arrested?search=john&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Filter by crime type and date range
curl -X GET "http://localhost:6000/api/v1/arrested?crime_type=Theft&date_from=2024-01-01&date_to=2024-01-31" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 3. Get Arrested Record by ID
**GET** `/api/arrested/:id`

Retrieves a specific arrested criminal record by ID.

**Authorization:** Any authenticated user

**Path Parameters:**
- `id` (required): Arrest record ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Arrest record retrieved successfully",
  "data": {
    "arrest_id": 1,
    "fullname": "John Doe",
    "image_url": null,
    "crime_type": "Theft",
    "date_arrested": "2024-01-15",
    "arrest_location": "Kigali City Center",
    "id_type": "indangamuntu_yumunyarwanda",
    "id_number": "1234567890123456",
    "criminal_record_id": 1,
    "arresting_officer_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z",
    "criminal_record_crime_type": "Burglary",
    "criminal_record_description": "Previous theft conviction",
    "arresting_officer_name": "Officer Smith",
    "arresting_officer_position": "Police Officer"
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:6000/api/v1/arrested/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Update Arrested Record
**PUT** `/api/arrested/:id`

Updates an existing arrested criminal record.

**Authorization:** Admin/Staff only

**Path Parameters:**
- `id` (required): Arrest record ID

**Request Body:** (all fields optional, only send fields to update)
```json
{
  "fullname": "John Updated Doe",
  "crime_type": "Armed Robbery",
  "arrest_location": "Updated Location",
  "id_type": "passport",
  "id_number": "P123456789"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Arrest record updated successfully",
  "data": {
    "arrest_id": 1,
    "fullname": "John Updated Doe",
    "image_url": null,
    "crime_type": "Armed Robbery",
    "date_arrested": "2024-01-15",
    "arrest_location": "Updated Location",
    "id_type": "passport",
    "id_number": "P123456789",
    "criminal_record_id": 1,
    "arresting_officer_id": 1,
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T14:30:00.000Z"
  }
}
```

**cURL Example:**
```bash
curl -X PUT http://localhost:6000/api/v1/arrested/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "fullname": "John Updated Doe",
    "crime_type": "Armed Robbery"
  }'
```

---

### 5. Delete Arrested Record
**DELETE** `/api/arrested/:id`

Deletes an arrested criminal record.

**Authorization:** Admin only

**Path Parameters:**
- `id` (required): Arrest record ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Arrest record deleted successfully"
}
```

**cURL Example:**
```bash
curl -X DELETE http://localhost:6000/api/v1/arrested/1 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. Get Statistics
**GET** `/api/arrested/statistics`

Retrieves comprehensive statistics about arrested criminals.

**Authorization:** Any authenticated user

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Statistics retrieved successfully",
  "data": {
    "totalArrests": 150,
    "thisMonthArrests": 25,
    "thisYearArrests": 120,
    "crimeTypeDistribution": {
      "Theft": 45,
      "Assault": 30,
      "Drug Trafficking": 25,
      "Fraud": 20,
      "Burglary": 15,
      "Other": 15
    },
    "monthlyTrends": {
      "Nov 2023": 18,
      "Dec 2023": 22,
      "Jan 2024": 25,
      "Feb 2024": 20,
      "Mar 2024": 28,
      "Apr 2024": 25
    },
    "recentArrests": [
      {
        "arrest_id": 150,
        "fullname": "Recent Arrest",
        "crime_type": "Theft",
        "date_arrested": "2024-01-20",
        "arrest_location": "Kigali",
        "arresting_officer_name": "Officer Johnson"
      }
    ],
    "arrestsByLocation": {
      "Kigali City Center": 45,
      "Nyamirambo": 30,
      "Kimisagara": 25,
      "Gikondo": 20,
      "Kicukiro": 15
    },
    "topOfficers": [
      {
        "officer_name": "Officer Smith",
        "position": "Police Officer",
        "arrests_made": 25
      },
      {
        "officer_name": "Officer Johnson",
        "position": "Detective",
        "arrests_made": 20
      }
    ]
  }
}
```

**cURL Example:**
```bash
curl -X GET http://localhost:6000/api/v1/arrested/statistics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Error Responses

### Common Error Codes:

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Full name and crime type are required fields"
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

**403 Forbidden:**
```json
{
  "success": false,
  "message": "Access denied. Insufficient privileges."
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Arrest record not found"
}
```

**500 Internal Server Error:**
```json
{
  "success": false,
  "message": "Failed to create arrest record"
}
```

---

## Testing Workflow

### 1. First, authenticate to get a JWT token:
```bash
# Login to get token
curl -X POST http://localhost:6000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### 2. Use the token for subsequent requests:
```bash
# Replace YOUR_JWT_TOKEN with the actual token from login response
export TOKEN="YOUR_JWT_TOKEN"

# Test creating an arrest record
curl -X POST http://localhost:6000/api/v1/arrested \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fullname": "Test Criminal",
    "crime_type": "Theft",
    "arrest_location": "Test Location"
  }'

# Test getting all records
curl -X GET http://localhost:6000/api/v1/arrested \
  -H "Authorization: Bearer $TOKEN"

# Test getting statistics
curl -X GET http://localhost:6000/api/v1/arrested/statistics \
  -H "Authorization: Bearer $TOKEN"
```

---

## Sample Test Data

Here are some sample requests you can use for testing:

### Sample Create Requests:
```json
{
  "fullname": "Jean Baptiste Uwimana",
  "crime_type": "Theft",
  "date_arrested": "2024-01-15",
  "arrest_location": "Nyamirambo Market",
  "id_type": "indangamuntu_yumunyarwanda",
  "id_number": "1198780123456789"
}

{
  "fullname": "Marie Claire Mukamana",
  "crime_type": "Fraud",
  "date_arrested": "2024-01-14",
  "arrest_location": "Kigali City Center",
  "id_type": "indangamuntu_yumunyarwanda",
  "id_number": "1199012345678901"
}

{
  "fullname": "David Johnson",
  "crime_type": "Drug Trafficking",
  "date_arrested": "2024-01-13",
  "arrest_location": "Remera Taxi Station",
  "id_type": "passport",
  "id_number": "P123456789"
}
```

---

## Notes

1. **Authentication**: All endpoints require a valid JWT token except for public authentication endpoints.

2. **Authorization Levels**:
   - **Any authenticated user**: Can view records and statistics
   - **Admin/Staff**: Can create and update records
   - **Admin only**: Can delete records

3. **Image Upload**: Image upload functionality is currently not implemented. The `image_url` field will be null for now.

4. **Pagination**: Use `page` and `limit` parameters to navigate through large datasets. Maximum limit is 100 records per page.

5. **Search**: The search functionality searches across fullname, crime_type, id_number, and arrest_location fields.

6. **Date Formats**: Use YYYY-MM-DD format for all date fields.

7. **Error Handling**: The API provides detailed error messages in development mode and generic messages in production mode.
