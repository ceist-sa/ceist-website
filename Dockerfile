# Build stage
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy lockfile and package.json first to leverage Docker cache
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Copy the rest of the source code
COPY . .

# Build the SvelteKit application
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS runner

WORKDIR /app

# Copy build artifacts and necessary files from builder
COPY --from=builder /app/build ./build
COPY --from=builder /app/package.json ./
COPY --from=builder /app/bun.lock ./
COPY --from=builder /app/data ./data

# Note: .env files should ideally not be baked into the image.
# They will be provided via docker-compose env_file or environment variables.

EXPOSE 3000

ENV NODE_ENV=production
CMD ["bun", "./build/index.js"]
