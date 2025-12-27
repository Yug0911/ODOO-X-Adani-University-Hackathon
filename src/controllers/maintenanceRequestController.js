const pool = require('../config/database');
const { STATUSES } = require('../utils/constants');

const getAllRequests = async (req, res, next) => {
  try {
    const {
      status,
      assigned_technician_id,
      equipment_id,
      work_center_id,
      request_type,
      priority
    } = req.query;

    let query = `
      SELECT
        mr.*,
        e.name as equipment_name,
        e.serial_number as equipment_serial,
        wc.name as work_center_name,
        ec.name as category_name,
        mt.name as team_name,
        u.name as assigned_technician_name,
        u.avatar_url as technician_avatar,
        uc.name as created_by_name,
        CASE
          WHEN mr.scheduled_date < NOW() AND mr.status NOT IN ('Repaired', 'Scrap')
          THEN true
          ELSE false
        END as is_overdue
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      LEFT JOIN work_centers wc ON mr.work_center_id = wc.id
      LEFT JOIN equipment_categories ec ON mr.category_id = ec.id
      LEFT JOIN maintenance_teams mt ON mr.assigned_team_id = mt.id
      LEFT JOIN users u ON mr.assigned_technician_id = u.id
      LEFT JOIN users uc ON mr.created_by_id = uc.id
      WHERE mr.company_id = 1
    `;

    const conditions = [];
    const values = [];

    if (status) {
      conditions.push(`mr.status = $${conditions.length + 1}`);
      values.push(status);
    }

    if (assigned_technician_id) {
      conditions.push(`mr.assigned_technician_id = $${conditions.length + 1}`);
      values.push(assigned_technician_id);
    }

    if (equipment_id) {
      conditions.push(`mr.equipment_id = $${conditions.length + 1}`);
      values.push(equipment_id);
    }

    if (work_center_id) {
      conditions.push(`mr.work_center_id = $${conditions.length + 1}`);
      values.push(work_center_id);
    }

    if (request_type) {
      conditions.push(`mr.request_type = $${conditions.length + 1}`);
      values.push(request_type);
    }

    if (priority) {
      conditions.push(`mr.priority = $${conditions.length + 1}`);
      values.push(priority);
    }

    if (conditions.length > 0) {
      query += ' AND ' + conditions.join(' AND ');
    }

    query += ' ORDER BY mr.created_at DESC';

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

const getKanbanRequests = async (req, res, next) => {
  try {
    const query = `
      SELECT r.*,
             COALESCE(e.name, wc.name) as target_name,
             e.health_percentage,
             u.avatar_url,
             CASE
               WHEN r.scheduled_date < NOW() AND r.status NOT IN ('Repaired', 'Scrap')
               THEN true
               ELSE false
             END as is_overdue
      FROM maintenance_requests r
      LEFT JOIN equipment e ON r.equipment_id = e.id
      LEFT JOIN work_centers wc ON r.work_center_id = wc.id
      LEFT JOIN users u ON r.assigned_technician_id = u.id
      WHERE r.company_id = 1
    `;
    const result = await pool.query(query);
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    next(err);
  }
};

const getCalendarRequests = async (req, res, next) => {
  try {
    const query = `
      SELECT
        mr.scheduled_date,
        mr.subject,
        e.name as equipment_name,
        mr.status
      FROM maintenance_requests mr
      LEFT JOIN equipment e ON mr.equipment_id = e.id
      WHERE mr.request_type = 'Preventive' AND mr.company_id = 1
      ORDER BY mr.scheduled_date
    `;
    const result = await pool.query(query);
    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    next(err);
  }
};

const createRequest = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      subject,
      maintenance_for,
      equipment_id,
      work_center_id,
      request_type,
      priority,
      scheduled_date,
      created_by_id
    } = req.body;

    let category_id, assigned_team_id, assigned_technician_id;

    // AUTO-FILL LOGIC
    if (maintenance_for === 'Equipment' && equipment_id) {
      const equipmentResult = await client.query(
        'SELECT category_id, maintenance_team_id, assigned_technician_id FROM equipment WHERE id = $1',
        [equipment_id]
      );
      if (equipmentResult.rows.length === 0) {
        throw new Error('Equipment not found');
      }
      const equipment = equipmentResult.rows[0];
      category_id = equipment.category_id;
      assigned_team_id = equipment.maintenance_team_id;
      assigned_technician_id = equipment.assigned_technician_id;
    }

    if (maintenance_for === 'Work Center' && work_center_id) {
      const wcResult = await client.query(
        'SELECT maintenance_team_id FROM work_centers WHERE id = $1',
        [work_center_id]
      );
      if (wcResult.rows.length === 0) {
        throw new Error('Work Center not found');
      }
      assigned_team_id = wcResult.rows[0].maintenance_team_id;
    }

    const insertResult = await client.query(
      `INSERT INTO maintenance_requests
       (subject, maintenance_for, equipment_id, work_center_id, category_id,
        assigned_team_id, assigned_technician_id, request_type, priority,
        scheduled_date, status, created_by_id, company_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'New Request', $11, 1)
       RETURNING *`,
      [subject, maintenance_for, equipment_id, work_center_id, category_id,
       assigned_team_id, assigned_technician_id, request_type, priority,
       scheduled_date, created_by_id]
    );

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: insertResult.rows[0],
      autoFilled: { category_id, assigned_team_id, assigned_technician_id }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const updateRequestStatus = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { id } = req.params;
    const { status, duration_hours } = req.body;

    if (!STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Get current status
    const currentResult = await client.query(
      'SELECT status, equipment_id FROM maintenance_requests WHERE id = $1',
      [id]
    );

    if (currentResult.rows.length === 0) {
      throw new Error('Request not found');
    }

    const currentStatus = currentResult.rows[0].status;
    const equipmentId = currentResult.rows[0].equipment_id;

    // Validate transition
    const validTransitions = {
      'New Request': ['In Progress', 'Scrap'],
      'In Progress': ['Repaired', 'Scrap'],
      'Repaired': ['Scrap'],
      'Scrap': []
    };

    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition from ${currentStatus} to ${status}`
      });
    }

    // Update request
    await client.query(
      'UPDATE maintenance_requests SET status = $1, duration_hours = $2 WHERE id = $3',
      [status, duration_hours || 0, id]
    );

    // SCRAP LOGIC
    if (status === 'Scrap' && equipmentId) {
      await client.query(
        'UPDATE equipment SET is_active = FALSE, scrap_date = CURRENT_DATE WHERE id = $1',
        [equipmentId]
      );
    }

    await client.query('COMMIT');

    res.json({
      success: true,
      message: 'Status updated successfully'
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

module.exports = {
  getAllRequests,
  getKanbanRequests,
  getCalendarRequests,
  createRequest,
  updateRequestStatus
};