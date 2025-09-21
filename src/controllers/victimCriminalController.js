const pool = require('../config/database');

// Get all victims with their criminal records
const getAllVictimsWithCriminalRecords = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT 
                v.vic_id,
                v.first_name,
                v.last_name,
                v.id_number,
                v.date_committed,
                v.crime_type as victim_crime_type,
                v.registered_by as victim_registered_by,
                v.created_at as victim_created_at,
                cr.cri_id as criminal_record_id,
                cr.crime_type as criminal_crime_type,
                cr.date_committed as criminal_date_committed,
                cr.registered_by as criminal_registered_by,
                cr.created_at as criminal_created_at,
                cr.vic_id as linked_victim_id
            FROM victim v
            LEFT JOIN Criminal_record cr ON v.vic_id = cr.vic_id
        `;

        let countQuery = `
            SELECT COUNT(DISTINCT v.vic_id) as total
            FROM victim v
            LEFT JOIN Criminal_record cr ON v.vic_id = cr.vic_id
        `;

        const params = [];
        let paramCount = 0;

        if (search) {
            const searchCondition = `
                WHERE (v.first_name ILIKE $${++paramCount} OR 
                       v.last_name ILIKE $${paramCount} OR 
                       v.id_number ILIKE $${paramCount} OR 
                       v.crime_type ILIKE $${paramCount} OR
                       cr.crime_type ILIKE $${paramCount})
            `;
            query += searchCondition;
            countQuery += searchCondition;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY v.vic_id DESC, cr.cri_id DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
        params.push(parseInt(limit), offset);

        const [result, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, params.slice(0, -2)) // Remove limit and offset for count
        ]);

        // Group victims with their criminal records
        const victimsMap = new Map();
        
        result.rows.forEach(row => {
            if (!victimsMap.has(row.vic_id)) {
                victimsMap.set(row.vic_id, {
                    vic_id: row.vic_id,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    id_number: row.id_number,
                    date_committed: row.date_committed,
                    crime_type: row.victim_crime_type,
                    registered_by: row.victim_registered_by,
                    created_at: row.victim_created_at,
                    criminal_records: []
                });
            }

            if (row.criminal_record_id) {
                victimsMap.get(row.vic_id).criminal_records.push({
                    criminal_record_id: row.criminal_record_id,
                    crime_type: row.criminal_crime_type,
                    date_committed: row.criminal_date_committed,
                    registered_by: row.criminal_registered_by,
                    created_at: row.criminal_created_at,
                    linked_victim_id: row.linked_victim_id
                });
            }
        });

        const victims = Array.from(victimsMap.values());
        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: victims,
            pagination: {
                current_page: parseInt(page),
                per_page: parseInt(limit),
                total,
                total_pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error getting victims with criminal records:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving victims and criminal records'
        });
    }
};

// Get single victim with their criminal records
const getVictimWithCriminalRecords = async (req, res) => {
    try {
        const { vicId } = req.params;

        const query = `
            SELECT 
                v.vic_id,
                v.first_name,
                v.last_name,
                v.id_number,
                v.date_committed,
                v.crime_type as victim_crime_type,
                v.registered_by as victim_registered_by,
                v.created_at as victim_created_at,
                cr.cri_id as criminal_record_id,
                cr.crime_type as criminal_crime_type,
                cr.date_committed as criminal_date_committed,
                cr.registered_by as criminal_registered_by,
                cr.created_at as criminal_created_at,
                cr.vic_id as linked_victim_id
            FROM victim v
            LEFT JOIN Criminal_record cr ON v.vic_id = cr.vic_id
            WHERE v.vic_id = $1
            ORDER BY cr.cri_id DESC
        `;

        const result = await pool.query(query, [vicId]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Victim not found'
            });
        }

        // Group the results
        const victim = {
            vic_id: result.rows[0].vic_id,
            first_name: result.rows[0].first_name,
            last_name: result.rows[0].last_name,
            id_number: result.rows[0].id_number,
            date_committed: result.rows[0].date_committed,
            crime_type: result.rows[0].victim_crime_type,
            registered_by: result.rows[0].victim_registered_by,
            created_at: result.rows[0].victim_created_at,
            criminal_records: []
        };

        result.rows.forEach(row => {
            if (row.criminal_record_id) {
                victim.criminal_records.push({
                    criminal_record_id: row.criminal_record_id,
                    crime_type: row.criminal_crime_type,
                    date_committed: row.criminal_date_committed,
                    registered_by: row.criminal_registered_by,
                    created_at: row.criminal_created_at,
                    linked_victim_id: row.linked_victim_id
                });
            }
        });

        res.json({
            success: true,
            data: victim
        });

    } catch (error) {
        console.error('Error getting victim with criminal records:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving victim and criminal records'
        });
    }
};

// Get all criminal records with victim information
const getAllCriminalRecordsWithVictims = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        const offset = (page - 1) * limit;

        let query = `
            SELECT 
                cr.cri_id as criminal_record_id,
                cr.crime_type as criminal_crime_type,
                cr.date_committed as criminal_date_committed,
                cr.registered_by as criminal_registered_by,
                cr.created_at as criminal_created_at,
                cr.vic_id as linked_victim_id,
                v.first_name,
                v.last_name,
                v.id_number as victim_id_number,
                v.date_committed as victim_date_committed,
                v.crime_type as victim_crime_type,
                v.registered_by as victim_registered_by,
                v.created_at as victim_created_at
            FROM Criminal_record cr
            LEFT JOIN victim v ON cr.vic_id = v.vic_id
        `;

        let countQuery = `
            SELECT COUNT(*) as total
            FROM Criminal_record cr
            LEFT JOIN victim v ON cr.vic_id = v.vic_id
        `;

        const params = [];
        let paramCount = 0;

        if (search) {
            const searchCondition = `
                WHERE (cr.crime_type ILIKE $${++paramCount} OR 
                       v.first_name ILIKE $${paramCount} OR 
                       v.last_name ILIKE $${paramCount} OR 
                       v.id_number ILIKE $${paramCount} OR
                       v.crime_type ILIKE $${paramCount})
            `;
            query += searchCondition;
            countQuery += searchCondition;
            params.push(`%${search}%`);
        }

        query += ` ORDER BY cr.cri_id DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
        params.push(parseInt(limit), offset);

        const [result, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, params.slice(0, -2))
        ]);

        const criminalRecords = result.rows.map(row => ({
            criminal_record_id: row.criminal_record_id,
            crime_type: row.criminal_crime_type,
            date_committed: row.criminal_date_committed,
            registered_by: row.criminal_registered_by,
            created_at: row.criminal_created_at,
            linked_victim_id: row.linked_victim_id,
            victim: row.linked_victim_id ? {
                vic_id: row.linked_victim_id,
                first_name: row.first_name,
                last_name: row.last_name,
                id_number: row.victim_id_number,
                date_committed: row.victim_date_committed,
                crime_type: row.victim_crime_type,
                registered_by: row.victim_registered_by,
                created_at: row.victim_created_at
            } : null
        }));

        const total = parseInt(countResult.rows[0].total);

        res.json({
            success: true,
            data: criminalRecords,
            pagination: {
                current_page: parseInt(page),
                per_page: parseInt(limit),
                total,
                total_pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error getting criminal records with victims:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving criminal records and victims'
        });
    }
};

