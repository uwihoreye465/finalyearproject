const cloudinary = require('cloudinary').v2;

// Configure Cloudinary with your credentials
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME || 'decqzzdc3',
  api_key: process.env.CLOUD_API_KEY || '868222617869634',
  api_secret: process.env.CLOUD_API_SECRET || 'mP-o8wH7iDiwR7xCGpjgohN4xgM'
});

module.exports = cloudinary;
