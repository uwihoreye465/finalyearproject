const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');
const { validateRegistration, validateLogin } = require('../middleware/validation');

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/verify-email/:token', authController.verifyEmail);
// Alternative verify route for email links (compatibility)
router.get('/verify/:token', authController.verifyEmail);
router.post('/create-first-admin', authController.createFirstAdmin);
router.post('/refresh-token', authController.refreshToken);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// IMPORTANT: Place this route LAST to avoid conflicts with other routes
// Direct token verification (for direct API calls)
router.get('/:token', (req, res, next) => {
  // Only handle if token looks like a verification token (long hex string)
  if (req.params.token && req.params.token.length >= 32 && /^[a-f0-9]+$/i.test(req.params.token)) {
    return authController.verifyEmail(req, res);
  }
  next(); // Pass to next route if not a token
});

// Protected routes
router.get('/profile', auth, authController.getProfile);

module.exports = router;