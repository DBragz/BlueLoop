import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const startTime = Date.now();
console.log('Initializing database connection pool...');

// Configure pool with production-ready settings
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 10, // Reduced max connections for better stability
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  keepAlive: true, // Enable keep-alive
  allowExitOnIdle: false // Prevent immediate exit on idle
});

export const db = drizzle(pool, { schema });

// Initialize database with retries and better error handling
async function initializeDatabase(retries = 5, retryDelay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      client.release(); // Important: release the client back to the pool
      const duration = Date.now() - startTime;
      console.log(`Database connection pool initialized successfully (took ${duration}ms)`);
      return;
    } catch (err) {
      console.error(`Failed to initialize database pool (attempt ${i + 1}/${retries}):`, err);
      if (i === retries - 1) {
        throw err;
      }
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

// Handle database initialization
initializeDatabase().catch(err => {
  console.error('Failed to initialize database after retries:', err);
  console.error('Connection error stack:', err.stack);
  process.exit(1);
});

// Improved error handling with automatic reconnection
pool.on('error', async (err) => {
  console.error('Unexpected database pool error:', err);
  console.error('Pool error stack:', err.stack);

  try {
    console.log('Attempting to recover database connection...');
    await pool.end();
    await initializeDatabase();
    console.log('Database connection recovered successfully');
  } catch (reconnectErr) {
    console.error('Failed to recover database connection:', reconnectErr);
    // In production, we want to exit and let the process manager restart us
    if (process.env.NODE_ENV === 'production') {
      console.error('Critical database error in production, exiting process...');
      process.exit(1);
    }
  }
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM signal, initiating graceful shutdown...');
  try {
    await pool.end();
    console.log('Database pool closed successfully');
    process.exit(0);
  } catch (err) {
    console.error('Error during graceful shutdown:', err);
    process.exit(1);
  }
});