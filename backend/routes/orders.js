const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');

// POST /api/orders  body: { customerName, customerEmail, address, items: [{productId, quantity}] }
router.post('/', (req, res) => {
  try {
    const { customerName, customerEmail, address, items } = req.body;

    if (!customerName || !customerEmail || !address) {
      return res.status(400).json({ success: false, error: 'customerName, customerEmail, and address are required' });
    }
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'items array is required and must not be empty' });
    }

    // Validate all products exist and have enough stock
    const resolvedItems = [];
    for (const item of items) {
      const product = db.prepare('SELECT * FROM products WHERE id = ?').get(item.productId);
      if (!product) {
        return res.status(404).json({ success: false, error: `Product not found: ${item.productId}` });
      }
      if (product.stock < item.quantity) {
        return res.status(400).json({ success: false, error: `Insufficient stock for "${product.name}". Available: ${product.stock}` });
      }
      resolvedItems.push({ ...item, price: product.price, name: product.name });
    }

    const total = resolvedItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const orderId = uuidv4();

    const createOrder = db.transaction(() => {
      db.prepare(
        'INSERT INTO orders (id, customer_name, customer_email, address, total) VALUES (?, ?, ?, ?, ?)'
      ).run(orderId, customerName, customerEmail, address, total);

      for (const item of resolvedItems) {
        db.prepare('INSERT INTO order_items (id, order_id, product_id, quantity, price) VALUES (?, ?, ?, ?, ?)')
          .run(uuidv4(), orderId, item.productId, item.quantity, item.price);
        db.prepare('UPDATE products SET stock = stock - ? WHERE id = ?')
          .run(item.quantity, item.productId);
      }
    });

    createOrder();

    res.status(201).json({ success: true, data: { orderId } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/orders/:id
router.get('/:id', (req, res) => {
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
