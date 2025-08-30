const Sinner = require('../models/Sinner');
const { validationResult } = require('express-validator');

class SinnerController {
  // Create new criminal record
  static async createSinner(req, res) {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const result = await Sinner.create(req.body);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Criminal record created successfully',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in createSinner:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get all criminal records
  static async getAllSinners(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const searchTerm = req.query.search || '';

      const result = await Sinner.getAll(page, limit, searchTerm);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Criminal records fetched successfully',
          data: result.data,
          pagination: result.pagination
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in getAllSinners:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get criminal record by ID
  static async getSinnerById(req, res) {
    try {
      const { id } = req.params;
      const result = await Sinner.getById(id);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Criminal record fetched successfully',
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in getSinnerById:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Update criminal record
  static async updateSinner(req, res) {
    try {
      const { id } = req.params;
      const result = await Sinner.update(id, req.body);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Criminal record updated successfully',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in updateSinner:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Delete criminal record
  static async deleteSinner(req, res) {
    try {
      const { id } = req.params;
      const result = await Sinner.delete(id);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Criminal record deleted successfully',
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in deleteSinner:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get criminal records by ID number
  static async getSinnerByIdNumber(req, res) {
    try {
      const { idNumber } = req.params;
      const result = await Sinner.getByIdNumber(idNumber);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Criminal records fetched successfully',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in getSinnerByIdNumber:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

module.exports = SinnerController;