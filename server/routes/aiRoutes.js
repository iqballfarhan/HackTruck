const express = require('express');
const router = express.Router();
const { getTruckRecommendation } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.post('/recommend', protect, getTruckRecommendation);

module.exports = router;