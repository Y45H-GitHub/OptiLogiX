const express = require('express');
const router = express.Router();
const { getUsers, createUser } = require('../controllers/userController');

// Define the routes
router.get('/users', getUsers);  // Route to get all users
router.post('/users', createUser);  // Route to create a new user

module.exports = router;
