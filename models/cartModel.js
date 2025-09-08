const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
    cartItems: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'field_Product'  

    },
    imageCover : { type : String,
     required: [true, 'imageCover required']
    },
    title: { type : String} 

,   quantity: {
      type: Number,
      default: 1,
    },
    color: String,
    price: Number,
    }],
    totalCartPrice: Number,
    totalPriceAfterDiscount: {
      type: Number,
      default: 0
    },
        user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    }
    }
    ,
    { timestamps: true }
    );
  
  module.exports = mongoose.model('Cart', cartSchema);