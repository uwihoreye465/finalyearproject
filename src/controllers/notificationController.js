const pool = require('../config/database');
const { paginate } = require('../utils/pagination');

class NotificationController {
  // Send notification about sinner
  async sendNotification(req, res) {
    try {
      const { near_rib, fullname, address, phone, message } = req.body;

      const result = await pool.query(
        `INSERT INTO notification (near_rib, fullname, address, phone, message)
         VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [near_rib, fullname, address, phone, message]
      );

      res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: { notification: result.rows[0] }
      });

    } catch (error) {
      console.error('Send notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notification'
      });
    }
  }

  // Get all notifications with pagination
  async getAllNotifications(req, res) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Count total
      const countResult = await pool.query('SELECT COUNT(*) as total FROM notification');
      const total = parseInt(countResult.rows[0].total);

      // Get paginated data
      const result = await pool.query(
        `SELECT * FROM notification 
         ORDER BY not_id DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      res.json({
        success: true,
        data: {
          notifications: result.rows,
          pagination: paginate(total, page, limit)
        }
      });

    } catch (error) {
      console.error('Get notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notifications'
      });
    }
  }

  // Get notification by ID
  async getNotificationById(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'SELECT * FROM notification WHERE not_id = $1',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        data: { notification: result.rows[0] }
      });

    } catch (error) {
      console.error('Get notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notification'
      });
    }
  }

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        'DELETE FROM notification WHERE not_id = $1 RETURNING *',
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });

    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification'
      });
    }
  }
}

module.exports = new NotificationController();