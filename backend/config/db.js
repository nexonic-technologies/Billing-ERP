const mysql = require('mysql2/promise');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true
};

let activeMode = 'mysql'; // 'mysql' or 'sqlite'
let mysqlPool = null;
let sqliteDb = null;

// Helper: Convert MySQL ? placeholders / SQL syntax for SQLite if needed
function adaptSqlForSqlite(sql) {
  let adapted = sql;

  // Replace CURRENT_DATE() with DATE('now')
  adapted = adapted.replace(/CURRENT_DATE\(\)/gi, "DATE('now')");
  
  return adapted;
}

// Promisified SQLite Query Runner matching MySQL mysql2 return format [rows, fields]
function runSqliteQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    const adaptedSql = adaptSqlForSqlite(sql);
    const trimmed = adaptedSql.trim().toUpperCase();

    if (trimmed.startsWith('SELECT')) {
      sqliteDb.all(adaptedSql, params, (err, rows) => {
        if (err) return reject(err);
        resolve([rows || []]);
      });
    } else if (trimmed.startsWith('INSERT')) {
      sqliteDb.run(adaptedSql, params, function (err) {
        if (err) return reject(err);
        resolve([{ insertId: this.lastID, affectedRows: this.changes }]);
      });
    } else {
      sqliteDb.run(adaptedSql, params, function (err) {
        if (err) return reject(err);
        resolve([{ affectedRows: this.changes }]);
      });
    }
  });
}

// Unified Database Pool Object Exposing Query & Transaction Interfaces
const unifiedPool = {
  async query(sql, params = []) {
    if (activeMode === 'mysql') {
      return await mysqlPool.query(sql, params);
    } else {
      return await runSqliteQuery(sql, params);
    }
  },

  async getConnection() {
    if (activeMode === 'mysql') {
      return await mysqlPool.getConnection();
    } else {
      // Mock connection for SQLite transactions
      return {
        query: (sql, params) => runSqliteQuery(sql, params),
        beginTransaction: () => runSqliteQuery('BEGIN TRANSACTION'),
        commit: () => runSqliteQuery('COMMIT'),
        rollback: () => runSqliteQuery('ROLLBACK'),
        release: () => {}
      };
    }
  }
};

