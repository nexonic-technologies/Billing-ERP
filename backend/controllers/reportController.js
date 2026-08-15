const { getPool } = require('../config/db');
const { generateReportPDF } = require('../utils/pdfGenerator');

async function getDashboardStats(req, res) {
  try {
    const pool = getPool();

    // 1. Overall stats
    const [overall] = await pool.query(`
      SELECT 
        COALESCE(SUM(grand_total), 0) as total_revenue,
        COUNT(id) as total_orders,
        COALESCE(AVG(grand_total), 0) as avg_order_value
      FROM orders
    `);

    // 2. Today's stats
    const [today] = await pool.query(`
      SELECT 
        COALESCE(SUM(grand_total), 0) as today_revenue,
        COUNT(id) as today_orders
      FROM orders 
      WHERE DATE(created_at) = CURRENT_DATE()
    `);

    // 3. Payment method breakdown
    const [paymentBreakdown] = await pool.query(`
      SELECT payment_method, COUNT(*) as count, COALESCE(SUM(grand_total), 0) as total
      FROM orders
      GROUP BY payment_method
    `);

    // 4. Top selling items
    const [topProducts] = await pool.query(`
      SELECT product_name, SUM(quantity) as total_qty, SUM(total_price) as total_sales
      FROM order_items
      GROUP BY product_name
      ORDER BY total_qty DESC
      LIMIT 5
    `);

    // 5. Recent 10 orders
    const [recentOrders] = await pool.query(`
      SELECT id, bill_number, customer_name, grand_total, payment_method, created_at
      FROM orders
      ORDER BY id DESC
      LIMIT 10
    `);

    res.json({
      success: true,
      stats: {
        total_revenue: overall[0].total_revenue,
        total_orders: overall[0].total_orders,
        avg_order_value: overall[0].avg_order_value,
        today_revenue: today[0].today_revenue,
        today_orders: today[0].today_orders,
        paymentBreakdown,
        topProducts,
        recentOrders
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: 'Failed to load report analytics' });
  }
}

async function exportSalesReportPDF(req, res) {
  try {
    const pool = getPool();
    const { startDate, endDate } = req.query;

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const end = endDate || new Date().toISOString().slice(0, 10);

    const [statsRows] = await pool.query(`
      SELECT 
        COALESCE(SUM(grand_total), 0) as total_revenue,
        COUNT(id) as total_orders,
        COALESCE(AVG(grand_total), 0) as avg_order_value
      FROM orders
      WHERE DATE(created_at) BETWEEN ? AND ?
    `, [start, end]);

    const [orders] = await pool.query(`
      SELECT * FROM orders
      WHERE DATE(created_at) BETWEEN ? AND ?
      ORDER BY id DESC
    `, [start, end]);

    generateReportPDF(statsRows[0], orders, start, end, res);
  } catch (error) {
    console.error('Error exporting PDF report:', error);
    res.status(500).json({ success: false, message: 'Failed to generate report PDF' });
  }
}

module.exports = {
  getDashboardStats,
  exportSalesReportPDF
};
