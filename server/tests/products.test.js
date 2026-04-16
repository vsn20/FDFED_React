// ============ PRODUCT CONTROLLER TESTS ============
// Tests for product listing, top products aggregation, and search
require('./setup');
const Product = require('../models/products');
const Sale = require('../models/sale');

const { getOurProducts } = require('../controllers/OurProductsController');
const { getTopProducts } = require('../controllers/TopProductsController');
const { searchProducts, autocomplete } = require('../controllers/searchController');

const mockReq = (query = {}) => ({ query });
const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Product Controllers', () => {

  describe('GET /api/ourproducts', () => {
    
    beforeEach(async () => {
      await Product.create([
        {
          prod_id: 'P001', Prod_name: 'Samsung TV 55"', Com_id: 'C001',
          Model_no: 'SM-TV55', com_name: 'Samsung', prod_year: '2025',
          stock: 10, Retail_price: 45000, Status: 'Accepted',
          prod_description: 'Smart TV with 4K resolution',
          warrantyperiod: '2 years', installation: 'Required'
        },
        {
          prod_id: 'P002', Prod_name: 'LG Washing Machine', Com_id: 'C002',
          Model_no: 'LG-WM01', com_name: 'LG', prod_year: '2024',
          stock: 5, Retail_price: 32000, Status: 'Accepted',
          prod_description: 'Front loading washing machine',
          warrantyperiod: '3 years', installation: 'Required'
        },
        {
          prod_id: 'P003', Prod_name: 'Rejected Product', Com_id: 'C003',
          Model_no: 'REJ-01', com_name: 'TestCo', prod_year: '2025',
          stock: 0, Retail_price: 10000, Status: 'Rejected',
          prod_description: 'This product was rejected',
          warrantyperiod: '1 year', installation: 'Not Required'
        }
      ]);
    });

    test('should return only accepted products', async () => {
      const req = mockReq();
      const res = mockRes();
      
      await getOurProducts(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.any(Array)
        })
      );
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data).toHaveLength(2);
      expect(responseData.data.every(p => p.Status === 'Accepted')).toBe(true);
    });

    test('should return empty array when no accepted products', async () => {
      await Product.deleteMany({ Status: 'Accepted' });
      
      const req = mockReq();
      const res = mockRes();
      
      await getOurProducts(req, res);
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data).toHaveLength(0);
    });
  });

  describe('GET /api/topproducts (Aggregation Pipeline)', () => {
    
    beforeEach(async () => {
      // Create a product with good ratings
      await Product.create({
        prod_id: 'P-TOP', Prod_name: 'Top Rated AC', Com_id: 'C001',
        Model_no: 'AC-01', com_name: 'Daikin', prod_year: '2025',
        stock: 20, Retail_price: 55000, Status: 'Accepted',
        prod_description: 'Split AC 1.5 ton inverter',
        warrantyperiod: '5 years', installation: 'Required'
      });

      // Create 5 sales with high ratings (this product qualifies: sales >= 4, rating >= 4)
      for (let i = 1; i <= 5; i++) {
        await Sale.create({
          sales_id: `SALE-${i}`, branch_id: 'B001', salesman_id: 'EMP001',
          company_id: 'C001', product_id: 'P-TOP',
          customer_name: `Customer ${i}`, sales_date: new Date(),
          unique_code: `UC-${i}`, purchased_price: 40000, sold_price: 55000,
          quantity: 1, amount: 55000, profit_or_loss: 15000,
          phone_number: `+919900000${i}0`, installation: 'Required',
          rating: i === 1 ? 5 : 4 // All ratings >= 4
        });
      }

      // Create a product with low ratings (should NOT appear)
      await Product.create({
        prod_id: 'P-LOW', Prod_name: 'Low Rated Fan', Com_id: 'C002',
        Model_no: 'FAN-01', com_name: 'Orient', prod_year: '2024',
        stock: 50, Retail_price: 2000, Status: 'Accepted',
        prod_description: 'Ceiling fan',
        warrantyperiod: '1 year', installation: 'Not Required'
      });

      for (let i = 1; i <= 5; i++) {
        await Sale.create({
          sales_id: `SALE-LOW-${i}`, branch_id: 'B001', salesman_id: 'EMP001',
          company_id: 'C002', product_id: 'P-LOW',
          customer_name: `Customer ${i}`, sales_date: new Date(),
          unique_code: `UC-LOW-${i}`, purchased_price: 1500, sold_price: 2000,
          quantity: 1, amount: 2000, profit_or_loss: 500,
          phone_number: `+919800000${i}0`, installation: 'Not Required',
          rating: 2 // Low rating
        });
      }
    });

    test('should return only products with sales >= 4 and rating >= 4', async () => {
      const req = mockReq();
      const res = mockRes();
      
      await getTopProducts(req, res);
      
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.data.length).toBeGreaterThanOrEqual(1);
      
      // All returned products should have good ratings
      responseData.data.forEach(product => {
        expect(product.averageRating).toBeGreaterThanOrEqual(4);
        expect(product.salesCount).toBeGreaterThanOrEqual(4);
      });
    });

    test('should not include low-rated products', async () => {
      const req = mockReq();
      const res = mockRes();
      
      await getTopProducts(req, res);
      
      const responseData = res.json.mock.calls[0][0];
      const lowRatedProduct = responseData.data.find(p => p.prod_id === 'P-LOW');
      expect(lowRatedProduct).toBeUndefined();
    });
  });

  describe('GET /api/search', () => {
    
    beforeEach(async () => {
      await Product.create([
        {
          prod_id: 'P-SEARCH1', Prod_name: 'Samsung Galaxy Phone', Com_id: 'C001',
          Model_no: 'SG-001', com_name: 'Samsung Electronics', prod_year: '2025',
          stock: 100, Retail_price: 75000, Status: 'Accepted',
          prod_description: 'Latest smartphone with AI camera',
          warrantyperiod: '1 year', installation: 'Not Required'
        },
        {
          prod_id: 'P-SEARCH2', Prod_name: 'Sony Bravia TV', Com_id: 'C002',
          Model_no: 'SB-001', com_name: 'Sony', prod_year: '2025',
          stock: 30, Retail_price: 89000, Status: 'Accepted',
          prod_description: 'OLED TV with surround sound',
          warrantyperiod: '2 years', installation: 'Required'
        }
      ]);
      
      // Ensure text index is built
      await Product.ensureIndexes();
    });

    test('should return 400 when no query provided', async () => {
      const req = mockReq({});
      const res = mockRes();
      
      await searchProducts(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
    });

    test('should find products matching search query', async () => {
      const req = mockReq({ q: 'Samsung', page: '1', limit: '10' });
      const res = mockRes();
      
      await searchProducts(req, res);
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data.length).toBeGreaterThanOrEqual(1);
      expect(responseData.pagination).toBeDefined();
    });

    test('should return empty for non-matching query', async () => {
      const req = mockReq({ q: 'xyznonexistent', page: '1', limit: '10' });
      const res = mockRes();
      
      await searchProducts(req, res);
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.data).toHaveLength(0);
    });
  });

  describe('GET /api/search/autocomplete', () => {
    
    beforeEach(async () => {
      await Product.create({
        prod_id: 'P-AUTO1', Prod_name: 'Whirlpool Fridge', Com_id: 'C003',
        Model_no: 'WP-FR1', com_name: 'Whirlpool', prod_year: '2025',
        stock: 15, Retail_price: 28000, Status: 'Accepted',
        prod_description: 'Double door refrigerator',
        warrantyperiod: '10 years', installation: 'Required'
      });
    });

    test('should return empty for queries shorter than 2 chars', async () => {
      const req = mockReq({ q: 'W' });
      const res = mockRes();
      
      await autocomplete(req, res);
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.suggestions).toHaveLength(0);
    });

    test('should return suggestions for valid query', async () => {
      const req = mockReq({ q: 'Whir' });
      const res = mockRes();
      
      await autocomplete(req, res);
      
      const responseData = res.json.mock.calls[0][0];
      expect(responseData.success).toBe(true);
      expect(responseData.suggestions.length).toBeGreaterThanOrEqual(1);
      expect(responseData.suggestions[0]).toHaveProperty('name');
      expect(responseData.suggestions[0]).toHaveProperty('company');
    });
  });
});
