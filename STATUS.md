# STATUS.md — E-Commerce Project
> Update terakhir: 2026-03-27
> **🎉 PROJECT SELESAI & LIVE** — 54/54 test PASS, deployed ke Vercel + Railway

## Legend
- `TODO` — belum dimulai
- `IN_PROGRESS` — sedang dikerjakan
- `DONE` — selesai & verified
- `BLOCKED` — terhenti, butuh input
- `FAILED` — gagal QA, perlu fix

---

## Backend

| Kode  | Task                        | Status      | Catatan |
|-------|-----------------------------|-------------|---------|
| BE-01 | Setup project               | DONE        | Express+SQLite+JWT, server jalan di :3001 |
| BE-02 | Schema DB + seed            | DONE        | 8 produk (3 kategori) + admin default, UUID TEXT PKs |
| BE-03 | Products API                | DONE        | GET /api/products (filter category+search), GET /api/products/:id |
| BE-04 | Cart API                    | DONE        | POST/GET/DELETE cart, validasi stok, JOIN products |
| BE-05 | Orders API                  | DONE        | POST /api/orders (items array, kurangi stok), GET /api/orders/:id |
| BE-06 | Admin API                   | DONE        | GET/POST/PUT/DELETE products + GET orders, semua protected requireAuth |
| BE-07 | Auth middleware JWT          | DONE        | requireAuth middleware, POST /api/admin/login, token 24h |

## Frontend

| Kode  | Task                        | Status      | Catatan |
|-------|-----------------------------|-------------|---------|
| FE-01 | Setup project               | DONE        | Vite+React+Tailwind+Router, npm install OK |
| FE-02 | Product Listing             | DONE        | Grid responsive, search, filter kategori, mock data |
| FE-03 | Product Detail              | DONE        | Detail produk, Add to Cart via CartContext |
| FE-04 | Shopping Cart               | DONE        | Cart page, +/−/hapus qty, total realtime |
| FE-05 | Checkout                    | DONE        | Form validasi, order summary, modal sukses, clearCart+redirect |
| FE-06 | Admin panel                 | DONE        | Tab produk+order, modal tambah/edit/hapus |
| FE-07 | Integrasi API Backend       | DONE        | Checkout & Admin pakai real API; Admin login JWT; semua mock dihapus |
| FE-08 | UI Redesign                 | DONE        | "Nusantara Luxe" — Cormorant Garamond + DM Sans, amber accent, category pills, stagger animations, build OK |
| FE-09 | Vercel Deployment Config    | DONE        | VITE_API_URL env var di api.js, vercel.json rewrites untuk React Router, build OK |

## QA

| Kode  | Task                        | Status      | Catatan |
|-------|-----------------------------|-------------|---------|
| QA-01 | Setup Jest                  | DONE        | npm test OK, 0 tests, exit 0 |
| QA-02 | Test Backend API            | DONE        | PASS 20/20 tests — 2026-03-26 |
| QA-03 | Test Frontend komponen      | DONE        | PASS 25/25 — 2026-03-26. 2 bug ditemukan (lihat Bug Tracker) |
| QA-04 | Integration test full flow  | DONE        | PASS 9/9 — 2026-03-27. 34/34 total test PASS |

## Deployment

| Platform | Service | URL | Status |
|----------|---------|-----|--------|
| Railway  | Backend (Express + SQLite) | https://ecommercetrial-production.up.railway.app | LIVE ✅ |
| Vercel   | Frontend (React)           | https://ecommercetrial-nu.vercel.app             | LIVE ✅ |

### Env vars Railway
- `JWT_SECRET` — set ✅
- `CORS_ORIGIN` = `https://ecommercetrial-nu.vercel.app` ✅

### Env vars Vercel
- `VITE_API_URL` = `https://ecommercetrial-production.up.railway.app/api` ✅

---

## Bug Tracker

| ID     | Ditemukan oleh | Fitur      | Deskripsi | Di-assign ke | Status |
|--------|----------------|------------|-----------|--------------|--------|
| BUG-01 | QA (QA-03) | Checkout | `sessionId` tidak di-destructure dari `useCart()` di Checkout.jsx — selalu `undefined` | Frontend | FIXED |
| BUG-02 | QA (QA-03) | Checkout | Payload `createOrder` tidak cocok BE: FE kirim `{sessionId, shippingAddress}`, BE harap `{customerName, customerEmail, address, items}`. Juga `res.data.id` harusnya `res.data.data.id`. Frontend perlu tambah field email di form. | Frontend | FIXED |
