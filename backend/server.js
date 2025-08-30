const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const dockRoutes = require('./routes/dockRoutes');
const truckQueueRoutes = require('./routes/truckQueueRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const recentAssignmentRoutes = require('./routes/recentAssignmentRoutes');
const errorHandler = require('./middlewares/errorHandler');

dotenv.config(); // Load environment variables

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/docks', dockRoutes);
app.use('/api/truck-queue', truckQueueRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/recent-assignments', recentAssignmentRoutes);

// Error handling middleware
app.use(errorHandler);

// Start the server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
