const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  downloadInvoicePDF
} = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/', verifyToken, createOrder);
router.get('/', verifyToken, getOrders);
router.get('/:id', verifyToken, getOrderById);
router.get('/:id/pdf', downloadInvoicePDF);

module.exports = router;
