const express = require('express');
const { Pool } = require('pg');

const app = express();
app.use(express.json());

// Database connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'maintenance',
  password: 'DBMS@4250',
  port: 5432,
});

// ============================================
// 1. DASHBOARD API (For the Screenshot 1 Cards)
// ============================================
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Red Card: Critical Equipment
    const criticalRes = await pool.query('SELECT COUNT(*) FROM equipment WHERE health_percentage < 30 AND is_active = TRUE');
    
    // Blue Card: Technician Load
    const loadRes = await pool.query(`
      SELECT u.name, COUNT(r.id) as task_count 
      FROM users u 
      LEFT JOIN maintenance_requests r ON u.id = r.assigned_technician_id 
      WHERE r.status IN ('New Request', 'In Progress') 
      GROUP BY u.name
    `);

    // Green Card: Open Requests
    const openRes = await pool.query("SELECT COUNT(*) FROM maintenance_requests WHERE status IN ('New Request', 'In Progress')");

    res.json({
      critical_equipment: criticalRes.rows[0].count,
      technician_load: loadRes.rows,
      open_requests: openRes.rows[0].count
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ============================================
// 2. DROPDOWN DATA (For Screenshot 3 Forms)
// ============================================
app.get('/api/equipment', async (req, res) => {
  const result = await pool.query('SELECT id, name, health_percentage FROM equipment WHERE is_active = TRUE');
  res.json(result.rows);
});

app.get('/api/work-centers', async (req, res) => {
  const result = await pool.query('SELECT id, name, code FROM work_centers');
  res.json(result.rows);
});

// ============================================
// 3. CREATE REQUEST (Handles the Logic Toggle)
// ============================================
app.post('/api/requests', async (req, res) => {
  // Extract inputs from the form
  const {
    subject,
    maintenance_for, // 'Equipment' or 'Work Center'
    selected_id,     // The ID of the item selected
    request_type,
    assigned_technician_id,
    scheduled_date
  } = req.body;

  if (!maintenance_for || (maintenance_for !== 'Equipment' && maintenance_for !== 'Work Center')) {
    return res.status(400).json({ error: 'Invalid maintenance_for. Must be "Equipment" or "Work Center"' });
  }

  if (!selected_id) {
    return res.status(400).json({ error: maintenance_for === 'Equipment' ? 'Equipment ID required' : 'Work Center ID required' });
  }

  try {
    // Validate selected_id exists
    if (maintenance_for === 'Equipment') {
      const equipCheck = await pool.query('SELECT id FROM equipment WHERE id = $1 AND is_active = TRUE', [selected_id]);
      if (equipCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Equipment not found' });
      }
    } else {
      const wcCheck = await pool.query('SELECT id FROM work_centers WHERE id = $1', [selected_id]);
      if (wcCheck.rows.length === 0) {
        return res.status(404).json({ error: 'Work Center not found' });
      }
    }

    // Logic: Determine which column to fill based on 'maintenance_for'
    const equipment_id = maintenance_for === 'Equipment' ? selected_id : null;
    const work_center_id = maintenance_for === 'Work Center' ? selected_id : null;

    const query = `
      INSERT INTO maintenance_requests
      (subject, maintenance_for, equipment_id, work_center_id, request_type, assigned_technician_id, scheduled_date, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, 'New Request')
      RETURNING *
    `;

    const newReq = await pool.query(query, [
      subject, maintenance_for, equipment_id, work_center_id, request_type, assigned_technician_id, scheduled_date
    ]);

    res.status(201).json(newReq.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================
// 4. KANBAN BOARD (For "Project Sync" View)
// ============================================
app.get('/api/kanban', async (req, res) => {
  const query = `
    SELECT r.*,
           COALESCE(e.name, wc.name) as target_name, -- Shows Equipment Name OR Work Center Name
           e.avatar_url,
           e.health_percentage,
           u.name as tech_name,
           u.role as tech_role
    FROM maintenance_requests r
    LEFT JOIN equipment e ON r.equipment_id = e.id
    LEFT JOIN work_centers wc ON r.work_center_id = wc.id
    LEFT JOIN users u ON r.assigned_technician_id = u.id
  `;
  const result = await pool.query(query);
  res.json(result.rows);
});

// ============================================
// 5. EQUIPMENT STATS (Smart Button)
// ============================================
app.get('/api/equipment/:id/stats', async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Equipment ID required' });
  }
  try {
    const query = "SELECT COUNT(*) as count FROM maintenance_requests WHERE equipment_id = $1 AND status IN ('New Request', 'In Progress')";
    const result = await pool.query(query, [id]);
    const activeRequests = parseInt(result.rows[0].count);
    res.json({ activeRequests });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('🚀 GearGuard API running on port 3000');
});