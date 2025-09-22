const express = require('express');
const router = express.Router();
const victimCriminalController = require('../controllers/victimCriminalController');
const { auth } = require('../middleware/auth');

// Test endpoint without authentication (must be before auth middleware)
router.get('/test', async (req, res) => {
    try {
        const pool = require('../config/database');
        const result = await pool.query('SELECT COUNT(*) as count FROM victim');
        res.json({
            success: true,
            message: 'Database connection successful',
            victim_count: result.rows[0].count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Temporarily disable authentication for testing
// router.use(auth);

// Get all victims with their criminal records
router.get('/victims-with-criminal-records', victimCriminalController.getAllVictimsWithCriminalRecords);

// Get single victim with their criminal records
router.get('/victims/:vicId/with-criminal-records', victimCriminalController.getVictimWithCriminalRecords);

// Get all criminal records with victim information
router.get('/criminal-records-with-victims', victimCriminalController.getAllCriminalRecordsWithVictims);

// Update victim information
router.put('/victims/:vicId', victimCriminalController.updateVictim);

// Update criminal record
router.put('/criminal-records/:criminalRecordId', victimCriminalController.updateCriminalRecord);

// Delete victim and all associated criminal records
router.delete('/victims/:vicId', victimCriminalController.deleteVictim);

// Delete criminal record
router.delete('/criminal-records/:criminalRecordId', victimCriminalController.deleteCriminalRecord);

// Get statistics
router.get('/statistics', victimCriminalController.getStatistics);

module.exports = router;
