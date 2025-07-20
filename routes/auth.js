const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Restaurant = require('../models/Restaurant');
const router = express.Router();

// RESTAURANT LOGIN
router.post('/restaurants/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const restaurant = await Restaurant.findOne({ email });

    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });
    if (!restaurant.approved) return res.status(403).json({ message: 'Not approved yet' });

    const isMatch = await bcrypt.compare(password, restaurant.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { _id: restaurant._id, email: restaurant.email },
      process.env.JWT_SECRET || 'your_secret_key',
      { expiresIn: '1d' }
    );

    res.json({ _id: restaurant._id, token });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
