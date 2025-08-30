const Victim = require('../models/Victim');
const { validationResult } = require('express-validator');

class VictimController {
  // Create new victim record
  static async createVictim(req, res) {
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

      const result = await Victim.create(req.body);
      
      if (result.success) {
        res.status(201).json({
          success: true,
          message: 'Victim record created successfully',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in createVictim:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get all victim records
  static async getAllVictims(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const searchTerm = req.query.search || '';

      const result = await Victim.getAll(page, limit, searchTerm);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Victim records fetched successfully',
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
      console.error('Error in getAllVictims:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get victim record by ID
  static async getVictimById(req, res) {
    try {
      const { id } = req.params;
      const result = await Victim.getById(id);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Victim record fetched successfully',
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in getVictimById:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Update victim record
  static async updateVictim(req, res) {
    try {
      const { id } = req.params;
      const result = await Victim.update(id, req.body);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Victim record updated successfully',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in updateVictim:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Delete victim record
  static async deleteVictim(req, res) {
    try {
      const { id } = req.params;
      const result = await Victim.delete(id);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Victim record deleted successfully',
          data: result.data
        });
      } else {
        res.status(404).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in deleteVictim:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }

  // Get victim records by ID number
  static async getVictimByIdNumber(req, res) {
    try {
      const { idNumber } = req.params;
      const result = await Victim.getByIdNumber(idNumber);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Victim records fetched successfully',
          data: result.data
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } catch (error) {
      console.error('Error in getVictimByIdNumber:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  }
}

module.exports = VictimController;