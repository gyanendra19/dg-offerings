import express from 'express';
import {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal,
  getDealTypes
} from '../controllers/dealController.js';

const router = express.Router();

// Routes
router.route('/')
  .get(getAllDeals)
  .post(createDeal);

router.route('/types')
  .get(getDealTypes);

router.route('/:id')
  .get(getDealById)
  .put(updateDeal)
  .delete(deleteDeal);

export default router; 