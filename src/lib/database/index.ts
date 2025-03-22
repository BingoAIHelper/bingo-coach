import { PrismaClient } from '@prisma/client';
import * as cosmosDb from '../azure/cosmos';
import { encryptMessage, decryptMessage } from "@/lib/utils/encryption";

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
export async function createUser(data: {
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  password: string;
  role: string;
  isCoach: boolean;
  bio?: string;
  location?: string;
  phone?: string;
  // Coach-specific fields
  expertise?: string[] | string;
  specialties?: string[] | string;
  yearsExperience?: number;
  industries?: string[] | string;
  coachingStyle?: string;
  hourlyRate?: number;
  availability?: string[] | string;
  languages?: string[] | string;
  certifications?: string[] | string;
}) {
  try {
    // Helper function to handle array or string input
    const parseArrayField = (field: string[] | string | undefined): string | null => {
      if (!field) return null;
      if (Array.isArray(field)) return JSON.stringify(field);
      try {
        // If it's already a JSON string, validate it by parsing and re-stringifying
        JSON.parse(field);
        return field;
      } catch {
        // If it's not a valid JSON string, treat it as a single-item array
        return JSON.stringify([field]);
      }
    };

    // Create the user first
    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        firstName: data.firstName,
        lastName: data.lastName,
        password: data.password,
        role: data.role,
        isCoach: data.isCoach,
        bio: data.bio,
        location: data.location,
        phone: data.phone
      }
    });

    // If this is a coach, create the coach record
    if (data.isCoach) {
      await prisma.coach.create({
        data: {
          userId: user.id,
          name: data.name,
          email: data.email,
          bio: data.bio,
          expertise: parseArrayField(data.expertise),
          specialties: parseArrayField(data.specialties),
          industries: parseArrayField(data.industries),
          hourlyRate: data.hourlyRate,
          availability: parseArrayField(data.availability),
          languages: parseArrayField(data.languages),
          certifications: parseArrayField(data.certifications)
        }
      });

      // Get the full user with coach data
      const userWithCoach = await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          coach: true
        }
      });

      // Transform the JSON strings back to arrays in the response
      return {
        ...userWithCoach,
        coach: userWithCoach?.coach ? {
          ...userWithCoach.coach,
          expertise: userWithCoach.coach.expertise ? JSON.parse(userWithCoach.coach.expertise) : [],
          specialties: userWithCoach.coach.specialties ? JSON.parse(userWithCoach.coach.specialties) : [],
          industries: userWithCoach.coach.industries ? JSON.parse(userWithCoach.coach.industries) : [],
          availability: userWithCoach.coach.availability ? JSON.parse(userWithCoach.coach.availability) : [],
          languages: userWithCoach.coach.languages ? JSON.parse(userWithCoach.coach.languages) : [],
          certifications: userWithCoach.coach.certifications ? JSON.parse(userWithCoach.coach.certifications) : []
        } : null
      };
    }

    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
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
          location: true,
          phone: true,
          password: true, // Added password for auth
          assessmentCompleted: true // Added assessmentCompleted field
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
import { formatCoachForStorage, formatCoachFromStorage } from '@/lib/utils/coach';

// Helper function to parse array or string field
function parseArrayField(field: string[] | string | undefined | null): string | null {
  if (!field) return null;
  if (Array.isArray(field)) return JSON.stringify(field);
  try {
    // If it's already a JSON string, validate it by parsing and re-stringifying
    JSON.parse(field);
    return field;
  } catch {
    // If it's not a valid JSON string, treat it as a single-item array
    return JSON.stringify([field]);
  }
}

// Helper function to safely parse JSON string to array
function parseJsonToArray(jsonStr: string | null): string[] {
  if (!jsonStr) return [];
  try {
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    // If parsing fails, treat the string as a single item
    return [jsonStr];
  }
}

