#!/bin/bash

# Color definitions for better output readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored section headers
print_section() {
  echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Function to check if a command exists
check_command() {
  if ! command -v $1 &> /dev/null; then
    echo -e "${RED}Error: $1 is not installed or not in PATH.${NC}"
    echo -e "${YELLOW}Please install $1 and try again.${NC}"
    if [ "$2" != "" ]; then
      echo -e "${YELLOW}$2${NC}"
    fi
    exit 1
  else
    echo -e "${GREEN}✓ $1 is installed.${NC}"
  fi
}

# Print welcome header
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           BINGO JOB COACH PLATFORM - DEV SETUP             ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Check for required dependencies
print_section "CHECKING DEPENDENCIES"

# Check for Docker
check_command docker "Install from https://docs.docker.com/get-docker/"

# Check for Docker Compose (might be included in Docker Desktop for Mac)
if ! docker compose version &> /dev/null; then
  echo -e "${YELLOW}Warning: Docker Compose not found as a Docker plugin.${NC}"
  check_command docker-compose "Install from https://docs.docker.com/compose/install/"
fi

# Check for Node.js
check_command node "Install from https://nodejs.org/"

# Check for npm
check_command npm "Reinstall Node.js from https://nodejs.org/"

# Check for environment file
print_section "CHECKING ENVIRONMENT CONFIGURATION"
if [ ! -f ".env" ]; then
  echo -e "${RED}Error: .env file not found.${NC}"
  echo -e "${YELLOW}Please create an .env file with the required environment variables.${NC}"
  exit 1
else
  echo -e "${GREEN}✓ .env file found.${NC}"
  
  # Check if DATABASE_URL is defined in .env
  if ! grep -q "DATABASE_URL=" .env; then
    echo -e "${RED}Error: DATABASE_URL not found in .env file.${NC}"
    echo -e "${YELLOW}Please ensure your .env file contains a DATABASE_URL variable.${NC}"
    exit 1
  else
    echo -e "${GREEN}✓ DATABASE_URL found in .env file.${NC}"
  fi
fi

# Check Docker status
print_section "CHECKING DOCKER STATUS"
if ! docker info &> /dev/null; then
  echo -e "${RED}Error: Docker daemon is not running.${NC}"
  echo -e "${YELLOW}Please start Docker and try again.${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Docker daemon is running.${NC}"
fi

# Install project dependencies
print_section "INSTALLING DEPENDENCIES"
if [ ! -d "node_modules" ]; then
  echo -e "${BLUE}Installing npm dependencies...${NC}"
  npm install
  if [ $? -ne 0 ]; then
    echo -e "${YELLOW}Trying alternative installation with legacy peer deps...${NC}"
    npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
      echo -e "${RED}Failed to install dependencies.${NC}"
      exit 1
    fi
  fi
  echo -e "${GREEN}✓ Dependencies installed successfully.${NC}"
else
  echo -e "${GREEN}✓ Dependencies already installed.${NC}"
  echo -e "${BLUE}Running npm install to ensure dependencies are up to date...${NC}"
  npm install --silent
  echo -e "${GREEN}✓ Dependencies updated.${NC}"
fi

# Start Docker containers
print_section "SETTING UP DATABASE CONTAINERS"
echo -e "${BLUE}Starting Docker containers for database...${NC}"
docker-compose down &> /dev/null # Ensure clean start
docker-compose up -d

# Check if the containers are running
if [ $? -ne 0 ] || [ $(docker-compose ps -q | wc -l) -eq 0 ]; then
  echo -e "${RED}Error: Failed to start Docker containers.${NC}"
  echo -e "${YELLOW}Please check docker-compose.yml and try again.${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Docker containers started successfully.${NC}"
fi

# Wait for SQL Server to start
echo -e "${BLUE}Waiting for SQL Server to initialize (this may take a minute)...${NC}"
sleep 10

# Display container status
echo -e "${BLUE}Container status:${NC}"
docker-compose ps

# Generate Prisma client
print_section "SETTING UP DATABASE"
echo -e "${BLUE}Generating Prisma client...${NC}"
npx prisma generate
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to generate Prisma client.${NC}"
  exit 1
else
  echo -e "${GREEN}✓ Prisma client generated successfully.${NC}"
fi

# Run database migrations
echo -e "${BLUE}Running database migrations...${NC}"
npx prisma migrate dev --name init
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to run database migrations.${NC}"
  echo -e "${YELLOW}This might be because the database is already set up or there are connection issues.${NC}"
  echo -e "${YELLOW}Continuing with the setup process...${NC}"
else
  echo -e "${GREEN}✓ Database migrations completed successfully.${NC}"
fi

# Seed the database
echo -e "${BLUE}Seeding the database with initial data...${NC}"
npm run db:seed
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to seed the database.${NC}"
  echo -e "${YELLOW}The database might already be seeded or there might be seeding issues.${NC}"
  echo -e "${YELLOW}Continuing with the setup process...${NC}"
else
  echo -e "${GREEN}✓ Database seeded successfully.${NC}"
fi

# Final success message
print_section "SETUP COMPLETE"
echo -e "${GREEN}✓ Development environment has been set up successfully!${NC}"
echo -e ""
echo -e "${BLUE}To start the development server:${NC}"
echo -e "  npm run dev"
echo -e ""
echo -e "${BLUE}Database connection details:${NC}"
echo -e "  Host: localhost"
echo -e "  Port: 1433"
echo -e "  Database: bingo_db"
echo -e "  User: sa"
echo -e "  Password: (As defined in your .env file)"
echo -e ""
echo -e "${BLUE}Database management tools:${NC}"
echo -e "  1. Prisma Studio: npm run db:studio"
echo -e "  2. Adminer: http://localhost:8080"
echo -e "     System: MS SQL Server"
echo -e "     Server: sqlserver"
echo -e "     Username: sa"
echo -e "     Password: (As defined in your .env file)"
echo -e "     Database: bingo_db"
echo -e ""
echo -e "${BLUE}To stop the Docker containers when done:${NC}"
echo -e "  docker-compose down"
echo -e ""
echo -e "${GREEN}Happy coding!${NC}"