const express = require('express');
const multer = require('multer');
const router = express.Router();

// Import controller and middleware
const arrestedController = require('../controllers/arrestedController');
const { authenticate, authorize } = require('../middleware/auth');
// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'), false);
        }
    }
});

// Public routes (read-only, no authentication required)
router.get('/', arrestedController.getAllArrested);
router.get('/statistics', arrestedController.getStatistics);
router.get('/:id', arrestedController.getArrestedById);

// Admin/Staff only routes with image upload - with proper error handling
router.post('/', authenticate, authorize('admin', 'staff'), (req, res, next) => {
    upload.single('image')(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: 'File upload error: ' + err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
}, arrestedController.createArrested);

router.put('/:id', authenticate, authorize('admin', 'staff'), (req, res, next) => {
    upload.single('image')(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: 'File upload error: ' + err.message
            });
        } else if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        next();
    });
}, arrestedController.updateArrested);

router.delete('/:id', authenticate, authorize('admin'), arrestedController.deleteArrested);

module.exports = router;