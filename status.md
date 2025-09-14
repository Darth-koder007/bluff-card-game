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
- [ ] Implement actions (play cards, pass, bluff).
- [ ] Basic animations + mobile-first layout.

## Phase 4 – Accounts & Stats

- [ ] Email magic link login.
- [ ] Track wins/losses per user.
- [ ] Display stats & leaderboards.

## Phase 5 – PWA Polish

- [ ] Add service worker + manifest.
- [ ] Add “your turn” notifications.
- [ ] Optimize for mobile install.

## Current Issues

- **Gameplay:**
    - The "Play Card" button only plays the first card in the hand.
    - No UI for selecting multiple cards to play.
    - No UI for declaring the rank of the played cards.
    - No UI for calling a bluff or passing.
    - The game does not have an end condition.
- **Authentication:**
    - Users are currently identified by their socket ID, and a new user is created for each new connection. There is no proper user authentication.
- **UI:**
    - The UI is very basic and needs to be improved.
