INSTRUCTIONS.md

For LLM Agent – Bluff Game Project

Goal

Build and maintain a multiplayer Bluff (a.k.a. Cheat/BS) card game that runs as a web app (PWA).
Players (family/friends) should be able to play remotely, track win history, and optionally configure house rules.

System Overview
Architecture

Frontend: React + TypeScript + Vite + TailwindCSS.

Backend: Node.js (Express/WS or tRPC) as authoritative server.

Database: Postgres (via Prisma ORM).

Realtime: WebSocket (Socket.IO or ws).

State sync: All game moves validated on server → broadcast to clients.

Persistence:

Redis (or in-memory + Redis) for live room state.

Postgres for users, game results, and stats.

Hosting:

Web app → Vercel/Netlify.

Server → Fly.io/Render (EU region).

Key Principles

Authoritative server: only the backend decides shuffles, moves, challenges.

Hidden info: never expose other players’ hands to clients.

Portable code: shared @bluff/shared package for types, rules, constants.

PWA-first: works on mobile/desktop without App Store hurdles.

Game Rules (Base)

Goal: empty your hand first.

Turn order: clockwise.

Declared rank cycles A → K → A (toggleable).

On turn: play ≥1 cards face-down + declare rank.

Anyone can challenge:

If all cards match → challenger takes pile.

If mismatch → liar takes pile.

Win: last card(s) played and survive challenge.

Variants:

Allow pass or not.

Sequential rank vs fixed rank.

Jokers enabled.

2’s wild.

Challenge window (time-bound).

Data Model
users(id, email, display_name, avatar_url, created_at)
games(id, created_at, finished_at, rules_json, winner_user_id)
game_participants(game_id, user_id, seat, result, turns_taken)
moves(id, game_id, actor_id, type, payload_json, created_at)
user_stats(user_id, lifetime_wins, losses, streak, elo, last_played_at)

Core Packages
/frontend

React + TS + Tailwind.

Zustand store for local state.

PWA config (manifest.json, service worker).

UI: lobby, game table, hand view, pile, actions (play/pass/bluff).

/backend

Node.js + WS server.

Express/tRPC endpoints for auth + stats.

Redis for live rooms.

Prisma + Postgres for persistence.

/shared

Pure TypeScript package.

Exports:

Game rules/engine (dealCards, applyMove, resolveBluff).

Event types (ClientToServer, ServerToClient).

Constants (ranks, suits, rules).

Task Breakdown for Agent
Phase 1 – Core Game Engine

Implement deck shuffling (Fisher-Yates).

Define GameState, Move, Player.

Implement moves: PLAY, PASS, CALL_BLUFF.

Write Jest tests for engine.

Phase 2 – Backend Server

WebSocket server with typed events.

Room lifecycle: create, join, start, rematch.

Integrate engine with live game state.

Implement persistence (Postgres).

Phase 3 – Frontend

Connect to server (WS).

Render game state: hand, pile count, turn indicator.

Implement actions (play cards, pass, bluff).

Basic animations + mobile-first layout.

Phase 4 – Accounts & Stats

Email magic link login.

Track wins/losses per user.

Display stats & leaderboards.

Phase 5 – PWA Polish

Add service worker + manifest.

Add “your turn” notifications.

Optimize for mobile install.

Coding Guidelines

All code in TypeScript.

Tests first for game logic (/shared).

Keep server authoritative; never trust client for card contents.

Always log game moves (event sourcing).

Keep UI minimal first, then polish.

Future Extensions

Spectator mode.

Replay games.

Seasonal leaderboards.

Voice/video via WebRTC.

Theming & card skins.

👉 Agent should always:

Keep game engine pure & testable.

Keep server authoritative.

Keep frontend stateless, just rendering server state.
