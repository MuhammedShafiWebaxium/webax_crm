import { Redis } from 'ioredis';

// Environment-based configuration
const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

export const redisConnection = new Redis({
  // Connection Basics
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,

  // TLS (Production Only)
  tls: isProduction ? {
    rejectUnauthorized: false, // Required for Redis Cloud
    minVersion: 'TLSv1.2'     // Enforce modern TLS
  } : undefined,

  // Timeouts (Prevent BullMQ Worker Errors)
  connectTimeout: isProduction ? 10000 : 5000, // 10s prod / 5s dev
  commandTimeout: 15000, // 15s for all operations
  socket: {
    keepAlive: 30000 // 30s keepalive packets
  },

  // BullMQ Requirements
  maxRetriesPerRequest: null,
  enableReadyCheck: false,

  // Enhanced Retry Logic
  retryStrategy: (times) => {
    const delay = Math.min(times * 500, 5000);
    if (isDevelopment) {
      console.log(`♻️ Redis retry #${times} (${delay}ms delay)`);
    }
    return delay;
  }
});

// ========================
// Connection Event Handlers
// ========================

redisConnection.on('connect', () => {
  console.log(`🔌 Redis ${isProduction ? 'Cloud' : 'Local'} connected`);
});

redisConnection.on('ready', () => {
  if (isDevelopment) {
    console.log('✅ Redis ready to accept commands');
  }
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis error:', {
    type: err.code,
    message: err.message,
    ...(isDevelopment && { stack: err.stack })
  });
});

// ========================
// Startup Test
// ========================
(async () => {
  try {
    await redisConnection.ping();
    if (isDevelopment) {
      console.log('🏓 Redis ping successful');
    }
  } catch (err) {
    console.error('💥 Failed initial Redis ping:', {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT,
      error: err.message
    });
  }
})();

// Graceful Shutdown
process.on('SIGTERM', async () => {
  await redisConnection.quit();
  if (isDevelopment) {
    console.log('🛑 Redis connection closed gracefully');
  }
});