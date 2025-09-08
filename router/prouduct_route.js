const productService = require('../services/productService');
const express = require('express');
const reviews = require('./ReviewRout');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { v4: uuidv4 } = require('uuid');

// Memory storage configuration
const memoryStorage = multer.memoryStorage();

// File filter function
const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type, only JPEG/PNG is allowed"), false);
    }
};

// Multer upload configuration
const upload = multer({ 
    storage: memoryStorage, 
    fileFilter: multerFilter 
});

// Image processing middleware
const processImages = async (req, res, next) => {
  const uploadDir = path.join(__dirname, '../uploads/users');

  if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
  }

  // مصفوفة لتخزين أسماء الملفات
  req.savedImages = [];

  try {
      // معالجة صورة الـ imageCover
      if (req.files.imageCover && req.files.imageCover.length > 0) {
          const imageCoverFile = req.files.imageCover[0];
          const filenameCover = `user-cover-${uuidv4()}-${Date.now()}.jpeg`;

          await sharp(imageCoverFile.buffer)
              .resize(600, 600)
              .toFormat('jpeg')
              .jpeg({ quality: 90 })
              .toFile(path.join(uploadDir, filenameCover));

          req.imageCover = filenameCover; // تخزين اسم صورة الـ imageCover
      } else {
          return next(new Error("No imageCover uploaded"));
      }

      // معالجة صور الـ images
      if (req.files.images && req.files.images.length > 0) {
          const imagePromises = req.files.images.map((file, index) => {
              const filename = `user-image-${uuidv4()}-${Date.now()}-${index + 1}.jpeg`;
              
              return sharp(file.buffer)
                  .resize(600, 600)
                  .toFormat('jpeg')
                  .jpeg({ quality: 90 })
                  .toFile(path.join(uploadDir, filename))
                  .then(() => req.savedImages.push(filename));
          });

          // انتظار اكتمال معالجة جميع الصور
          await Promise.all(imagePromises);
          req.images = req.savedImages; // جميع الصور
      } else {
          req.images = []; // إذا لم يكن هناك صور، تعيين مصفوفة فارغة
      }

      next(); // الانتقال إلى الخطوة التالية
  } catch (err) {
      console.error("Error processing images:", err);
      next(err);
  }
};


router.use('/:productId/reviews', reviews);

router.route('/')
    .post(upload.fields([
        { name: 'imageCover', maxCount: 1 },
        { name: 'images', maxCount: 5 }
    ]), processImages, productService.createProduct)
    .get(productService.Productget_all);

router.route('/:Id')
    .get(productService.get_one_Product)
    .patch(productService.update_Product)
    .delete(productService.delete);

// Route for getting products by category ID
router.route('/category/:categoryId').get(productService.getProductsByCategory);
    

module.exports = router;
