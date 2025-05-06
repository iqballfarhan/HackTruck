const express = require('express');
const { recommendCargo } = require('../controllers/cargoController');
const router = express.Router();

router.post('/recommend', recommendCargo);

module.exports = router;
