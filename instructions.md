# Bluff Game: Project Instructions

## 🎯 Goal

Build and maintain a multiplayer Bluff (a.k.a. Cheat/BS) card game that runs as a web app (PWA). Players (family/friends) should be able to play remotely, track win history, and optionally configure house rules.

---

## 🛠️ System Overview

### Architecture
- **Frontend**: React + TypeScript + Vite + TailwindCSS.
- **Backend**: Node.js (Express/WS or tRPC) as authoritative server.
- **Database**: Postgres (via Prisma ORM).
- **Realtime**: WebSocket (Socket.IO or ws).
- **State Sync**: All game moves validated on server → broadcast to clients.

### Persistence
- **Live State**: Redis (or in-memory + Redis) for live room state.
- **Long-Term Storage**: Postgres for users, game results, and stats.

### Hosting
- **Web App**: Vercel/Netlify.
- **Server**: Fly.io/Render (EU region).

### Key Principles
- **Authoritative Server**: Only the backend decides shuffles, moves, challenges.
- **Hidden Information**: Never expose other players’ hands to clients.
- **Portable Code**: Shared `@bluff/shared` package for types, rules, constants.
- **PWA-First**: Works on mobile/desktop without App Store hurdles.

---

## 룰 Game Rules

### Base Rules
- **Goal**: Empty your hand first.
- **Turn Order**: Clockwise.
- **Declared Rank**: When the game starts or the pile has been reset (after a challenge), the player can declare any rank. During normal play, the player must declare the rank of the last played cards. When the pile is cleared, the declared rank resets to 'A'.
- **Single Pass**: A player cannot pass if the immediately preceding move was also a pass.
- **On Turn**: Play ≥1 cards face-down + declare rank.
- **Challenge**: Anyone can challenge.
    - If all cards match → challenger takes pile.
    - If mismatch → liar takes pile.
- **Win**: Last card(s) played and survive challenge.

### Variants
- Allow pass or not.
- Sequential rank vs fixed rank.
- Jokers enabled.
- 2’s wild.
- Challenge window (time-bound).

---

## 💾 Data Model

```sql
users(id, email, display_name, avatar_url, created_at)
games(id, created_at, finished_at, rules_json, winner_user_id)
game_participants(game_id, user_id, seat, result, turns_taken)
moves(id, game_id, actor_id, type, payload_json, created_at)
user_stats(user_id, lifetime_wins, losses, streak, elo, last_played_at)
```

---

## 📦 Core Packages

### `/frontend`
- React + TS + Tailwind.
- Zustand store for local state.
- PWA config (manifest.json, service worker).
- UI: lobby, game table, hand view, pile, actions (play/pass/bluff).

### `/backend`
- Node.js + WS server.
- Express/tRPC endpoints for auth + stats.
- Redis for live rooms.
- Prisma + Postgres for persistence.

### `/shared`
- Pure TypeScript package.
- **Exports**:
    - Game rules/engine (`dealCards`, `applyMove`, `resolveBluff`).
    - Event types (`ClientToServer`, `ServerToClient`).
    - Constants (ranks, suits, rules).

---

## 🗺️ Task Breakdown

### Phase 0 – Foundational Tooling
- Set up linting, formatting, and pre-commit hooks.
- Standardize on a testing framework (Vitest).
- Containerize the entire application with Docker.

### Phase 1 – Core Game Engine
- Implement deck shuffling (Fisher-Yates).
- Define `GameState`, `Move`, `Player`.
- Implement moves: `PLAY`, `PASS`, `CALL_BLUFF`.
- Write Jest tests for engine.

### Phase 2 – Backend Server
- WebSocket server with typed events.
- Room lifecycle: create, join, start, rematch.
- Integrate engine with live game state.
- Implement persistence (Postgres).

### Phase 3 – Frontend
- Connect to server (WS).
- Render game state: hand, pile count, turn indicator.
- Implement actions (play cards, pass, bluff).
- Basic animations + mobile-first layout.

### Phase 4 – Accounts & Stats
- Email magic link login.
- Track wins/losses per user.
- Display stats & leaderboards.

### Phase 5 – PWA Polish
- Add service worker + manifest.
- Add “your turn” notifications.
- Optimize for mobile install.

---

## ✍️ Coding Guidelines

- All code in TypeScript.
- Tests first for game logic (`/shared`).
- Keep server authoritative; never trust client for card contents.
- Always log game moves (event sourcing).
- Keep UI minimal first, then polish.

---

## 🚀 Future Extensions

- Spectator mode.
- Replay games.
- Seasonal leaderboards.
- Voice/video via WebRTC.
- Theming & card skins.

---

## AGENT DIRECTIVES

> 👉 **Agent should always:**
> - Keep game engine pure & testable.
> - Keep server authoritative.
> - Keep frontend stateless, just rendering server state.