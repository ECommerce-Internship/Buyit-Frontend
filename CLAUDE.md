# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is the **Buyit** frontend, currently a freshly scaffolded React + TypeScript + Vite app (Jira tickets TB-54/TB-55, project setup phase). `src/App.tsx` is still a placeholder ("Buyit frontend is alive"). The core libraries are installed and the Axios client is wired, but routing, pages, and feature code do not exist yet — the directories under `src/` (`components/`, `context/`, `hooks/`, `pages/`, `types/`) are empty placeholders held by `.gitkeep`. Expect to build these out rather than modify existing features.

## Commands

```bash
npm run dev      # Vite dev server with HMR
npm run build    # tsc -b (typecheck) && vite build — the typecheck WILL fail the build on TS errors
npm run lint     # eslint over the repo
npm run preview  # serve the production build locally
```

There is **no test runner configured** — no Jest/Vitest, no `test` script. Do not assume tests exist; if adding them, you must also add the tooling.

## Architecture & conventions

- **Stack:** React 19, TypeScript (strict-ish: `noUnusedLocals`/`noUnusedParameters` on), Vite 8, Tailwind CSS **v4**.
- **Tailwind v4** is configured via the `@tailwindcss/vite` plugin and a single `@import "tailwindcss";` in `src/index.css`. There is intentionally **no `tailwind.config.js`** — do not create one or reach for a PostCSS config; customize via CSS in v4 style.
- **API layer:** `src/api/axiosInstance.ts` exports a single shared Axios client that all data fetching should go through. It:
  - reads its `baseURL` from `import.meta.env.VITE_API_URL`,
  - attaches `Authorization: Bearer <token>` from `localStorage.getItem('token')` on every request,
  - clears the token from `localStorage` on a `401` response (redirect-to-login is a noted TODO, not yet implemented).
  When adding auth/login, store the JWT under the `'token'` key to stay compatible with this interceptor.
- **Installed-but-not-yet-wired libraries** (use these rather than introducing alternatives): `@tanstack/react-query` (server state), `react-router-dom` v7 (routing), `react-hot-toast` (notifications), `recharts` (charts), `lucide-react` (icons). None are initialized in `main.tsx` yet, so wiring providers (QueryClientProvider, RouterProvider, Toaster) is expected work.

## Environment

- `VITE_API_URL` selects the backend per environment. `.env.local` points to `http://localhost:5000`; `.env.production` is a placeholder URL.
- Production is deployed via **Vercel** — the `VITE_API_URL` set in the Vercel dashboard overrides the `.env.production` file at build time.

## Environment quirks

- The project is developed across Windows (Visual Studio) and Linux/WSL. `vite.config.ts` ignores `**/.vs/**` in the file watcher because VS locks files there and crashes Vite's watcher with `EBUSY`.
- `package-lock.json` was regenerated on Linux to drop Windows-only binding resolution that broke cross-platform installs. If you touch dependencies, regenerate the lockfile in an environment that keeps it cross-platform-clean.
