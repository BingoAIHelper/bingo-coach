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

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting deployment of Bingo Job Coach Platform to Azure...${NC}"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "Azure CLI is not installed. Please install it first."
    exit 1
fi

# Check if user is logged in to Azure
echo -e "${YELLOW}Checking Azure login status...${NC}"
az account show &> /dev/null || { echo "Please login to Azure first using 'az login'"; exit 1; }

# Check for .env file and get encryption key
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found. Please create one first.${NC}"
    exit 1
fi

# Get encryption key from .env file
ENCRYPTION_KEY=$(grep "ENCRYPTION_KEY=" .env | cut -d'=' -f2)
if [ -z "$ENCRYPTION_KEY" ]; then
    echo -e "${RED}Error: ENCRYPTION_KEY not found in .env file.${NC}"
    echo -e "${YELLOW}Please run ./scripts/generate-encryption-key.sh to generate a key.${NC}"
    exit 1
fi

# Create resource group if it doesn't exist
echo -e "${YELLOW}Creating resource group if it doesn't exist...${NC}"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Deploy ARM template
echo -e "${YELLOW}Deploying Azure resources using ARM template...${NC}"
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file azure-deploy.json \
  --parameters webAppName=$APP_NAME \
  --parameters cosmosDbAccountName=$COSMOS_DB_ACCOUNT \
  --parameters storageAccountName=$STORAGE_ACCOUNT \
  --parameters openAiServiceName=$OPENAI_SERVICE \
  --parameters formRecognizerName=$FORM_RECOGNIZER \
  --parameters textAnalyticsName=$TEXT_ANALYTICS \
  --parameters communicationServiceName=$COMMUNICATION_SERVICE \
  --parameters encryptionKey="$ENCRYPTION_KEY"

# Build the Next.js application
echo -e "${YELLOW}Building the Next.js application...${NC}"
npm run build

# Deploy the application to Azure App Service
echo -e "${YELLOW}Deploying the application to Azure App Service...${NC}"
az webapp deployment source config-zip \
  --resource-group $RESOURCE_GROUP \
  --name $APP_NAME \
  --src ./out.zip

# Get the application URL
APP_URL=$(az webapp show --name $APP_NAME --resource-group $RESOURCE_GROUP --query "defaultHostName" -o tsv)

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Your application is now available at: https://$APP_URL${NC}"
echo -e "${YELLOW}Note: Make sure the ENCRYPTION_KEY is properly set in your Azure App Service configuration.${NC}" 