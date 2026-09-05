# negun — Paid OTT

pnpm monorepo: Next.js (`apps/web`, Vercel) + NestJS (`apps/api`, Railway) + Railway PostgreSQL + Mux signed playback + QPay.

## Local setup

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
createdb negun   # or start docker compose postgres
pnpm install
pnpm db:generate
pnpm --filter api prisma migrate dev --name init
pnpm db:seed
pnpm dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/health
- Login with any `+976` 8-digit number. In mock SMS the OTP is shown on the login screen and in API logs.
- First admin: `ADMIN_BOOTSTRAP_PHONE=+97699000000` (set in `apps/api/.env`).

## Deploy

**Railway (API + Postgres)**

1. Create a Railway project, add PostgreSQL.
2. Add a service from this repo (root). `railway.toml` builds `api` and health-checks `/health`.
3. Set variables from `apps/api/.env.example`. `DATABASE_URL` comes from the Postgres plugin.
4. Public domain becomes `APP_URL` and Mux/QPay webhook host:
   - Mux webhook: `https://<api>/v1/webhooks/mux`
   - QPay callback: `https://<api>/v1/webhooks/qpay`

**Vercel (web)**

1. Import the same Git repo. Root / framework Next.js. `vercel.json` builds `apps/web`.
2. Env: `NEXT_PUBLIC_API_URL=https://<railway-api-domain>`, `NEXT_PUBLIC_APP_URL=https://<vercel-domain>`.
3. Add the Vercel origin to API `WEB_ORIGIN`.

## Mux

Create a signing key in the same Mux environment as the API token. Use `playback_policies: ["signed"]`. Never put Mux secrets in Vercel.

## Payments

Without QPay credentials the API returns a mock invoice. Signed-in users can call `POST /v1/payments/simulate/:paymentId` from the subscribe screen.
