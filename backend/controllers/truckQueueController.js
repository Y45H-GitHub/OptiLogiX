const client = require('../models/db');

const getTruckQueue = async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM truck_queue ORDER BY arrival_time ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching truck queue:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getTruckQueue,
};