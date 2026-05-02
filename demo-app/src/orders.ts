import { Hono } from 'hono';
import { serve } from '@hono/node-server';

// In-memory storage for demo purposes
interface Order {
  id: string;
  customerId: string;
  items: string[];
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
}

const orders = new Map<string, Order>();

const app = new Hono();

// Middleware for logging
app.use('*', async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${c.req.method} ${c.req.url} - ${ms}ms`);
});

// POST /orders - Create a new order
app.post('/orders', async (c) => {
  try {
    const body = await c.req.json();
    const { customerId, items, amount } = body;

    // Basic validation (but missing amount validation - intentional bug!)
    if (!customerId || !items || !Array.isArray(items)) {
      return c.json({ error: 'Invalid request: customerId and items are required' }, 400);
    }

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const order: Order = {
      id: orderId,
      customerId,
      items,
      amount, // BUG: Not validating if amount is 0 or undefined
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    orders.set(orderId, order);

    return c.json({
      success: true,
      order,
    }, 201);
  } catch (error) {
    console.error('Error creating order:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /orders/:id - Get order by ID
app.get('/orders/:id', (c) => {
  const orderId = c.req.param('id');
  const order = orders.get(orderId);

  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  return c.json({ order });
});

// POST /orders/:id/process - Process payment for an order
app.post('/orders/:id/process', async (c) => {
  const orderId = c.req.param('id');
  const order = orders.get(orderId);

  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  if (order.status !== 'pending') {
    return c.json({ error: 'Order already processed' }, 400);
  }

  try {
    // BUG: This will crash if amount is 0 or undefined!
    // Simulating payment processing logic that fails with invalid amounts
    const processingFee = order.amount * 0.03; // 3% processing fee
    const taxRate = 0.1; // 10% tax
    const tax = order.amount * taxRate;
    
    // This calculation will cause issues with 0 or undefined
    const total = order.amount + processingFee + tax;
    
    // This division will crash with amount = 0
    const discountEligibility = 1000 / order.amount; // BUG: Division by zero!
    
    // Simulate payment gateway call
    console.log(`Processing payment for order ${orderId}`);
    console.log(`Amount: ${order.amount}, Fee: ${processingFee}, Tax: ${tax}, Total: ${total}`);
    console.log(`Discount eligibility score: ${discountEligibility}`);

    // Update order status
    order.status = 'completed';
    orders.set(orderId, order);

    return c.json({
      success: true,
      order,
      payment: {
        subtotal: order.amount,
        processingFee,
        tax,
        total,
      },
    });
  } catch (error) {
    // This catch block won't help with the intentional bugs
    console.error('Payment processing error:', error);
    order.status = 'failed';
    orders.set(orderId, order);
    return c.json({ error: 'Payment processing failed' }, 500);
  }
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Guardian-Graph Order Management API',
    version: '1.0.0',
    endpoints: {
      'POST /orders': 'Create a new order',
      'GET /orders/:id': 'Get order by ID',
      'POST /orders/:id/process': 'Process payment for an order',
      'GET /health': 'Health check',
    },
  });
});

const port = 3000;
console.log(`🚀 Server is running on http://localhost:${port}`);

serve({
  fetch: app.fetch,
  port,
});

// Made with Bob
