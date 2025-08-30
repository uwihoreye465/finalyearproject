const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/searchController');

// Add logging middleware to debug
router.use((req, res, next) => {
  console.log(`Search route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

// Check what tables exist in database
router.get('/check-tables', SearchController.checkTables);

// Check columns in a specific table
router.get('/check-columns/:table', SearchController.checkColumns);

// Universal search (searches both tables)
router.get('/', SearchController.searchPerson);

// Search specific tables
router.get('/citizens', SearchController.searchRwandanCitizen);
router.get('/passport-holders', SearchController.searchPassportHolder);

// Advanced search with filters
router.get('/advanced', SearchController.advancedSearch);

// Get person by exact ID
router.get('/exact/:idType/:idNumber', SearchController.getPersonByExactId);

module.exports = router;