const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, adminAuth } = require('../middleware/auth');

// All routes require authentication and admin role
router.use(auth);
router.use(adminAuth);

router.get('/', userController.getAllUsers);
router.get('/pending', userController.getPendingUsers);
router.get('/dashboard/stats', userController.getDashboardStats);
router.put('/:id/approval', userController.updateUserApproval);
router.delete('/:id', userController.deleteUser);

module.exports = router;