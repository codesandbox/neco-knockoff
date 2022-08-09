# JavaScript builder
FROM node:latest AS js

# Enable pnpm
RUN corepack enable

# Build the backend
WORKDIR /tmp
COPY backend/package*.json /tmp/backend/

RUN cd backend && pnpm install


# Run the app
FROM node:latest
WORKDIR /application

COPY www www
COPY wasm wasm
COPY backend backend
COPY --from=js /tmp/backend backend


CMD ["node","/application/backend/index.js"]
