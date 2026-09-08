# Copilot Instructions for Snow Fleet Management

Purpose: Provide concise, actionable guidance so an AI coding agent can be immediately productive in this repo.

1) Big picture
- Runtime: Cloudflare Pages + Workers. The server entry is `src/index.tsx` (Hono app) and the HTML renderer is `src/renderer.tsx`.
- DB: Cloudflare D1 bound as `DB` (see `wrangler.jsonc` d1_databases). Local D1 state lives under `.wrangler/state/v3/d1`.
- Frontend: TypeScript/TSX built with Vite into `dist` and served by Wrangler Pages. Static assets live in `public/static/`.

2) Important files & where to make changes
- `src/index.tsx`: primary API implementation (routes, auth, DB queries). Many endpoints live here — edit for API logic.
- `src/renderer.tsx`: server-side HTML renderer used by Hono JSX renderer.
- `migrations/` and `seed.sql`: DB schema and seed data. Use `wrangler d1 migrations` and `wrangler d1 execute` via scripts.
- `wrangler.jsonc`: Cloudflare project settings and D1 binding (`DB`). Keep compatibility_date in sync when changing runtime.
- `ecosystem.config.cjs`: PM2 wrapper used for local dev orchestration (starts `wrangler pages dev ...`).
- `package.json`: key scripts (dev, dev:sandbox, dev:d1, build, deploy, db:migrate:local, db:seed). Prefer using these scripts.

3) Developer workflows & commands (explicit)
- Local dev (fast, no D1): `npm run dev`
- Local Pages dev with D1 (recommended for API + DB): `npm run dev:d1` or use PM2: `pm2 start ecosystem.config.cjs`
- Build for Pages: `npm run build`
- Deploy to Pages: `npm run deploy` (or `npm run deploy:prod` for the production project name)
- Apply local migrations: `npm run db:migrate:local`
- Load seed data (local D1): `npm run db:seed`
- Quick health test: `npm run test` (runs `curl http://localhost:3000`)

4) Project-specific conventions & patterns
- Routes are implemented inline in `src/index.tsx` (one large Hono app). Order matters for dynamic routes: e.g., `/api/providers/search` is declared before `/api/providers/:userId`.
- JSON stored in DB: several fields (e.g., `service_areas`, `services_offered`) are stored as JSON strings; code uses `JSON.stringify` on write and `JSON.parse` on read.
- Minimal error handling pattern: endpoints return `c.json({ error: 'msg' }, status)` on failures and consistent 4xx/5xx codes.
- Auth: There are placeholder implementations in `src/index.tsx` — a simple base64-style JWT encode/decode and `hashPassword` string prefixing. Treat these as temporary; replace with proper `bcrypt` and secure JWT/HMAC during security work.

5) Integration points & external dependencies
- Cloudflare D1: migrations and `wrangler d1` commands in `package.json`.
- Wrangler Pages: preview & deploy via `wrangler pages` (scripts `dev:sandbox`, `dev:d1`, `deploy`).
- Hono framework: server code uses Hono and `@hono/jsx-renderer`.
- Types & build: TypeScript, Vite. DevDependencies include `wrangler` and Cloudflare types.

6) Things an agent must not assume
- Do not assume auth or hash functions are production-ready — they are intentionally placeholders in `src/index.tsx`.
- Do not assume separate route files exist; most server-side logic is centralized in `src/index.tsx`.

7) Quick code examples to locate patterns
- To find DB usage: search for `.env.DB.prepare(` or `.env.DB.prepare("SELECT` in `src/index.tsx`.
- To change a provider-facing API: edit `app.post('/api/services', ...)` or provider profile handlers in `src/index.tsx`.
- To change D1 binding name or project id: edit `wrangler.jsonc` (d1_databases block).

8) Security & secrets
- JWT secret and DB credentials must be provided via Wrangler secrets for production: use `npx wrangler pages secret put JWT_SECRET --project-name <name>`.
- Replace the placeholder `encodeJWT`/`hashPassword` with proper libraries (`jsonwebtoken` or `jose`, `bcrypt`) and update tests and scripts accordingly.

9) When making changes
- Keep edits small and focused. Update `migrations/` for schema changes, then run `npm run db:migrate:local` and `npm run db:seed` to verify locally.
- Run `npm run build` + `npm run dev:d1` to test both frontend and API together.

10) Questions for the maintainer (leave as TODO comments when unsure)
- Confirm production `wrangler` project name (used by `deploy:prod`).
- Confirm which secrets must be present in CI (JWT_SECRET, DB ids).

If anything here is unclear or you want more details (e.g., route map or a checklist for hardening auth), tell me which area to expand.
