const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');
const {
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validation');

// Public routes
router.post('/forgot-password', validateForgotPassword, userController.forgotPassword);
router.post('/reset-password/:token', validateResetPassword, userController.resetPassword);

// User self-management routes (require authentication only)
router.use(auth);
router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.post('/change-password', validateChangePassword, userController.changePassword);

// Admin-only routes (require admin authentication)
router.use(adminAuth);
router.get('/:id', userController.getUserById); 
router.get('/', userController.getAllUsers);
router.get('/pending', userController.getPendingUsers);
router.get('/dashboard/stats', userController.getDashboardStats);
router.put('/:id/approval', userController.updateUserApproval);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;