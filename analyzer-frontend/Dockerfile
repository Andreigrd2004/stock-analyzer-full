# ─── Stage 1: Install ALL dependencies (including devDeps needed for build) ───
FROM docker.io/library/node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json ./
# Install everything — typescript and eslint-config-next are devDeps
# required at build time by Next.js. They are NOT carried into the runner image.
RUN npm ci

# ─── Stage 2: Build the Next.js app ──────────────────────────────────────────
FROM docker.io/library/node:20-alpine AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env vars (must be NEXT_PUBLIC_ to be embedded in the JS bundle)
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_FINNHUB_API_KEY

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_FINNHUB_API_KEY=$NEXT_PUBLIC_FINNHUB_API_KEY

RUN npm run build

# ─── Stage 3: Slim production runner ─────────────────────────────────────────
FROM docker.io/library/node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Copy only what Next.js standalone mode needs to run (no node_modules bulk)
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
