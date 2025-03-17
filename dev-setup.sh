#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Print header
echo -e "${BLUE}=== Bingo Job Coach Platform - Development Environment Setup ===${NC}"
echo ""

# Check for Docker
echo -e "${BLUE}Checking for Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker and try again.${NC}"
    exit 1
fi

# Check for Node.js
echo -e "${BLUE}Checking for Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js and try again.${NC}"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${BLUE}Installing dependencies...${NC}"
    npm install --legacy-peer-deps
else
    echo -e "${GREEN}Dependencies already installed.${NC}"
fi

# Start Docker containers
echo -e "${BLUE}Starting SQL Server in Docker...${NC}"
npm run docker:up

# Wait for SQL Server to start
echo -e "${BLUE}Waiting for SQL Server to start (30 seconds)...${NC}"
sleep 30

# Generate Prisma client
echo -e "${BLUE}Generating Prisma client...${NC}"
npm run db:generate

# Create database and run migrations
echo -e "${BLUE}Setting up database schema...${NC}"
npx prisma migrate dev --name init

# Seed the database
echo -e "${BLUE}Seeding the database with test data...${NC}"
npm run db:seed

echo ""
echo -e "${GREEN}=== Development environment setup complete! ===${NC}"
echo -e "${GREEN}You can now start the application with:${NC}"
echo -e "${BLUE}npm run dev${NC}"
echo ""
echo -e "${GREEN}To access the database management tools:${NC}"
echo -e "${BLUE}1. Prisma Studio: npm run db:studio${NC}"
echo -e "${BLUE}2. Adminer: http://localhost:8080${NC}"
echo -e "   System: MS SQL Server"
echo -e "   Server: sqlserver"
echo -e "   Username: sa"
echo -e "   Password: YourStrongPassword123!"
echo -e "   Database: bingo_db"
echo "" 