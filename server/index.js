import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// ES modules fix for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config();

// Route files
import dealRoutes from './routes/dealRoutes.js';
import imageRoutes from './routes/imageRoute.js';
import authRoutes from './routes/authRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

// Enable CORS
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? true  // Allow same origin in production
    : ['http://127.0.0.1:5500', 'http://localhost:5500', 'http://127.0.0.1:3000', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['set-cookie']
}));

// Body parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Static folder for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routers
app.use('/api/deals', dealRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

// Serve static files (both development and production)
  const rootPath = path.join(__dirname, '..');
  console.log('Serving static files from:', rootPath);
  
  // Serve the main static files
  app.use(express.static(rootPath));
  
  // Serve subdirectory static files
  app.use('/auth', express.static(path.join(rootPath, 'auth')));
  app.use('/dashboard', express.static(path.join(rootPath, 'dashboard')));
  app.use('/details', express.static(path.join(rootPath, 'details')));
  app.use('/pricing', express.static(path.join(rootPath, 'pricing')));
  app.use('/js', express.static(path.join(rootPath, 'js')));
  app.use('/public', express.static(path.join(rootPath, 'public')));
  
  // Add request logging middleware
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
  });
  
  // Handle SPA routing - this should be last
  app.get('*', (req, res) => {
    // Don't redirect API or static asset requests
    if (req.url.startsWith('/api/') || req.url.includes('.')) {
      console.log('404 for:', req.url);
      res.status(404).send('Not found');
      return;
    }
    console.log('Serving index.html for:', req.url);
    res.sendFile(path.join(rootPath, 'index.html'));
  });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log('MongoDB connection error:', err));

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 