const express = require('express');
const router = express.Router();

// --- UPDATED: Import the new controller functions ---
const { generateStrategy, getStrategies, getStrategyById } = require('../controllers/strategyController');

// Route to generate a content strategy
router.route('/generate').post(generateStrategy);

// --- NEW: Route to get all strategies ---
router.route('/').get(getStrategies);

// --- NEW: Route to get a single strategy by ID ---
// Note: This must come AFTER the '/generate' route
router.route('/:id').get(getStrategyById);

module.exports = router;