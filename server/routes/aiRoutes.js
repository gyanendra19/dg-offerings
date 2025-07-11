import express from 'express';
import { generateContent } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Protected route - only authenticated users can access
router.post('/generate', protect, generateContent);

export default router; 