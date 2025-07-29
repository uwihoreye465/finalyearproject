const pool = require('../config/database');
const { paginate } = require('../utils/pagination');

class VictimController {
  // Add new victim record
  async addVictim(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const {
        identification_type,
        national_id,
        first_name,
        last_name,
        address,
        marital_status,
        gender,
        sinner_identification,
        crime_type,
        evidence,
        date_committed,
        phone,
        victim_email
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

      const result = await client.query(
        `INSERT INTO victim 
         (citizen_id, first_name, last_name, address, marital_status, gender,
          sinner_identification, crime_type, evidence, date_committed, phone, victim_email)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
         RETURNING *`,
        [citizen_id, first_name, last_name, address, marital_status, gender,
         sinner_identification, crime_type, evidence, date_committed, phone, victim_email]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Victim record added successfully',
        data: { victim: result.rows[0] }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Add victim error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add victim record'
      });
    } finally {
      client.release();
    }
  }

  // Get all victims with pagination
  async getAllVictims(req, res) {
    try {
      const { page = 1, limit = 10, crime_type } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = '';
      const queryParams = [];
      
      if (crime_type) {
        whereClause = 'WHERE v.crime_type ILIKE $1';
        queryParams.push(`%${crime_type}%`);
      }

      // Count total
      const countQuery = `
        SELECT COUNT(*) as total 
        FROM victim v 
        LEFT JOIN rwandan_citizens rc ON v.citizen_id = rc.id 
        ${whereClause}
      `;
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const dataQuery = `
        SELECT 
          v.*,
          rc.national_id,
          COALESCE(rc.first_name, v.first_name) as first_name,
          COALESCE(rc.last_name, v.last_name) as last_name,
          COALESCE(rc.gender, v.gender) as gender,
          rc.province, rc.district, rc.sector, rc.cell, rc.village
        FROM victim v
        LEFT JOIN rwandan_citizens rc ON v.citizen_id = rc.id
        ${whereClause}
        ORDER BY v.vic_id DESC
        LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
      `;

      queryParams.push(limit, offset);
      const dataResult = await pool.query(dataQuery, queryParams);

      res.json({
        success: true,
        data: {
          victims: dataResult.rows,
          pagination: paginate(total, page, limit)
        }
      });

    } catch (error) {
      console.error('Get victims error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get victims'
      });
    }
  }

  // Get victim by ID
  async getVictimById(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT 
          v.*,
          rc.national_id,
          COALESCE(rc.first_name, v.first_name) as first_name,
          COALESCE(rc.last_name, v.last_name) as last_name,
          COALESCE(rc.gender, v.gender) as gender,
          rc.province, rc.district, rc.sector, rc.cell, rc.village
         FROM victim v
         LEFT JOIN rwandan_citizens rc ON v.citizen_id = rc.id
         WHERE v.vic_id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Victim record not found'
        });
      }

      res.json({
        success: true,
        data: { victim: result.rows[0] }
      });

    } catch (error) {
      console.error('Get victim error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get victim'
      });
    }
  }

  // Update victim record
  async updateVictim(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = [id, ...Object.values(updates)];

      const result = await pool.query(
        `UPDATE victim SET ${setClause} WHERE vic_id = $1 RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Victim record not found'
        });
      }

      res.json({
        success: true,
        message: 'Victim record updated successfully',
        data: { victim: result.rows[0] }
      });

    } catch (error) {
      console.error('Update victim error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update victim record'
      });
    }
  }

  // Delete victim record
  async deleteVictim(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM victim WHERE vic_id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Victim record not found'
        });
      }

      res.json({
        success: true,
        message: 'Victim record deleted successfully'
      });

    } catch (error) {
      console.error('Delete victim error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete victim record'
      });
    }
  }
}

module.exports = new VictimController();