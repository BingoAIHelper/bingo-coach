import { PrismaClient } from '@prisma/client';
import * as cosmosDb from '../azure/cosmos';

// Determine the database type from environment variables
const dbType = process.env.DB_TYPE || 'local';

// Initialize Prisma client for local development
const prisma = new PrismaClient();

// A helper function to convert Cosmos DB format to Prisma format
const formatFromCosmosToLocal = (data: any) => {
  // Remove Cosmos DB specific fields
  if (data) {
    const { _rid, _self, _etag, _attachments, _ts, ...rest } = data;
    return rest;
  }
  return data;
};

// User operations
export async function createUser(userData: any) {
  if (dbType === 'azure') {
    return cosmosDb.createUser(userData);
  } else {
    // Explicitly construct the user data object to match Prisma schema
    return prisma.user.create({
      data: {
        email: userData.email,
        name: userData.name || `${userData.firstName} ${userData.lastName}`,
        firstName: userData.firstName,
        lastName: userData.lastName,
        password: userData.password,
        role: userData.role || 'seeker',
        isCoach: userData.isCoach || userData.role === 'coach',
        createdAt: userData.createdAt || new Date(),
        updatedAt: userData.updatedAt || new Date(),
        // Optional fields with explicit null checks
        profileImage: userData.profileImage || null,
        bio: userData.bio || null,
        location: userData.location || null,
        phone: userData.phone || null,
      }
    });
  }
}

export async function getUserById(userId: string) {
  if (dbType === 'azure') {
    const user = await cosmosDb.getUserById(userId);
    return formatFromCosmosToLocal(user);
  } else {
    try {
      // Use the actual schema fields and explicitly select them
      return await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          role: true,
          bio: true,
          isCoach: true,
          createdAt: true,
          updatedAt: true,
          profileImage: true,
          location: true,
          phone: true,
          password: true // Added password for auth
        }
      });
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }
}

export async function getUserByEmail(email: string) {
  if (dbType === 'azure') {
    const user = await cosmosDb.getUserByEmail(email);
    return formatFromCosmosToLocal(user);
  } else {
    try {
      // Include all new fields in the select including password for auth
      return await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          firstName: true,
          lastName: true,
          role: true,
          bio: true,
          isCoach: true,
          createdAt: true,
          updatedAt: true,
          profileImage: true,
          location: true,
          phone: true,
          password: true  // Added password for auth
        }
      });
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }
}

export async function updateUser(userId: string, userData: any) {
  if (dbType === 'azure') {
    return cosmosDb.updateUser(userId, userData);
  } else {
    // Extract all fields from the new schema
    const {
      email, 
      name, 
      firstName,
      lastName,
      password,
      role,
      bio, 
      isCoach, 
      updatedAt = new Date(),
      profileImage,
      location,
      phone
    } = userData;
    
    // Only include fields that are actually provided in the update
    const updateData: any = {};
    if (email !== undefined) updateData.email = email;
    if (name !== undefined) updateData.name = name;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (password !== undefined) updateData.password = password;
    if (role !== undefined) updateData.role = role;
    if (bio !== undefined) updateData.bio = bio;
    if (isCoach !== undefined) updateData.isCoach = isCoach;
    if (updatedAt !== undefined) updateData.updatedAt = updatedAt;
    if (profileImage !== undefined) updateData.profileImage = profileImage;
    if (location !== undefined) updateData.location = location;
    if (phone !== undefined) updateData.phone = phone;
    
    return prisma.user.update({
      where: { id: userId },
      data: updateData,
    });
  }
}

// Remaining functions stay the same as in the previous implementation
// (Job, Coach, Resume, Assessment, Application operations)
export async function createJob(jobData: any) {
  if (dbType === 'azure') {
    return cosmosDb.createJob(jobData);
  } else {
    return prisma.job.create({
      data: jobData,
    });
  }
}

export async function getJobs(querySpec: any = { query: "SELECT * FROM c" }) {
  if (dbType === 'azure') {
    const jobs = await cosmosDb.getJobs(querySpec);
    return jobs.map(formatFromCosmosToLocal);
  } else {
    return prisma.job.findMany();
  }
}

export async function getJobById(jobId: string) {
  if (dbType === 'azure') {
    const job = await cosmosDb.getJobById(jobId);
    return formatFromCosmosToLocal(job);
  } else {
    return prisma.job.findUnique({
      where: { id: jobId },
    });
  }
}

