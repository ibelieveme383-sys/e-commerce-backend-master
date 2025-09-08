const cartServices = require('../services/cartServices');
const protect = require('../services/securityUser');
const express = require('express');
const router = express.Router();
// router.route('/').post(protect.protect, cartServices.addProductToCart).get(protect.protect, cartServices.getProductToCart)
router.route('/cart/:productId').post(protect.protect, cartServices.addProductToCart).get(protect.protect, cartServices.getProductToCart) 
router.route('/cart/deleteupdate/:itemId').delete(protect.protect, cartServices.deleteProductfromCart).patch(  protect.protect,cartServices.updateQuantity)
router.post('/applyCoupon',protect.protect, cartServices.totalPriceAfterDiscount)
router.route('/delete/all').delete(protect.protect, cartServices.clearAllProductfromCart)

module.exports = router;