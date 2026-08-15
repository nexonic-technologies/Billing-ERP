const { getPool } = require('../config/db');

async function getCategories(req, res) {
  try {
    const pool = getPool();
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY id ASC');
    res.json({ success: true, categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch categories' });
  }
}

async function getProducts(req, res) {
  try {
    const pool = getPool();
    const { category_id, search } = req.query;

    let query = `
      SELECT p.*, c.name as category_name 
      FROM products p 
      JOIN categories c ON p.category_id = c.id
    `;
    const params = [];
    const conditions = [];

    if (category_id && category_id !== 'all') {
      conditions.push('p.category_id = ?');
      params.push(category_id);
    }

    if (search) {
      conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY p.id DESC';

    const [products] = await pool.query(query, params);
    res.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch products' });
  }
}

async function createProduct(req, res) {
  try {
    const { category_id, name, price, description, image_url, is_available } = req.body;

    if (!category_id || !name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Category, name, and price are required' });
    }

    const pool = getPool();
    const [result] = await pool.query(
      `INSERT INTO products (category_id, name, price, description, image_url, is_available) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        category_id,
        name,
        parseFloat(price),
        description || '',
        image_url || 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500',
        is_available !== undefined ? (is_available ? 1 : 0) : 1
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      productId: result.insertId
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ success: false, message: 'Failed to create product' });
  }
}

async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const { category_id, name, price, description, image_url, is_available } = req.body;

    const pool = getPool();
    await pool.query(
      `UPDATE products 
       SET category_id = ?, name = ?, price = ?, description = ?, image_url = ?, is_available = ? 
       WHERE id = ?`,
      [
        category_id,
        name,
        parseFloat(price),
        description,
        image_url,
        is_available ? 1 : 0,
        id
      ]
    );

    res.json({ success: true, message: 'Product updated successfully' });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ success: false, message: 'Failed to update product' });
  }
}

async function deleteProduct(req, res) {
  try {
    const { id } = req.params;
    const pool = getPool();
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ success: false, message: 'Failed to delete product' });
  }
}

module.exports = {
  getCategories,
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct
};
