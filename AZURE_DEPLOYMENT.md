# Deploying Bingo Job Coach Platform to Azure

This document provides instructions for deploying the Bingo Job Coach Platform to Azure.

## Prerequisites

Before deploying the application, ensure you have the following:

1. An Azure account with an active subscription
2. Azure CLI installed on your local machine
3. Node.js and npm installed on your local machine
4. Git installed on your local machine

## Azure Resources

The Bingo Job Coach Platform requires the following Azure resources:

1. **Azure App Service**: Hosts the Next.js application
2. **Azure Cosmos DB**: Stores user data, job listings, and application data
3. **Azure Blob Storage**: Stores resume files and other documents
4. **Azure OpenAI Service**: Powers AI features like resume analysis and job recommendations
5. **Azure Form Recognizer**: Extracts data from resume documents
6. **Azure Text Analytics**: Analyzes text for sentiment and key phrases
7. **Azure Communication Services**: Enables chat and communication features

## Deployment Steps

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/bingo-job-coach-platform.git
cd bingo-job-coach-platform
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Azure Resources

You can set up the required Azure resources using the provided ARM template:

```bash
# Create a resource group
az group create --name bingo-resources --location eastus

# Deploy the ARM template
az deployment group create \
  --resource-group bingo-resources \
  --template-file azure-deploy.json
```

### 4. Configure Environment Variables

Create a `.env` file with the following environment variables:

```
# Azure Configuration
AZURE_TENANT_ID=your-tenant-id
AZURE_CLIENT_ID=your-client-id
AZURE_CLIENT_SECRET=your-client-secret

# Azure Cosmos DB
AZURE_COSMOS_ENDPOINT=https://your-cosmos-db.documents.azure.com:443/
AZURE_COSMOS_KEY=your-cosmos-key
AZURE_COSMOS_DATABASE=bingo-database

# Azure Storage
AZURE_STORAGE_CONNECTION_STRING=your-storage-connection-string
AZURE_STORAGE_CONTAINER=bingo-container

# Azure OpenAI
AZURE_OPENAI_API_KEY=your-openai-api-key
AZURE_OPENAI_ENDPOINT=https://your-openai-service.openai.azure.com/
AZURE_OPENAI_DEPLOYMENT_NAME=your-deployment-name

# Azure Form Recognizer
AZURE_FORM_RECOGNIZER_KEY=your-form-recognizer-key
AZURE_FORM_RECOGNIZER_ENDPOINT=https://your-form-recognizer.cognitiveservices.azure.com/

# Azure Text Analytics
AZURE_TEXT_ANALYTICS_KEY=your-text-analytics-key
AZURE_TEXT_ANALYTICS_ENDPOINT=https://your-text-analytics.cognitiveservices.azure.com/

# Azure Communication Services
AZURE_COMMUNICATION_CONNECTION_STRING=your-communication-connection-string

# NextAuth.js
NEXTAUTH_URL=https://your-app-service-name.azurewebsites.net
NEXTAUTH_SECRET=your-nextauth-secret

# Microsoft Authentication
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

### 5. Build and Deploy the Application

You can use the provided deployment script to build and deploy the application:

```bash
# Make the deployment script executable
chmod +x deploy-to-azure.sh

# Run the deployment script
./deploy-to-azure.sh
```

Alternatively, you can build and deploy the application manually:

```bash
# Build the application
npm run azure-build

# Deploy to Azure App Service
az webapp deployment source config-zip \
  --resource-group bingo-resources \
  --name bingo-job-coach-platform \
  --src ./out.zip
```

### 6. Verify the Deployment

Once the deployment is complete, you can verify that the application is running by visiting the App Service URL:

```
https://bingo-job-coach-platform.azurewebsites.net
```

## Continuous Deployment

For continuous deployment, you can set up a GitHub Actions workflow to automatically deploy the application when changes are pushed to the main branch. A sample workflow file is provided in `.github/workflows/azure-deploy.yml`.

## Troubleshooting

If you encounter issues during deployment, check the following:

1. Ensure all environment variables are correctly set
2. Check the App Service logs for any errors
3. Verify that all required Azure resources are properly configured
4. Check the Azure portal for any resource-specific issues

## Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Cosmos DB Documentation](https://docs.microsoft.com/en-us/azure/cosmos-db/)
- [Azure Blob Storage Documentation](https://docs.microsoft.com/en-us/azure/storage/blobs/)
- [Azure OpenAI Service Documentation](https://docs.microsoft.com/en-us/azure/cognitive-services/openai/)
- [Next.js Documentation](https://nextjs.org/docs) 