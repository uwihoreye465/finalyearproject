const pool = require('../config/database');

class Sinner {
  // Create a new criminal record
  static async create(criminalData) {
    const {
      citizen_id,
      passport_holder_id,
      id_type,
      id_number,
      first_name,
      last_name,
      gender,
      date_of_birth,
      marital_status,
      country,
      province,
      district,
      sector,
      cell,
      village,
      address_now,
      crime_type,
      description,
      date_committed
    } = criminalData;

    const query = `
      INSERT INTO Criminal_record (
        citizen_id, passport_holder_id, id_type, id_number, first_name, last_name,
        gender, date_of_birth, marital_status, country, province, district,
        sector, cell, village, address_now, crime_type, description, date_committed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *
    `;

    const values = [
      citizen_id, passport_holder_id, id_type, id_number, first_name, last_name,
      gender, date_of_birth, marital_status, country, province, district,
      sector, cell, village, address_now, crime_type, description, date_committed
    ];

    try {
      const result = await pool.query(query, values);
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Error creating criminal record:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all criminal records with pagination
  static async getAll(page = 1, limit = 10, searchTerm = '') {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT cr.*, 
             rc.phone as citizen_phone, rc.email as citizen_email,
             ph.phone as passport_phone, ph.email as passport_email
      FROM Criminal_record cr
      LEFT JOIN rwandan_citizen rc ON cr.citizen_id = rc.id
      LEFT JOIN passport_holder ph ON cr.passport_holder_id = ph.id
    `;

    let countQuery = `SELECT COUNT(*) FROM Criminal_record cr`;
    let queryParams = [];
    let countParams = [];

    if (searchTerm) {
      query += ` WHERE (cr.first_name ILIKE $1 OR cr.last_name ILIKE $1 OR cr.id_number ILIKE $1 OR cr.crime_type ILIKE $1)`;
      countQuery += ` WHERE (cr.first_name ILIKE $1 OR cr.last_name ILIKE $1 OR cr.id_number ILIKE $1 OR cr.crime_type ILIKE $1)`;
      queryParams.push(`%${searchTerm}%`);
      countParams.push(`%${searchTerm}%`);
    }

    query += ` ORDER BY cr.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    try {
      const [records, count] = await Promise.all([
        pool.query(query, queryParams),
        pool.query(countQuery, countParams)
      ]);

      return {
        success: true,
        data: records.rows,
        pagination: {
          page,
          limit,
          total: parseInt(count.rows[0].count),
          totalPages: Math.ceil(count.rows[0].count / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching criminal records:', error);
      return { success: false, error: error.message };
    }
  }

  // Get criminal record by ID
  static async getById(id) {
    const query = `
      SELECT cr.*, 
             rc.phone as citizen_phone, rc.email as citizen_email,
             ph.phone as passport_phone, ph.email as passport_email
      FROM Criminal_record cr
      LEFT JOIN rwandan_citizen rc ON cr.citizen_id = rc.id
      LEFT JOIN passport_holder ph ON cr.passport_holder_id = ph.id
      WHERE cr.cri_id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return { success: false, error: 'Criminal record not found' };
      }
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Error fetching criminal record:', error);
      return { success: false, error: error.message };
    }
  }

  // Update criminal record
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'cri_id') {
        fields.push(`${key} = $${paramCount}`);
        values.push(updateData[key]);
        paramCount++;
      }
    });

    if (fields.length === 0) {
      return { success: false, error: 'No fields to update' };
    }

    values.push(id);
    const query = `
      UPDATE Criminal_record 
      SET ${fields.join(', ')}
      WHERE cri_id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return { success: false, error: 'Criminal record not found' };
      }
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Error updating criminal record:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete criminal record
  static async delete(id) {
    const query = `DELETE FROM Criminal_record WHERE cri_id = $1 RETURNING *`;

    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return { success: false, error: 'Criminal record not found' };
      }
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Error deleting criminal record:', error);
      return { success: false, error: error.message };
    }
  }

  // Get criminal records by ID number
  static async getByIdNumber(idNumber) {
    const query = `
      SELECT cr.*, 
             rc.phone as citizen_phone, rc.email as citizen_email,
             ph.phone as passport_phone, ph.email as passport_email
      FROM Criminal_record cr
      LEFT JOIN rwandan_citizen rc ON cr.citizen_id = rc.id
      LEFT JOIN passport_holder ph ON cr.passport_holder_id = ph.id
      WHERE cr.id_number = $1
      ORDER BY cr.created_at DESC
    `;

    try {
      const result = await pool.query(query, [idNumber]);
      return { success: true, data: result.rows };
    } catch (error) {
      console.error('Error fetching criminal records by ID:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = Sinner;