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
  async updateUserApproval(req, res) {
    try {
      const { id } = req.params;
      const { approved } = req.body;

      const result = await pool.query(
        'UPDATE users SET is_approved = $1 WHERE user_id = $2 RETURNING *',
        [approved, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const user = result.rows[0];

      // Send approval/rejection email
      await emailService.sendApprovalNotification(
        user.email, 
        user.fullname, 
        approved
      );

      res.json({
        success: true,
        message: `User ${approved ? 'approved' : 'rejected'} successfully`,
        data: { user }
      });

    } catch (error) {
      console.error('Update approval error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user approval'
      });
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

  // Get dashboard statistics (Admin only)
  async getDashboardStats(req, res) {
    try {
      const stats = await Promise.all([
        // Total users
        pool.query('SELECT COUNT(*) as total FROM users'),
        // Pending approvals
        pool.query('SELECT COUNT(*) as total FROM users WHERE is_verified = true AND is_approved = false'),
        // Total sinners
        pool.query('SELECT COUNT(*) as total FROM sinners_record'),
        // Total victims
        pool.query('SELECT COUNT(*) as total FROM victim'),
        // Total notifications
        pool.query('SELECT COUNT(*) as total FROM notification'),
        // Recent crimes by type
        pool.query(`
          SELECT crime_type, COUNT(*) as count 
          FROM sinners_record 
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
}

module.exports = new UserController();