const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  imageUrl: String,
  category: String
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
