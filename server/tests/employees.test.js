// ============ EMPLOYEE CONTROLLER TESTS ============
// Tests for employee CRUD operations and access control
require('./setup');
const Employee = require('../models/employees');

// Test the Employee model directly (unit tests)
describe('Employee Model', () => {
  
  describe('Create Employee', () => {
    
    test('should create employee with valid data', async () => {
      const empData = {
        e_id: 'EMP-TEST-001',
        f_name: 'Test',
        last_name: 'Employee',
        role: 'salesman',
        email: 'test.emp@test.com',
        acno: '1111111111',
        ifsc: 'IFSC0001',
        bankname: 'Test Bank',
        base_salary: 25000,
        createdBy: 'admin'
      };
      
      const employee = await Employee.create(empData);
      
      expect(employee.e_id).toBe('EMP-TEST-001');
      expect(employee.f_name).toBe('Test');
      expect(employee.role).toBe('salesman');
      expect(employee.status).toBe('active'); // Default status
    });

    test('should fail without required fields', async () => {
      try {
        await Employee.create({ e_id: 'EMP-FAIL' }); // Missing required fields
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error).toBeDefined();
        expect(error.name).toBe('ValidationError');
      }
    });

    test('should fail with invalid role', async () => {
      try {
        await Employee.create({
          e_id: 'EMP-ROLE', f_name: 'Bad', last_name: 'Role',
          role: 'invalid_role', email: 'bad@test.com',
          acno: '1234', ifsc: 'IFSC0001', bankname: 'Bank',
          base_salary: 20000, createdBy: 'admin'
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
      }
    });

    test('should enforce unique e_id', async () => {
      await Employee.create({
        e_id: 'EMP-DUP', f_name: 'First', last_name: 'Emp',
        role: 'manager', email: 'first@test.com',
        acno: '1111', ifsc: 'IFSC0001', bankname: 'Bank',
        base_salary: 40000, createdBy: 'admin'
      });

      try {
        await Employee.create({
          e_id: 'EMP-DUP', f_name: 'Second', last_name: 'Emp',
          role: 'salesman', email: 'second@test.com',
          acno: '2222', ifsc: 'IFSC0002', bankname: 'Bank2',
          base_salary: 30000, createdBy: 'admin'
        });
        fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.code).toBe(11000); // MongoDB duplicate key error
      }
    });

    test('should enforce unique email', async () => {
      await Employee.create({
        e_id: 'EMP-EMAIL1', f_name: 'Email', last_name: 'Test1',
        role: 'owner', email: 'unique@test.com',
        acno: '3333', ifsc: 'IFSC0003', bankname: 'Bank',
        base_salary: 60000, createdBy: 'admin'
      });

      try {
        await Employee.create({
          e_id: 'EMP-EMAIL2', f_name: 'Email', last_name: 'Test2',
          role: 'manager', email: 'unique@test.com', // Same email
          acno: '4444', ifsc: 'IFSC0004', bankname: 'Bank',
          base_salary: 50000, createdBy: 'admin'
        });
        fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.code).toBe(11000);
      }
    });
  });

  describe('Employee Status Updates', () => {
    
    beforeEach(async () => {
      await Employee.create({
        e_id: 'EMP-STATUS', f_name: 'Status', last_name: 'Test',
        role: 'salesman', email: 'status@test.com',
        acno: '5555', ifsc: 'IFSC0005', bankname: 'Bank',
        base_salary: 30000, createdBy: 'admin'
      });
    });

    test('should update to resigned status', async () => {
      const result = await Employee.findOneAndUpdate(
        { e_id: 'EMP-STATUS' },
        { status: 'resigned', resignation_date: new Date(), reason_for_exit: 'Personal reasons' },
        { new: true }
      );
      
      expect(result.status).toBe('resigned');
      expect(result.resignation_date).toBeDefined();
      expect(result.reason_for_exit).toBe('Personal reasons');
    });

    test('should update to fired status', async () => {
      const result = await Employee.findOneAndUpdate(
        { e_id: 'EMP-STATUS' },
        { status: 'fired', fired_date: new Date() },
        { new: true }
      );
      
      expect(result.status).toBe('fired');
      expect(result.fired_date).toBeDefined();
    });

    test('should filter by role and status', async () => {
      await Employee.create({
        e_id: 'EMP-ACTIVE', f_name: 'Active', last_name: 'Sales',
        role: 'salesman', email: 'active@test.com', status: 'active',
        acno: '6666', ifsc: 'IFSC0006', bankname: 'Bank',
        base_salary: 25000, createdBy: 'admin'
      });
      
      const activeSalesmen = await Employee.find({ role: 'salesman', status: 'active' });
      expect(activeSalesmen.length).toBeGreaterThanOrEqual(1);
      expect(activeSalesmen.every(e => e.role === 'salesman' && e.status === 'active')).toBe(true);
    });
  });

  describe('Phone Number Validation', () => {
    
    test('should accept valid 10-digit phone', async () => {
      const emp = await Employee.create({
        e_id: 'EMP-PHONE1', f_name: 'Phone', last_name: 'Test',
        role: 'manager', email: 'phone1@test.com',
        phone_no: '9876543210',
        acno: '7777', ifsc: 'IFSC0007', bankname: 'Bank',
        base_salary: 40000, createdBy: 'admin'
      });
      
      expect(emp.phone_no).toBe('9876543210');
    });

    test('should reject invalid phone number', async () => {
      try {
        await Employee.create({
          e_id: 'EMP-PHONE2', f_name: 'Phone', last_name: 'Bad',
          role: 'manager', email: 'phone2@test.com',
          phone_no: '123', // Invalid - too short
          acno: '8888', ifsc: 'IFSC0008', bankname: 'Bank',
          base_salary: 40000, createdBy: 'admin'
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
      }
    });
  });
});
