import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure WebSocket for Neon - MUST be done before creating pool
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false; // Important: Disable pipelining for production stability

// Early validation of DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const startTime = Date.now();
console.log('Initializing database connection pool...');

// Configure pool with production-optimized settings
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10000, // 10 second timeout
  max: 1, // Single connection for serverless
  idleTimeoutMillis: 20000, // Release idle connections after 20 seconds
  maxUses: 10000, // Recycle connection after 10000 queries
  keepAlive: true // Enable keepalive
});

export const db = drizzle(pool, { schema });

// Helper: Sleep function for retry delays
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Test connection with exponential backoff
async function testConnection(maxRetries = 3, initialDelay = 1000) {
  let retryCount = 0;
  let lastError;

  while (retryCount < maxRetries) {
    const client = await pool.connect().catch(e => {
      console.error(`Connection attempt ${retryCount + 1} failed:`, e);
      return null;
    });

    if (client) {
      try {
        // Use a simple SELECT 1 instead of selecting from tables
        await client.query('SELECT 1 AS connection_test');
        const duration = Date.now() - startTime;
        console.log(`Database connection verified (took ${duration}ms)`);
        return true;
      } catch (error) {
        lastError = error;
        console.error(`Query test failed on attempt ${retryCount + 1}:`, error);
      } finally {
        client.release();
      }
    }

    retryCount++;
    if (retryCount < maxRetries) {
      const delay = initialDelay * Math.pow(2, retryCount - 1);
      console.log(`Waiting ${delay}ms before retry ${retryCount + 1}...`);
      await sleep(delay);
    }
  }

  throw lastError || new Error('Failed to establish database connection');
}

// Initialize database connection
testConnection()
  .catch(err => {
    console.error('Fatal: Failed to initialize database connection:', err);
    process.exit(1);
  });

// Handle pool errors
pool.on('error', async (err, client) => {
  console.error('Unexpected error on idle client:', err);
  if (client) {
    client.release(true); // Force release with error
  }
});

// Cleanup handler
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, closing pool...');
  try {
    await pool.end();
    console.log('Pool has been closed');
  } catch (err) {
    console.error('Error closing pool:', err);
    process.exit(1);
  }
  process.exit(0);
});

// Additional error handlers
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  // Attempt graceful shutdown
  pool.end().finally(() => process.exit(1));
});