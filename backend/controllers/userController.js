const client = require('../models/db');

// Get all users
const getUsers = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM users'); // Replace with your table name
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error });
  }
};

// Create a new user
const createUser = async (req, res) => {
  const { name, email } = req.body;
  
  try {
    const result = await client.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Error creating user', error });
  }
};

module.exports = {
  getUsers,
  createUser
};
