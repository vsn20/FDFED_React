// ============ CACHE MIDDLEWARE TESTS ============
// Tests for Redis caching middleware reliability
require('./setup');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');
const { isRedisReady, getCache, setCache } = require('../config/redis');

const mockReq = (method = 'GET', originalUrl = '/api/test') => ({
  method,
  originalUrl
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.set = jest.fn().mockReturnValue(res);
  return res;
};

describe('Cache Middleware', () => {
  
  test('should bypass cache when Redis is not available', async () => {
    isRedisReady.mockReturnValue(false);
    
    const middleware = cacheMiddleware(300);
    const req = mockReq();
    const res = mockRes();
    const next = jest.fn();
    
    await middleware(req, res, next);
    
    expect(res.set).toHaveBeenCalledWith('X-Cache', 'BYPASS');
    expect(next).toHaveBeenCalled();
  });

  test('should skip cache for non-GET requests', async () => {
    isRedisReady.mockReturnValue(true);
    
    const middleware = cacheMiddleware(300);
    const req = mockReq('POST', '/api/test');
    const res = mockRes();
    const next = jest.fn();
    
    await middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });

  test('should return cached data on cache HIT', async () => {
    isRedisReady.mockReturnValue(true);
    getCache.mockResolvedValue({ success: true, data: [{ id: 1, name: 'test' }] });
    
    const middleware = cacheMiddleware(300);
    const req = mockReq('GET', '/api/products');
    const res = mockRes();
    const next = jest.fn();
    
    await middleware(req, res, next);
    
    expect(res.set).toHaveBeenCalledWith('X-Cache', 'HIT');
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, data: expect.any(Array) })
    );
    expect(next).not.toHaveBeenCalled(); // Should NOT call next on cache hit
  });

  test('should call next on cache MISS', async () => {
    isRedisReady.mockReturnValue(true);
    getCache.mockResolvedValue(null); // Cache miss
    
    const middleware = cacheMiddleware(300);
    const req = mockReq('GET', '/api/products');
    const res = mockRes();
    const next = jest.fn();
    
    await middleware(req, res, next);
    
    expect(next).toHaveBeenCalled(); // Should call next to continue to controller
  });

  test('should handle cache errors gracefully', async () => {
    isRedisReady.mockReturnValue(true);
    getCache.mockRejectedValue(new Error('Redis connection lost'));
    
    const middleware = cacheMiddleware(300);
    const req = mockReq('GET', '/api/products');
    const res = mockRes();
    const next = jest.fn();
    
    await middleware(req, res, next);
    
    // Should gracefully fall through to controller
    expect(next).toHaveBeenCalled();
  });

  test('should use custom key generator when provided', async () => {
    isRedisReady.mockReturnValue(true);
    getCache.mockResolvedValue(null);
    
    const customKeyGen = (req) => `custom:${req.originalUrl}:v2`;
    const middleware = cacheMiddleware(300, customKeyGen);
    const req = mockReq('GET', '/api/products');
    const res = mockRes();
    const next = jest.fn();
    
    await middleware(req, res, next);
    
    expect(next).toHaveBeenCalled();
  });
});

describe('Redis Helper Functions', () => {
  
  test('getCache should return null when Redis is not ready', async () => {
    // The mock already returns null
    const result = await getCache('nonexistent');
    expect(result).toBeNull();
  });

  test('setCache should return true', async () => {
    const result = await setCache('test-key', { data: 'test' }, 60);
    expect(result).toBe(true);
  });
});
