/**
 * QA-02 — Backend API Tests
 * Requires backend server running at http://localhost:3001
 * Run: npm test (from /tests directory)
 */

const axios = require('axios');

const BASE = process.env.TEST_BASE_URL || 'http://localhost:3001';
const SESSION_ID = `test-session-${Date.now()}`;

// Shared state across tests
let firstProductId = null;
let elektronikProductId = null;
let createdOrderId = null;
let adminToken = null;
let adminCreatedProductId = null;

// Helper: axios instance that doesn't throw on non-2xx
const api = axios.create({
  baseURL: BASE,
  validateStatus: () => true, // always resolve, never reject
  timeout: 8000,
});

// ── Health check ──────────────────────────────────────────────────────────────
describe('Server health', () => {
  test('GET / → status 200, API running', async () => {
    const res = await api.get('/');
    expect(res.status).toBe(200);
    expect(res.data.status).toBe('ok');
  });
});

// ── Products ──────────────────────────────────────────────────────────────────
describe('Products API', () => {
  test('GET /api/products → 200, array dengan field wajib', async () => {
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

    // Save for later tests
    firstProductId = p.id;
    const elektronik = res.data.data.find(x => x.category === 'elektronik');
    if (elektronik) elektronikProductId = elektronik.id;
  });

  test('GET /api/products?category=elektronik → hanya kategori elektronik', async () => {
    const res = await api.get('/api/products?category=elektronik');
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(Array.isArray(res.data.data)).toBe(true);
    expect(res.data.data.length).toBeGreaterThan(0);
    res.data.data.forEach(p => {
      expect(p.category).toBe('elektronik');
    });
  });

  test('GET /api/products?search=laptop → produk mengandung "laptop"', async () => {
    const res = await api.get('/api/products?search=laptop');
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(Array.isArray(res.data.data)).toBe(true);
    expect(res.data.data.length).toBeGreaterThan(0);
    res.data.data.forEach(p => {
      const nameOrDesc = (p.name + ' ' + (p.description || '')).toLowerCase();
      expect(nameOrDesc).toContain('laptop');
    });
  });

  test('GET /api/products/:id → 200 dengan data produk valid', async () => {
    expect(firstProductId).not.toBeNull();
    const res = await api.get(`/api/products/${firstProductId}`);
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data.id).toBe(firstProductId);
  });

  test('GET /api/products/nonexistent-id → 404', async () => {
    const res = await api.get('/api/products/nonexistent-id-99999');
    expect(res.status).toBe(404);
    expect(res.data.success).toBe(false);
  });
});

// ── Cart ──────────────────────────────────────────────────────────────────────
describe('Cart API', () => {
  test('POST /api/cart → 201, item masuk cart', async () => {
    expect(elektronikProductId).not.toBeNull();
    const res = await api.post('/api/cart', {
      sessionId: SESSION_ID,
      productId: elektronikProductId,
      quantity: 1,
    });
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(Array.isArray(res.data.data)).toBe(true);
    expect(res.data.data.length).toBeGreaterThan(0);
  });

  test('POST /api/cart tanpa sessionId → 400', async () => {
    const res = await api.post('/api/cart', {
      productId: firstProductId,
      quantity: 1,
    });
    expect(res.status).toBe(400);
    expect(res.data.success).toBe(false);
  });

  test('GET /api/cart/:sessionId → 200, array dengan field nama produk', async () => {
    const res = await api.get(`/api/cart/${SESSION_ID}`);
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(Array.isArray(res.data.data)).toBe(true);
    expect(res.data.data.length).toBeGreaterThan(0);

    const item = res.data.data[0];
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('quantity');
    expect(item).toHaveProperty('price');
  });

  test('DELETE /api/cart/:sessionId/:productId → 200, item terhapus', async () => {
    expect(elektronikProductId).not.toBeNull();
    const res = await api.delete(`/api/cart/${SESSION_ID}/${elektronikProductId}`);
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);

    // Verify item removed
    const cartRes = await api.get(`/api/cart/${SESSION_ID}`);
    const stillHas = cartRes.data.data.find(i => i.productId === elektronikProductId);
    expect(stillHas).toBeUndefined();
  });
});

