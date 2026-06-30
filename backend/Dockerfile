FROM node:20-alpine AS builder

# Prisma on Alpine needs OpenSSL libraries for the query engine.
RUN apk add --no-cache openssl

WORKDIR /app

# Install from package.json only. This avoids stale lockfiles and prevents bare npx
# from downloading Prisma 7 during Docker builds. Prisma 7 breaks the current
# Prisma 6 schema format that still uses datasource url = env("DATABASE_URL").
COPY package.json ./
ENV NPM_CONFIG_PRODUCTION=false
RUN npm install --include=dev --no-audit --no-fund --registry=https://registry.npmjs.org/ \
  && npm install --include=dev --no-audit --no-fund --registry=https://registry.npmjs.org/ prisma@6.0.1 @prisma/client@6.0.1 \
  && test -x ./node_modules/.bin/prisma

COPY prisma ./prisma
RUN ./node_modules/.bin/prisma generate

COPY nest-cli.json tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner

# Keep OpenSSL available at runtime for Prisma Client.
RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 8080

# NestJS build output may be either dist/main.js or dist/src/main.js
# depending on tsconfig/Nest CLI configuration. This startup command supports both
# and prints the dist tree if neither exists, making Docker debugging easier.
CMD ["sh", "-c", "if [ -f dist/main.js ]; then node dist/main.js; elif [ -f dist/src/main.js ]; then node dist/src/main.js; else echo 'ERROR: Cannot find NestJS build entry. Dist files:'; find dist -maxdepth 3 -type f; exit 1; fi"]
