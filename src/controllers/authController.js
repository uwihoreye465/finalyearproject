const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const pool = require('../config/database');
const { generateTokens } = require('../config/jwt');
const emailService = require('../services/emailService');

class AuthController {
  // Add this method to AuthController class
async createFirstAdmin(req, res) {
  try {
    // Check if any admin exists
    const adminCheck = await pool.query(
      'SELECT COUNT(*) as count FROM users WHERE role = $1',
      ['admin']
    );

    if (parseInt(adminCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        message: 'Admin user already exists'
      });
    }

    const { sector, fullname, position, email, password } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert admin user
    const result = await pool.query(
      `INSERT INTO users (sector, fullname, position, email, password, role, is_verified, is_approved, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP) RETURNING user_id, email, fullname, role`,
      [sector, fullname, position, email, hashedPassword, 'admin', true, true]
    );

    res.status(201).json({
      success: true,
      message: 'First admin user created successfully',
      data: {
        user: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Create first admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create admin user'
    });
  }
}
  // Register new user
  async register(req, res) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      const { sector, fullname, position, email, password, role = 'staff' } = req.body;

      // Check if user exists
      const existingUser = await client.query(
        'SELECT * FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate email verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Insert user
      const result = await client.query(
        `INSERT INTO users (sector, fullname, position, email, password, role, verification_token, is_verified) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING user_id, email, fullname, role`,
        [sector, fullname, position, email, hashedPassword, role, verificationToken, false]
      );

      await client.query('COMMIT');

      // Send verification email
      await emailService.sendVerificationEmail(email, verificationToken, fullname);

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email for verification.',
        data: {
          user: {
            id: result.rows[0].user_id,
            email: result.rows[0].email,
            fullname: result.rows[0].fullname,
            role: result.rows[0].role
          }
        }
      });

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    } finally {
      client.release();
    }
  }

  // Login user
 async login(req, res) {
  try {
    const { email, password } = req.body;

    // Find user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const user = result.rows[0];


      // Check if user is verified
      if (!user.is_verified) {
        return res.status(401).json({
          success: false,
          message: 'Please verify your email before logging in'
        });
      }

      // Check if user is approved (for staff)
      if (user.role === 'staff' && !user.is_approved) {
        return res.status(401).json({
          success: false,
          message: 'Your account is pending admin approval'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate tokens
      const { accessToken, refreshToken } = generateTokens({
        userId: user.user_id,
        email: user.email,
        role: user.role
      });

      // Update last login
      await pool.query(
        'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = $1',
        [user.user_id]
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.user_id,
            email: user.email,
            fullname: user.fullname,
            role: user.role,
            sector: user.sector,
            position: user.position
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;

      const result = await pool.query(
        'UPDATE users SET is_verified = true, verification_token = NULL WHERE verification_token = $1 RETURNING *',
        [token]
      );

      if (result.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired verification token'
        });
      }

      res.json({
        success: true,
        message: 'Email verified successfully. You can now log in.'
      });

    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).json({
        success: false,
        message: 'Email verification failed'
      });
    }
  }

  // Get current user profile
  async getProfile(req, res) {
    try {
      const result = await pool.query(
        'SELECT user_id, sector, fullname, position, email, role, created_at FROM users WHERE user_id = $1',
        [req.user.userId]
      );

      res.json({
        success: true,
        data: { user: result.rows[0] }
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }
}

module.exports = new AuthController();