const client = require('../models/db');

const getAppointments = async (req, res) => {
    try {
        const result = await client.query('SELECT * FROM appointments ORDER BY scheduled_time ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching appointments:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const createAppointment = async (req, res) => {
    const { truck_id, supplier, dock_id, scheduled_time, status, type } = req.body;
    try {
        const result = await client.query(
            'INSERT INTO appointments (truck_id, supplier, dock_id, scheduled_time, status, type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [truck_id, supplier, dock_id, scheduled_time, status, type]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error creating appointment:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const recordTruckArrival = async (req, res) => {
    const { truck_id, appointment_id } = req.body;
    try {
        // Update appointment status to 'arrived' and record actual arrival time
        const result = await client.query(
            'UPDATE appointments SET status = $1, actual_arrival_time = NOW() WHERE id = $2 RETURNING *',
            ['arrived', appointment_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Add truck to queue if not already there
        await client.query(
            'INSERT INTO truck_queue (truck_id, arrival_time, appointment_id) VALUES ($1, NOW(), $2) ON CONFLICT (truck_id) DO NOTHING',
            [truck_id, appointment_id]
        );

        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error recording truck arrival:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const assignTruckToDock = async (req, res) => {
    const { appointment_id, dock_id } = req.body;
    try {
        // Update appointment with assigned dock and status
        const appointmentResult = await client.query(
            'UPDATE appointments SET dock_id = $1, status = $2, assigned_time = NOW() WHERE id = $3 RETURNING *',
            [dock_id, 'assigned', appointment_id]
        );

        if (appointmentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Update dock status to 'occupied'
        const dockResult = await client.query(
            'UPDATE docks SET status = $1, current_truck = $2, assigned_time = NOW() WHERE id = $3 RETURNING *',
            ['occupied', appointmentResult.rows[0].truck_id, dock_id]
        );

        // Remove truck from queue
        await client.query('DELETE FROM truck_queue WHERE truck_id = $1', [appointmentResult.rows[0].truck_id]);

        res.json({ appointment: appointmentResult.rows[0], dock: dockResult.rows[0] });
    } catch (err) {
        console.error('Error assigning truck to dock:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const updateAppointmentStatus = async (req, res) => {
    const { appointment_id, status, loading_start_time, loading_end_time } = req.body;
    try {
        let query = 'UPDATE appointments SET status = $1';
        const params = [status];
        let paramIndex = 2;

        if (loading_start_time) {
            query += `, loading_start_time = $${paramIndex++}`;
            params.push(loading_start_time);
        }
        if (loading_end_time) {
            query += `, loading_end_time = $${paramIndex++}`;
            params.push(loading_end_time);
        }

        query += ` WHERE id = $${paramIndex++} RETURNING *`;
        params.push(appointment_id);

        const result = await client.query(query, params);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error updating appointment status:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const recordTruckDeparture = async (req, res) => {
    const { appointment_id, dock_id } = req.body;
    try {
        // Update appointment status to 'departed' and record departure time
        const appointmentResult = await client.query(
            'UPDATE appointments SET status = $1, departure_time = NOW() WHERE id = $2 RETURNING *',
            ['departed', appointment_id]
        );

        if (appointmentResult.rows.length === 0) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Update dock status to 'available' and clear current truck
        if (dock_id) {
            await client.query(
                'UPDATE docks SET status = $1, current_truck = NULL, assigned_time = NULL WHERE id = $2',
                ['available', dock_id]
            );
        }

        res.json(appointmentResult.rows[0]);
    } catch (err) {
        console.error('Error recording truck departure:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports = {
    getAppointments,
    createAppointment,
    recordTruckArrival,
    assignTruckToDock,
    updateAppointmentStatus,
    recordTruckDeparture,
};