# Migrating from Local Development to Azure

This guide provides instructions for migrating your application from the local SQL Server development environment to Azure Cosmos DB and other Azure services.

## Prerequisites

Before migrating to Azure, ensure you have:

1. An Azure account with active subscription
2. [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli) installed
3. Your application running properly in the local development environment

## Migration Steps

### 1. Create Azure Resources

Use the provided ARM template to create all necessary Azure resources:

```bash
# Login to Azure
az login

# Create a resource group
az group create --name bingo-resources --location eastus

# Deploy the ARM template
az deployment group create \
  --resource-group bingo-resources \
  --template-file azure-deploy.json
```

### 2. Set Up Azure Cosmos DB

After creating the Azure resources, you'll need to create the Cosmos DB containers:

```bash
# Get the Cosmos DB endpoint and key
COSMOS_ENDPOINT=$(az cosmosdb show --name <your-cosmos-db-name> --resource-group bingo-resources --query documentEndpoint --output tsv)
COSMOS_KEY=$(az cosmosdb keys list --name <your-cosmos-db-name> --resource-group bingo-resources --query primaryMasterKey --output tsv)

# Set environment variables
export AZURE_COSMOS_ENDPOINT=$COSMOS_ENDPOINT
export AZURE_COSMOS_KEY=$COSMOS_KEY
export AZURE_COSMOS_DATABASE=bingo-database
```

### 3. Migrate Data from SQL Server to Cosmos DB

We've created a migration script to help you transfer data from your local SQL Server to Azure Cosmos DB:

```bash
# Run the migration script
npm run db:migrate-to-azure
```

This script:
1. Reads data from the local SQL Server database
2. Transforms it to the format expected by Cosmos DB
3. Writes it to the corresponding Cosmos DB containers

### 4. Update Environment Variables

Update your `.env` file with all the necessary Azure credentials:

```bash
# Switch to Azure environment
./switch-env.sh azure

# Then edit .env to add your Azure credentials
```

Make sure to set the following environment variables:

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

# Other Azure services
...
```

### 5. Test the Application with Azure Resources

Before deploying, test your application locally while connected to Azure resources:

```bash
# Start the application in development mode
npm run dev
```

Verify that all features work correctly using the Azure backend.

### 6. Deploy to Azure

Once testing is complete, deploy your application to Azure App Service:

```bash
# Build and deploy the application
npm run azure-build
npm run azure-deploy
```

### 7. Verify the Deployment

Access your application at the Azure App Service URL:

```
https://bingo-job-coach-platform.azurewebsites.net
```

Verify that all features work correctly in the production environment.

## Automated Data Migration Script

Create a data migration script to help transfer data from SQL Server to Cosmos DB:

```bash
npm run db:create-migration-script
```

This will create a `migrate-to-azure.ts` script that you can customize for your specific data migration needs.

## Switching Between Environments

You can easily switch between local development and Azure production environments using:

```bash
# Switch to local development
./switch-env.sh local

# Switch to Azure production
./switch-env.sh azure
```

## Troubleshooting

- **Missing environment variables**: Ensure all Azure credentials are properly set in the `.env` file.
- **Connection issues**: Check that your IP address is allowed in the Azure firewall rules.
- **Data migration issues**: Use the Azure portal to verify that data has been correctly migrated.

## Additional Resources

- [Azure Cosmos DB Documentation](https://docs.microsoft.com/en-us/azure/cosmos-db/)
- [Azure App Service Documentation](https://docs.microsoft.com/en-us/azure/app-service/)
- [Azure Storage Documentation](https://docs.microsoft.com/en-us/azure/storage/) 