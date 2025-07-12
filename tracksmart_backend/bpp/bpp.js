const express = require('express');
const { initializeDatabase, query, dropItemsTable } = require('../db/database');

const app = express();
app.use(express.json());

// Initialize database and start server
dropItemsTable().then(() => initializeDatabase()).then(() => {
  app.listen(3002, () => { // BPP will run on port 3002
    console.log(`✅ BPP running on http://localhost:3002`);
  });
});

// New routes for MySQL operations
app.get('/items', async (req, res) => {
  try {
    const items = await query('SELECT * FROM items');
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).send('Error fetching items');
  }
});

app.get('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await query('SELECT * FROM items WHERE id = ?', [id]);
    if (item.length > 0) {
      res.json(item[0]);
    } else {
      res.status(404).send('Item not found');
    }
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).send('Error fetching item');
  }
});

app.get('/items/by-name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const item = await query('SELECT * FROM items WHERE name = ?', [name]);
    if (item.length > 0) {
      res.json(item[0]);
    } else {
      res.status(404).send('Item not found');
    }
  } catch (error) {
    console.error('Error fetching item by name:', error);
    res.status(500).send('Error fetching item by name');
  }
});

app.post('/items', async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name || !price) {
      return res.status(400).send('Name and price are required');
    }
    const result = await query('INSERT INTO items (name, description, price) VALUES (?, ?, ?)', [name, description, price]);
    res.status(201).json({ id: result.insertId, name, description, price });
  } catch (error) {
    console.error('Error adding item:', error);
    res.status(500).send('Error adding item');
  }
});

app.put('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price } = req.body;
    if (!name || !price) {
      return res.status(400).send('Name and price are required');
    }
    const result = await query('UPDATE items SET name = ?, description = ?, price = ? WHERE id = ?', [name, description, price, id]);
    if (result.affectedRows > 0) {
      res.json({ message: 'Item updated successfully' });
    } else {
      res.status(404).send('Item not found');
    }
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).send('Error updating item');
  }
});

app.delete('/items/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await query('DELETE FROM items WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      res.json({ message: 'Item deleted successfully' });
    } else {
      res.status(404).send('Item not found');
    }
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).send('Error deleting item');
  }
});