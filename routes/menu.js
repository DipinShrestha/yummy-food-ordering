const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, async (req, res) => {
  const { name, description, price } = req.body;
  const restaurantId = req.restaurant._id; // from token

  try {
    const menuItem = new MenuItem({
      name,
      description,
      price,
      restaurant: restaurantId
    });

    await menuItem.save();
    res.status(201).json(menuItem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
