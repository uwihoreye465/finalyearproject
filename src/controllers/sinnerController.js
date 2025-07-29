const pool = require('../config/database');
const { paginate } = require('../utils/pagination');

class SinnerController {
  // Search sinners by National ID
  async searchSinner(req, res) {
    try {
      const { nationalId } = req.params;
      const { page = 1, limit = 10 } = req.query;

      // First, check if citizen exists in rwandan_citizens
      const citizenResult = await pool.query(
        `SELECT rc.*, sr.cri_id, sr.crime_type, sr.description, sr.marital_status as sinner_marital_status
         FROM rwandan_citizens rc
         LEFT JOIN sinners_record sr ON rc.id = sr.citizen_id
         WHERE rc.national_id = $1`,
        [nationalId]
      );

      if (citizenResult.rows.length === 0) {
        // Check if sinner exists with passport/other ID
        const sinnerResult = await pool.query(
          'SELECT * FROM sinners_record WHERE passport_id = $1',
          [nationalId]
        );

        if (sinnerResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'No sinner found with this identification'
          });
        }

        return res.json({
          success: true,
          data: {
            sinners: sinnerResult.rows,
            type: 'foreign_or_refugee',
            pagination: paginate(sinnerResult.rows.length, page, limit)
          }
        });
      }

      const paginatedResults = paginate(citizenResult.rows.length, page, limit);
      const offset = (page - 1) * limit;
      
      const finalResults = citizenResult.rows.slice(offset, offset + limit);

      res.json({
        success: true,
        data: {
          sinners: finalResults,
          type: 'rwandan_citizen',
          pagination: paginatedResults
        }
      });

    } catch (error) {
      console.error('Search sinner error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search sinner'
      });
    }
  }

  // Get all sinners with pagination
  async getAllSinners(req, res) {
    try {
      const { page = 1, limit = 10, crime_type, gender } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = '';
      const queryParams = [];
      let paramIndex = 1;

      if (crime_type) {
        whereClause += `WHERE sr.crime_type ILIKE $${paramIndex}`;
        queryParams.push(`%${crime_type}%`);
        paramIndex++;
      }

      if (gender) {
        whereClause += whereClause ? ` AND ` : `WHERE `;
        whereClause += `(rc.gender = $${paramIndex} OR sr.gender = $${paramIndex})`;
        queryParams.push(gender);
        paramIndex++;
      }

      // Count total records
      const countQuery = `
        SELECT COUNT(*) as total
        FROM sinners_record sr
        LEFT JOIN rwandan_citizens rc ON sr.citizen_id = rc.id
        ${whereClause}
      `;
      
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated results
      const dataQuery = `
        SELECT 
          sr.*,
          rc.national_id,
          COALESCE(rc.first_name, sr.first_name) as first_name,
          COALESCE(rc.last_name, sr.last_name) as last_name,
          COALESCE(rc.gender, sr.gender) as gender,
          COALESCE(rc.date_of_birth, sr.date_of_birth) as date_of_birth,
          rc.province, rc.district as rc_district, rc.sector, rc.cell as rc_cell, rc.village as rc_village,
          sr.district as sr_district, sr.cell as sr_cell, sr.village as sr_village
        FROM sinners_record sr
        LEFT JOIN rwandan_citizens rc ON sr.citizen_id = rc.id
        ${whereClause}
        ORDER BY sr.cri_id DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);
      const dataResult = await pool.query(dataQuery, queryParams);

      res.json({
        success: true,
        data: {
          sinners: dataResult.rows,
          pagination: paginate(total, page, limit)
        }
      });

    } catch (error) {
      console.error('Get all sinners error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get sinners'
      });
    }
  }

  // Add new sinner record
  async addSinner(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const {
        identification_type, // 'rwandan', 'foreign_refugee', 'none'
        national_id,
        passport_id,
        first_name,
        last_name,
        marital_status,
        gender,
        date_of_birth,
        country,
        district,
        cell,
        village,
        crime_type,
        description
      } = req.body;

      let citizen_id = null;

      // If Rwandan citizen, get citizen_id
      if (identification_type === 'rwandan' && national_id) {
        const citizenResult = await client.query(
          'SELECT id FROM rwandan_citizens WHERE national_id = $1',
          [national_id]
        );

        if (citizenResult.rows.length > 0) {
          citizen_id = citizenResult.rows[0].id;
        }
      }

      // Insert sinner record
      const result = await client.query(
        `INSERT INTO sinners_record 
         (citizen_id, passport_id, first_name, last_name, marital_status, gender, 
          date_of_birth, country, district, cell, village, crime_type, description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
         RETURNING *`,
        [citizen_id, passport_id, first_name, last_name, marital_status, gender,
         date_of_birth, country, district, cell, village, crime_type, description]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Sinner record added successfully',
        data: { sinner: result.rows[0] }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Add sinner error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add sinner record'
      });
    } finally {
      client.release();
    }
  }

  // Update sinner record
  async updateSinner(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = [id, ...Object.values(updates)];

      const result = await pool.query(
        `UPDATE sinners_record SET ${setClause} WHERE cri_id = $1 RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Sinner record not found'
        });
      }

      res.json({
        success: true,
        message: 'Sinner record updated successfully',
        data: { sinner: result.rows[0] }
      });

    } catch (error) {
      console.error('Update sinner error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update sinner record'
      });
    }
  }

  // Delete sinner record
  async deleteSinner(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM sinners_record WHERE cri_id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Sinner record not found'
        });
      }

      res.json({
        success: true,
        message: 'Sinner record deleted successfully'
      });

    } catch (error) {
      console.error('Delete sinner error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete sinner record'
      });
    }
  }
}

module.exports = new SinnerController();