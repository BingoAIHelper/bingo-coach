import { CosmosClient } from "@azure/cosmos";

// Initialize Cosmos client
const endpoint = process.env.AZURE_COSMOS_ENDPOINT || "";
const key = process.env.AZURE_COSMOS_KEY || "";
const databaseId = process.env.AZURE_COSMOS_DATABASE || "bingo-database";

// Container IDs
const USERS_CONTAINER = "users";
const JOBS_CONTAINER = "jobs";
const COACHES_CONTAINER = "coaches";
const RESUMES_CONTAINER = "resumes";
const ASSESSMENTS_CONTAINER = "assessments";
const APPLICATIONS_CONTAINER = "applications";
const COACH_MATCHES_CONTAINER = "coach-matches";
const CONVERSATIONS_CONTAINER = "conversations";
const MESSAGES_CONTAINER = "messages";

// Initialize the Cosmos client
const client = new CosmosClient({ endpoint, key });

// Get database
const database = client.database(databaseId);

// Get containers
const usersContainer = database.container(USERS_CONTAINER);
const jobsContainer = database.container(JOBS_CONTAINER);
const coachesContainer = database.container(COACHES_CONTAINER);
const resumesContainer = database.container(RESUMES_CONTAINER);
const assessmentsContainer = database.container(ASSESSMENTS_CONTAINER);
const applicationsContainer = database.container(APPLICATIONS_CONTAINER);
const coachMatchesContainer = database.container(COACH_MATCHES_CONTAINER);
const conversationsContainer = database.container(CONVERSATIONS_CONTAINER);
const messagesContainer = database.container(MESSAGES_CONTAINER);

// User operations
export async function createUser(userData: any) {
  try {
    const { resource: createdItem } = await usersContainer.items.create(userData);
    return createdItem;
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

export async function getUserById(userId: string) {
  try {
    const { resource: user } = await usersContainer.item(userId, userId).read();
    return user;
  } catch (error) {
    console.error(`Error getting user with ID ${userId}:`, error);
    return null;
  }
}

export async function getUserByEmail(email: string) {
  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.email = @email",
      parameters: [
        {
          name: "@email",
          value: email
        }
      ]
    };
    
    const { resources: users } = await usersContainer.items.query(querySpec).fetchAll();
    return users.length > 0 ? users[0] : null;
  } catch (error) {
    console.error(`Error getting user with email ${email}:`, error);
    return null;
  }
}

export async function updateUser(userId: string, userData: any) {
  try {
    const { resource: updatedItem } = await usersContainer.item(userId, userId).replace(userData);
    return updatedItem;
  } catch (error) {
    console.error(`Error updating user with ID ${userId}:`, error);
    throw error;
  }
}

// Job operations
export async function createJob(jobData: any) {
  try {
    const { resource: createdItem } = await jobsContainer.items.create(jobData);
    return createdItem;
  } catch (error) {
    console.error("Error creating job:", error);
    throw error;
  }
}

export async function getJobs(querySpec: any = { query: "SELECT * FROM c" }) {
  try {
    const { resources: jobs } = await jobsContainer.items.query(querySpec).fetchAll();
    return jobs;
  } catch (error) {
    console.error("Error getting jobs:", error);
    return [];
  }
}

export async function getJobById(jobId: string) {
  try {
    const { resource: job } = await jobsContainer.item(jobId, jobId).read();
    return job;
  } catch (error) {
    console.error(`Error getting job with ID ${jobId}:`, error);
    return null;
  }
}

// Coach operations
export async function createCoach(coachData: any) {
  try {
    const { resource: createdItem } = await coachesContainer.items.create(coachData);
    return createdItem;
  } catch (error) {
    console.error("Error creating coach:", error);
    throw error;
  }
}

export async function getCoaches(querySpec: any = { query: "SELECT * FROM c" }) {
  try {
    const { resources: coaches } = await coachesContainer.items.query(querySpec).fetchAll();
    return coaches;
  } catch (error) {
    console.error("Error getting coaches:", error);
    return [];
  }
}

export async function getCoachById(coachId: string) {
  try {
    const { resource: coach } = await coachesContainer.item(coachId, coachId).read();
    return coach;
  } catch (error) {
    console.error(`Error getting coach with ID ${coachId}:`, error);
    return null;
  }
}