// Update victim information
const updateVictim = async (req, res) => {
    try {
        const { vicId } = req.params;
        const { first_name, last_name, id_number, date_committed, crime_type } = req.body;

        // Validate required fields
        if (!first_name || !last_name) {
            return res.status(400).json({
                success: false,
                message: 'First name and last name are required'
            });
        }

        const query = `
            UPDATE victim 
            SET first_name = $1, 
                last_name = $2, 
                id_number = $3, 
                date_committed = $4, 
                crime_type = $5,
                updated_at = CURRENT_TIMESTAMP
            WHERE vic_id = $6
            RETURNING *
        `;

        const result = await pool.query(query, [
            first_name, 
            last_name, 
            id_number, 
            date_committed, 
            crime_type, 
            vicId
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Victim not found'
            });
        }

        res.json({
            success: true,
            message: 'Victim updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating victim:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating victim'
        });
    }
};

// Update criminal record
const updateCriminalRecord = async (req, res) => {
    try {
        const { criminalRecordId } = req.params;
        const { crime_type, date_committed, vic_id } = req.body;

        // Validate required fields
        if (!crime_type) {
            return res.status(400).json({
                success: false,
                message: 'Crime type is required'
            });
        }

        const query = `
            UPDATE Criminal_record 
            SET crime_type = $1, 
                date_committed = $2, 
                vic_id = $3,
                updated_at = CURRENT_TIMESTAMP
            WHERE cri_id = $4
            RETURNING *
        `;

        const result = await pool.query(query, [
            crime_type, 
            date_committed, 
            vic_id, 
            criminalRecordId
        ]);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Criminal record not found'
            });
        }

        res.json({
            success: true,
            message: 'Criminal record updated successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error updating criminal record:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating criminal record'
        });
    }
};

