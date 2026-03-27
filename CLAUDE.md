# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Simple e-commerce website (product listing, cart, checkout, admin panel) built with a **multi-agent Claude Code** setup using `claude-peers-mcp` for inter-terminal communication.

**Tech Stack:**
- Frontend: React + Tailwind CSS + React Router (`/frontend`)
- Backend: Node.js + Express + SQLite + JWT (`/backend`)
- Tests: Jest (`/tests`)

> See `CLAUDE-PEERS.md` for the full reusable multi-agent framework guide.

---

## Multi-Agent Setup

### One-time machine setup
```bash
curl -fsSL https://bun.sh/install | bash
npm install -g @anthropic-ai/claude-code
claude login  # required for push channels
git clone https://github.com/louislva/claude-peers-mcp.git ~/claude-peers-mcp
cd ~/claude-peers-mcp && bun install
claude mcp add --scope user --transport stdio claude-peers -- bun ~/claude-peers-mcp/server.ts
# Add to ~/.bashrc or ~/.zshrc:
alias claudepeers='claude --dangerously-skip-permissions --dangerously-load-development-channels server:claude-peers'
```

### Starting a session (order matters)
```bash
# Terminal 2 — Frontend worker
cd ./frontend && claudepeers
# Paste Frontend Agent prompt from PRD-ecommerce-multiagent.md

# Terminal 3 — Backend worker
cd ./backend && claudepeers
# Paste Backend Agent prompt from PRD-ecommerce-multiagent.md

# Terminal 4 — QA worker (runs from project root)
cd ./  && claudepeers
# Paste QA Agent prompt from PRD-ecommerce-multiagent.md

# Terminal 1 — Supervisor (LAST)
cd ./ && claudepeers
# Paste Supervisor prompt from PRD-ecommerce-multiagent.md
```

---

## Architecture

### Agent Domains
| Agent | Directory | Responsibility |
|---|---|---|
| Frontend | `/frontend` | React UI, routing, state management |
| Backend | `/backend` | REST API, business logic, auth |
| QA | `/tests` | Testing, bug reports, integration checks |
| Supervisor | `/` (root) | Coordination, task assignment, conflict resolution |

### API Contracts (Backend → Frontend)
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

### Coordination Files (created by Supervisor at session start)
- `TASKS.md` — task breakdown with unique codes and dependencies
- `STATUS.md` — progress tracking for all tasks
- `AGENTS.md` — peer IDs for each agent (populated after `list_peers`)
- `RESUME.md` — written by Supervisor before hitting context limit to enable cold resume next session

---

## Production Build & Run (Local)

The app runs as a **single process** locally — Express serves both the API and the compiled React frontend.

### First-time or after frontend code changes
```bash
cd frontend
npm run build
```
This compiles React into `frontend/dist/`.

### Run the app
```bash
cd backend
npm start
```
Open **http://localhost:3001** — everything served from one port.

### How it works
- `backend/server.js` serves `frontend/dist` as static files (only if dist exists)
- All `/api/*` routes are handled by Express
- All other routes fall back to `index.html` (React Router SPA)
- `frontend/src/api/api.js` uses `VITE_API_URL` env var, falls back to `/api` for local dev

### After any frontend change — rebuild before testing
```bash
cd frontend && npm run build
# then restart backend
cd ../backend && npm start
```

---

## Deployment (Production)

**Architecture:** Frontend (Vercel) + Backend (Railway) — separate services.

| Platform | Service | URL |
|----------|---------|-----|
| Vercel   | Frontend — React static build | https://ecommercetrial-nu.vercel.app |
| Railway  | Backend — Express + SQLite    | https://ecommercetrial-production.up.railway.app |

### Railway (Backend) env vars
```
JWT_SECRET=<random 32-byte hex string>
CORS_ORIGIN=https://your-vercel-url.vercel.app   # no trailing slash!
```
> PORT is set automatically by Railway — do not set manually.

### Vercel (Frontend) env vars
```
VITE_API_URL=https://your-railway-url.up.railway.app/api
```
> Set Root Directory to `frontend` when importing the repo on Vercel.

### Re-deploy flow
- **Backend change** → push to master → Railway auto-redeploys
- **Frontend change** → push to master → Vercel auto-redeploys (runs `npm run build`)

### Gotchas
- `CORS_ORIGIN` must NOT have a trailing slash — browser origin never has one
- `frontend/dist` is gitignored — Railway (backend-only) will not serve static files, which is correct
- `nixpacks.toml` in root tells Railway to use Node.js 20 and run from `/backend`

---

## Worker Rules

- Each worker stays in its own directory and does not modify files outside it.
- Workers report completion: `"[ROLE] Task 'XX-##' selesai. Siap task berikutnya."`
- Workers report blockers: `"[ROLE BLOCKER] Task 'XX-##' terhenti. Masalah: <desc>. Butuh: <what>."`
- QA logs all test results to `/tests/REPORT.md` and must retest after every fix before declaring PASS.
- Frontend asks Backend directly (via `send_message`) for API clarifications.

## Supervisor Rules

- **At session start, read STATUS.md first** to understand what's already DONE — do not re-assign completed tasks.
- Supervisor reads PRD and evaluates whether multi-agent is worth it before assigning tasks.
- Loop: `check_messages → process reports → update STATUS.md → assign next task → repeat`
- Never assign a task whose dependencies are not yet complete.
- Resolves file conflicts between workers directly or by delegation.
