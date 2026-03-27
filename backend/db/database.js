const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(path.join(dbDir, 'ecommerce.db'));

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = OFF'); // off during migrations

// Check if schema needs to be rebuilt (old schema used INTEGER PKs)
const tableInfo = db.prepare("PRAGMA table_info(products)").all();
const idCol = tableInfo.find(c => c.name === 'id');
const needsRebuild = tableInfo.length > 0 && idCol && idCol.type !== 'TEXT';

if (needsRebuild) {
  db.exec(`
    DROP TABLE IF EXISTS order_items;
    DROP TABLE IF EXISTS cart_items;
    DROP TABLE IF EXISTS orders;
    DROP TABLE IF EXISTS admins;
    DROP TABLE IF EXISTS products;
  `);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    category TEXT,
    image_url TEXT
  );

  CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    address TEXT NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price REAL NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );

  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
`);

db.pragma('foreign_keys = ON');

// Auto-seed if DB is empty
const productCount = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (productCount.count === 0) {
  require('./seed')(db);
}

module.exports = db;
