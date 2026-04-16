// ============ TEST SETUP ============
// Uses MongoDB Memory Server for isolated, fast testing
// Mocks Redis to avoid needing a live Redis instance during CI
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Start in-memory MongoDB before all tests
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Disconnect from any existing connection
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  
  await mongoose.connect(mongoUri);
  console.log('Connected to in-memory MongoDB for testing');
});

// Clear all collections between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

// Disconnect and stop in-memory MongoDB after all tests
afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

// Mock Redis module to avoid requiring a live Redis instance
jest.mock('../config/redis', () => ({
  initRedis: jest.fn(),
  getRedisClient: jest.fn(() => null),
  isRedisReady: jest.fn(() => false),
  getCache: jest.fn(async () => null),
  setCache: jest.fn(async () => true),
  invalidateCache: jest.fn(async () => {}),
  flushCache: jest.fn(async () => {})
}));
