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
export async function generateChatCompletion(
  messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
  maxTokens: number = 500,
  temperature: number = 0.7
): Promise<string> {
  try {
    const response = await client.chat.completions.create({
      model: deploymentName,
      messages,
      max_tokens: maxTokens,
      temperature,
    });

    return response.choices[0]?.message?.content || "";
  } catch (error) {
    console.error("Error generating chat completion:", error);
    throw error;
  }
}

/**
 * Analyze a resume using Azure OpenAI
 * @param resumeText The text of the resume to analyze
 * @returns An analysis of the resume
 */
export async function analyzeResume(resumeText: string): Promise<any> {
  try {
    const systemPrompt = `
      You are an expert resume analyzer. Analyze the following resume and extract:
      1. Skills
      2. Experience (years and domains)
      3. Education
      4. Strengths
      5. Areas for improvement
      6. Suggested job roles
      
      Format your response as a JSON object with these keys: skills, experience, education, strengths, areasForImprovement, suggestedRoles.
    `;

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: resumeText },
    ];

    const response = await generateChatCompletion(messages, 1000, 0.3);
    
    // Parse the JSON response
    try {
      return JSON.parse(response);
    } catch (parseError) {
      console.error("Error parsing resume analysis:", parseError);
      return {
        error: "Failed to parse resume analysis",
        rawResponse: response,
      };
    }
  } catch (error) {
    console.error("Error analyzing resume:", error);
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