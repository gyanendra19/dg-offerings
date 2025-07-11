import express from 'express';
import { upload, uploadToS3 } from '../controllers/imageController.js';

const router = express.Router();

// Route for uploading images
router.post('/upload', upload.single('image'), uploadToS3);

export default router;
