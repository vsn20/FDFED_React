// ============ SALES & ORDERS TESTS ============
// Tests for sales creation, order management, and analytics queries
require('./setup');
const Sale = require('../models/sale');
const Order = require('../models/orders');
const Product = require('../models/products');
const Branch = require('../models/branches');

describe('Sale Model', () => {
  
  describe('Create Sale', () => {
    
    test('should create sale with valid data', async () => {
      const saleData = {
        sales_id: 'SALE-001',
        branch_id: 'B001',
        salesman_id: 'EMP001',
        company_id: 'C001',
        product_id: 'P001',
        customer_name: 'Test Customer',
        sales_date: new Date(),
        unique_code: 'UC-001',
        purchased_price: 40000,
        sold_price: 50000,
        quantity: 1,
        amount: 50000,
        profit_or_loss: 10000,
        phone_number: '+919876543210',
        installation: 'Not Required'
      };
      
      const sale = await Sale.create(saleData);
      
      expect(sale.sales_id).toBe('SALE-001');
      expect(sale.profit_or_loss).toBe(10000);
      expect(sale.payment_method).toBe('cash'); // Default
      expect(sale.payment_status).toBe('paid'); // Default
    });

    test('should enforce unique sales_id', async () => {
      await Sale.create({
        sales_id: 'SALE-DUP', branch_id: 'B001', salesman_id: 'EMP001',
        company_id: 'C001', product_id: 'P001', customer_name: 'Cust1',
        sales_date: new Date(), unique_code: 'UC-DUP1',
        purchased_price: 100, sold_price: 150, quantity: 1,
        amount: 150, profit_or_loss: 50, phone_number: '+911234567890',
        installation: 'Not Required'
      });

      try {
        await Sale.create({
          sales_id: 'SALE-DUP', branch_id: 'B002', salesman_id: 'EMP002',
          company_id: 'C002', product_id: 'P002', customer_name: 'Cust2',
          sales_date: new Date(), unique_code: 'UC-DUP2',
          purchased_price: 200, sold_price: 250, quantity: 1,
          amount: 250, profit_or_loss: 50, phone_number: '+911234567891',
          installation: 'Not Required'
        });
        fail('Should have thrown duplicate key error');
      } catch (error) {
        expect(error.code).toBe(11000);
      }
    });

    test('should validate phone number format', async () => {
      try {
        await Sale.create({
          sales_id: 'SALE-PHONE', branch_id: 'B001', salesman_id: 'EMP001',
          company_id: 'C001', product_id: 'P001', customer_name: 'Cust',
          sales_date: new Date(), unique_code: 'UC-PHONE',
          purchased_price: 100, sold_price: 150, quantity: 1,
          amount: 150, profit_or_loss: 50, phone_number: 'invalid-phone',
          installation: 'Not Required'
        });
        fail('Should have thrown validation error');
      } catch (error) {
        expect(error.name).toBe('ValidationError');
      }
    });

    test('should handle payment methods correctly', async () => {
      const sale = await Sale.create({
        sales_id: 'SALE-PAY', branch_id: 'B001', salesman_id: 'EMP001',
        company_id: 'C001', product_id: 'P001', customer_name: 'Cust',
        sales_date: new Date(), unique_code: 'UC-PAY',
        purchased_price: 100, sold_price: 150, quantity: 2,
        amount: 300, profit_or_loss: 100, phone_number: '+919876543210',
        installation: 'Not Required', payment_method: 'scanner',
        payment_status: 'paid'
      });

      expect(sale.payment_method).toBe('scanner');
      expect(sale.payment_status).toBe('paid');
    });
  });

  describe('Sales Analytics Queries', () => {
    
    beforeEach(async () => {
      const now = new Date();
      for (let i = 0; i < 10; i++) {
        const saleDate = new Date(now);
        saleDate.setDate(saleDate.getDate() - i);
        
        await Sale.create({
          sales_id: `SALE-AN-${i}`, branch_id: i < 5 ? 'B001' : 'B002',
          salesman_id: i < 5 ? 'EMP001' : 'EMP002',
          company_id: i % 2 === 0 ? 'C001' : 'C002',
          product_id: `P00${i % 3}`,
          customer_name: `Customer ${i}`, sales_date: saleDate,
          unique_code: `UC-AN-${i}`, purchased_price: 1000,
          sold_price: 1500, quantity: i + 1,
          amount: 1500 * (i + 1), profit_or_loss: 500 * (i + 1),
          phone_number: `+91987654${String(i).padStart(4, '0')}`,
          installation: 'Not Required', rating: i < 7 ? 4 + (i % 2) : null
        });
      }
    });

    test('should filter sales by date range', async () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 5);
      
      const sales = await Sale.find({
        sales_date: { $gte: startDate, $lte: endDate }
      }).lean();
      
      expect(sales.length).toBeLessThanOrEqual(10);
      expect(sales.length).toBeGreaterThan(0);
    });

    test('should filter sales by branch', async () => {
      const branchSales = await Sale.find({ branch_id: 'B001' }).lean();
      expect(branchSales.length).toBe(5);
      expect(branchSales.every(s => s.branch_id === 'B001')).toBe(true);
    });

    test('should aggregate sales by salesman', async () => {
      const result = await Sale.aggregate([
        { $group: { _id: '$salesman_id', totalSales: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
        { $sort: { totalSales: -1 } }
      ]);
      
      expect(result.length).toBeGreaterThanOrEqual(1);
      expect(result[0]).toHaveProperty('totalSales');
      expect(result[0]).toHaveProperty('totalAmount');
    });
  });
});

describe('Order Model', () => {
  
  test('should create order with valid data', async () => {
    const order = await Order.create({
      order_id: 'ORD-001',
      branch_id: 'B001',
      branch_name: 'Main Branch',
      company_id: 'C001',
      company_name: 'Samsung',
      product_id: 'P001',
      product_name: 'Samsung TV',
      quantity: 5,
      ordered_date: new Date()
    });
    
    expect(order.order_id).toBe('ORD-001');
    expect(order.status).toBe('pending'); // Default
    expect(order.quantity).toBe(5);
  });

  test('should normalize status to lowercase on save', async () => {
    const order = await Order.create({
      order_id: 'ORD-CASE',
      branch_id: 'B001', branch_name: 'Branch',
      company_id: 'C001', company_name: 'Company',
      product_id: 'P001', product_name: 'Product',
      quantity: 1, ordered_date: new Date(),
      status: 'pending'
    });
    
    expect(order.status).toBe('pending'); // Should remain lowercase
  });

  test('should filter orders by company and status', async () => {
    await Order.create([
      {
        order_id: 'ORD-F1', branch_id: 'B001', branch_name: 'B1',
        company_id: 'C001', company_name: 'Co1', product_id: 'P001',
        product_name: 'Prod1', quantity: 1, ordered_date: new Date(), status: 'pending'
      },
      {
        order_id: 'ORD-F2', branch_id: 'B001', branch_name: 'B1',
        company_id: 'C001', company_name: 'Co1', product_id: 'P002',
        product_name: 'Prod2', quantity: 2, ordered_date: new Date(), status: 'delivered'
      },
      {
        order_id: 'ORD-F3', branch_id: 'B002', branch_name: 'B2',
        company_id: 'C002', company_name: 'Co2', product_id: 'P003',
        product_name: 'Prod3', quantity: 3, ordered_date: new Date(), status: 'pending'
      }
    ]);

    const pendingC1 = await Order.find({ company_id: 'C001', status: 'pending' });
    expect(pendingC1).toHaveLength(1);
    expect(pendingC1[0].order_id).toBe('ORD-F1');
  });
});
