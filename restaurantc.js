const express = require('express');
const Restaurant = require('../models/Restaurant');
const MenuItem = require('../models/menuitem');
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

// ===== ADMIN-ONLY ROUTES ===== //
router.get('/admin/list', authMiddleware, async (req, res) => {
    try {
      const restaurants = await Restaurant.find();
      res.json(restaurants);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  router.patch('/admin/:id/approve', authMiddleware, async (req, res) => {
    try {
      const restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        { approved: true, approvedAt: Date.now(), rejected: false },
        { new: true }
      );
      res.json(restaurant);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  router.patch('/admin/:id/reject', authMiddleware, async (req, res) => {
    try {
      const restaurant = await Restaurant.findByIdAndUpdate(
        req.params.id,
        { rejected: true, rejectedAt: Date.now(), approved: false },
        { new: true }
      );
      res.json(restaurant);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });