const Arrested = require('../models/Arrested');

const createArrested = async (req, res) => {
    try {
        const {
            fullname,
            crime_type,
            date_arrested,
            arrest_location,
            id_type,
            id_number,
            image_url,
            criminal_record_id // Allow criminal_record_id to be provided
        } = req.body;

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

        let finalImageUrl = image_url || null;

        // Handle image upload if provided (placeholder for now)
        if (req.file) {
            // For now, we'll skip image upload since storage isn't configured
            console.log('Image upload attempted but not configured yet');
            // TODO: Implement actual file upload logic here
        }

        // Validate criminal_record_id if provided
        let validatedCriminalRecordId = null;
        if (criminal_record_id) {
            // TODO: Add validation to check if criminal_record_id exists
            validatedCriminalRecordId = criminal_record_id;
        }

        const arrestData = {
            fullname: fullname.trim(),
            image_url: finalImageUrl,
            crime_type: crime_type.trim(),
            date_arrested: date_arrested || new Date().toISOString().split('T')[0],
            arrest_location: arrest_location?.trim(),
            id_type,
            id_number: id_number?.trim(),
            criminal_record_id: validatedCriminalRecordId,
            arresting_officer_id: req.user?.userId || req.user?.user_id || null
        };

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

        // Handle image upload if provided (placeholder for now)
        if (req.file) {
            console.log('Image upload attempted but not configured yet');
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

        // TODO: Handle image deletion if image_url exists
        if (arrested.image_url) {
            console.log('Image deletion needed but not configured yet');
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

module.exports = {
    createArrested,
    getAllArrested,
    getArrestedById,
    updateArrested,
    deleteArrested,
    getStatistics
};