const pool = require('../config/database');
const { paginate } = require('../utils/pagination');

class CriminalRecordController {
  // Search person by ID number with Kinyarwanda messages
  async searchPerson(req, res) {
    try {
      const { idNumber } = req.params;
      
      // First check in rwandan_citizens
      let citizenResult = await pool.query(
        'SELECT * FROM rwandan_citizens WHERE id_number = $1',
        [idNumber]
      );
      
      let person = null;
      let personType = null;
      
      if (citizenResult.rows.length > 0) {
        person = citizenResult.rows[0];
        personType = 'citizen';
      } else {
        // Check in passport_holders
        const passportResult = await pool.query(
          'SELECT * FROM passport_holders WHERE passport_number = $1',
          [idNumber]
        );
        
        if (passportResult.rows.length > 0) {
          person = passportResult.rows[0];
          personType = 'passport';
        }
      }
      
      if (!person) {
        return res.status(404).json({
          success: false,
          message: 'Ntabwo uyu muntu aboneka mu bwandiko'
        });
      }
      
      // Check for criminal records
      const criminalRecords = await pool.query(
        `SELECT cr.* FROM criminal_record cr 
         WHERE cr.id_number = $1`,
        [idNumber]
      );
      
      const response = {
        success: true,
        data: {
          person: person,
          personType: personType,
          hasCrimes: criminalRecords.rows.length > 0,
          message: criminalRecords.rows.length > 0 
            ? "Ufite ibyaha wahunze ubutabera" 
            : "Uri umwere",
          criminalRecords: criminalRecords.rows
        }
      };
      
      res.json(response);

    } catch (error) {
      console.error('Search person error:', error);
      res.status(500).json({
        success: false,
        message: 'Ikosa ry\'imbere mu gushaka uyu muntu'
      });
    }
  }

  // Get all criminal records with pagination
  async getAllCriminalRecords(req, res) {
    try {
      const { page = 1, limit = 10, crime_type, gender } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = '';
      const queryParams = [];
      let paramIndex = 1;

      if (crime_type) {
        whereClause = `WHERE cr.crime_type ILIKE $${paramIndex}`;
        queryParams.push(`%${crime_type}%`);
        paramIndex++;
      }

      if (gender) {
        whereClause += whereClause ? ` AND ` : `WHERE `;
        whereClause += `cr.gender = $${paramIndex}`;
        queryParams.push(gender);
        paramIndex++;
      }

      // Count total records
      const countQuery = `SELECT COUNT(*) as total FROM criminal_record cr ${whereClause}`;
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated results
      const dataQuery = `
        SELECT cr.*
        FROM criminal_record cr
        ${whereClause}
        ORDER BY cr.cri_id DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);
      const dataResult = await pool.query(dataQuery, queryParams);

      res.json({
        success: true,
        data: {
          criminalRecords: dataResult.rows,
          pagination: paginate(total, page, limit)
        }
      });

    } catch (error) {
      console.error('Get criminal records error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get criminal records'
      });
    }
  }

  // Add new criminal record
  async addCriminalRecord(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const {
        id_type,
        id_number,
        phone,
        address_now,
        crime_type,
        description,
        date_committed,
        victim_id
      } = req.body;

      // Insert criminal record (auto-fill trigger will populate personal details)
      const result = await client.query(
        `INSERT INTO criminal_record 
         (id_type, id_number, phone, address_now, crime_type, description, date_committed, victim_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [id_type, id_number, phone, address_now, crime_type, description, date_committed, victim_id]
      );

      await client.query('COMMIT');

      res.status(201).json({
        success: true,
        message: 'Criminal record added successfully',
        data: { criminalRecord: result.rows[0] }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Add criminal record error:', error);
      
      if (error.message.includes('not found')) {
        res.status(400).json({
          success: false,
          message: 'Person with this ID not found in citizen or passport records'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to add criminal record'
        });
      }
    } finally {
      client.release();
    }
  }

  // Get criminal record by ID
  async getCriminalRecordById(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'SELECT * FROM criminal_record WHERE cri_id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Criminal record not found'
        });
      }

      res.json({
        success: true,
        data: { criminalRecord: result.rows[0] }
      });

    } catch (error) {
      console.error('Get criminal record error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get criminal record'
      });
    }
  }

  // Update criminal record
  async updateCriminalRecord(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      // Remove fields that shouldn't be updated directly
      delete updates.citizen_id;
      delete updates.passport_holder_id;
      delete updates.first_name;
      delete updates.last_name;
      delete updates.gender;
      delete updates.date_of_birth;

      const setClause = Object.keys(updates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = [id, ...Object.values(updates)];

      const result = await pool.query(
        `UPDATE criminal_record SET ${setClause} WHERE cri_id = $1 RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Criminal record not found'
        });
      }

      res.json({
        success: true,
        message: 'Criminal record updated successfully',
        data: { criminalRecord: result.rows[0] }
      });

    } catch (error) {
      console.error('Update criminal record error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update criminal record'
      });
    }
  }

  // Delete criminal record
  async deleteCriminalRecord(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM criminal_record WHERE cri_id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Criminal record not found'
        });
      }

      res.json({
        success: true,
        message: 'Criminal record deleted successfully'
      });

    } catch (error) {
      console.error('Delete criminal record error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete criminal record'
      });
    }
  }
}

module.exports = new CriminalRecordController();