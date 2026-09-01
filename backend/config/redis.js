import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  maxRetriesPerRequest: null, // BullMQ requires this to be null
  enableOfflineQueue: false,
  retryStrategy: (times) => {
    if (times > 3) {
      console.warn('⚠️  Redis server is not running on 127.0.0.1:6379. TVDS will operate with direct in-process asynchronous job handling.');
      return null; // Stop reconnecting after 3 failed attempts
    }
    return Math.min(times * 500, 2000);
  },
};

let redisConnection = null;

if (process.env.NODE_ENV !== "test" && process.env.ENABLE_REDIS !== "false") {
  try {
    redisConnection = process.env.REDIS_URL 
      ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null, enableOfflineQueue: false })
      : new Redis(redisConfig);

    redisConnection.on('connect', () => {
      console.log('✅ Redis connected successfully for BullMQ job queue.');
    });

    redisConnection.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        // Silently handled by retryStrategy warning
      } else {
        console.warn('Redis connection notice:', err.message);
      }
    });
  } catch (initErr) {
    console.warn('Redis initialization skipped:', initErr.message);
    redisConnection = null;
  }
}

export default redisConnection;
