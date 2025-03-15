import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { users } from "@shared/schema";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Add production-specific middleware
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('X-Frame-Options', 'DENY');
    res.set('X-XSS-Protection', '1; mode=block');
    next();
  });
}

// Enhanced request logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    log("Starting server initialization...");

    // Test database connectivity with timeout
    log("Testing database connection...");
    const startDb = Date.now();
    try {
      await Promise.race([
        db.select().from(users).limit(1),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Database connection timeout')), 10000)
        )
      ]);
      log(`Database connection successful (took ${Date.now() - startDb}ms)`);
    } catch (dbError) {
      log(`Database connection failed: ${dbError}`);
      throw dbError;
    }

    log("Registering routes...");
    const startRoutes = Date.now();
    const server = await registerRoutes(app);
    log(`Routes registered successfully (took ${Date.now() - startRoutes}ms)`);

    // Enhanced error handling
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error: ${message} (${status})`);
      if (err.stack) {
        log(`Stack trace: ${err.stack}`);
      }
      // In production, don't expose error details
      const responseMessage = process.env.NODE_ENV === 'production'
        ? "An error occurred"
        : message;
      res.status(status).json({ message: responseMessage });
    });

    const isDevelopment = process.env.NODE_ENV !== "production";
    log(`Running in ${isDevelopment ? "development" : "production"} mode`);

    if (isDevelopment) {
      log("Setting up Vite development server...");
      const startVite = Date.now();
      await setupVite(app, server);
      log(`Vite development server configured (took ${Date.now() - startVite}ms)`);
    } else {
      log("Setting up static file serving...");
      const startStatic = Date.now();
      serveStatic(app);
      log(`Static file serving configured (took ${Date.now() - startStatic}ms)`);
    }

    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      const totalTime = Date.now() - startDb;
      log(`Server successfully started and listening on port ${port} (total startup time: ${totalTime}ms)`);
    });

    // Graceful shutdown handling
    const shutdown = async () => {
      log('Received shutdown signal, closing server...');
      server.close(() => {
        log('Server closed successfully');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

  } catch (error) {
    log(`Startup error: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) {
      log(`Error stack trace: ${error.stack}`);
    }
    process.exit(1);
  }
})();