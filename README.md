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

- Runtime data is stored under `data/` (JSON) and uploads under `public/uploads/`. **Serverless hosts do not persist `data/`** between invocations unless you add storage; admin login with **`ADMIN_PASSWORD` alone still works** because it lives only in environment variables.
- Use a strong `ADMIN_PASSWORD` and `AUTH_SECRET` in production. Plain env passwords are acceptable for a small private admin panel; use `ADMIN_PASSWORD_HASH` if you prefer the password not stored in plain form in the host UI.

## License

Private / all rights reserved unless the owner specifies otherwise.