export async function createCoach(coachData: any) {
  const formattedData = {
    ...coachData,
    expertise: parseArrayField(coachData.expertise),
    specialties: parseArrayField(coachData.specialties),
    industries: parseArrayField(coachData.industries),
    availability: parseArrayField(coachData.availability),
    languages: parseArrayField(coachData.languages),
    certifications: parseArrayField(coachData.certifications)
  };
  
  if (dbType === 'azure') {
    const coach = await cosmosDb.createCoach(formattedData);
    return {
      ...coach,
      expertise: parseJsonToArray(coach.expertise),
      specialties: parseJsonToArray(coach.specialties),
      industries: parseJsonToArray(coach.industries),
      availability: parseJsonToArray(coach.availability),
      languages: parseJsonToArray(coach.languages),
      certifications: parseJsonToArray(coach.certifications)
    };
  } else {
    const coach = await prisma.coach.create({
      data: formattedData,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        expertise: true,
        specialties: true,
        industries: true,
        availability: true,
        languages: true,
        certifications: true,
        profileImage: true,
        hourlyRate: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
        matches: true,
        conversations: true
      }
    });
    return {
      ...coach,
      expertise: parseJsonToArray(coach.expertise),
      specialties: parseJsonToArray(coach.specialties),
      industries: parseJsonToArray(coach.industries),
      availability: parseJsonToArray(coach.availability),
      languages: parseJsonToArray(coach.languages),
      certifications: parseJsonToArray(coach.certifications)
    };
  }
}

export async function getCoaches(querySpec: any = { query: "SELECT * FROM c" }) {
  if (dbType === 'azure') {
    const coaches = await cosmosDb.getCoaches(querySpec);
    return coaches.map(coach => ({
      ...formatFromCosmosToLocal(coach),
      expertise: parseJsonToArray(coach.expertise),
      specialties: parseJsonToArray(coach.specialties),
      industries: parseJsonToArray(coach.industries),
      availability: parseJsonToArray(coach.availability),
      languages: parseJsonToArray(coach.languages),
      certifications: parseJsonToArray(coach.certifications)
    }));
  } else {
    const coaches = await prisma.coach.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        expertise: true,
        specialties: true,
        industries: true,
        availability: true,
        languages: true,
        certifications: true,
        profileImage: true,
        hourlyRate: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
        matches: true,
        conversations: true
      }
    });
    return coaches.map(coach => ({
      ...coach,
      expertise: parseJsonToArray(coach.expertise),
      specialties: parseJsonToArray(coach.specialties),
      industries: parseJsonToArray(coach.industries),
      availability: parseJsonToArray(coach.availability),
      languages: parseJsonToArray(coach.languages),
      certifications: parseJsonToArray(coach.certifications)
    }));
  }
}

export async function getCoachById(coachId: string) {
  if (dbType === 'azure') {
    const coach = await cosmosDb.getCoachById(coachId);
    if (!coach) return null;
    return {
      ...formatFromCosmosToLocal(coach),
      expertise: parseJsonToArray(coach.expertise),
      specialties: parseJsonToArray(coach.specialties),
      industries: parseJsonToArray(coach.industries),
      availability: parseJsonToArray(coach.availability),
      languages: parseJsonToArray(coach.languages),
      certifications: parseJsonToArray(coach.certifications)
    };
  } else {
    const coach = await prisma.coach.findUnique({
      where: { id: coachId },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        expertise: true,
        specialties: true,
        industries: true,
        availability: true,
        languages: true,
        certifications: true,
        profileImage: true,
        hourlyRate: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
        matches: true,
        conversations: true
      }
    });
    if (!coach) return null;
    return {
      ...coach,
      expertise: parseJsonToArray(coach.expertise),
      specialties: parseJsonToArray(coach.specialties),
      industries: parseJsonToArray(coach.industries),
      availability: parseJsonToArray(coach.availability),
      languages: parseJsonToArray(coach.languages),
      certifications: parseJsonToArray(coach.certifications)
    };
  }
}

export async function updateCoach(coachId: string, coachData: any) {
  const formattedData = formatCoachForStorage(coachData);
  
  if (dbType === 'azure') {
    const coach = await cosmosDb.updateCoach(coachId, formattedData);
    return formatCoachFromStorage(coach);
  } else {
    const coach = await prisma.coach.update({
      where: { id: coachId },
      data: formattedData,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        expertise: true,
        profileImage: true,
        hourlyRate: true,
        rating: true,
        availability: true,
        createdAt: true,
        updatedAt: true,
        matches: true,
        conversations: true
      }
    });
    return formatCoachFromStorage(coach);
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

export async function getAssessmentById(assessmentId: string) {
  if (dbType === 'azure') {
    if (typeof cosmosDb.getAssessmentById === 'function') {
      const assessment = await cosmosDb.getAssessmentById(assessmentId);
      return formatFromCosmosToLocal(assessment);
    } else {
      console.warn('getAssessmentById not implemented in cosmosDb module');
      return null;
    }
  } else {
    return prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        user: true,
      },
    });
  }
}

