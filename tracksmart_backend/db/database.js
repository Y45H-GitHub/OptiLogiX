const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Deb@070104',
  // database: process.env.DB_NAME || 'tracksmart_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

async function initializeDatabase() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`
      CREATE DATABASE IF NOT EXISTS tracksmart_db;
    `);
    await connection.query(`USE tracksmart_db;`);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await connection.query(`
      INSERT IGNORE INTO items (id, name, description, price) VALUES
      (1, 'Laptop', 'Powerful laptop for all your needs', 1200.00),
      (2, 'Mouse', 'Ergonomic wireless mouse', 25.00),
      (3, 'Keyboard', 'Mechanical keyboard with RGB lighting', 75.00)
      ON DUPLICATE KEY UPDATE name=name;
    `);
    connection.release();
    console.log('✅ Database initialized and sample data inserted.');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
}

async function query(sql, params) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}

async function dropItemsTable() {
  try {
    const connection = await pool.getConnection();
    await connection.query(`DROP TABLE IF EXISTS tracksmart_db.items;`);
    connection.release();
    console.log('✅ Items table dropped successfully.');
  } catch (error) {
    console.error('❌ Error dropping items table:', error);
  }
}

module.exports = { pool, initializeDatabase, query, dropItemsTable };