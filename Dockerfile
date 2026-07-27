# Stage 1: Build Frontend
FROM node:20-alpine AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
COPY shared/ ../shared/
RUN npm run build

# Stage 2: Build Backend
FROM node:20-alpine AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm ci
COPY server/ ./
COPY shared/ ../shared/
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Install production server dependencies
COPY server/package*.json ./server/
RUN npm ci --prefix server --only=production

# Copy compiled server code and resources
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/words.json ./server/words.json

# Copy compiled static client files
COPY --from=client-builder /app/client/dist ./client/dist

# Expose game port
EXPOSE 6969
ENV PORT=6969
ENV NODE_ENV=production

CMD ["npm", "run", "start", "--prefix", "server"]
