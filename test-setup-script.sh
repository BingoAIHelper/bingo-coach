#!/bin/bash

# This is a test script to validate the dependency checking portion of setup-dev-environment.sh
# without actually making any changes to the environment or starting Docker.

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
    echo -e "${YELLOW}This is just a test - the script will continue.${NC}"
  else
    echo -e "${GREEN}✓ $1 is installed.${NC}"
  fi
}

# Print welcome header
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           TEST SCRIPT - CHECKING DEPENDENCIES ONLY         ║${NC}"
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
  echo -e "${YELLOW}This is just a test - the script will continue.${NC}"
else
  echo -e "${GREEN}✓ .env file found.${NC}"
  
  # Check if DATABASE_URL is defined in .env
  if ! grep -q "DATABASE_URL=" .env; then
    echo -e "${RED}Error: DATABASE_URL not found in .env file.${NC}"
    echo -e "${YELLOW}Please ensure your .env file contains a DATABASE_URL variable.${NC}"
    echo -e "${YELLOW}This is just a test - the script will continue.${NC}"
  else
    echo -e "${GREEN}✓ DATABASE_URL found in .env file.${NC}"
  fi
fi

# Test completed
print_section "TEST COMPLETE"
echo -e "${GREEN}Test completed successfully!${NC}"
echo -e "${YELLOW}This was just a validation test of the dependency checking portion of the setup script.${NC}"
echo -e "${YELLOW}No changes were made to your environment.${NC}"
echo -e ""
echo -e "${BLUE}To run the full setup, execute:${NC}"
echo -e "  ./setup-dev-environment.sh"