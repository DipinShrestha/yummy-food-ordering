const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
