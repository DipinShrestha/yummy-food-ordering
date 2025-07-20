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

// Register a new restaurant (signup)
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // Check if already exists
    const existing = await Restaurant.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Restaurant already exists' });
    }

    const newRestaurant = new Restaurant({
      name,
      email,
      password,
      phone,
      address,
      approved: false,
      rejected: false,
      createdAt: new Date()
    });

    await newRestaurant.save();
    res.status(201).json(newRestaurant);
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Server error' });
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