export async function getAssessmentsByUserId(userId: string) {
  try {
    const assessments = await prisma.assessment.findMany({
      where: {
        userId: userId
      },
      select: {
        id: true,
        title: true,
        score: true,
        feedback: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return assessments;
  } catch (error) {
    console.error("Error fetching assessments:", error);
    return [];
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
// Document operations
export async function createDocument(documentData: any) {
  // For Document operations, we'll use Prisma directly for now since Cosmos implementation is not available
  if (dbType === 'azure') {
    console.warn('Using Prisma for document operations in Azure environment');
  }
  
  return prisma.document.create({
    data: documentData,
  });
}

export async function getDocumentsByUserId(userId: string) {
  // For Document operations, we'll use Prisma directly for now since Cosmos implementation is not available
  if (dbType === 'azure') {
    console.warn('Using Prisma for document operations in Azure environment');
  }
  
  return prisma.document.findMany({
    where: { userId },
  });
}

export async function getDocumentById(documentId: string) {
  // For Document operations, we'll use Prisma directly for now since Cosmos implementation is not available
  if (dbType === 'azure') {
    console.warn('Using Prisma for document operations in Azure environment');
  }
  
  return prisma.document.findUnique({
    where: { id: documentId },
  });
}

export async function updateDocument(documentId: string, documentData: any) {
  // For Document operations, we'll use Prisma directly for now since Cosmos implementation is not available
  if (dbType === 'azure') {
    console.warn('Using Prisma for document operations in Azure environment');
  }
  
  return prisma.document.update({
    where: { id: documentId },
    data: documentData,
  });
}

export async function deleteDocument(documentId: string) {
  // For Document operations, we'll use Prisma directly for now since Cosmos implementation is not available
  if (dbType === 'azure') {
    console.warn('Using Prisma for document operations in Azure environment');
  }
  
  return prisma.document.delete({
    where: { id: documentId },
  });
}

// Coach matching operations
export async function createCoachMatch(matchData: {
  coachId: string;
  seekerId: string;
  status: string;
  matchScore?: number;
  matchReason?: string;
}) {
  if (dbType === 'azure') {
    if (typeof cosmosDb.createCoachMatch === 'function') {
      return cosmosDb.createCoachMatch(matchData);
    } else {
      console.warn('createCoachMatch not implemented in cosmosDb module');
      return matchData;
    }
  } else {
    try {
      // First verify that both coach and seeker exist
      const [coachUser, seeker] = await Promise.all([
        prisma.user.findUnique({
          where: { id: matchData.coachId },
          include: { coach: true }
        }),
        prisma.user.findUnique({ where: { id: matchData.seekerId } })
      ]);

      if (!coachUser?.coach) {
        throw new Error('Coach not found');
      }

      if (!seeker || seeker.isCoach) {
        throw new Error('Seeker not found');
      }

      // Create the match with proper relationship data
      return prisma.coachMatch.create({
        data: {
          status: matchData.status,
          matchScore: matchData.matchScore || 0,
          matchReason: matchData.matchReason || '',
          coach: {
            connect: { id: coachUser.coach.id }
          },
          seeker: {
            connect: { id: matchData.seekerId }
          }
        },
        include: {
          coach: true,
          seeker: true,
          conversation: true
        }
      });
    } catch (error) {
      console.error('Error creating coach match:', error);
      throw error;
    }
  }
}

export async function getCoachMatchById(matchId: string) {
  if (dbType === 'azure') {
    if (typeof cosmosDb.getCoachMatchById === 'function') {
      const match = await cosmosDb.getCoachMatchById(matchId);
      return formatFromCosmosToLocal(match);
    } else {
      console.warn('getCoachMatch not implemented in cosmosDb module');
      return null;
    }
  } else {
    return prisma.coachMatch.findUnique({
      where: { id: matchId },
      include: {
        coach: true,
        seeker: true,
        conversation: true
      }
    });
  }
}

export async function getCoachMatchesBySeekerId(seekerId: string) {
  if (dbType === 'azure') {
    if (typeof cosmosDb.getCoachMatchesBySeekerId === 'function') {
      const matches = await cosmosDb.getCoachMatchesBySeekerId(seekerId);
      return matches.map(formatFromCosmosToLocal);
    } else {
      console.warn('getCoachMatchesBySeekerId not implemented in cosmosDb module');
      return [];
    }
  } else {
    return prisma.coachMatch.findMany({
      where: { seekerId },
      include: {
        coach: true,
        seeker: true,
        conversation: true
      }
    });
  }
}

export async function getCoachMatchesByCoachId(coachId: string) {
  if (dbType === 'azure') {
    if (typeof cosmosDb.getCoachMatchesByCoachId === 'function') {
      const matches = await cosmosDb.getCoachMatchesByCoachId(coachId);
      return matches.map(formatFromCosmosToLocal);
    } else {
      console.warn('getCoachMatchesByCoachId not implemented in cosmosDb module');
      return [];
    }
  } else {
    return prisma.coachMatch.findMany({
      where: { coachId },
      include: {
        coach: true,
        seeker: true,
        conversation: true
      }
    });
  }
}

export async function updateCoachMatch(matchId: string, matchData: any) {
  if (dbType === 'azure') {
    if (typeof cosmosDb.updateCoachMatch === 'function') {
      return cosmosDb.updateCoachMatch(matchId, matchData);
    } else {
      console.warn('updateCoachMatch not implemented in cosmosDb module');
      return matchData;
    }
  } else {
    return prisma.coachMatch.update({
      where: { id: matchId },
      data: matchData,
    });
  }
}

// Conversation operations
export async function createConversation(data: {
  coachId: string;
  seekerId: string;
  matchId?: string;
}) {
  if (dbType === 'azure') {
    if (typeof cosmosDb.createConversation === 'function') {
      return cosmosDb.createConversation(data);
    } else {
      console.warn('createConversation not implemented in cosmosDb module');
      return data;
    }
  } else {
    try {
      // First verify that both coach and seeker exist
      const [coachUser, seeker] = await Promise.all([
        prisma.user.findUnique({
          where: { id: data.coachId },
          include: { coach: true }
        }),
        prisma.user.findUnique({ where: { id: data.seekerId } })
      ]);

      if (!coachUser?.coach) {
        throw new Error('Coach not found');
      }

      if (!seeker || seeker.isCoach) {
        throw new Error('Seeker not found');
      }

      // Create the conversation with proper relationship data
      return prisma.conversation.create({
        data: {
          coach: {
            connect: { id: coachUser.coach.id }
          },
          seeker: {
            connect: { id: data.seekerId }
          },
          ...(data.matchId ? {
            match: {
              connect: { id: data.matchId }
            }
          } : {})
        },
        include: {
          coach: {
            select: {
              id: true,
              name: true,
              userId: true
            }
          },
          seeker: {
            select: {
              id: true,
              name: true
            }
          },
          match: true,
          messages: {
            include: {
              sender: {
                select: {
                  id: true,
                  name: true
                }
              },
              receiver: {
                select: {
                  id: true,
                  name: true
                }
              },
              document: true,
              assessment: true
            }
          }
        }
      });
    } catch (error) {
      console.error('Error creating conversation:', error);
      throw error;
    }
  }
}

export async function getConversationsByUserId(userId: string) {
  if (dbType === 'azure') {
    if (typeof cosmosDb.getConversationsByUserId === 'function') {
      const conversations = await cosmosDb.getConversationsByUserId(userId);
      return conversations.map(formatFromCosmosToLocal);
    } else {
      console.warn('getConversationsByUserId not implemented in cosmosDb module');
      return [];
    }
  } else {
    // First get the user to determine if they're a coach
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { coach: true }
    });

    if (!user) {
      return [];
    }

    // If user is a coach, get conversations through the coach relation
    if (user.isCoach && user.coach) {
      return prisma.conversation.findMany({
        where: {
          coachId: user.coach.id
        },
        include: {
          coach: true,
          seeker: true,
          messages: {
            include: {
              sender: true,
              receiver: true,
              document: true,
              assessment: true
            }
          },
          match: true
        }
      });
    } else {
      // If user is a seeker, get conversations directly
      return prisma.conversation.findMany({
        where: {
          seekerId: userId
        },
        include: {
          coach: true,
          seeker: true,
          messages: {
            include: {
              sender: true,
              receiver: true,
              document: true,
              assessment: true
            }
          },
          match: true
        }
      });
    }
  }
}

export async function createMessage(data: {
  conversationId: string;
  senderId: string;
  content: string;
  type?: string;
  documentId?: string;
  assessmentId?: string;
}) {
  try {
    // Get the conversation to determine the receiver
    const conversation = await prisma.conversation.findUnique({
      where: { id: data.conversationId },
      include: {
        coach: {
          select: { userId: true }
        },
        seeker: {
          select: { id: true }
        }
      }
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // Determine the receiver based on the sender
    const receiverId = data.senderId === conversation.coach.userId 
      ? conversation.seeker.id 
      : conversation.coach.userId;

    // Verify encryption key exists
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error("Encryption key not configured");
    }

    // Encrypt the message content
    const encryptedContent = await encryptMessage(data.content, encryptionKey);

    // Create the message with the receiver
    const message = await prisma.message.create({
      data: {
        conversation: {
          connect: { id: data.conversationId }
        },
        sender: {
          connect: { id: data.senderId }
        },
        receiver: {
          connect: { id: receiverId }
        },
        content: encryptedContent,
        type: data.type || "text",
        ...(data.documentId && {
          document: {
            connect: { id: data.documentId }
          }
        }),
        ...(data.assessmentId && {
          assessment: {
            connect: { id: data.assessmentId }
          }
        })
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true
          }
        },
        document: data.documentId ? {
          select: {
            id: true,
            title: true,
            fileName: true
          }
        } : false,
        assessment: data.assessmentId ? {
          select: {
            id: true,
            title: true,
            sections: true
          }
        } : false
      }
    });

    // Decrypt the content before returning
    const decryptedMessage = {
      ...message,
      content: await decryptMessage(message.content, encryptionKey)
    };

    return decryptedMessage;
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
}

export async function getMessagesByConversationId(conversationId: string) {
  try {
    // Verify encryption key exists
    const encryptionKey = process.env.ENCRYPTION_KEY;
    if (!encryptionKey) {
      throw new Error("Encryption key not configured");
    }

    const messages = await prisma.message.findMany({
      where: {
        conversationId: conversationId
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true
          }
        },
        document: {
          select: {
            id: true,
            title: true,
            fileName: true
          }
        },
        assessment: {
          select: {
            id: true,
            title: true,
            sections: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Decrypt all messages
    const decryptedMessages = await Promise.all(
      messages.map(async (message) => {
        try {
          return {
            ...message,
            content: await decryptMessage(message.content, encryptionKey)
          };
        } catch (error) {
          console.error(`Error decrypting message ${message.id}:`, error);
          return {
            ...message,
            content: "[Error: Message could not be decrypted]"
          };
        }
      })
    );

    return decryptedMessages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

// Seeker operations
export async function getSeekers(querySpec: any = { query: "SELECT * FROM c WHERE c.type = 'seeker'" }) {
  if (dbType === 'azure') {
    try {
      const seekerQuerySpec = {
        query: "SELECT * FROM c WHERE c.isCoach = false"
      };
      const users = await cosmosDb.queryUsers(seekerQuerySpec);
      return users.map((user: any) => formatFromCosmosToLocal(user));
    } catch (error) {
      console.error("Error getting seekers:", error);
      return [];
    }
  } else {
    return prisma.user.findMany({
      where: {
        isCoach: false
      },
      select: {
        id: true,
        email: true,
        name: true,
        firstName: true,
        lastName: true,
        role: true,
        bio: true,
        isCoach: true,
        experience: true,
        createdAt: true,
        updatedAt: true,
        location: true,
        phone: true,
        assessments: true,
        seekerMatches: true,
        seekerConversations: true
      }
    });
  }
}

export async function getConversationByMatchId(matchId: string) {
  try {
    const match = await prisma.coachMatch.findUnique({
      where: { id: matchId },
      include: {
        conversation: true
      }
    });
    return match?.conversation;
  } catch (error) {
    console.error('Error getting conversation by match ID:', error);
    return null;
  }
}

export async function getConversationById(conversationId: string) {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId
      },
      include: {
        coach: {
          select: {
            id: true,
            name: true,
            userId: true
          }
        },
        seeker: {
          select: {
            id: true,
            name: true
          }
        },
        match: {
          select: {
            id: true,
            status: true,
            matchScore: true,
            matchReason: true
          }
        },
        messages: {
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true
              }
            },
            receiver: {
              select: {
                id: true,
                name: true,
                firstName: true,
                lastName: true
              }
            },
            document: {
              select: {
                id: true,
                title: true,
                fileName: true
              }
            },
            assessment: {
              select: {
                id: true,
                title: true,
                sections: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    });

    return conversation;
  } catch (error) {
    console.error("Error fetching conversation:", error);
    return null;
  }
}

// Export the prisma client for direct access if needed
export { prisma };