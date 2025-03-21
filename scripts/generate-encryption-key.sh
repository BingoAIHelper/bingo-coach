#!/bin/bash

# Color definitions for better output readability
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored section headers
print_section() {
  echo -e "\n${BLUE}=== $1 ===${NC}"
}

# Generate a secure random key
print_section "Generating Encryption Key"
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Check if .env file exists
if [ ! -f ".env" ]; then
  echo -e "${RED}Error: .env file not found.${NC}"
  echo -e "${YELLOW}Please create a .env file first.${NC}"
  exit 1
fi

# Check if ENCRYPTION_KEY already exists
if grep -q "ENCRYPTION_KEY=" .env; then
  echo -e "${YELLOW}ENCRYPTION_KEY already exists in .env file.${NC}"
  echo -e "${YELLOW}Do you want to update it? (y/n)${NC}"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]; then
    # Update existing ENCRYPTION_KEY
    sed -i '' "s|ENCRYPTION_KEY=.*|ENCRYPTION_KEY=$ENCRYPTION_KEY|" .env
    echo -e "${GREEN}Updated ENCRYPTION_KEY in .env file.${NC}"
  else
    echo -e "${YELLOW}Keeping existing ENCRYPTION_KEY.${NC}"
  fi
else
  # Add new ENCRYPTION_KEY
  echo -e "\n# Message Encryption Key" >> .env
  echo "ENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env
  echo -e "${GREEN}Added ENCRYPTION_KEY to .env file.${NC}"
fi

echo -e "\n${GREEN}Encryption key setup complete!${NC}"
echo -e "${YELLOW}Make sure to keep your .env file secure and never commit it to version control.${NC}" 