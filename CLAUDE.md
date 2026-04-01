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

<!-- dgc-policy-v11 -->
# Dual-Graph Context Policy

This project uses a local dual-graph MCP server for efficient context retrieval.

## MANDATORY: Always follow this order

1. **Call `graph_continue` first** — before any file exploration, grep, or code reading.

2. **If `graph_continue` returns `needs_project=true`**: call `graph_scan` with the
   current project directory (`pwd`). Do NOT ask the user.

3. **If `graph_continue` returns `skip=true`**: project has fewer than 5 files.
   Do NOT do broad or recursive exploration. Read only specific files if their names
   are mentioned, or ask the user what to work on.

4. **Read `recommended_files`** using `graph_read` — **one call per file**.
   - `graph_read` accepts a single `file` parameter (string). Call it separately for each
     recommended file. Do NOT pass an array or batch multiple files into one call.
   - `recommended_files` may contain `file::symbol` entries (e.g. `src/auth.ts::handleLogin`).
     Pass them verbatim to `graph_read(file: "src/auth.ts::handleLogin")` — it reads only
     that symbol's lines, not the full file.
   - Example: if `recommended_files` is `["src/auth.ts::handleLogin", "src/db.ts"]`,
     call `graph_read(file: "src/auth.ts::handleLogin")` and `graph_read(file: "src/db.ts")`
     as two separate calls (they can be parallel).

5. **Check `confidence` and obey the caps strictly:**
   - `confidence=high` -> Stop. Do NOT grep or explore further.
   - `confidence=medium` -> If recommended files are insufficient, call `fallback_rg`
     at most `max_supplementary_greps` time(s) with specific terms, then `graph_read`
     at most `max_supplementary_files` additional file(s). Then stop.
   - `confidence=low` -> Call `fallback_rg` at most `max_supplementary_greps` time(s),
     then `graph_read` at most `max_supplementary_files` file(s). Then stop.

## Token Usage

A `token-counter` MCP is available for tracking live token usage.

- To check how many tokens a large file or text will cost **before** reading it:
  `count_tokens({text: "<content>"})`
- To log actual usage after a task completes (if the user asks):
  `log_usage({input_tokens: <est>, output_tokens: <est>, description: "<task>"})`
- To show the user their running session cost:
  `get_session_stats()`

Live dashboard URL is printed at startup next to "Token usage".

## Rules

- Do NOT use `rg`, `grep`, or bash file exploration before calling `graph_continue`.
- Do NOT do broad/recursive exploration at any confidence level.
- `max_supplementary_greps` and `max_supplementary_files` are hard caps - never exceed them.
- Do NOT dump full chat history.
- Do NOT call `graph_retrieve` more than once per turn.
- After edits, call `graph_register_edit` with the changed files. Use `file::symbol` notation (e.g. `src/auth.ts::handleLogin`) when the edit targets a specific function, class, or hook.

## Context Store

Whenever you make a decision, identify a task, note a next step, fact, or blocker during a conversation, call `graph_add_memory`.

**To add an entry:**
```
graph_add_memory(type="decision|task|next|fact|blocker", content="one sentence max 15 words", tags=["topic"], files=["relevant/file.ts"])
```

**Do NOT write context-store.json directly** — always use `graph_add_memory`. It applies pruning and keeps the store healthy.

**Rules:**
- Only log things worth remembering across sessions (not every minor detail)
- `content` must be under 15 words
- `files` lists the files this decision/task relates to (can be empty)
- Log immediately when the item arises — not at session end

## Session End

When the user signals they are done (e.g. "bye", "done", "wrap up", "end session"), proactively update `CONTEXT.md` in the project root with:
- **Current Task**: one sentence on what was being worked on
- **Key Decisions**: bullet list, max 3 items
- **Next Steps**: bullet list, max 3 items

Keep `CONTEXT.md` under 20 lines total. Do NOT summarize the full conversation — only what's needed to resume next session.
