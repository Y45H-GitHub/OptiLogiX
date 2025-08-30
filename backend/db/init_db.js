const client = require('../models/db');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');

    // Drop tables in correct order to avoid foreign key constraints issues
    await client.query('DROP TABLE IF EXISTS truck_queue CASCADE;');
    await client.query('DROP TABLE IF EXISTS appointments CASCADE;');
    await client.query('DROP TABLE IF EXISTS docks CASCADE;');
    await client.query(schemaSql);
    console.log('Database schema initialized successfully.');

    // Insert initial data for docks if the table is empty
    const { rowCount } = await client.query('SELECT COUNT(*) FROM docks;');
    if (rowCount === 0) {
      await client.query(`
        INSERT INTO docks (id, status, type) VALUES
        (1, 'available', 'loading'),
        (2, 'available', 'unloading'),
        (3, 'available', 'priority');
      `);
      console.log('Initial dock data inserted.');
    } else {
      console.log('Docks table already contains data, skipping initial insert.');
    }

  } catch (err) {
    console.error('Error initializing database:', err);
  } finally {
    await client.end();
  }
}

initializeDatabase();