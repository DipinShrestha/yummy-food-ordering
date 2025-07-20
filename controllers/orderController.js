const Order = require('../models/Order');
const sendEmail = require('../utils/sendEmail');

exports.placeOrder = async (req, res) => {
  const { customerName, customerPhone, customerLocation, items, totalPrice, email } = req.body;
  const order = new Order({ customerName, customerPhone, customerLocation, items, totalPrice });
  await order.save();
  await sendEmail(email, 'Order Confirmation', 'Your order has been placed!');
  res.json({ message: 'Order placed successfully' });
};
