// ============ AUTH CONTROLLER TESTS ============
// Tests for employee signup, login, and edge cases
require('./setup');
const mongoose = require('mongoose');
const User = require('../models/User');
const Employee = require('../models/employees');

// Import the controller functions directly
const { signup, login } = require('../controllers/authController');

// Helper to create mock req/res objects
const mockReq = (body = {}, headers = {}) => ({
  body,
  headers
});

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

// Set JWT_SECRET for tests
process.env.JWT_SECRET = 'test_secret_key_for_jest';

describe('Auth Controller', () => {
  
  describe('POST /api/auth/signup', () => {
    
    beforeEach(async () => {
      // Seed an employee for signup tests
      await Employee.create({
        e_id: 'EMP001',
        f_name: 'John',
        last_name: 'Doe',
        role: 'manager',
        email: 'john@test.com',
        acno: '1234567890',
        ifsc: 'IFSC0001',
        bankname: 'Test Bank',
        base_salary: 50000,
        createdBy: 'admin'
      });
    });

    test('should fail with missing fields', async () => {
      const req = mockReq({ userId: 'user1' }); // Missing other fields
      const res = mockRes();
      
      await signup(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('Please enter all fields') })
      );
    });

    test('should fail when passwords do not match', async () => {
      const req = mockReq({
        userId: 'user1',
        email: 'john@test.com',
        password: 'password123',
        confirmPassword: 'different123'
      });
      const res = mockRes();
      
      await signup(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Passwords do not match.' })
      );
    });

    test('should fail when email is not registered as employee', async () => {
      const req = mockReq({
        userId: 'user1',
        email: 'notregistered@test.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
      const res = mockRes();
      
      await signup(req, res);
      
      expect(res.status).toHaveBeenCalledWith(404);
    });

    test('should successfully signup with valid data', async () => {
      const req = mockReq({
        userId: 'user1',
        email: 'john@test.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
      const res = mockRes();
      
      // jwt.sign uses a callback, so we need to wait for it
      await new Promise((resolve) => {
        res.json = jest.fn().mockImplementation(() => { resolve(); return res; });
        signup(req, res);
      });
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            id: 'user1',
            role: 'manager',
            name: 'John'
          })
        })
      );
    });

    test('should fail with duplicate userId', async () => {
      // Create user first
      await User.create({ userId: 'user1', emp_id: 'EMP001', password: 'password123' });
      
      const req = mockReq({
        userId: 'user1',
        email: 'john@test.com',
        password: 'password123',
        confirmPassword: 'password123'
      });
      const res = mockRes();
      
      await signup(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'User ID already taken.' })
      );
    });
  });

  describe('POST /api/auth/login', () => {
    
    beforeEach(async () => {
      // Seed employee and user
      await Employee.create({
        e_id: 'EMP002',
        f_name: 'Jane',
        last_name: 'Smith',
        role: 'salesman',
        email: 'jane@test.com',
        acno: '0987654321',
        ifsc: 'IFSC0002',
        bankname: 'Test Bank',
        base_salary: 30000,
        status: 'active',
        createdBy: 'admin'
      });
      
      await User.create({
        userId: 'jane_user',
        emp_id: 'EMP002',
        password: 'securepass'
      });
    });

    test('should fail with missing credentials', async () => {
      const req = mockReq({ userId: 'jane_user' }); // Missing password
      const res = mockRes();
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should fail with invalid userId', async () => {
      const req = mockReq({ userId: 'nonexistent', password: 'securepass' });
      const res = mockRes();
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('should fail with wrong password', async () => {
      const req = mockReq({ userId: 'jane_user', password: 'wrongpass' });
      const res = mockRes();
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('should successfully login with valid credentials', async () => {
      const req = mockReq({ userId: 'jane_user', password: 'securepass' });
      const res = mockRes();
      
      // jwt.sign uses a callback, so we need to wait for it
      await new Promise((resolve) => {
        res.json = jest.fn().mockImplementation(() => { resolve(); return res; });
        login(req, res);
      });
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          token: expect.any(String),
          user: expect.objectContaining({
            id: 'jane_user',
            role: 'salesman',
            name: 'Jane'
          })
        })
      );
    });

    test('should fail for resigned employee', async () => {
      // Mark employee as resigned
      await Employee.updateOne({ e_id: 'EMP002' }, { status: 'resigned' });
      
      const req = mockReq({ userId: 'jane_user', password: 'securepass' });
      const res = mockRes();
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });

    test('should fail for fired employee', async () => {
      await Employee.updateOne({ e_id: 'EMP002' }, { status: 'fired' });
      
      const req = mockReq({ userId: 'jane_user', password: 'securepass' });
      const res = mockRes();
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(403);
    });
  });
});
