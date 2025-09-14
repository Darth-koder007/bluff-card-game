# Project Status

## Phase 0 – Foundational Tooling

- [ ] Set up linting, formatting, and pre-commit hooks (ESLint, Prettier, Husky).
- [ ] Standardize on a testing framework (Vitest).
- [ ] Containerize the entire application with Docker.

## Phase 1 – Core Game Engine

- [x] Implement deck shuffling (Fisher-Yates).
- [x] Define `GameState`, `Move`, `Player`.
- [x] Implement moves: `PLAY`, `PASS`, `CALL_BLUFF`.
- [x] Write Jest tests for engine.

## Phase 2 – Backend Server

- [x] WebSocket server with typed events.
- [x] Room lifecycle: create, join, start.
- [x] Integrate engine with live game state.
- [x] Basic persistence with Prisma and PostgreSQL for users.
- [ ] Rematch functionality.

## Phase 3 – Frontend

- [x] Connect to server (WS).
- [x] Render game state: hand, pile count, turn indicator.
- [x] Implement actions (play cards, pass, bluff).
- [x] Basic animations + mobile-first layout.

## Phase 4 – Accounts & Stats

- [x] Implement email & password login.
- [ ] Track wins/losses per user.
- [ ] Display stats & leaderboards.

## Phase 5 – PWA Polish

- [ ] Add service worker + manifest.
- [ ] Add “your turn” notifications.
- [ ] Optimize for mobile install.

## Current Issues

- **Rematch:** No rematch functionality exists yet.
