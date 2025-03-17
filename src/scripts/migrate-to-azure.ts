import { PrismaClient } from '@prisma/client';
import { CosmosClient, ItemDefinition, ItemResponse } from '@azure/cosmos';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Prisma client for SQL Server
const prisma = new PrismaClient();

// Initialize Cosmos client for Azure
const cosmosEndpoint = process.env.AZURE_COSMOS_ENDPOINT || '';
const cosmosKey = process.env.AZURE_COSMOS_KEY || '';
const databaseId = process.env.AZURE_COSMOS_DATABASE || 'bingo-database';
const cosmosClient = new CosmosClient({ endpoint: cosmosEndpoint, key: cosmosKey });
const database = cosmosClient.database(databaseId);

// Container names
const CONTAINERS = {
  USERS: 'users',
  JOBS: 'jobs',
  COACHES: 'coaches',
  RESUMES: 'resumes',
  ASSESSMENTS: 'assessments',
  APPLICATIONS: 'applications',
};

// Ensure containers exist
async function ensureContainersExist() {
  console.log('Ensuring Cosmos DB containers exist...');
  
  for (const containerName of Object.values(CONTAINERS)) {
    try {
      await database.containers.createIfNotExists({
        id: containerName,
        partitionKey: { paths: ['/id'] }
      });
      console.log(`Container ${containerName} exists or was created.`);
    } catch (error) {
      console.error(`Error creating container ${containerName}:`, error);
      throw error;
    }
  }
}

// Migrate users
async function migrateUsers() {
  console.log('Migrating users...');
  const users = await prisma.user.findMany();
  const container = database.container(CONTAINERS.USERS);
  
  for (const user of users) {
    try {
      const response: ItemResponse<ItemDefinition> = await container.items.upsert({
        id: user.id,
        item: user
      });
      console.log(`Migrated user: ${user.id}`);
    } catch (error) {
      console.error(`Error migrating user ${user.id}:`, error);
    }
  }
}

// Migrate jobs
async function migrateJobs() {
  console.log('Migrating jobs...');
  const jobs = await prisma.job.findMany();
  const container = database.container(CONTAINERS.JOBS);
  
  for (const job of jobs) {
    try {
      const response: ItemResponse<ItemDefinition> = await container.items.upsert({
        id: job.id,
        item: job
      });
      console.log(`Migrated job: ${job.id}`);
    } catch (error) {
      console.error(`Error migrating job ${job.id}:`, error);
    }
  }
}

// Migrate coaches
async function migrateCoaches() {
  console.log('Migrating coaches...');
  const coaches = await prisma.coach.findMany();
  const container = database.container(CONTAINERS.COACHES);
  
  for (const coach of coaches) {
    try {
      const response: ItemResponse<ItemDefinition> = await container.items.upsert({
        id: coach.id,
        item: coach
      });
      console.log(`Migrated coach: ${coach.id}`);
    } catch (error) {
      console.error(`Error migrating coach ${coach.id}:`, error);
    }
  }
}

// Migrate resumes
async function migrateResumes() {
  console.log('Migrating resumes...');
  const resumes = await prisma.resume.findMany();
  const container = database.container(CONTAINERS.RESUMES);
  
  for (const resume of resumes) {
    try {
      const response: ItemResponse<ItemDefinition> = await container.items.upsert({
        id: resume.id,
        item: resume
      });
      console.log(`Migrated resume: ${resume.id}`);
    } catch (error) {
      console.error(`Error migrating resume ${resume.id}:`, error);
    }
  }
}

// Migrate assessments
async function migrateAssessments() {
  console.log('Migrating assessments...');
  const assessments = await prisma.assessment.findMany();
  const container = database.container(CONTAINERS.ASSESSMENTS);
  
  for (const assessment of assessments) {
    try {
      const response: ItemResponse<ItemDefinition> = await container.items.upsert({
        id: assessment.id,
        item: assessment
      });
      console.log(`Migrated assessment: ${assessment.id}`);
    } catch (error) {
      console.error(`Error migrating assessment ${assessment.id}:`, error);
    }
  }
}

// Migrate applications
async function migrateApplications() {
  console.log('Migrating applications...');
  const applications = await prisma.application.findMany();
  const container = database.container(CONTAINERS.APPLICATIONS);
  
  for (const application of applications) {
    try {
      const response: ItemResponse<ItemDefinition> = await container.items.upsert({
        id: application.id,
        item: application
      });
      console.log(`Migrated application: ${application.id}`);
    } catch (error) {
      console.error(`Error migrating application ${application.id}:`, error);
    }
  }
}

// Run migration
async function migrate() {
  try {
    console.log('Starting migration from SQL Server to Cosmos DB...');
    
    // Check if Cosmos DB credentials are set
    if (!cosmosEndpoint || !cosmosKey) {
      throw new Error('Cosmos DB endpoint or key not set. Please check your environment variables.');
    }
    
    // Ensure containers exist
    await ensureContainersExist();
    
    // Migrate data
    await migrateUsers();
    await migrateJobs();
    await migrateCoaches();
    await migrateResumes();
    await migrateAssessments();
    await migrateApplications();
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute migration
migrate(); 