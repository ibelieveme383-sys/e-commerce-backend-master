
const totalpri=(cart)=>{
  let totalprice=0
  cart.cartItems.forEach(item => totalprice += item.price * item.quantity)
  cart.totalCartPrice = totalprice
}  
const cartModel = require('../models/cartModel')
const coupons = require('../models/couponModel')
const productModel = require('../models/productModel')

exports.addProductToCart = async (req, res) => {
  try {
    // احصل على productId سواء من body أو params
    const productId = req.body.productId || req.params.productId;
    const { color } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // البحث عن المنتج في قاعدة البيانات
    const product = await productModel.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "There is no product" });
    }

    // البحث عن مستند السلة للمستخدم الحالي
    let cart = await cartModel.findOne({ user: req.currentuser._id });
    if (!cart) {
      // إنشاء سلة جديدة إذا لم تكن موجودة
      cart = await cartModel.create({
        user: req.currentuser._id,
        cartItems: [{
          product: productId,
          color: color,
          price: product.price,
          imageCover: product.imageCover,
          title: product.title, // إضافة title
        }]
      });
    } else {
      // تحقق إذا كان المنتج بنفس اللون موجودًا بالفعل في السلة
      const productIndex = cart.cartItems.findIndex(
        item => item.product == productId && item.color == color
      );

      if (productIndex > -1) {
        // إذا كان موجودًا، قم بزيادة الكمية
        let cartItem = cart.cartItems[productIndex];
        cartItem.quantity += 1;
      } else {
        // إذا لم يكن موجودًا، أضف المنتج الجديد مع التفاصيل
        cart.cartItems.push({
          product: productId,
          color: color,
          price: product.price,
          imageCover: product.imageCover,
          title: product.title, // إضافة title
        });
      }
    }

    // حساب السعر الإجمالي للسلة
    totalpri(cart);
    // حفظ التغييرات
    await cart.save();

    res.status(200).json({ status: "success", length: cart.cartItems.length, data: cart });
  } catch (err) {
    res.status(500).json({ status: "fail", error: err });
  }
};

exports.getProductToCart = async(req, res) => {
try{ 
  let cart = await cartModel.findOne({ user: req.currentuser._id })
  if (!cart) {
    return res.json({ message:"the cart is empty"})
  }
res.status(200).json({ status : "success",length: cart.cartItems.length ,data: cart });
}
  catch (err) { res.status(500).json({ status: "fail", error: err }); }
}

exports.deleteProductfromCart = async (req, res) => {
  try {
    // التحقق من وجود الكارت للمستخدم
    let cart = await cartModel.findOne({ user: req.currentuser._id });
    
    if (!cart) {
      return res.json({ message: "No cart found for this user" });
    }

    // تحديث الكارت لإزالة العنصر بناءً على itemId و user
    cart = await cartModel.findOneAndUpdate(
      { user: req.currentuser._id }, // التأكد من أن التحديث يتم بناءً على user
      { $pull: { cartItems: { _id: req.params.itemId } } },
      { new: true }
    );

    if (!cart) {
      return res.json({ message: "The specified item does not exist in the cart" });
    }

    // تحديث إجمالي السعر بعد الحذف
    totalpri(cart);
    await cart.save();

    res.status(200).json({
      status: "success",
      length: cart.cartItems.length,
      data: cart,
    });
  } catch (err) {
    res.status(500).json({ status: "fail", error: err });
  }
};


exports.clearAllProductfromCart = async(req, res) => {
try{ 
  let cart = await cartModel.findOneAndDelete ({ user: req.currentuser._id });
  if (!cart) {
    return res.json({ message:"this cart is not exist  "})
  }
res.status(200).json({ status : "success",data: null });
}
  catch (err) { res.status(500).json({ status: "fail", error: err }); }
}

exports.updateQuantity = async (req, res) => {
  try {
    let { quantity } = req.body;
    let cart = await cartModel.findOne({ user: req.currentuser._id });

    if (!cart) {
      return res.json({ message: "this cart does not exist" });
    }

    const itemIndex = cart.cartItems.findIndex(item => item._id.toString() === req.params.itemId);
    if (itemIndex > -1) {
      cart.cartItems[itemIndex].quantity = quantity; // تعديل الكمية مباشرة
    } else {
      return res.json({ message: "item not found in cart" });
    }

    totalpri(cart); // تأكد من أن هذه الدالة تعمل بشكل صحيح
    await cart.save();

    res.status(200).json({ status: "success", length: cart.cartItems.length, data: cart });
  } catch (err) {
    res.status(500).json({ status: "fail", error: err });
  }
}


exports.totalPriceAfterDiscount = async(req, res) => {
  try {
    const { coupon } = req.body;
    const Coupon = await coupons.findOne({ name: coupon, expire: { $gt: Date.now() } });
    if (!Coupon) {
      return res.json("Coupon invalid or expired");
    }
    
    const cart = await cartModel.findOne({ user: req.currentuser._id });
    if (!cart) {
      return res.json("there is no Cart");
    }

    console.log("Total Cart Price before discount:", cart.totalCartPrice); // التحقق من السعر الأصلي
    const discountValue = (cart.totalCartPrice * Coupon.discount) / 100;
    cart.totalPriceAfterDiscount = (cart.totalCartPrice - discountValue).toFixed(2);
    console.log("Discount applied:", discountValue); // التحقق من قيمة الخصم
    console.log("Total Price after discount:", cart.totalPriceAfterDiscount); // التحقق من السعر بعد الخصم
    
    await cart.save();
    
    res.status(200).json({ 
      status: "success", 
      length: cart.cartItems.length, 
      data: cart, 
      totalPriceAfterDiscount: cart.totalPriceAfterDiscount 
    });
  } catch (err) {
    console.error("Error:", err); // عرض الخطأ في الـ console
    res.status(500).json({ status: "fail", error: err });
  }
};








