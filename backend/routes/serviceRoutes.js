const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const fc = require('../controllers/freelancerController');

// Public endpoint to get active services
router.get('/', fc.getActiveServices);

// Protected endpoint for clients to create order from a service
router.post('/order', protect, fc.createOrderFromService);

module.exports = router;
