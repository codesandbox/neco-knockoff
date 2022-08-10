FROM node:latest

# Enable pnpm
RUN corepack enable

WORKDIR /application

# Install the backend dependencies, this makes sure we only invalidate
# the Docker layer cache when package.json is changed
COPY backend/package*.json ./backend/
RUN cd backend && pnpm install

# Copy the rest of the backend files
COPY backend backend

# Run the app
COPY www www

CMD ["node","/application/backend/index.js"]
