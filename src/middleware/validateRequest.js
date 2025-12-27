const { MAINTENANCE_FOR_TYPES, REQUEST_TYPES, PRIORITIES, ROLES } = require('../utils/constants');

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateMaintenanceRequest = (req, res, next) => {
  const {
    subject,
    maintenance_for,
    equipment_id,
    work_center_id,
    request_type,
    priority
  } = req.body;

  const errors = [];

  // Subject validation
  if (!subject || subject.trim().length === 0) {
    errors.push('Subject is required and cannot be empty');
  } else if (subject.length > 200) {
    errors.push('Subject cannot exceed 200 characters');
  }

  // Maintenance For validation
  if (!maintenance_for) {
    errors.push('Maintenance For field is required');
  } else if (!MAINTENANCE_FOR_TYPES.includes(maintenance_for)) {
    errors.push('Maintenance For must be either "Equipment" or "Work Center"');
  }

  // Logical validation - Equipment XOR Work Center
  if (maintenance_for === 'Equipment') {
    if (!equipment_id) {
      errors.push('Equipment ID is required when Maintenance For is "Equipment"');
    }
    if (work_center_id) {
      errors.push('Cannot specify Work Center when Maintenance For is "Equipment"');
    }
  }

  if (maintenance_for === 'Work Center') {
    if (!work_center_id) {
      errors.push('Work Center ID is required when Maintenance For is "Work Center"');
    }
    if (equipment_id) {
      errors.push('Cannot specify Equipment when Maintenance For is "Work Center"');
    }
  }

  // Request Type validation
  if (!request_type) {
    errors.push('Request Type is required');
  } else if (!REQUEST_TYPES.includes(request_type)) {
    errors.push('Request Type must be either "Corrective" or "Preventive"');
  }

  // Priority validation
  if (!priority) {
    errors.push('Priority is required');
  } else if (!PRIORITIES.includes(priority)) {
    errors.push('Priority must be "1" (Low), "2" (Normal), or "3" (High)');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the following errors:',
      errors
    });
  }

  next();
};

const validateEquipment = (req, res, next) => {
  const {
    name,
    category_id,
    maintenance_team_id,
    assigned_technician_id,
    health_percentage,
    serial_number
  } = req.body;

  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Equipment name is required');
  }

  if (!category_id) {
    errors.push('Equipment category is required');
  } else if (!Number.isInteger(Number(category_id))) {
    errors.push('Category ID must be a valid number');
  }

  if (!maintenance_team_id) {
    errors.push('Maintenance team is required');
  }

  if (!assigned_technician_id) {
    errors.push('Assigned technician is required');
  }

  if (health_percentage !== undefined) {
    const health = Number(health_percentage);
    if (isNaN(health) || health < 0 || health > 100) {
      errors.push('Health percentage must be between 0 and 100');
    }
  }

  if (serial_number && serial_number.trim().length === 0) {
    errors.push('Serial number cannot be empty if provided');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the following errors:',
      errors
    });
  }

  next();
};

const validateUser = (req, res, next) => {
  const { name, email, role } = req.body;

  const errors = [];

  if (!name || name.trim().length === 0) {
    errors.push('Name is required and cannot be empty');
  }

  if (!email) {
    errors.push('Email is required');
  } else if (!validateEmail(email)) {
    errors.push('Please provide a valid email address (e.g., user@example.com)');
  }

  if (role && !ROLES.includes(role)) {
    errors.push('Role must be one of: Technician, Manager, or Admin');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed. Please correct the following errors:',
      errors
    });
  }

  next();
};

module.exports = {
  validateMaintenanceRequest,
  validateEquipment,
  validateUser,
  validateEmail
};