const client = require('./models/db');

async function testDatabase() {
  try {
    // Create a new table
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_table (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        value INTEGER
      );
    `);
    console.log('Table test_table created or already exists.');

    // Insert some values
    await client.query(`
      INSERT INTO test_table (name, value) VALUES
      ('Test Item 1', 10),
      ('Test Item 2', 20)
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('Values inserted into test_table.');

    // Query the values to verify
    const res = await client.query('SELECT * FROM test_table;');
    console.log('Data from test_table:', res.rows);

  } catch (err) {
    console.error('Database test failed:', err);
  } finally {
    await client.end(); // Close the connection after testing
  }
}

testDatabase();