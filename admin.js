const express = require('express');
const router = express.Router();
const Restaurant = require('../models/Restaurant');
const authMiddleware = require('../middlewares/auth');

// Admin dashboard routes
router.get('/restaurants', authMiddleware, async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/restaurants/:id/approve', authMiddleware, async (req, res) => {
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

router.patch('/restaurants/:id/reject', authMiddleware, async (req, res) => {
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

module.exports = router;