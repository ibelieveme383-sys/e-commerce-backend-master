const Favorite = require('../models/favoriteModel');

// إضافة منتج إلى المفضلات
exports.addToFavorites = async (req, res) => {
    try {
        const { productId } = req.body;
        const {userId} = req.body;

        // const existingFavorite = await Favorite.findOne({ userId, productId });
        // if (existingFavorite) {
        //     return res.status(400).json({ message: 'المنتج موجود بالفعل في المفضلات' });
        // }

        const favorite = new Favorite({ userId, productId });
        await favorite.save();

        return res.status(200).json({ message: 'تمت إضافة المنتج إلى المفضلات' });
    } catch (error) {
        return res.status(500).json({ message: 'خطأ في الخادم', error });
    }
};

// إزالة منتج من المفضلات
exports.removeFromFavorites = async (req, res) => {
    try {
        const { productId } = req.body;
        const {userId} = req.body;

        await Favorite.findOneAndDelete({ userId, productId });
        return res.status(200).json({ message: 'تمت إزالة المنتج من المفضلات' });
    } catch (error) {
        return res.status(500).json({ message: 'خطأ في الخادم', error });
    }
};

// جلب قائمة المفضلات للمستخدم
exports.getFavorites = async (req, res) => {
    try {
        const { userId } = req.params; // أخذ userId من params

        const favorites = await Favorite.find({ userId })
            .populate('productId');

        return res.status(200).json({ favorites });
    } catch (error) {
        return res.status(500).json({ message: 'خطأ في الخادم', error });
    }
};
