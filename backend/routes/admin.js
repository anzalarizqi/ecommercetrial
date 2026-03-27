const express = require('express');
const router = express.Router();
const db = require('../db/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const requireAuth = require('../middleware/auth');

// POST /api/admin/login (public)
router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, error: 'username and password are required' });
    }

    const admin = db.prepare('SELECT * FROM admins WHERE username = ?').get(username);
    if (!admin) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const valid = bcrypt.compareSync(password, admin.password_hash);
    if (!valid) return res.status(401).json({ success: false, error: 'Invalid credentials' });

    const token = jwt.sign(
      { id: admin.id, username: admin.username },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ success: true, data: { token } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Products (all protected) ────────────────────────────────────────────────

// GET /api/admin/products
router.get('/products', requireAuth, (req, res) => {
  try {
    const products = db.prepare('SELECT * FROM products').all();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/admin/products
router.post('/products', requireAuth, (req, res) => {
  try {
    const { name, description, price, stock, category, image_url } = req.body;
    if (!name || price === undefined || stock === undefined || !category) {
      return res.status(400).json({ success: false, error: 'name, price, stock, and category are required' });
    }

    const id = uuidv4();
    db.prepare(
      'INSERT INTO products (id, name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(id, name, description || null, price, stock, category, image_url || null);

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    res.status(201).json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/admin/products/:id
router.put('/products/:id', requireAuth, (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    const { name, description, price, stock, category, image_url } = req.body;
    db.prepare(
      'UPDATE products SET name = ?, description = ?, price = ?, stock = ?, category = ?, image_url = ? WHERE id = ?'
    ).run(
      name ?? product.name,
      description ?? product.description,
      price ?? product.price,
      stock ?? product.stock,
      category ?? product.category,
      image_url ?? product.image_url,
      req.params.id
    );

    const updated = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/admin/products/:id
router.delete('/products/:id', requireAuth, (req, res) => {
  try {
    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── Orders (all protected) ──────────────────────────────────────────────────

// GET /api/admin/orders
router.get('/orders', requireAuth, (req, res) => {
  try {
    const orders = db.prepare(
      'SELECT * FROM orders ORDER BY created_at DESC'
    ).all();
    res.json({ success: true, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/admin/orders/:id
router.get('/orders/:id', requireAuth, (req, res) => {
  try {
    const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const items = db.prepare(`
      SELECT oi.id, oi.product_id as productId, oi.quantity, oi.price,
             p.name, p.image_url
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `).all(order.id);

    res.json({ success: true, data: { ...order, items } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