// ── Orders ────────────────────────────────────────────────────────────────────
describe('Orders API', () => {
  test('POST /api/orders → 201, return { orderId }', async () => {
    expect(firstProductId).not.toBeNull();
    const res = await api.post('/api/orders', {
      customerName: 'QA Tester',
      customerEmail: 'qa@test.com',
      address: 'Jl. Test No. 1, Jakarta',
      items: [{ productId: firstProductId, quantity: 1 }],
    });
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.data).toHaveProperty('orderId');
    createdOrderId = res.data.data.orderId;
  });

  test('POST /api/orders tanpa customerName → 400', async () => {
    const res = await api.post('/api/orders', {
      customerEmail: 'qa@test.com',
      address: 'Jl. Test No. 1',
      items: [{ productId: firstProductId, quantity: 1 }],
    });
    expect(res.status).toBe(400);
    expect(res.data.success).toBe(false);
  });

  test('POST /api/orders items kosong → 400', async () => {
    const res = await api.post('/api/orders', {
      customerName: 'QA Tester',
      customerEmail: 'qa@test.com',
      address: 'Jl. Test',
      items: [],
    });
    expect(res.status).toBe(400);
    expect(res.data.success).toBe(false);
  });

  test('GET /api/orders/:orderId → 200, detail order dengan items', async () => {
    expect(createdOrderId).not.toBeNull();
    const res = await api.get(`/api/orders/${createdOrderId}`);
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data).toHaveProperty('id');
    expect(Array.isArray(res.data.data.items)).toBe(true);
    expect(res.data.data.items.length).toBeGreaterThan(0);
    expect(res.data.data.items[0]).toHaveProperty('name');
  });

  test('GET /api/orders/nonexistent-id → 404', async () => {
    const res = await api.get('/api/orders/nonexistent-order-99999');
    expect(res.status).toBe(404);
    expect(res.data.success).toBe(false);
  });
});

// ── Admin Auth ────────────────────────────────────────────────────────────────
describe('Admin Auth & Protected Routes', () => {
  test('POST /api/admin/login dengan kredensial benar → 200, return token', async () => {
    const res = await api.post('/api/admin/login', {
      username: 'admin',
      password: 'admin123',
    });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
    expect(res.data.data).toHaveProperty('token');
    expect(typeof res.data.data.token).toBe('string');
    adminToken = res.data.data.token;
  });

  test('POST /api/admin/login dengan password salah → 401', async () => {
    const res = await api.post('/api/admin/login', {
      username: 'admin',
      password: 'wrongpassword',
    });
    expect(res.status).toBe(401);
    expect(res.data.success).toBe(false);
  });

  test('POST /api/admin/products TANPA token → 401', async () => {
    const res = await api.post('/api/admin/products', {
      name: 'Test Product',
      price: 100000,
      stock: 10,
      category: 'elektronik',
    });
    expect(res.status).toBe(401);
  });

  test('POST /api/admin/products DENGAN token valid → 201', async () => {
    expect(adminToken).not.toBeNull();
    const res = await api.post(
      '/api/admin/products',
      {
        name: 'QA Test Product',
        description: 'Produk dibuat oleh QA test',
        price: 99000,
        stock: 5,
        category: 'elektronik',
      },
      { headers: { Authorization: `Bearer ${adminToken}` } }
    );
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.data).toHaveProperty('id');
    adminCreatedProductId = res.data.data.id;
  });

  test('DELETE /api/admin/products/:id (cleanup QA product) → 200', async () => {
    if (!adminCreatedProductId) return;
    const res = await api.delete(`/api/admin/products/${adminCreatedProductId}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
  });
});
