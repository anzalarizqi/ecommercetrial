# TASKS.md — E-Commerce Project

## Backend Tasks

| Kode  | Task                                 | Dependency | Status  |
|-------|--------------------------------------|------------|---------|
| BE-01 | Setup project Express + SQLite + JWT | —          | TODO    |
| BE-02 | Schema DB + seed data (products)     | BE-01      | TODO    |
| BE-03 | Products API (GET /api/products, GET /api/products/:id) | BE-02 | TODO |
| BE-04 | Cart API (POST/GET/DELETE /api/cart) | BE-02      | TODO    |
| BE-05 | Orders API (POST /api/orders, GET /api/orders/:id) | BE-02 | TODO |
| BE-06 | Admin API (CRUD produk + GET orders) | BE-03,BE-05| TODO    |
| BE-07 | Auth middleware JWT (protect admin)  | BE-01      | TODO    |

## Frontend Tasks

| Kode  | Task                                        | Dependency | Status  |
|-------|---------------------------------------------|------------|---------|
| FE-01 | Setup project React + Tailwind + Router     | —          | TODO    |
| FE-02 | Product Listing page (grid, filter, search) | FE-01      | TODO    |
| FE-03 | Product Detail page                         | FE-01      | TODO    |
| FE-04 | Shopping Cart (state, tambah/kurangi/hapus) | FE-01      | TODO    |
| FE-05 | Checkout page (form alamat, summary, konfirmasi) | FE-04  | TODO    |
| FE-06 | Admin panel (product CRUD + daftar order)   | FE-01      | TODO    |
| FE-07 | Integrasi API Backend (ganti mock → real)   | BE-03,BE-04,BE-05,BE-06,FE-02,FE-03,FE-04,FE-05,FE-06 | TODO |

## QA Tasks

| Kode  | Task                                          | Dependency                | Status  |
|-------|-----------------------------------------------|---------------------------|---------|
| QA-01 | Setup Jest + environment test                 | —                         | TODO    |
| QA-02 | Test Backend API (products, cart, orders)     | BE-03,BE-04,BE-05,BE-06   | TODO    |
| QA-03 | Test Frontend komponen utama                  | FE-02,FE-03,FE-04,FE-05   | TODO    |
| QA-04 | Integration test full flow (browse→cart→checkout) | FE-07,QA-02           | TODO    |

---

## Catatan Integrasi

- FE-07 adalah titik integrasi FE↔BE. Di-assign ke Frontend Agent.
- Frontend boleh build dengan mock data dulu (FE-01 s/d FE-06), baru switch ke real API di FE-07.
- API contracts sudah fix di PRD — Backend tidak boleh ubah tanpa lapor Supervisor.
