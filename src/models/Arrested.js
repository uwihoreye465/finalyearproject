const pool = require('../config/database');

class Arrested {
    static async create(arrestData) {
        try {
            const {
                fullname,
                image_url,
                crime_type,
                date_arrested,
                arrest_location,
                id_type,
                id_number,
                criminal_record_id,
                arresting_officer_id
            } = arrestData;

            const query = `
                INSERT INTO criminals_arrested (
                    fullname, image_url, crime_type, date_arrested, 
                    arrest_location, id_type, id_number, 
                    criminal_record_id, arresting_officer_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                RETURNING *
            `;

            const values = [
                fullname,
                image_url,
                crime_type,
                date_arrested || new Date().toISOString().split('T')[0],
                arrest_location,
                id_type,
                id_number,
                criminal_record_id || null,
                arresting_officer_id || null
            ];

            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Database error in Arrested.create:', error);
            throw error;
        }
    }

    static async getAll(options = {}) {
        try {
            let query = `
                SELECT 
                    ca.*,
                    cr.crime_type as criminal_record_crime_type,
                    cr.description as criminal_record_description,
                    u.fullname as arresting_officer_name,
                    u.position as arresting_officer_position
                FROM criminals_arrested ca
                LEFT JOIN criminal_record cr ON ca.criminal_record_id = cr.cri_id
                LEFT JOIN users u ON ca.arresting_officer_id = u.user_id
            `;

            const conditions = [];
            const values = [];
            let paramCount = 0;

            // Apply filters
            if (options.crime_type) {
                paramCount++;
                conditions.push(`ca.crime_type = $${paramCount}`);
                values.push(options.crime_type);
            }

            if (options.date_from) {
                paramCount++;
                conditions.push(`ca.date_arrested >= $${paramCount}`);
                values.push(options.date_from);
            }

            if (options.date_to) {
                paramCount++;
                conditions.push(`ca.date_arrested <= $${paramCount}`);
                values.push(options.date_to);
            }

            if (conditions.length > 0) {
                query += ' WHERE ' + conditions.join(' AND ');
            }

            query += ' ORDER BY ca.date_arrested DESC';

            // Apply pagination
            if (options.page && options.limit) {
                const offset = (options.page - 1) * options.limit;
                paramCount++;
                query += ` LIMIT $${paramCount}`;
                values.push(options.limit);
                
                paramCount++;
                query += ` OFFSET $${paramCount}`;
                values.push(offset);
            }

            const result = await pool.query(query, values);

            // Get total count for pagination
            let countQuery = `
                SELECT COUNT(*) as total 
                FROM criminals_arrested ca
            `;
            
            if (conditions.length > 0) {
                countQuery += ' WHERE ' + conditions.join(' AND ');
            }

            const countResult = await pool.query(countQuery, values.slice(0, values.length - (options.page && options.limit ? 2 : 0)));
            const total = parseInt(countResult.rows[0].total);

            return {
                records: result.rows,
                pagination: {
                    page: options.page || 1,
                    limit: options.limit || result.rows.length,
                    total: total,
                    totalPages: options.limit ? Math.ceil(total / options.limit) : 1
                }
            };
        } catch (error) {
            console.error('Database error in Arrested.getAll:', error);
            throw error;
        }
    }

    static async getById(arrest_id) {
        try {
            const query = `
                SELECT 
                    ca.*,
                    cr.crime_type as criminal_record_crime_type,
                    cr.description as criminal_record_description,
                    u.fullname as arresting_officer_name,
                    u.position as arresting_officer_position
                FROM criminals_arrested ca
                LEFT JOIN criminal_record cr ON ca.criminal_record_id = cr.cri_id
                LEFT JOIN users u ON ca.arresting_officer_id = u.user_id
                WHERE ca.arrest_id = $1
            `;

            const result = await pool.query(query, [arrest_id]);
            return result.rows[0] || null;
        } catch (error) {
            console.error('Database error in Arrested.getById:', error);
            throw error;
        }
    }

