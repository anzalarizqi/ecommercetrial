# Test Report — E-Commerce Project

**QA Agent:** Online
**Last Updated:** 2026-03-27

---

## Setup

| Item | Status |
|------|--------|
| Jest installed | ✓ |
| supertest installed | ✓ |
| axios installed | ✓ |
| jest.config.js | ✓ |
| setup.js (baseURL) | ✓ |
| tests/backend/ | ✓ |
| tests/frontend/ | ✓ |

---

## Task Status

| Task | Status | Result | Date |
|------|--------|--------|------|
| QA-01 | DONE | Setup OK, 0 tests (no test files yet) | 2026-03-26 |
| QA-02 | DONE | **PASS 20/20** — All backend API tests passed | 2026-03-26 |
| QA-03 | DONE | **PASS 25/25** — 2 bugs ditemukan di Checkout (BUG-01, BUG-02) | 2026-03-26 |
| QA-03 Retest | DONE | **PASS 25/25** — BUG-01 & BUG-02 verified FIXED | 2026-03-27 |
| QA-04 | DONE | **PASS 9/9** — Full integration flow PASS | 2026-03-27 |

---

## Test Runs

### QA-01 — Setup Verification
- Date: 2026-03-26
- Command: `npm test`
- Result: **PASS** (0 test suites, 0 tests — no test files yet, config OK)

---

### QA-02 — Backend API Tests
- Date: 2026-03-26
- Command: `npm test -- --forceExit`
- Duration: 0.893s
- Result: **PASS — 20/20 tests passed, 1 test suite**

#### Test Results Detail

| # | Suite | Test | Status |
|---|-------|------|--------|
| 1 | Server health | GET / → status 200, API running | ✓ PASS |
| 2 | Products API | GET /api/products → 200, array dengan field wajib | ✓ PASS |
| 3 | Products API | GET /api/products?category=elektronik → hanya kategori elektronik | ✓ PASS |
| 4 | Products API | GET /api/products?search=laptop → produk mengandung "laptop" | ✓ PASS |
| 5 | Products API | GET /api/products/:id → 200 dengan data produk valid | ✓ PASS |
| 6 | Products API | GET /api/products/nonexistent-id → 404 | ✓ PASS |
| 7 | Cart API | POST /api/cart → 201, item masuk cart | ✓ PASS |
| 8 | Cart API | POST /api/cart tanpa sessionId → 400 | ✓ PASS |
| 9 | Cart API | GET /api/cart/:sessionId → 200, array dengan field nama produk | ✓ PASS |
| 10 | Cart API | DELETE /api/cart/:sessionId/:productId → 200, item terhapus | ✓ PASS |
| 11 | Orders API | POST /api/orders → 201, return { orderId } | ✓ PASS |
| 12 | Orders API | POST /api/orders tanpa customerName → 400 | ✓ PASS |
| 13 | Orders API | POST /api/orders items kosong → 400 | ✓ PASS |
| 14 | Orders API | GET /api/orders/:orderId → 200, detail order dengan items | ✓ PASS |
| 15 | Orders API | GET /api/orders/nonexistent-id → 404 | ✓ PASS |
| 16 | Admin Auth | POST /api/admin/login dengan kredensial benar → 200, return token | ✓ PASS |
| 17 | Admin Auth | POST /api/admin/login dengan password salah → 401 | ✓ PASS |
| 18 | Admin Auth | POST /api/admin/products TANPA token → 401 | ✓ PASS |
| 19 | Admin Auth | POST /api/admin/products DENGAN token valid → 201 | ✓ PASS |
| 20 | Admin Auth | DELETE /api/admin/products/:id (cleanup QA product) → 200 | ✓ PASS |

---

### QA-03 — Frontend Component Tests
- Date: 2026-03-26
- Command: `npx jest --testPathPatterns=frontend --forceExit`
- Duration: ~5.8s
- Result: **PASS — 25/25 tests passed, 1 test suite**

#### Test Results Detail

