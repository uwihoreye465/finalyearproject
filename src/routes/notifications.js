// const express = require('express');
// const router = express.Router();
// const notificationController = require('../controllers/notificationController');
// const { auth } = require('../middleware/auth');
// const { validateNotification } = require('../middleware/validation');

// // All routes require authentication
// router.use(auth);

// router.post('/', validateNotification, notificationController.sendNotification);
// router.get('/', notificationController.getAllNotifications);
// router.get('/:id', notificationController.getNotificationById);
// router.delete('/:id', notificationController.deleteNotification);

// module.exports = router;

const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { auth } = require('../middleware/auth');
const { validateNotification } = require('../middleware/validation');

// Public routes (no authentication required)
router.post('/', validateNotification, notificationController.sendNotification);
router.get('/', notificationController.getAllNotifications);
router.get('/location', notificationController.getNotificationsByLocation);
router.get('/device-info/:id', notificationController.getNotificationDeviceInfo);
router.get('/:id', notificationController.getNotificationById);
// Add statistics route
router.get('/stats/rib-statistics', notificationController.getRibStatistics);

// Protected routes (require authentication)
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;