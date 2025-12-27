const express = require('express');
const router = express.Router();
const {
  getAllEquipment,
  getEquipmentById,
  getEquipmentRequests,
  createEquipment,
  updateEquipment,
  deleteEquipment
} = require('../controllers/equipmentController');
const { validateEquipment } = require('../middleware/validateRequest');

router.get('/', getAllEquipment);
router.get('/:id', getEquipmentById);
router.get('/:id/requests', getEquipmentRequests);
router.post('/', validateEquipment, createEquipment);
router.put('/:id', validateEquipment, updateEquipment);
router.delete('/:id', deleteEquipment);

module.exports = router;