async function initDB() {
  const dbName = process.env.DB_NAME || 'teashop_db';

  // 1. Attempt MySQL connection first
  try {
    const rootConnection = await mysql.createConnection({
      ...dbConfig,
      connectTimeout: 3000
    });
    await rootConnection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await rootConnection.end();

    mysqlPool = mysql.createPool({
      ...dbConfig,
      database: dbName,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // Verify MySQL pool query
    await mysqlPool.query('SELECT 1');
    activeMode = 'mysql';
    console.log(`✅ Connected to MySQL Database: ${dbName}`);

  } catch (mysqlErr) {
    console.log(`⚠️ MySQL Server connection failed (${mysqlErr.message}).`);
    console.log(`🔄 Switching to SQLite fallback database...`);
    activeMode = 'sqlite';

    const dbDir = path.join(__dirname, '../database');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    const sqlitePath = path.join(dbDir, 'teashop.sqlite');

    sqliteDb = await new Promise((resolve, reject) => {
      const db = new sqlite3.Database(sqlitePath, (err) => {
        if (err) reject(err);
        else resolve(db);
      });
    });

    console.log(`✅ Connected to SQLite Database at ${sqlitePath}`);
  }

  // 2. Initialize Tables & Schema for active engine
  await createTablesAndSeed();
}

async function createTablesAndSeed() {
  const isMySQL = activeMode === 'mysql';

  const userTableSql = isMySQL ? `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(100) NOT NULL,
      role ENUM('admin', 'cashier') NOT NULL DEFAULT 'cashier',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'cashier',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const catTableSql = isMySQL ? `
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(50) UNIQUE NOT NULL,
      icon VARCHAR(50) DEFAULT 'Coffee'
    );
  ` : `
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      icon TEXT DEFAULT 'Coffee'
    );
  `;

  const prodTableSql = isMySQL ? `
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      category_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      description TEXT,
      image_url VARCHAR(500),
      is_available BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  ` : `
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      description TEXT,
      image_url TEXT,
      is_available INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
    );
  `;

  const orderTableSql = isMySQL ? `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      bill_number VARCHAR(50) UNIQUE NOT NULL,
      customer_name VARCHAR(100) DEFAULT 'Walk-in Customer',
      customer_phone VARCHAR(20) DEFAULT '',
      subtotal DECIMAL(10,2) NOT NULL,
      tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      grand_total DECIMAL(10,2) NOT NULL,
      payment_method VARCHAR(20) DEFAULT 'cash',
      cashier_id INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  ` : `
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bill_number TEXT UNIQUE NOT NULL,
      customer_name TEXT DEFAULT 'Walk-in Customer',
      customer_phone TEXT DEFAULT '',
      subtotal DECIMAL(10,2) NOT NULL,
      tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      grand_total DECIMAL(10,2) NOT NULL,
      payment_method TEXT DEFAULT 'cash',
      cashier_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const itemTableSql = isMySQL ? `
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      product_id INT,
      product_name VARCHAR(100) NOT NULL,
      quantity INT NOT NULL DEFAULT 1,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      customization VARCHAR(255) DEFAULT '',
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  ` : `
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      product_id INTEGER,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 1,
      unit_price DECIMAL(10,2) NOT NULL,
      total_price DECIMAL(10,2) NOT NULL,
      customization TEXT DEFAULT '',
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );
  `;

  await unifiedPool.query(userTableSql);
  await unifiedPool.query(catTableSql);
  await unifiedPool.query(prodTableSql);
  await unifiedPool.query(orderTableSql);
  await unifiedPool.query(itemTableSql);

  // Seed default users if empty
  const [users] = await unifiedPool.query('SELECT COUNT(*) as count FROM users');
  const userCount = users[0]?.count || users[0]?.['COUNT(*)'] || 0;

  if (userCount === 0) {
    const adminPassHash = await bcrypt.hash('admin123', 10);
    const cashierPassHash = await bcrypt.hash('cashier123', 10);
    const teashopPassHash = await bcrypt.hash('teashop', 10);
    const teashop123Hash = await bcrypt.hash('teashop123', 10);

    const userSeed = [
      ['admin', adminPassHash, 'Store Manager', 'admin'],
      ['cashier', cashierPassHash, 'Front Cashier', 'cashier'],
      ['teashop', teashopPassHash, 'Tea Shop Owner', 'admin'],
      ['teashop123', teashop123Hash, 'Tea Shop Admin', 'admin']
    ];

    for (const u of userSeed) {
      await unifiedPool.query(
        `INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)`,
        u
      );
    }
    console.log('✅ Seeded default accounts: admin (admin123), cashier (cashier123), teashop (teashop)');
  } else {
    // Ensure teashop account exists if user attempts login with teashop
    const [existingTeashop] = await unifiedPool.query('SELECT * FROM users WHERE username = ?', ['teashop']);
    if (existingTeashop.length === 0) {
      const teashopPassHash = await bcrypt.hash('teashop', 10);
      await unifiedPool.query(
        `INSERT INTO users (username, password_hash, name, role) VALUES (?, ?, ?, ?)`,
        ['teashop', teashopPassHash, 'Tea Shop Owner', 'admin']
      );
    }
  }

  // Seed categories if empty
  const [cats] = await unifiedPool.query('SELECT COUNT(*) as count FROM categories');
  const catCount = cats[0]?.count || cats[0]?.['COUNT(*)'] || 0;

  if (catCount === 0) {
    const categorySeeds = [
      [1, 'Hot Chai', 'Coffee'],
      [2, 'Iced Tea & Cold Drinks', 'CupSoda'],
      [3, 'Coffee Specialties', 'Coffee'],
      [4, 'Snacks & Bites', 'Utensils'],
      [5, 'Bakery & Desserts', 'Cake']
    ];

    for (const c of categorySeeds) {
      await unifiedPool.query(`INSERT INTO categories (id, name, icon) VALUES (?, ?, ?)`, c);
    }
    console.log('✅ Seeded product categories');
  }

  // Seed products if empty
  const [prods] = await unifiedPool.query('SELECT COUNT(*) as count FROM products');
  const prodCount = prods[0]?.count || prods[0]?.['COUNT(*)'] || 0;

  if (prodCount === 0) {
    const productSeeds = [
      [1, 'Kulhad Masala Chai', 25.00, 'Traditional spiced milk tea served in clay kulhad cup', 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=500', 1],
      [1, 'Adrak Elaichi Chai', 20.00, 'Fresh crushed ginger & green cardamom aromatic chai', 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500', 1],
      [1, 'Cutting Chai', 15.00, 'Strong Mumbai style half-cup energy tea', 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=500', 1],
      [1, 'Organic Green Tea', 35.00, 'Himalayan green tea infused with honey and lemon', 'https://images.unsplash.com/photo-1627435601361-ec25f5b1d0e5?w=500', 1],
      [2, 'Lemon Mint Iced Tea', 45.00, 'Chilled refreshing tea brewed with fresh mint & lemon', 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500', 1],
      [2, 'Peach Hibiscus Cooler', 60.00, 'Fruity iced tea blend with natural peach syrup', 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=500', 1],
      [3, 'Filter Coffee (South Indian)', 30.00, 'Authentic chicory blend frothed filter coffee', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500', 1],
      [3, 'Espresso Cappuccino', 75.00, 'Rich espresso topped with steamed milk froth', 'https://images.unsplash.com/photo-1572442388796-11668ba67e53?w=500', 1],
      [4, 'Amul Maska Bun', 30.00, 'Soft fresh bun loaded with salted Amul butter', 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500', 1],
      [4, 'Crispy Hot Samosa (2 pcs)', 35.00, 'Golden potato samosas served with spicy mint chutney', 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500', 1],
      [4, 'Cheese Garlic Toast', 65.00, 'Grilled bread slices with garlic herb butter & melted cheese', 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=500', 1],
      [5, 'Paneer Tikka Sandwich', 85.00, 'Grilled multi-grain sandwich filled with spiced paneer', 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=500', 1],
      [5, 'Choco Lava Muffin', 55.00, 'Warm chocolate muffin with molten fudge center', 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500', 1]
    ];

    for (const p of productSeeds) {
      await unifiedPool.query(
        `INSERT INTO products (category_id, name, price, description, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?)`,
        p
      );
    }
    console.log('✅ Seeded sample tea shop menu products');
  }
}

function getPool() {
  return unifiedPool;
}

module.exports = {
  initDB,
  getPool
};
