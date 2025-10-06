const Arrested = require('../models/Arrested');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');

const createArrested = async (req, res) => {
    try {
        // Log incoming request details
        console.log('🚀 ===== NEW ARRESTED RECORD REQUEST =====');
        console.log('📋 Request Method:', req.method);
        console.log('📋 Request URL:', req.url);
        console.log('📋 Content-Type:', req.get('Content-Type'));
        console.log('📋 Headers:', JSON.stringify(req.headers, null, 2));
        console.log('📋 Body:', JSON.stringify(req.body, null, 2));
        console.log('📋 File:', req.file ? {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            filename: req.file.filename,
            mimetype: req.file.mimetype,
            size: req.file.size
        } : 'No file uploaded');
        console.log('📋 Files:', req.files ? req.files.map(f => ({
            fieldname: f.fieldname,
            originalname: f.originalname,
            filename: f.filename,
            mimetype: f.mimetype,
            size: f.size
        })) : 'No files uploaded');
        
        // Handle both JSON and form-data requests
        let requestData;
        
        if (req.is('application/json')) {
            // Handle JSON request
            requestData = req.body;
        } else if (req.is('multipart/form-data')) {
            // Handle form-data request (with file upload)
            requestData = req.body;
        } else {
            // Try to parse as JSON if content-type is not specified
            try {
                requestData = req.body;
            } catch (parseError) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid request format. Use either JSON or form-data with image upload.',
                    error: 'Expected valid JSON or multipart/form-data'
                });
            }
        }
        
        console.log('📝 Processed requestData:', JSON.stringify(requestData, null, 2));

        const {
            fullname,
            crime_type,
            date_arrested,
            arrest_location,
            id_type,
            id_number,
            criminal_record_id, // Allow criminal_record_id to be provided
            image_url // Allow image_url to be provided for JSON requests
        } = requestData;

        // Validate required fields
        if (!fullname || !crime_type) {
            return res.status(400).json({
                success: false,
                message: 'Full name and crime type are required fields'
            });
        }

        // Validate id_type if provided
        const validIdTypes = ['indangamuntu_yumunyarwanda', 'indangamuntu_yumunyamahanga', 'indangampunzi', 'passport', 'unknown'];
        if (id_type && !validIdTypes.includes(id_type)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID type. Must be one of: ' + validIdTypes.join(', ')
            });
        }

        // Handle image upload
        let finalImageUrl = null;
        
        if (req.file) {
            // File is already saved by multer, just generate the URL
            finalImageUrl = `/uploads/arrested/images/${req.file.filename}`;
            console.log(`📸 Image uploaded successfully: ${finalImageUrl}`);
            console.log(`📸 File details:`, {
                originalname: req.file.originalname,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size
            });
        } else if (image_url && image_url !== 'https://via.placeholder.com/300x200?text=Image+Upload+Failed') {
            // Check if it's a blob URL (from Flutter web)
            if (image_url.startsWith('blob:')) {
                console.log(`⚠️ Blob URL detected - cannot be saved: ${image_url}`);
                console.log(`💡 This is a Flutter web limitation. Image upload failed.`);
                finalImageUrl = null;
            } else {
                // Use provided image_url for JSON requests, but not placeholder URLs
                finalImageUrl = image_url;
                console.log(`📸 Using provided image URL: ${finalImageUrl}`);
            }
        } else if (image_url === 'https://via.placeholder.com/300x200?text=Image+Upload+Failed') {
            // Don't save placeholder URLs
            console.log(`⚠️ Ignoring placeholder URL: ${image_url}`);
            finalImageUrl = null;
        } else {
            // No image provided - this is valid, image is optional
            console.log(`ℹ️ No image provided - this is optional`);
            finalImageUrl = null;
        }

        // Validate criminal_record_id if provided
        let validatedCriminalRecordId = null;
        if (criminal_record_id) {
            // TODO: Add validation to check if criminal_record_id exists
            validatedCriminalRecordId = criminal_record_id;
        }

        const arrestData = {
            fullname: fullname.trim(),
            image_url: finalImageUrl || null, // Ensure it's actual null, not "NULL" string
            crime_type: crime_type.trim(),
            date_arrested: date_arrested || new Date().toISOString().split('T')[0],
            arrest_location: arrest_location?.trim(),
            id_type,
            id_number: id_number?.trim(),
            criminal_record_id: validatedCriminalRecordId,
            arresting_officer_id: req.user?.userId || req.user?.user_id || null
        };

        // Debug logging
        console.log('🔍 Debug - finalImageUrl:', finalImageUrl);
        console.log('🔍 Debug - finalImageUrl type:', typeof finalImageUrl);
        console.log('🔍 Debug - arrestData.image_url:', arrestData.image_url);
        console.log('🔍 Debug - arrestData.image_url type:', typeof arrestData.image_url);
        console.log('🔍 Debug - Complete arrestData:', JSON.stringify(arrestData, null, 2));

        const arrested = await Arrested.create(arrestData);

        res.status(201).json({
            success: true,
            message: 'Arrested criminal record created successfully',
            data: arrested
        });
    } catch (error) {
        console.error('Create arrested record error:', error);
        
        // Check for specific database errors
        if (error.code === '23503') { // Foreign key violation
            return res.status(400).json({
                success: false,
                message: 'Invalid reference to criminal record or arresting officer'
            });
        }
        
        if (error.code === '23514') { // Check constraint violation
            return res.status(400).json({
                success: false,
                message: 'Invalid data provided. Please check all fields.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to create arrest record',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getAllArrested = async (req, res) => {
    try {
        const { 
            search, 
            page = 1, 
            limit = 10, 
            crime_type, 
            date_from, 
            date_to 
        } = req.query;
        
        // Validate pagination parameters
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // Max 100 records per page

        const options = {
            page: pageNum,
            limit: limitNum,
            crime_type,
            date_from,
            date_to
        };

        let arrested;
        if (search && search.trim()) {
            arrested = await Arrested.search(search.trim(), options);
        } else {
            arrested = await Arrested.getAll(options);
        }

        res.json({
            success: true,
            message: `Found ${arrested.records.length} arrest records`,
            data: arrested
        });
    } catch (error) {
        console.error('Get arrested records error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve arrest records',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getArrestedById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate ID parameter
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Valid arrest ID is required'
            });
        }

        const arrested = await Arrested.getById(parseInt(id));

        if (!arrested) {
            return res.status(404).json({
                success: false,
                message: 'Arrest record not found'
            });
        }

        res.json({
            success: true,
            message: 'Arrest record retrieved successfully',
            data: arrested
        });
    } catch (error) {
        console.error('Get arrested record error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve arrest record',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const updateArrested = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = { ...req.body };

        // Validate ID parameter
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Valid arrest ID is required'
            });
        }

        // Check if record exists
        const existingRecord = await Arrested.getById(parseInt(id));
        if (!existingRecord) {
            return res.status(404).json({
                success: false,
                message: 'Arrest record not found'
            });
        }

        // Validate id_type if provided
        if (updateData.id_type) {
            const validIdTypes = ['indangamuntu_yumunyarwanda', 'indangamuntu_yumunyamahanga', 'indangampunzi', 'passport', 'unknown'];
            if (!validIdTypes.includes(updateData.id_type)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid ID type. Must be one of: ' + validIdTypes.join(', ')
                });
            }
        }

        // Handle image upload if provided
        if (req.file) {
            // File is already saved by multer, generate the URL
            const imageUrl = `/uploads/arrested/images/${req.file.filename}`;
            updateData.image_url = imageUrl;
            console.log(`📸 Image updated successfully: ${imageUrl}`);
            console.log(`📸 File details:`, {
                originalname: req.file.originalname,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size
            });
        } else if (updateData.image_url === 'https://via.placeholder.com/300x200?text=Image+Upload+Failed') {
            // Don't save placeholder URLs
            console.log(`⚠️ Ignoring placeholder URL in update: ${updateData.image_url}`);
            delete updateData.image_url; // Remove the placeholder URL from update data
        }

        // Remove fields that shouldn't be updated
        delete updateData.arrest_id;
        delete updateData.created_at;

        // Trim string fields
        if (updateData.fullname) updateData.fullname = updateData.fullname.trim();
        if (updateData.crime_type) updateData.crime_type = updateData.crime_type.trim();
        if (updateData.arrest_location) updateData.arrest_location = updateData.arrest_location.trim();
        if (updateData.id_number) updateData.id_number = updateData.id_number.trim();

        const arrested = await Arrested.update(parseInt(id), updateData);

        res.json({
            success: true,
            message: 'Arrest record updated successfully',
            data: arrested
        });
    } catch (error) {
        console.error('Update arrested record error:', error);
        
        // Check for specific database errors
        if (error.code === '23503') { // Foreign key violation
            return res.status(400).json({
                success: false,
                message: 'Invalid reference to criminal record or arresting officer'
            });
        }
        
        if (error.code === '23514') { // Check constraint violation
            return res.status(400).json({
                success: false,
                message: 'Invalid data provided. Please check all fields.'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Failed to update arrest record',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const deleteArrested = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID parameter
        if (!id || isNaN(parseInt(id))) {
            return res.status(400).json({
                success: false,
                message: 'Valid arrest ID is required'
            });
        }

        // Check if record exists
        const arrested = await Arrested.getById(parseInt(id));
        if (!arrested) {
            return res.status(404).json({
                success: false,
                message: 'Arrest record not found'
            });
        }

        // Handle image deletion if image_url exists
        if (arrested.image_url) {
            try {
                // Extract filename from image_url
                const filename = arrested.image_url.replace('/uploads/arrested/images/', '');
                const filePath = path.join(process.cwd(), 'uploads', 'arrested', 'images', filename);
                
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    console.log(`🗑️ Deleted image file: ${filePath}`);
                } else {
                    console.log(`⚠️ Image file not found on disk: ${filePath}`);
                }
            } catch (error) {
                console.error('Error deleting image file:', error);
                // Don't fail the deletion if image file deletion fails
            }
        }

        await Arrested.delete(parseInt(id));

        res.json({
            success: true,
            message: 'Arrest record deleted successfully'
        });
    } catch (error) {
        console.error('Delete arrested record error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete arrest record',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getStatistics = async (req, res) => {
    try {
        const stats = await Arrested.getStatistics();
        
        res.json({
            success: true,
            message: 'Statistics retrieved successfully',
            data: stats
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};


// Get arrested person image info (without downloading)
const getArrestedImageInfo = async (req, res) => {
    try {
        const { arrestId } = req.params;
        
        // Get arrested record
        const arrested = await Arrested.getById(parseInt(arrestId));
        
        if (!arrested) {
            return res.status(404).json({
                success: false,
                message: 'Arrest record not found'
            });
        }

        if (!arrested.image_url) {
            return res.status(404).json({
                success: false,
                message: 'No image found for this arrest record'
            });
        }

        // Extract filename from image_url
        const filename = arrested.image_url.replace('/uploads/arrested/images/', '');
        const filePath = path.join(process.cwd(), 'uploads', 'arrested', 'images', filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Image file not found on disk'
            });
        }

        const stats = fs.statSync(filePath);
        const imageInfo = {
            arrestId: arrested.arrest_id,
            fullname: arrested.fullname,
            filename: filename,
            imageUrl: arrested.image_url,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            downloadUrl: `/api/v1/arrested/${arrestId}/image/download`
        };

        res.json({
            success: true,
            data: { imageInfo }
        });
    } catch (error) {
        console.error('Get arrested image info error:', error);
        res.status(500).json({
            success: false,
            message: 'Error getting image information'
        });
    }
};

// Debug function to check image_url data
const debugImageUrl = async (req, res) => {
    try {
        const { arrestId } = req.params;
        const arrested = await Arrested.getById(parseInt(arrestId));
        
        if (!arrested) {
            return res.status(404).json({
                success: false,
                message: 'Arrest record not found'
            });
        }

        const debugInfo = {
            arrestId: arrested.arrest_id,
            fullname: arrested.fullname,
            image_url: arrested.image_url,
            image_url_type: typeof arrested.image_url,
            isBuffer: Buffer.isBuffer(arrested.image_url),
            image_url_length: arrested.image_url ? arrested.image_url.length : 0,
            image_url_preview: arrested.image_url ? arrested.image_url.toString().substring(0, 100) : null
        };

        res.json({
            success: true,
            debug: debugInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Debug error',
            error: error.message
        });
    }
};

// Download arrested person image by arrest ID
const downloadArrestedImage = async (req, res) => {
    try {
        const { arrestId } = req.params;
        
        console.log('🔍 Downloading image for arrest ID:', arrestId);
        
        // Get arrested record to check if it exists and get image URL
        const arrested = await Arrested.getById(parseInt(arrestId));
        
        if (!arrested) {
            return res.status(404).json({
                success: false,
                message: 'Arrest record not found'
            });
        }

        if (!arrested.image_url) {
            return res.status(404).json({
                success: false,
                message: 'No image found for this arrest record'
            });
        }

        // Handle both binary data (bytea) and text (varchar) image_url
        let filename;
        let imageUrl = arrested.image_url;
        
        // If image_url is binary data (Buffer), convert to string
        if (Buffer.isBuffer(imageUrl)) {
            imageUrl = imageUrl.toString('utf8');
        }
        
        // If image_url is a blob URL, we can't download it
        if (imageUrl && imageUrl.includes('blob:')) {
            return res.status(400).json({
                success: false,
                message: 'Image is stored as blob data. Please re-upload the image to store it as a file.',
                imageType: 'blob',
                solution: 'Use PUT /api/v1/arrested/{id} with image file to update the record',
                currentImageUrl: imageUrl
            });
        }
        
        // If image_url is a proper file path, extract filename
        if (imageUrl && imageUrl.includes('/uploads/arrested/images/')) {
            filename = imageUrl.replace('/uploads/arrested/images/', '');
        } else if (imageUrl && !imageUrl.includes('/')) {
            // If it's just a filename without path
            filename = imageUrl;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Invalid image format. Image must be uploaded as a file.',
                imageUrl: imageUrl
            });
        }
        
        const filePath = path.join(process.cwd(), 'uploads', 'arrested', 'images', filename);
        
        console.log('🔍 Looking for arrested image:', filePath);
        console.log('📁 Image URL from database:', imageUrl);
        console.log('📄 Extracted filename:', filename);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Image file not found on disk'
            });
        }

        // Set appropriate headers for image download
        res.setHeader('Content-Disposition', `attachment; filename="${arrested.fullname}_arrest_image.jpg"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        res.download(filePath, `${arrested.fullname}_arrest_image.jpg`, (err) => {
            if (err) {
                console.error('Download error:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error downloading image'
                    });
                }
            }
        });
    } catch (error) {
        console.error('Download arrested image error:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading image'
        });
    }
};

// Download arrested person image by filename (kept for compatibility)
const downloadArrestedImageByFilename = async (req, res) => {
    try {
        const { filename } = req.params;
        const filePath = path.join(process.cwd(), 'uploads', 'arrested', 'images', filename);
        
        console.log('🔍 Looking for arrested image by filename:', filePath);
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                message: 'Image file not found'
            });
        }

        // Set appropriate headers for image download
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-Type', 'application/octet-stream');
        
        res.download(filePath, filename, (err) => {
            if (err) {
                console.error('Download error:', err);
                if (!res.headersSent) {
                    res.status(500).json({
                        success: false,
                        message: 'Error downloading image'
                    });
                }
            }
        });
    } catch (error) {
        console.error('Download arrested image by filename error:', error);
        res.status(500).json({
            success: false,
            message: 'Error downloading image'
        });
    }
};

// Upload evidence files for arrested person
const uploadEvidence = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Check if arrested record exists
        const arrested = await Arrested.getById(parseInt(id));
        if (!arrested) {
            return res.status(404).json({
                success: false,
                message: 'Arrest record not found'
            });
        }

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No evidence files provided'
            });
        }

        // Process uploaded files
        const evidenceFiles = req.files.map(file => ({
            filename: file.filename,
            originalName: file.originalname,
            fileSize: file.size,
            fileType: file.mimetype,
            fileUrl: `/uploads/arrested/evidence/${file.filename}`,
            uploadedAt: new Date().toISOString()
        }));

        // TODO: Update arrested record with evidence files
        // This would require adding an evidence_files column to the arrested table
        console.log('Evidence files uploaded:', evidenceFiles);

        res.json({
            success: true,
            message: 'Evidence files uploaded successfully',
            data: {
                arrestId: id,
                evidenceFiles: evidenceFiles
            }
        });
    } catch (error) {
        console.error('Upload evidence error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload evidence files'
        });
    }
};


module.exports = {
    createArrested,
    getAllArrested,
    getArrestedById,
    updateArrested,
    deleteArrested,
    getStatistics,
    debugImageUrl,
    downloadArrestedImage,
    downloadArrestedImageByFilename
};