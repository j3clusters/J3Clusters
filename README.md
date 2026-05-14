# J3 Clusters Website (Phase 3)

Phase 3 adds PostgreSQL persistence (Prisma), user registration/login for posting properties, persisted property submissions/contact leads, and an admin dashboard to approve owner submissions into live listings.

## Routes

Public

- `/` — Home (`Listing` rows marked `PUBLISHED` from PostgreSQL + featured section)
- `/listings` — Browse all (optional filters; legacy `?mode=buy` / `?mode=rent` redirect to the URLs below)
- `/listings/buy` — Sale listings only
- `/listings/rent` — Rental listings only
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

4. Open **http://localhost:3003** in your browser (the dev server uses port **3003** on purpose so it does not clash with other apps on 3000/3001). If nothing loads, read the terminal: Next.js prints the exact URL, or an error if the port is busy.

**Blank page or HTTP 500 in dev** (for example `Cannot find module './NNN.js'` in the terminal): stop the dev server, delete the `.next` folder, then run `npm run dev` again. Or run **`npm run dev:clean`** once (clears `.next` and starts dev on port 3003).

**Quick API check** (with dev or `npm run build` + `PORT=3008 npm run start`): set `SMOKE_BASE_URL` to that server (for example `http://127.0.0.1:3003`) and run **`npm run smoke`**. Optional: set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in the environment to include the admin login API in the check.

The seed script loads initial published listings from `src/data/listings.ts`, then **wipes and recreates listings/submissions/leads/admin users**. Create an admin user **only when** `ADMIN_EMAIL` + `ADMIN_PASSWORD` are set in `.env.local` **before running** `npm run db:seed`.

**Do not re-run seed on production** unless you intend to truncate those tables.

## Production (go live)

1. Provision **PostgreSQL** (Vercel Postgres, Neon, RDS, etc.) and set `DATABASE_URL` in the host’s environment.
2. Set **`NEXT_PUBLIC_APP_URL`** to your public origin (for example `https://your-domain.com`) so password recovery links point to your site.
3. Configure **[Resend](https://resend.com)**: set **`RESEND_API_KEY`** and **`RESEND_FROM_EMAIL`**. In production, forgot-password returns **503** until both are set, so misconfiguration is obvious. In development, the API shows a **setup hint** and prints the reset URL in the **terminal** when email is not configured.
4. **Password reset email troubleshooting**: Use a **verified sender domain** in Resend (or their test `onboarding@resend.dev`, which only delivers to **your own** Resend-account email). Check the **spam** folder. Watch **server logs** for `[password-reset] Resend API error` if the API rejects the send. Ensure **`NEXT_PUBLIC_APP_URL`** matches your live site so links in the email are correct.
5. Set **`USER_JWT_SECRET`** and **`ADMIN_JWT_SECRET`** (each 32+ random characters) in production.
6. Deploy the Next.js app (for example **Vercel**: connect the repo, add env vars, deploy). After the first deploy, run **`npx prisma db push`** against production (or use migrations) so the schema includes `PasswordResetToken`.

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
- `src/lib` — Prisma client, auth helpers, validators, email (Resend)
- `src/data` — Seed source data (mock listings)
- `prototype-static/` — Legacy static HTML/CSS/JS mockup (not used by Next.js)
- `scripts/` — TypeScript tooling (`db:seed` helpers, smoke check)
- `var/listing-recycle-bin.json` — Local-only recycle metadata (gitignored; created at runtime)


If `npm` is not found in your terminal, reinstall Node.js with “Add to PATH” enabled (or use a terminal that loads your Node install).
