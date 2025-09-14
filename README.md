# Bluff: The Card Game

A multiplayer web-based version of the card game Bluff (also known as Cheat or I Doubt It). This project is a Progressive Web App (PWA) designed for friends and family to play remotely.

## Tech Stack

- **Frontend**: React, TypeScript, Vite, TailwindCSS, Zustand
- **Backend**: Node.js, Express, Socket.IO, TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Monorepo Management**: pnpm workspaces
- **Containerization**: Docker and Docker Compose

## Project Structure

This project is a monorepo managed with pnpm workspaces. The code is organized into three main packages:

- **`/frontend`**: A React application built with Vite that serves as the client. It handles rendering the game state and sending user actions to the backend.
- **`/backend`**: A Node.js server that manages the game logic, user authentication, and communication between clients using WebSockets.
- **`/shared`**: A TypeScript package that contains code shared between the frontend and backend, such as type definitions, game rules, and constants.

## Key Architectural Decisions

- **Authoritative Server**: The backend is the single source of truth for the game state. All actions from clients are validated on the server before being applied.
- **Shared Code**: A dedicated shared package ensures that the frontend and backend are always in sync regarding data structures and game logic.
- **Real-time Communication**: WebSockets (with Socket.IO) are used for real-time communication between the clients and the server.

## Getting Started

### Prerequisites

- Node.js (v20 or later)
- pnpm (v8 or later)
- Docker and Docker Compose

### Development Environment

1.  **Install Dependencies**:

    ```bash
    pnpm install
    ```

2.  **Start the Database**:

    You can use the provided Docker Compose configuration to start a PostgreSQL database:

    ```bash
    docker-compose up -d db
    ```

3.  **Run Migrations**:

    Apply the database schema migrations:

    ```bash
    pnpm --filter=@bluff/backend exec prisma migrate deploy
    ```

4.  **Start Development Servers**:

    This command will start the frontend and backend development servers concurrently:

    ```bash
    pnpm dev
    ```

    - The frontend will be available at `http://localhost:5173`.
    - The backend will be running on `http://localhost:3000`.

### Production Environment

To build and run the application in a production-like environment, you can use Docker Compose:

```bash
docker-compose up --build
```

This will build the Docker images for the frontend and backend, start all the services, and run the database migrations.

- The application will be available at `http://localhost:8080`.

## Deployment

The application is designed to be deployed as separate services:

- **Frontend**: The frontend is a static application that can be deployed to any static hosting provider like Vercel or Netlify.
- **Backend**: The backend is a Node.js application that can be deployed to a service like Render or Fly.io. It needs to be connected to a PostgreSQL database.

When deploying, ensure that the `VITE_API_URL` environment variable is set on the frontend to the URL of your deployed backend.
