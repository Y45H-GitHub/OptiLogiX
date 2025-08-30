const client = require('../models/db');  // Ensure you're importing the client

// GET /api/docks
const getDocks = async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM docks');
    console.log('Docks query result:', result.rows);
    res.json({ docks: result.rows, message: 'Docks data retrieved successfully.' });
  } catch (err) {
    console.error('Error fetching docks:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// GET /api/docks/available?type=...
const getAvailableDocks = async (req, res) => {
  try {
    const { type } = req.query;
    let query = 'SELECT * FROM docks WHERE status = $1';  // Basic query for available docks

    if (type) query += ` AND type = $2`;  // Optional filter based on dock type

    const { rows } = await client.query(query, [type || 'available']);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching available docks:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /api/docks/assign
const assignTruckToDock = async (req, res) => {
  try {
    const { truckId, dockId, appointmentId } = req.body;
    if (!truckId || !dockId || !appointmentId) {
      return res.status(400).json({ error: "truckId, dockId, appointmentId required" });
    }

    const nowISO = new Date().toISOString();

    // 1) Mark dock occupied
    const updateDock = `
      UPDATE docks SET status = 'occupied', current_truck = $1, assigned_time = $2
      WHERE id = $3 RETURNING *;
    `;
    const { rows: dockData, error: dockError } = await client.query(updateDock, [truckId, nowISO, dockId]);
    if (dockError) throw dockError;

    // 2) Insert into recent_assignments
    const insertAssignment = `
      INSERT INTO recent_assignments (truckid, dockid, assignedtime, appointmentid)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const { rows: assignmentData, error: assignmentError } = await client.query(insertAssignment, [truckId, dockId, nowISO, appointmentId]);
    if (assignmentError) throw assignmentError;

    // 3) Remove from truck_queue
    const deleteQueue = `
      DELETE FROM truck_queue WHERE truckid = $1;
    `;
    const { error: deleteError } = await client.query(deleteQueue, [truckId]);
    if (deleteError) throw deleteError;

    res.status(200).json({ dock: dockData[0], assignment: assignmentData[0] });
  } catch (err) {
    console.error('Error assigning truck to dock:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// POST /api/docks/:dockId/release
const releaseDock = async (req, res) => {
  try {
    const { dockId } = req.params;
    const query = `
      UPDATE docks SET status = 'available', current_truck = NULL, assigned_time = NULL
      WHERE id = $1 RETURNING *;
    `;
    const { rows, error } = await client.query(query, [dockId]);
    if (error) throw error;
    res.json(rows[0]);
  } catch (err) {
    console.error('Error releasing dock:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  getDocks,
  getAvailableDocks,
  assignTruckToDock,
  releaseDock
};
