#!/bin/bash

# Exit on error
set -e

# Configuration
RESOURCE_GROUP="bingo-resources"
LOCATION="eastus"
APP_NAME="bingo-job-coach-platform"
COSMOS_DB_ACCOUNT="bingo-cosmos-db"
STORAGE_ACCOUNT="bingostorage"
OPENAI_SERVICE="bingo-openai"
FORM_RECOGNIZER="bingo-form-recognizer"
TEXT_ANALYTICS="bingo-text-analytics"
COMMUNICATION_SERVICE="bingo-communication"
POSTGRES_SERVER="bingo-postgres"
POSTGRES_DATABASE="bingo"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting Azure deployment...${NC}"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}Azure CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if user is logged in to Azure
echo -e "${YELLOW}Checking Azure login status...${NC}"
az account show &> /dev/null || { echo -e "${RED}Please login to Azure first using 'az login'${NC}"; exit 1; }

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

# Create resource group if it doesn't exist
echo -e "${YELLOW}Creating resource group if it doesn't exist...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Azure Database for PostgreSQL
echo -e "${YELLOW}Creating Azure Database for PostgreSQL...${NC}"
POSTGRES_USERNAME="bingo_admin"
POSTGRES_PASSWORD=$(openssl rand -base64 32)
az postgres flexible-server create \
    --resource-group $RESOURCE_GROUP \
    --name $POSTGRES_SERVER \
    --admin-user $POSTGRES_USERNAME \
    --admin-password $POSTGRES_PASSWORD \
    --sku-name Standard_B1ms \
    --tier Burstable \
    --storage-size 32 \
    --database-name $POSTGRES_DATABASE

# Get PostgreSQL connection string
POSTGRES_CONNECTION_STRING=$(az postgres flexible-server show-connection-string \
    --server-name $POSTGRES_SERVER \
    --database-name $POSTGRES_DATABASE \
    --admin-user $POSTGRES_USERNAME \
    --admin-password $POSTGRES_PASSWORD \
    --query connectionStrings.jdbc \
    --output tsv)

# Create Azure Cosmos DB
echo -e "${YELLOW}Creating Azure Cosmos DB...${NC}"
az cosmosdb create \
    --name $COSMOS_DB_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --kind GlobalDocumentDB \
    --default-consistency-level Session

# Get Cosmos DB connection string
COSMOS_CONNECTION_STRING=$(az cosmosdb keys list \
    --name $COSMOS_DB_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --type connection-strings \
    --query connectionStrings[0].connectionString \
    --output tsv)

# Create Azure Storage Account
echo -e "${YELLOW}Creating Azure Storage Account...${NC}"
az storage account create \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --location $LOCATION \
    --sku Standard_LRS \
    --kind StorageV2

# Get Storage Account connection string
STORAGE_CONNECTION_STRING=$(az storage account show-connection-string \
    --name $STORAGE_ACCOUNT \
    --resource-group $RESOURCE_GROUP \
    --query connectionString \
    --output tsv)

# Create Azure OpenAI Service
echo -e "${YELLOW}Creating Azure OpenAI Service...${NC}"
az cognitiveservices account create \
    --name $OPENAI_SERVICE \
    --resource-group $RESOURCE_GROUP \
    --kind OpenAI \
    --sku S0 \
    --location $LOCATION

# Get OpenAI API key
OPENAI_API_KEY=$(az cognitiveservices account keys list \
    --name $OPENAI_SERVICE \
    --resource-group $RESOURCE_GROUP \
    --query key1 \
    --output tsv)

# Create Azure Form Recognizer
echo -e "${YELLOW}Creating Azure Form Recognizer...${NC}"
az cognitiveservices account create \
    --name $FORM_RECOGNIZER \
    --resource-group $RESOURCE_GROUP \
    --kind FormRecognizer \
    --sku F0 \
    --location $LOCATION

# Get Form Recognizer key and endpoint
FORM_RECOGNIZER_KEY=$(az cognitiveservices account keys list \
    --name $FORM_RECOGNIZER \
    --resource-group $RESOURCE_GROUP \
    --query key1 \
    --output tsv)
FORM_RECOGNIZER_ENDPOINT=$(az cognitiveservices account show \
    --name $FORM_RECOGNIZER \
    --resource-group $RESOURCE_GROUP \
    --query properties.endpoint \
    --output tsv)

# Create Azure Text Analytics
echo -e "${YELLOW}Creating Azure Text Analytics...${NC}"
az cognitiveservices account create \
    --name $TEXT_ANALYTICS \
    --resource-group $RESOURCE_GROUP \
    --kind TextAnalytics \
    --sku F0 \
    --location $LOCATION