    static async update(arrest_id, updateData) {
        try {
            const fields = [];
            const values = [];
            let paramCount = 0;

            // Build dynamic update query
            Object.keys(updateData).forEach(key => {
                if (updateData[key] !== undefined) {
                    paramCount++;
                    fields.push(`${key} = $${paramCount}`);
                    values.push(updateData[key]);
                }
            });

            if (fields.length === 0) {
                throw new Error('No fields to update');
            }

            // Add updated_at timestamp
            paramCount++;
            fields.push(`updated_at = $${paramCount}`);
            values.push(new Date());

            paramCount++;
            values.push(arrest_id);

            const query = `
                UPDATE criminals_arrested 
                SET ${fields.join(', ')}
                WHERE arrest_id = $${paramCount}
                RETURNING *
            `;

            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Database error in Arrested.update:', error);
            throw error;
        }
    }

    static async delete(arrest_id) {
        try {
            const query = 'DELETE FROM criminals_arrested WHERE arrest_id = $1';
            await pool.query(query, [arrest_id]);
            return true;
        } catch (error) {
            console.error('Database error in Arrested.delete:', error);
            throw error;
        }
    }

    static async search(searchQuery, options = {}) {
        try {
            let query = `
                SELECT 
                    ca.*,
                    cr.crime_type as criminal_record_crime_type,
                    cr.description as criminal_record_description,
                    u.fullname as arresting_officer_name,
                    u.position as arresting_officer_position
                FROM criminals_arrested ca
                LEFT JOIN criminal_record cr ON ca.criminal_record_id = cr.cri_id
                LEFT JOIN users u ON ca.arresting_officer_id = u.user_id
                WHERE (
                    ca.fullname ILIKE $1 OR 
                    ca.crime_type ILIKE $1 OR 
                    ca.id_number ILIKE $1 OR
                    ca.arrest_location ILIKE $1
                )
            `;

            const conditions = [];
            const values = [`%${searchQuery}%`];
            let paramCount = 1;

            // Apply additional filters
            if (options.crime_type) {
                paramCount++;
                conditions.push(`ca.crime_type = $${paramCount}`);
                values.push(options.crime_type);
            }

            if (options.date_from) {
                paramCount++;
                conditions.push(`ca.date_arrested >= $${paramCount}`);
                values.push(options.date_from);
            }

            if (options.date_to) {
                paramCount++;
                conditions.push(`ca.date_arrested <= $${paramCount}`);
                values.push(options.date_to);
            }

            if (conditions.length > 0) {
                query += ' AND ' + conditions.join(' AND ');
            }

            query += ' ORDER BY ca.date_arrested DESC';

            // Apply pagination
            if (options.page && options.limit) {
                const offset = (options.page - 1) * options.limit;
                paramCount++;
                query += ` LIMIT $${paramCount}`;
                values.push(options.limit);
                
                paramCount++;
                query += ` OFFSET $${paramCount}`;
                values.push(offset);
            }

            const result = await pool.query(query, values);

            // Get total count for pagination
            let countQuery = `
                SELECT COUNT(*) as total 
                FROM criminals_arrested ca
                WHERE (
                    ca.fullname ILIKE $1 OR 
                    ca.crime_type ILIKE $1 OR 
                    ca.id_number ILIKE $1 OR
                    ca.arrest_location ILIKE $1
                )
            `;
            
            if (conditions.length > 0) {
                countQuery += ' AND ' + conditions.join(' AND ');
            }

            const countValues = values.slice(0, values.length - (options.page && options.limit ? 2 : 0));
            const countResult = await pool.query(countQuery, countValues);
            const total = parseInt(countResult.rows[0].total);

            return {
                records: result.rows,
                pagination: {
                    page: options.page || 1,
                    limit: options.limit || result.rows.length,
                    total: total,
                    totalPages: options.limit ? Math.ceil(total / options.limit) : 1
                }
            };
        } catch (error) {
            console.error('Database error in Arrested.search:', error);
            throw error;
        }
    }

