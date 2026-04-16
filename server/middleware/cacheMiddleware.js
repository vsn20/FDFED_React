// ============ REDIS CACHE MIDDLEWARE ============
// Caching middleware for Express routes
// Checks Redis for cached response, returns if hit, caches on miss
// Adds X-Cache header (HIT/MISS) and X-Response-Time header for benchmarking
const { getCache, setCache, isRedisReady } = require('../config/redis');

/**
 * Cache middleware factory
 * @param {number} ttlSeconds - Time to live in seconds (default: 300 = 5 min)
 * @param {function} keyGenerator - Optional function to generate cache key from req
 * @returns {function} Express middleware
 */
const cacheMiddleware = (ttlSeconds = 300, keyGenerator = null) => {
  return async (req, res, next) => {
    // Record start time for performance benchmarking
    const startTime = Date.now();
    
    // Skip caching if Redis is not available
    if (!isRedisReady()) {
      res.set('X-Cache', 'BYPASS');
      return next();
    }

    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key
    const cacheKey = keyGenerator 
      ? keyGenerator(req) 
      : `cache:${req.originalUrl}`;

    try {
      // Try to get from cache
      const cachedData = await getCache(cacheKey);
      
      if (cachedData) {
        // CACHE HIT
        const responseTime = Date.now() - startTime;
        res.set('X-Cache', 'HIT');
        res.set('X-Response-Time', `${responseTime}ms`);
        res.set('X-Cache-Key', cacheKey);
        
        // Log cache hit for performance report
        logPerformance(req.originalUrl, responseTime, 'HIT');
        
        return res.json(cachedData);
      }

      // CACHE MISS - Override res.json to capture and cache the response
      const originalJson = res.json.bind(res);
      res.json = (data) => {
        const responseTime = Date.now() - startTime;
        res.set('X-Cache', 'MISS');
        res.set('X-Response-Time', `${responseTime}ms`);
        res.set('X-Cache-Key', cacheKey);
        
        // Log cache miss for performance report
        logPerformance(req.originalUrl, responseTime, 'MISS');
        
        // Cache the response data
        setCache(cacheKey, data, ttlSeconds).catch(() => {});
        
        return originalJson(data);
      };

      next();
    } catch (err) {
      console.error('[CACHE] Middleware error:', err.message);
      next();
    }
  };
};

// ============ PERFORMANCE LOGGING ============
const fs = require('fs');
const path = require('path');

const performanceLogPath = path.join(__dirname, '..', 'logs', 'performance.json');

// Initialize performance log file if it doesn't exist
const initPerformanceLog = () => {
  const dir = path.dirname(performanceLogPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(performanceLogPath)) {
    fs.writeFileSync(performanceLogPath, JSON.stringify({ entries: [], summary: {} }, null, 2));
  }
};

const logPerformance = (url, responseTime, cacheStatus) => {
  try {
    initPerformanceLog();
    const logData = JSON.parse(fs.readFileSync(performanceLogPath, 'utf8'));
    
    // Keep last 1000 entries maximum
    if (logData.entries.length >= 1000) {
      logData.entries = logData.entries.slice(-500);
    }
    
    logData.entries.push({
      url,
      responseTime,
      cacheStatus,
      timestamp: new Date().toISOString()
    });

    // Update summary statistics per endpoint
    if (!logData.summary[url]) {
      logData.summary[url] = { hitCount: 0, missCount: 0, hitTimes: [], missTimes: [] };
    }
    
    if (cacheStatus === 'HIT') {
      logData.summary[url].hitCount++;
      logData.summary[url].hitTimes.push(responseTime);
      // Keep only last 50 times for averaging
      if (logData.summary[url].hitTimes.length > 50) {
        logData.summary[url].hitTimes = logData.summary[url].hitTimes.slice(-50);
      }
    } else {
      logData.summary[url].missCount++;
      logData.summary[url].missTimes.push(responseTime);
      if (logData.summary[url].missTimes.length > 50) {
        logData.summary[url].missTimes = logData.summary[url].missTimes.slice(-50);
      }
    }

    fs.writeFileSync(performanceLogPath, JSON.stringify(logData, null, 2));
  } catch (err) {
    // Silently fail - don't break the request for logging
  }
};

/**
 * GET /api/performance-report
 * Returns the Redis caching performance report
 */
const getPerformanceReport = (req, res) => {
  try {
    initPerformanceLog();
    const logData = JSON.parse(fs.readFileSync(performanceLogPath, 'utf8'));
    
    const report = {};
    for (const [url, stats] of Object.entries(logData.summary)) {
      const avgHitTime = stats.hitTimes.length > 0
        ? (stats.hitTimes.reduce((a, b) => a + b, 0) / stats.hitTimes.length).toFixed(2)
        : 'N/A';
      const avgMissTime = stats.missTimes.length > 0
        ? (stats.missTimes.reduce((a, b) => a + b, 0) / stats.missTimes.length).toFixed(2)
        : 'N/A';
      
      const improvement = (avgHitTime !== 'N/A' && avgMissTime !== 'N/A')
        ? ((1 - parseFloat(avgHitTime) / parseFloat(avgMissTime)) * 100).toFixed(1)
        : 'N/A';

      report[url] = {
        cacheHits: stats.hitCount,
        cacheMisses: stats.missCount,
        avgResponseTime_cached_ms: avgHitTime,
        avgResponseTime_uncached_ms: avgMissTime,
        performanceImprovement: improvement !== 'N/A' ? `${improvement}%` : 'N/A',
        totalRequests: stats.hitCount + stats.missCount,
        cacheHitRate: `${((stats.hitCount / (stats.hitCount + stats.missCount)) * 100).toFixed(1)}%`
      };
    }

    res.json({
      success: true,
      title: 'Redis Caching Performance Report',
      generatedAt: new Date().toISOString(),
      redisStatus: isRedisReady() ? 'Connected' : 'Disconnected',
      endpoints: report,
      totalEntries: logData.entries.length
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Error generating performance report' });
  }
};

module.exports = { cacheMiddleware, getPerformanceReport };
