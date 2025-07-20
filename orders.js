const express = require('express');
const Order = require('../models/Order');
const router = express.Router();

// Create new order
router.post('/', async (req, res) => {
  try {
    const order = new Order({
      ...req.body,
      orderId: `ORD-${Date.now()}`
    });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get orders by restaurant
router.get('/restaurant/:id', async (req, res) => {
  try {
    const orders = await Order.find({ restaurant: req.params.id });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;