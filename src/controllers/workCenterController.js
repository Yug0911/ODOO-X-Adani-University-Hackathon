const pool = require('../config/database');

const getAllWorkCenters = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT id, name, code, capacity, oee_target, cost_per_hour FROM work_centers WHERE company_id = 1');
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllWorkCenters
};