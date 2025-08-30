const pool = require('../config/database');

class Victim {
  // Create a new victim record
  static async create(victimData) {
    const {
      citizen_id,
      passport_holder_id,
      id_type,
      id_number,
      first_name,
      last_name,
      gender,
      date_of_birth,
      address,
      address_now,
      country,
      province,
      district,
      sector,
      cell,
      village,
      phone,
      victim_email,
      marital_status,
      sinner_identification,
      crime_type,
      evidence,
      date_committed
    } = victimData;

    const query = `
      INSERT INTO victims (
        citizen_id, passport_holder_id, id_type, id_number, first_name, last_name,
        gender, date_of_birth, address, address_now, country, province, district,
        sector, cell, village, phone, victim_email, marital_status,
        sinner_identification, crime_type, evidence, date_committed
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23)
      RETURNING *
    `;

    const values = [
      citizen_id, passport_holder_id, id_type, id_number, first_name, last_name,
      gender, date_of_birth, address, address_now, country, province, district,
      sector, cell, village, phone, victim_email, marital_status,
      sinner_identification, crime_type, evidence, date_committed
    ];

    try {
      const result = await pool.query(query, values);
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Error creating victim record:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all victim records with pagination
  static async getAll(page = 1, limit = 10, searchTerm = '') {
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT v.*, 
             rc.phone as citizen_phone, rc.email as citizen_email,
             ph.phone as passport_phone, ph.email as passport_email
      FROM victims v
      LEFT JOIN rwandan_citizen rc ON v.citizen_id = rc.id
      LEFT JOIN passport_holder ph ON v.passport_holder_id = ph.id
    `;

    let countQuery = `SELECT COUNT(*) FROM victims v`;
    let queryParams = [];
    let countParams = [];

    if (searchTerm) {
      query += ` WHERE (v.first_name ILIKE $1 OR v.last_name ILIKE $1 OR v.id_number ILIKE $1 OR v.crime_type ILIKE $1)`;
      countQuery += ` WHERE (v.first_name ILIKE $1 OR v.last_name ILIKE $1 OR v.id_number ILIKE $1 OR v.crime_type ILIKE $1)`;
      queryParams.push(`%${searchTerm}%`);
      countParams.push(`%${searchTerm}%`);
    }

    query += ` ORDER BY v.created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
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
      console.error('Error fetching victim records:', error);
      return { success: false, error: error.message };
    }
  }

  // Get victim record by ID
  static async getById(id) {
    const query = `
      SELECT v.*, 
             rc.phone as citizen_phone, rc.email as citizen_email,
             ph.phone as passport_phone, ph.email as passport_email
      FROM victims v
      LEFT JOIN rwandan_citizen rc ON v.citizen_id = rc.id
      LEFT JOIN passport_holder ph ON v.passport_holder_id = ph.id
      WHERE v.vic_id = $1
    `;

    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return { success: false, error: 'Victim record not found' };
      }
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Error fetching victim record:', error);
      return { success: false, error: error.message };
    }
  }

  // Update victim record
  static async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && key !== 'vic_id') {
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
      UPDATE victims 
      SET ${fields.join(', ')}
      WHERE vic_id = $${paramCount}
      RETURNING *
    `;

    try {
      const result = await pool.query(query, values);
      if (result.rows.length === 0) {
        return { success: false, error: 'Victim record not found' };
      }
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Error updating victim record:', error);
      return { success: false, error: error.message };
    }
  }

  // Delete victim record
  static async delete(id) {
    const query = `DELETE FROM victims WHERE vic_id = $1 RETURNING *`;

    try {
      const result = await pool.query(query, [id]);
      if (result.rows.length === 0) {
        return { success: false, error: 'Victim record not found' };
      }
      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Error deleting victim record:', error);
      return { success: false, error: error.message };
    }
  }

  // Get victim records by ID number
  static async getByIdNumber(idNumber) {
    const query = `
      SELECT v.*, 
             rc.phone as citizen_phone, rc.email as citizen_email,
             ph.phone as passport_phone, ph.email as passport_email
      FROM victims v
      LEFT JOIN rwandan_citizen rc ON v.citizen_id = rc.id
      LEFT JOIN passport_holder ph ON v.passport_holder_id = ph.id
      WHERE v.id_number = $1
      ORDER BY v.created_at DESC
    `;

    try {
      const result = await pool.query(query, [idNumber]);
      return { success: true, data: result.rows };
    } catch (error) {
      console.error('Error fetching victim records by ID:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = Victim;