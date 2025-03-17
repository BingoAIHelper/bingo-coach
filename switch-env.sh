#!/bin/bash

# Color definitions
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found. Please create a .env file first.${NC}"
    exit 1
fi

# Function to show current environment
show_current_env() {
    current_env=$(grep "DB_TYPE=" .env | cut -d= -f2)
    echo -e "${BLUE}Current environment: ${GREEN}${current_env}${NC}"
}

# Show current environment
show_current_env

# Check command line arguments
if [ "$1" == "local" ]; then
    # Switch to local development
    echo -e "${YELLOW}Switching to local SQL Server development environment...${NC}"
    sed -i '' 's/DB_TYPE=.*/DB_TYPE=local/g' .env
    echo -e "${GREEN}Environment switched to local SQL Server.${NC}"
    show_current_env
    echo -e "${BLUE}To start the local development environment, run:${NC}"
    echo -e "${GREEN}./dev-setup.sh${NC}"
elif [ "$1" == "azure" ]; then
    # Switch to Azure
    echo -e "${YELLOW}Switching to Azure production environment...${NC}"
    sed -i '' 's/DB_TYPE=.*/DB_TYPE=azure/g' .env
    echo -e "${GREEN}Environment switched to Azure Cosmos DB.${NC}"
    echo -e "${YELLOW}Warning: Make sure all Azure credentials are properly set in .env file!${NC}"
    show_current_env
else
    # Show usage
    echo -e "${BLUE}Usage:${NC}"
    echo -e "  ${GREEN}./switch-env.sh local${NC} - Switch to local SQL Server development"
    echo -e "  ${GREEN}./switch-env.sh azure${NC} - Switch to Azure Cosmos DB production"
fi 