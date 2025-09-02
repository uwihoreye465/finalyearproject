// const pool = require('../config/database');
// const { paginate } = require('../utils/pagination');

// class CriminalRecordController {
//   // Search person by ID number with Kinyarwanda messages
//   async searchPerson(req, res) {
//     try {
//       const { idNumber } = req.params;
      
//       // First check in rwandan_citizens
//       let citizenResult = await pool.query(
//         'SELECT * FROM rwandan_citizens WHERE id_number = $1',
//         [idNumber]
//       );
      
//       let person = null;
//       let personType = null;
      
//       if (citizenResult.rows.length > 0) {
//         person = citizenResult.rows[0];
//         personType = 'citizen';
//       } else {
//         // Check in passport_holders
//         const passportResult = await pool.query(
//           'SELECT * FROM passport_holders WHERE passport_number = $1',
//           [idNumber]
//         );
        
//         if (passportResult.rows.length > 0) {
//           person = passportResult.rows[0];
//           personType = 'passport';
//         }
//       }
      
//       if (!person) {
//         return res.status(404).json({
//           success: false,
//           message: 'Ntabwo uyu muntu aboneka mu bwandiko'
//         });
//       }
      
//       // Check for criminal records
//       const criminalRecords = await pool.query(
//         `SELECT cr.* FROM criminal_record cr 
//          WHERE cr.id_number = $1`,
//         [idNumber]
//       );
      
//       const response = {
//         success: true,
//         data: {
//           person: person,
//           personType: personType,
//           hasCrimes: criminalRecords.rows.length > 0,
//           message: criminalRecords.rows.length > 0 
//             ? "Ufite ibyaha wahunze ubutabera" 
//             : "Uri umwere",
//           criminalRecords: criminalRecords.rows
//         }
//       };
      
//       res.json(response);

//     } catch (error) {
//       console.error('Search person error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Ikosa ry\'imbere mu gushaka uyu muntu'
//       });
//     }
//   }

//   // Get all criminal records with pagination
//   async getAllCriminalRecords(req, res) {
//     try {
//       const { page = 1, limit = 10, crime_type, gender } = req.query;
//       const offset = (page - 1) * limit;

//       let whereClause = '';
//       const queryParams = [];
//       let paramIndex = 1;

//       if (crime_type) {
//         whereClause = `WHERE cr.crime_type ILIKE $${paramIndex}`;
//         queryParams.push(`%${crime_type}%`);
//         paramIndex++;
//       }

//       if (gender) {
//         whereClause += whereClause ? ` AND ` : `WHERE `;
//         whereClause += `cr.gender = $${paramIndex}`;
//         queryParams.push(gender);
//         paramIndex++;
//       }

//       // Count total records
//       const countQuery = `SELECT COUNT(*) as total FROM criminal_record cr ${whereClause}`;
//       const countResult = await pool.query(countQuery, queryParams);
//       const total = parseInt(countResult.rows[0].total);

//       // Get paginated results
//       const dataQuery = `
//         SELECT cr.*
//         FROM criminal_record cr
//         ${whereClause}
//         ORDER BY cr.cri_id DESC
//         LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
//       `;

//       queryParams.push(limit, offset);
//       const dataResult = await pool.query(dataQuery, queryParams);

//       res.json({
//         success: true,
//         data: {
//           criminalRecords: dataResult.rows,
//           pagination: paginate(total, page, limit)
//         }
//       });

//     } catch (error) {
//       console.error('Get criminal records error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get criminal records'
//       });
//     }
//   }

//   // Add new criminal record
//   async addCriminalRecord(req, res) {
//     const client = await pool.connect();

//     try {
//       await client.query('BEGIN');

//       const {
//         id_type,
//         id_number,
//         phone,
//         address_now,
//         crime_type,
//         description,
//         date_committed,
//         victim_id
//       } = req.body;

//       // Insert criminal record (auto-fill trigger will populate personal details)
//       const result = await client.query(
//         `INSERT INTO criminal_record 
//          (id_type, id_number, phone, address_now, crime_type, description, date_committed, victim_id)
//          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
//          RETURNING *`,
//         [id_type, id_number, phone, address_now, crime_type, description, date_committed, victim_id]
//       );

//       await client.query('COMMIT');

//       res.status(201).json({
//         success: true,
//         message: 'Criminal record added successfully',
//         data: { criminalRecord: result.rows[0] }
//       });

//     } catch (error) {
//       await client.query('ROLLBACK');
//       console.error('Add criminal record error:', error);
      
//       if (error.message.includes('not found')) {
//         res.status(400).json({
//           success: false,
//           message: 'Person with this ID not found in citizen or passport records'
//         });
//       } else {
//         res.status(500).json({
//           success: false,
//           message: 'Failed to add criminal record'
//         });
//       }
//     } finally {
//       client.release();
//     }
//   }

