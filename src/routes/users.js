const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');
const {
  validateChangePassword,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validation');
// All routes require authentication and admin role
router.use(auth);
router.use(adminAuth);
router.get('/:id', userController.getUserById); 
router.get('/', userController.getAllUsers);
router.get('/pending', userController.getPendingUsers);
router.get('/dashboard/stats', userController.getDashboardStats);
router.put('/:id/approval', userController.updateUserApproval);
router.delete('/:id', userController.deleteUser);


// Public routes
router.post('/forgot-password', validateForgotPassword, userController.forgotPassword);
router.post('/reset-password/:token', validateResetPassword, userController.resetPassword);

// Protected routes (require authentication)
router.post('/change-password', auth, validateChangePassword, userController.changePassword);

module.exports = router;