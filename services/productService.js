const productModel = require('../models/productModel')
const slugify = require('slugify')


exports.createProduct = async (req, res) => {
    try {
        // تحقق من وجود الصور
        if (!req.imageCover || !req.images || req.images.length === 0) {
            return res.status(400).json({ status: 'fail', message: 'Please upload at least one image.' });
        }

        // إنشاء الـ slug بناءً على العنوان
        req.body.slug = slugify(req.body.title);

        // إنشاء المنتج باستخدام بيانات الـ request
        const Product = await productModel.create({
            imageCover: req.imageCover,
            images: req.images,
            title: req.body.title,
            priceAfterDiscount: req.body.priceAfterDiscount,
            sold: req.body.sold,
            description: req.body.description,
            quantity: req.body.quantity,
            category: req.body.category,
            price: req.body.price,
            slug: req.body.slug,
            colors: req.body.colors,
        });

        // إرجاع رد إيجابي مع بيانات المنتج
        res.status(201).json({ status: 'success', Data: Product });
    } catch (err) {
        console.error("Error creating product:", err);
        res.status(500).json({ status: 'fail', message: 'Internal server error.', error: err });
    }
};
exports.Productget_all = async (req, res) => {
    try {
        const page = req.query.page*1||1
        const limit = req.query.limit * 1 || 100
        const skip=(page-1)*limit
        const Product = await productModel.find().skip(skip).limit(limit).populate('reviews')

        res.status(200).json({ count: Product.length ,status: 'success', Data: Product })
    }
    catch (err) { res.status(500).json({ status:'fail', Data: err}) }
}
exports.get_one_Product = async (req, res) => {
    try {

        const Product = await productModel.findById(req.params.Id).populate("reviews")

        res.status(200).json({ count: Product.length ,status: 'success', Data: Product })
    }
    catch (err) { res.status(500).json({ status:'fail', Data: err}) }
}
exports.update_Product = async (req, res) => {
    try {

        if (req.body.title) {
            req.body.slug = slugify(req.body.title)
        }
        const Product = await productModel.findByIdAndUpdate(req.params.Id,req.body,{ new: true, runValidators: true })

        res.status(200).json({ count: Product.length ,status: 'success', Data: Product })
    }
    catch (err) { res.status(500).json({ status:'fail', Data: err}) }
}

exports.delete = async (req, res) => {
    try {

        await productModel.findByIdAndDelete(req.params.Id)

        res.status(200).json({ status: 'success' })
    }
    catch (err) { res.status(500).json({ status:'fail', Data: err}) }
}

 // Get products by category ID
exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    // البحث عن المنتجات التي تتطابق مع categoryId
    const products = await productModel.find({ category: categoryId });
    
    // التحقق إذا كانت المنتجات موجودة
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found for this category." });
    }
    
    // إرجاع قائمة المنتجات
    res.status(200).json({ products });
  } catch (error) {
    console.error("Error fetching products by category:", error);
    res.status(500).json({ message: "Failed to fetch products by category.", error });
  }
};


