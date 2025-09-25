const pool = require('../config/database');
const { paginate } = require('../utils/pagination');
const axios = require('axios'); // For IP geolocation

// Helper function to generate Google Maps links
function generateGoogleMapsLinks(latitude, longitude, locationName = '') {
  if (!latitude || !longitude) return null;
  
  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  
  return {
    // Standard Google Maps link
    standard: `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m`,
    // Satellite view
    satellite: `https://www.google.com/maps?q=${lat},${lng}&z=15&t=k`,
    // Street view
    streetview: `https://www.google.com/maps?q=${lat},${lng}&z=15&t=h`,
    // Directions to location
    directions: `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
    // Embed link
    embed: `https://www.google.com/maps/embed/v1/view?key=YOUR_API_KEY&center=${lat},${lng}&zoom=15&maptype=roadmap`,
    // Short link (using Google's URL shortener would require API key)
    short: `https://maps.google.com/maps?q=${lat},${lng}`,
    // Location name with coordinates
    with_name: locationName ? `https://www.google.com/maps/search/${encodeURIComponent(locationName)}/@${lat},${lng},15z` : `https://www.google.com/maps?q=${lat},${lng}&z=15&t=m`
  };
}

// Helper function to get location from IP
async function getLocationFromIP(ip) {
  // Skip geolocation for localhost and private IPs - these won't have real GPS data
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    console.log('⚠️ Local/private IP detected. Cannot get real GPS location.');
    return null;
  }
  
  try {
    console.log(`🌍 Attempting IP geolocation for: ${ip}`);
    
    // Try multiple geolocation services for better accuracy
    const services = [
      `https://ipapi.co/${ip}/json/`,
      `https://ip-api.com/json/${ip}`,
      `https://api.ipgeolocation.io/ipgeo?apiKey=free&ip=${ip}`
    ];
    
    for (const serviceUrl of services) {
      try {
        const response = await axios.get(serviceUrl, { timeout: 5000 });
        const data = response.data;
        
        let latitude, longitude, location_name;
        
        if (serviceUrl.includes('ipapi.co')) {
          if (data.latitude && data.longitude) {
            latitude = data.latitude;
            longitude = data.longitude;
            location_name = `${data.city || 'Unknown'}, ${data.region || 'Unknown'}, ${data.country_name || 'Unknown'}`;
          }
        } else if (serviceUrl.includes('ip-api.com')) {
          if (data.lat && data.lon) {
            latitude = data.lat;
            longitude = data.lon;
            location_name = `${data.city || 'Unknown'}, ${data.regionName || 'Unknown'}, ${data.country || 'Unknown'}`;
          }
        } else if (serviceUrl.includes('ipgeolocation.io')) {
          if (data.latitude && data.longitude) {
            latitude = data.latitude;
            longitude = data.longitude;
            location_name = `${data.city || 'Unknown'}, ${data.state_prov || 'Unknown'}, ${data.country_name || 'Unknown'}`;
          }
        }
        
        if (latitude && longitude) {
          // Ensure coordinates are valid numbers
          const latNum = parseFloat(latitude);
          const lngNum = parseFloat(longitude);
          
          // Validate the parsed coordinates
          if (!isNaN(latNum) && !isNaN(lngNum) && 
              latNum >= -90 && latNum <= 90 && 
              lngNum >= -180 && lngNum <= 180) {
            console.log(`✅ Location found via ${serviceUrl}: ${location_name} (${latNum}, ${lngNum})`);
            return {
              latitude: latNum,
              longitude: lngNum,
              location_name: location_name
            };
          } else {
            console.log(`⚠️ Invalid coordinates from ${serviceUrl}: ${latitude}, ${longitude}`);
          }
        }
      } catch (serviceError) {
        console.log(`⚠️ Service ${serviceUrl} failed:`, serviceError.message);
        continue;
      }
    }
    
    console.log('❌ All geolocation services failed');
    return null;
  } catch (error) {
    console.log('❌ IP geolocation error:', error.message);
    return null;
  }
}

