# Use Node.js 20 as base image
FROM node:20-slim

# Install PostgreSQL client and other required system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    python3 \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose ports
EXPOSE 5000

# Set environment variables
ENV NODE_ENV=development
ENV PORT=5000

# Start command
CMD ["npm", "run", "dev"]
