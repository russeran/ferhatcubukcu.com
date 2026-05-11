# ferhatcubukcu.com

Bilingual (English / Turkish) portfolio site for Ferhat Çubukçu, built with **Next.js 15**, **Tailwind CSS**, and **next-intl**. Includes an admin area for artworks and site content.

## Quick start

1. Install [Node.js](https://nodejs.org/) (LTS).
2. Copy `.env.example` to `.env.local` and set secrets (see below).
3. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000). Admin sign-in: `/en/admin/login` (or `/tr/admin/login`).

## Admin login & env vars

- Sign-in is **password only** (no username): `/en/admin/login` or `/tr/admin/login`.
- **`AUTH_SECRET`**: required whenever `NODE_ENV=production` (including Vercel). Use a long random string, not the example value.
- **`ADMIN_PASSWORD`**: set this to your admin password in `.env.local` or in your host’s environment (e.g. Vercel). Login compares your input with this value using a timing-safe check. **No bcrypt hash and no `data/auth.json` are required** for this to work, including on serverless. If you still have `data/auth.json` from an older setup, remove it (and unset `ADMIN_PASSWORD_HASH`) when you want the plain env password to apply — otherwise the file’s bcrypt hash is checked first.
- **Optional — stricter / legacy**:
  - **`ADMIN_PASSWORD_HASH`**: if set, login uses bcrypt against this hash (takes precedence over plain password and `auth.json`). Generate locally: `npm run hash-admin-password -- "YourPassword"`.
  - **`data/auth.json`**: if it exists (e.g. after a future in-app password change), bcrypt verification is used until you remove that file.

The **`message`** field in a **400** response from `POST /api/auth/login` explains misconfiguration (e.g. missing `AUTH_SECRET`). **401** means the password did not match.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run start`| Run production server    |
| `npm run lint` | ESLint                   |
| `npm run hash-admin-password -- "pw"` | Optional: bcrypt hash for `ADMIN_PASSWORD_HASH` |

## Deployment notes

- Technical SEO included: **`/sitemap.xml`**, **`/robots.txt`** (blocks `/api/` and admin), per-page **title/description**, **hreflang** alternates (`en` / `tr`), **Open Graph / Twitter** cards, **JSON-LD** `Person` on the home page, and meaningful **hero `alt`** text.
- After launch, add the property in **[Google Search Console](https://search.google.com/search-console)** and submit `https://your-domain/sitemap.xml`.
- Set **`NEXT_PUBLIC_SITE_URL`** to your canonical origin (e.g. `https://ferhatcubukcu.com`) on Vercel so `metadataBase`, the sitemap, and social preview URLs use the custom domain instead of the default `*.vercel.app` host.
- **Persisting admin changes on Vercel** (filesystem is read-only). Pick **one** backend (all have usable **free tiers**):

  **A — Supabase (recommended “all free”)**  
  1. Create a project at [supabase.com](https://supabase.com) (free tier).  
  2. **Settings → API**: copy **Project URL** into **`SUPABASE_URL`** (or `NEXT_PUBLIC_SUPABASE_URL`) and the **`service_role`** secret into **`SUPABASE_SERVICE_ROLE_KEY`** (server-only on Vercel — never commit or expose in client code).  
  3. **SQL → New query** — run:

```sql
create table if not exists public.portfolio_kv (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz default now()
);
alter table public.portfolio_kv enable row level security;
```

  4. **Storage**: create a **public** bucket named **`portfolio-media`** (or set **`SUPABASE_STORAGE_BUCKET`** to your bucket name). The app uploads to `gallery/…` inside that bucket.  
  If **`SUPABASE_*`** is set, **JSON** (paintings + settings) is stored in Supabase **before** Redis. **Image uploads** try **Vercel Blob** first (if `BLOB_READ_WRITE_TOKEN` is set), then **Supabase Storage**, then local disk.

  **B — Upstash Redis + Vercel Blob**  
  [Upstash](https://upstash.com) Redis has a **free tier**; link from Vercel **Storage** and set **`UPSTASH_REDIS_REST_URL`** / **`UPSTASH_REDIS_REST_TOKEN`**. Images: **Vercel Blob** with **`BLOB_READ_WRITE_TOKEN`**.

  If **none** of these env vars are set, **`data/`** and **`public/uploads/`** are used (fine on your laptop; not durable on Vercel).
- Use a strong `ADMIN_PASSWORD` and `AUTH_SECRET` in production. Plain env passwords are acceptable for a small private admin panel; use `ADMIN_PASSWORD_HASH` if you prefer the password not stored in plain form in the host UI.

## License

Private / all rights reserved unless the owner specifies otherwise.
