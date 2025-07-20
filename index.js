const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const menuRoutes = require('./routes/menuRoutes');
const orderRoutes = require('./routes/orderRoutes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use('/api/restaurant', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/order', orderRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
