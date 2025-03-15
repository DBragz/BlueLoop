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

// Configure pool with better timeout and error handling
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 20, // Increase max connections
  idleTimeoutMillis: 30000, // Reduce idle timeout
  connectionTimeoutMillis: 5000, // Add connection timeout
});

export const db = drizzle(pool, { schema });

// Test the connection on module load with retry logic
async function initializeDatabase(retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await pool.connect();
      const duration = Date.now() - startTime;
      console.log(`Database connection pool initialized successfully (took ${duration}ms)`);
      return;
    } catch (err) {
      console.error(`Failed to initialize database pool (attempt ${i + 1}/${retries}):`, err);
      if (i === retries - 1) {
        throw err;
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
}

initializeDatabase().catch(err => {
  console.error('Failed to initialize database after retries:', err);
  console.error('Connection error stack:', err.stack);
  process.exit(1);
});

// Add connection error handler with reconnection logic
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  console.error('Pool error stack:', err.stack);
  // Try to clean up and reconnect
  try {
    pool.end();
    initializeDatabase()
      .then(() => console.log('Database reconnected after error'))
      .catch(reconnectErr => {
        console.error('Failed to reconnect to database:', reconnectErr);
        process.exit(1);
      });
  } catch (cleanupErr) {
    console.error('Failed to cleanup pool:', cleanupErr);
    process.exit(1);
  }
});