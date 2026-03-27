const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const products = [
  {
    name: 'Laptop Pro 15"',
    description: 'Laptop dengan prosesor Intel Core i7, RAM 16GB, SSD 512GB',
    price: 12999000,
    stock: 15,
    category: 'elektronik',
    image_url: 'https://placehold.co/400x300?text=Laptop+Pro'
  },
  {
    name: 'Smartphone Galaxy X',
    description: 'Smartphone 5G layar AMOLED 6.5", kamera 108MP, baterai 5000mAh',
    price: 6499000,
    stock: 30,
    category: 'elektronik',
    image_url: 'https://placehold.co/400x300?text=Smartphone'
  },
  {
    name: 'Wireless Earbuds',
    description: 'TWS earbuds dengan noise cancellation aktif, tahan air IPX5',
    price: 899000,
    stock: 50,
    category: 'elektronik',
    image_url: 'https://placehold.co/400x300?text=Earbuds'
  },
  {
    name: 'Kaos Polos Premium',
    description: 'Kaos katun combed 30s, tersedia berbagai warna, unisex',
    price: 89000,
    stock: 100,
    category: 'fashion',
    image_url: 'https://placehold.co/400x300?text=Kaos'
  },
  {
    name: 'Jaket Hoodie Fleece',
    description: 'Jaket hoodie bahan fleece tebal, cocok untuk cuaca dingin',
    price: 299000,
    stock: 40,
    category: 'fashion',
    image_url: 'https://placehold.co/400x300?text=Hoodie'
  },
  {
    name: 'Sepatu Sneakers Casual',
    description: 'Sepatu sneakers ringan dengan sol karet anti-slip, gaya modern',
    price: 459000,
    stock: 25,
    category: 'fashion',
    image_url: 'https://placehold.co/400x300?text=Sneakers'
  },
  {
    name: 'Kopi Arabika Premium 250g',
    description: 'Biji kopi arabika pilihan dari Aceh Gayo, roast medium',
    price: 75000,
    stock: 200,
    category: 'makanan',
    image_url: 'https://placehold.co/400x300?text=Kopi'
  },
  {
    name: 'Cokelat Dark 70% 100g',
    description: 'Dark chocolate premium dengan kakao 70%, tanpa gula tambahan',
    price: 45000,
    stock: 150,
    category: 'makanan',
    image_url: 'https://placehold.co/400x300?text=Cokelat'
  }
];

function seed(db) {
  const insertProduct = db.prepare(
    'INSERT INTO products (id, name, description, price, stock, category, image_url) VALUES (?, ?, ?, ?, ?, ?, ?)'
  );

  for (const p of products) {
    insertProduct.run(uuidv4(), p.name, p.description, p.price, p.stock, p.category, p.image_url);
  }

  // Seed admin
  const adminExists = db.prepare("SELECT COUNT(*) as count FROM admins WHERE username = 'admin'").get();
  if (adminExists.count === 0) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    db.prepare('INSERT INTO admins (id, username, password_hash) VALUES (?, ?, ?)')
      .run(uuidv4(), 'admin', passwordHash);
  }

  console.log('Seed selesai: 8 produk + 1 admin default (admin/admin123)');
}

// Allow running directly: node db/seed.js
if (require.main === module) {
  require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
  const db = require('./database');
  const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
  if (count.count > 0) {
    console.log('Data sudah ada, skip seed. Hapus db/ecommerce.db untuk reset.');
  } else {
    seed(db);
  }
}

module.exports = seed;
