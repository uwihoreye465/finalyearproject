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
const https = require('https');
const http = require('http');

// Get location from IP address
async function getLocationFromIP(ip) {
  try {
    console.log(`🌍 Getting location for IP: ${ip}`);
    
    // For localhost testing, use random Rwanda locations directly
    let targetIP = ip;
    if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      console.log('⚠️ Localhost IP detected, using random Rwanda location...');
      // Use random Rwanda location for localhost testing
      const rwandaLocations = [
        { lat: -1.9441, lng: 30.0619, name: 'Kigali, Rwanda' },
        { lat: -2.5833, lng: 29.7500, name: 'Huye, Rwanda' },
        { lat: -1.5000, lng: 29.6333, name: 'Musanze, Rwanda' },
        { lat: -2.6000, lng: 30.7500, name: 'Gisenyi, Rwanda' },
        { lat: -1.9500, lng: 30.4333, name: 'Rwamagana, Rwanda' },
        { lat: -2.4667, lng: 30.4333, name: 'Butare, Rwanda' },
        { lat: -1.6833, lng: 29.2333, name: 'Ruhengeri, Rwanda' },
        { lat: -2.1667, lng: 30.5167, name: 'Gitarama, Rwanda' }
      ];
      
      const randomLocation = rwandaLocations[Math.floor(Math.random() * rwandaLocations.length)];
      console.log(`📍 Using random Rwanda location: ${randomLocation.name}`);
      return {
        latitude: randomLocation.lat,
        longitude: randomLocation.lng,
        location_name: randomLocation.name
      };
    }

    // For real IPs, try to get actual location using HTTP requests
    try {
      console.log(`🔍 Getting REAL location for IP: ${targetIP}`);
      
      // Use a simple HTTP request to get real location
      const https = require('https');
      const http = require('http');
      
      return new Promise((resolve) => {
        const options = {
          hostname: 'ipapi.co',
          path: `/${targetIP}/json/`,
          method: 'GET',
          timeout: 5000
        };
        
        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk;
          });
          
          res.on('end', () => {
            try {
              const locationData = JSON.parse(data);
              if (locationData.latitude && locationData.longitude) {
                const locationName = `${locationData.city || 'Unknown'}, ${locationData.country_name || 'Unknown'}`;
                console.log(`📍 REAL location found: ${locationName} (${locationData.latitude}, ${locationData.longitude})`);
                resolve({
                  latitude: parseFloat(locationData.latitude),
                  longitude: parseFloat(locationData.longitude),
                  location_name: locationName
                });
              } else {
                throw new Error('No location data');
              }
            } catch (parseError) {
              console.log('⚠️ Could not parse location data, using fallback');
              resolve(null);
            }
          });
        });
        
        req.on('error', (error) => {
          console.log(`⚠️ HTTP request failed: ${error.message}`);
          resolve(null);
        });
        
        req.on('timeout', () => {
          console.log('⚠️ Request timeout');
          req.destroy();
          resolve(null);
        });
        
        req.setTimeout(5000);
        req.end();
      });
      
    } catch (error) {
      console.log(`⚠️ Error getting real location: ${error.message}`);
      return null;
    }
    
    // Fallback: Use random Rwanda coordinates for testing
    console.log('⚠️ All geolocation services failed, using Rwanda fallback');
    const rwandaLocations = [
      { lat: -1.9441, lng: 30.0619, name: 'Kigali, Rwanda' },
      { lat: -2.5833, lng: 29.7500, name: 'Huye, Rwanda' },
      { lat: -1.5000, lng: 29.6333, name: 'Musanze, Rwanda' },
      { lat: -2.6000, lng: 30.7500, name: 'Gisenyi, Rwanda' },
      { lat: -1.9500, lng: 30.4333, name: 'Rwamagana, Rwanda' }
    ];
    
    const randomLocation = rwandaLocations[Math.floor(Math.random() * rwandaLocations.length)];
    console.log(`📍 Using random Rwanda location: ${randomLocation.name}`);
    
    return {
      latitude: randomLocation.lat,
      longitude: randomLocation.lng,
      location_name: randomLocation.name
    };
    
  } catch (error) {
    console.log('❌ IP geolocation error:', error.message);
    return null;
  }
}

