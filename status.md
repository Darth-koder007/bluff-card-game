# Project Status

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

- [ ] Email magic link login.
- [ ] Track wins/losses per user.
- [ ] Display stats & leaderboards.

## Phase 5 – PWA Polish

- [ ] Add service worker + manifest.
- [ ] Add “your turn” notifications.
- [ ] Optimize for mobile install.

## Current Issues

- **Authentication:**
    - Users are currently identified by their socket ID, and a new user is created for each new connection. There is no proper user authentication.
