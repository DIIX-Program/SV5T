import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma, disconnectPrisma } from './lib/prisma';
import authRoutes from './routes/authRoutes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// ============================================================================
// ROUTES
// ============================================================================

// Auth routes
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', async (req: Request, res: Response) => {
  try {
    // Test database connection
    const result = await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'PostgreSQL',
      environment: NODE_ENV,
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Database connection failed',
      database: 'PostgreSQL',
      environment: NODE_ENV
    });
  }
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'SV5T Readiness Evaluator API',
    version: '2.0.0',
    database: 'PostgreSQL',
    environment: NODE_ENV,
    endpoints: {
      auth: '/api/auth',
      health: '/health',
      documentation: '/api/docs'
    },
    startedAt: new Date().toISOString()
  });
});

// API docs
app.get('/api/docs', (req: Request, res: Response) => {
  res.json({
    title: 'SV5T API Documentation',
    version: '2.0.0',
    baseUrl: process.env.API_BASE_URL || 'http://localhost:5000',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        adminLogin: 'POST /api/auth/admin/login',
        getCurrentUser: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout'
      }
    },
    authentication: 'JWT Bearer Token',
    documentation: 'See DATABASE_QUICK_START.md for examples'
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.path,
    method: req.method,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'GET /api/docs',
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET /api/auth/me'
    ]
  });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: NODE_ENV === 'development' ? err : undefined
  });
});

// ============================================================================
// SERVER START
// ============================================================================

const server = app.listen(PORT, () => {
  const startTime = new Date().toLocaleTimeString();
  console.log(`
╔════════════════════════════════════════════════════════════╗
║           SV5T Readiness Evaluator - Server                ║
╚════════════════════════════════════════════════════════════╝

✅ Server started at: ${startTime}
🌐 URL: http://localhost:${PORT}
📊 Database: PostgreSQL
🔧 Environment: ${NODE_ENV}

📝 Available Endpoints:
   GET  /              - Welcome message
   GET  /health        - Health check
   GET  /api/docs      - API documentation
   
   POST /api/auth/register      - Register new student
   POST /api/auth/login         - Student login
   POST /api/auth/admin/login   - Admin login
   GET  /api/auth/me            - Get current user
   POST /api/auth/logout        - Logout

⌨️  Press Ctrl+C to stop server

${NODE_ENV === 'development' ? '🔍 Development mode - Auto-reload enabled' : '🚀 Production mode'}

════════════════════════════════════════════════════════════
`);
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================

const gracefulShutdown = async (signal: string) => {
  console.log(`\n⏸️  ${signal} received. Shutting down gracefully...`);
  
  server.close(async () => {
    try {
      // Disconnect from Prisma
      await disconnectPrisma();
      console.log('✅ Database connection closed');
      console.log('✅ Server stopped gracefully');
      process.exit(0);
    } catch (err) {
      console.error('❌ Error during shutdown:', err);
      process.exit(1);
    }
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;
