-- Docks Table
CREATE TABLE IF NOT EXISTS docks (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'available', 'occupied'
    current_truck VARCHAR(100),
    assigned_time TIMESTAMP WITH TIME ZONE,
    type VARCHAR(50) NOT NULL -- 'loading', 'unloading', 'priority'
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    truck_id VARCHAR(100) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    dock_id INTEGER REFERENCES docks(id),
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL, -- 'booked', 'arrived', 'loading/unloading', 'completed', 'departed'
    actual_arrival_time TIMESTAMP WITH TIME ZONE,
    loading_start_time TIMESTAMP WITH TIME ZONE,
    loading_end_time TIMESTAMP WITH TIME ZONE,
    departure_time TIMESTAMP WITH TIME ZONE,
    assigned_dock_id INTEGER REFERENCES docks(id),
    type VARCHAR(50) NOT NULL, -- 'loading', 'unloading'
    assigned_time TIMESTAMP WITH TIME ZONE
);

-- Truck Queue Table (This might be a view or derived from appointments, but for simplicity, let's assume a table for now)
CREATE TABLE IF NOT EXISTS truck_queue (
    truck_id VARCHAR(100) PRIMARY KEY,
    arrival_time TIMESTAMP WITH TIME ZONE NOT NULL,
    appointment_id INTEGER REFERENCES appointments(id)
);

-- Insert initial data into Docks Table
INSERT INTO docks (name, status, current_truck, type) VALUES
('Dock 1', 'available', NULL, 'loading'),
('Dock 2', 'available', NULL, 'unloading'),
('Dock 3', 'available', NULL, 'loading'),
('Dock 4', 'available', NULL, 'unloading'),
('Dock 5', 'available', NULL, 'loading');

-- Insert initial data into Appointments Table
INSERT INTO appointments (truck_id, company_name, scheduled_time, status, assigned_dock_id, actual_arrival_time, loading_start_time, loading_end_time, departure_time, type, assigned_time)
VALUES
('TRUCK001', 'Company A', '2024-07-20 08:00:00', 'scheduled', NULL, NULL, NULL, NULL, NULL, 'loading', NULL),
('TRUCK002', 'Company B', '2024-07-20 08:30:00', 'scheduled', NULL, NULL, NULL, NULL, NULL, 'unloading', NULL),
('TRUCK003', 'Company C', '2024-07-20 09:00:00', 'scheduled', NULL, NULL, NULL, NULL, NULL, 'loading', NULL),
('TRUCK004', 'Company D', '2024-07-20 09:30:00', 'scheduled', NULL, NULL, NULL, NULL, NULL, 'unloading', NULL),
('TRUCK005', 'Company E', '2024-07-20 10:00:00', 'scheduled', NULL, NULL, NULL, NULL, NULL, 'loading', NULL);

-- Truck Queue Table
-- This table will be populated dynamically as trucks arrive and are not yet assigned to a dock.