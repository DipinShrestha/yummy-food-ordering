// backend/index.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://yummy-food:xagqi1-tygvAw-havjun@yummy.54sn1ik.mongodb.net/?retryWrites=true&w=majority&appName=yummy', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Models
const MenuItem = require('./models/MenuItem');
const CartItem = require('./models/CartItem');

// Routes
app.get('/api/menu', async (req, res) => {
    const menu = await MenuItem.find();
    res.json(menu);
});

app.post('/api/menu', async (req, res) => {
    const newItem = new MenuItem(req.body);
    await newItem.save();
    res.json(newItem);
});

app.get('/api/cart', async (req, res) => {
    const cart = await CartItem.find();
    res.json(cart);
});

app.post('/api/cart', async (req, res) => {
    const item = new CartItem(req.body);
    await item.save();
    res.json(item);
});

app.delete('/api/cart/:id', async (req, res) => {
    await CartItem.findByIdAndDelete(req.params.id);
    res.sendStatus(204);
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
