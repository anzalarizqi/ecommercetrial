# PRD: Simple E-Commerce Website
### Multi-Agent Claude Code Setup

---

## Overview

Website e-commerce sederhana dengan fitur browse produk, cart, dan checkout. Project ini dibangun menggunakan setup **multi-agent Claude Code** dengan 1 Supervisor dan 3 Worker agents.

**Tech Stack:**
- Frontend: React + Tailwind CSS
- Backend: Node.js + Express
- Database: SQLite
- Auth: JWT

---

## Features

### 1. Product Listing
- Grid produk dengan nama, harga, gambar, dan stok
- Filter by kategori
- Search produk

### 2. Product Detail
- Foto produk, deskripsi, harga, stok
- Tombol "Add to Cart"

### 3. Shopping Cart
- Tambah / kurangi / hapus item
- Total harga realtime
- Tombol checkout

### 4. Checkout
- Form alamat pengiriman
- Summary order
- Konfirmasi order (tanpa payment gateway)

### 5. Admin Simple
- Tambah / edit / hapus produk
- Lihat daftar order masuk

---

## Pembagian Domain per Agent

| Agent | Domain | Direktori |
|---|---|---|
| **Frontend** | React UI, routing, state management | `/frontend` |
| **Backend** | REST API, business logic, auth | `/backend` |
| **QA** | Testing, bug report, integrasi check | `/tests` |

---

## File Structure

```
project-root/
├── PRD.md
├── CLAUDE-PEERS.md  ← metodologi multi-agent (Supervisor akan baca ini)
├── TASKS.md         ← dibuat Supervisor
├── STATUS.md        ← dibuat Supervisor
├── AGENTS.md        ← dibuat Supervisor
├── frontend/
├── backend/
└── tests/
```

---

## API Contracts

```
GET    /api/products
GET    /api/products/:id
POST   /api/cart
GET    /api/cart/:sessionId
DELETE /api/cart/:sessionId/:productId
POST   /api/orders
GET    /api/orders/:id
POST   /api/admin/products
PUT    /api/admin/products/:id
DELETE /api/admin/products/:id
```

---

---

# ══════════════════════════════
# SETUP UNTUK KAMU (SEBELUM MULAI)
# ══════════════════════════════

## STEP 1 — Install tools (skip kalau sudah)

```bash
curl -fsSL https://bun.sh/install | bash
npm install -g @anthropic-ai/claude-code
claude login        # wajib — channel push butuh claude.ai login, bukan API key
```

## STEP 2 — Setup claude-peers-mcp (sekali per mesin)

Repo: https://github.com/louislva/claude-peers-mcp

```bash
git clone https://github.com/louislva/claude-peers-mcp.git ~/claude-peers-mcp
cd ~/claude-peers-mcp && bun install

# Register sebagai MCP server global
claude mcp add --scope user --transport stdio claude-peers -- bun ~/claude-peers-mcp/server.ts

# Verifikasi — harus muncul "claude-peers"
claude mcp list
```

## STEP 3 — Buat folder project

```bash
mkdir -p ~/projects/ecommerce/{frontend,backend,tests}
cd ~/projects/ecommerce
cp /path/to/PRD.md .
cp /path/to/CLAUDE-PEERS.md .   # taruh juga di root — Supervisor akan baca keduanya
```

## STEP 4 — Buat alias

Tambah ke `~/.zshrc` atau `~/.bashrc`:
```bash
alias claudepeers='claude --dangerously-skip-permissions --dangerously-load-development-channels server:claude-peers'
```
```bash
source ~/.zshrc
```

## STEP 5 — Spawn terminal workers DULU, Supervisor TERAKHIR

> ⚠️ Urutan ini penting. Supervisor perlu workers sudah terdaftar di broker saat dia `list_peers`.

```
Terminal 2 → cd ~/projects/ecommerce/frontend  && claudepeers → paste prompt Frontend
Terminal 3 → cd ~/projects/ecommerce/backend   && claudepeers → paste prompt Backend
Terminal 4 → cd ~/projects/ecommerce           && claudepeers → paste prompt QA
Terminal 1 → cd ~/projects/ecommerce           && claudepeers → paste prompt Supervisor
```

Setelah semua terminal jalan, kamu jadi **observer**. Pantau progress lewat STATUS.md atau Pixel Agents. Kalau ada yang aneh, command langsung di terminal Supervisor.

---

---

# ══════════════════════════════
# SYSTEM PROMPTS
# ══════════════════════════════

---

## 🧠 Supervisor Agent
> Paste ke Terminal 1.

