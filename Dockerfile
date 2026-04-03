FROM node:20-alpine

WORKDIR /app

# Install backend dependencies
COPY server/package*.json ./server/
RUN cd server && npm install --production

# Install frontend dependencies and build
COPY web/package*.json ./web/
RUN cd web && npm install

COPY web/ ./web/
RUN cd web && npm run build

# Copy backend source
COPY server/ ./server/

# Create config directory
RUN mkdir -p /app/config

EXPOSE 3000

WORKDIR /app/server
CMD ["node", "index.js"]
