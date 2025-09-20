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
router.post('/', notificationController.sendNotification);
router.get('/', notificationController.getAllNotifications);
router.get('/location', notificationController.getNotificationsByLocation);
router.get('/map', notificationController.getNotificationsForMap);
router.get('/gps-statistics', notificationController.getNotificationGPSStatistics);
router.get('/stats/rib-statistics', notificationController.getRibStatistics);
router.get('/:id', notificationController.getNotificationById);

// Protected routes (require authentication)
router.put('/:id', auth, notificationController.updateNotification);
router.delete('/:id', auth, notificationController.deleteNotification);

module.exports = router;