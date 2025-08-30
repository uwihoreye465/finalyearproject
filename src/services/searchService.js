const pool = require('../config/database');

class SearchService {
  // Universal search by ID number or passport
  static async searchPerson(searchTerm, searchType = 'all') {
    let results = {
      rwandan_citizens: [],
      passport_holders: [],
      total: 0
    };

    try {
      // Search in rwandan_citizen table
      if (searchType === 'all' || searchType === 'citizen') {
        const citizenResults = await this.searchRwandanCitizen(searchTerm);
        results.rwandan_citizens = citizenResults.data || [];
      }

      // Search in passport_holder table
      if (searchType === 'all' || searchType === 'passport') {
        const passportResults = await this.searchPassportHolder(searchTerm);
        results.passport_holders = passportResults.data || [];
      }

      results.total = results.rwandan_citizens.length + results.passport_holders.length;

      return {
        success: true,
        data: results,
        message: `Found ${results.total} matching record(s)`
      };
    } catch (error) {
      console.error('Error in universal search:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Search Rwandan citizens by ID number
  static async searchRwandanCitizen(searchTerm) {
    const query = `
      SELECT 
        id,
        id_type,
        id_number,
        first_name,
        last_name,
        gender,
        date_of_birth,
        province,
        district,
        sector,
        cell,
        village,
        phone,
        email,
        occupation,
        marital_status,
        created_at,
        'rwandan_citizen' as record_type
      FROM rwandan_citizen 
      WHERE 
        id_number ILIKE $1 
        OR first_name ILIKE $1 
        OR last_name ILIKE $1
        OR CONCAT(first_name, ' ', last_name) ILIKE $1
        OR phone ILIKE $1
        OR email ILIKE $1
      ORDER BY 
        CASE 
          WHEN id_number = $2 THEN 1
          WHEN id_number ILIKE $1 THEN 2
          WHEN CONCAT(first_name, ' ', last_name) ILIKE $1 THEN 3
          ELSE 4
        END,
        created_at DESC
      LIMIT 50
    `;

    try {
      const searchPattern = `%${searchTerm}%`;
      const result = await pool.query(query, [searchPattern, searchTerm]);
      
      return {
        success: true,
        data: result.rows,
        count: result.rows.length
      };
    } catch (error) {
      console.error('Error searching Rwandan citizens:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Search passport holders by passport number
  static async searchPassportHolder(searchTerm) {
    const query = `
      SELECT 
        id,
        passport_number,
        first_name,
        last_name,
        gender,
        date_of_birth,
        nationality,
        country_of_residence,
        address_in_rwanda,
        home_address,
        phone,
        email,
        occupation,
        marital_status,
        passport_issue_date,
        passport_expiry_date,
        issuing_country,
        created_at,
        'passport_holder' as record_type
      FROM passport_holder 
      WHERE 
        passport_number ILIKE $1 
        OR first_name ILIKE $1 
        OR last_name ILIKE $1
        OR CONCAT(first_name, ' ', last_name) ILIKE $1
        OR nationality ILIKE $1
        OR phone ILIKE $1
        OR email ILIKE $1
        OR issuing_country ILIKE $1
      ORDER BY 
        CASE 
          WHEN passport_number = $2 THEN 1
          WHEN passport_number ILIKE $1 THEN 2
          WHEN CONCAT(first_name, ' ', last_name) ILIKE $1 THEN 3
          ELSE 4
        END,
        created_at DESC
      LIMIT 50
    `;

    try {
      const searchPattern = `%${searchTerm}%`;
      const result = await pool.query(query, [searchPattern, searchTerm]);
      
      return {
        success: true,
        data: result.rows,
        count: result.rows.length
      };
    } catch (error) {
      console.error('Error searching passport holders:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // Get person by exact ID number (for auto-fill)
  static async getPersonByExactId(idType, idNumber) {
    try {
      if (idType === 'passport') {
        return await this.getPassportHolderByExactNumber(idNumber);
      } else {
        return await this.getRwandanCitizenByExactId(idType, idNumber);
      }
    } catch (error) {
      console.error('Error getting person by exact ID:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get Rwandan citizen by exact ID
  static async getRwandanCitizenByExactId(idType, idNumber) {
    const query = `
      SELECT *, 'rwandan_citizen' as record_type 
      FROM rwandan_citizen 
      WHERE id_type = $1 AND id_number = $2
    `;

    try {
      const result = await pool.query(query, [idType, idNumber]);
      
      if (result.rows.length > 0) {
        return {
          success: true,
          data: result.rows[0]
        };
      }
      
      return {
        success: false,
        error: 'Person not found'
      };
    } catch (error) {
      console.error('Error getting Rwandan citizen by exact ID:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Get passport holder by exact passport number
  static async getPassportHolderByExactNumber(passportNumber) {
    const query = `
      SELECT *, 'passport_holder' as record_type 
      FROM passport_holder 
      WHERE passport_number = $1
    `;

    try {
      const result = await pool.query(query, [passportNumber]);
      
      if (result.rows.length > 0) {
        return {
          success: true,
          data: result.rows[0]
        };
      }
      
      return {
        success: false,
        error: 'Person not found'
      };
    } catch (error) {
      console.error('Error getting passport holder by exact number:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Advanced search with filters
  static async advancedSearch(filters = {}) {
    const {
      searchTerm = '',
      recordType = 'all', // 'all', 'citizen', 'passport'
      gender = '',
      province = '',
      district = '',
      nationality = '',
      ageRange = { min: null, max: null },
      page = 1,
      limit = 20
    } = filters;

    let results = {
      rwandan_citizens: [],
      passport_holders: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0
      }
    };

    try {
      const offset = (page - 1) * limit;

      // Search citizens with filters
      if (recordType === 'all' || recordType === 'citizen') {
        const citizenQuery = this.buildCitizenSearchQuery(filters);
        const citizenCountQuery = this.buildCitizenCountQuery(filters);
        
        const [citizenResults, citizenCount] = await Promise.all([
          pool.query(citizenQuery.query, [...citizenQuery.params, limit, offset]),
          pool.query(citizenCountQuery.query, citizenCountQuery.params)
        ]);

        results.rwandan_citizens = citizenResults.rows;
      }

      // Search passport holders with filters
      if (recordType === 'all' || recordType === 'passport') {
        const passportQuery = this.buildPassportSearchQuery(filters);
        const passportCountQuery = this.buildPassportCountQuery(filters);
        
        const [passportResults, passportCount] = await Promise.all([
          pool.query(passportQuery.query, [...passportQuery.params, limit, offset]),
          pool.query(passportCountQuery.query, passportCountQuery.params)
        ]);

        results.passport_holders = passportResults.rows;
      }

      const totalRecords = results.rwandan_citizens.length + results.passport_holders.length;
      results.pagination.total = totalRecords;
      results.pagination.totalPages = Math.ceil(totalRecords / limit);

      return {
        success: true,
        data: results,
        message: `Found ${totalRecords} matching record(s)`
      };
    } catch (error) {
      console.error('Error in advanced search:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Build citizen search query
  static buildCitizenSearchQuery(filters) {
    let query = `
      SELECT *, 'rwandan_citizen' as record_type 
      FROM rwandan_citizen 
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;

    if (filters.searchTerm) {
      paramCount++;
      query += ` AND (
        id_number ILIKE $${paramCount} 
        OR first_name ILIKE $${paramCount} 
        OR last_name ILIKE $${paramCount}
        OR CONCAT(first_name, ' ', last_name) ILIKE $${paramCount}
        OR phone ILIKE $${paramCount}
        OR email ILIKE $${paramCount}
      )`;
      params.push(`%${filters.searchTerm}%`);
    }

    if (filters.gender) {
      paramCount++;
      query += ` AND gender = $${paramCount}`;
      params.push(filters.gender);
    }

    if (filters.province) {
      paramCount++;
      query += ` AND province ILIKE $${paramCount}`;
      params.push(`%${filters.province}%`);
    }

    if (filters.district) {
      paramCount++;
      query += ` AND district ILIKE $${paramCount}`;
      params.push(`%${filters.district}%`);
    }

    if (filters.ageRange.min) {
      paramCount++;
      query += ` AND date_of_birth <= $${paramCount}`;
      const maxBirthDate = new Date();
      maxBirthDate.setFullYear(maxBirthDate.getFullYear() - filters.ageRange.min);
      params.push(maxBirthDate.toISOString().split('T')[0]);
    }

    if (filters.ageRange.max) {
      paramCount++;
      query += ` AND date_of_birth >= $${paramCount}`;
      const minBirthDate = new Date();
      minBirthDate.setFullYear(minBirthDate.getFullYear() - filters.ageRange.max);
      params.push(minBirthDate.toISOString().split('T')[0]);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;

    return { query, params };
  }

  // Build passport holder search query
  static buildPassportSearchQuery(filters) {
    let query = `
      SELECT *, 'passport_holder' as record_type 
      FROM passport_holder 
      WHERE 1=1
    `;
    let params = [];
    let paramCount = 0;

    if (filters.searchTerm) {
      paramCount++;
      query += ` AND (
        passport_number ILIKE $${paramCount} 
        OR first_name ILIKE $${paramCount} 
        OR last_name ILIKE $${paramCount}
        OR CONCAT(first_name, ' ', last_name) ILIKE $${paramCount}
        OR nationality ILIKE $${paramCount}
        OR phone ILIKE $${paramCount}
        OR email ILIKE $${paramCount}
        OR issuing_country ILIKE $${paramCount}
      )`;
      params.push(`%${filters.searchTerm}%`);
    }

    if (filters.gender) {
      paramCount++;
      query += ` AND gender = $${paramCount}`;
      params.push(filters.gender);
    }

    if (filters.nationality) {
      paramCount++;
      query += ` AND nationality ILIKE $${paramCount}`;
      params.push(`%${filters.nationality}%`);
    }

    if (filters.ageRange.min) {
      paramCount++;
      query += ` AND date_of_birth <= $${paramCount}`;
      const maxBirthDate = new Date();
      maxBirthDate.setFullYear(maxBirthDate.getFullYear() - filters.ageRange.min);
      params.push(maxBirthDate.toISOString().split('T')[0]);
    }

    if (filters.ageRange.max) {
      paramCount++;
      query += ` AND date_of_birth >= $${paramCount}`;
      const minBirthDate = new Date();
      minBirthDate.setFullYear(minBirthDate.getFullYear() - filters.ageRange.max);
      params.push(minBirthDate.toISOString().split('T')[0]);
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;

    return { query, params };
  }

  // Build count queries for pagination
  static buildCitizenCountQuery(filters) {
    let query = `SELECT COUNT(*) FROM rwandan_citizen WHERE 1=1`;
    let params = [];
    let paramCount = 0;

    if (filters.searchTerm) {
      paramCount++;
      query += ` AND (
        id_number ILIKE $${paramCount} 
        OR first_name ILIKE $${paramCount} 
        OR last_name ILIKE $${paramCount}
        OR CONCAT(first_name, ' ', last_name) ILIKE $${paramCount}
        OR phone ILIKE $${paramCount}
        OR email ILIKE $${paramCount}
      )`;
      params.push(`%${filters.searchTerm}%`);
    }

    // Add other filters similar to buildCitizenSearchQuery
    
    return { query, params };
  }

  static buildPassportCountQuery(filters) {
    let query = `SELECT COUNT(*) FROM passport_holder WHERE 1=1`;
    let params = [];
    let paramCount = 0;

    if (filters.searchTerm) {
      paramCount++;
      query += ` AND (
        passport_number ILIKE $${paramCount} 
        OR first_name ILIKE $${paramCount} 
        OR last_name ILIKE $${paramCount}
        OR CONCAT(first_name, ' ', last_name) ILIKE $${paramCount}
        OR nationality ILIKE $${paramCount}
        OR phone ILIKE $${paramCount}
        OR email ILIKE $${paramCount}
        OR issuing_country ILIKE $${paramCount}
      )`;
      params.push(`%${filters.searchTerm}%`);
    }

    // Add other filters similar to buildPassportSearchQuery
    
    return { query, params };
  }
}

module.exports = SearchService;