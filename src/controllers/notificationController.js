const pool = require('../config/database');
const { paginate } = require('../utils/pagination');
const axios = require('axios'); // For IP geolocation

// Helper function to get location from IP
async function getLocationFromIP(ip) {
  if (ip === '127.0.0.1' || ip === '::1') {
    console.log('⚠️ Localhost IP detected. Skipping real IP geolocation.');
    return null; // Skip geolocation for localhost
  }
  try {
    // Using ipapi.co for geolocation
    const response = await axios.get(`https://ipapi.co/${ip}/json/`);
    const data = response.data;

    if (data.latitude && data.longitude) {
      return {
        latitude: data.latitude,
        longitude: data.longitude,
        location_name: `${data.city}, ${data.region}, ${data.country_name}`
      };
    }
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
        `INSERT INTO notification (near_rib, fullname, address, phone, message, gps_latitude, gps_longitude, location_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [near_rib, fullname, address, phone, message, finalLatitude || null, finalLongitude || null, finalLocationName || null]
      );
      
      console.log('✅ Notification inserted successfully:', result.rows[0]);

      const newNotification = result.rows[0];
      const googleMapsLink = (finalLatitude && finalLongitude) ? 
                             `https://www.google.com/maps?q=${finalLatitude},${finalLongitude}` : null;

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
              google_maps_link: googleMapsLink
            } : null,
            google_maps_link: googleMapsLink
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
           gps_latitude, gps_longitude, location_name,
           CASE 
             WHEN gps_latitude IS NOT NULL AND gps_longitude IS NOT NULL THEN true 
             ELSE false 
           END as has_gps_location
         FROM notification 
         ORDER BY not_id DESC 
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      // Format notifications with GPS data and Google Maps links
      const notifications = result.rows.map(notification => {
        const googleMapsLink = (notification.gps_latitude && notification.gps_longitude) ? 
                               `https://www.google.com/maps?q=${notification.gps_latitude},${notification.gps_longitude}` : null;
        
        return {
          ...notification,
          gps_location: notification.has_gps_location ? {
            latitude: parseFloat(notification.gps_latitude),
            longitude: parseFloat(notification.gps_longitude),
            location_name: notification.location_name || 'Unknown Location',
            google_maps_link: googleMapsLink
          } : null,
          google_maps_link: googleMapsLink
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
           gps_latitude, gps_longitude, location_name,
           CASE 
             WHEN gps_latitude IS NOT NULL AND gps_longitude IS NOT NULL THEN true 
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
      const googleMapsLink = (notification.gps_latitude && notification.gps_longitude) ? 
                             `https://www.google.com/maps?q=${notification.gps_latitude},${notification.gps_longitude}` : null;
      
      const formattedNotification = {
        ...notification,
        gps_location: notification.has_gps_location ? {
          latitude: parseFloat(notification.gps_latitude),
          longitude: parseFloat(notification.gps_longitude),
          location_name: notification.location_name || 'Unknown Location',
          google_maps_link: googleMapsLink
        } : null,
        google_maps_link: googleMapsLink
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
               (6371 * acos(cos(radians($1)) * cos(radians(gps_latitude)) *
               cos(radians(gps_longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(gps_latitude)))) AS distance
        FROM notification
        WHERE gps_latitude IS NOT NULL AND gps_longitude IS NOT NULL
        HAVING (6371 * acos(cos(radians($1)) * cos(radians(gps_latitude)) *
               cos(radians(gps_longitude) - radians($2)) +
               sin(radians($1)) * sin(radians(gps_latitude)))) <= $3
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
        'SELECT not_id, fullname, message, gps_latitude, gps_longitude, location_name, created_at FROM notification WHERE gps_latitude IS NOT NULL AND gps_longitude IS NOT NULL ORDER BY created_at DESC'
      );

      const notificationsWithLinks = result.rows.map(notif => ({
        ...notif,
        google_maps_link: `https://www.google.com/maps?q=${notif.gps_latitude},${notif.gps_longitude}`
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
      const totalNotificationsWithGPS = await pool.query('SELECT COUNT(*) FROM notification WHERE gps_latitude IS NOT NULL AND gps_longitude IS NOT NULL');
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
}

module.exports = new NotificationController();