# Guardian-Graph Demo App - Order Management API

This is a demo application for the Guardian-Graph hackathon that showcases an order management API with intentional bugs for diagnostic demonstration purposes.

## Overview

The demo app is a TypeScript-based REST API built with [Hono](https://hono.dev/) that manages orders and payment processing. It contains intentional bugs that cause server crashes, which Guardian-Graph can help diagnose and fix.

## Features

- **Order Creation**: Create new orders with customer information and items
- **Order Retrieval**: Get order details by ID
- **Payment Processing**: Process payments for orders (contains intentional bugs)
- **Error Logging**: Realistic production error logs in `logs/error.log`

## Intentional Bug 🐛

The API contains a critical bug in the payment processing endpoint (`POST /orders/:id/process`):

- **Bug Location**: `src/orders.ts` lines 88-94
- **Issue**: When an order's `amount` is `0` or `undefined`, the server crashes instead of returning a proper error
- **Root Cause**: 
  1. Missing validation for `amount` field when creating orders
  2. Division by zero when calculating discount eligibility: `1000 / order.amount`
  3. Arithmetic operations on `undefined` values

This bug demonstrates a common production issue that Guardian-Graph can help identify through log analysis and code mapping.

## Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to demo-app directory
cd demo-app

# Install dependencies
npm install
```

## Usage

### Development Mode

Run the server with hot-reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

### Production Mode

Build and run:

```bash
npm run build
npm start
```

## API Endpoints

### 1. Create Order
```bash
POST /orders
Content-Type: application/json

{
  "customerId": "CUST-123",
  "items": ["laptop", "mouse"],
  "amount": 1299.99
}
```

**Response:**
```json
{
  "success": true,
  "order": {
    "id": "ORD-1714646871223-n7k2m8p3q",
    "customerId": "CUST-123",
    "items": ["laptop", "mouse"],
    "amount": 1299.99,
    "status": "pending",
    "createdAt": "2026-05-02T14:30:00.000Z"
  }
}
```

### 2. Get Order
```bash
GET /orders/:id
```

**Response:**
```json
{
  "order": {
    "id": "ORD-1714646871223-n7k2m8p3q",
    "customerId": "CUST-123",
    "items": ["laptop", "mouse"],
    "amount": 1299.99,
    "status": "pending",
    "createdAt": "2026-05-02T14:30:00.000Z"
  }
}
```

### 3. Process Payment
```bash
POST /orders/:id/process
```

**Response (Success):**
```json
{
  "success": true,
  "order": {
    "id": "ORD-1714646871223-n7k2m8p3q",
    "status": "completed",
    ...
  },
  "payment": {
    "subtotal": 1299.99,
    "processingFee": 39.00,
    "tax": 129.99,
    "total": 1468.98
  }
}
```

### 4. Health Check
```bash
GET /health
```

## Reproducing the Bug

### Scenario 1: Amount is 0
```bash
# Create order with amount = 0
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-999",
    "items": ["free-trial"],
    "amount": 0
  }'

# Try to process payment - SERVER WILL CRASH!
curl -X POST http://localhost:3000/orders/[ORDER_ID]/process
```

**Expected Error**: Division by zero at line 94

### Scenario 2: Amount is undefined
```bash
# Create order without amount field
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "CUST-888",
    "items": ["premium-plan"]
  }'

# Try to process payment - SERVER WILL CRASH!
curl -X POST http://localhost:3000/orders/[ORDER_ID]/process
```

**Expected Error**: Cannot perform arithmetic on undefined at line 88

## Error Logs

Production error logs are stored in `logs/error.log` and contain:
- Timestamps of crashes
- Full stack traces
- Request details (order ID, customer ID, amount)
- Error types (Division by zero, undefined arithmetic)

These logs demonstrate the pattern of failures that Guardian-Graph can analyze to identify the root cause.

## Guardian-Graph Integration

This demo app is designed to showcase Guardian-Graph's capabilities:

1. **Log Analysis**: Parse `error.log` to identify crash patterns
2. **Code Mapping**: Map stack traces to specific code locations
3. **Visual Architecture**: Visualize the order processing flow
4. **Root Cause Analysis**: Identify missing validation as the root cause
5. **Fix Suggestions**: Recommend adding amount validation

## Project Structure

```
demo-app/
├── src/
│   └── orders.ts          # Main API with intentional bugs
├── logs/
│   └── error.log          # Production error logs
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # This file
```

## License

MIT