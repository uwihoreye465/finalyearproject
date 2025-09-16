const express = require('express');
const router = express.Router();

// Test endpoint to show correct request format
router.get('/example', (req, res) => {
    res.json({
        success: true,
        message: "Example request format for creating arrested record",
        example_request: {
            endpoint: "POST /api/v1/arrested",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer YOUR_JWT_TOKEN"
            },
            body: {
                fullname: "John Doe",
                crime_type: "Theft",
                date_arrested: "2024-01-15", // Optional, defaults to current date
                arrest_location: "Kigali City Center", // Optional
                id_type: "indangamuntu_yumunyarwanda", // Optional
                id_number: "1199012345678901" // Optional
                // DO NOT include: arrest_id, criminal_record_id, arresting_officer_id, created_at, updated_at
            }
        },
        note: "The arresting_officer_id will be automatically set from your authenticated user. The criminal_record_id will be null by default."
    });
});

module.exports = router;
