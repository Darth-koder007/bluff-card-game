# Stage 1: Build
FROM node:20-slim AS build

# Update packages to fix vulnerabilities
RUN apt-get update && apt-get upgrade -y && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Add build arg for API URL
ARG VITE_API_URL

# Create .env file in the frontend directory
RUN mkdir -p /app/frontend && echo "VITE_API_URL=${VITE_API_URL}" > /app/frontend/.env

# Install pnpm
RUN npm install -g pnpm

# Copy the whole monorepo
COPY . .

# Install dependencies
RUN pnpm install --frozen-lockfile

# Build the frontend and its dependencies
RUN pnpm --filter=@bluff/frontend... build

# Stage 2: Serve
FROM nginx:stable-alpine

# Copy built assets from build stage
COPY --from=build /app/frontend/dist /usr/share/nginx/html

# Copy nginx config
COPY --from=build /app/frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
