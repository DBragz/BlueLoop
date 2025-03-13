import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { users } from "@shared/schema";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

    // Test database connectivity
    log("Testing database connection...");
    const startDb = Date.now();
    await db.select().from(users).limit(1);
    log(`Database connection successful (took ${Date.now() - startDb}ms)`);

    log("Registering routes...");
    const startRoutes = Date.now();
    const server = await registerRoutes(app);
    log(`Routes registered successfully (took ${Date.now() - startRoutes}ms)`);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error: ${message} (${status})`); 
      if (err.stack) {
        log(`Stack trace: ${err.stack}`);
      }
      res.status(status).json({ message });
    });

    // Determine if we're in development mode
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
  } catch (error) {
    log(`Startup error: ${error instanceof Error ? error.message : String(error)}`);
    if (error instanceof Error && error.stack) {
      log(`Error stack trace: ${error.stack}`);
    }
    process.exit(1);
  }
})();