// Resume operations
export async function createResume(resumeData: any) {
  try {
    const { resource: createdItem } = await resumesContainer.items.create(resumeData);
    return createdItem;
  } catch (error) {
    console.error("Error creating resume:", error);
    throw error;
  }
}

export async function getResumeByUserId(userId: string) {
  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.userId = @userId",
      parameters: [
        {
          name: "@userId",
          value: userId
        }
      ]
    };
    
    const { resources: resumes } = await resumesContainer.items.query(querySpec).fetchAll();
    return resumes.length > 0 ? resumes[0] : null;
  } catch (error) {
    console.error(`Error getting resume for user ${userId}:`, error);
    return null;
  }
}

// Assessment operations
export async function createAssessment(assessmentData: any) {
  try {
    const { resource: createdItem } = await assessmentsContainer.items.create(assessmentData);
    return createdItem;
  } catch (error) {
    console.error("Error creating assessment:", error);
    throw error;
  }
}

export async function getAssessmentByUserId(userId: string) {
  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.userId = @userId",
      parameters: [
        {
          name: "@userId",
          value: userId
        }
      ]
    };
    
    const { resources: assessments } = await assessmentsContainer.items.query(querySpec).fetchAll();
    return assessments.length > 0 ? assessments[0] : null;
  } catch (error) {
    console.error(`Error getting assessment for user ${userId}:`, error);
    return null;
  }
}

export async function getAssessmentById(assessmentId: string) {
  try {
    const { resource: assessment } = await assessmentsContainer.item(assessmentId, assessmentId).read();
    return assessment;
  } catch (error) {
    console.error(`Error getting assessment with ID ${assessmentId}:`, error);
    return null;
  }
}

// Application operations
export async function createApplication(applicationData: any) {
  try {
    const { resource: createdItem } = await applicationsContainer.items.create(applicationData);
    return createdItem;
  } catch (error) {
    console.error("Error creating application:", error);
    throw error;
  }
}

export async function getApplicationsByUserId(userId: string) {
  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.userId = @userId",
      parameters: [
        {
          name: "@userId",
          value: userId
        }
      ]
    };
    
    const { resources: applications } = await applicationsContainer.items.query(querySpec).fetchAll();
    return applications;
  } catch (error) {
    console.error(`Error getting applications for user ${userId}:`, error);
    return [];
  }
}

export async function getApplicationById(applicationId: string) {
  try {
    const { resource: application } = await applicationsContainer.item(applicationId, applicationId).read();
    return application;
  } catch (error) {
    console.error(`Error getting application with ID ${applicationId}:`, error);
    return null;
  }
}

export async function updateApplication(applicationId: string, applicationData: any) {
  try {
    const { resource: updatedItem } = await applicationsContainer.item(applicationId, applicationId).replace(applicationData);
    return updatedItem;
  } catch (error) {
    console.error(`Error updating application with ID ${applicationId}:`, error);
    throw error;
  }
}

export async function updateJob(id: string, jobData: any) {
  const { resource } = await jobsContainer.item(id, id).replace(jobData);
  return resource;
}

export async function deleteJob(id: string) {
  await jobsContainer.item(id, id).delete();
  return { id };
}

export async function getResumesByUserId(userId: string) {
  const querySpec = {
    query: "SELECT * FROM c WHERE c.userId = @userId",
    parameters: [{ name: "@userId", value: userId }],
  };

  const { resources } = await resumesContainer.items.query(querySpec).fetchAll();
  return resources;
}

export async function updateResume(id: string, resumeData: any) {
  const { resource } = await resumesContainer.item(id, id).replace(resumeData);
  return resource;
}

export async function deleteResume(id: string) {
  await resumesContainer.item(id, id).delete();
  return { id };
}

// Coach update operation
export async function updateCoach(id: string, coachData: any) {
  try {
    const { resource: updatedItem } = await coachesContainer.item(id, id).replace({
      ...coachData,
      id,
      updatedAt: new Date().toISOString()
    });
    return updatedItem;
  } catch (error) {
    console.error(`Error updating coach with ID ${id}:`, error);
    throw error;
  }
}

// Conversation operations
export async function getConversationsByUserId(userId: string) {
  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.seekerId = @userId OR c.coachId = @userId",
      parameters: [{ name: "@userId", value: userId }]
    };
    
    const { resources: conversations } = await conversationsContainer.items.query(querySpec).fetchAll();
    
    // Get messages for each conversation
    const conversationsWithMessages = await Promise.all(
      conversations.map(async (conversation) => {
        const messages = await getMessagesByConversationId(conversation.id);
        return {
          ...conversation,
          messages
        };
      })
    );
    
    return conversationsWithMessages;
  } catch (error) {
    console.error(`Error getting conversations for user ${userId}:`, error);
    return [];
  }
}

