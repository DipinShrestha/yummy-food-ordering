const express = require('express');
const router = express.Router();
const { listRestaurants, approveRestaurant, deleteRestaurant } = require('../controllers/adminController');

router.get('/restaurants', listRestaurants);
router.patch('/restaurants/:id/approve', approveRestaurant);
router.delete('/restaurants/:id', deleteRestaurant);

module.exports = router;