//   // Get criminal record by ID
//   async getCriminalRecordById(req, res) {
//     try {
//       const { id } = req.params;

//       const result = await pool.query(
//         'SELECT * FROM criminal_record WHERE cri_id = $1',
//         [id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: 'Criminal record not found'
//         });
//       }

//       res.json({
//         success: true,
//         data: { criminalRecord: result.rows[0] }
//       });

//     } catch (error) {
//       console.error('Get criminal record error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get criminal record'
//       });
//     }
//   }

//   // Update criminal record
//   async updateCriminalRecord(req, res) {
//     try {
//       const { id } = req.params;
//       const updates = req.body;

//       // Remove fields that shouldn't be updated directly
//       delete updates.citizen_id;
//       delete updates.passport_holder_id;
//       delete updates.first_name;
//       delete updates.last_name;
//       delete updates.gender;
//       delete updates.date_of_birth;

//       const setClause = Object.keys(updates)
//         .map((key, index) => `${key} = $${index + 2}`)
//         .join(', ');

//       const values = [id, ...Object.values(updates)];

//       const result = await pool.query(
//         `UPDATE criminal_record SET ${setClause} WHERE cri_id = $1 RETURNING *`,
//         values
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: 'Criminal record not found'
//         });
//       }

//       res.json({
//         success: true,
//         message: 'Criminal record updated successfully',
//         data: { criminalRecord: result.rows[0] }
//       });

//     } catch (error) {
//       console.error('Update criminal record error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to update criminal record'
//       });
//     }
//   }

//   // Delete criminal record
//   async deleteCriminalRecord(req, res) {
//     try {
//       const { id } = req.params;

//       const result = await pool.query(
//         'DELETE FROM criminal_record WHERE cri_id = $1 RETURNING *',
//         [id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: 'Criminal record not found'
//         });
//       }

//       res.json({
//         success: true,
//         message: 'Criminal record deleted successfully'
//       });

//     } catch (error) {
//       console.error('Delete criminal record error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to delete criminal record'
//       });
//     }
//   }
// }

