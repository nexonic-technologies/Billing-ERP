const { getPool } = require('../config/db');
const { generateInvoicePDF } = require('../utils/pdfGenerator');

async function createOrder(req, res) {
  const connection = await getPool().getConnection();
  try {
    await connection.beginTransaction();

    const {
      customer_name,
      customer_phone,
      items,
      discount_percentage = 0,
      tax_percentage = 5,
      payment_method = 'cash'
    } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({ success: false, message: 'Cart items cannot be empty' });
    }

    // 1. Calculate billing subtotal
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const [prods] = await connection.query('SELECT * FROM products WHERE id = ?', [item.product_id]);
      if (prods.length === 0) {
        await connection.rollback();
        return res.status(400).json({ success: false, message: `Product ID ${item.product_id} not found` });
      }

      const product = prods[0];
      const unitPrice = parseFloat(product.price);
      const qty = parseInt(item.quantity, 10) || 1;
      const itemTotal = unitPrice * qty;

      subtotal += itemTotal;
      validatedItems.push({
        product_id: product.id,
        product_name: product.name,
        quantity: qty,
        unit_price: unitPrice,
        total_price: itemTotal,
        customization: item.customization || ''
      });
    }

    // 2. Calculations
    const discountAmount = (subtotal * (parseFloat(discount_percentage) || 0)) / 100;
    const taxableAmount = Math.max(0, subtotal - discountAmount);
    const taxAmount = (taxableAmount * (parseFloat(tax_percentage) || 0)) / 100;
    const grandTotal = taxableAmount + taxAmount;

    // 3. Generate Bill Number: BILL-YYYYMMDD-HHMMSS-RAND
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randNum = Math.floor(100 + Math.random() * 900);
    const billNumber = `BILL-${dateStr}-${randNum}`;

    const cashierId = req.user ? req.user.id : null;

    // 4. Insert into orders table
    const [orderResult] = await connection.query(
      `INSERT INTO orders 
       (bill_number, customer_name, customer_phone, subtotal, tax_amount, discount_amount, grand_total, payment_method, cashier_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        billNumber,
        customer_name || 'Walk-in Customer',
        customer_phone || '',
        subtotal,
        taxAmount,
        discountAmount,
        grandTotal,
        payment_method,
        cashierId
      ]
    );

    const orderId = orderResult.insertId;

    // 5. Insert order items
    for (const item of validatedItems) {
      await connection.query(
        `INSERT INTO order_items 
         (order_id, product_id, product_name, quantity, unit_price, total_price, customization) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId,
          item.product_id,
          item.product_name,
          item.quantity,
          item.unit_price,
          item.total_price,
          item.customization
        ]
      );
    }

    await connection.commit();

    // Fetch full order for response
    const [createdOrderRows] = await connection.query('SELECT * FROM orders WHERE id = ?', [orderId]);
    const createdOrder = createdOrderRows[0];
    createdOrder.items = validatedItems;

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      order: createdOrder
    });

  } catch (error) {
    await connection.rollback();
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Failed to complete order checkout' });
  } finally {
    connection.release();
  }
}

async function getOrders(req, res) {
  try {
    const pool = getPool();
    const { search, limit = 50 } = req.query;

    let query = `
      SELECT o.*, u.name as cashier_name 
      FROM orders o 
      LEFT JOIN users u ON o.cashier_id = u.id
    `;
    const params = [];

    if (search) {
      query += ` WHERE o.bill_number LIKE ? OR o.customer_name LIKE ? OR o.customer_phone LIKE ?`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY o.id DESC LIMIT ?`;
    params.push(parseInt(limit, 10));

    const [orders] = await pool.query(query, params);
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch orders' });
  }
}

async function getOrderById(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [orders] = await pool.query(
      `SELECT o.*, u.name as cashier_name 
       FROM orders o 
       LEFT JOIN users u ON o.cashier_id = u.id 
       WHERE o.id = ? OR o.bill_number = ?`,
      [id, id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;

    res.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch order details' });
  }
}

async function downloadInvoicePDF(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();

    const [orders] = await pool.query('SELECT * FROM orders WHERE id = ? OR bill_number = ?', [id, id]);
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    const order = orders[0];
    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    order.items = items;

    generateInvoicePDF(order, res);
  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate invoice PDF' });
  }
}

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  downloadInvoicePDF
};
