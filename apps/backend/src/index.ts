/**
 * Awoof Backend API
 * 
 * Main entry point for the application
 * Follows SOLID principles with clean architecture
 */

import express, { type Express } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env.js';
import { db } from './config/database.js';
import { redis } from './config/redis.js';
import { errorHandler } from './common/middleware/errorHandler.js';
import { logger } from './common/middleware/logger.js';
import { swaggerSpec } from './config/swagger.js';

/**
 * Application class
 * Encapsulates Express app setup following Single Responsibility Principle
 */
class App {
  private app: Express;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    // Note: Error handling must be initialized AFTER routes
  }

  /**
   * Initialize middleware
   */
  private initializeMiddlewares(): void {
    // CORS
    this.app.use(
      cors({
        origin: config.cors.origin,
        credentials: true,
      })
    );

    // Body parser
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logger
    this.app.use(logger);

    // Health check (before authentication)
    this.app.get('/health', (_req, res) => {
      res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: config.env,
      });
    });

    // Swagger API documentation
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Awoof API Documentation',
    }));
  }

  /**
   * Initialize routes
   */
  private async initializeRoutes(): Promise<void> {
    // Root route
    this.app.get('/', (_req, res) => {
      res.json({
        message: 'Awoof Backend API',
        version: '1.0.0',
        documentation: '/api-docs',
        endpoints: {
          auth: '/api/auth',
          students: '/api/students',
          universities: '/api/universities',
          verification: '/api/verification',
        },
      });
    });

    // Authentication routes
    try {
      const authRoutes = await import('./routes/auth.routes.js');
      this.app.use('/api/auth', authRoutes.default);
      console.log('✅ Auth routes registered successfully');
    } catch (error) {
      console.error('❌ Failed to register auth routes:', error);
      throw error;
    }

    // Student routes
    try {
      const studentRoutes = await import('./routes/students.routes.js');
      this.app.use('/api/students', studentRoutes.default);
      console.log(' Student routes registered successfully');
    } catch (error) {
      console.error(' Failed to register student routes:', error);
      throw error;
    }

    // University routes
    try {
      const universityRoutes = await import('./routes/universities.routes.js');
      this.app.use('/api/universities', universityRoutes.default);
      console.log(' University routes registered successfully');
    } catch (error) {
      console.error(' Failed to register university routes:', error);
      throw error;
    }

    // Verification routes
    try {
      const verificationRoutes = await import('./routes/verification.routes.js');
      this.app.use('/api/verification', verificationRoutes.default);
      console.log(' Verification routes registered successfully');
    } catch (error) {
      console.error(' Failed to register verification routes:', error);
      throw error;
    }
  }

  /**
   * Initialize error handling
   */
  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use((_req, res) => {
      res.status(404).json({
        success: false,
        error: {
          message: 'Route not found',
          code: 'NOT_FOUND',
          statusCode: 404,
        },
      });
    });

    // Error handler (must be last)
    this.app.use(errorHandler);
  }

  /**
   * Start server
   */
  public async start(): Promise<void> {
    try {
      // Initialize database
      db.initialize();

      // Run database migrations
      if (process.env.RUN_MIGRATIONS !== 'false') {
        const { runMigrations } = await import('./database/migrations/run.js');
        await runMigrations();
      }

      // Initialize Redis
      redis.initialize();

      // Initialize routes (must be after database is ready)
      await this.initializeRoutes();

      // Initialize error handling (must be AFTER routes)
      this.initializeErrorHandling();

      // Start server
      this.app.listen(config.port, () => {
        console.log(`
          Awoof Backend API
          Environment: ${config.env}
          Server running on http://localhost:${config.port}
          Started at: ${new Date().toISOString()}
        `);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  /**
   * Graceful shutdown
   */
  public async shutdown(): Promise<void> {
    console.log('Shutting down server...');

    try {
      await db.close();
      await redis.close();
      console.log('Server shut down gracefully');
      process.exit(0);
    } catch (error) {
      console.error('Error during shutdown:', error);
      process.exit(1);
    }
  }

  /**
   * Get Express app (for testing)
   */
  public getApp(): Express {
    return this.app;
  }
}

// Create app instance
const app = new App();

// Start server
app.start();

// Graceful shutdown handlers
process.on('SIGTERM', () => app.shutdown());
process.on('SIGINT', () => app.shutdown());

// Handle unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

export default app;
