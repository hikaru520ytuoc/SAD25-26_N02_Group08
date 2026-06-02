FROM node:20-alpine AS builder

# Prisma on Alpine needs OpenSSL libraries for the query engine.
RUN apk add --no-cache openssl

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
RUN npx prisma generate

COPY nest-cli.json tsconfig*.json ./
COPY src ./src
RUN npm run build

FROM node:20-alpine AS runner

# Keep OpenSSL available at runtime for Prisma Client.
RUN apk add --no-cache openssl

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 8080

# NestJS build output may be either dist/main.js or dist/src/main.js
# depending on tsconfig/Nest CLI configuration. This startup command supports both
# and prints the dist tree if neither exists, making Docker debugging easier.
CMD ["sh", "-c", "if [ -f dist/main.js ]; then node dist/main.js; elif [ -f dist/src/main.js ]; then node dist/src/main.js; else echo 'ERROR: Cannot find NestJS build entry. Dist files:'; find dist -maxdepth 3 -type f; exit 1; fi"]
