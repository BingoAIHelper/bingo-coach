import { AzureOpenAI } from "openai";
import { AzureKeyCredential } from "@azure/core-auth";

// Initialize OpenAI client
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "";
const apiKey = process.env.AZURE_OPENAI_API_KEY || "";
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "";
const apiVersion = "2024-02-01"; // Use the latest stable API version

// Initialize the OpenAI client
const client = new AzureOpenAI({
  apiKey,
  endpoint,
  apiVersion,
  deployment: deploymentName,
});

/**
 * Generate text using Azure OpenAI
 * @param prompt The prompt to generate text from
 * @param maxTokens The maximum number of tokens to generate
 * @param temperature The temperature to use for generation (0-1)
 * @returns The generated text
 */
export async function generateText(
  prompt: string,
  maxTokens: number = 500,
  temperature: number = 0.7
): Promise<string> {
  try {
    const response = await client.completions.create({
      model: deploymentName,
      prompt,
      max_tokens: maxTokens,
      temperature,
    });

    return response.choices[0]?.text || "";
  } catch (error) {
    console.error("Error generating text:", error);
    throw error;
  }
}

/**
 * Generate a chat completion using Azure OpenAI
 * @param messages The messages to generate a completion from
 * @param maxTokens The maximum number of tokens to generate
 * @param temperature The temperature to use for generation (0-1)
 * @returns The generated message
 */
/**
 * Generate a chat completion using Azure OpenAI with retry logic
 * @param messages The messages to generate a completion from
 * @param maxTokens The maximum number of tokens to generate
 * @param temperature The temperature to use for generation (0-1)
 * @returns The generated message
 */
