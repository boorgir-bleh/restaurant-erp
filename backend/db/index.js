const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

let pool;

async function getPool() {
  if (pool) return pool;
  pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'restaurant',
    waitForConnections: true,
    connectionLimit: 10,
  });
  return pool;
}

async function initDB() {
  // Create database if it doesn't exist
  const tempPool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  });
  await tempPool.query(`CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME || 'restaurant'}\``);
  await tempPool.end();

  const db = await getPool();

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('manager','staff') DEFAULT 'staff',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS tables_list (
      id INT AUTO_INCREMENT PRIMARY KEY,
      number INT UNIQUE NOT NULL,
      capacity INT NOT NULL DEFAULT 4,
      status ENUM('available','occupied','reserved') DEFAULT 'available',
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      table_id INT NOT NULL,
      waiter VARCHAR(100),
      status ENUM('pending','cooking','served','paid','cancelled') DEFAULT 'pending',
      notes TEXT,
      subtotal DECIMAL(10,2) DEFAULT 0,
      gst DECIMAL(10,2) DEFAULT 0,
      total DECIMAL(10,2) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (table_id) REFERENCES tables_list(id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT NOT NULL,
      menu_item_id INT NOT NULL,
      name VARCHAR(100) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      qty INT NOT NULL DEFAULT 1,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS reservations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      guest_name VARCHAR(100) NOT NULL,
      phone VARCHAR(20),
      reservation_date DATE NOT NULL,
      reservation_time TIME NOT NULL,
      guests INT DEFAULT 2,
      table_id INT,
      status ENUM('pending','confirmed','cancelled') DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (table_id) REFERENCES tables_list(id) ON DELETE SET NULL
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS menu_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      category VARCHAR(50) NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      available TINYINT(1) DEFAULT 1
    )
  `);

  // Seed tables if empty
  const [tables] = await db.query('SELECT COUNT(*) as cnt FROM tables_list');
  if (tables[0].cnt === 0) {
    const tableRows = Array.from({ length: 20 }, (_, i) => {
      const n = i + 1;
      const cap = n <= 4 ? 2 : n <= 12 ? 4 : n <= 17 ? 6 : 8;
      return [n, cap];
    });
    await db.query('INSERT INTO tables_list (number, capacity) VALUES ?', [tableRows]);
  }

  // Seed menu if empty
  const [menu] = await db.query('SELECT COUNT(*) as cnt FROM menu_items');
  if (menu[0].cnt === 0) {
    const items = [
      ['Paneer Tikka','starters',320],['Chicken 65','starters',380],
      ['Hara Bhara Kabab','starters',280],['Veg Manchurian','starters',260],
      ['Dal Makhani','mains',340],['Butter Chicken','mains',420],
      ['Palak Paneer','mains',360],['Mutton Rogan Josh','mains',520],
      ['Veg Biryani','rice',320],['Chicken Biryani','rice',420],
      ['Hyderabadi Biryani','rice',480],['Garlic Naan','breads',60],
      ['Laccha Paratha','breads',70],['Tandoori Roti','breads',45],
      ['Gulab Jamun','desserts',150],['Rasmalai','desserts',180],
      ['Fresh Lime Soda','beverages',100],['Masala Chai','beverages',80],
    ];
    await db.query('INSERT INTO menu_items (name, category, price) VALUES ?', [items]);
  }

  // Seed demo users if empty
  const [users] = await db.query('SELECT COUNT(*) as cnt FROM users');
  if (users[0].cnt === 0) {
    const hash = await bcrypt.hash('rooftop@123', 10);
    await db.query('INSERT INTO users (name, email, password, role) VALUES ?', [[
      ['Arjun Sharma', 'manager@rooftop.local', hash, 'manager'],
      ['Kiran Kumar', 'staff@rooftop.local', hash, 'staff'],
    ]]);
    console.log('✅ Demo users seeded');
  }

  console.log('✅ Database ready');
}

module.exports = { getPool, initDB };
