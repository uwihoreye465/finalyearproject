const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

class CloudinaryService {
  /**
   * Upload image from buffer (for base64 images)
   * @param {Buffer} imageBuffer - Image buffer
   * @param {string} folder - Cloudinary folder (e.g., 'arrested/images')
   * @param {string} publicId - Optional custom public ID
   * @returns {Promise<Object>} Upload result
   */
  static async uploadFromBuffer(imageBuffer, folder = 'arrested/images', publicId = null) {
    try {
      const uploadOptions = {
        folder: folder,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        transformation: [
          { width: 800, height: 600, crop: 'limit' }, // Resize for optimization
          { quality: 'auto' }
        ]
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${imageBuffer.toString('base64')}`,
        uploadOptions
      );

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        assetId: result.asset_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      };
    } catch (error) {
      console.error('Cloudinary upload from buffer error:', error);
      throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
  }

  /**
   * Upload image from file path
   * @param {string} filePath - Local file path
   * @param {string} folder - Cloudinary folder
   * @param {string} publicId - Optional custom public ID
   * @returns {Promise<Object>} Upload result
   */
  static async uploadFromPath(filePath, folder = 'arrested/images', publicId = null) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const uploadOptions = {
        folder: folder,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
        transformation: [
          { width: 800, height: 600, crop: 'limit' },
          { quality: 'auto' }
        ]
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      const result = await cloudinary.uploader.upload(filePath, uploadOptions);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        assetId: result.asset_id,
        width: result.width,
        height: result.height,
        format: result.format,
        size: result.bytes
      };
    } catch (error) {
      console.error('Cloudinary upload from path error:', error);
      throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
    }
  }

  /**
   * Delete image from Cloudinary
   * @param {string} publicId - Cloudinary public ID
   * @returns {Promise<Object>} Delete result
   */
  static async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      
      return {
        success: result.result === 'ok',
        result: result.result
      };
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
    }
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param {string} url - Cloudinary URL
   * @returns {string|null} Public ID or null
   */
  static extractPublicId(url) {
    if (!url || !url.includes('cloudinary.com')) {
      return null;
    }

    try {
      const urlParts = url.split('/');
      const filename = urlParts[urlParts.length - 1];
      const publicId = filename.split('.')[0];
      return publicId;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      return null;
    }
  }

  /**
   * Generate optimized image URL with transformations
   * @param {string} publicId - Cloudinary public ID
   * @param {Object} transformations - Cloudinary transformations
   * @returns {string} Optimized URL
   */
  static getOptimizedUrl(publicId, transformations = {}) {
    const defaultTransformations = {
      width: 400,
      height: 300,
      crop: 'fill',
      quality: 'auto',
      fetch_format: 'auto'
    };

    const finalTransformations = { ...defaultTransformations, ...transformations };
    
    return cloudinary.url(publicId, finalTransformations);
  }

  /**
   * Migrate existing local images to Cloudinary
   * @param {string} localImagePath - Local image path
   * @param {string} folder - Cloudinary folder
   * @returns {Promise<Object>} Migration result
   */
  static async migrateLocalImage(localImagePath, folder = 'arrested/images') {
    try {
      if (!fs.existsSync(localImagePath)) {
        throw new Error(`Local image not found: ${localImagePath}`);
      }

      // Generate unique public ID based on filename
      const filename = path.basename(localImagePath, path.extname(localImagePath));
      const publicId = `${folder}/${filename}_${Date.now()}`;

      const result = await this.uploadFromPath(localImagePath, folder, publicId);
      
      return {
        success: true,
        localPath: localImagePath,
        cloudinaryUrl: result.url,
        publicId: result.publicId,
        migrated: true
      };
    } catch (error) {
      console.error('Migration error:', error);
      return {
        success: false,
        localPath: localImagePath,
        error: error.message,
        migrated: false
      };
    }
  }

  /**
   * Test Cloudinary connection
   * @returns {Promise<Object>} Test result
   */
  static async testConnection() {
    try {
      const result = await cloudinary.api.ping();
      return {
        success: true,
        message: 'Cloudinary connection successful',
        status: result.status
      };
    } catch (error) {
      console.error('Cloudinary connection test failed:', error);
      return {
        success: false,
        message: 'Cloudinary connection failed',
        error: error.message
      };
    }
  }
}

module.exports = CloudinaryService;
