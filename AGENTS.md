# AGENTS.md

## Cursor Cloud specific instructions

This is a **Next.js 15** bilingual portfolio site (English/Turkish) with an admin CMS. See `README.md` for standard commands (`npm run dev`, `npm run lint`, `npm run build`).

### Key development notes

- **No external services required for local dev.** Data persistence falls back to local filesystem (`data/*.json` for structured data, `public/uploads/` for images). Supabase, Upstash Redis, and Vercel Blob are all optional cloud backends.
- **`.env.local` must exist** with `AUTH_SECRET` and `ADMIN_PASSWORD` set for admin login to work. Copy from `.env.example` if missing. Use any values for local dev (e.g. `ADMIN_PASSWORD=admin123`).
- **Dev server** runs on port 3000: `npm run dev` (uses Turbopack).
- **Admin panel** is at `/en/admin/login` (or `/tr/admin/login`). Password-only login — no username needed.
- The app uses the **Next.js App Router** with `next-intl` for i18n. All routes are prefixed with `[locale]` (`en` or `tr`).
- **No test suite exists** in this project. Validation is done via `npm run lint` and manual testing.
- **No lockfile** is committed; `npm install` generates `package-lock.json` locally.
