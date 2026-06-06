---
name: run-chanbong13
description: Run, test, and screenshot the LifePilot Next.js app. Use when asked to run the app, verify a feature, take a screenshot, test a fix, or confirm registration/login works.
---

LifePilot is a Next.js 15 full-stack app (App Router) deployed at **https://lifepilot-ashen.vercel.app**. It uses Supabase PostgreSQL, NextAuth v5, and Prisma. Testing happens via Playwright's Chromium against a local dev server — the Vercel production URL is blocked from datacenter IPs (Vercel WAF: `x-deny-reason: host_not_allowed`).

The smoke test driver lives at `.claude/skills/run-chanbong13/smoke.mjs`.

## Prerequisites

Playwright's Chromium is pre-installed:
```bash
node -e "const {chromium}=require('/opt/node22/lib/node_modules/playwright/index.mjs');console.log('ok')"
# ok
/opt/pw-browsers/chromium-1194/chrome-linux/chrome --version
# Chromium 131.x
```

## Build

```bash
cd /home/user/Chanbong13
npm install --legacy-peer-deps           # already done; re-run if node_modules missing
npx prisma generate
DATABASE_URL="..." NEXTAUTH_URL="http://localhost:3000" NEXTAUTH_SECRET="x" \
  GOOGLE_CLIENT_ID="x" GOOGLE_CLIENT_SECRET="x" DATABASE_URL_DIRECT="..." \
  npx next build                         # ~2 min; exit 0 = clean
```

## Run (agent path)

### 1. Start the dev server

The app needs real env vars. Copy from `.github/workflows/deploy.yml` for DB URLs, use `http://localhost:3000` for NEXTAUTH_URL.

```bash
export DATABASE_URL="postgresql://postgres:FreeDom%40020401CB@db.dwkmjktlyvjnhluzrawc.supabase.co:6543/postgres?pgbouncer=true&sslmode=require&connect_timeout=15"
export DATABASE_URL_DIRECT="postgresql://postgres:FreeDom%40020401CB@db.dwkmjktlyvjnhluzrawc.supabase.co:5432/postgres?sslmode=require"
export NEXTAUTH_URL="http://localhost:3000"
export NEXTAUTH_SECRET="lifepilot-local-test-secret"
export GOOGLE_CLIENT_ID="<from GitHub secret>"
export GOOGLE_CLIENT_SECRET="<from GitHub secret>"
export AUTH_TRUST_HOST=true

npx next start -p 3000 &
echo $! > /tmp/next.pid
until curl -sf http://localhost:3000 >/dev/null 2>&1; do sleep 1; done
echo "ready"
```

> **Note**: Port 5432 and 6543 to Supabase are blocked from this container. The server starts but DB-dependent API calls (login, register, data) will fail with "Internal server error." Pages and static routes render correctly without DB.

### 2. Run the smoke test

```bash
node .claude/skills/run-chanbong13/smoke.mjs
# Screenshots: /tmp/lifepilot-test/screenshots/
# Results:     /tmp/lifepilot-test/results.json
```

**What passes without DB**: landing page, register/login page renders, Google sign-in button, auth guard (unauthenticated API returns 401), all page routes redirect to login correctly.

**What needs real DB**: registration submit, login credentials, dashboard data, all CRUD operations.

To test DB features, run the smoke test from **GitHub Actions** (runner has open outbound to Supabase) or from the user's machine (not this container).

### 3. Take a screenshot of a specific page

```javascript
// inline Playwright — no server needed for static pages
import { chromium } from '/opt/node22/lib/node_modules/playwright/index.mjs';
const b = await chromium.launch({
  executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'],
  headless: true,
});
const ctx = await b.newContext({ ignoreHTTPSErrors: true });
const page = await ctx.newPage();
await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
await page.screenshot({ path: '/tmp/screenshot.png' });
await b.close();
```

### 4. Stop the server

```bash
kill $(cat /tmp/next.pid)
```

## Run (human path)

```bash
npm run dev    # starts on http://localhost:3000, hot-reload
```

Requires a `.env.local` with the same vars listed above.

## Production deploy

Push to `claude/lifepilot-fullstack-app-S0Q3l` — GitHub Actions runs `.github/workflows/deploy.yml` automatically. The workflow:
1. Pushes DB schema via `prisma db push` (GitHub runner can reach Supabase port 5432)
2. Sets all env vars in Vercel production
3. Deploys to https://lifepilot-ashen.vercel.app

NEXTAUTH_URL is hardcoded to `https://lifepilot-ashen.vercel.app` (stable alias) so Google OAuth redirect URIs never change between deployments.

## Gotchas

- **Vercel WAF blocks container IPs**: `curl https://lifepilot-ashen.vercel.app` → HTTP 403 `x-deny-reason: host_not_allowed`. Test against localhost instead.
- **`allowedOrigins` in next.config replaces same-origin check**: Setting `experimental.serverActions.allowedOrigins` to any non-empty array in Next.js 16 replaces (not augments) the default same-origin trust. Had `["localhost:3000"]` — blocked all production domains. Fixed by removing the key entirely.
- **Supabase requires SSL**: DB URLs must include `?sslmode=require`; without it connections are rejected from external environments.
- **Two DB URLs needed**: Vercel serverless uses pgBouncer (port 6543, `?pgbouncer=true`) for runtime; GitHub Actions runner uses direct connection (port 5432) for `prisma db push`. `directUrl` in `prisma/schema.prisma` routes migrations to the direct URL.
- **AUTH_TRUST_HOST=true required locally**: NextAuth v5 rejects `localhost` as an untrusted host without this env var.
- **Playwright ignoreHTTPSErrors**: Vercel's TLS cert triggers `ERR_CERT_AUTHORITY_INVALID` in this container's Chromium. Always use `ignoreHTTPSErrors: true` in context options.
- **Registration "Internal server error"**: Confirmed DB-only bug — the catch block in `/api/auth/register` swallows any Prisma connection error. Fix: ensure DATABASE_URL is reachable from Vercel's runtime.

## Troubleshooting

| Symptom | Fix |
|---|---|
| `Host not in allowlist` on every page | Not from Next.js — it's Vercel WAF blocking your IP. Test via localhost |
| `UntrustedHost: Host must be trusted` in server logs | Add `AUTH_TRUST_HOST=true` to env |
| `P1001: Can't reach database server` | Port 5432/6543 blocked from this container. Use GitHub Actions to run DB operations |
| Registration returns "Internal server error" | DB connection failing at runtime. Verify `DATABASE_URL` in Vercel has correct SSL params |
| Google sign-in `redirect_uri_mismatch` | Add `https://lifepilot-ashen.vercel.app/api/auth/callback/google` to authorized redirect URIs in Google Cloud Console |
| `error: Object literal may only specify known properties, and 'eslint' does not exist in type 'NextConfig'` | Next.js 16 removed `eslint` key from NextConfig. Remove from `next.config.ts` |
