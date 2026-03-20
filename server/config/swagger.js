const swaggerJsdoc = require('swagger-jsdoc');

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'FDFED Backend API',
    version: '1.0.0',
    description: 'Interactive API documentation for FDFED backend.'
  },
  servers: [
    {
      url: 'http://localhost:5001',
      description: 'Local development server'
    }
  ],
  tags: [
    { name: 'Auth - Employee' },
    { name: 'Auth - Company' },
    { name: 'Auth - Customer' },
    { name: 'Auth - OTP' },
    { name: 'Owner - Companies' },
    { name: 'Owner - Branches' },
    { name: 'Owner - Employees' },
    { name: 'Owner - Products' },
    { name: 'Owner - Sales' },
    { name: 'Owner - Orders' },
    { name: 'Owner - Inventory' },
    { name: 'Owner - Salaries' },
    { name: 'Owner - Profits' },
    { name: 'Owner - Analytics' },
    { name: 'Owner - Messages' },
    { name: 'Manager - Employees' },
    { name: 'Manager - Orders' },
    { name: 'Manager - Sales' },
    { name: 'Manager - Inventory' },
    { name: 'Manager - Salary' },
    { name: 'Manager - Analytics' },
    { name: 'Manager - Messages' },
    { name: 'Salesman - Profile' },
    { name: 'Salesman - Sales' },
    { name: 'Salesman - Inventory' },
    { name: 'Salesman - Salary' },
    { name: 'Salesman - Analytics' },
    { name: 'Salesman - Messages' },
    { name: 'Company - Products' },
    { name: 'Company - Orders' },
    { name: 'Company - Sales' },
    { name: 'Company - Complaints' },
    { name: 'Company - Messaging' },
    { name: 'Company - Analytics' },
    { name: 'Customer - Purchases' },
    { name: 'Customer - Complaints' },
    { name: 'Customer - Reviews' },
    { name: 'Customer - Blogs' },
    { name: 'Public' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter the JWT token you received from login. Example: eyJhbGciOiJIUzI1NiIs...'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean', nullable: true },
          message: { type: 'string', nullable: true },
          error: { type: 'string', nullable: true }
        },
        additionalProperties: true
      },
      AuthUser: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          role: { type: 'string' },
          name: { type: 'string' },
          c_id: { type: 'string', nullable: true },
          phone: { type: 'string', nullable: true }
        }
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: { $ref: '#/components/schemas/AuthUser' }
        }
      },
      Company: {
        type: 'object',
        properties: {
          c_id: { type: 'string' },
          cname: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          address: { type: 'string' },
          active: { type: 'string', enum: ['active', 'inactive'] }
        },
        additionalProperties: true
      },
      Employee: {
        type: 'object',
        properties: {
          e_id: { type: 'string' },
          f_name: { type: 'string' },
          last_name: { type: 'string' },
          role: { type: 'string' },
          status: { type: 'string' },
          bid: { type: 'string', nullable: true },
          email: { type: 'string', format: 'email' },
          phone_no: { type: 'string', nullable: true },
          address: { type: 'string', nullable: true }
        },
        additionalProperties: true
      },
      Product: {
        type: 'object',
        properties: {
          prod_id: { type: 'string' },
          Prod_name: { type: 'string' },
          Com_id: { type: 'string' },
          Model_no: { type: 'string' },
          Retail_price: { type: 'number', nullable: true },
          Status: { type: 'string', enum: ['Hold', 'Accepted', 'Rejected'] },
          stockavailability: { type: 'string', nullable: true },
          approvedAt: { type: 'string', format: 'date-time', nullable: true }
        },
        additionalProperties: true
      },
      Order: {
        type: 'object',
        properties: {
          order_id: { type: 'string' },
          branch_id: { type: 'string', nullable: true },
          branch_name: { type: 'string' },
          company_id: { type: 'string' },
          company_name: { type: 'string' },
          product_id: { type: 'string' },
          product_name: { type: 'string' },
          quantity: { type: 'number' },
          ordered_date: { type: 'string', format: 'date-time' },
          status: { type: 'string' }
        },
        additionalProperties: true
      },
      Complaint: {
        type: 'object',
        properties: {
          complaint_id: { type: 'string' },
          sale_id: { type: 'string' },
          product_id: { type: 'string' },
          company_id: { type: 'string' },
          complaint_info: { type: 'string' },
          status: { type: 'string' },
          complaint_date: { type: 'string', format: 'date-time' }
        },
        additionalProperties: true
      }
    }
  },
  paths: {
    // ======= AUTH - EMPLOYEE =======
    '/api/auth/signup': {
      post: {
        tags: ['Auth - Employee'],
        summary: 'Register employee user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'email', 'password', 'confirmPassword'],
                properties: {
                  userId: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 6 },
                  confirmPassword: { type: 'string', minLength: 6 }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Signup successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
          }
        }
      }
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth - Employee'],
        summary: 'Login as employee/owner/manager/salesman user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'password'],
                properties: {
                  userId: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Login successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
          }
        }
      }
    },

    // ======= AUTH - COMPANY =======
    '/api/auth/company/signup': {
      post: {
        tags: ['Auth - Company'],
        summary: 'Register company user account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'email', 'password', 'confirm_password'],
                properties: {
                  userId: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string' },
                  confirm_password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Company signup successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
          }
        }
      }
    },
    '/api/auth/company/login': {
      post: {
        tags: ['Auth - Company'],
        summary: 'Login as company user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['userId', 'password'],
                properties: {
                  userId: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Company login successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
          }
        }
      }
    },

    // ======= AUTH - CUSTOMER =======
    '/api/auth/customer/login': {
      post: {
        tags: ['Auth - Customer'],
        summary: 'Login customer using mobile number',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['mobileNumber'],
                properties: {
                  mobileNumber: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Customer login successful',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } }
          }
        }
      }
    },

    // ======= AUTH - OTP =======
    '/api/forgot-password/send-otp': {
      post: {
        tags: ['Auth - OTP'],
        summary: 'Send password reset OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'type'],
                properties: {
                  identifier: { type: 'string', description: 'User ID or email' },
                  type: { type: 'string', enum: ['user_id', 'email'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'OTP sent successfully' }
        }
      }
    },
    '/api/forgot-password/reset': {
      post: {
        tags: ['Auth - OTP'],
        summary: 'Reset password using OTP',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['identifier', 'type', 'otp', 'newPassword', 'confirmPassword'],
                properties: {
                  identifier: { type: 'string' },
                  type: { type: 'string', enum: ['user_id', 'email'] },
                  otp: { type: 'string' },
                  newPassword: { type: 'string' },
                  confirmPassword: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Password reset successful' }
        }
      }
    },

    // ======= OWNER - COMPANIES =======
    '/api/companies': {
      get: {
        tags: ['Owner - Companies'],
        summary: 'Get all companies',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'List of companies',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Company' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Owner - Companies'],
        summary: 'Create company',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['cname', 'address', 'email', 'phone'],
                properties: {
                  cname: { type: 'string' },
                  address: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Company created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Company' } } }
          }
        }
      }
    },
    '/api/companies/{id}': {
      get: {
        tags: ['Owner - Companies'],
        summary: 'Get one company by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Company details',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Company' } } }
          }
        }
      },
      put: {
        tags: ['Owner - Companies'],
        summary: 'Update company by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  cname: { type: 'string' },
                  address: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: 'Updated company',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Company' } } }
          }
        }
      }
    },

    // ======= OWNER - EMPLOYEES =======
    '/api/employees': {
      get: {
        tags: ['Owner - Employees'],
        summary: 'Get all employees',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Employees list',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Employee' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Owner - Employees'],
        summary: 'Create employee',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['f_name', 'last_name', 'role', 'email', 'acno', 'ifsc', 'bankname', 'base_salary'],
                properties: {
                  f_name: { type: 'string' },
                  last_name: { type: 'string' },
                  role: { type: 'string', enum: ['manager', 'salesman', 'admin'] },
                  bid: { type: 'string', nullable: true },
                  email: { type: 'string', format: 'email' },
                  phone_no: { type: 'string', nullable: true },
                  acno: { type: 'string' },
                  ifsc: { type: 'string' },
                  bankname: { type: 'string' },
                  base_salary: { type: 'number' },
                  address: { type: 'string', nullable: true }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Employee created' }
        }
      }
    },
    '/api/employees/{e_id}': {
      get: {
        tags: ['Owner - Employees'],
        summary: 'Get employee by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'e_id', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Employee details',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Employee' } } }
          }
        }
      },
      put: {
        tags: ['Owner - Employees'],
        summary: 'Update employee by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'e_id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  f_name: { type: 'string' },
                  last_name: { type: 'string' },
                  role: { type: 'string' },
                  bid: { type: 'string', nullable: true },
                  email: { type: 'string', format: 'email' },
                  phone_no: { type: 'string', nullable: true },
                  acno: { type: 'string' },
                  ifsc: { type: 'string' },
                  bankname: { type: 'string' },
                  base_salary: { type: 'number' },
                  address: { type: 'string', nullable: true },
                  status: { type: 'string', enum: ['active', 'resigned', 'fired'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Employee updated' }
        }
      }
    },

    // ======= OWNER - PRODUCTS =======
    '/api/owner/products/new': {
      get: {
        tags: ['Owner - Products'],
        summary: 'Get products in hold state for review',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Products awaiting review',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
              }
            }
          }
        }
      }
    },
    '/api/owner/products/{prod_id}/status': {
      put: {
        tags: ['Owner - Products'],
        summary: 'Update product status (accept/reject/hold)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'prod_id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['Accepted', 'Rejected', 'Hold'] },
                  rejection_reason: { type: 'string', nullable: true }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Product status updated' }
        }
      }
    },

    // ======= OWNER - BRANCHES =======
    '/api/branches': {
      get: {
        tags: ['Owner - Branches'],
        summary: 'Get all branches',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Branches list' } }
      },
      post: {
        tags: ['Owner - Branches'],
        summary: 'Create a new branch',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['branch_name', 'location'],
                properties: {
                  branch_name: { type: 'string' },
                  location: { type: 'string' },
                  manager_id: { type: 'string', nullable: true }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Branch created' } }
      }
    },
    '/api/branches/{bid}': {
      get: {
        tags: ['Owner - Branches'],
        summary: 'Get single branch by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'bid', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Branch details' } }
      },
      put: {
        tags: ['Owner - Branches'],
        summary: 'Update branch by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'bid', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  branch_name: { type: 'string' },
                  location: { type: 'string' },
                  manager_id: { type: 'string', nullable: true }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Branch updated' } }
      }
    },

    // ======= OWNER - PRODUCTS (additional) =======
    '/api/owner/products/accepted': {
      get: {
        tags: ['Owner - Products'],
        summary: 'Get all accepted products',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Accepted products list' } }
      }
    },
    '/api/owner/products/rejected': {
      get: {
        tags: ['Owner - Products'],
        summary: 'Get all rejected products',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Rejected products list' } }
      }
    },
    '/api/owner/products/{prod_id}': {
      get: {
        tags: ['Owner - Products'],
        summary: 'Get product details by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'prod_id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product details' } }
      }
    },

    // ======= OWNER - SALES =======
    '/api/owner/sales': {
      get: {
        tags: ['Owner - Sales'],
        summary: 'Get all sales',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Sales list' } }
      }
    },
    '/api/owner/sales/{id}': {
      get: {
        tags: ['Owner - Sales'],
        summary: 'Get sale by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Sale details' } }
      }
    },

    // ======= OWNER - ORDERS =======
    '/api/owner/orders': {
      get: {
        tags: ['Owner - Orders'],
        summary: 'Get all orders',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Orders list' } }
      }
    },
    '/api/owner/orders/branches': {
      get: {
        tags: ['Owner - Orders'],
        summary: 'Get branches for order filter',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Branches for filter' } }
      }
    },
    '/api/owner/orders/{id}': {
      get: {
        tags: ['Owner - Orders'],
        summary: 'Get order by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Order details' } }
      }
    },

    // ======= OWNER - INVENTORY =======
    '/api/owner/inventory': {
      get: {
        tags: ['Owner - Inventory'],
        summary: 'Get all inventory',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Inventory list' } }
      }
    },
    '/api/owner/inventory/branches': {
      get: {
        tags: ['Owner - Inventory'],
        summary: 'Get branches for inventory filter',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Branches for filter' } }
      }
    },

    // ======= OWNER - SALARIES =======
    '/api/owner/salaries': {
      get: {
        tags: ['Owner - Salaries'],
        summary: 'Get all employee salaries',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Salaries list' } }
      }
    },
    '/api/owner/salaries/branches': {
      get: {
        tags: ['Owner - Salaries'],
        summary: 'Get branches for salary filter',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Branches for filter' } }
      }
    },

    // ======= OWNER - PROFITS =======
    '/api/owner/profits': {
      get: {
        tags: ['Owner - Profits'],
        summary: 'Get monthly profits',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Monthly profits data' } }
      }
    },

    // ======= OWNER - ANALYTICS =======
    '/api/owner/analytics/data': {
      get: {
        tags: ['Owner - Analytics'],
        summary: 'Get owner dashboard data',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Dashboard data' } }
      }
    },
    '/api/owner/analytics/salesman-performance': {
      get: {
        tags: ['Owner - Analytics'],
        summary: 'Get salesman performance data',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'month', schema: { type: 'string' }, description: 'Format: YYYY-MM' }],
        responses: { 200: { description: 'Salesman performance' } }
      }
    },
    '/api/owner/analytics/branch-sales': {
      get: {
        tags: ['Owner - Analytics'],
        summary: 'Get branch-wise sales data',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'month', schema: { type: 'string' }, description: 'Format: YYYY-MM' }],
        responses: { 200: { description: 'Branch sales data' } }
      }
    },
    '/api/owner/analytics/company-sales': {
      get: {
        tags: ['Owner - Analytics'],
        summary: 'Get company-wise sales data',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'month', schema: { type: 'string' }, description: 'Format: YYYY-MM' }],
        responses: { 200: { description: 'Company sales data' } }
      }
    },
    '/api/owner/analytics/product-sales': {
      get: {
        tags: ['Owner - Analytics'],
        summary: 'Get product-wise sales data',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'month', schema: { type: 'string' }, description: 'Format: YYYY-MM' },
          { in: 'query', name: 'company', schema: { type: 'string' } }
        ],
        responses: { 200: { description: 'Product sales data' } }
      }
    },

    // ======= OWNER - MESSAGES =======
    '/api/owner/messages/inbox': {
      get: {
        tags: ['Owner - Messages'],
        summary: 'Get owner inbox messages',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Inbox messages' } }
      }
    },
    '/api/owner/messages/sent': {
      get: {
        tags: ['Owner - Messages'],
        summary: 'Get owner sent messages',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Sent messages' } }
      }
    },
    '/api/owner/messages/options': {
      get: {
        tags: ['Owner - Messages'],
        summary: 'Get compose recipient options',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Recipient options' } }
      }
    },
    '/api/owner/messages/send': {
      post: {
        tags: ['Owner - Messages'],
        summary: 'Send message from owner',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['to', 'message'],
                properties: {
                  to: { type: 'string' },
                  subject: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Message sent' } }
      }
    },

    // ======= MANAGER - EMPLOYEES =======
    '/api/manager/employees': {
      get: {
        tags: ['Manager - Employees'],
        summary: 'Get branch employees',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Employees list' } }
      },
      post: {
        tags: ['Manager - Employees'],
        summary: 'Add salesman to branch',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['f_name', 'last_name', 'email'],
                properties: {
                  f_name: { type: 'string' },
                  last_name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  phone_no: { type: 'string', nullable: true }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Salesman added' } }
      }
    },
    '/api/manager/employees/me': {
      get: {
        tags: ['Manager - Employees'],
        summary: 'Get manager own profile',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Manager profile' } }
      },
      put: {
        tags: ['Manager - Employees'],
        summary: 'Update manager own profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  phone_no: { type: 'string' },
                  address: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Profile updated' } }
      }
    },
    '/api/manager/employees/{e_id}': {
      get: {
        tags: ['Manager - Employees'],
        summary: 'Get employee by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'e_id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Employee details' } }
      },
      put: {
        tags: ['Manager - Employees'],
        summary: 'Update employee by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'e_id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  f_name: { type: 'string' },
                  last_name: { type: 'string' },
                  phone_no: { type: 'string' },
                  address: { type: 'string' },
                  status: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Employee updated' } }
      }
    },

    // ======= MANAGER - ORDERS =======
    '/api/manager/orders': {
      get: {
        tags: ['Manager - Orders'],
        summary: 'Get manager branch orders',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Manager orders',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Order' } }
              }
            }
          }
        }
      },
      post: {
        tags: ['Manager - Orders'],
        summary: 'Create order for manager branch',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['branch_name', 'company_id', 'product_id', 'quantity', 'ordered_date'],
                properties: {
                  branch_name: { type: 'string' },
                  company_id: { type: 'string' },
                  product_id: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 },
                  ordered_date: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Order created' }
        }
      }
    },
    '/api/manager/orders/{id}': {
      get: {
        tags: ['Manager - Orders'],
        summary: 'Get manager order by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: {
          200: {
            description: 'Order details',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } }
          }
        }
      },
      put: {
        tags: ['Manager - Orders'],
        summary: 'Update manager order (cancel pending order)',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string', enum: ['cancelled'] }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Order updated' }
        }
      }
    },

    // ======= MANAGER - SALES =======
    '/api/manager/sales': {
      get: {
        tags: ['Manager - Sales'],
        summary: 'Get all branch sales',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Sales list' } }
      },
      post: {
        tags: ['Manager - Sales'],
        summary: 'Add a new sale',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['salesman_id', 'company_id', 'product_id', 'customer_name', 'customer_phone'],
                properties: {
                  salesman_id: { type: 'string' },
                  company_id: { type: 'string' },
                  product_id: { type: 'string' },
                  customer_name: { type: 'string' },
                  customer_phone: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Sale created' } }
      }
    },
    '/api/manager/sales/form-data/salesmen': {
      get: {
        tags: ['Manager - Sales'],
        summary: 'Get salesmen for sale form dropdown',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Salesmen list' } }
      }
    },
    '/api/manager/sales/form-data/companies': {
      get: {
        tags: ['Manager - Sales'],
        summary: 'Get companies for sale form dropdown',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Companies list' } }
      }
    },
    '/api/manager/sales/form-data/products/{companyId}': {
      get: {
        tags: ['Manager - Sales'],
        summary: 'Get products by company for sale form',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'companyId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Products list' } }
      }
    },
    '/api/manager/sales/{id}': {
      get: {
        tags: ['Manager - Sales'],
        summary: 'Get sale by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Sale details' } }
      },
      put: {
        tags: ['Manager - Sales'],
        summary: 'Update sale by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { type: 'object' } } }
        },
        responses: { 200: { description: 'Sale updated' } }
      }
    },

    // ======= MANAGER - INVENTORY =======
    '/api/manager/inventory': {
      get: {
        tags: ['Manager - Inventory'],
        summary: 'Get branch inventory',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Branch inventory list' } }
      }
    },

    // ======= MANAGER - SALARY =======
    '/api/manager/salary': {
      get: {
        tags: ['Manager - Salary'],
        summary: 'Get salaries by selected month',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'query', name: 'month', schema: { type: 'string' }, description: 'Format: YYYY-MM' }],
        responses: { 200: { description: 'Salaries for month' } }
      }
    },
    '/api/manager/salary/months': {
      get: {
        tags: ['Manager - Salary'],
        summary: 'Get available month options for salary filter',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Month options' } }
      }
    },

    // ======= MANAGER - ANALYTICS =======
    '/api/manager/analytics/dashboard-data': {
      get: {
        tags: ['Manager - Analytics'],
        summary: 'Get manager dashboard summary data',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Dashboard data' } }
      }
    },
    '/api/manager/analytics/profit-by-month': {
      get: {
        tags: ['Manager - Analytics'],
        summary: 'Get branch profit by month',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Monthly profit data' } }
      }
    },
    '/api/manager/analytics/overview': {
      get: {
        tags: ['Manager - Analytics'],
        summary: 'Get manager analytics overview',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Analytics overview' } }
      }
    },
    '/api/manager/analytics/salesman-performance': {
      get: {
        tags: ['Manager - Analytics'],
        summary: 'Get salesman performance for branch',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Salesman performance data' } }
      }
    },
    '/api/manager/analytics/company-sales': {
      get: {
        tags: ['Manager - Analytics'],
        summary: 'Get company-wise sales for branch',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Company sales data' } }
      }
    },
    '/api/manager/analytics/product-sales': {
      get: {
        tags: ['Manager - Analytics'],
        summary: 'Get product-wise sales for branch',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Product sales data' } }
      }
    },

    // ======= MANAGER - MESSAGES =======
    '/api/manager/messages/inbox': {
      get: {
        tags: ['Manager - Messages'],
        summary: 'Get manager inbox messages',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Inbox messages' } }
      }
    },
    '/api/manager/messages/sent': {
      get: {
        tags: ['Manager - Messages'],
        summary: 'Get manager sent messages',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Sent messages' } }
      }
    },
    '/api/manager/messages/recipients': {
      get: {
        tags: ['Manager - Messages'],
        summary: 'Get available recipients (companies and salesmen)',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Recipients list' } }
      }
    },
    '/api/manager/messages/send': {
      post: {
        tags: ['Manager - Messages'],
        summary: 'Send message from manager',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['to', 'message'],
                properties: {
                  to: { type: 'string' },
                  subject: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Message sent' } }
      }
    },

    // ======= SALESMAN - PROFILE =======
    '/api/salesman/profile': {
      get: {
        tags: ['Salesman - Profile'],
        summary: 'Get salesman profile details',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Salesman details' } }
      }
    },
    '/api/salesman/profile/update': {
      post: {
        tags: ['Salesman - Profile'],
        summary: 'Update salesman profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  phone_no: { type: 'string' },
                  address: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Profile updated' } }
      }
    },

    // ======= SALESMAN - SALES =======
    '/api/salesman/sales': {
      get: {
        tags: ['Salesman - Sales'],
        summary: 'Get all sales by salesman',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Sales list' } }
      },
      post: {
        tags: ['Salesman - Sales'],
        summary: 'Add a new sale',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['company_id', 'product_id', 'customer_name', 'customer_phone'],
                properties: {
                  company_id: { type: 'string' },
                  product_id: { type: 'string' },
                  customer_name: { type: 'string' },
                  customer_phone: { type: 'string' },
                  unique_code: { type: 'string' },
                  quantity: { type: 'integer', minimum: 1 }
                }
              }
            }
          }
        },
        responses: { 201: { description: 'Sale created' } }
      }
    },
    '/api/salesman/sales/helpers/companies': {
      get: {
        tags: ['Salesman - Sales'],
        summary: 'Get companies for sale form',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Companies list' } }
      }
    },
    '/api/salesman/sales/helpers/products-by-company/{companyId}': {
      get: {
        tags: ['Salesman - Sales'],
        summary: 'Get products by company',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'companyId', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Products list' } }
      }
    },
    '/api/salesman/sales/helpers/check-unique-code': {
      post: {
        tags: ['Salesman - Sales'],
        summary: 'Check if unique code is valid',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['unique_code'],
                properties: { unique_code: { type: 'string' } }
              }
            }
          }
        },
        responses: { 200: { description: 'Code validation result' } }
      }
    },
    '/api/salesman/sales/helpers/check-inventory': {
      post: {
        tags: ['Salesman - Sales'],
        summary: 'Check product inventory availability',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['product_id'],
                properties: {
                  product_id: { type: 'string' },
                  quantity: { type: 'integer' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Inventory check result' } }
      }
    },
    '/api/salesman/sales/{sales_id}': {
      get: {
        tags: ['Salesman - Sales'],
        summary: 'Get sale details by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'sales_id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Sale details' } }
      }
    },

    // ======= SALESMAN - INVENTORY =======
    '/api/salesman/inventory': {
      get: {
        tags: ['Salesman - Inventory'],
        summary: 'Get salesman branch inventory',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Inventory list' } }
      }
    },

    // ======= SALESMAN - SALARY =======
    '/api/salesman/salaries': {
      get: {
        tags: ['Salesman - Salary'],
        summary: 'Get salesman salary details',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Salary details' } }
      }
    },

    // ======= SALESMAN - ANALYTICS =======
    '/api/salesman/analytics/data': {
      get: {
        tags: ['Salesman - Analytics'],
        summary: 'Get salesman dashboard data',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Dashboard data' } }
      }
    },

    // ======= SALESMAN - MESSAGES =======
    '/api/salesman/messages/inbox': {
      get: {
        tags: ['Salesman - Messages'],
        summary: 'Get salesman inbox messages',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Inbox messages' } }
      }
    },
    '/api/salesman/messages/sent': {
      get: {
        tags: ['Salesman - Messages'],
        summary: 'Get salesman sent messages',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Sent messages' } }
      }
    },
    '/api/salesman/messages/manager': {
      get: {
        tags: ['Salesman - Messages'],
        summary: 'Get branch manager info for compose',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Branch manager details' } }
      }
    },
    '/api/salesman/messages/send': {
      post: {
        tags: ['Salesman - Messages'],
        summary: 'Send message from salesman',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['to', 'message'],
                properties: {
                  to: { type: 'string' },
                  subject: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Message sent' } }
      }
    },

    // ======= COMPANY - PRODUCTS =======
    '/api/company/products': {
      get: {
        tags: ['Company - Products'],
        summary: 'Get logged-in company products',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Company products',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    products: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/company/products/add': {
      post: {
        tags: ['Company - Products'],
        summary: 'Create product (multipart form-data with photos)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['Prod_name', 'Model_no'],
                properties: {
                  Prod_name: { type: 'string' },
                  Model_no: { type: 'string' },
                  prod_year: { type: 'string' },
                  stock: { type: 'number' },
                  stockavailability: { type: 'string' },
                  prod_description: { type: 'string' },
                  Retail_price: { type: 'number' },
                  warrantyperiod: { type: 'string' },
                  installation: { type: 'string' },
                  installationType: { type: 'string' },
                  installationcharge: { type: 'number' },
                  prod_photos: {
                    type: 'array',
                    maxItems: 3,
                    items: { type: 'string', format: 'binary' }
                  }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Product added' }
        }
      }
    },

    '/api/company/products/details/{prod_id}': {
      get: {
        tags: ['Company - Products'],
        summary: 'Get product details by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'prod_id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Product details' } }
      }
    },
    '/api/company/products/update-stockavailability/{prod_id}': {
      post: {
        tags: ['Company - Products'],
        summary: 'Update product stock availability',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'prod_id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['stockavailability'],
                properties: {
                  stockavailability: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Stock availability updated' } }
      }
    },

    // ======= COMPANY - ORDERS =======
    '/api/company/orders': {
      get: {
        tags: ['Company - Orders'],
        summary: 'Get company orders (supports page, limit, search)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { in: 'query', name: 'page', schema: { type: 'integer', default: 1 } },
          { in: 'query', name: 'limit', schema: { type: 'integer', default: 10 } },
          { in: 'query', name: 'search', schema: { type: 'string' } }
        ],
        responses: {
          200: { description: 'Paginated company orders' }
        }
      }
    },
    '/api/company/orders/{order_id}': {
      put: {
        tags: ['Company - Orders'],
        summary: 'Update company order status',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'order_id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: {
                    type: 'string',
                    enum: ['pending', 'accepted', 'shipped', 'delivered', 'rejected', 'cancelled']
                  },
                  delivery_date: { type: 'string', format: 'date-time', nullable: true }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Order updated' }
        }
      }
    },

    // ======= COMPANY - COMPLAINTS =======
    '/api/company/complaints': {
      get: {
        tags: ['Company - Complaints'],
        summary: 'Get complaints for logged-in company',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Company complaints list' }
        }
      }
    },
    '/api/company/complaints/{complaint_id}/status': {
      put: {
        tags: ['Company - Complaints'],
        summary: 'Update complaint status',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'complaint_id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['status'],
                properties: {
                  status: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Complaint status updated' }
        }
      }
    },

    // ======= COMPANY - MESSAGING =======
    '/api/company/messages/send': {
      post: {
        tags: ['Company - Messaging'],
        summary: 'Send company message to sales managers',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['message'],
                properties: {
                  to: { type: 'string' },
                  subject: { type: 'string' },
                  message: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Message sent' }
        }
      }
    },

    // ======= COMPANY - SALES =======
    '/api/company/sales': {
      get: {
        tags: ['Company - Sales'],
        summary: 'Get company sales',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Company sales list' } }
      }
    },
    '/api/company/sales/{id}': {
      get: {
        tags: ['Company - Sales'],
        summary: 'Get sale details by ID',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        responses: { 200: { description: 'Sale details' } }
      }
    },
    '/api/company/sales/{id}/installation': {
      put: {
        tags: ['Company - Sales'],
        summary: 'Update installation status for a sale',
        security: [{ bearerAuth: [] }],
        parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['installation_status'],
                properties: {
                  installation_status: { type: 'string' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Installation status updated' } }
      }
    },

    // ======= COMPANY - MESSAGING (additional) =======
    '/api/company/messages/inbox': {
      get: {
        tags: ['Company - Messaging'],
        summary: 'Get company inbox messages',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Inbox messages' } }
      }
    },
    '/api/company/messages/sent': {
      get: {
        tags: ['Company - Messaging'],
        summary: 'Get company sent messages',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Sent messages' } }
      }
    },
    '/api/company/messages/sales-managers': {
      get: {
        tags: ['Company - Messaging'],
        summary: 'Get sales managers list for compose',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Sales managers list' } }
      }
    },

    // ======= COMPANY - ANALYTICS =======
    '/api/company/analytics/data': {
      get: {
        tags: ['Company - Analytics'],
        summary: 'Get company dashboard analytics',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Dashboard data' } }
      }
    },

    // ======= CUSTOMER - PURCHASES =======
    '/api/customer/previouspurchases': {
      get: {
        tags: ['Customer - Purchases'],
        summary: 'Get customer previous purchases',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Previous purchases list' } }
      }
    },

    // ======= CUSTOMER - BLOGS =======
    '/api/customer/blogs': {
      get: {
        tags: ['Customer - Blogs'],
        summary: 'Get customer blogs',
        security: [{ bearerAuth: [] }],
        responses: { 200: { description: 'Blogs list' } }
      }
    },

    // ======= CUSTOMER - COMPLAINTS =======
    '/api/customer/complaints': {
      get: {
        tags: ['Customer - Complaints'],
        summary: 'Get logged-in customer complaints',
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Customer complaint list',
            content: {
              'application/json': {
                schema: { type: 'array', items: { $ref: '#/components/schemas/Complaint' } }
              }
            }
          }
        }
      }
    },
    '/api/customer/complaints/eligible': {
      get: {
        tags: ['Customer - Complaints'],
        summary: 'Get sales eligible for complaint filing',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Eligible sales list' }
        }
      }
    },
    '/api/customer/complaints/add': {
      post: {
        tags: ['Customer - Complaints'],
        summary: 'Create customer complaint',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sale_id', 'complaint_info'],
                properties: {
                  sale_id: { type: 'string' },
                  complaint_info: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          201: { description: 'Complaint submitted' }
        }
      }
    },

    // ======= CUSTOMER - REVIEWS =======
    '/api/customer/reviews': {
      get: {
        tags: ['Customer - Reviews'],
        summary: 'Get customer sale reviews',
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Review list' }
        }
      },
      post: {
        tags: ['Customer - Reviews'],
        summary: 'Submit or update product review',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['sale_id', 'rating', 'review'],
                properties: {
                  sale_id: { type: 'string' },
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  review: { type: 'string' }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Review saved' }
        }
      }
    },

    // ======= PUBLIC =======
    '/api/contact/submit': {
      post: {
        tags: ['Public'],
        summary: 'Submit public contact form',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['phone', 'email', 'message'],
                properties: {
                  phone: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  message: { type: 'string', minLength: 10 }
                }
              }
            }
          }
        },
        responses: {
          200: { description: 'Contact message sent' }
        }
      }
    },
    '/api/newproducts': {
      get: {
        tags: ['Public'],
        summary: 'Get products approved in last 15 days',
        responses: {
          200: { description: 'Newly approved products' }
        }
      }
    },
    '/api/ourproducts': {
      get: {
        tags: ['Public'],
        summary: 'Get all accepted products',
        responses: {
          200: { description: 'Accepted products' }
        }
      }
    },
    '/api/topproducts': {
      get: {
        tags: ['Public'],
        summary: 'Get top products by rating and sales count',
        responses: {
          200: { description: 'Top products' }
        }
      }
    },
    '/api/our-branches': {
      get: {
        tags: ['Public'],
        summary: 'Get all branches (public)',
        responses: {
          200: { description: 'Branches list' }
        }
      }
    }
  }
};

const swaggerOptions = {
  definition: swaggerDefinition,
  apis: []
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = {
  swaggerSpec
};
