const express = require('express');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/MenuItem');
const router = express.Router();

// Get all approved restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ approved: true });
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get restaurant menu
router.get('/:id/menu', async (req, res) => {
  try {
    const menuItems = await MenuItem.find({ restaurant: req.params.id });
    res.json(menuItems);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;