# Swagger and API Endpoints Guide

This document is dedicated to Swagger setup, API endpoint access, and testing workflow for the backend.

## 1. What Swagger Is Used For

Swagger UI provides interactive API documentation for this backend. You can:
- View all documented endpoints
- Inspect request and response formats
- Test endpoints directly from the browser
- Authorize using JWT Bearer tokens for protected routes

## 2. Where Swagger Is Configured

- Swagger spec and endpoint catalog: `config/swagger.js`
- Swagger UI mount path: `server.js`
  - Mounted at: `/api-docs`

## 3. How To Run Swagger Locally

From the `server` folder:

```bash
npm install
npm start
```

Then open:

- Swagger UI: `http://localhost:5001/api-docs`
- API base URL: `http://localhost:5001`

Note:
- If your `.env` has a custom `PORT`, replace `5001` with that value.

## 4. Authentication In Swagger (Protected Endpoints)

Some endpoints require JWT authentication.

Use this flow:
1. Call a login endpoint (for example `POST /api/auth/login`)
2. Copy the returned token
3. In Swagger, click **Authorize**
4. Paste token as Bearer token

Example:

```text
Bearer <your-jwt-token>
```

## 5. Endpoint Map (Mounted Route Groups)

These are the mounted route groups in the Express server.

### Auth and Account Recovery

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/company/signup`
- `POST /api/auth/company/login`
- `POST /api/auth/customer/login`
- `POST /api/forgot-password/send-otp`
- `POST /api/forgot-password/reset`

### Public Endpoints

- `GET /api/our-branches`
- `GET /api/newproducts`
- `GET /api/ourproducts`
- `GET /api/topproducts`
- `POST /api/contact/submit`

### Company Endpoints (Protected)

Mounted under: `/api/company`

Examples:
- `GET /api/company/products`
- `GET /api/company/products/details/:prod_id`
- `POST /api/company/products/add`
- `POST /api/company/products/update-stockavailability/:prod_id`
- `GET /api/company/orders`
- `PUT /api/company/orders/:order_id`
- `GET /api/company/complaints`
- `PUT /api/company/complaints/:complaint_id/status`
- `GET /api/company/sales`
- `GET /api/company/sales/:id`
- `PUT /api/company/sales/:id/installation`
- `GET /api/company/messages/inbox`
- `GET /api/company/messages/sent`
- `GET /api/company/messages/sales-managers`
- `POST /api/company/messages/send`
- `GET /api/company/analytics/data`

### Owner Endpoints (Protected)

Mounted groups:
- `/api/companies`
- `/api/branches`
- `/api/employees`
- `/api/owner/products`
- `/api/owner/sales`
- `/api/owner/orders`
- `/api/owner/inventory`
- `/api/owner/salaries`
- `/api/owner/profits`
- `/api/owner/analytics`
- `/api/owner/messages`

### Manager Endpoints (Protected)

Mounted groups:
- `/api/manager/employees`
- `/api/manager/orders`
- `/api/manager/inventory`
- `/api/manager/sales`
- `/api/manager/salary`
- `/api/manager/analytics`
- `/api/manager/messages`

### Salesman Endpoints (Protected)

Mounted groups:
- `/api/salesman/profile`
- `/api/salesman/sales`
- `/api/salesman/inventory`
- `/api/salesman/salaries`
- `/api/salesman/analytics`
- `/api/salesman/messages`

### Customer Endpoints

Mounted groups:
- `/api/customer/previouspurchases`
- `/api/customer/complaints`
- `/api/customer/reviews`
- `/api/customer/blogs`

## 6. How To Validate Endpoints Quickly

1. Open `http://localhost:5001/api-docs`
2. Expand any endpoint tag
3. Click **Try it out**
4. Fill request payload/params
5. Click **Execute**
6. Check response code and body

## 7. Common Response Codes

- `200` OK
- `201` Created
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `429` Too Many Requests
- `500` Internal Server Error

## 8. Troubleshooting Swagger

If Swagger does not open:
- Confirm backend is running
- Confirm correct port (`PORT` in `.env`, default `5001`)
- Open `http://localhost:<PORT>/api-docs`
- Check terminal errors from `npm start`
- Ensure dependencies are installed (`swagger-ui-express`, `swagger-jsdoc`)

If protected APIs fail in Swagger:
- Verify token is not expired
- Verify token belongs to correct role for that endpoint
- Re-authorize in Swagger with a fresh token

## 9. Notes

- Swagger is mounted at `/api-docs` in the backend server.
- The OpenAPI definition includes tags for Auth, Owner, Manager, Salesman, Company, Customer, and Public APIs.
- Use Swagger as the source of truth for request structure and latest documented responses.
