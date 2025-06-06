FROM node:18-slim

WORKDIR /app

# Install dependencies required by cPanel
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    git \
    && apt-get clean

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci

# Copy the rest of the code
COPY . .

# Build the application
RUN npm run build

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 