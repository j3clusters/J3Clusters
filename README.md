# J3 Clusters Website (Phase 3)

Phase 3 adds PostgreSQL persistence (Prisma), user registration/login for posting properties, persisted property submissions/contact leads, and an admin dashboard to approve owner submissions into live listings.

## Routes

Public

- `/` — Home (`Listing` rows marked `PUBLISHED` from PostgreSQL + featured section)
- `/listings` — Browse + filter listings (loads from PostgreSQL via `/api/listings`)
- `/property/[id]` — Listing details (PostgreSQL)

Forms (stored in PostgreSQL)

- `/register` → `POST /api/register` → `AppUser` + user session cookie (password + confirmation)
- `/login` → `POST /api/auth/user-login`
- `/forgot-password` → `POST /api/auth/forgot-password` (recovery email)
- `/reset-password?token=…` → `POST /api/auth/reset-password` (set new password)
- `/post-property` → `POST /api/submissions` → `PropertySubmission` (`PENDING`)
- `/contact` → `POST /api/leads` → `ContactLead`

Admin

- `/admin/login` → `POST /api/auth/login`
- `/admin` — Dashboard (shows submissions/leads + “Approve” publish flow)

Mock HTTP JSON (still available)

- `GET /api/listings`
- `GET /api/listings/[id]`

## Local setup

1. Create PostgreSQL DB `j3clusters` (exact name flexible; align with `DATABASE_URL`):

```sql
CREATE DATABASE j3clusters;
```

2. Copy `.env.example` → `.env.local` and edit values:

- **`DATABASE_URL`**: include URL-encoded passwords (for example `#`/`@`/spaces must be escaped per URL rules).
- **`ADMIN_JWT_SECRET`**: at least **32 characters** random string.

3. Seed + run:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

The seed script loads initial published listings from `src/data/listings.ts`, then **wipes and recreates listings/submissions/leads/admin users**. Create an admin user **only when** `ADMIN_EMAIL` + `ADMIN_PASSWORD` are set in `.env.local` **before running** `npm run db:seed`.

**Do not re-run seed on production** unless you intend to truncate those tables.

## Production (go live)

1. Provision **PostgreSQL** (Vercel Postgres, Neon, RDS, etc.) and set `DATABASE_URL` in the host’s environment.
2. Set **`NEXT_PUBLIC_APP_URL`** to your public origin (for example `https://your-domain.com`) so password recovery links point to your site.
3. Configure **[Resend](https://resend.com)** (or rely on dev-only behavior): set **`RESEND_API_KEY`** and **`RESEND_FROM_EMAIL`** so owners receive recovery emails. Without these in production, reset requests succeed silently but no email is sent.
4. Set **`USER_JWT_SECRET`** and **`ADMIN_JWT_SECRET`** (each 32+ random characters) in production.
5. Deploy the Next.js app (for example **Vercel**: connect the repo, add env vars, deploy). After the first deploy, run **`npx prisma db push`** against production (or use migrations) so the schema includes `PasswordResetToken`.

```bash
DATABASE_URL="postgresql://…" npx prisma db push
```

## Security notes

- Do **not** commit `.env.local` or real database credentials to git.
- **Rotate** any database password that was shared in chat; treat it as compromised.
- Use strong, unique values for `ADMIN_PASSWORD` and `ADMIN_JWT_SECRET`.

## Project structure

- `prisma/` — Prisma schema + seed
- `src/app` — Next.js routes + API handlers
- `src/lib` — Prisma client, auth helpers, validators
- `src/data` — Seed source data (mock listings)

## Legacy static MVP

The initial static files (`index.html`, `listings.html`, etc.) are still present for reference. The active implementation is the Next.js app under `src/`.

## Environment note (Windows)

If `npm` is not found in your terminal, reinstall Node.js with “Add to PATH” enabled (or use a terminal that loads your Node install).
