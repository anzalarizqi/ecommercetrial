/**
 * QA-04 — Integration Test: Full E-Commerce Flow
 * Browse produk → Tambah ke cart → Checkout → Konfirmasi order
 *
 * Requires backend server running at http://localhost:3001
 * Start server: cd backend && node server.js
 */

const { spawn } = require('child_process');
const path = require('path');
const axios = require('axios');

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';
const SESSION_ID = `qa04-session-${Date.now()}`;

// Shared state
let firstProduct = null;
let cartSessionId = SESSION_ID;
let createdOrderId = null;
let stockBeforeOrder = null;

const api = axios.create({
  baseURL: BASE,
  validateStatus: () => true,
  timeout: 8000,
});

// ── Helper: wait for server to be ready ──────────────────────────────────────
async function waitForServer(maxMs = 10000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    try {
      const res = await api.get('/');
      if (res.status === 200) return true;
    } catch (_) {}
    await new Promise(r => setTimeout(r, 300));
  }
  return false;
}

// ── Server lifecycle ──────────────────────────────────────────────────────────
let serverProcess = null;

beforeAll(async () => {
  // Try to connect to already-running server first
  const alreadyRunning = await waitForServer(2000);
  if (!alreadyRunning) {
    // Start backend server
    const backendDir = path.resolve(__dirname, '../../backend');
    serverProcess = spawn('node', ['server.js'], {
      cwd: backendDir,
      stdio: 'pipe',
      detached: false,
    });
    const started = await waitForServer(10000);
    if (!started) throw new Error('Backend server failed to start within 10s');
  }
}, 15000);

afterAll(async () => {
  if (serverProcess) {
    serverProcess.kill();
    await new Promise(r => setTimeout(r, 500));
  }
});

// ── Step 1: Browse Products ───────────────────────────────────────────────────
describe('Step 1 — Browse Products', () => {
  test('GET /api/products → 200, produk tersedia dengan field lengkap', async () => {
    const res = await api.get('/api/products');
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(Array.isArray(res.data.data)).toBe(true);
    expect(res.data.data.length).toBeGreaterThan(0);

    const p = res.data.data[0];
    expect(p).toHaveProperty('id');
    expect(p).toHaveProperty('name');
    expect(p).toHaveProperty('price');
    expect(p).toHaveProperty('stock');
    expect(p).toHaveProperty('category');
    expect(p.stock).toBeGreaterThan(0);

    // Pilih produk dengan stok cukup
    firstProduct = res.data.data.find(x => x.stock >= 1) || res.data.data[0];
    stockBeforeOrder = firstProduct.stock;
  });

  test('GET /api/products/:id → 200, detail produk valid', async () => {
    const res = await api.get(`/api/products/${firstProduct.id}`);
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data.id).toBe(firstProduct.id);
    expect(res.data.data.name).toBe(firstProduct.name);
    expect(typeof res.data.data.price).toBe('number');
  });
});

// ── Step 2: Tambah ke Cart ────────────────────────────────────────────────────
describe('Step 2 — Tambah ke Cart', () => {
  test('POST /api/cart → 201, item berhasil masuk cart', async () => {
    const res = await api.post('/api/cart', {
      sessionId: cartSessionId,
      productId: firstProduct.id,
      quantity: 1,
    });
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
  });

  test('GET /api/cart/:sessionId → 200, cart berisi produk yang ditambahkan', async () => {
    const res = await api.get(`/api/cart/${cartSessionId}`);
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(Array.isArray(res.data.data)).toBe(true);
    expect(res.data.data.length).toBe(1);

    const item = res.data.data[0];
    expect(item.productId || item.product_id || item.id).toBeTruthy();
    expect(item.name).toBe(firstProduct.name);
    expect(item.quantity).toBe(1);
  });
});

// ── Step 3: Checkout ──────────────────────────────────────────────────────────
describe('Step 3 — Checkout (POST /api/orders)', () => {
  test('POST /api/orders → 201, order berhasil dibuat', async () => {
    const payload = {
      customerName: 'QA Tester',
      customerEmail: 'qa@test.com',
      address: 'Jl. QA Test No. 4, Jakarta',
      items: [{ productId: firstProduct.id, quantity: 1 }],
    };
    const res = await api.post('/api/orders', payload);
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.data).toHaveProperty('orderId');
    expect(typeof res.data.data.orderId).toBe('string');

    createdOrderId = res.data.data.orderId;
  });

  test('POST /api/orders tanpa customerEmail → 400', async () => {
    const res = await api.post('/api/orders', {
      customerName: 'QA Tester',
      address: 'Jl. Test',
      items: [{ productId: firstProduct.id, quantity: 1 }],
    });
    expect(res.status).toBe(400);
    expect(res.data.success).toBe(false);
  });

  test('Stok produk berkurang setelah order', async () => {
    const res = await api.get(`/api/products/${firstProduct.id}`);
    expect(res.status).toBe(200);
    const newStock = res.data.data.stock;
    expect(newStock).toBe(stockBeforeOrder - 1);
  });
});

// ── Step 4: Konfirmasi Order ──────────────────────────────────────────────────
describe('Step 4 — Konfirmasi Order (GET /api/orders/:id)', () => {
  test('GET /api/orders/:orderId → 200, detail order dengan items', async () => {
    const res = await api.get(`/api/orders/${createdOrderId}`);
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);

    const order = res.data.data;
    expect(order.id).toBe(createdOrderId);
    expect(order.customer_name || order.customerName).toBe('QA Tester');
    expect(Array.isArray(order.items)).toBe(true);
    expect(order.items.length).toBe(1);
    expect(order.items[0].name).toBe(firstProduct.name);
    expect(order.items[0].quantity).toBe(1);
  });

  test('GET /api/orders/nonexistent-id → 404', async () => {
    const res = await api.get('/api/orders/order-qa04-nonexistent-999');
    expect(res.status).toBe(404);
    expect(res.data.success).toBe(false);
  });
});
