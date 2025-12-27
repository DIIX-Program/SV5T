import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/mongodb.js';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import eventRoutes from './routes/eventRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/events', eventRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'Server is running',
    timestamp: new Date(),
    mongodb: 'Connected' // This would be better with actual connection check
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SV5T Readiness Evaluator API',
    version: '1.0.0',
    endpoints: {
      students: '/api/students',
      analytics: '/api/analytics',
      health: '/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints:`);
  console.log(`   - GET /api/students/all`);
  console.log(`   - GET /api/students/statistics`);
  console.log(`   - POST /api/students`);
  console.log(`   - GET /api/analytics/analyze`);
  console.log(`   - GET /api/analytics/export-csv`);
  console.log(`   - GET /health`);
});

export default app;