// module.exports = new CriminalRecordController();


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
      const { page = 1, limit = 10, crime_type, gender, search } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = '';
      const queryParams = [];
      let paramIndex = 1;

      const conditions = [];

      if (crime_type && crime_type.trim() !== '') {
        conditions.push(`cr.crime_type ILIKE $${paramIndex}`);
        queryParams.push(`%${crime_type}%`);
        paramIndex++;
      }

      if (gender && gender.trim() !== '') {
        conditions.push(`cr.gender = $${paramIndex}`);
        queryParams.push(gender);
        paramIndex++;
      }

      if (search && search.trim() !== '') {
        conditions.push(`(
          cr.first_name ILIKE $${paramIndex} OR 
          cr.last_name ILIKE $${paramIndex} OR 
          cr.id_number ILIKE $${paramIndex} OR
          cr.crime_type ILIKE $${paramIndex}
        )`);
        queryParams.push(`%${search}%`);
        paramIndex++;
      }

      if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
      }

      // Count total records
      const countQuery = `SELECT COUNT(*) as total FROM criminal_record cr ${whereClause}`;
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated results
      const dataQuery = `
        SELECT cr.*,
               CASE 
                 WHEN cr.citizen_id IS NOT NULL THEN 'citizen'
                 WHEN cr.passport_holder_id IS NOT NULL THEN 'passport'
                 ELSE 'unknown'
               END as person_type
        FROM criminal_record cr
        ${whereClause}
        ORDER BY cr.created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(parseInt(limit), offset);
      const dataResult = await pool.query(dataQuery, queryParams);

      res.json({
        success: true,
        data: {
          criminalRecords: dataResult.rows,
          pagination: paginate(total, parseInt(page), parseInt(limit))
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

  // Get criminal record statistics with province/district breakdown
  async getCriminalRecordStatistics(req, res) {
    try {
      // Overview statistics
      const overviewStats = await pool.query(`
        SELECT 
          COUNT(*) as total_criminals,
          COUNT(CASE WHEN gender = 'Male' THEN 1 END) as male_criminals,
          COUNT(CASE WHEN gender = 'Female' THEN 1 END) as female_criminals,
          COUNT(CASE WHEN citizen_id IS NOT NULL THEN 1 END) as citizen_criminals,
          COUNT(CASE WHEN passport_holder_id IS NOT NULL THEN 1 END) as passport_criminals,
          COUNT(CASE WHEN DATE(created_at) = CURRENT_DATE THEN 1 END) as today_criminals,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as week_criminals,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as month_criminals,
          COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '1 year' THEN 1 END) as year_criminals
        FROM criminal_record
      `);

      // Province statistics
      const provinceStats = await pool.query(`
        SELECT 
          COALESCE(province, 'Unknown') as province,
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM criminal_record WHERE province IS NOT NULL), 0)), 2) as percentage
        FROM criminal_record
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
          ROUND((COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM criminal_record WHERE district IS NOT NULL), 0)), 2) as percentage
        FROM criminal_record
        WHERE district IS NOT NULL
        GROUP BY province, district
        ORDER BY count DESC
        LIMIT 15
      `);

      // Crime type statistics
      const crimeTypeStats = await pool.query(`
        SELECT 
          crime_type, 
          COUNT(*) as count,
          ROUND((COUNT(*) * 100.0 / NULLIF((SELECT COUNT(*) FROM criminal_record), 0)), 2) as percentage
        FROM criminal_record 
        WHERE crime_type IS NOT NULL
        GROUP BY crime_type 
        ORDER BY count DESC 
        LIMIT 10
      `);

      // Monthly trend for the last 12 months
      const monthlyTrend = await pool.query(`
        SELECT 
          TO_CHAR(DATE_TRUNC('month', created_at), 'YYYY-MM') as month,
          COUNT(*) as count
        FROM criminal_record
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      `);

      // Recent activity
      const recentActivity = await pool.query(`
        SELECT 
          cri_id,
          first_name,
          last_name,
          crime_type,
          province,
          district,
          created_at,
          id_number
        FROM criminal_record
        ORDER BY created_at DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        data: {
          overview: overviewStats.rows[0],
          provinces: provinceStats.rows,
          districts: districtStats.rows,
          crimeTypes: crimeTypeStats.rows,
          monthlyTrend: monthlyTrend.rows,
          recentActivity: recentActivity.rows
        }
      });

    } catch (error) {
      console.error('Get criminal statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get criminal statistics'
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
        [id_type, id_number, phone, address_now, crime_type, description || null, date_committed || null, victim_id || null]
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
      } else if (error.code === '23505') {
        res.status(400).json({
          success: false,
          message: 'Criminal record already exists for this person'
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

  // FIXED: Update criminal record - allows updating non-restricted fields
  async updateCriminalRecord(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      
      const { id } = req.params;
      const updates = req.body;

      // Check if record exists
      const existingRecord = await client.query(
        'SELECT * FROM criminal_record WHERE cri_id = $1',
        [id]
      );

      if (existingRecord.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Criminal record not found'
        });
      }

      // Remove fields that shouldn't be updated directly (auto-filled fields)
      const restrictedFields = [
        'cri_id', 'citizen_id', 'passport_holder_id', 'first_name', 'last_name',
        'gender', 'date_of_birth', 'province', 'district', 'sector',
        'cell', 'village', 'country_of_residence', 'created_at', 'marital_status'
      ];

      // Create a clean updates object without restricted fields
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
        `UPDATE criminal_record SET ${setClause} WHERE cri_id = $1 RETURNING *`,
        values
      );

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Criminal record updated successfully',
        data: { criminalRecord: result.rows[0] }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Update criminal record error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update criminal record'
      });
    } finally {
      client.release();
    }
  }

  // Delete criminal record
  async deleteCriminalRecord(req, res) {
    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const { id } = req.params;

      // Check if victim is referenced in victim records
      const victimReference = await client.query(
        'SELECT vic_id FROM victim WHERE criminal_id = $1',
        [id]
      );

      if (victimReference.rows.length > 0) {
        // Update victim records to remove criminal reference
        await client.query(
          'UPDATE victim SET criminal_id = NULL WHERE criminal_id = $1',
          [id]
        );
      }

      const result = await client.query(
        'DELETE FROM criminal_record WHERE cri_id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'Criminal record not found'
        });
      }

      await client.query('COMMIT');

      res.json({
        success: true,
        message: 'Criminal record deleted successfully'
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Delete criminal record error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete criminal record'
      });
    } finally {
      client.release();
    }
  }

  // Get recent criminal records
  async getRecentCriminalRecords(req, res) {
    try {
      const { limit = 10 } = req.query;

      const result = await pool.query(`
        SELECT 
          cri_id,
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
        FROM criminal_record
        ORDER BY created_at DESC
        LIMIT $1
      `, [parseInt(limit)]);

      res.json({
        success: true,
        data: {
          criminalRecords: result.rows
        }
      });

    } catch (error) {
      console.error('Get recent criminal records error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get recent criminal records'
      });
    }
  }
}

module.exports = new CriminalRecordController();