const express = require('express');
const router = express.Router();
const {
  getCategories,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.get('/', getProducts);

// Admin restricted endpoints
router.post('/', verifyToken, requireAdmin, createProduct);
router.put('/:id', verifyToken, requireAdmin, updateProduct);
router.delete('/:id', verifyToken, requireAdmin, deleteProduct);

module.exports = router;
