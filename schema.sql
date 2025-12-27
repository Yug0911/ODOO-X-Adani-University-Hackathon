-- Database schema for GearGuard Maintenance System

-- Companies table (for multi-tenancy)
CREATE TABLE IF NOT EXISTS companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Technician',
    company_id INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    serial_number VARCHAR(255) UNIQUE,
    model VARCHAR(255),
    manufacturer VARCHAR(255),
    location VARCHAR(255),
    health_percentage INTEGER DEFAULT 100,
    status VARCHAR(50) DEFAULT 'Active',
    purchase_date DATE,
    warranty_expiry DATE,
    company_id INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Requests table
CREATE TABLE IF NOT EXISTS maintenance_requests (
    id SERIAL PRIMARY KEY,
    subject VARCHAR(255) NOT NULL,
    description TEXT,
    equipment_id INTEGER REFERENCES equipment(id),
    work_center_id INTEGER,
    category_id INTEGER,
    assigned_team_id INTEGER,
    assigned_technician_id INTEGER REFERENCES users(id),
    request_type VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'New Request',
    scheduled_date DATE,
    due_date DATE,
    duration_hours INTEGER DEFAULT 0,
    created_by_id INTEGER REFERENCES users(id),
    company_id INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Work Centers table
CREATE TABLE IF NOT EXISTS work_centers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    capacity INTEGER DEFAULT 1,
    oee_target DECIMAL(5,2) DEFAULT 85.00,
    cost_per_hour DECIMAL(10,2),
    maintenance_team_id INTEGER,
    company_id INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Equipment Categories
CREATE TABLE IF NOT EXISTS equipment_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_id INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance Teams
CREATE TABLE IF NOT EXISTS maintenance_teams (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    company_id INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default company
INSERT INTO companies (name) VALUES ('Default Company') ON CONFLICT DO NOTHING;

-- Insert sample data
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@gearguard.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin'),
('John Technician', 'john@gearguard.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Technician')
ON CONFLICT (email) DO NOTHING;

INSERT INTO equipment (name, serial_number, health_percentage) VALUES
('Samsung Monitor 24"', 'SN-000001', 98),
('Dell Precision Workstation', 'SN-000002', 95),
('Hydraulic Press X1', 'SN-000003', 88),
('Old Conveyor Belt', 'SN-000004', 25)
ON CONFLICT (serial_number) DO NOTHING;

INSERT INTO work_centers (name, code, capacity, oee_target, cost_per_hour) VALUES
('Assembly Line 1', 'WC-ASM-01', 5, 95.00, 150.00),
('Drill Station Alpha', 'WC-DRL-A', 1, 85.00, 45.00),
('Testing Lab', 'WC-TST-01', 1, 99.00, 500.00)
ON CONFLICT (code) DO NOTHING;

-- Dashboard Views
CREATE OR REPLACE VIEW dashboard_critical_assets AS
SELECT COUNT(*) as critical_count, company_id
FROM equipment
WHERE health_percentage < 30 AND company_id = 1
GROUP BY company_id;

CREATE OR REPLACE VIEW dashboard_technician_load AS
SELECT u.name, COUNT(mr.id) as active_tasks, u.company_id
FROM users u
LEFT JOIN maintenance_requests mr ON u.id = mr.assigned_technician_id AND mr.status IN ('New Request', 'In Progress')
WHERE u.role = 'Technician' AND u.company_id = 1
GROUP BY u.id, u.name, u.company_id;

CREATE OR REPLACE VIEW dashboard_open_requests AS
SELECT status, COUNT(*) as count, company_id
FROM maintenance_requests
WHERE company_id = 1
GROUP BY status, company_id;