class NotificationController {
  // Send notification about sinner with automatic GPS location tracking
  async sendNotification(req, res) {
    try {
      console.log('📨 Notification request received:', req.body);
      
      const { 
        near_rib, 
        fullname, 
        address, 
        phone, 
        message
      } = req.body;

      // Validate required fields
      if (!near_rib || !fullname || !message) {
        return res.status(400).json({
          success: false,
          message: 'near_rib, fullname, and message are required fields'
        });
      }

      // Get client IP for location detection
      const clientIP = req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 
                      (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                      req.headers['x-forwarded-for']?.split(',')[0] ||
                      req.headers['x-real-ip'] ||
                      '127.0.0.1';

      // Get real GPS location from device IP - NO FALLBACK LOCATIONS
      let finalLatitude, finalLongitude, finalLocationName;
      
      try {
        console.log(`🌍 Attempting to get location for IP: ${clientIP}`);
        const ipLocation = await getLocationFromIP(clientIP);
        
        if (ipLocation && ipLocation.latitude && ipLocation.longitude) {
          finalLatitude = ipLocation.latitude;
          finalLongitude = ipLocation.longitude;
          finalLocationName = ipLocation.location_name;
          console.log(`📍 Real GPS location detected from IP ${clientIP}: ${finalLocationName} (${finalLatitude}, ${finalLongitude})`);
          console.log(`📍 Coordinate types: lat=${typeof finalLatitude}, lng=${typeof finalLongitude}`);
        } else {
          // No fallback location - only use real device location
          finalLatitude = null;
          finalLongitude = null;
          finalLocationName = null;
          console.log(`⚠️ No GPS location detected from IP ${clientIP} - notification will be saved without location data`);
        }
      } catch (error) {
        console.error('❌ Location detection error:', error.message);
        // No fallback location - only use real device location
        finalLatitude = null;
        finalLongitude = null;
        finalLocationName = null;
        console.log(`⚠️ GPS location detection failed for IP ${clientIP} - notification will be saved without location data`);
      }

      // Validate GPS coordinates if we have them (only validate if they exist and are not null)
      if (finalLatitude !== null && finalLongitude !== null && finalLatitude !== undefined && finalLongitude !== undefined) {
        if (typeof finalLatitude !== 'number' || typeof finalLongitude !== 'number') {
          return res.status(400).json({
            success: false,
            message: 'Invalid GPS coordinates detected'
          });
        }
        
        if (finalLatitude < -90 || finalLatitude > 90) {
          return res.status(400).json({
            success: false,
            message: 'Invalid latitude detected'
          });
        }
        
        if (finalLongitude < -180 || finalLongitude > 180) {
          return res.status(400).json({
            success: false,
            message: 'Invalid longitude detected'
          });
        }
      }

      console.log('🗄️ Inserting notification into database...');
      console.log('📍 GPS Data:', { finalLatitude, finalLongitude, finalLocationName });
      
      // Insert notification first
      const result = await pool.query(
        `INSERT INTO notification (near_rib, fullname, address, phone, message, latitude, longitude, location_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [near_rib, fullname, address, phone, message, finalLatitude || null, finalLongitude || null, finalLocationName || null]
      );

      // Assign notification to users with role = 'near_rib' and matching sector
      try {
        await pool.query(
          `UPDATE notification n
           SET assigned_user_id = u.user_id
           FROM users u
           WHERE n.not_id = $1
             AND n.near_rib = u.sector
             AND u.role = 'near_rib'`,
          [result.rows[0].not_id]
        );
        console.log('✅ Notification assigned to near_rib users');
      } catch (assignError) {
        console.log('⚠️ Could not assign notification to users:', assignError.message);
        // Continue even if assignment fails
      }
      
      console.log('✅ Notification inserted successfully:', result.rows[0]);

      const newNotification = result.rows[0];
      const googleMapsLinks = generateGoogleMapsLinks(finalLatitude, finalLongitude, finalLocationName);

      res.status(201).json({
        success: true,
        message: finalLatitude && finalLongitude 
          ? 'Notification sent successfully with real GPS location tracking' 
          : 'Notification sent successfully (no GPS location detected)',
        data: { 
          notification: newNotification,
          device_tracking: {
            client_ip: clientIP,
            location_detected: !!(finalLatitude && finalLongitude),
            location_source: finalLatitude && finalLongitude ? 'real_device_gps' : 'no_location_available',
            location: finalLatitude && finalLongitude ? {
              latitude: parseFloat(finalLatitude),
              longitude: parseFloat(finalLongitude),
              location_name: finalLocationName || 'Real Device Location',
              google_maps_links: googleMapsLinks
            } : null,
            google_maps_links: googleMapsLinks,
            note: finalLatitude && finalLongitude 
              ? 'Real device location successfully detected and tracked' 
              : 'Could not detect real device location - notification saved without GPS data'
          }
        }
      });

    } catch (error) {
      console.error('❌ Send notification error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      });
      res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
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

      // Get paginated data with GPS information
      const result = await pool.query(
        `SELECT 
           not_id, near_rib, fullname, address, phone, message, created_at, is_read,
           latitude, longitude, location_name,
           CASE 
             WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN true 
             ELSE false 
           END as has_gps_location
         FROM notification 
         ORDER BY not_id DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      // Format notifications with GPS data and Google Maps links
      const notifications = result.rows.map(notification => {
        const googleMapsLinks = generateGoogleMapsLinks(notification.latitude, notification.longitude, notification.location_name);
        
        return {
          ...notification,
          gps_location: notification.has_gps_location ? {
            latitude: parseFloat(notification.latitude),
            longitude: parseFloat(notification.longitude),
            location_name: notification.location_name || 'Unknown Location',
            google_maps_links: googleMapsLinks
          } : null,
          google_maps_links: googleMapsLinks
        };
      });

      res.json({
        success: true,
        data: {
          notifications: notifications,
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
        `SELECT 
           not_id, near_rib, fullname, address, phone, message, created_at, is_read,
           latitude, longitude, location_name,
           CASE 
             WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN true 
             ELSE false 
           END as has_gps_location
         FROM notification WHERE not_id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      const notification = result.rows[0];
      const googleMapsLinks = generateGoogleMapsLinks(notification.latitude, notification.longitude, notification.location_name);
      
      const formattedNotification = {
        ...notification,
        gps_location: notification.has_gps_location ? {
          latitude: parseFloat(notification.latitude),
          longitude: parseFloat(notification.longitude),
          location_name: notification.location_name || 'Unknown Location',
          google_maps_links: googleMapsLinks
        } : null,
        google_maps_links: googleMapsLinks
      };

      res.json({
        success: true,
        data: { notification: formattedNotification }
      });

    } catch (error) {
      console.error('Get notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notification'
      });
    }
  }

  // Update notification
  async updateNotification(req, res) {
    try {
      const { id } = req.params;
      const { near_rib, fullname, address, phone, message, is_reviewed } = req.body;

      const result = await pool.query(
        `UPDATE notification 
         SET near_rib = $1, fullname = $2, address = $3, phone = $4, message = $5, is_reviewed = $6, updated_at = CURRENT_TIMESTAMP
         WHERE not_id = $7 RETURNING *`,
        [near_rib, fullname, address, phone, message, is_reviewed, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification updated successfully',
        data: { notification: result.rows[0] }
      });
    } catch (error) {
      console.error('Update notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification'
      });
    }
  }

  // Delete notification
  async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query('DELETE FROM notification WHERE not_id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      res.json({
        success: true,
        message: 'Notification deleted successfully',
        data: { notification: result.rows[0] }
      });
    } catch (error) {
      console.error('Delete notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification'
      });
    }
  }

  // Delete assigned notification (users can delete their assigned notifications, admins can delete any)
  async deleteAssignedNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user?.userId; // Get user ID from auth middleware
      const userRole = req.user?.role; // Get user role from auth middleware

      console.log('🗑️ Delete assigned notification request:', { id, userId, userRole });

      // Check if notification exists
      const checkResult = await pool.query(
        'SELECT not_id, assigned_user_id, fullname, message FROM notification WHERE not_id = $1',
        [id]
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      const notification = checkResult.rows[0];

      console.log('🔍 Notification details:', {
        notification_id: notification.not_id,
        assigned_user_id: notification.assigned_user_id,
        requesting_user_id: userId,
        requesting_user_role: userRole,
        assigned_user_id_type: typeof notification.assigned_user_id,
        requesting_user_id_type: typeof userId,
        strict_equality: notification.assigned_user_id === userId,
        loose_equality: notification.assigned_user_id == userId,
        string_comparison: String(notification.assigned_user_id) === String(userId)
      });

      // Check permissions: Admin can delete any, near_rib users can delete assigned notifications
      const isAdmin = userRole === 'admin';
      const isNearRibUser = userRole === 'near_rib';
      const isAssignedToUser = notification.assigned_user_id == userId;
      const canDelete = isAdmin || (isNearRibUser && isAssignedToUser);

      console.log('🔐 Permission check:', {
        isAdmin,
        isNearRibUser,
        isAssignedToUser,
        canDelete,
        userRole,
        notification_assigned_to: notification.assigned_user_id,
        requesting_user: userId
      });

      if (!canDelete) {
        console.log('❌ Permission denied:', {
          reason: 'User does not have permission to delete this notification',
          userRole,
          notification_assigned_to: notification.assigned_user_id,
          requesting_user: userId,
          is_admin: isAdmin,
          is_near_rib: isNearRibUser,
          is_assigned: isAssignedToUser
        });
        
        return res.status(403).json({
          success: false,
          message: 'You can only delete notifications assigned to you. Admins can delete any notification.',
          debug: {
            notification_assigned_to: notification.assigned_user_id,
            requesting_user: userId,
            user_role: userRole,
            is_admin: isAdmin,
            is_near_rib: isNearRibUser,
            is_assigned: isAssignedToUser,
            can_delete: canDelete
          }
        });
      }

      // Delete the notification
      const result = await pool.query('DELETE FROM notification WHERE not_id = $1 RETURNING *', [id]);

      res.json({
        success: true,
        message: isAdmin ? 'Notification deleted successfully by admin' : 'Assigned notification deleted successfully by near_rib user',
        data: { 
          deletedNotification: result.rows[0],
          deletedBy: userId,
          deletedByRole: userRole,
          deletionReason: isAdmin ? 'admin_privilege' : 'assigned_notification'
        }
      });

    } catch (error) {
      console.error('❌ Delete assigned notification error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete assigned notification',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Delete multiple assigned notifications (users can delete their assigned notifications, admins can delete any)
  async deleteMultipleAssignedNotifications(req, res) {
    try {
      const { notification_ids } = req.body;
      const userId = req.user?.userId; // Get user ID from auth middleware
      const userRole = req.user?.role; // Get user role from auth middleware

      if (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'notification_ids array is required'
        });
      }

      console.log('🗑️ Delete multiple assigned notifications request:', { notification_ids, userId, userRole });

      // Check which notifications exist
      const placeholders = notification_ids.map((_, index) => `$${index + 1}`).join(',');
      const checkResult = await pool.query(
        `SELECT not_id, assigned_user_id FROM notification WHERE not_id IN (${placeholders})`,
        notification_ids
      );

      if (checkResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No notifications found with the provided IDs'
        });
      }

      let notificationsToDelete;
      let skippedNotifications = [];

      if (userRole === 'admin') {
        // Admins can delete any notifications
        notificationsToDelete = checkResult.rows;
      } else {
        // Users can only delete notifications assigned to them
        notificationsToDelete = checkResult.rows.filter(n => n.assigned_user_id === userId);
        skippedNotifications = checkResult.rows.filter(n => n.assigned_user_id !== userId);

        if (notificationsToDelete.length === 0) {
          return res.status(403).json({
            success: false,
            message: 'No notifications assigned to you found in the provided list. Admins can delete any notification.'
          });
        }
      }

      // Delete the notifications
      const notificationIdsToDelete = notificationsToDelete.map(n => n.not_id);
      const deletePlaceholders = notificationIdsToDelete.map((_, index) => `$${index + 1}`).join(',');
      
      const result = await pool.query(
        `DELETE FROM notification WHERE not_id IN (${deletePlaceholders}) RETURNING *`,
        notificationIdsToDelete
      );

      res.json({
        success: true,
        message: userRole === 'admin' 
          ? `${result.rows.length} notifications deleted successfully by admin`
          : `${result.rows.length} assigned notifications deleted successfully`,
        data: { 
          deletedNotifications: result.rows,
          deletedCount: result.rows.length,
          requestedCount: notification_ids.length,
          skippedCount: skippedNotifications.length,
          skippedNotifications: skippedNotifications.map(n => n.not_id),
          deletedBy: userId,
          deletedByRole: userRole
        }
      });

    } catch (error) {
      console.error('❌ Delete multiple assigned notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete multiple assigned notifications',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }


  // Get notifications by location (e.g., within a certain radius)
  async getNotificationsByLocation(req, res) {
    try {
      const { latitude, longitude, radius = 5 } = req.query; // radius in km

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required for location-based search'
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const r = parseFloat(radius);

      // Haversine formula to calculate distance
      const query = `
        SELECT *,
               (6371 * acos(cos(radians($1)) * cos(radians(latitude)) *
               cos(radians(longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(latitude)))) AS distance
        FROM notification
        WHERE latitude IS NOT NULL AND longitude IS NOT NULL
        HAVING (6371 * acos(cos(radians($1)) * cos(radians(latitude)) *
               cos(radians(longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(latitude)))) <= $3
        ORDER BY distance
      `;

      const result = await pool.query(query, [lat, lng, r]);

      res.json({
        success: true,
        message: `Notifications within ${r} km of (${lat}, ${lng})`,
        data: {
          notifications: result.rows,
          count: result.rows.length
        }
      });

    } catch (error) {
      console.error('Get notifications by location error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notifications by location'
      });
    }
  }

  // Get notifications for map display (all with GPS data)
  async getNotificationsForMap(req, res) {
    try {
      const result = await pool.query(
        'SELECT not_id, fullname, message, latitude, longitude, location_name, created_at FROM notification WHERE latitude IS NOT NULL AND longitude IS NOT NULL ORDER BY created_at DESC'
      );

      const notificationsWithLinks = result.rows.map(notif => ({
        ...notif,
        google_maps_link: `https://www.google.com/maps?q=${notif.latitude},${notif.longitude}&z=15&t=m`
      }));

      res.json({
        success: true,
        message: 'Notifications with GPS data for map display',
        data: {
          notifications: notificationsWithLinks,
          count: notificationsWithLinks.length
        }
      });
    } catch (error) {
      console.error('Get notifications for map error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notifications for map'
      });
    }
  }

  // Get GPS statistics for notifications
  async getNotificationGPSStatistics(req, res) {
    try {
      const totalNotificationsWithGPS = await pool.query('SELECT COUNT(*) FROM notification WHERE latitude IS NOT NULL AND longitude IS NOT NULL');
      const notificationsByLocationName = await pool.query('SELECT location_name, COUNT(*) FROM notification WHERE location_name IS NOT NULL GROUP BY location_name ORDER BY COUNT(*) DESC');

      res.json({
        success: true,
        data: {
          totalNotificationsWithGPS: parseInt(totalNotificationsWithGPS.rows[0].count),
          notificationsByLocationName: notificationsByLocationName.rows
        }
      });
    } catch (error) {
      console.error('Get notification GPS statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve notification GPS statistics'
      });
    }
  }

  // Mark notification as read/unread
  async markNotificationRead(req, res) {
    try {
      const { id } = req.params;
      const { is_read = true } = req.body;

      console.log('🔍 Mark notification read request:', { id, is_read });

      // Check if notification exists
      const existingNotification = await pool.query(
        'SELECT not_id, is_read FROM notification WHERE not_id = $1',
        [id]
      );

      console.log('🔍 Existing notification:', existingNotification.rows);

      if (existingNotification.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      // Update read status - check if updated_at column exists, if not just update is_read
      let updateQuery;
      let queryParams;
      
      try {
        // Try with updated_at first
        updateQuery = 'UPDATE notification SET is_read = $1, updated_at = CURRENT_TIMESTAMP WHERE not_id = $2 RETURNING *';
        queryParams = [is_read, id];
        const result = await pool.query(updateQuery, queryParams);
        
        console.log('✅ Updated with updated_at column:', result.rows[0]);

        res.json({
          success: true,
          message: `Notification marked as ${is_read ? 'read' : 'unread'} successfully`,
          data: { 
            notification: result.rows[0],
            previous_status: existingNotification.rows[0].is_read,
            new_status: is_read
          }
        });

      } catch (updateError) {
        console.log('⚠️ Updated_at column might not exist, trying without it:', updateError.message);
        
        // Fallback: update without updated_at column
        updateQuery = 'UPDATE notification SET is_read = $1 WHERE not_id = $2 RETURNING *';
        queryParams = [is_read, id];
        const result = await pool.query(updateQuery, queryParams);
        
        console.log('✅ Updated without updated_at column:', result.rows[0]);

        res.json({
          success: true,
          message: `Notification marked as ${is_read ? 'read' : 'unread'} successfully`,
          data: { 
            notification: result.rows[0],
            previous_status: existingNotification.rows[0].is_read,
            new_status: is_read
          }
        });
      }

    } catch (error) {
      console.error('❌ Mark notification read error:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        detail: error.detail,
        hint: error.hint
      });
      res.status(500).json({
        success: false,
        message: 'Failed to update notification read status',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Toggle notification read status
  async toggleNotificationRead(req, res) {
    try {
      const { id } = req.params;

      // Get current status
      const currentNotification = await pool.query(
        'SELECT not_id, is_read FROM notification WHERE not_id = $1',
        [id]
      );

      if (currentNotification.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      const newReadStatus = !currentNotification.rows[0].is_read;

      try {
        // Try with updated_at first
        const result = await pool.query(
          'UPDATE notification SET is_read = $1, updated_at = CURRENT_TIMESTAMP WHERE not_id = $2 RETURNING *',
          [newReadStatus, id]
        );

        res.json({
          success: true,
          message: `Notification toggled to ${newReadStatus ? 'read' : 'unread'} successfully`,
          data: { 
            notification: result.rows[0],
            previous_status: currentNotification.rows[0].is_read,
            new_status: newReadStatus
          }
        });

      } catch (updateError) {
        // Fallback: update without updated_at column
        const result = await pool.query(
          'UPDATE notification SET is_read = $1 WHERE not_id = $2 RETURNING *',
          [newReadStatus, id]
        );

        res.json({
          success: true,
          message: `Notification toggled to ${newReadStatus ? 'read' : 'unread'} successfully`,
          data: { 
            notification: result.rows[0],
            previous_status: currentNotification.rows[0].is_read,
            new_status: newReadStatus
          }
        });
      }

    } catch (error) {
      console.error('Toggle notification read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to toggle notification read status'
      });
    }
  }

  // Mark multiple notifications as read
  async markMultipleNotificationsRead(req, res) {
    try {
      const { notification_ids, is_read = true } = req.body;

      if (!notification_ids || !Array.isArray(notification_ids) || notification_ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'notification_ids array is required'
        });
      }

      // Update multiple notifications - without updated_at column
      const placeholders = notification_ids.map((_, index) => `$${index + 1}`).join(',');
      const result = await pool.query(
        `UPDATE notification 
         SET is_read = $${notification_ids.length + 1} 
         WHERE not_id IN (${placeholders}) 
         RETURNING not_id, is_read`,
        [...notification_ids, is_read]
      );

      res.json({
        success: true,
        message: `${result.rows.length} notifications marked as ${is_read ? 'read' : 'unread'}`,
        data: { 
          updated_notifications: result.rows,
          total_updated: result.rows.length,
          requested_count: notification_ids.length
        }
      });

    } catch (error) {
      console.error('Mark multiple notifications read error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update multiple notifications'
      });
    }
  }

  // Mark all notifications as read/unread for a user
  async markAllNotificationsReadForUser(req, res) {
    try {
      const { is_read = true } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      console.log('🔍 Mark all notifications read for user request:', { userId, userRole, is_read });

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: 'User not authenticated'
        });
      }

      // Update all notifications for the user - without updated_at column
      let updateQuery;
      let queryParams;

      if (userRole === 'admin') {
        // Admin can mark all notifications
        updateQuery = 'UPDATE notification SET is_read = $1 RETURNING not_id, is_read';
        queryParams = [is_read];
      } else {
        // Regular users can only mark their assigned notifications
        updateQuery = 'UPDATE notification SET is_read = $1 WHERE assigned_user_id = $2 RETURNING not_id, is_read';
        queryParams = [is_read, userId];
      }

      const result = await pool.query(updateQuery, queryParams);

      res.json({
        success: true,
        message: `${result.rows.length} notifications marked as ${is_read ? 'read' : 'unread'} for user`,
        data: { 
          updated_notifications: result.rows,
          total_updated: result.rows.length,
          user_id: userId,
          user_role: userRole,
          new_status: is_read
        }
      });

    } catch (error) {
      console.error('❌ Mark all notifications read for user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications for user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Mark all notifications as read/unread by sector
  async markAllNotificationsReadBySector(req, res) {
    try {
      const { sector, is_read = true } = req.body;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      console.log('🔍 Mark all notifications read by sector request:', { sector, userId, userRole, is_read });

      if (!sector) {
        return res.status(400).json({
          success: false,
          message: 'Sector is required'
        });
      }

      let updateQuery;
      let queryParams;

      if (userRole === 'admin') {
        // Admin can mark all notifications in the sector
        updateQuery = 'UPDATE notification SET is_read = $1 WHERE near_rib = $2 RETURNING not_id, is_read, near_rib';
        queryParams = [is_read, sector];
      } else if (userRole === 'near_rib') {
        // Near_rib users can mark their assigned notifications in their sector
        updateQuery = 'UPDATE notification SET is_read = $1 WHERE near_rib = $2 AND assigned_user_id = $3 RETURNING not_id, is_read, near_rib';
        queryParams = [is_read, sector, userId];
      } else {
        return res.status(403).json({
          success: false,
          message: 'Only admins and near_rib users can mark notifications by sector'
        });
      }

      // Update notifications for the sector - without updated_at column
      const result = await pool.query(updateQuery, queryParams);

      res.json({
        success: true,
        message: `${result.rows.length} notifications marked as ${is_read ? 'read' : 'unread'} for sector ${sector}`,
        data: { 
          updated_notifications: result.rows,
          total_updated: result.rows.length,
          sector: sector,
          user_id: userId,
          user_role: userRole,
          new_status: is_read
        }
      });

    } catch (error) {
      console.error('❌ Mark all notifications read by sector error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notifications by sector',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get notifications assigned to a specific user
  async getUserNotifications(req, res) {
    try {
      const { userId } = req.params;
      const { page = 1, limit = 10, unread_only = false } = req.query;

      console.log('🔍 Get user notifications request:', { userId, page, limit, unread_only });

      // Validate user exists and has near_rib role
      const userCheck = await pool.query(
        'SELECT user_id, fullname, sector, role FROM users WHERE user_id = $1 AND role = $2',
        [userId, 'near_rib']
      );

      if (userCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'User not found or does not have near_rib role'
        });
      }

      const user = userCheck.rows[0];
      console.log('✅ User found:', user);

      // Calculate pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build query based on filters
      let query = `
        SELECT 
          n.not_id,
          n.near_rib,
          n.fullname,
          n.address,
          n.phone,
          n.message,
          n.created_at,
          n.is_read,
          n.latitude,
          n.longitude,
          n.location_name,
          n.assigned_user_id,
          CASE 
            WHEN n.latitude IS NOT NULL AND n.longitude IS NOT NULL 
            THEN true 
            ELSE false 
          END as has_gps_location
        FROM notification n
        WHERE n.assigned_user_id = $1
      `;

      const queryParams = [userId];

      if (unread_only === 'true') {
        query += ' AND n.is_read = false';
      }

      query += ' ORDER BY n.created_at DESC LIMIT $2 OFFSET $3';

      queryParams.push(parseInt(limit), offset);

      const result = await pool.query(query, queryParams);

      // Format notifications with GPS data and Google Maps links
      const notifications = result.rows.map(notification => {
        const googleMapsLinks = generateGoogleMapsLinks(notification.latitude, notification.longitude, notification.location_name);
        
        return {
          ...notification,
          gps_location: notification.has_gps_location ? {
            latitude: parseFloat(notification.latitude),
            longitude: parseFloat(notification.longitude),
            location_name: notification.location_name || 'Unknown Location',
            google_maps_links: googleMapsLinks
          } : null,
          google_maps_links: googleMapsLinks
        };
      });

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM notification WHERE assigned_user_id = $1';
      const countParams = [userId];

      if (unread_only === 'true') {
        countQuery += ' AND is_read = false';
      }

      const countResult = await pool.query(countQuery, countParams);
      const totalItems = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        message: `Notifications for user ${user.fullname} (${user.sector})`,
        data: {
          user: {
            user_id: user.user_id,
            fullname: user.fullname,
            sector: user.sector,
            role: user.role
          },
          notifications: notifications,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalItems / parseInt(limit)),
            totalItems: totalItems,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ Get user notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user notifications',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get all notifications for any user (not just assigned ones)
  async getAllNotificationsForUser(req, res) {
    try {
      const { page = 1, limit = 10, unread_only = false, sector = null } = req.query;
      const userId = req.user?.userId;
      const userRole = req.user?.role;

      console.log('🔍 Get all notifications for user request:', { userId, userRole, page, limit, unread_only, sector });

      // Calculate pagination
      const offset = (parseInt(page) - 1) * parseInt(limit);

      // Build query - show all notifications, not just assigned ones
      let query = `
        SELECT 
          n.not_id,
          n.near_rib,
          n.fullname,
          n.address,
          n.phone,
          n.message,
          n.created_at,
          n.is_read,
          n.latitude,
          n.longitude,
          n.location_name,
          n.assigned_user_id,
          CASE 
            WHEN n.latitude IS NOT NULL AND n.longitude IS NOT NULL 
            THEN true 
            ELSE false 
          END as has_gps_location,
          CASE 
            WHEN n.assigned_user_id = $1 
            THEN true 
            ELSE false 
          END as is_assigned_to_user
        FROM notification n
        WHERE 1=1
      `;

      const queryParams = [userId];

      // Filter by sector if provided
      if (sector) {
        query += ' AND n.near_rib = $' + (queryParams.length + 1);
        queryParams.push(sector);
      }

      // Filter by read status if requested
      if (unread_only === 'true') {
        query += ' AND n.is_read = false';
      }

      query += ' ORDER BY n.created_at DESC LIMIT $' + (queryParams.length + 1) + ' OFFSET $' + (queryParams.length + 2);
      queryParams.push(parseInt(limit), offset);

      const result = await pool.query(query, queryParams);

      // Format notifications with GPS data and Google Maps links
      const notifications = result.rows.map(notification => {
        const googleMapsLinks = generateGoogleMapsLinks(notification.latitude, notification.longitude, notification.location_name);
        
        return {
          ...notification,
          gps_location: notification.has_gps_location ? {
            latitude: parseFloat(notification.latitude),
            longitude: parseFloat(notification.longitude),
            location_name: notification.location_name || 'Unknown Location',
            google_maps_links: googleMapsLinks
          } : null,
          google_maps_links: googleMapsLinks
        };
      });

      // Get total count for pagination
      let countQuery = 'SELECT COUNT(*) FROM notification WHERE 1=1';
      const countParams = [userId];

      if (sector) {
        countQuery += ' AND near_rib = $' + (countParams.length + 1);
        countParams.push(sector);
      }

      if (unread_only === 'true') {
        countQuery += ' AND is_read = false';
      }

      const countResult = await pool.query(countQuery, countParams);
      const totalItems = parseInt(countResult.rows[0].count);

      // Get read/unread statistics
      const statsQuery = `
        SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN is_read = true THEN 1 END) as read_count,
          COUNT(CASE WHEN is_read = false THEN 1 END) as unread_count,
          COUNT(CASE WHEN assigned_user_id = $1 THEN 1 END) as assigned_to_user,
          COUNT(CASE WHEN assigned_user_id = $1 AND is_read = true THEN 1 END) as assigned_read,
          COUNT(CASE WHEN assigned_user_id = $1 AND is_read = false THEN 1 END) as assigned_unread
        FROM notification
        ${sector ? 'WHERE near_rib = $2' : ''}
      `;
      
      const statsParams = sector ? [userId, sector] : [userId];
      const statsResult = await pool.query(statsQuery, statsParams);
      const stats = statsResult.rows[0];

      res.json({
        success: true,
        message: 'All notifications retrieved successfully',
        data: {
          user: {
            user_id: userId,
            role: userRole
          },
          notifications: notifications,
          statistics: {
            total_notifications: parseInt(stats.total),
            read_notifications: parseInt(stats.read_count),
            unread_notifications: parseInt(stats.unread_count),
            assigned_to_user: parseInt(stats.assigned_to_user),
            assigned_read: parseInt(stats.assigned_read),
            assigned_unread: parseInt(stats.assigned_unread),
            read_rate: parseInt(stats.total) > 0 ? Math.round((parseInt(stats.read_count) / parseInt(stats.total)) * 100) : 0,
            unread_rate: parseInt(stats.total) > 0 ? Math.round((parseInt(stats.unread_count) / parseInt(stats.total)) * 100) : 0,
            assigned_read_rate: parseInt(stats.assigned_to_user) > 0 ? Math.round((parseInt(stats.assigned_read) / parseInt(stats.assigned_to_user)) * 100) : 0,
            assigned_unread_rate: parseInt(stats.assigned_to_user) > 0 ? Math.round((parseInt(stats.assigned_unread) / parseInt(stats.assigned_to_user)) * 100) : 0
          },
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalItems / parseInt(limit)),
            totalItems: totalItems,
            itemsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      console.error('❌ Get all notifications for user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get all notifications for user',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Assign all existing notifications to users
  async assignAllNotificationsToUsers(req, res) {
    try {
      console.log('🔄 Assigning all notifications to users...');

      const result = await pool.query(
        `UPDATE notification n
         SET assigned_user_id = u.user_id
         FROM users u
         WHERE n.near_rib = u.sector
           AND u.role = 'near_rib'
           AND n.assigned_user_id IS NULL`
      );

      console.log('✅ Assignment query executed');

      // Get count of assigned notifications
      const countResult = await pool.query(
        'SELECT COUNT(*) FROM notification WHERE assigned_user_id IS NOT NULL'
      );

      const assignedCount = parseInt(countResult.rows[0].count);

      res.json({
        success: true,
        message: `Successfully assigned ${assignedCount} notifications to users`,
        data: {
          total_assigned: assignedCount,
          assignment_details: 'All notifications with near_rib matching user sector have been assigned to near_rib users'
        }
      });

    } catch (error) {
      console.error('❌ Assign notifications error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign notifications to users',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get notification assignment statistics
  async getNotificationAssignmentStats(req, res) {
    try {
      console.log('📊 Getting notification assignment statistics...');

      // Get total notifications
      const totalResult = await pool.query('SELECT COUNT(*) FROM notification');
      const totalNotifications = parseInt(totalResult.rows[0].count);

      // Get assigned notifications with read/unread breakdown
      const assignedResult = await pool.query(`
        SELECT 
          COUNT(*) as total_assigned,
          COUNT(CASE WHEN is_read = true THEN 1 END) as read_assigned,
          COUNT(CASE WHEN is_read = false THEN 1 END) as unread_assigned
        FROM notification 
        WHERE assigned_user_id IS NOT NULL
      `);
      const assignedData = assignedResult.rows[0];
      const assignedNotifications = parseInt(assignedData.total_assigned);
      const readAssigned = parseInt(assignedData.read_assigned);
      const unreadAssigned = parseInt(assignedData.unread_assigned);

      // Get unassigned notifications
      const unassignedNotifications = totalNotifications - assignedNotifications;

      // Get notifications by sector with read/unread breakdown
      const sectorResult = await pool.query(`
        SELECT 
          n.near_rib as sector,
          COUNT(*) as total_notifications,
          COUNT(n.assigned_user_id) as assigned_notifications,
          COUNT(*) - COUNT(n.assigned_user_id) as unassigned_notifications,
          COUNT(CASE WHEN n.assigned_user_id IS NOT NULL AND n.is_read = true THEN 1 END) as assigned_read,
          COUNT(CASE WHEN n.assigned_user_id IS NOT NULL AND n.is_read = false THEN 1 END) as assigned_unread
        FROM notification n
        GROUP BY n.near_rib
        ORDER BY total_notifications DESC
      `);

      // Get users with near_rib role and their read/unread statistics
      const usersResult = await pool.query(`
        SELECT 
          u.user_id,
          u.fullname,
          u.sector,
          u.position,
          COUNT(n.not_id) as total_assigned_notifications,
          COUNT(CASE WHEN n.is_read = true THEN 1 END) as read_notifications,
          COUNT(CASE WHEN n.is_read = false THEN 1 END) as unread_notifications
        FROM users u
        LEFT JOIN notification n ON u.user_id = n.assigned_user_id
        WHERE u.role = 'near_rib'
        GROUP BY u.user_id, u.fullname, u.sector, u.position
        ORDER BY total_assigned_notifications DESC
      `);

      // Get recent assignment activity
      const recentActivityResult = await pool.query(`
        SELECT 
          n.not_id,
          n.near_rib,
          n.fullname,
          n.message,
          n.created_at,
          n.is_read,
          u.fullname as assigned_user_name,
          u.sector as user_sector
        FROM notification n
        LEFT JOIN users u ON n.assigned_user_id = u.user_id
        WHERE n.assigned_user_id IS NOT NULL
        ORDER BY n.created_at DESC
        LIMIT 10
      `);

      res.json({
        success: true,
        message: 'Notification assignment statistics retrieved successfully',
        data: {
          overall_stats: {
            total_notifications: totalNotifications,
            assigned_notifications: assignedNotifications,
            unassigned_notifications: unassignedNotifications,
            assignment_percentage: totalNotifications > 0 ? Math.round((assignedNotifications / totalNotifications) * 100) : 0,
            assigned_read_notifications: readAssigned,
            assigned_unread_notifications: unreadAssigned,
            assigned_read_percentage: assignedNotifications > 0 ? Math.round((readAssigned / assignedNotifications) * 100) : 0,
            // Enhanced breakdown for better visibility
            assignment_breakdown: {
              total_assigned: assignedNotifications,
              read_assigned: readAssigned,
              unread_assigned: unreadAssigned,
              read_rate: assignedNotifications > 0 ? Math.round((readAssigned / assignedNotifications) * 100) : 0,
              unread_rate: assignedNotifications > 0 ? Math.round((unreadAssigned / assignedNotifications) * 100) : 0
            }
          },
          sector_stats: sectorResult.rows.map(sector => ({
            ...sector,
            assigned_read_percentage: sector.assigned_notifications > 0 ? 
              Math.round((parseInt(sector.assigned_read) / parseInt(sector.assigned_notifications)) * 100) : 0,
            // Enhanced sector breakdown
            sector_assignment_breakdown: {
              total_assigned: parseInt(sector.assigned_notifications),
              read_assigned: parseInt(sector.assigned_read),
              unread_assigned: parseInt(sector.assigned_unread),
              read_rate: sector.assigned_notifications > 0 ? 
                Math.round((parseInt(sector.assigned_read) / parseInt(sector.assigned_notifications)) * 100) : 0,
              unread_rate: sector.assigned_notifications > 0 ? 
                Math.round((parseInt(sector.assigned_unread) / parseInt(sector.assigned_notifications)) * 100) : 0
            }
          })),
          user_stats: usersResult.rows.map(user => ({
            ...user,
            read_percentage: user.total_assigned_notifications > 0 ? 
              Math.round((parseInt(user.read_notifications) / parseInt(user.total_assigned_notifications)) * 100) : 0,
            // Enhanced user breakdown
            user_assignment_breakdown: {
              total_assigned: parseInt(user.total_assigned_notifications),
              read_assigned: parseInt(user.read_notifications),
              unread_assigned: parseInt(user.unread_notifications),
              read_rate: user.total_assigned_notifications > 0 ? 
                Math.round((parseInt(user.read_notifications) / parseInt(user.total_assigned_notifications)) * 100) : 0,
              unread_rate: user.total_assigned_notifications > 0 ? 
                Math.round((parseInt(user.unread_notifications) / parseInt(user.total_assigned_notifications)) * 100) : 0
            }
          })),
          recent_activity: recentActivityResult.rows,
          // Summary for quick overview
          summary: {
            total_notifications: totalNotifications,
            assignment_status: {
              assigned: assignedNotifications,
              unassigned: unassignedNotifications,
              assignment_rate: totalNotifications > 0 ? Math.round((assignedNotifications / totalNotifications) * 100) : 0
            },
            read_status: {
              read: readAssigned,
              unread: unreadAssigned,
              read_rate: assignedNotifications > 0 ? Math.round((readAssigned / assignedNotifications) * 100) : 0
            },
            active_users: usersResult.rows.length,
            active_sectors: sectorResult.rows.filter(s => parseInt(s.assigned_notifications) > 0).length
          }
        }
      });

    } catch (error) {
      console.error('❌ Get assignment stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notification assignment statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
      });
    }
  }

  // Get RIB statistics
  async getRibStatistics(req, res) {
    try {
      // Get detailed RIB statistics
      const ribStats = await pool.query(`
        SELECT 
          near_rib,
          COUNT(*) as total_messages,
          COUNT(CASE WHEN is_read = false THEN 1 END) as unread_messages,
          COUNT(CASE WHEN is_read = true THEN 1 END) as read_messages,
          COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as messages_with_gps,
          MIN(created_at) as first_message_date,
          MAX(created_at) as last_message_date
        FROM notification 
        WHERE near_rib IS NOT NULL 
        GROUP BY near_rib 
        ORDER BY COUNT(*) DESC
      `);

      // Get overall statistics
      const overallStats = await pool.query(`
        SELECT 
          COUNT(*) as total_messages,
          COUNT(CASE WHEN is_read = false THEN 1 END) as total_unread,
          COUNT(CASE WHEN is_read = true THEN 1 END) as total_read,
          COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as total_with_gps,
          COUNT(DISTINCT near_rib) as total_ribs
        FROM notification
      `);

      // Get additional comprehensive statistics
      const additionalStats = await pool.query(`
        SELECT 
          -- Time-based statistics
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as messages_last_24h,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as messages_last_7d,
          COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as messages_last_30d,
          
          -- GPS coverage statistics
          ROUND(
            (COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(*), 0)) * 100, 2
          ) as gps_coverage_percentage,
          
          -- Read rate statistics
          ROUND(
            (COUNT(CASE WHEN is_read = true THEN 1 END)::DECIMAL / 
             NULLIF(COUNT(*), 0)) * 100, 2
          ) as read_rate_percentage,
          
          -- Average messages per RIB
          ROUND(COUNT(*)::DECIMAL / NULLIF(COUNT(DISTINCT near_rib), 0), 2) as avg_messages_per_rib,
          
          -- Most active RIB
          (SELECT near_rib FROM notification 
           WHERE near_rib IS NOT NULL 
           GROUP BY near_rib 
           ORDER BY COUNT(*) DESC 
           LIMIT 1) as most_active_rib,
           
          -- Most active RIB count
          (SELECT COUNT(*) FROM notification 
           WHERE near_rib = (
             SELECT near_rib FROM notification 
             WHERE near_rib IS NOT NULL 
             GROUP BY near_rib 
             ORDER BY COUNT(*) DESC 
             LIMIT 1
           )) as most_active_rib_count
        FROM notification
      `);

      // Get location statistics
      const locationStats = await pool.query(`
        SELECT 
          location_name,
          COUNT(*) as message_count
        FROM notification 
        WHERE location_name IS NOT NULL 
        GROUP BY location_name 
        ORDER BY COUNT(*) DESC 
        LIMIT 10
      `);

      // Get recent activity (last 10 notifications)
      const recentActivity = await pool.query(`
        SELECT 
          not_id,
          near_rib,
          fullname,
          message,
          created_at,
          is_read,
          CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN true ELSE false END as has_gps
        FROM notification 
        ORDER BY created_at DESC 
        LIMIT 10
      `);

      res.json({
        success: true,
        data: {
          rib_statistics: ribStats.rows.map(rib => ({
            near_rib: rib.near_rib,
            total_messages: rib.total_messages,
            unread_messages: rib.unread_messages,
            read_messages: rib.read_messages,
            messages_with_gps: rib.messages_with_gps,
            first_message_date: rib.first_message_date,
            last_message_date: rib.last_message_date
          })),
          overall_statistics: {
            total_messages: overallStats.rows[0].total_messages,
            total_unread: overallStats.rows[0].total_unread,
            total_read: overallStats.rows[0].total_read,
            total_with_gps: overallStats.rows[0].total_with_gps,
            total_ribs: overallStats.rows[0].total_ribs
          },
          comprehensive_statistics: {
            time_based: {
              messages_last_24h: additionalStats.rows[0].messages_last_24h,
              messages_last_7d: additionalStats.rows[0].messages_last_7d,
              messages_last_30d: additionalStats.rows[0].messages_last_30d
            },
            coverage_metrics: {
              gps_coverage_percentage: additionalStats.rows[0].gps_coverage_percentage,
              read_rate_percentage: additionalStats.rows[0].read_rate_percentage,
              avg_messages_per_rib: additionalStats.rows[0].avg_messages_per_rib
            },
            activity_metrics: {
              most_active_rib: additionalStats.rows[0].most_active_rib,
              most_active_rib_count: additionalStats.rows[0].most_active_rib_count
            }
          },
          location_statistics: locationStats.rows.map(loc => ({
            location_name: loc.location_name,
            message_count: loc.message_count
          })),
          recent_activity: recentActivity.rows.map(activity => ({
            not_id: activity.not_id,
            near_rib: activity.near_rib,
            fullname: activity.fullname,
            message: activity.message,
            created_at: activity.created_at,
            is_read: activity.is_read,
            has_gps: activity.has_gps
          })),
          timeframe: "all",
          filtered_rib: "all",
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Get RIB statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve RIB statistics'
      });
    }
  }
}

module.exports = new NotificationController();