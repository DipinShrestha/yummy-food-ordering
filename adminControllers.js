const Restaurant = require('../models/Restaurant');

exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.approveRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { 
        approved: true, 
        approvedAt: Date.now(), 
        rejected: false 
      },
      { new: true }
    );
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.rejectRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      { 
        rejected: true, 
        rejectedAt: Date.now(), 
        approved: false 
      },
      { new: true }
    );
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};