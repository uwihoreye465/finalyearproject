const pool = require('../config/database');

const SearchController = {
  // Universal search (searches both tables)
  searchPerson: async (req, res) => {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Search query is required"
        });
      }

      const searchTerm = `%${q}%`;
      let allResults = [];

      // Search in rwandan_citizen table
      try {
        const citizenQuery = `
          SELECT 'citizen' as source, * FROM rwandan_citizen 
          WHERE 
            national_id ILIKE $1 OR
            first_name ILIKE $2 OR 
            last_name ILIKE $3 OR 
            email ILIKE $4
        `;
        
        const params = [searchTerm, searchTerm, searchTerm, searchTerm];
        const citizenResult = await pool.query(citizenQuery, params);
        allResults = [...allResults, ...citizenResult.rows];
      } catch (citizenError) {
        console.error('Error searching citizens:', citizenError);
      }
      
      // Search in passport_holder table
      try {
        const passportQuery = `
          SELECT 'passport' as source, * FROM passport_holder 
          WHERE 
            passport_number ILIKE $1 OR
            first_name ILIKE $2 OR 
            last_name ILIKE $3 OR 
            email ILIKE $4
        `;
        
        const params = [searchTerm, searchTerm, searchTerm, searchTerm];
        const passportResult = await pool.query(passportQuery, params);
        allResults = [...allResults, ...passportResult.rows];
      } catch (passportError) {
        console.error('Error searching passport holders:', passportError);
      }

      res.json({
        success: true,
        message: `Found ${allResults.length} results`,
        data: allResults,
        query: q
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Search Rwandan citizens only
  searchRwandanCitizen: async (req, res) => {
    try {
      const { q } = req.query;
      
      let query = 'SELECT * FROM rwandan_citizen';
      let params = [];
      
      if (q) {
        query += ` WHERE 
          national_id ILIKE $1 OR
          first_name ILIKE $2 OR 
          last_name ILIKE $3 OR 
          email ILIKE $4
        `;
        const searchTerm = `%${q}%`;
        params = [searchTerm, searchTerm, searchTerm, searchTerm];
      }
      
      const result = await pool.query(query, params);
      
      res.json({
        success: true,
        message: `Found ${result.rows.length} citizen records`,
        data: result.rows
      });
    } catch (error) {
      console.error('Citizen search error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Search passport holders only
  searchPassportHolder: async (req, res) => {
    try {
      const { q } = req.query;
      
      let query = 'SELECT * FROM passport_holder';
      let params = [];
      
      if (q) {
        query += ` WHERE 
          passport_number ILIKE $1 OR
          first_name ILIKE $2 OR 
          last_name ILIKE $3 OR 
          email ILIKE $4
        `;
        const searchTerm = `%${q}%`;
        params = [searchTerm, searchTerm, searchTerm, searchTerm];
      }
      
      const result = await pool.query(query, params);
      
      res.json({
        success: true,
        message: `Found ${result.rows.length} passport holder records`,
        data: result.rows
      });
    } catch (error) {
      console.error('Passport holder search error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Advanced search with multiple filters
  advancedSearch: async (req, res) => {
    try {
      const { 
        table, 
        first_name, 
        last_name, 
        email, 
        national_id, 
        passport_number,
        phone
      } = req.query;

      if (!table || !['citizens', 'passport-holders', 'both'].includes(table)) {
        return res.status(400).json({
          success: false,
          message: "Please specify table: 'citizens', 'passport-holders', or 'both'"
        });
      }

      let results = [];

      // Build dynamic query based on table selection
      if (table === 'citizens' || table === 'both') {
        let citizenQuery = 'SELECT \'citizen\' as source, * FROM rwandan_citizen WHERE 1=1';
        let citizenParams = [];
        let paramCount = 0;

        if (first_name) {
          paramCount++;
          citizenQuery += ` AND first_name ILIKE $${paramCount}`;
          citizenParams.push(`%${first_name}%`);
        }
        if (last_name) {
          paramCount++;
          citizenQuery += ` AND last_name ILIKE $${paramCount}`;
          citizenParams.push(`%${last_name}%`);
        }
        if (email) {
          paramCount++;
          citizenQuery += ` AND email ILIKE $${paramCount}`;
          citizenParams.push(`%${email}%`);
        }
        if (national_id) {
          paramCount++;
          citizenQuery += ` AND national_id ILIKE $${paramCount}`;
          citizenParams.push(`%${national_id}%`);
        }
        if (phone) {
          paramCount++;
          citizenQuery += ` AND phone ILIKE $${paramCount}`;
          citizenParams.push(`%${phone}%`);
        }

        const citizenResult = await pool.query(citizenQuery, citizenParams);
        results = [...results, ...citizenResult.rows];
      }

      if (table === 'passport-holders' || table === 'both') {
        let passportQuery = 'SELECT \'passport\' as source, * FROM passport_holder WHERE 1=1';
        let passportParams = [];
        let paramCount = 0;

        if (first_name) {
          paramCount++;
          passportQuery += ` AND first_name ILIKE $${paramCount}`;
          passportParams.push(`%${first_name}%`);
        }
        if (last_name) {
          paramCount++;
          passportQuery += ` AND last_name ILIKE $${paramCount}`;
          passportParams.push(`%${last_name}%`);
        }
        if (email) {
          paramCount++;
          passportQuery += ` AND email ILIKE $${paramCount}`;
          passportParams.push(`%${email}%`);
        }
        if (passport_number) {
          paramCount++;
          passportQuery += ` AND passport_number ILIKE $${paramCount}`;
          passportParams.push(`%${passport_number}%`);
        }
        if (phone) {
          paramCount++;
          passportQuery += ` AND phone ILIKE $${paramCount}`;
          passportParams.push(`%${phone}%`);
        }

        const passportResult = await pool.query(passportQuery, passportParams);
        results = [...results, ...passportResult.rows];
      }

      res.json({
        success: true,
        message: `Advanced search completed - found ${results.length} results`,
        filters: req.query,
        data: results
      });
    } catch (error) {
      console.error('Advanced search error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Get person by exact ID
  getPersonByExactId: async (req, res) => {
    try {
      const { idType, idNumber } = req.params;
      
      console.log(`Searching for ${idType}: ${idNumber}`);
      
      let query;
      let params = [idNumber];
      let result = null;
      
      if (idType === 'passport') {
        // Search in passport_holder table
        query = 'SELECT \'passport\' as source, * FROM passport_holder WHERE passport_number = $1';
        const queryResult = await pool.query(query, params);
        result = queryResult.rows[0] || null;
        
      } else if (idType === 'national-id') {
        // Search in rwandan_citizen table by national ID
        query = 'SELECT \'citizen\' as source, * FROM rwandan_citizen WHERE national_id = $1';
        const queryResult = await pool.query(query, params);
        result = queryResult.rows[0] || null;
        
      } else if (idType === 'citizen') {
        // Search in rwandan_citizen table by primary key ID
        query = 'SELECT \'citizen\' as source, * FROM rwandan_citizen WHERE id = $1';
        const queryResult = await pool.query(query, params);
        result = queryResult.rows[0] || null;
        
      } else {
        return res.status(400).json({
          success: false,
          message: "Invalid ID type. Use: passport, national-id, or citizen"
        });
      }

      if (!result) {
        return res.status(404).json({
          success: false,
          message: `No ${idType} record found for: ${idNumber}`
        });
      }

      res.json({
        success: true,
        message: `Found ${idType} record`,
        data: result
      });

    } catch (error) {
      console.error('Error in getPersonByExactId:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Check tables method
  checkTables: async (req, res) => {
    try {
      const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name;
      `;
      
      const result = await pool.query(query);
      
      res.json({
        success: true,
        message: "Available tables in your database",
        tables: result.rows
      });
    } catch (error) {
      console.error('Error checking tables:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // Check columns method
  checkColumns: async (req, res) => {
    try {
      const { table } = req.params;
      
      const query = `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = $1 AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      
      const result = await pool.query(query, [table]);
      
      res.json({
        success: true,
        message: `Columns in ${table} table`,
        columns: result.rows
      });
    } catch (error) {
      console.error('Error checking columns:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

module.exports = SearchController;