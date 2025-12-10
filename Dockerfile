## Multi-stage Dockerfile
# Stage 1: build the React client
FROM node:18-alpine AS client-build
WORKDIR /app/client

# Install client dependencies (use CI for reproducible installs)
COPY client/package*.json ./
RUN npm ci --prefer-offline --no-audit --progress=false

# Copy client sources and build
COPY client/ ./
RUN npm run build

# Stage 2: build the server image and copy client build
FROM node:18-alpine AS server
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
RUN cd server && npm ci --omit=dev --prefer-offline --no-audit --progress=false

# Copy server source
COPY server/ ./server/

# Copy client build from previous stage
COPY --from=client-build /app/client/build ./client/build

# Ensure production env
ENV NODE_ENV=production

WORKDIR /app/server
EXPOSE 4000

# Start the server
COPY server/index.js ./
CMD ["node", "index.js"]
