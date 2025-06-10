FROM node:22-alpine3 AS frontend-builder

WORKDIR /app/client

# Copy package.json and package-lock.json first to leverage Docker cache
COPY client/package.json client/package-lock.json ./
RUN npm install

# Copy the rest of the client files
COPY client .
# Build the React application
RUN npm run build

# Stage 2: Build the Node.js backend and serve the React frontend
FROM node:22F-1543-alpine3 AS backend

WORKDIR /app

# Copy package.json and package-lock.json for the backend
COPY package.json package-lock.json ./
RUN npm install

# Copy the rest of the backend files (server.js, etc.)
COPY . .

# Copy the built frontend from the frontend-builder stage
COPY --from=frontend-builder /app/client/dist ./client/dist

# Expose the port the Node.js server listens on
EXPOSE 3005

# Command to run the Node.js server
CMD ["node", "server.js"]