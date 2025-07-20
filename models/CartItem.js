const mongoose = require('mongoose');

const CartItemSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
  imageUrl: String
});

module.exports = mongoose.model('CartItem', CartItemSchema);
