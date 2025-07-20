const MenuItem = require('../models/MenuItem');

exports.getMenu = async (req, res) => {
  const items = await MenuItem.find().populate('restaurantId', 'name');
  res.json(items);
};

exports.addItem = async (req, res) => {
  const { restaurantId, itemName, description, price } = req.body;
  const item = new MenuItem({ restaurantId, itemName, description, price });
  await item.save();
  res.json({ message: 'Item added' });
};

exports.deleteItem = async (req, res) => {
  const { id } = req.params;
  await MenuItem.findByIdAndDelete(id);
  res.json({ message: 'Item deleted' });
};