    static async getStatistics() {
        try {
            // Total arrests
            const totalQuery = 'SELECT COUNT(*) as total FROM criminals_arrested';
            const totalResult = await pool.query(totalQuery);
            const totalArrests = parseInt(totalResult.rows[0].total);

            // Arrests this month
            const thisMonthQuery = `
                SELECT COUNT(*) as total 
                FROM criminals_arrested 
                WHERE date_arrested >= date_trunc('month', CURRENT_DATE)
            `;
            const thisMonthResult = await pool.query(thisMonthQuery);
            const thisMonthArrests = parseInt(thisMonthResult.rows[0].total);

            // Arrests this year
            const thisYearQuery = `
                SELECT COUNT(*) as total 
                FROM criminals_arrested 
                WHERE date_arrested >= date_trunc('year', CURRENT_DATE)
            `;
            const thisYearResult = await pool.query(thisYearQuery);
            const thisYearArrests = parseInt(thisYearResult.rows[0].total);

            // Crime type distribution
            const crimeTypeQuery = `
                SELECT crime_type, COUNT(*) as count 
                FROM criminals_arrested 
                GROUP BY crime_type 
                ORDER BY count DESC
            `;
            const crimeTypeResult = await pool.query(crimeTypeQuery);
            const crimeTypeDistribution = {};
            crimeTypeResult.rows.forEach(row => {
                crimeTypeDistribution[row.crime_type] = parseInt(row.count);
            });

            // Monthly arrest trends (last 6 months)
            const monthlyTrendsQuery = `
                SELECT 
                    TO_CHAR(date_arrested, 'Mon YYYY') as month,
                    COUNT(*) as count
                FROM criminals_arrested 
                WHERE date_arrested >= CURRENT_DATE - INTERVAL '6 months'
                GROUP BY TO_CHAR(date_arrested, 'Mon YYYY'), DATE_TRUNC('month', date_arrested)
                ORDER BY DATE_TRUNC('month', date_arrested)
            `;
            const monthlyTrendsResult = await pool.query(monthlyTrendsQuery);
            const monthlyTrends = {};
            monthlyTrendsResult.rows.forEach(row => {
                monthlyTrends[row.month] = parseInt(row.count);
            });

            // Recent arrests (last 7 days)
            const recentArrestsQuery = `
                SELECT 
                    ca.*,
                    cr.crime_type as criminal_record_crime_type,
                    cr.description as criminal_record_description,
                    u.fullname as arresting_officer_name,
                    u.position as arresting_officer_position
                FROM criminals_arrested ca
                LEFT JOIN criminal_record cr ON ca.criminal_record_id = cr.cri_id
                LEFT JOIN users u ON ca.arresting_officer_id = u.user_id
                WHERE ca.date_arrested >= CURRENT_DATE - INTERVAL '7 days'
                ORDER BY ca.date_arrested DESC
                LIMIT 10
            `;
            const recentArrestsResult = await pool.query(recentArrestsQuery);

            // Arrests by location (top 10)
            const locationStatsQuery = `
                SELECT arrest_location, COUNT(*) as count 
                FROM criminals_arrested 
                WHERE arrest_location IS NOT NULL
                GROUP BY arrest_location 
                ORDER BY count DESC
                LIMIT 10
            `;
            const locationStatsResult = await pool.query(locationStatsQuery);
            const arrestsByLocation = {};
            locationStatsResult.rows.forEach(row => {
                arrestsByLocation[row.arrest_location] = parseInt(row.count);
            });

            // Top arresting officers
            const officerStatsQuery = `
                SELECT 
                    u.fullname as officer_name,
                    u.position,
                    COUNT(*) as arrests_made
                FROM criminals_arrested ca
                JOIN users u ON ca.arresting_officer_id = u.user_id
                GROUP BY u.user_id, u.fullname, u.position
                ORDER BY arrests_made DESC
                LIMIT 10
            `;
            const officerStatsResult = await pool.query(officerStatsQuery);

            return {
                totalArrests,
                thisMonthArrests,
                thisYearArrests,
                crimeTypeDistribution,
                monthlyTrends,
                recentArrests: recentArrestsResult.rows,
                arrestsByLocation,
                topOfficers: officerStatsResult.rows
            };
        } catch (error) {
            console.error('Database error in Arrested.getStatistics:', error);
            throw error;
        }
    }

    // These methods would need to be implemented if you want image upload functionality
    // For now, they're placeholder methods
    static async uploadImage(fileBuffer, fileName) {
        // TODO: Implement image upload to your preferred storage service
        // This could be AWS S3, Cloudinary, or local storage
        throw new Error('Image upload not implemented yet');
    }

    static async deleteImage(fileName) {
        // TODO: Implement image deletion from your storage service
        throw new Error('Image deletion not implemented yet');
    }
}

module.exports = Arrested;