const express = require('express');
const multer = require('multer');
const router = express.Router();
const { storage } = require('../config/Cloudinary');
const protect = require('../middlerware/AuthMiddlerware');
const productController = require('../controllers/productController');

const cloudinaryUpload = multer({ storage });


const getUploadedFiles = (req) => {
  if (!req.files) return [];
  if (Array.isArray(req.files)) return req.files;
  if (req.files.image) return req.files.image;
  if (req.files.images) return req.files.images;
  return [];
};

router.post('/create', protect, (req, res, next) => {
  cloudinaryUpload.fields([
    { name: 'image', maxCount: 10 },
    { name: 'images', maxCount: 10 }
  ])(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    const files = req.files ? Object.values(req.files).flat() : [];

    if (files.length < 4) {
      return res.status(400).json({ message: 'At least 4 images are required' });
    }

    req.body.images = files.map((file) => file.path || file.secure_url);
    next();
  });
}, productController.createProduct);

router.put('/update/:id', protect, cloudinaryUpload.single('image'), productController.updateProduct);
router.get('/listings', productController.getAllproducts);
router.get('/categories', productController.getCategories);
router.get('/mylistings', protect, productController.getmyproducts);
router.delete('/delete/:id', protect, productController.deleteProduct);
router.get('/:id', productController.getProductById);


module.exports = router;