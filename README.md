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
- **Password**, pick one approach:
  - **Local / writable `data/`**: set `ADMIN_PASSWORD` to your chosen password. On first successful login attempt the app writes `data/auth.json` with a bcrypt hash.
  - **Vercel / serverless** (disk is read-only): you **cannot** rely on creating `data/auth.json` from `ADMIN_PASSWORD`. Set **`ADMIN_PASSWORD_HASH`** instead: run locally `npm run hash-admin-password -- "YourPassword"`, copy the printed hash into the Vercel environment variable `ADMIN_PASSWORD_HASH`.
- If you previously logged in locally, `data/auth.json` may contain a **different** hash than your new `ADMIN_PASSWORD` on Vercel — either set `ADMIN_PASSWORD_HASH` to match the password you want, or delete `auth.json` locally and re-bootstrap.

The **`message`** field in a **400** response from `POST /api/auth/login` explains misconfiguration (missing `AUTH_SECRET`, read-only disk, etc.). **401** means the password did not match.

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run start`| Run production server    |
| `npm run lint` | ESLint                   |
| `npm run hash-admin-password -- "pw"` | Print bcrypt hash for `ADMIN_PASSWORD_HASH` |

## Deployment notes

- Runtime data is stored under `data/` (JSON) and uploads under `public/uploads/`. **Serverless hosts (e.g. Vercel) do not persist `data/` between invocations** unless you attach storage; use `ADMIN_PASSWORD_HASH` for admin auth and consider external storage for site JSON / uploads for a production CMS workflow.
- Set strong secrets in production (`AUTH_SECRET`, `ADMIN_PASSWORD_HASH` or file-backed hash).

## License

Private / all rights reserved unless the owner specifies otherwise.
