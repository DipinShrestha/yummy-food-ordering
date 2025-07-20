// routes/restaurants.js
const express  = require('express');
const bcrypt   = require('bcrypt');
const authMw   = require('../middleware/authMiddleware');   // ← adjust if your file is elsewhere
const Restaurant = require('../models/Restaurant');
const MenuItem   = require('../models/menuitem');

const router = express.Router();

/* ───────────────────── PUBLIC ───────────────────── */

// 🔹 Signup  ➜  POST /api/restaurants
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone, address } = req.body;

    // already exists?
    if (await Restaurant.findOne({ email })) {
      return res.status(400).json({ message: 'Restaurant already exists' });
    }

    const hashed = await bcrypt.hash(password, 10);

    const restaurant = await Restaurant.create({
      name,
      email,
      password: hashed,
      phone,
      address,
      approved: false,
      rejected: false,
      createdAt: new Date()
    });

    res.status(201).json({ message: 'Signup ok — waiting for approval' });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔹 Login  ➜  POST /api/restaurants/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const restaurant = await Restaurant.findOne({ email });
    if (!restaurant) return res.status(401).json({ message: 'Invalid email or password' });

    const ok = await bcrypt.compare(password, restaurant.password);
    if (!ok)     return res.status(401).json({ message: 'Invalid email or password' });
    if (!restaurant.approved)
      return res.status(403).json({ message: 'Restaurant not approved yet' });

    // (Optional) create JWT here and send token instead of raw data
    res.json({
      id:   restaurant._id,
      name: restaurant.name,
      email: restaurant.email
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔹 Get all approved restaurants  ➜  GET /api/restaurants
router.get('/', async (_req, res) => {
  try {
    const list = await Restaurant.find({ approved: true });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🔹 Get menu for a restaurant     ➜  GET /api/restaurants/:id/menu
router.get('/:id/menu', async (req, res) => {
  try {
    const items = await MenuItem.find({ restaurant: req.params.id });
    res.json(items);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ────────────────── COMPANY‑ADMIN ────────────────── */

// list every restaurant (approved or not)
router.get('/admin/list', authMw, async (_req, res) => {
  try {
    const list = await Restaurant.find();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// approve
router.patch('/admin/:id/approve', authMw, async (req, res) => {
  try {
    const r = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { approved: true, approvedAt: Date.now(), rejected: false },
      { new: true }
    );
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// reject
router.patch('/admin/:id/reject', authMw, async (req, res) => {
  try {
    const r = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { rejected: true, rejectedAt: Date.now(), approved: false },
      { new: true }
    );
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
