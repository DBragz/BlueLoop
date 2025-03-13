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
    await db.select().from(users).limit(1);
    log("Database connection successful");

    log("Registering routes...");
    const server = await registerRoutes(app);
    log("Routes registered successfully");

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error: ${message}`); 
      res.status(status).json({ message });
    });

    // Determine if we're in development mode
    const isDevelopment = process.env.NODE_ENV !== "production";
    log(`Running in ${isDevelopment ? "development" : "production"} mode`);

    if (isDevelopment) {
      log("Setting up Vite development server...");
      await setupVite(app, server);
      log("Vite development server configured");
    } else {
      log("Setting up static file serving...");
      serveStatic(app);
      log("Static file serving configured");
    }

    const port = process.env.PORT || 5000;
    server.listen(port, () => {
      log(`Server successfully started and listening on port ${port}`);
    });
  } catch (error) {
    log(`Startup error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
})();