export async function generateChatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  maxTokens: number = 500,
  temperature: number = 0.7
): Promise<string> {
  const maxRetries = 4; // Increased from 3 to 4 retries
  let retries = 0;
  let lastError: any = null;

  // Estimate total input tokens for logging
  const estimatedInputTokens = messages.reduce((total, msg) => {
    return total + estimateTokenCount(msg.content);
  }, 0);
  
  console.log(`Starting chat completion: ~${estimatedInputTokens} input tokens, ${maxTokens} max output tokens`);

  while (retries < maxRetries) {
    try {
      // Add delay based on retry count (exponential backoff)
      if (retries > 0) {
        // For rate limit errors, use the Retry-After header or default to 60s
        const isRateLimit = lastError && (lastError.status === 429 ||
          (lastError.error && lastError.error.code === '429'));
          
        let delay;
        if (isRateLimit) {
          // Get Retry-After from headers or default to 60s for S0 tier rate limits
          const retryAfter = lastError.headers?.['retry-after'] || 60;
          delay = retryAfter * 1000;
          console.log(`Rate limit hit. Waiting ${retryAfter}s before retry...`);
        } else {
          // Regular exponential backoff for other errors
          const baseDelay = 2000;
          delay = Math.min(baseDelay * Math.pow(2, retries - 1), 30000);
        }
        
        console.log(`Retrying OpenAI request after ${delay/1000}s delay (attempt ${retries + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      // Progressively reduce token usage on retries
      const tokenReductionFactor = [1, 0.7, 0.5, 0.3][retries];
      const adjustedMaxTokens = Math.floor(maxTokens * tokenReductionFactor);
      
      // On later retries, simplify the prompt to reduce token usage
      let adjustedMessages = messages;
      if (retries >= 2 && messages.length > 1) {
        // Keep system message but simplify it if it's too long
        const systemMsg = {
          role: messages[0].role,
          content: messages[0].content.length > 500
            ? messages[0].content.substring(0, 500) + "..."
            : messages[0].content
        };
        
        // Keep user message but truncate if needed
        const userMsg = {
          role: messages[messages.length - 1].role,
          content: messages[messages.length - 1].content.length > 1000
            ? messages[messages.length - 1].content.substring(0, 1000) + "..."
            : messages[messages.length - 1].content
        };
        
        adjustedMessages = [systemMsg, userMsg];
      }
      
      console.log(`Attempt ${retries+1}: Using ${adjustedMaxTokens} max tokens`);
      
      const response = await client.chat.completions.create({
        model: deploymentName,
        messages: adjustedMessages,
        max_tokens: adjustedMaxTokens,
        temperature,
      });

      return response.choices[0]?.message?.content || "";
    } catch (error: any) {
      lastError = error;
      console.error(`Error generating chat completion (attempt ${retries + 1}/${maxRetries}):`, error);
      
      // Retry on rate limit errors and also on certain other errors
      if (error.status === 429 || (error.error && error.error.code === '429') ||
          error.message.includes("Connection error") ||
          error.message.includes("timeout")) {
        retries++;
        // Continue to the next iteration to retry
      } else {
        // For other errors, don't retry
        break;
      }
    }
  }

  // After max retries or on non-retryable error
  if (lastError) {
    if (lastError.status === 429 || (lastError.error && lastError.error.code === '429')) {
      throw new Error("AI service rate limit reached. Please try again in a minute.");
    } else {
      throw lastError;
    }
  }
  
  throw new Error("Failed to generate text after multiple attempts");
}

/**
 * Analyze a resume using Azure OpenAI
 * @param resumeText The text of the resume to analyze
 * @returns An analysis of the resume
 */
/**
 * Estimates token count in a text string
 * @param text The text to estimate tokens for
 * @returns Approximate token count
 */
function estimateTokenCount(text: string): number {
  // A very rough estimation: 1 token ≈ 4 characters for English text
  return Math.ceil(text.length / 4);
}

/**
 * Analyze a resume using Azure OpenAI with token optimization
 * @param resumeText The text of the resume to analyze
 * @returns An analysis of the resume
 */
export async function analyzeResume(resumeText: string): Promise<any> {
  try {
    // Token efficiency: Truncate text more aggressively for S0 tier
    const maxChars = 8000; // ~2000 tokens for S0 tier
    const truncatedText = resumeText.length > maxChars
      ? resumeText.substring(0, maxChars) + "... [truncated]"
      : resumeText;
    
    // Estimate token usage for logging and debugging
    const estimatedTokens = estimateTokenCount(truncatedText);
    console.log(`Analyzing resume: ${resumeText.length} chars → ${truncatedText.length} chars (est. ${estimatedTokens} tokens)`);
    
    // Ultra-compact prompt to minimize token usage
    const systemPrompt = `Analyze resume. Extract JSON with:
- skills: [string] (max 8 skills)
- experience: {years: number, domains: [string]}
- strengths: [string] (max 3)
- areasForImprovement: [string] (max 3)
- suggestedRoles: [string] (max 3)
- improvementSuggestions: {section: [string]} (max 2 sections)
Keep all responses very concise.`;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: truncatedText },
    ];

    // Reduce max tokens to avoid rate limit issues
    // For S0 tier (1000 TPM), this allows more successful calls
    const response = await generateChatCompletion(messages, 600, 0.3); // Reduced max tokens for S0 tier
    
    // Parse the JSON response
    try {
      // Clean up markdown code block syntax if present
      const cleanResponse = response.trim().replace(/^```json\n|\n```$/g, '');
      return JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error("Error parsing resume analysis:", parseError);
      return {
        error: "Failed to parse resume analysis",
        rawResponse: response,
      };
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
    
    // Enhanced fallback that provides useful information even without OpenAI
    if (error instanceof Error && (
        error.message.includes("rate limit") ||
        error.message.includes("404") ||
        error.message.includes("Connection error")
    )) {
      console.log("Using smart fallback resume analysis");
      
      // Extract basic information from the resume text for fallback
      const skills = extractSkillsFromText(resumeText);
      const hasEducation = resumeText.toLowerCase().includes("education") ||
                          resumeText.toLowerCase().includes("university") ||
                          resumeText.toLowerCase().includes("degree");
      
      return {
        note: "AI service unavailable. Using extracted insights:",
        skills: skills.length > 0 ? skills : ["Technical skills", "Communication skills"],
        strengths: [
          "Resume includes professional details",
          hasEducation ? "Education credentials included" : "Professional background included"
        ],
        areasForImprovement: [
          "Quantify achievements with metrics",
          "Ensure format is ATS-friendly",
          "Highlight most relevant skills for target roles"
        ],
        suggestedRoles: extractPossibleRoles(resumeText),
        improvementSuggestions: {
          "Format": [
            "Use bullet points for better readability",
            "Ensure consistent spacing and formatting"
          ],
          "Content": [
            "Include keywords from relevant job descriptions",
            "Focus on achievements rather than responsibilities"
          ]
        }
      };
    }
    
    throw error;
  }
}

/**
 * Extract potential skills from resume text
 * @param text Resume text
 * @returns Array of potential skills
 */
function extractSkillsFromText(text: string): string[] {
  const commonSkills = [
    "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Ruby", "Go", "SQL",
    "React", "Angular", "Vue", "Node.js", "Express", "Django", "Flask", "Spring",
    "AWS", "Azure", "GCP", "Docker", "Kubernetes", "CI/CD", "Git", "GitHub",
    "Project Management", "Agile", "Scrum", "Leadership", "Communication"
  ];
  
  const foundSkills = commonSkills.filter(skill =>
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  return foundSkills.length > 0 ? foundSkills.slice(0, 8) : [];
}

/**
 * Extract possible roles based on resume content
 * @param text Resume text
 * @returns Array of potential roles
 */
function extractPossibleRoles(text: string): string[] {
  const lowerText = text.toLowerCase();
  const roles = [];
  
  if (lowerText.includes("develop") || lowerText.includes("programming") ||
      lowerText.includes("javascript") || lowerText.includes("python")) {
    roles.push("Software Developer");
  }
  
  if (lowerText.includes("data") || lowerText.includes("analysis") ||
      lowerText.includes("sql") || lowerText.includes("statistics")) {
    roles.push("Data Analyst");
  }
  
  if (lowerText.includes("manage") || lowerText.includes("project") ||
      lowerText.includes("team") || lowerText.includes("lead")) {
    roles.push("Project Manager");
  }
  
  if (lowerText.includes("design") || lowerText.includes("user experience") ||
      lowerText.includes("interface") || lowerText.includes("ui/ux")) {
    roles.push("UX/UI Designer");
  }
  
  return roles.length > 0 ? roles : ["Roles based on your skills and experience"];
}

/**
 * Analyze a document and provide improvement suggestions
 * @param documentText The text content of the document
 * @param documentType The type of document (resume, cover letter, etc.)
 * @returns An analysis with improvement suggestions
 */
export async function analyzeDocument(documentText: string, documentType: string = "general"): Promise<any> {
  try {
    // Limit the text length to avoid token limit issues
    const maxChars = 15000; // Roughly ~3000-4000 tokens
    const truncatedText = documentText.length > maxChars
      ? documentText.substring(0, maxChars) + "... [truncated for analysis]"
      : documentText;
    
    console.log(`Analyzing document of type: ${documentType}, length: ${documentText.length} chars (${truncatedText.length} after truncation)`);
    
    // Determine the appropriate system prompt based on document type
    let systemPrompt = "";
    
    if (documentType.toLowerCase().includes("resume")) {
      // Use the resume-specific analyzer with truncated text
      return analyzeResume(truncatedText);
    } else if (documentType.toLowerCase().includes("cover")) {
      systemPrompt = `
        You are an expert cover letter analyzer. Analyze the following cover letter and provide:
        1. Overall impression (brief)
        2. Three main strengths (brief bullet points)
        3. Three areas for improvement (brief bullet points)
        4. Three specific suggestions to make it more compelling
        
        Format your response as a JSON object with these keys:
        - overallImpression (string, max 100 words)
        - strengths (array of strings, each max 30 words)
        - weaknesses (array of strings, each max 30 words)
        - improvementSuggestions (object with up to 3 keys)
      `;
    } else {
      // General document analysis - simplified to reduce token usage
      systemPrompt = `
        You are an expert document analyzer. Analyze the following document and provide:
        1. Document type detection
        2. Three key takeaways
        3. Three improvement suggestions
        
        Format your response as a JSON object with these keys:
        - detectedType (string)
        - keyTakeaways (array of strings)
        - improvementSuggestions (array of strings)
      `;
    }

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: truncatedText },
    ];

    // Use lower token limit for non-resume documents to avoid rate limits
    const response = await generateChatCompletion(messages, 1000, 0.3);
    
    // Parse the JSON response
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error("Error parsing document analysis:", parseError);
      return {
        error: "Failed to parse document analysis",
        rawResponse: response,
      };
    }
  } catch (error) {
    console.error("Error analyzing document:", error);
    
    // Provide a simplified fallback response when hitting rate limits
    if (error instanceof Error && error.message.includes("rate limit")) {
      console.log("Using simplified analysis due to rate limit");
      return {
        note: "AI service is currently busy. Here's a simplified analysis:",
        detectedType: documentType,
        keyTakeaways: [
          "Document analysis is limited due to high demand.",
          "Try again in a few minutes for detailed analysis."
        ],
        improvementSuggestions: [
          "Consider checking for clear structure and formatting",
          "Ensure key information is prominently displayed",
          "Review for spelling and grammar issues"
        ]
      };
    }
    
    throw error;
  }
}

/**
 * Generate job recommendations based on user profile and preferences
 * @param userProfile The user's profile
 * @param preferences The user's job preferences
 * @returns Job recommendations
 */
export async function generateJobRecommendations(
  userProfile: any,
  preferences: any
): Promise<string> {
  try {
    const prompt = `
      Based on the following user profile and preferences, suggest job roles that would be a good fit.
      
      User Profile:
      ${JSON.stringify(userProfile, null, 2)}
      
      Job Preferences:
      ${JSON.stringify(preferences, null, 2)}
      
      Provide a list of recommended job roles with brief explanations of why they would be a good fit.
    `;

    return await generateText(prompt, 800, 0.5);
  } catch (error) {
    console.error("Error generating job recommendations:", error);
    throw error;
  }
}

/**
 * Generate interview questions based on a job description
 * @param jobDescription The job description
 * @param userSkills The user's skills
 * @returns Interview questions
 */
export async function generateInterviewQuestions(
  jobDescription: string,
  userSkills: string[]
): Promise<string[]> {
  try {
    const prompt = `
      Generate 5 interview questions for the following job description, tailored to assess the candidate's skills.
      
      Job Description:
      ${jobDescription}
      
      Candidate Skills:
      ${userSkills.join(", ")}
      
      Format your response as a JSON array of strings, each containing one interview question.
    `;

    const response = await generateText(prompt, 800, 0.7);
    
    // Parse the JSON response
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error("Error parsing interview questions:", parseError);
      return ["Failed to generate interview questions. Please try again."];
    }
  } catch (error) {
    console.error("Error generating interview questions:", error);
    throw error;
  }
}

/**
 * Generate coach matches for a seeker based on their profile and assessments
 * @param seekerProfile The seeker's profile and assessment data
 * @param coaches Array of potential coach profiles
 * @returns Ranked coach matches with scores and explanations
 */
export async function generateCoachMatches(
  seekerProfile: {
    id: string;
    firstName: string;
    lastName: string;
    bio?: string;
    assessments: Array<{
      title: string;
      score?: number;
      feedback?: string;
    }>;
  },
  coaches: Array<{
    id: string;
    name: string;
    expertise: string[];
    specialties: string[];
    bio?: string;
    yearsExperience?: number;
    industries?: string[];
    coachingStyle?: string;
  }>
): Promise<Array<{
  coachId: string;
  matchScore: number;
  matchReason: string;
}>> {
  try {
    const prompt = `
      Analyze the seeker's profile and assessments to find the best matching coaches.
      Consider expertise alignment, coaching style, and industry experience.
      
      Seeker Profile:
      ${JSON.stringify(seekerProfile, null, 2)}
      
      Available Coaches:
      ${JSON.stringify(coaches, null, 2)}
      
      For each coach, provide:
      1. A match score (0-100)
      2. A brief explanation of why they would be a good match
      
      Format response as JSON array with objects containing:
      - coachId: string
      - matchScore: number (0-100)
      - matchReason: string (max 200 chars)
      
      Sort by matchScore descending.
      Only include coaches with matchScore > 50.
    `;

    const response = await generateChatCompletion([
      { role: "system", content: "You are an expert career coach matching assistant." },
      { role: "user", content: prompt }
    ], 1000, 0.3);

    try {
      const matches = JSON.parse(response);
      return Array.isArray(matches) ? matches : [];
    } catch (parseError) {
      console.error("Error parsing coach matches:", parseError);
      return [];
    }
  } catch (error) {
    console.error("Error generating coach matches:", error);
    // Return empty array instead of throwing to handle gracefully
    return [];
  }
}
  try {
    const prompt = `
      Generate 5 interview questions for the following job description, tailored to assess the candidate's skills.
      
      Job Description:
      ${jobDescription}
      
      Candidate Skills:
      ${userSkills.join(", ")}
      
      Format your response as a JSON array of strings, each containing one interview question.
    `;

    const response = await generateText(prompt, 800, 0.7);
    
    // Parse the JSON response
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error("Error parsing interview questions:", parseError);
      return ["Failed to generate interview questions. Please try again."];
    }
  } catch (error) {
    console.error("Error generating interview questions:", error);
    throw error;
  }
} 