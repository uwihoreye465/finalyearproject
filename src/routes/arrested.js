const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Import controller and middleware
const arrestedController = require('../controllers/arrestedController');
const { auth } = require('../middleware/auth');

// Configure multer for image uploads
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, '../../uploads/arrested/images');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const fileExtension = path.extname(file.originalname);
        const fileName = `arrested_img_${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension}`;
        cb(null, fileName);
    }
});

// Image upload configuration
const imageUpload = multer({
    storage: imageStorage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for images
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

// Debug route (public access) - must come before /:id route
router.get('/:arrestId/debug/image', arrestedController.debugImageUrl);

// Download routes (public access) - must come before /:id route
router.get('/:arrestId/download/image', arrestedController.downloadArrestedImage);
router.get('/download/image/:filename', arrestedController.downloadArrestedImageByFilename);

// Image upload route (must come before /:id route)
router.post('/upload-image', auth, async (req, res, next) => {
    // Check if request is JSON (base64) or form-data
    if (req.is('application/json')) {
        // Handle base64 image upload for web - this will be handled by Cloudinary in controller
        try {
            const { image, filename } = req.body;
            
            if (!image || !filename) {
                return res.status(400).json({
                    success: false,
                    message: 'Image data and filename are required'
                });
            }

            // For base64 images, we'll let the controller handle Cloudinary upload
            // This is just a validation endpoint
            res.json({
                success: true,
                message: 'Base64 image data received. Use POST /api/v1/arrested with image_url field for actual upload.',
                note: 'Base64 images will be automatically uploaded to Cloudinary when creating/updating arrested records'
            });
        } catch (error) {
            console.error('Base64 image validation error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to validate image data'
            });
        }
    } else {
        // Handle multipart form-data upload for mobile
        imageUpload.single('image')(req, res, function(err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: 'Image upload error: ' + err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            
            try {
                if (!req.file) {
                    return res.status(400).json({
                        success: false,
                        message: 'No image file provided'
                    });
                }

                // For form-data uploads, we'll let the controller handle Cloudinary upload
                res.json({
                    success: true,
                    message: 'Image file received. Use POST /api/v1/arrested with form-data for actual upload.',
                    note: 'Images will be automatically uploaded to Cloudinary when creating arrested records'
                });
            } catch (error) {
                console.error('Image upload error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to upload image'
                });
            }
        });
    }
});

// Get by ID route (must come last to avoid conflicts)
router.get('/:id', arrestedController.getArrestedById);

// Admin/Staff only routes with image upload
router.post('/', auth, (req, res, next) => {
    // Check if request is JSON or form-data
    if (req.is('application/json')) {
        // Handle JSON request without multer
        next();
    } else {
        // Handle form-data request with multer
        imageUpload.single('image')(req, res, function(err) {
            if (err instanceof multer.MulterError) {
                return res.status(400).json({
                    success: false,
                    message: 'Image upload error: ' + err.message
                });
            } else if (err) {
                return res.status(400).json({
                    success: false,
                    message: err.message
                });
            }
            next();
        });
    }
}, arrestedController.createArrested);

// Update arrested record with image
router.put('/:id', auth, (req, res, next) => {
    imageUpload.single('image')(req, res, function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message: 'Image upload error: ' + err.message
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

// Delete arrested record
router.delete('/:id', auth, arrestedController.deleteArrested);

module.exports = router;