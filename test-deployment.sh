#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment test for cPanel environment...${NC}"

# Check if .env.local exists
if [ ! -f .env.local ]; then
  echo -e "${RED}ERROR: .env.local file is missing!${NC}"
  echo "Please create an .env.local file with your production environment variables."
  exit 1
else
  echo -e "${GREEN}✓ .env.local file exists${NC}"
fi

# Check for presence of critical files
for file in next.config.js package.json tsconfig.json; do
  if [ ! -f "$file" ]; then
    echo -e "${RED}ERROR: $file is missing!${NC}"
    exit 1
  else
    echo -e "${GREEN}✓ $file exists${NC}"
  fi
done

# Check Node.js version
NODE_VERSION=$(node -v)
echo "Node.js version: $NODE_VERSION"
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1 | sed 's/v//')
if [ "$NODE_MAJOR" -lt "16" ]; then
  echo -e "${RED}ERROR: Node.js version is too old. Next.js requires Node.js 16 or newer.${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Node.js version is compatible${NC}"
fi

# Check npm version
NPM_VERSION=$(npm -v)
echo "npm version: $NPM_VERSION"
NPM_MAJOR=$(echo $NPM_VERSION | cut -d. -f1)
if [ "$NPM_MAJOR" -lt "8" ]; then
  echo -e "${YELLOW}WARNING: npm version is old. Consider upgrading to npm 8 or newer.${NC}"
else
  echo -e "${GREEN}✓ npm version is compatible${NC}"
fi

# Check TypeScript configuration
if grep -q "bundler" tsconfig.json; then
  echo -e "${YELLOW}WARNING: moduleResolution is set to 'bundler' which may cause issues on cPanel. Consider using 'node' instead.${NC}"
else
  echo -e "${GREEN}✓ TypeScript moduleResolution looks good${NC}"
fi

# Run npm build to see if there are any issues
echo -e "${YELLOW}Running npm build to check for compilation issues...${NC}"
npm run build

if [ $? -ne 0 ]; then
  echo -e "${RED}ERROR: Build failed! Fix TypeScript and build errors before deploying.${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Build completed successfully${NC}"
fi

echo -e "${YELLOW}Testing Docker environment that simulates cPanel...${NC}"
docker-compose up -d --build

if [ $? -ne 0 ]; then
  echo -e "${RED}ERROR: Docker environment failed to start!${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Docker environment started successfully${NC}"
  echo -e "${YELLOW}Waiting 10 seconds for the application to initialize...${NC}"
  sleep 10
fi

# Test if the application is running
echo -e "${YELLOW}Testing if the application is accessible...${NC}"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)

if [[ $HTTP_STATUS == 2* ]]; then
  echo -e "${GREEN}✓ Application is running and returning HTTP status $HTTP_STATUS${NC}"
else
  echo -e "${RED}ERROR: Application is not accessible or returned HTTP status $HTTP_STATUS${NC}"
  echo "Check the logs for more information:"
  docker-compose logs
  exit 1
fi

# Stop Docker containers
echo -e "${YELLOW}Stopping Docker environment...${NC}"
docker-compose down

echo -e "${GREEN}✓ Deployment test completed successfully!${NC}"
echo -e "${YELLOW}Your application should work in cPanel. Remember to set up all required environment variables.${NC}" 