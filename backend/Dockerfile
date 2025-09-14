FROM node:20-slim

# Update packages to fix vulnerabilities
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy the whole monorepo
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the backend and its dependencies
RUN pnpm --filter=@bluff/backend... build

# Generate prisma client
RUN pnpm --filter=@bluff/backend exec prisma generate

WORKDIR /app/backend

EXPOSE 3000

CMD ["pnpm", "start"]
