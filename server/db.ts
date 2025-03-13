import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const startTime = Date.now();
console.log('Initializing database connection pool...');

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

// Test the connection on module load
pool.connect()
  .then(() => {
    const duration = Date.now() - startTime;
    console.log(`Database connection pool initialized successfully (took ${duration}ms)`);
  })
  .catch(err => {
    console.error('Failed to initialize database pool:', err);
    console.error('Connection error stack:', err.stack);
    throw err; // Re-throw to ensure the error is caught by the main startup process
  });

// Add connection error handler
pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
  console.error('Pool error stack:', err.stack);
});