| # | Suite | Test | Status |
|---|-------|------|--------|
| 1 | formatRupiah | format 12999000 → mengandung "12.999.000" | ✓ PASS |
| 2 | formatRupiah | format 89000 → mengandung "89.000" | ✓ PASS |
| 3 | formatRupiah | mengandung prefix Rp atau IDR | ✓ PASS |
| 4 | formatRupiah | format 0 → tidak error | ✓ PASS |
| 5 | ProductList | render loading saat fetch sedang berjalan | ✓ PASS |
| 6 | ProductList | render semua produk setelah fetch berhasil | ✓ PASS |
| 7 | ProductList | render pesan error saat fetch gagal | ✓ PASS |
| 8 | ProductList | render "Produk tidak ditemukan" saat data kosong | ✓ PASS |
| 9 | ProductList | input search ada di halaman | ✓ PASS |
| 10 | ProductList | select kategori ada dengan opsi "Semua" | ✓ PASS |
| 11 | ProductDetail | render loading saat fetch | ✓ PASS |
| 12 | ProductDetail | render nama, deskripsi, dan harga produk | ✓ PASS |
| 13 | ProductDetail | tombol "Add to Cart" ada saat stok tersedia | ✓ PASS |
| 14 | ProductDetail | tombol disabled "Stok Habis" saat stock = 0 | ✓ PASS |
| 15 | ProductDetail | klik Add to Cart memanggil addToCart dari useCart | ✓ PASS |
| 16 | ProductDetail | render error saat produk tidak ditemukan (404) | ✓ PASS |
| 17 | Cart | render "Keranjang kosong" saat cart empty | ✓ PASS |
| 18 | Cart | render nama produk dalam cart | ✓ PASS |
| 19 | Cart | menampilkan total harga yang benar (Rp 26.087.000) | ✓ PASS |
| 20 | Cart | klik hapus (✕) memanggil removeFromCart | ✓ PASS |
| 21 | Cart | klik tombol − memanggil updateQuantity dengan qty - 1 | ✓ PASS |
| 22 | Checkout | render form dengan 4 field wajib | ✓ PASS |
| 23 | Checkout | submit form kosong → tampil semua pesan error validasi | ✓ PASS |
| 24 | Checkout | submit tanpa nama lengkap → hanya error nama | ✓ PASS |
| 25 | Checkout | ringkasan order menampilkan produk dan harga | ✓ PASS |

#### Bugs Ditemukan
- **BUG-01**: `sessionId` digunakan di `createOrder()` (Checkout.jsx:76) tapi tidak di-destructure dari `useCart()` (baris 35). Akan selalu `undefined`.
- **BUG-02**: Payload `createOrder` tidak cocok dengan backend. Frontend kirim `{ sessionId, shippingAddress:{name,address,city,phone} }`, backend harap `{ customerName, customerEmail, address, items }`. Order checkout akan selalu gagal 400.

---

### QA-03 Retest — Verify BUG-01 & BUG-02 Fix
- Date: 2026-03-27
- Command: `npx jest --testPathPatterns=frontend --forceExit`
- Duration: ~13.8s
- Result: **PASS — 25/25 tests passed**
- BUG-01 VERIFIED FIXED: `sessionId` sudah di-destructure dari `useCart()` (Checkout.jsx:36)
- BUG-02 VERIFIED FIXED: Payload `createOrder` sekarang `{ customerName, customerEmail, address, items }` (Checkout.jsx:77-82)

---

### QA-04 — Integration Test: Full E-Commerce Flow
- Date: 2026-03-27
- Command: `npx jest --testPathPatterns=integration --forceExit`
- Duration: ~6.05s
- Result: **PASS — 9/9 tests passed, 1 test suite**
- File: `/tests/backend/integration.test.js`

#### Test Results Detail

| # | Step | Test | Status |
|---|------|------|--------|
| 1 | Browse Products | GET /api/products → 200, produk tersedia dengan field lengkap | ✓ PASS |
| 2 | Browse Products | GET /api/products/:id → 200, detail produk valid | ✓ PASS |
| 3 | Tambah ke Cart | POST /api/cart → 201, item berhasil masuk cart | ✓ PASS |
| 4 | Tambah ke Cart | GET /api/cart/:sessionId → 200, cart berisi produk yang ditambahkan | ✓ PASS |
| 5 | Checkout | POST /api/orders → 201, order berhasil dibuat | ✓ PASS |
| 6 | Checkout | POST /api/orders tanpa customerEmail → 400 | ✓ PASS |
| 7 | Checkout | Stok produk berkurang setelah order | ✓ PASS |
| 8 | Konfirmasi Order | GET /api/orders/:orderId → 200, detail order dengan items | ✓ PASS |
| 9 | Konfirmasi Order | GET /api/orders/nonexistent-id → 404 | ✓ PASS |

---

## Known Bugs

| ID | Komponen | Deskripsi | Status |
|----|----------|-----------|--------|
| BUG-01 | Checkout.jsx | `sessionId` digunakan di createOrder tapi tidak di-destructure dari useCart (akan jadi `undefined`) | **FIXED & VERIFIED** 2026-03-27 |
| BUG-02 | Checkout.jsx | Payload createOrder tidak cocok dengan backend API: Frontend mengirim `{ sessionId, shippingAddress }` tapi backend mengharapkan `{ customerName, customerEmail, address, items }` | **FIXED & VERIFIED** 2026-03-27 |
