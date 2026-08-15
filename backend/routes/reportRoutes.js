const express = require('express');
const router = express.Router();
const { getDashboardStats, exportSalesReportPDF } = require('../controllers/reportController');
const { verifyToken, requireAdmin } = require('../middleware/authMiddleware');

router.get('/dashboard', verifyToken, requireAdmin, getDashboardStats);
router.get('/pdf', verifyToken, requireAdmin, exportSalesReportPDF);

module.exports = router;