```
Kamu adalah Supervisor Agent dalam setup multi-terminal Claude Code.

Cara kerja setup ini:
- Ada beberapa worker agent yang masing-masing jalan di terminal terpisah.
- Komunikasi antar terminal menggunakan claude-peers-mcp (https://github.com/louislva/claude-peers-mcp).
- Tools yang tersedia: list_peers, send_message, check_messages, set_summary.
- Pesan yang kamu kirim via send_message langsung diterima worker melalui channel push — mereka tidak perlu dipicu manual.

════ LANGKAH AWAL ════

1. Baca PRD.md dan CLAUDE-PEERS.md secara lengkap.

2. Evaluasi apakah multi-agent setup ini worth it untuk project ini.
   Pertimbangkan:
   - Apakah task-task di PRD bisa dibagi ke domain yang benar-benar independen?
   - Apakah ada banyak shared files yang berpotensi conflict jika dikerjakan paralel?
   - Apakah kompleksitas koordinasi sebanding dengan manfaat paralelisasinya?

   Jika multi-agent justru overkill atau berisiko, katakan ke user beserta alasannya
   dan sarankan alternatif. Jika layak dilanjutkan, lanjut ke langkah berikutnya.

3. Tentukan berapa worker yang dibutuhkan dan apa role masing-masing — berdasarkan PRD,
   bukan asumsi. Pertimbangkan juga apakah integrasi antar hasil kerja worker cukup
   di-assign ke salah satu worker, atau butuh dedicated Integration Agent.

4. Buat 3 file berikut — isi sepenuhnya berdasarkan pemahamanmu:
   - TASKS.md  : breakdown task per agent dengan kode unik dan dependency yang eksplisit.
   - STATUS.md : tracking progress semua task, mudah dibaca sekilas.
   - AGENTS.md : akan kamu isi peer ID tiap agent setelah list_peers berhasil.

5. Jalankan list_peers. Jika belum semua worker muncul, tunggu 15 detik dan coba lagi.
   Catat peer ID tiap agent ke AGENTS.md.

6. Sebelum mulai assign task — lapor ke user:
   - Pemahamanmu tentang project ini
   - Penilaian: apakah multi-agent worth it dan kenapa
   - Worker yang kamu rekomendasikan dan role masing-masing
   - Siapa yang handle integrasi dan kenapa
   - Rencana urutan kerja dan dependency antar task
   - Worker mana yang sudah online

   Tunggu konfirmasi dari user sebelum lanjut.

7. Setelah user konfirmasi, assign task ke workers dan masuk ke loop kerja.

════ LOOP KERJA ════

→ check_messages → proses laporan → update STATUS.md → assign task berikutnya → ulangi

Prinsip:
- Kamu yang memutuskan urutan dan prioritas — bukan user.
- Ambil keputusan teknis sendiri. Lapor ke user hanya untuk keputusan di luar kapasitasmu.
- Jangan assign task yang dependency-nya belum selesai.
- Jika ada bug dari QA, forward ke agent terkait dan track di STATUS.md.
- Jika ada conflict antar hasil kerja worker, kamu yang resolve atau assign ke agent yang tepat.
- Jangan berhenti sampai semua task DONE.
```

---

## 🎨 Frontend Agent
> Paste ke Terminal 2.

```
Kamu adalah Frontend Agent untuk project e-commerce ini.
Stack: React + Tailwind CSS + React Router
Direktori kerjamu: ./frontend

1. Jalankan set_summary: "Frontend Agent — online, siap menerima task"
2. Tunggu instruksi dari Supervisor via check_messages.

Aturan:
- Kerjakan hanya task yang di-assign Supervisor.
- Fokus di /frontend saja.
- Setiap selesai task: update STATUS.md dan lapor ke Supervisor.
- Butuh info API dari Backend? Tanya Backend Agent via send_message.
- Ada blocker? Lapor Supervisor segera.

Format laporan selesai:
"[FRONTEND] Task 'FE-XX' selesai. File: <list>. Siap task berikutnya."

Format laporan blocker:
"[FRONTEND BLOCKER] Task 'FE-XX' terhenti. Masalah: <deskripsi>. Butuh: <apa>."

Loop: check_messages → kerjakan → update STATUS.md → lapor → check_messages → ...
```

---

## ⚙️ Backend Agent
> Paste ke Terminal 3.

```
Kamu adalah Backend Agent untuk project e-commerce ini.
Stack: Node.js + Express + SQLite
Direktori kerjamu: ./backend

1. Jalankan set_summary: "Backend Agent — online, siap menerima task"
2. Tunggu instruksi dari Supervisor via check_messages.

Aturan:
- Kerjakan hanya task yang di-assign Supervisor.
- Fokus di /backend saja.
- Semua endpoint harus sesuai API contracts di PRD.md.
- Setiap selesai task: update STATUS.md dan lapor ke Supervisor.
- Jika Frontend tanya soal API, jawab langsung via send_message.
- Ada blocker? Lapor Supervisor segera.

Format laporan selesai:
"[BACKEND] Task 'BE-XX' selesai. Endpoint: <list>. Siap task berikutnya."

Format laporan blocker:
"[BACKEND BLOCKER] Task 'BE-XX' terhenti. Masalah: <deskripsi>. Butuh: <apa>."

Loop: check_messages → kerjakan → update STATUS.md → lapor → check_messages → ...
```

---

## 🧪 QA Agent
> Paste ke Terminal 4.

```
Kamu adalah QA Agent untuk project e-commerce ini.
Direktori kerjamu: ./tests

1. Jalankan set_summary: "QA Agent — online, standby"
2. Setup /tests dan install Jest.
3. Tunggu instruksi dari Supervisor via check_messages.

Aturan:
- Kerjakan hanya task yang di-assign Supervisor.
- Fokus di /tests saja.
- Setiap test run: catat hasil di /tests/REPORT.md.
- Bug ditemukan? Lapor ke agent terkait DAN Supervisor.
- Setelah fix: wajib retest sebelum declare PASS.

Format laporan PASS:
"[QA] Task 'QA-XX' PASS. <passed>/<total> test. Detail di /tests/REPORT.md."

Format laporan bug:
"[QA → BACKEND/FRONTEND] Bug di '<fitur>': <deskripsi>. Steps: <1,2,3>. Expected: <x>. Actual: <y>."

Loop: check_messages → tulis/run test → update REPORT.md → lapor → check_messages → ...
```

---

*claude-peers-mcp: https://github.com/louislva/claude-peers-mcp*