// Coach matching operations
export async function createCoachMatch(matchData: any) {
  try {
    const { resource: createdItem } = await coachMatchesContainer.items.create({
      ...matchData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return createdItem;
  } catch (error) {
    console.error("Error creating coach match:", error);
    throw error;
  }
}

export async function getCoachMatchById(matchId: string) {
  try {
    const { resource: match } = await coachMatchesContainer.item(matchId, matchId).read();
    if (!match) return null;

    const [coach, conversation] = await Promise.all([
      getCoachById(match.coachId),
      getConversationByMatchId(matchId)
    ]);

    return { ...match, coach, conversation };
  } catch (error) {
    console.error(`Error getting coach match with ID ${matchId}:`, error);
    return null;
  }
}

export async function getCoachMatchesBySeekerId(seekerId: string) {
  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.seekerId = @seekerId",
      parameters: [{ name: "@seekerId", value: seekerId }]
    };
    
    const { resources: matches } = await coachMatchesContainer.items.query(querySpec).fetchAll();
    
    const matchesWithDetails = await Promise.all(
      matches.map(async (match) => {
        const [coach, conversation] = await Promise.all([
          getCoachById(match.coachId),
          getConversationByMatchId(match.id)
        ]);
        return { ...match, coach, conversation };
      })
    );
    
    return matchesWithDetails;
  } catch (error) {
    console.error(`Error getting coach matches for seeker ${seekerId}:`, error);
    return [];
  }
}

export async function getCoachMatchesByCoachId(coachId: string) {
  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.coachId = @coachId",
      parameters: [{ name: "@coachId", value: coachId }]
    };
    
    const { resources: matches } = await coachMatchesContainer.items.query(querySpec).fetchAll();
    
    const matchesWithDetails = await Promise.all(
      matches.map(async (match) => {
        const [seeker, conversation] = await Promise.all([
          getUserById(match.seekerId),
          getConversationByMatchId(match.id)
        ]);
        return { ...match, seeker, conversation };
      })
    );
    
    return matchesWithDetails;
  } catch (error) {
    console.error(`Error getting coach matches for coach ${coachId}:`, error);
    return [];
  }
}

export async function updateCoachMatch(matchId: string, matchData: any) {
  try {
    const { resource: updatedItem } = await coachMatchesContainer.item(matchId, matchId).replace({
      ...matchData,
      id: matchId,
      updatedAt: new Date().toISOString()
    });
    return updatedItem;
  } catch (error) {
    console.error(`Error updating coach match with ID ${matchId}:`, error);
    throw error;
  }
}

// Conversation operations
export async function createConversation(conversationData: any) {
  try {
    const { resource: createdItem } = await conversationsContainer.items.create({
      ...conversationData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return createdItem;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}

export async function getConversationByMatchId(matchId: string) {
  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.matchId = @matchId",
      parameters: [{ name: "@matchId", value: matchId }]
    };
    
    const { resources: conversations } = await conversationsContainer.items.query(querySpec).fetchAll();
    if (conversations.length === 0) return null;

    const conversation = conversations[0];
    const messages = await getMessagesByConversationId(conversation.id);
    
    return { ...conversation, messages };
  } catch (error) {
    console.error(`Error getting conversation for match ${matchId}:`, error);
    return null;
  }
}

// Message operations
export async function createMessage(messageData: any) {
  try {
    const { resource: createdItem } = await messagesContainer.items.create({
      ...messageData,
      createdAt: new Date().toISOString()
    });
    return createdItem;
  } catch (error) {
    console.error("Error creating message:", error);
    throw error;
  }
}

export async function getMessagesByConversationId(conversationId: string) {
  try {
    const querySpec = {
      query: "SELECT * FROM c WHERE c.conversationId = @conversationId ORDER BY c.createdAt ASC",
      parameters: [{ name: "@conversationId", value: conversationId }]
    };
    
    const { resources: messages } = await messagesContainer.items.query(querySpec).fetchAll();
    return messages;
  } catch (error) {
    console.error(`Error getting messages for conversation ${conversationId}:`, error);
    return [];
  }
}