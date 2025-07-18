import { Redis } from 'ioredis';

export const redisConnection = new Redis({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  tls: process.env.NODE_ENV === 'production' ? true : undefined,
  // BullMQ-specific requirements:
  maxRetriesPerRequest: null,  // MUST be null for BullMQ
  enableReadyCheck: false,      // Disable ready check
  // Connection handling:
  retryStrategy: (times) => {
    console.log(`Retrying Redis connection (attempt ${times})`);
    return Math.min(times * 200, 5000);
  }
});

// Test connection on startup
redisConnection.on('connect', () => {
  console.log('🔌 Redis connection established');
});

redisConnection.on('error', (err) => {
  console.error('❌ Redis error:', err.message);
});