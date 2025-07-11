import express from 'express';
import {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  deleteDeal
} from '../controllers/dealController.js';

const router = express.Router();

// Routes
router.route('/')
  .get(getAllDeals)
  .post(createDeal);

router.route('/:id')
  .get(getDealById)
  .put(updateDeal)
  .delete(deleteDeal);

export default router; 