const express = require('express');
const router = express.Router();
const { addToFavorites, removeFromFavorites, getFavorites} = require('../services/FavoriteService');

router.post('/favorites/add', addToFavorites);
router.delete('/favorites/remove', removeFromFavorites);
router.get('/favorites/:userId', getFavorites);

module.exports = router;
