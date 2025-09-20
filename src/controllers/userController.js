const pool = require('../config/database');
const { paginate } = require('../utils/pagination');
const emailService = require('../services/emailService');

class UserController {
  // Get all users (Admin only)
  async getAllUsers(req, res) {
    try {
      const { page = 1, limit = 10, role, sector } = req.query;
      const offset = (page - 1) * limit;

      let whereClause = '';
      const queryParams = [];
      let paramIndex = 1;

      if (role) {
        whereClause = `WHERE role = $${paramIndex}`;
        queryParams.push(role);
        paramIndex++;
      }

      if (sector) {
        whereClause += whereClause ? ` AND ` : `WHERE `;
        whereClause += `sector ILIKE $${paramIndex}`;
        queryParams.push(`%${sector}%`);
        paramIndex++;
      }

      // Count total
      const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`;
      const countResult = await pool.query(countQuery, queryParams);
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const dataQuery = `
        SELECT user_id, sector, fullname, position, email, role, 
               is_verified, is_approved, created_at, last_login
        FROM users 
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
      `;

      queryParams.push(limit, offset);
      const dataResult = await pool.query(dataQuery, queryParams);

      res.json({
        success: true,
        data: {
          users: dataResult.rows,
          pagination: paginate(total, page, limit)
        }
      });

    } catch (error) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users'
      });
    }
  }

  // Approve/Reject user (Admin only)
  // Approve/Reject user (Admin only) - CORRECTED to handle URL parsing
async updateUserApproval(req, res) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    let { id } = req.params;
    
    // Fix URL parsing issue - remove colon if present
    if (id.startsWith(':')) {
      id = id.substring(1);
    }
    
    // Accept both 'approved' and 'approval' field names for flexibility
    let { approved, approval } = req.body;
    
    // Use approval if approved is not provided (backward compatibility)
    if (approved === undefined && approval !== undefined) {
      approved = approval;
    }

    console.log('🔍 Approving user:', { id, approved, approval, type: typeof approved });

    // Handle missing approved field
    if (approved === undefined) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Missing "approved" or "approval" field in request body. Provide either { "approved": true/false } or { "approval": "true"/"false" }',
        example: {
          option_1: { "approved": true },
          option_2: { "approval": "true" }
        }
      });
    }

    // Handle string values like "true", "false", "1", "0"
    if (typeof approved === 'string') {
      if (approved.toLowerCase() === 'true' || approved === '1') {
        approved = true;
      } else if (approved.toLowerCase() === 'false' || approved === '0') {
        approved = false;
      }
    }

    // Validate input
    if (typeof approved !== 'boolean') {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Approved field must be a boolean (true/false) or string ("true"/"false")'
      });
    }

    const result = await client.query(
      'UPDATE users SET is_approved = $1 WHERE user_id = $2 RETURNING *',
      [approved, id]
    );

    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = result.rows[0];

    // Send approval/rejection email
    try {
      await emailService.sendApprovalNotification(
        user.email, 
        user.fullname, 
        approved
      );
      console.log('✅ Approval email sent successfully');
    } catch (emailError) {
      console.error('❌ Email sending failed, but user approval was updated:', emailError);
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: `User ${approved ? 'approved' : 'rejected'} successfully`,
      data: { user }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Update approval error:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to update user approval'
    });
  } finally {
    client.release();
  }
}
  // Get pending users (Admin only)
  async getPendingUsers(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Count total
      const countResult = await pool.query(
        'SELECT COUNT(*) as total FROM users WHERE is_verified = true AND is_approved = false'
      );
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const result = await pool.query(
        `SELECT user_id, sector, fullname, position, email, role, created_at
         FROM users 
         WHERE is_verified = true AND is_approved = false
         ORDER BY created_at ASC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      res.json({
        success: true,
        data: {
          users: result.rows,
          pagination: paginate(total, page, limit)
        }
      });

    } catch (error) {
      console.error('Get pending users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get pending users'
      });
    }
  }


  // Get user by ID (Admin only)
