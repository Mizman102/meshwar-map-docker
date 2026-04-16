FROM node:20-alpine

RUN apk add --no-cache python3 make g++ bash jq

WORKDIR /app

# Install server dependencies
COPY server/package.json server/package-lock.json* ./server/
RUN cd server && npm install --production

# Copy application
COPY server/ ./server/
COPY public/ ./public/
COPY tools/ ./tools/

# Create data directory
RUN mkdir -p /app/data/processed

EXPOSE 3000

CMD ["node", "server/index.js"]
