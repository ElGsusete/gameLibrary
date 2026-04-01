# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Frontend dev server (port 5173)
npm run dev

# Frontend + Express API together
npm run dev:all

# Express API only (port 3001)
npm run dev:server

# Production build (TypeScript check + Vite)
npm run build

# Lint
npm run lint

# Unit/integration tests (watch mode)
npm test

# Unit/integration tests (single run)
npm run test:run

# E2E tests (Playwright)
npm run test:e2e

# E2E with Playwright UI
npm run test:e2e:ui

# Docker (includes frontend + API)
docker compose up --build
```

Run a single test file: `npx vitest run src/components/GameCard.test.tsx`

## Architecture

**GameLog** is a personal video game library ("Letterboxd for games"). The app is a React SPA with an optional Express backend used only for Steam OAuth.

### Frontend (`src/`)

- **State**: Two React Context providers wrap the app — `GamesContext` (games array + ratings, persisted to `localStorage`) and `AuthContext` (Steam JWT token, stored in `localStorage`). Zustand is listed as a dependency but state is primarily Context-based.
- **Routing**: React Router 7 with 7 routes defined in `App.tsx`. The basename is detected at runtime for GitHub Pages compatibility.
- **Steam data**: `src/services/steamApi.ts` hits SteamSpy (via Vite proxy `/steamspy`) for the full game list (cached 24h in localStorage) and the Steam Store API (via `/steam-store`) for individual game details.
- **Forms**: React Hook Form + Zod for AddGameForm and AddFromSteam.

### Backend (`server/`)

- Minimal Express app. Only used for Steam OpenID 2.0 login flow (Passport.js + passport-steam) and proxying `/api/me/games` (user's Steam library via Steam Web API).
- Requires `server/.env` with `STEAM_API_KEY`, `JWT_SECRET`, and `CALLBACK_URL`. See `server/.env.example`.
- In development, Vite proxies `/api/*` to `http://localhost:3001`.

### Key Data Flow

- **Adding a game**: `AddFromSteam` → `steamApi.ts` → SteamSpy API → user selects → Steam Store API for details → `GamesContext.addGame()` → `localStorage`
- **Steam login**: Header login → `/api/auth/steam` (backend) → Steam OpenID → `/auth/callback?token=JWT` → `AuthCallbackPage` → `AuthContext` → `localStorage`
- **User Steam library**: `MySteamGamesPage` → `GET /api/me/games` with Bearer token → backend validates JWT → Steam Web API

### Testing

- Unit/integration tests use Vitest with jsdom. Test files live alongside source (`*.test.tsx`, `*.test.ts`) and in `server/` (`app.test.js`).
- E2E tests live in `e2e/` and use Playwright (Chromium only). Playwright auto-starts `npm run dev` before running tests.

### Deployment

GitHub Actions (`.github/workflows/deploy-pages.yml`) builds and deploys to GitHub Pages on every push to `main`. The Vite base is set to `./` for relative paths. A `404.html` is copied at build time for SPA routing fallback.
