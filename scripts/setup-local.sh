#!/bin/bash

# Exit on error
set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting local development setup...${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install npm first.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Function to prompt for input with a default value
prompt_input() {
    local prompt="$1"
    local default="$2"
    local input
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        echo "${input:-$default}"
    else
        read -p "$prompt: " input
        echo "$input"
    fi
}

# Create .env.local file
echo -e "${YELLOW}Setting up environment variables...${NC}"
cat > .env.local << EOL
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/bingo?schema=public"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Message Encryption
ENCRYPTION_KEY="$(openssl rand -base64 32)"

# Azure OpenAI Configuration (Optional)
AZURE_OPENAI_API_KEY="$(prompt_input "Enter Azure OpenAI API Key (optional)" "")"
AZURE_OPENAI_ENDPOINT="$(prompt_input "Enter Azure OpenAI Endpoint (optional)" "")"
AZURE_OPENAI_DEPLOYMENT_NAME="$(prompt_input "Enter Azure OpenAI Deployment Name (optional)" "")"

# Azure Storage Configuration (Optional)
AZURE_STORAGE_CONNECTION_STRING="$(prompt_input "Enter Azure Storage Connection String (optional)" "")"
AZURE_STORAGE_CONTAINER="$(prompt_input "Enter Azure Storage Container Name (optional)" "")"

# Azure Form Recognizer Configuration (Optional)
AZURE_FORM_RECOGNIZER_KEY="$(prompt_input "Enter Azure Form Recognizer Key (optional)" "")"
AZURE_FORM_RECOGNIZER_ENDPOINT="$(prompt_input "Enter Azure Form Recognizer Endpoint (optional)" "")"

# Azure Text Analytics Configuration (Optional)
AZURE_TEXT_ANALYTICS_KEY="$(prompt_input "Enter Azure Text Analytics Key (optional)" "")"
AZURE_TEXT_ANALYTICS_ENDPOINT="$(prompt_input "Enter Azure Text Analytics Endpoint (optional)" "")"

# Azure Communication Services Configuration (Optional)
AZURE_COMMUNICATION_CONNECTION_STRING="$(prompt_input "Enter Azure Communication Connection String (optional)" "")"

# Microsoft Authentication (Optional)
MICROSOFT_CLIENT_ID="$(prompt_input "Enter Microsoft Client ID (optional)" "")"
MICROSOFT_CLIENT_SECRET="$(prompt_input "Enter Microsoft Client Secret (optional)" "")"

# Application Settings
NODE_ENV="development"
DB_TYPE="local"
EOL

# Start Docker containers
echo -e "${YELLOW}Starting Docker containers...${NC}"
docker-compose up -d

# Wait for PostgreSQL to be ready
echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
until docker-compose exec -T postgres pg_isready -U postgres; do
    echo -e "${YELLOW}Waiting for PostgreSQL...${NC}"
    sleep 1
done

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
if ! npm install; then
    echo -e "${YELLOW}Regular npm install failed, trying with --legacy-peer-deps...${NC}"
    if ! npm install --legacy-peer-deps; then
        echo -e "${RED}Failed to install dependencies. Please check your package.json and try again.${NC}"
        exit 1
    fi
fi

# Generate Prisma client
echo -e "${YELLOW}Generating Prisma client...${NC}"
npx prisma generate

# Run database migrations
echo -e "${YELLOW}Running database migrations...${NC}"
npx prisma migrate dev

# Seed the database
echo -e "${YELLOW}Seeding the database...${NC}"
npm run db:seed

# Build the application
echo -e "${YELLOW}Building the application...${NC}"
npm run build

# Start the development server
echo -e "${GREEN}Local development setup completed!${NC}"
echo -e "${YELLOW}To start the development server, run:${NC}"
echo -e "npm run dev" 