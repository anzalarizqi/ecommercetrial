const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { v4: uuidv4 } = require('uuid');

// POST /api/cart  body: { sessionId, productId, quantity }
router.post('/', (req, res) => {
  try {
    const { sessionId, productId, quantity = 1 } = req.body;
    if (!sessionId || !productId) {
      return res.status(400).json({ success: false, error: 'sessionId and productId are required' });
    }

    const product = db.prepare('SELECT * FROM products WHERE id = ?').get(productId);
    if (!product) return res.status(404).json({ success: false, error: 'Product not found' });

    // Validate stock
    const existing = db.prepare(
      'SELECT * FROM cart_items WHERE session_id = ? AND product_id = ?'
    ).get(sessionId, productId);

    const currentQty = existing ? existing.quantity : 0;
    if (product.stock < currentQty + quantity) {
      return res.status(400).json({ success: false, error: `Insufficient stock. Available: ${product.stock - currentQty}` });
    }

    if (existing) {
      db.prepare('UPDATE cart_items SET quantity = quantity + ? WHERE id = ?')
        .run(quantity, existing.id);
    } else {
      db.prepare('INSERT INTO cart_items (id, session_id, product_id, quantity) VALUES (?, ?, ?, ?)')
        .run(uuidv4(), sessionId, productId, quantity);
    }

    res.status(201).json({ success: true, data: getCartWithProducts(sessionId) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/cart/:sessionId
router.get('/:sessionId', (req, res) => {
  try {
    res.json({ success: true, data: getCartWithProducts(req.params.sessionId) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/cart/:sessionId/:productId
router.delete('/:sessionId/:productId', (req, res) => {
  try {
    db.prepare('DELETE FROM cart_items WHERE session_id = ? AND product_id = ?')
      .run(req.params.sessionId, req.params.productId);
    res.json({ success: true, message: 'Item removed from cart' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function getCartWithProducts(sessionId) {
  return db.prepare(`
    SELECT ci.id, ci.session_id as sessionId, ci.quantity, ci.created_at,
           p.id as productId, p.name, p.price, p.image_url, p.category, p.stock
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.session_id = ?
  `).all(sessionId);
}

module.exports = router;
