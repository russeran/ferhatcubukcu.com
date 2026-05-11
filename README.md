# ferhatcubukcu.com

Bilingual (English / Turkish) portfolio site for Ferhat Çubukçu, built with **Next.js 15**, **Tailwind CSS**, and **next-intl**. Includes an admin area for artworks and site content.

## Quick start

1. Install [Node.js](https://nodejs.org/) (LTS).
2. Copy `.env.example` to `.env.local` and set `ADMIN_PASSWORD` (and `AUTH_SECRET` for production).
3. Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000). Admin sign-in: `/en/admin/login` (or `/tr/admin/login`).

## Scripts

| Command        | Description              |
| -------------- | ------------------------ |
| `npm run dev`  | Development server       |
| `npm run build`| Production build         |
| `npm run start`| Run production server    |
| `npm run lint` | ESLint                   |

## Deployment notes

- Runtime data is stored under `data/` (JSON) and uploads under `public/uploads/`. These paths are gitignored where appropriate; configure persistence on your host.
- Set strong secrets in production (`AUTH_SECRET`, admin password).

## License

Private / all rights reserved unless the owner specifies otherwise.
