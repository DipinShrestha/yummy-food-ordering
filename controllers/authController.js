const Restaurant = require('../models/Restaurant');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res) => {
  const { name, email, password } = req.body;
  const hash = await bcrypt.hash(password, 10);
  const restaurant = new Restaurant({ name, email, passwordHash: hash });
  await restaurant.save();
  res.json({ message: 'Signup successful. Wait for admin approval.' });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const restaurant = await Restaurant.findOne({ email });
  if (!restaurant) return res.status(400).json({ message: 'Invalid credentials' });
  if (!restaurant.approved) return res.status(403).json({ message: 'Not approved by admin' });
  const isMatch = await bcrypt.compare(password, restaurant.passwordHash);
  if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
  const token = jwt.sign({ id: restaurant._id }, process.env.JWT_SECRET);
  res.json({ token });
};
