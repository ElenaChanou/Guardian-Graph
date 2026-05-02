import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = new Hono();

// In-memory order storage
interface Order {
  id: string;
  productName: string;
  quantity: number;
  amount?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  processedAt?: string;
}

const orders = new Map<string, Order>();

// Logging utility
function logError(error: Error, context: any) {
  const logDir = path.join(__dirname, '..', 'logs');
  const logFile = path.join(logDir, 'error.log');
  
  const timestamp = new Date().toISOString();
  const logEntry = `
[${timestamp}] ERROR: ${error.message}
Request Context: ${JSON.stringify(context, null, 2)}
Stack Trace:
${error.stack}
${'='.repeat(80)}
`;
  
  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.appendFileSync(logFile, logEntry);
  } catch (e) {
    console.error('Failed to write to log file:', e);
  }
}

// Generate unique order ID
function generateOrderId(): string {
  return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// POST /orders - Create new order
app.post('/orders', async (c) => {
  try {
    const body = await c.req.json();
    const { productName, quantity, amount } = body;

    if (!productName || !quantity) {
      return c.json({ error: 'Missing required fields: productName, quantity' }, 400);
    }

    const orderId = generateOrderId();
    const order: Order = {
      id: orderId,
      productName,
      quantity,
      amount,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    orders.set(orderId, order);

    console.log(`✅ Order created: ${orderId}`);
    return c.json({ 
      success: true, 
      order,
      message: 'Order created successfully'
    }, 201);

  } catch (error) {
    const err = error as Error;
    logError(err, { endpoint: 'POST /orders', body: await c.req.json() });
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// GET /orders/:id - Get order by ID
app.get('/orders/:id', (c) => {
  try {
    const orderId = c.req.param('id');
    const order = orders.get(orderId);

    if (!order) {
      return c.json({ error: 'Order not found' }, 404);
    }

    return c.json({ success: true, order });

  } catch (error) {
    const err = error as Error;
    logError(err, { endpoint: 'GET /orders/:id', orderId: c.req.param('id') });
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// POST /orders/:id/process - Process payment (INTENTIONAL BUG HERE)
app.post('/orders/:id/process', async (c) => {
  const orderId = c.req.param('id');
  const order = orders.get(orderId);

  if (!order) {
    return c.json({ error: 'Order not found' }, 404);
  }

  if (order.status !== 'pending') {
    return c.json({ error: `Order already ${order.status}` }, 400);
  }

  try {
    // INTENTIONAL BUG: No validation for amount being 0 or undefined
    // This will cause a crash when trying to calculate fees
    order.status = 'processing';
    
    // Calculate processing fee (10% of amount)
    // BUG: If amount is 0 or undefined, this will cause issues
    const processingFee = order.amount! * 0.1;
    const totalAmount = order.amount! + processingFee;
    
    // Simulate payment processing
    // BUG: Division by zero or undefined will crash the server
    const feePercentage = (processingFee / order.amount!) * 100;
    
    // This line will never be reached if amount is 0 or undefined
    order.status = 'completed';
    order.processedAt = new Date().toISOString();
    
    console.log(`✅ Payment processed for order: ${orderId}`);
    return c.json({
      success: true,
      order,
      payment: {
        subtotal: order.amount,
        processingFee,
        total: totalAmount,
        feePercentage
      }
    });

  } catch (error) {
    const err = error as Error;
    
    // Log the error
    logError(err, {
      endpoint: 'POST /orders/:id/process',
      orderId,
      order,
      timestamp: new Date().toISOString()
    });

    // Mark order as failed
    order.status = 'failed';
    
    // Re-throw to crash the server (simulating production bug)
    throw error;
  }
});

// Health check endpoint
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    ordersCount: orders.size
  });
});

// Root endpoint
app.get('/', (c) => {
  return c.json({
    message: 'Guardian-Graph Demo API',
    version: '1.0.0',
    endpoints: {
      'POST /orders': 'Create new order',
      'GET /orders/:id': 'Get order by ID',
      'POST /orders/:id/process': 'Process payment for order',
      'GET /health': 'Health check'
    },
    note: '⚠️  This demo contains intentional bugs for testing Guardian-Graph'
  });
});

const port = 3000;
console.log(`🚀 Guardian-Graph Demo API running on http://localhost:${port}`);
console.log(`📝 Logs will be written to: ${path.join(__dirname, '..', 'logs', 'error.log')}`);
console.log(`⚠️  WARNING: This server contains intentional bugs for demo purposes\n`);

serve({
  fetch: app.fetch,
  port
});

// Made with Bob
