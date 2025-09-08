const brandServices = require('../services/brandService');
const express = require('express');
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
const processImage = (req, res, next) => {
  if (!req.file) {
    return next(new Error("No file uploaded"));
  }

  const filename = `user-${uuidv4()}-${Date.now()}.jpeg`;
  const uploadDir = path.join(__dirname, '../uploads/users');

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  sharp(req.file.buffer)
    .resize(600, 600)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(path.join(uploadDir, filename), (err) => {
      if (err) {
        console.error("Error saving the file:", err);
        return next(err);
      }
      req.savedImage = filename;
      next();
    });
};
router.route('/').post(upload.single('image') , processImage,brandServices.createBrand).get(brandServices.getBrands)
router.route('/:Id').get(brandServices.getBrand).patch(brandServices.updateBrand).delete(brandServices.deleteBrand)

module.exports = router;