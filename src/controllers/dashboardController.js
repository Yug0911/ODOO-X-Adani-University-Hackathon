const pool = require('../config/database');

const getDashboardStats = async (req, res, next) => {
  try {
    // Query the views for dashboard data
    const criticalRes = await pool.query('SELECT critical_count FROM dashboard_critical_assets WHERE company_id = 1');
    const loadRes = await pool.query('SELECT name, active_tasks as task_count FROM dashboard_technician_load WHERE company_id = 1');
    const openRes = await pool.query('SELECT SUM(count) as total FROM dashboard_open_requests WHERE company_id = 1');

    res.json({
      critical_equipment: criticalRes.rows[0]?.critical_count || 0,
      technician_load: loadRes.rows,
      open_requests: openRes.rows[0]?.total || 0
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getDashboardStats
};