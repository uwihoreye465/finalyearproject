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
  // Skip geolocation for localhost and private IPs
  if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('172.')) {
    console.log('⚠️ Local/private IP detected. Using Rwanda fallback location.');
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
          console.log(`✅ Location found via ${serviceUrl}: ${location_name} (${latitude}, ${longitude})`);
          return {
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            location_name: location_name
          };
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

      // Always try to get real GPS location from IP
      let finalLatitude, finalLongitude, finalLocationName;
      
      try {
        const ipLocation = await getLocationFromIP(clientIP);
        if (ipLocation) {
          finalLatitude = ipLocation.latitude;
          finalLongitude = ipLocation.longitude;
          finalLocationName = ipLocation.location_name;
          console.log(`📍 Real GPS location detected from IP ${clientIP}: ${finalLocationName} (${finalLatitude}, ${finalLongitude})`);
        } else {
          // Fallback: Use random Rwanda location if IP geolocation fails
          const rwandaLocations = [
            { lat: -1.9441, lng: 30.0619, name: 'Kigali, Rwanda' },
            { lat: -2.5833, lng: 29.7500, name: 'Huye, Rwanda' },
            { lat: -1.5000, lng: 29.6333, name: 'Musanze, Rwanda' },
            { lat: -2.6000, lng: 30.7500, name: 'Gisenyi, Rwanda' },
            { lat: -1.9500, lng: 30.4333, name: 'Rwamagana, Rwanda' }
          ];
          const randomLocation = rwandaLocations[Math.floor(Math.random() * rwandaLocations.length)];
          finalLatitude = randomLocation.lat;
          finalLongitude = randomLocation.lng;
          finalLocationName = randomLocation.name;
          console.log(`📍 Using random Rwanda location as fallback: ${randomLocation.name}`);
        }
      } catch (error) {
        console.error('❌ Location detection error:', error.message);
        // Use fallback location if all else fails
        const rwandaLocations = [
          { lat: -1.9441, lng: 30.0619, name: 'Kigali, Rwanda' },
          { lat: -2.5833, lng: 29.7500, name: 'Huye, Rwanda' },
          { lat: -1.5000, lng: 29.6333, name: 'Musanze, Rwanda' },
          { lat: -2.6000, lng: 30.7500, name: 'Gisenyi, Rwanda' },
          { lat: -1.9500, lng: 30.4333, name: 'Rwamagana, Rwanda' }
        ];
        const randomLocation = rwandaLocations[Math.floor(Math.random() * rwandaLocations.length)];
        finalLatitude = randomLocation.lat;
        finalLongitude = randomLocation.lng;
        finalLocationName = randomLocation.name;
        console.log(`📍 Using emergency fallback location: ${randomLocation.name}`);
      }

      // Validate GPS coordinates if we have them
      if (finalLatitude !== undefined && finalLongitude !== undefined) {
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
      
      const result = await pool.query(
        `INSERT INTO notification (near_rib, fullname, address, phone, message, latitude, longitude, location_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [near_rib, fullname, address, phone, message, finalLatitude || null, finalLongitude || null, finalLocationName || null]
      );
      
      console.log('✅ Notification inserted successfully:', result.rows[0]);

      const newNotification = result.rows[0];
      const googleMapsLinks = generateGoogleMapsLinks(finalLatitude, finalLongitude, finalLocationName);

      res.status(201).json({
        success: true,
        message: 'Notification sent successfully with automatic location tracking',
        data: { 
          notification: newNotification,
          device_tracking: {
            client_ip: clientIP,
            location_detected: !!(finalLatitude && finalLongitude),
            location_source: 'automatic_detection',
            location: finalLatitude && finalLongitude ? {
              latitude: parseFloat(finalLatitude),
              longitude: parseFloat(finalLongitude),
              location_name: finalLocationName || 'Auto-detected Location',
              google_maps_links: googleMapsLinks
            } : null,
            google_maps_links: googleMapsLinks
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

      // Update multiple notifications
      const placeholders = notification_ids.map((_, index) => `$${index + 1}`).join(',');
      const result = await pool.query(
        `UPDATE notification 
         SET is_read = $${notification_ids.length + 1}, updated_at = CURRENT_TIMESTAMP 
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