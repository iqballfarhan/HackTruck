const express = require('express');
const router = express.Router();
const { register, login, googleLogin, updateProfile, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Define routes using direct method syntax instead of the route() chain
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/profile/update', protect, updateProfile);
router.post('/change-password', protect, changePassword);

module.exports = router;