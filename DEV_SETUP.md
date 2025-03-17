# Development Environment Setup

This guide provides instructions for setting up a local development environment for the Bingo Job Coach Platform.

## Prerequisites

- [Node.js](https://nodejs.org/en/) (v16 or later)
- [Docker](https://www.docker.com/get-started) and Docker Compose
- [Git](https://git-scm.com/downloads)

## Setting Up the Local Environment

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the SQL Server Database

The application uses Docker to run a local SQL Server instance for development. Start the database with:

```bash
npm run docker:up
```

This command starts a SQL Server container and an Adminer container for database management.

### 3. Set Up the Database Schema

Run database migrations and seed the database with test data:

```bash
npm run db:migrate
npm run db:seed
```

Alternatively, you can run the entire setup in one command:

```bash
npm run db:setup
```

### 4. Start the Development Server

```bash
npm run dev
```

The application will be available at http://localhost:3000.

## Accessing the Database

### Using Prisma Studio

Prisma Studio provides a web interface for working with your database:

```bash
npm run db:studio
```

This will open Prisma Studio at http://localhost:5555.

### Using Adminer

Adminer is also available at http://localhost:8080 with the following credentials:

- System: MS SQL Server
- Server: sqlserver
- Username: sa
- Password: YourStrongPassword123!
- Database: bingo_db

## Testing with Local vs. Azure Configuration

The application can work with either a local SQL Server database or Azure Cosmos DB. The environment variable `DB_TYPE` controls which database to use:

- `DB_TYPE=local` (default): Uses the local SQL Server database
- `DB_TYPE=azure`: Uses Azure Cosmos DB

To test with Azure Cosmos DB, update the `.env` file with the Azure credentials and set `DB_TYPE=azure`.

## Switching Between Local and Azure

When ready to deploy to Azure, update the following files:

1. Set `DB_TYPE=azure` in the environment variables
2. Ensure all Azure credentials are properly set in the environment variables

## Additional Commands

- `npm run docker:down`: Stop the Docker containers
- `npm run db:generate`: Generate the Prisma client
- `npm run azure-build`: Build the application for Azure deployment
- `npm run azure-deploy`: Deploy the application to Azure 