const express = require('express');
const router = express.Router();
const { getMenu, addItem, deleteItem } = require('../controllers/menuController');

router.get('/', getMenu);
router.post('/', addItem);
router.delete('/:id', deleteItem);

module.exports = router;
