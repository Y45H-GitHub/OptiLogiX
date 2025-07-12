const express = require('express');
const router = express.Router();
const { query } = require('../db/database');

// Example route to fetch all items (can be adapted for logistics data)
router.get('/', async (req, res) => {
  try {
    // Replace 'items' with your actual logistics table/data
    const logisticsData = await query('SELECT * FROM items'); 
    res.json(logisticsData);
  } catch (error) {
    console.error('Error fetching logistics data:', error);
    res.status(500).send('Error fetching logistics data');
  }
});

module.exports = router;