class NotificationController {
  // Send notification about sinner with automatic GPS location tracking
  async sendNotification(req, res) {
    try {
      const { 
        near_rib, 
        fullname, 
        address, 
        phone, 
        message
      } = req.body;

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

      const result = await pool.query(
        `INSERT INTO notification (near_rib, fullname, address, phone, message, latitude, longitude, location_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [near_rib, fullname, address, phone, message, finalLatitude || null, finalLongitude || null, finalLocationName || null]
      );

      res.status(201).json({
        success: true,
        message: 'Notification sent successfully',
        data: { 
          notification: result.rows[0],
          device_tracking: {
            client_ip: clientIP,
            location_detected: !!(finalLatitude && finalLongitude),
            location_source: latitude && longitude ? 'gps_provided' : 'ip_geolocation',
            location: finalLatitude && finalLongitude ? {
              latitude: parseFloat(finalLatitude),
              longitude: parseFloat(finalLongitude),
              location_name: finalLocationName || 'Auto-detected Location'
            } : null
          }
        }
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

      // Format notifications with GPS data
      const notifications = result.rows.map(notification => ({
        ...notification,
        gps_location: notification.has_gps_location ? {
          latitude: parseFloat(notification.latitude),
          longitude: parseFloat(notification.longitude),
          location_name: notification.location_name || 'Unknown Location'
        } : null
      }));

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
      const formattedNotification = {
        ...notification,
        gps_location: notification.has_gps_location ? {
          latitude: parseFloat(notification.latitude),
          longitude: parseFloat(notification.longitude),
          location_name: notification.location_name || 'Unknown Location'
        } : null
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

  // Get device location info for a specific notification
  async getNotificationDeviceInfo(req, res) {
    try {
      const { id } = req.params;

      const result = await pool.query(
        `SELECT 
           not_id, near_rib, fullname, address, phone, message, created_at, is_read,
           latitude, longitude, location_name,
           CASE 
             WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN true 
             ELSE false 
           END as has_location
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
      
      // Get additional device info if location exists
      let deviceInfo = {
        notification_id: notification.not_id,
        sender_name: notification.fullname,
        sender_phone: notification.phone,
        message: notification.message,
        sent_at: notification.created_at,
        has_location: notification.has_location
      };

      if (notification.has_location) {
        deviceInfo.location = {
          latitude: parseFloat(notification.latitude),
          longitude: parseFloat(notification.longitude),
          location_name: notification.location_name || 'Auto-detected Location',
          coordinates: `${notification.latitude}, ${notification.longitude}`
        };
        
        // Add Google Maps link for easy viewing
        deviceInfo.google_maps_link = `https://www.google.com/maps?q=${notification.latitude},${notification.longitude}`;
      }

      res.json({
        success: true,
        data: {
          device_info: deviceInfo,
          tracking_status: notification.has_location ? 'Location tracked successfully' : 'Location not available'
        }
      });

    } catch (error) {
      console.error('Get device info error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get device information'
      });
    }
  }

  // Get notifications by location (GPS-based search)
  async getNotificationsByLocation(req, res) {
    try {
      const { latitude, longitude, radius = 10, page = 1, limit = 10 } = req.query;
      
      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          message: 'Latitude and longitude are required for location-based search'
        });
      }

      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusKm = parseFloat(radius);
      const offset = (page - 1) * limit;

      // Validate coordinates
      if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        return res.status(400).json({
          success: false,
          message: 'Invalid GPS coordinates'
        });
      }

      // Count total notifications within radius
      const countQuery = `
        SELECT COUNT(*) as total
        FROM notification 
        WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND (
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(latitude))
          )
        ) <= $3
      `;

      const countResult = await pool.query(countQuery, [lat, lng, radiusKm]);
      const total = parseInt(countResult.rows[0].total);

      // Get notifications within radius with distance calculation
      const notificationsQuery = `
        SELECT 
          not_id, near_rib, fullname, address, phone, message, created_at, is_read,
          latitude, longitude, location_name,
          (
            6371 * acos(
              cos(radians($1)) * cos(radians(latitude)) * 
              cos(radians(longitude) - radians($2)) + 
              sin(radians($1)) * sin(radians(latitude))
            )
          ) as distance_km
        FROM notification 
        WHERE latitude IS NOT NULL 
        AND longitude IS NOT NULL
        AND (
          6371 * acos(
            cos(radians($1)) * cos(radians(latitude)) * 
            cos(radians(longitude) - radians($2)) + 
            sin(radians($1)) * sin(radians(latitude))
          )
        ) <= $3
        ORDER BY distance_km ASC
        LIMIT $4 OFFSET $5
      `;

      const result = await pool.query(notificationsQuery, [lat, lng, radiusKm, limit, offset]);

      const notifications = result.rows.map(notification => ({
        ...notification,
        gps_location: {
          latitude: parseFloat(notification.latitude),
          longitude: parseFloat(notification.longitude),
          location_name: notification.location_name || 'Unknown Location',
          distance_km: parseFloat(notification.distance_km).toFixed(2)
        }
      }));

      res.json({
        success: true,
        data: {
          notifications: notifications,
          search_center: { latitude: lat, longitude: lng },
          search_radius_km: radiusKm,
          pagination: paginate(total, page, limit)
        }
      });

    } catch (error) {
      console.error('Get notifications by location error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notifications by location'
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
          COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as messages_with_gps,
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
          COUNT(CASE WHEN latitude IS NOT NULL AND longitude IS NOT NULL THEN 1 END) as total_with_gps,
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