// Delete victim and all associated criminal records
const deleteVictim = async (req, res) => {
    try {
        const { vicId } = req.params;

        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');

            // First delete all criminal records associated with this victim
            await client.query(
                'DELETE FROM Criminal_record WHERE vic_id = $1',
                [vicId]
            );

            // Then delete the victim
            const victimResult = await client.query(
                'DELETE FROM victim WHERE vic_id = $1 RETURNING *',
                [vicId]
            );

            if (victimResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({
                    success: false,
                    message: 'Victim not found'
                });
            }

            await client.query('COMMIT');

            res.json({
                success: true,
                message: 'Victim and all associated criminal records deleted successfully',
                data: victimResult.rows[0]
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (error) {
        console.error('Error deleting victim:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting victim'
        });
    }
};

// Delete criminal record
const deleteCriminalRecord = async (req, res) => {
    try {
        const { criminalRecordId } = req.params;

        const result = await pool.query(
            'DELETE FROM Criminal_record WHERE cri_id = $1 RETURNING *',
            [criminalRecordId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Criminal record not found'
            });
        }

        res.json({
            success: true,
            message: 'Criminal record deleted successfully',
            data: result.rows[0]
        });

    } catch (error) {
        console.error('Error deleting criminal record:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting criminal record'
        });
    }
};

// Get statistics
const getStatistics = async (req, res) => {
    try {
        const queries = await Promise.all([
            // Total victims
            pool.query('SELECT COUNT(*) as total_victims FROM victim'),
            // Total criminal records
            pool.query('SELECT COUNT(*) as total_criminal_records FROM Criminal_record'),
            // Victims with criminal records
            pool.query(`
                SELECT COUNT(DISTINCT v.vic_id) as victims_with_criminal_records 
                FROM victim v 
                INNER JOIN Criminal_record cr ON v.vic_id = cr.vic_id
            `),
            // Victims without criminal records
            pool.query(`
                SELECT COUNT(*) as victims_without_criminal_records 
                FROM victim v 
                LEFT JOIN Criminal_record cr ON v.vic_id = cr.vic_id 
                WHERE cr.vic_id IS NULL
            `),
            // Criminal records without victims
            pool.query(`
                SELECT COUNT(*) as criminal_records_without_victims 
                FROM Criminal_record cr 
                LEFT JOIN victim v ON cr.vic_id = v.vic_id 
                WHERE v.vic_id IS NULL
            `)
        ]);

        const stats = {
            total_victims: parseInt(queries[0].rows[0].total_victims),
            total_criminal_records: parseInt(queries[1].rows[0].total_criminal_records),
            victims_with_criminal_records: parseInt(queries[2].rows[0].victims_with_criminal_records),
            victims_without_criminal_records: parseInt(queries[3].rows[0].victims_without_criminal_records),
            criminal_records_without_victims: parseInt(queries[4].rows[0].criminal_records_without_victims)
        };

        res.json({
            success: true,
            data: stats
        });

    } catch (error) {
        console.error('Error getting statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving statistics'
        });
    }
};

module.exports = {
    getAllVictimsWithCriminalRecords,
    getVictimWithCriminalRecords,
    getAllCriminalRecordsWithVictims,
    updateVictim,
    updateCriminalRecord,
    deleteVictim,
    deleteCriminalRecord,
    getStatistics
};
