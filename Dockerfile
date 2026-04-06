FROM oven/bun:1 AS base
WORKDIR /app

FROM base AS deps
COPY package.json bun.lockb* ./
COPY packages/core/package.json packages/core/
COPY packages/cli/package.json packages/cli/
COPY packages/assistant/package.json packages/assistant/
COPY packages/services/package.json packages/services/
COPY packages/channels/package.json packages/channels/
COPY packages/enterprise/package.json packages/enterprise/
COPY packages/observability/package.json packages/observability/
COPY packages/devtools/package.json packages/devtools/
COPY packages/web/package.json packages/web/
COPY packages/plugin-sdk/package.json packages/plugin-sdk/
RUN bun install --frozen-lockfile --production

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV OPENTEGRATE_WEB_PORT=3000

COPY --from=builder /app/packages/web/dist ./packages/web/dist
COPY --from=builder /app/packages/cli/dist ./packages/cli/dist
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["bun", "run", "--cwd", "packages/web", "start"]