# Get Text Analytics key and endpoint
TEXT_ANALYTICS_KEY=$(az cognitiveservices account keys list \
    --name $TEXT_ANALYTICS \
    --resource-group $RESOURCE_GROUP \
    --query key1 \
    --output tsv)
TEXT_ANALYTICS_ENDPOINT=$(az cognitiveservices account show \
    --name $TEXT_ANALYTICS \
    --resource-group $RESOURCE_GROUP \
    --query properties.endpoint \
    --output tsv)

# Create Azure Communication Services
echo -e "${YELLOW}Creating Azure Communication Services...${NC}"
az communication create \
    --name $COMMUNICATION_SERVICE \
    --location $LOCATION \
    --data-location "United States"

# Get Communication Services connection string
COMMUNICATION_CONNECTION_STRING=$(az communication list-key \
    --name $COMMUNICATION_SERVICE \
    --resource-group $RESOURCE_GROUP \
    --query primaryConnectionString \
    --output tsv)

# Generate encryption key
ENCRYPTION_KEY=$(openssl rand -base64 32)

# Create .env file for Azure deployment
echo -e "${YELLOW}Creating environment file for Azure deployment...${NC}"
cat > .env << EOL
# Azure Configuration
AZURE_TENANT_ID="$(az account show --query tenantId -o tsv)"
AZURE_CLIENT_ID="$(prompt_input "Enter Azure Client ID" "")"
AZURE_CLIENT_SECRET="$(prompt_input "Enter Azure Client Secret" "")"

# Azure Cosmos DB
AZURE_COSMOS_ENDPOINT="https://${COSMOS_DB_ACCOUNT}.documents.azure.com:443/"
AZURE_COSMOS_KEY="${COSMOS_CONNECTION_STRING}"
AZURE_COSMOS_DATABASE="bingo-database"

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING="${STORAGE_CONNECTION_STRING}"
AZURE_STORAGE_CONTAINER="bingo-container"

# Azure OpenAI
AZURE_OPENAI_API_KEY="${OPENAI_API_KEY}"
AZURE_OPENAI_ENDPOINT="https://${OPENAI_SERVICE}.openai.azure.com/"
AZURE_OPENAI_DEPLOYMENT_NAME="$(prompt_input "Enter Azure OpenAI Deployment Name" "gpt-4")"

# Azure Form Recognizer
AZURE_FORM_RECOGNIZER_KEY="${FORM_RECOGNIZER_KEY}"
AZURE_FORM_RECOGNIZER_ENDPOINT="${FORM_RECOGNIZER_ENDPOINT}"

# Azure Text Analytics
AZURE_TEXT_ANALYTICS_KEY="${TEXT_ANALYTICS_KEY}"
AZURE_TEXT_ANALYTICS_ENDPOINT="${TEXT_ANALYTICS_ENDPOINT}"

# Azure Communication Services
AZURE_COMMUNICATION_CONNECTION_STRING="${COMMUNICATION_CONNECTION_STRING}"

# NextAuth.js
NEXTAUTH_URL="https://${APP_NAME}.azurewebsites.net"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# Microsoft Authentication
MICROSOFT_CLIENT_ID="$(prompt_input "Enter Microsoft Client ID" "")"
MICROSOFT_CLIENT_SECRET="$(prompt_input "Enter Microsoft Client Secret" "")"

# Application Settings
NODE_ENV="production"
DB_TYPE="azure"

# Message Encryption
ENCRYPTION_KEY="${ENCRYPTION_KEY}"

# Database Configuration
DATABASE_URL="${POSTGRES_CONNECTION_STRING}"
EOL

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

# Generate Prisma client
echo -e "${YELLOW}Generating Prisma client...${NC}"
npx prisma generate

# Build the application
echo -e "${YELLOW}Building the application...${NC}"
npm run build

# Deploy to Azure App Service
echo -e "${YELLOW}Deploying to Azure App Service...${NC}"
az webapp deployment source config-zip \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --src ./out.zip

# Configure app settings
echo -e "${YELLOW}Configuring app settings...${NC}"
az webapp config appsettings set \
    --resource-group $RESOURCE_GROUP \
    --name $APP_NAME \
    --settings @.env

# Get the application URL
APP_URL=$(az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv)

echo -e "${GREEN}Azure deployment completed successfully!${NC}"
echo -e "${GREEN}Your application is now available at: https://$APP_URL${NC}"
echo -e "${YELLOW}Important: Please save the following credentials securely:${NC}"
echo -e "PostgreSQL Username: $POSTGRES_USERNAME"
echo -e "PostgreSQL Password: $POSTGRES_PASSWORD"
echo -e "Encryption Key: $ENCRYPTION_KEY" 