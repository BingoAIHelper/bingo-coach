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

# Generate secure keys
echo -e "${YELLOW}Generating secure keys...${NC}"
ENCRYPTION_KEY=$(openssl rand -base64 32)
JWT_SECRET=$(openssl rand -base64 32)
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Create .env file with base configuration
echo -e "${YELLOW}Setting up base environment variables...${NC}"
cat > .env << EOL
# Database Configuration
DATABASE_URL="sqlserver://localhost:1433;database=bingo_db;user=sa;password=YourStrongPassword123!;trustServerCertificate=true"

# NextAuth.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"

# Message Encryption
ENCRYPTION_KEY="${ENCRYPTION_KEY}"

# JWT Configuration
JWT_SECRET="${JWT_SECRET}"

# Application Settings
NODE_ENV="development"
DB_TYPE="local"
EOL

# Create .env.local file with development-specific settings
echo -e "${YELLOW}Setting up development environment variables...${NC}"
cat > .env.local << EOL
# Azure OpenAI Configuration (Requird for AI features)
AZURE_OPENAI_API_KEY="$(prompt_input "Enter Azure OpenAI API Key (optional)" "")"
AZURE_OPENAI_ENDPOINT="$(prompt_input "Enter Azure OpenAI Endpoint (optional)" "")"
AZURE_OPENAI_DEPLOYMENT_NAME="$(prompt_input "Enter Azure OpenAI Deployment Name (optional)" "")"

# Azure Storage Configuration (Required for file uploads)
AZURE_STORAGE_CONNECTION_STRING="$(prompt_input "Enter Azure Storage Connection String (optional)" "")"
AZURE_STORAGE_CONTAINER="$(prompt_input "Enter Azure Storage Container Name (optional)" "")"

# Azure Form Recognizer Configuration (Required for AI features)
AZURE_FORM_RECOGNIZER_KEY="$(prompt_input "Enter Azure Form Recognizer Key (optional)" "")"
AZURE_FORM_RECOGNIZER_ENDPOINT="$(prompt_input "Enter Azure Form Recognizer Endpoint (optional)" "")"

# Azure Text Analytics Configuration (Required for AI features)
AZURE_TEXT_ANALYTICS_KEY="$(prompt_input "Enter Azure Text Analytics Key (optional)" "")"
AZURE_TEXT_ANALYTICS_ENDPOINT="$(prompt_input "Enter Azure Text Analytics Endpoint (optional)" "")"

# Azure Language (Required for AI features)
AZURE_LANGUAGE_ENDPOINT="$(prompt_input "Enter Azure Language Endpoint (optional)" "")"
AZURE_LANGUAGE_KEY="$(prompt_input "Enter Azure Language Key (optional)" "")

# Azure Communication Services Configuration (Required for chat features)
AZURE_COMMUNICATION_CONNECTION_STRING="$(prompt_input "Enter Azure Communication Connection String (optional)" "")"

# Microsoft Authentication (Optional)
MICROSOFT_CLIENT_ID="$(prompt_input "Enter Microsoft Client ID (optional)" "")"
MICROSOFT_CLIENT_SECRET="$(prompt_input "Enter Microsoft Client Secret (optional)" "")"

# Azure Tenant Configuration (Optional)
AZURE_TENANT_ID="placeholder-tenant-id"
AZURE_CLIENT_ID="placeholder-client-id"
AZURE_CLIENT_SECRET="placeholder-client-secret"

# Azure Cosmos DB
AZURE_COSMOS_ENDPOINT="https://placeholder-cosmos-db.documents.azure.com/"
AZURE_COSMOS_KEY="placeholder-cosmos-key"
AZURE_COSMOS_DATABASE="bingo-database"


# Azure Configuration
NODE_ENV="development"
DB_TYPE="local"
EOL

# Save sensitive keys to a secure file
echo -e "${YELLOW}Saving sensitive keys to .env.keys (make sure to keep this file secure)...${NC}"
cat > .env.keys << EOL
# Generated on $(date)
# Keep these keys secure and never commit them to version control
ENCRYPTION_KEY="${ENCRYPTION_KEY}"
JWT_SECRET="${JWT_SECRET}"
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
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