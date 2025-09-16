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

      // Optional session attach without changing API response
      if (req.session) {
        req.session.userId = user.user_id;
        req.session.role = user.role;
      }

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

  // Refresh token using provided refresh token (keeps current API pattern additive)
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) {
        return res.status(400).json({ success: false, message: 'Refresh token is required' });
      }

      const { verifyToken } = require('../config/jwt');
      let payload;
      try {
        payload = verifyToken(refreshToken);
      } catch (e) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
      }

      // Ensure user still exists and status is valid
      const result = await pool.query('SELECT user_id, email, role FROM users WHERE user_id = $1', [payload.userId]);
      if (result.rows.length === 0) {
        return res.status(401).json({ success: false, message: 'Invalid refresh token' });
      }

      const { accessToken, refreshToken: newRefreshToken } = generateTokens({
        userId: result.rows[0].user_id,
        email: result.rows[0].email,
        role: result.rows[0].role
      });

      return res.json({
        success: true,
        message: 'Token refreshed',
        data: { tokens: { accessToken, refreshToken: newRefreshToken } }
      });
    } catch (error) {
      console.error('Refresh token error:', error);
      res.status(500).json({ success: false, message: 'Failed to refresh token' });
    }
  }

  // Forgot password - send reset email
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      // Check if user exists
      const result = await pool.query('SELECT user_id, email, fullname FROM users WHERE email = $1', [email]);
      if (result.rows.length === 0) {
        // For security, do not reveal non-existence
        return res.json({ success: true, message: 'If an account exists, a reset email has been sent' });
      }

      const user = result.rows[0];
      const resetToken = crypto.randomBytes(32).toString('hex');

      // Store hashed token and expiry - check if columns exist first
      const hashed = await bcrypt.hash(resetToken, 12);
      const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      try {
        // Try to update with reset password columns
        await pool.query(
          `UPDATE users SET reset_password_token = $1, reset_password_expires = $2 WHERE user_id = $3`,
          [hashed, expires, user.user_id]
        );
      } catch (dbError) {
        // If columns don't exist, store in verification_token temporarily
        console.log('Reset password columns not found, using verification_token');
        await pool.query(
          `UPDATE users SET verification_token = $1, created_at = $2 WHERE user_id = $3`,
          [hashed, expires, user.user_id]
        );
      }

      // Send reset email
      try {
        await emailService.sendPasswordResetEmail(user.email, resetToken);
        console.log('Reset email sent successfully');
      } catch (emailError) {
        console.error('Email sending failed:', emailError.message);
        // For development/testing, log the reset token
        console.log('=== RESET TOKEN FOR TESTING ===');
        console.log('Email:', user.email);
        console.log('Reset Token:', resetToken);
        console.log('Reset URL:', `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`);
        console.log('================================');
      }

      return res.json({ success: true, message: 'If an account exists, a reset email has been sent' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to process request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Reset password using token
  async resetPassword(req, res) {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ success: false, message: 'Token and new password are required' });
      }

      let matching = null;

      try {
        // Try to find user with reset_password_token columns
        const users = await pool.query('SELECT user_id, email, fullname, reset_password_token, reset_password_expires FROM users WHERE reset_password_token IS NOT NULL');
        matching = users.rows.find(u => u.reset_password_token && bcrypt.compareSync(token, u.reset_password_token));
        
        if (matching && new Date(matching.reset_password_expires) < new Date()) {
          return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }
      } catch (dbError) {
        // If reset_password columns don't exist, try with verification_token
        console.log('Reset password columns not found, checking verification_token');
        const users = await pool.query('SELECT user_id, email, fullname, verification_token, created_at FROM users WHERE verification_token IS NOT NULL');
        matching = users.rows.find(u => u.verification_token && bcrypt.compareSync(token, u.verification_token));
        
        if (matching && new Date(matching.created_at) < new Date(Date.now() - 60 * 60 * 1000)) {
          return res.status(400).json({ success: false, message: 'Invalid or expired token' });
        }
      }

      if (!matching) {
        return res.status(400).json({ success: false, message: 'Invalid or expired token' });
      }

      const salt = await bcrypt.genSalt(12);
      const hashed = await bcrypt.hash(password, salt);

      try {
        // Try to update with reset_password columns
        await pool.query(
          `UPDATE users SET password = $1, reset_password_token = NULL, reset_password_expires = NULL WHERE user_id = $2`,
          [hashed, matching.user_id]
        );
      } catch (dbError) {
        // If columns don't exist, just update password and clear verification_token
        await pool.query(
          `UPDATE users SET password = $1, verification_token = NULL WHERE user_id = $2`,
          [hashed, matching.user_id]
        );
      }

      // Notify user
      try {
        await emailService.sendPasswordChangeNotification(matching.email, matching.fullname);
      } catch (e) {
        console.log('Could not send password change notification:', e.message);
      }

      return res.json({ success: true, message: 'Password reset successful' });
    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to reset password',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new AuthController();