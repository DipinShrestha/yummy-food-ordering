const Restaurant = require('../models/Restaurant');

exports.listRestaurants = async (req, res) => {
  const restaurants = await Restaurant.find();
  res.json(restaurants);
};

exports.approveRestaurant = async (req, res) => {
  const { id } = req.params;
  const { approved } = req.body;
  await Restaurant.findByIdAndUpdate(id, { approved });
  res.json({ message: 'Restaurant updated' });
};

exports.deleteRestaurant = async (req, res) => {
  const { id } = req.params;
  await Restaurant.findByIdAndDelete(id);
  res.json({ message: 'Restaurant deleted' });
};
