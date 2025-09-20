const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Import controller and middleware
const arrestedController = require('../controllers/arrestedController');
const { authenticate, authorize } = require('../middleware/auth');
// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, '../uploads/arrested');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const fileName = `arrested_${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension}`;
        cb(null, fileName);
    }
});

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