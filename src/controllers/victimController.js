// const Victim = require('../models/Victim');
// const { validationResult } = require('express-validator');

// class VictimController {
//   // Create new victim record
//   static async createVictim(req, res) {
//     try {
//       // Check for validation errors
//       const errors = validationResult(req);
//       if (!errors.isEmpty()) {
//         return res.status(400).json({
//           success: false,
//           error: 'Validation failed',
//           details: errors.array()
//         });
//       }

//       const result = await Victim.create(req.body);
      
//       if (result.success) {
//         res.status(201).json({
//           success: true,
//           message: 'Victim record created successfully',
//           data: result.data
//         });
//       } else {
//         res.status(400).json({
//           success: false,
//           error: result.error
//         });
//       }
//     } catch (error) {
//       console.error('Error in createVictim:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Internal server error'
//       });
//     }
//   }

//   // Get all victim records
//   static async getAllVictims(req, res) {
//     try {
//       const page = parseInt(req.query.page) || 1;
//       const limit = parseInt(req.query.limit) || 10;
//       const searchTerm = req.query.search || '';

//       const result = await Victim.getAll(page, limit, searchTerm);

//       if (result.success) {
//         res.status(200).json({
//           success: true,
//           message: 'Victim records fetched successfully',
//           data: result.data,
//           pagination: result.pagination
//         });
//       } else {
//         res.status(400).json({
//           success: false,
//           error: result.error
//         });
//       }
//     } catch (error) {
//       console.error('Error in getAllVictims:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Internal server error'
//       });
//     }
//   }

//   // Get victim record by ID
//   static async getVictimById(req, res) {
//     try {
//       const { id } = req.params;
//       const result = await Victim.getById(id);

//       if (result.success) {
//         res.status(200).json({
//           success: true,
//           message: 'Victim record fetched successfully',
//           data: result.data
//         });
//       } else {
//         res.status(404).json({
//           success: false,
//           error: result.error
//         });
//       }
//     } catch (error) {
//       console.error('Error in getVictimById:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Internal server error'
//       });
//     }
//   }

//   // Update victim record
//   static async updateVictim(req, res) {
//     try {
//       const { id } = req.params;
//       const result = await Victim.update(id, req.body);

//       if (result.success) {
//         res.status(200).json({
//           success: true,
//           message: 'Victim record updated successfully',
//           data: result.data
//         });
//       } else {
//         res.status(400).json({
//           success: false,
//           error: result.error
//         });
//       }
//     } catch (error) {
//       console.error('Error in updateVictim:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Internal server error'
//       });
//     }
//   }

//   // Delete victim record
//   static async deleteVictim(req, res) {
//     try {
//       const { id } = req.params;
//       const result = await Victim.delete(id);

//       if (result.success) {
//         res.status(200).json({
//           success: true,
//           message: 'Victim record deleted successfully',
//           data: result.data
//         });
//       } else {
//         res.status(404).json({
//           success: false,
//           error: result.error
//         });
//       }
//     } catch (error) {
//       console.error('Error in deleteVictim:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Internal server error'
//       });
//     }
//   }

//   // Get victim records by ID number
//   static async getVictimByIdNumber(req, res) {
//     try {
//       const { idNumber } = req.params;
//       const result = await Victim.getByIdNumber(idNumber);

//       if (result.success) {
//         res.status(200).json({
//           success: true,
//           message: 'Victim records fetched successfully',
//           data: result.data
//         });
//       } else {
//         res.status(400).json({
//           success: false,
//           error: result.error
//         });
//       }
//     } catch (error) {
//       console.error('Error in getVictimByIdNumber:', error);
//       res.status(500).json({
//         success: false,
//         error: 'Internal server error'
//       });
//     }
//   }
// }

// module.exports = VictimController;


const pool = require('../config/database');
const { paginate } = require('../utils/pagination');

class VictimController {
  // Add new victim record
  async addVictim(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const {
        id_type,
        id_number,
        address_now,
        phone,
        victim_email,
        marital_status,
        sinner_identification,
        crime_type,
        evidence,
        date_committed,
        criminal_id
      } = req.body;

      // Insert victim record (auto-fill trigger will populate personal details)
      const result = await client.query(
        `INSERT INTO victim 
         (id_type, id_number, address_now, phone, victim_email, marital_status,
          sinner_identification, crime_type, evidence, date_committed, criminal_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING *`,
        [id_type, id_number, address_now, phone, victim_email, marital_status,
         sinner_identification, crime_type, evidence, date_committed, criminal_id]
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
      
      if (error.message.includes('not found')) {
        res.status(400).json({
          success: false,
          message: 'Person with this ID not found in citizen or passport records'
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to add victim record'
        });
      }
    } finally {
      client.release();
    }
  }

  // Get all victims with pagination
  async getAllVictims(req, res) {
    try {
      const { page = 1, limit = 10, crime_type, gender } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = '';
      const queryParams = [];
      let paramIndex = 1;

      if (crime_type) {
        whereClause = `WHERE v.crime_type ILIKE $${paramIndex}`;
        queryParams.push(`%${crime_type}%`);
        paramIndex++;
      }

      if (gender) {
        whereClause += whereClause ? ` AND ` : `WHERE `;
        whereClause += `v.gender = $${paramIndex}`;
        queryParams.push(gender);
        paramIndex++;
      }

      // Count total
      const countQuery = `SELECT COUNT(*) as total FROM victim v ${whereClause}`;
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const dataQuery = `
        SELECT v.*
        FROM victim v
        ${whereClause}
        ORDER BY v.vic_id DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
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
        'SELECT * FROM victim WHERE vic_id = $1',
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

      // Remove auto-filled fields that shouldn't be updated directly
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