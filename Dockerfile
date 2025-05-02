# Use Node.js as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

RUN npm install -g pm2

# Copy package.json files
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

# Install dependencies
RUN npm install
RUN cd backend && npm install
RUN cd frontend && npm install

# Copy the rest of the application
COPY . .

# Build the frontend
RUN cd frontend && npm run build

# Expose the port the app runs on
EXPOSE 38765

# Command to run the application
CMD ["pm2-runtime", "backend/server.js"]
