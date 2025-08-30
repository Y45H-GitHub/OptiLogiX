const client = require('../models/db');

const getRecentAssignments = async (req, res) => {
    try {
        // Assuming recent assignments are completed appointments or those with assigned docks
        const result = await client.query(
            "SELECT * FROM appointments WHERE status = 'completed' OR dock_id IS NOT NULL ORDER BY assigned_time DESC LIMIT 10"
        );
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching recent assignments:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getRecentAssignments,
};