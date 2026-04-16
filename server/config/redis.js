// ============ REDIS CONFIGURATION ============
// Redis client for caching layer (DB Optimization)
// Uses ioredis with graceful fallback if Redis is unavailable
const Redis = require('ioredis');

let redisClient = null;
let isRedisConnected = false;
let hasLoggedDisconnect = false; // Prevent log spam

const initRedis = () => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableReadyCheck: true,
    connectTimeout: 3000,
    lazyConnect: true,
    retryStrategy(times) {
      // Stop retrying after 3 attempts — Redis is optional
      if (times > 3) {
        if (!hasLoggedDisconnect) {
          hasLoggedDisconnect = true;
          console.warn('\x1b[33m[REDIS]\x1b[0m Redis not available after 3 retries. Caching disabled. App continues without cache.');
        }
        return null; // Stop retrying
      }
      return Math.min(times * 200, 1000); // Retry delay: 200ms, 400ms, 600ms
    }
  });

  redisClient.on('connect', () => {
    isRedisConnected = true;
    hasLoggedDisconnect = false;
    console.log('\x1b[32m[REDIS]\x1b[0m Connected to Redis successfully');
  });

  redisClient.on('error', (err) => {
    isRedisConnected = false;
    // Only log the first error to avoid console spam
    if (!hasLoggedDisconnect) {
      hasLoggedDisconnect = true;
      console.warn('\x1b[33m[REDIS]\x1b[0m Redis unavailable — caching disabled. Server runs normally without it.');
    }
  });

  redisClient.on('close', () => {
    isRedisConnected = false;
    // Silently handle close — already logged via error handler
  });

  // Attempt connection (non-blocking)
  redisClient.connect().catch((err) => {
    if (!hasLoggedDisconnect) {
      hasLoggedDisconnect = true;
      console.warn('\x1b[33m[REDIS]\x1b[0m Redis not available, caching disabled. App works without it.');
    }
  });

  return redisClient;
};

const getRedisClient = () => redisClient;
const isRedisReady = () => isRedisConnected && redisClient !== null;

// Cache helper functions
const getCache = async (key) => {
  if (!isRedisReady()) return null;
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    return null;
  }
};

const setCache = async (key, data, ttlSeconds = 300) => {
  if (!isRedisReady()) return false;
  try {
    await redisClient.setex(key, ttlSeconds, JSON.stringify(data));
    return true;
  } catch (err) {
    return false;
  }
};

const invalidateCache = async (pattern) => {
  if (!isRedisReady()) return;
  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(...keys);
      console.log(`\x1b[36m[REDIS]\x1b[0m Invalidated ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (err) {
    // Silently fail
  }
};

const flushCache = async () => {
  if (!isRedisReady()) return;
  try {
    await redisClient.flushdb();
    console.log('\x1b[36m[REDIS]\x1b[0m Cache flushed');
  } catch (err) {
    // Silently fail
  }
};

module.exports = {
  initRedis,
  getRedisClient,
  isRedisReady,
  getCache,
  setCache,
  invalidateCache,
  flushCache
};