async getUserById(req, res) {
  try {
    const { id } = req.params;

    console.log('🔍 Getting user by ID:', id);

    const result = await pool.query(`
      SELECT 
        user_id, sector, fullname, position, email, role, 
        is_verified, is_approved, created_at, last_login,
        verification_token
      FROM users 
      WHERE user_id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Remove sensitive data before sending response
    const user = result.rows[0];
    delete user.verification_token;
    
    if (user.password) {
      delete user.password;
    }

    res.json({
      success: true,
      data: { user }
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user'
    });
  }
}

  // Delete user (Admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Prevent admin from deleting themselves
      if (parseInt(id) === req.user.userId) {
        return res.status(400).json({
          success: false,
          message: 'You cannot delete your own account'
        });
      }

      const result = await pool.query(
        'DELETE FROM users WHERE user_id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        message: 'User deleted successfully'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete user'
      });
    }
  }



  // Change password (Authenticated user)
async changePassword(req, res) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    console.log('🔍 Changing password for user:', userId);

    // Validate input
    if (!currentPassword || !newPassword) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 8) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Get user with password
    const userResult = await client.query(
      'SELECT user_id, password FROM users WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await client.query(
      'UPDATE users SET password = $1 WHERE user_id = $2',
      [hashedPassword, userId]
    );

    await client.query('COMMIT');

    // Send email notification
    try {
      await emailService.sendPasswordChangeNotification(user.email, user.fullname);
    } catch (emailError) {
      console.error('Password change email failed:', emailError);
    }

    res.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  } finally {
    client.release();
  }
}

// Forgot password - Initiate reset
async forgotPassword(req, res) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { email } = req.body;

    console.log('🔍 Forgot password request for:', email);

    if (!email) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if user exists
    const userResult = await client.query(
      'SELECT user_id, fullname, email FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      // Don't reveal if email exists or not for security
      return res.json({
        success: true,
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    const user = userResult.rows[0];

    // Generate reset token (expires in 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
    const tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token to database
    await client.query(
      'UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE user_id = $3',
      [tokenHash, tokenExpiry, user.user_id]
    );

    await client.query('COMMIT');

    // Send reset email
    try {
      await emailService.sendPasswordResetEmail(user.email, user.fullname, resetToken, user.user_id);
      console.log('✅ Password reset email sent to:', user.email);
    } catch (emailError) {
      console.error('Password reset email failed:', emailError);
      await client.query('ROLLBACK');
      return res.status(500).json({
        success: false,
        message: 'Failed to send reset email'
      });
    }

    res.json({
      success: true,
      message: 'If the email exists, a password reset link has been sent'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request'
    });
  } finally {
    client.release();
  }
}

// Reset password with token
async resetPassword(req, res) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');

    const { token } = req.params;
    const { newPassword } = req.body;

    console.log('🔍 Resetting password with token');

    if (!newPassword || newPassword.length < 8) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Hash the token to compare with stored hash
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const userResult = await client.query(
      `SELECT user_id, reset_token_expiry 
       FROM users 
       WHERE reset_token = $1 AND reset_token_expiry > NOW()`,
      [tokenHash]
    );

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const user = userResult.rows[0];

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset token
    await client.query(
      'UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = $2',
      [hashedPassword, user.user_id]
    );

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password'
    });
  } finally {
    client.release();
  }
}
  // Get dashboard statistics (Admin only)
  async getDashboardStats(req, res) {
    try {
      const stats = await Promise.all([
        // Total users
        pool.query('SELECT COUNT(*) as total FROM users'),
        // Pending approvals
        pool.query('SELECT COUNT(*) as total FROM users WHERE is_verified = true AND is_approved = false'),
        // Total sinners
        pool.query('SELECT COUNT(*) as total FROM criminal_record'),
        // Total victims
        pool.query('SELECT COUNT(*) as total FROM victim'),
        // Total notifications
        pool.query('SELECT COUNT(*) as total FROM notification'),
        // Recent crimes by type
        pool.query(`
          SELECT crime_type, COUNT(*) as count 
          FROM criminal_record 
          GROUP BY crime_type 
          ORDER BY count DESC 
          LIMIT 5
        `)
      ]);

      res.json({
        success: true,
        data: {
          totalUsers: parseInt(stats[0].rows[0].total),
          pendingApprovals: parseInt(stats[1].rows[0].total),
          totalSinners: parseInt(stats[2].rows[0].total),
          totalVictims: parseInt(stats[3].rows[0].total),
          totalNotifications: parseInt(stats[4].rows[0].total),
          crimesByType: stats[5].rows
        }
      });

    } catch (error) {
      console.error('Get dashboard stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get dashboard statistics'
      });
    }
  }

  // Update user (Admin only)
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { fullname, email, position, sector, role } = req.body;

      // Validate required fields
      if (!fullname || !email) {
        return res.status(400).json({
          success: false,
          message: 'Full name and email are required'
        });
      }

      // Check if user exists
      const existingUser = await pool.query(
        'SELECT user_id, email FROM users WHERE user_id = $1',
        [id]
      );

      if (existingUser.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if email is already taken by another user
      if (email !== existingUser.rows[0].email) {
        const emailCheck = await pool.query(
          'SELECT user_id FROM users WHERE email = $1 AND user_id != $2',
          [email.toLowerCase(), id]
        );

        if (emailCheck.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Email is already taken by another user'
          });
        }
      }

      // Update user - only fields that exist in database
      const updateQuery = `
        UPDATE users 
        SET fullname = $1, email = $2, position = $3, sector = $4, role = $5
        WHERE user_id = $6
        RETURNING user_id, fullname, email, position, sector, role, is_verified, is_approved, created_at, last_login
      `;

      const result = await pool.query(updateQuery, [
        fullname.trim(),
        email.trim().toLowerCase(),
        position?.trim() || null,
        sector?.trim() || null,
        role || existingUser.rows[0].role,
        id
      ]);

      const updatedUser = result.rows[0];

      // Send email notification if email changed
      if (email !== existingUser.rows[0].email) {
        try {
          await emailService.sendEmail(
            email,
            'Email Address Updated - FindSinners System',
            `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Email Address Updated</h2>
                <p>Hello ${fullname},</p>
                <p>Your email address has been updated for your FindSinners System account.</p>
                <p><strong>New Email:</strong> ${email}</p>
                <p>If you did not request this change, please contact support immediately.</p>
                <div style="text-align: center; margin-top: 20px; color: #666;">
                  <p>Best regards,<br><strong>FindSinners System Team</strong></p>
                </div>
              </div>
            `,
            `Hello ${fullname},\n\nYour email address has been updated to: ${email}\n\nIf you did not request this change, please contact support immediately.\n\nBest regards,\nFindSinners System Team`
          );
        } catch (emailError) {
          console.error('Email notification failed:', emailError.message);
        }
      }

      res.json({
        success: true,
        message: 'User updated successfully',
        user: updatedUser
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  // Get user profile (User self-management)
  async getUserProfile(req, res) {
    try {
      const userId = req.user.userId || req.user.user_id;
      
      const result = await pool.query(
        'SELECT user_id, fullname, email, position, sector, role, is_verified, is_approved, created_at, last_login FROM users WHERE user_id = $1',
        [userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        user: result.rows[0]
      });

    } catch (error) {
      console.error('Get user profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user profile'
      });
    }
  }

  // Update user profile (User self-management)
  async updateUserProfile(req, res) {
    try {
      const userId = req.user.userId || req.user.user_id;
      const { fullname, email, position, sector } = req.body;

      // Validate required fields
      if (!fullname || !email) {
        return res.status(400).json({
          success: false,
          message: 'Full name and email are required'
        });
      }

      // Check if user exists
      const existingUser = await pool.query(
        'SELECT user_id, email FROM users WHERE user_id = $1',
        [userId]
      );

      if (existingUser.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if email is already taken by another user
      if (email !== existingUser.rows[0].email) {
        const emailCheck = await pool.query(
          'SELECT user_id FROM users WHERE email = $1 AND user_id != $2',
          [email.toLowerCase(), userId]
        );

        if (emailCheck.rows.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Email is already taken by another user'
          });
        }
      }

      // Update user profile - only fields that exist in database
      const updateQuery = `
        UPDATE users 
        SET fullname = $1, email = $2, position = $3, sector = $4
        WHERE user_id = $5
        RETURNING user_id, fullname, email, position, sector, role, is_verified, is_approved, created_at, last_login
      `;

      const result = await pool.query(updateQuery, [
        fullname.trim(),
        email.trim().toLowerCase(),
        position?.trim() || null,
        sector?.trim() || null,
        userId
      ]);

      const updatedUser = result.rows[0];

      // Send email notification if email changed
      if (email !== existingUser.rows[0].email) {
        try {
          await emailService.sendEmail(
            email,
            'Profile Updated - FindSinners System',
            `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #333;">Profile Updated</h2>
                <p>Hello ${fullname},</p>
                <p>Your profile has been successfully updated.</p>
                <p><strong>Updated Information:</strong></p>
                <ul>
                  <li><strong>Name:</strong> ${fullname}</li>
                  <li><strong>Email:</strong> ${email}</li>
                  <li><strong>Position:</strong> ${position || 'Not specified'}</li>
                  <li><strong>Sector:</strong> ${sector || 'Not specified'}</li>
                </ul>
                <div style="text-align: center; margin-top: 20px; color: #666;">
                  <p>Best regards,<br><strong>FindSinners System Team</strong></p>
                </div>
              </div>
            `,
            `Hello ${fullname},\n\nYour profile has been successfully updated.\n\nUpdated Information:\n- Name: ${fullname}\n- Email: ${email}\n- Position: ${position || 'Not specified'}\n- Sector: ${sector || 'Not specified'}\n\nBest regards,\nFindSinners System Team`
          );
        } catch (emailError) {
          console.error('Email notification failed:', emailError.message);
        }
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser
      });

    } catch (error) {
      console.error('Update user profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update profile'
      });
    }
  }
}

module.exports = new UserController();