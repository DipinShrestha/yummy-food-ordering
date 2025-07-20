const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
  itemName: String,
  description: String,
  price: Number
});

module.exports = mongoose.model('MenuItem', menuItemSchema);
