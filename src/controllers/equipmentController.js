const pool = require('../config/database');

const getAllEquipment = async (req, res, next) => {
  try {
    const { category_id, maintenance_team_id, department } = req.query;

    let query = `
      SELECT
        e.*,
        ec.name as category_name,
        mt.name as team_name,
        u.name as technician_name
      FROM equipment e
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
      LEFT JOIN users u ON e.assigned_technician_id = u.id
      WHERE e.company_id = 1
    `;

    const conditions = [];
    const values = [];

    if (category_id) {
      conditions.push(`e.category_id = $${conditions.length + 1}`);
      values.push(category_id);
    }

    if (maintenance_team_id) {
      conditions.push(`e.maintenance_team_id = $${conditions.length + 1}`);
      values.push(maintenance_team_id);
    }

    if (department) {
      conditions.push(`e.department = $${conditions.length + 1}`);
      values.push(department);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY e.name';

    const result = await pool.query(query, values);
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    next(err);
  }
};

const getEquipmentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT
        e.*,
        ec.name as category_name,
        mt.name as team_name,
        u.name as technician_name
      FROM equipment e
      LEFT JOIN equipment_categories ec ON e.category_id = ec.id
      LEFT JOIN maintenance_teams mt ON e.maintenance_team_id = mt.id
      LEFT JOIN users u ON e.assigned_technician_id = u.id
      WHERE e.id = $1 AND e.company_id = 1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

const getEquipmentRequests = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT
         mr.*,
         u.name as technician_name,
         mt.name as team_name,
         CASE
           WHEN mr.scheduled_date < NOW() AND mr.status NOT IN ('Repaired', 'Scrap')
           THEN true
           ELSE false
         END as is_overdue
       FROM maintenance_requests mr
       LEFT JOIN users u ON mr.assigned_technician_id = u.id
       LEFT JOIN maintenance_teams mt ON mr.assigned_team_id = mt.id
       WHERE mr.equipment_id = $1
       ORDER BY mr.created_at DESC`,
      [id]
    );

    const openCount = result.rows.filter(r =>
      r.status !== 'Repaired' && r.status !== 'Scrap'
    ).length;

    res.json({
      success: true,
      data: result.rows,
      openCount: openCount
    });
  } catch (err) {
    next(err);
  }
};

const createEquipment = async (req, res, next) => {
  try {
    const {
      name,
      serial_number,
      category_id,
      maintenance_team_id,
      assigned_technician_id,
      employee_id,
      department,
      location,
      purchase_date,
      warranty_date,
      health_percentage,
      description
    } = req.body;

    const result = await pool.query(
      `INSERT INTO equipment
       (name, serial_number, category_id, maintenance_team_id, assigned_technician_id,
        employee_id, department, location, purchase_date, warranty_date, health_percentage,
        description, company_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 1)
       RETURNING *`,
      [name, serial_number, category_id, maintenance_team_id, assigned_technician_id,
       employee_id, department, location, purchase_date, warranty_date, health_percentage,
       description]
    );

    res.status(201).json({
      success: true,
      message: 'Equipment created successfully',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

const updateEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      serial_number,
      category_id,
      maintenance_team_id,
      assigned_technician_id,
      employee_id,
      department,
      location,
      purchase_date,
      warranty_date,
      health_percentage,
      description,
      is_active
    } = req.body;

    const result = await pool.query(
      `UPDATE equipment SET
       name = $1, serial_number = $2, category_id = $3, maintenance_team_id = $4,
       assigned_technician_id = $5, employee_id = $6, department = $7, location = $8,
       purchase_date = $9, warranty_date = $10, health_percentage = $11,
       description = $12, is_active = $13, updated_at = CURRENT_TIMESTAMP
       WHERE id = $14 AND company_id = 1
       RETURNING *`,
      [name, serial_number, category_id, maintenance_team_id, assigned_technician_id,
       employee_id, department, location, purchase_date, warranty_date, health_percentage,
       description, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      message: 'Equipment updated successfully',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

const deleteEquipment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM equipment WHERE id = $1 AND company_id = 1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Equipment not found'
      });
    }

    res.json({
      success: true,
      message: 'Equipment deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAllEquipment,
  getEquipmentById,
  getEquipmentRequests,
  createEquipment,
  updateEquipment,
  deleteEquipment
};