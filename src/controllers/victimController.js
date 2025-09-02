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
  // Add new victim record - CORRECTED
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
        sinner_identification,
        crime_type,
        evidence,
        date_committed,
        criminal_id
      } = req.body;

      console.log('Received victim data:', req.body);

      // Check if person exists in appropriate table first
      let personExists = false;
      if (id_type === 'passport') {
        const passportCheck = await client.query(
          'SELECT id FROM passport_holders WHERE passport_number = $1',
          [id_number]
        );
        personExists = passportCheck.rows.length > 0;
      } else {
        const citizenCheck = await client.query(
          'SELECT id FROM rwandan_citizens WHERE id_number = $1 AND id_type = $2',
          [id_number, id_type]
        );
        personExists = citizenCheck.rows.length > 0;
      }

      if (!personExists) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'Person with this ID not found in citizen or passport records'
        });
      }

      // Insert victim record (marital_status will be auto-filled by trigger)
      const result = await client.query(
        `INSERT INTO victim 
         (id_type, id_number, address_now, phone, victim_email,
          sinner_identification, crime_type, evidence, date_committed, criminal_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING *`,
        [
          id_type, 
          id_number, 
          address_now, 
          phone, 
          victim_email || null,
          sinner_identification, 
          crime_type, 
          evidence, 
          date_committed, 
          criminal_id || null
        ]
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
      
      if (error.code === '23505') {
        res.status(400).json({
          success: false,
          message: 'Victim record already exists for this person'
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

  // Get victim statistics with province/district breakdown
  async getVictimStatistics(req, res) {
    try {
      // Overview statistics
      const overviewStats = await pool.query(`
        SELECT 
          COUNT(*) as total_victims,
          COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_victims,
          COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_victims,
          COUNT(CASE WHEN citizen_id IS NOT NULL THEN 1 END) as citizen_victims,
          COUNT(CASE WHEN passport_holder_id IS NOT NULL THEN 1 END) as passport_victims,
          COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_victims,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_victims,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as month_victims
        FROM victim
      `);

      // Province statistics
      const provinceStats = await pool.query(`
        SELECT 
          COALESCE(province, 'Unknown') as province,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM victim WHERE province IS NOT NULL), 0)), 2) as percentage
        FROM victim
        WHERE province IS NOT NULL
        GROUP BY province
        ORDER BY count DESC
      `);

      // District statistics
      const districtStats = await pool.query(`
        SELECT 
          COALESCE(province, 'Unknown') as province,
          COALESCE(district, 'Unknown') as district,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM victim WHERE district IS NOT NULL), 0)), 2) as percentage
        FROM victim
        WHERE district IS NOT NULL
        GROUP BY province, district
        ORDER BY count DESC
        LIMIT 15
      `);

      // Crime type statistics
      const crimeStats = await pool.query(`
        SELECT 
          crime_type, 
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM victim), 0)), 2) as percentage
        FROM victim 
        GROUP BY crime_type 
        ORDER BY count DESC 
        LIMIT 10
      `);

      // Recent activity
      const recentActivity = await pool.query(`
        SELECT 
          vic_id,
          first_name,
          last_name,
          crime_type,
          province,
          district,
          created_at,
          id_number
        FROM victim
        ORDER BY created_at DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        data: {
          overview: overviewStats.rows[0],
          provinces: provinceStats.rows,
          districts: districtStats.rows,
          crimeTypes: crimeStats.rows,
          recentActivity: recentActivity.rows
        }
      });

    } catch (error) {
      console.error('Get victim statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get victim statistics'
      });
    }
  }

  // Get all victims with pagination and filtering
  async getAllVictims(req, res) {
    try {
      const { page = 1, limit = 10, crime_type, gender, search } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = '';
      const queryParams = [];
      let paramIndex = 1;

      const conditions = [];

      if (crime_type && crime_type.trim() !== '') {
        conditions.push(`v.crime_type ILIKE $${paramIndex}`);
        queryParams.push(`%${crime_type}%`);
        paramIndex++;
      }

      if (gender && gender.trim() !== '') {
        conditions.push(`v.gender = $${paramIndex}`);
        queryParams.push(gender);
        paramIndex++;
      }

      if (search && search.trim() !== '') {
        conditions.push(`(
          v.first_name ILIKE $${paramIndex} OR 
          v.last_name ILIKE $${paramIndex} OR 
          v.id_number ILIKE $${paramIndex} OR
          v.crime_type ILIKE $${paramIndex} OR
          v.sinner_identification ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      // Count total records
      const countQuery = `SELECT COUNT(*) as total FROM victim v ${whereClause}`;
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const dataQuery = `
        SELECT v.*, 
               CASE 
                 WHEN v.citizen_id IS NOT NULL THEN 'citizen'
                 WHEN v.passport_holder_id IS NOT NULL THEN 'passport'
                 ELSE 'unknown'
               END as person_type
        FROM victim v
        ${whereClause}
        ORDER BY v.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(parseInt(limit), offset);
      const dataResult = await pool.query(dataQuery, queryParams);

      res.json({
        success: true,
        data: {
          victims: dataResult.rows,
          pagination: paginate(total, parseInt(page), parseInt(limit))
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

      const result = await pool.query(`
        SELECT v.*,
               CASE 
                 WHEN v.citizen_id IS NOT NULL THEN 'citizen'
                 WHEN v.passport_holder_id IS NOT NULL THEN 'passport'
                 ELSE 'unknown'
               END as person_type
        FROM victim v 
        WHERE v.vic_id = $1
      `, [id]);

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
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { id } = req.params;
      const updates = req.body;

      // Check if victim exists
      const existingVictim = await client.query(
        'SELECT * FROM victim WHERE vic_id = $1',
        [id]
      );

      if (existingVictim.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Victim record not found'
        });
      }

      // Remove auto-filled fields that shouldn't be updated directly
      const restrictedFields = [
        'vic_id', 'citizen_id', 'passport_holder_id', 'first_name', 'last_name', 
        'gender', 'date_of_birth', 'province', 'district', 'sector', 
        'cell', 'village', 'country_of_residence', 'id_type', 
        'id_number', 'created_at', 'marital_status'
      ];

      // Create clean updates object
      const cleanUpdates = {};
      for (const [key, value] of Object.entries(updates)) {
        if (!restrictedFields.includes(key)) {
          cleanUpdates[key] = value;
        }
      }

      if (Object.keys(cleanUpdates).length === 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({
          success: false,
          message: 'No valid fields provided for update'
        });
      }

      const setClause = Object.keys(cleanUpdates)
        .map((key, index) => `${key} = $${index + 2}`)
        .join(', ');

      const values = [id, ...Object.values(cleanUpdates)];

      const result = await client.query(
        `UPDATE victim SET ${setClause} WHERE vic_id = $1 RETURNING *`,
        values
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Victim record updated successfully',
        data: { victim: result.rows[0] }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Update victim error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update victim record'
      });
    } finally {
      client.release();
    }
  }

  // Delete victim record
  async deleteVictim(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { id } = req.params;

      // Check if victim is referenced in criminal records
      const criminalReference = await client.query(
        'SELECT cri_id FROM criminal_record WHERE victim_id = $1',
        [id]
      );

      if (criminalReference.rows.length > 0) {
        // Update criminal records to remove victim reference
        await client.query(
          'UPDATE criminal_record SET victim_id = NULL WHERE victim_id = $1',
          [id]
        );
      }

      // Delete the victim record
      const result = await client.query(
        'DELETE FROM victim WHERE vic_id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Victim record not found'
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Victim record deleted successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Delete victim error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete victim record'
      });
    } finally {
      client.release();
    }
  }

  // Get recent victims
  async getRecentVictims(req, res) {
    try {
      const { limit = 10 } = req.query;

      const result = await pool.query(`
        SELECT 
          vic_id,
          first_name,
          last_name,
          crime_type,
          province,
          district,
          created_at,
          id_number,
          CASE 
            WHEN citizen_id IS NOT NULL THEN 'citizen'
            WHEN passport_holder_id IS NOT NULL THEN 'passport'
            ELSE 'unknown'
          END as person_type
        FROM victim
        ORDER BY created_at DESC
        LIMIT $1
      `, [parseInt(limit)]);

      res.json({
        success: true,
        data: {
          victims: result.rows
        }
      });

    } catch (error) {
      console.error('Get recent victims error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recent victims'
      });
    }
  }

  // Search victims by ID number
  async searchVictimByIdNumber(req, res) {
    try {
      const { idNumber } = req.params;

      const result = await pool.query(`
        SELECT v.*,
               CASE 
                 WHEN v.citizen_id IS NOT NULL THEN 'citizen'
                 WHEN v.passport_holder_id IS NOT NULL THEN 'passport'
                 ELSE 'unknown'
               END as person_type
        FROM victim v
        WHERE v.id_number = $1
        ORDER BY v.created_at DESC
      `, [idNumber.trim()]);

      res.json({
        success: true,
        data: {
          victims: result.rows,
          count: result.rows.length
        }
      });

    } catch (error) {
      console.error('Search victim error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search victims'
      });
    }
  }
}

module.exports = new VictimController();