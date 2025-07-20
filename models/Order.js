const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  customerName: String,
  customerPhone: String,
  customerLocation: String,
  items: [
    {
      restaurantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant' },
      itemId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
      quantity: Number,
      price: Number
    }
  ],
  totalPrice: Number,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
