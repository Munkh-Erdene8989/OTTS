FROM node:22-alpine
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json apps/api/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN pnpm install --frozen-lockfile || pnpm install
COPY . .
RUN pnpm --filter api prisma:generate && pnpm --filter api build
WORKDIR /app/apps/api
EXPOSE 4000
CMD ["pnpm", "start:prod"]
