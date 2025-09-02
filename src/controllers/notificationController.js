// const pool = require('../config/database');
// const { paginate } = require('../utils/pagination');

// class NotificationController {
//   // Send notification about sinner
//   async sendNotification(req, res) {
//     try {
//       const { near_rib, fullname, address, phone, message } = req.body;

//       const result = await pool.query(
//         `INSERT INTO notification (near_rib, fullname, address, phone, message)
//          VALUES ($1, $2, $3, $4, $5) RETURNING *`,
//         [near_rib, fullname, address, phone, message]
//       );

//       res.status(201).json({
//         success: true,
//         message: 'Notification sent successfully',
//         data: { notification: result.rows[0] }
//       });

//     } catch (error) {
//       console.error('Send notification error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to send notification'
//       });
//     }
//   }

//   // Get all notifications with pagination
//   async getAllNotifications(req, res) {
//     try {
//       const { page = 1, limit = 10 } = req.query;
//       const offset = (page - 1) * limit;

//       // Count total
//       const countResult = await pool.query('SELECT COUNT(*) as total FROM notification');
//       const total = parseInt(countResult.rows[0].total);

//       // Get paginated data
//       const result = await pool.query(
//         `SELECT * FROM notification 
//          ORDER BY not_id DESC 
//          LIMIT $1 OFFSET $2`,
//         [limit, offset]
//       );

//       res.json({
//         success: true,
//         data: {
//           notifications: result.rows,
//           pagination: paginate(total, page, limit)
//         }
//       });

//     } catch (error) {
//       console.error('Get notifications error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get notifications'
//       });
//     }
//   }

//   // Get notification by ID
//   async getNotificationById(req, res) {
//     try {
//       const { id } = req.params;

//       const result = await pool.query(
//         'SELECT * FROM notification WHERE not_id = $1',
//         [id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: 'Notification not found'
//         });
//       }

//       res.json({
//         success: true,
//         data: { notification: result.rows[0] }
//       });

//     } catch (error) {
//       console.error('Get notification error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to get notification'
//       });
//     }
//   }

//   // Delete notification
//   async deleteNotification(req, res) {
//     try {
//       const { id } = req.params;

//       const result = await pool.query(
//         'DELETE FROM notification WHERE not_id = $1 RETURNING *',
//         [id]
//       );

//       if (result.rows.length === 0) {
//         return res.status(404).json({
//           success: false,
//           message: 'Notification not found'
//         });
//       }

//       res.json({
//         success: true,
//         message: 'Notification deleted successfully'
//       });

//     } catch (error) {
//       console.error('Delete notification error:', error);
//       res.status(500).json({
//         success: false,
//         message: 'Failed to delete notification'
//       });
//     }
//   }
// }

// module.exports = new NotificationController();


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

  // Get statistics by near_rib
  async getRibStatistics(req, res) {
    try {
      const { timeframe = 'all', rib } = req.query;
      
      let dateCondition = '';
      const queryParams = [];
      
      // Handle timeframe filter
      if (timeframe !== 'all') {
        let interval;
        switch (timeframe) {
          case 'today':
            interval = '1 DAY';
            break;
          case 'week':
            interval = '7 DAYS';
            break;
          case 'month':
            interval = '30 DAYS';
            break;
          default:
            interval = '1 DAY';
        }
        dateCondition = `WHERE created_at >= NOW() - INTERVAL '${interval}'`;
      }

      // Handle specific rib filter
      let ribCondition = '';
      if (rib && rib !== 'all') {
        ribCondition = dateCondition ? ' AND near_rib = $1' : ' WHERE near_rib = $1';
        queryParams.push(rib);
      }

      // Get statistics grouped by near_rib
      const statsQuery = `
        SELECT 
          near_rib,
          COUNT(*) as total_messages,
          COUNT(CASE WHEN is_read = false THEN 1 END) as unread_messages,
          COUNT(CASE WHEN is_read = true THEN 1 END) as read_messages,
          MIN(created_at) as first_message_date,
          MAX(created_at) as last_message_date
        FROM notification 
        ${dateCondition}${ribCondition}
        GROUP BY near_rib
        ORDER BY near_rib
      `;

      const statsResult = await pool.query(statsQuery, queryParams);

      // Get overall statistics
      const overallQuery = `
        SELECT 
          COUNT(*) as total_messages,
          COUNT(CASE WHEN is_read = false THEN 1 END) as total_unread,
          COUNT(CASE WHEN is_read = true THEN 1 END) as total_read,
          COUNT(DISTINCT near_rib) as total_ribs
        FROM notification 
        ${dateCondition}
      `;

      const overallResult = await pool.query(overallQuery, dateCondition ? [] : []);

      res.json({
        success: true,
        data: {
          rib_statistics: statsResult.rows,
          overall_statistics: overallResult.rows[0],
          timeframe: timeframe,
          filtered_rib: rib || 'all'
        }
      });

    } catch (error) {
      console.error('Get rib statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get rib statistics'
      });
    }
  }
}

module.exports = new NotificationController();