// Coach operations
export async function createCoach(coachData: any) {
  if (dbType === 'azure') {
    return cosmosDb.createCoach(coachData);
  } else {
    return prisma.coach.create({
      data: coachData,
    });
  }
}

export async function getCoaches(querySpec: any = { query: "SELECT * FROM c" }) {
  if (dbType === 'azure') {
    const coaches = await cosmosDb.getCoaches(querySpec);
    return coaches.map(formatFromCosmosToLocal);
  } else {
    return prisma.coach.findMany();
  }
}

export async function getCoachById(coachId: string) {
  if (dbType === 'azure') {
    const coach = await cosmosDb.getCoachById(coachId);
    return formatFromCosmosToLocal(coach);
  } else {
    return prisma.coach.findUnique({
      where: { id: coachId },
    });
  }
}

// Resume operations
export async function createResume(resumeData: any) {
  if (dbType === 'azure') {
    return cosmosDb.createResume(resumeData);
  } else {
    return prisma.resume.create({
      data: resumeData,
    });
  }
}

export async function getResumeByUserId(userId: string) {
  if (dbType === 'azure') {
    const resume = await cosmosDb.getResumeByUserId(userId);
    return formatFromCosmosToLocal(resume);
  } else {
    return prisma.resume.findFirst({
      where: { userId },
    });
  }
}

export async function getResumesByUserId(userId: string) {
  if (dbType === 'azure') {
    const resumes = await cosmosDb.getResumesByUserId(userId);
    return resumes.map(formatFromCosmosToLocal);
  } else {
    return prisma.resume.findMany({
      where: { userId },
    });
  }
}

// Assessment operations
export async function createAssessment(assessmentData: any) {
  if (dbType === 'azure') {
    // Forward to cosmosDb if available
    if (typeof cosmosDb.createAssessment === 'function') {
      return cosmosDb.createAssessment(assessmentData);
    } else {
      console.warn('createAssessment not implemented in cosmosDb module');
      return assessmentData;
    }
  } else {
    return prisma.assessment.create({
      data: assessmentData,
    });
  }
}

export async function getAssessmentByUserId(userId: string) {
  if (dbType === 'azure') {
    // Forward to cosmosDb if available
    if (typeof cosmosDb.getAssessmentByUserId === 'function') {
      const assessment = await cosmosDb.getAssessmentByUserId(userId);
      return formatFromCosmosToLocal(assessment);
    } else {
      console.warn('getAssessmentByUserId not implemented in cosmosDb module');
      return null;
    }
  } else {
    return prisma.assessment.findFirst({
      where: { userId },
    });
  }
}

export async function getAssessments() {
  if (dbType === 'azure') {
    // Forward to cosmosDb if available
    console.warn('getAssessments using Prisma instead of Cosmos DB');
    return prisma.assessment.findMany();
  } else {
    return prisma.assessment.findMany();
  }
}

// Application operations
export async function createApplication(applicationData: any) {
  if (dbType === 'azure') {
    // Forward to cosmosDb if available
    if (typeof cosmosDb.createApplication === 'function') {
      return cosmosDb.createApplication(applicationData);
    } else {
      console.warn('createApplication not implemented in cosmosDb module');
      return applicationData;
    }
  } else {
    return prisma.application.create({
      data: applicationData,
    });
  }
}

export async function getApplicationsByUserId(userId: string) {
  if (dbType === 'azure') {
    // Forward to cosmosDb if available
    if (typeof cosmosDb.getApplicationsByUserId === 'function') {
      const applications = await cosmosDb.getApplicationsByUserId(userId);
      return applications.map(formatFromCosmosToLocal);
    } else {
      console.warn('getApplicationsByUserId not implemented in cosmosDb module');
      return [];
    }
  } else {
    return prisma.application.findMany({
      where: { userId },
      include: {
        job: true,
        user: true,
      },
    });
  }
}

export async function getApplicationById(applicationId: string) {
  if (dbType === 'azure') {
    // Forward to cosmosDb if available
    if (typeof cosmosDb.getApplicationById === 'function') {
      const application = await cosmosDb.getApplicationById(applicationId);
      return formatFromCosmosToLocal(application);
    } else {
      console.warn('getApplicationById not implemented in cosmosDb module');
      return null;
    }
  } else {
    return prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        user: true,
      },
    });
  }
}

// Export the prisma client for direct access if needed
export { prisma };