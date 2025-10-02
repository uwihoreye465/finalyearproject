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
router.post('/upload-image', auth, (req, res, next) => {
    // Check if request is JSON (base64) or form-data
    if (req.is('application/json')) {
        // Handle base64 image upload for web
        try {
            const { image, filename } = req.body;
            
            if (!image || !filename) {
                return res.status(400).json({
                    success: false,
                    message: 'Image data and filename are required'
                });
            }

            // Convert base64 to buffer
            const imageBuffer = Buffer.from(image, 'base64');
            
            // Generate unique filename
            const fileExtension = path.extname(filename) || '.jpg';
            const uniqueFilename = `arrested_img_${Date.now()}_${Math.random().toString(36).substring(7)}${fileExtension}`;
            
            // Ensure upload directory exists
            const uploadsDir = path.join(__dirname, '../../uploads/arrested/images');
            if (!fs.existsSync(uploadsDir)) {
                fs.mkdirSync(uploadsDir, { recursive: true });
            }
            
            // Save file
            const filePath = path.join(uploadsDir, uniqueFilename);
            fs.writeFileSync(filePath, imageBuffer);
            
            const imageUrl = `/uploads/arrested/images/${uniqueFilename}`;
            
            res.json({
                success: true,
                message: 'Image uploaded successfully',
                data: {
                    imageUrl: imageUrl,
                    filename: uniqueFilename,
                    originalName: filename,
                    size: imageBuffer.length,
                    mimetype: 'image/jpeg'
                }
            });
        } catch (error) {
            console.error('Base64 image upload error:', error);
            res.status(500).json({
                success: false,
                message: 'Failed to upload image'
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

                const imageUrl = `/uploads/arrested/images/${req.file.filename}`;
                
                res.json({
                    success: true,
                    message: 'Image uploaded successfully',
                    data: {
                        imageUrl: imageUrl,
                        filename: req.file.filename,
                        originalName: req.file.originalname,
                        size: req.file.size,
                        mimetype: req.file.mimetype
                    }
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