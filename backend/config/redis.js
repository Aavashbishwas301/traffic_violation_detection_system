import { Redis } from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  maxRetriesPerRequest: null, // BullMQ requires this to be null
};

let redisConnection = null;

if (process.env.NODE_ENV !== "test") {
  // Check if REDIS_URL is provided (useful for docker-compose environment)
  redisConnection = process.env.REDIS_URL 
      ? new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
      : new Redis(redisConfig);

  redisConnection.on('connect', () => {
    console.log('Redis connected successfully for Job Queue');
  });

  redisConnection.on('error', (err) => {
    console.error('Redis connection error:', err);
  });
}

export default redisConnection;
