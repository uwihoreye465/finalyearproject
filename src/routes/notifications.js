const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');
const { validateNotification } = require('../middleware/validation');

// All routes require authentication
router.use(auth);

router.post('/', validateNotification, notificationController.sendNotification);
router.get('/', notificationController.getAllNotifications);
router.get('/:id', notificationController.getNotificationById);
router.delete('/:id', notificationController.deleteNotification);

module.exports = router;