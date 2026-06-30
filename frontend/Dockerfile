FROM node:20-alpine AS builder

WORKDIR /app

# Copy only package.json on purpose. Some generated package-lock files can be stale or
# registry-specific, causing Docker to finish npm ci/npm install without installing Next.js.
# Ignoring the lock file here forces a clean install from package.json inside Docker.
COPY package.json ./
RUN npm install --include=dev --no-audit --no-fund --registry=https://registry.npmjs.org/   && if [ ! -f ./node_modules/next/dist/bin/next ]; then        npm install --include=dev --no-audit --no-fund --registry=https://registry.npmjs.org/ next@15.1.2 react@19.0.0 react-dom@19.0.0;      fi   && node -e "console.log('Next.js installed at:', require.resolve('next/package.json'))"

COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN ./node_modules/.bin/next build

FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.mjs ./next.config.mjs

EXPOSE 3000
CMD ["./node_modules/.bin/next", "start", "-H", "0.0.0.0", "-p", "3000"]
