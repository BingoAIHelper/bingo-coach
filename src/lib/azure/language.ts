import { 
  TextAnalysisClient, 
  AzureKeyCredential,
  KeyPhraseExtractionResult,
  SentimentAnalysisResult,
  TextAnalysisErrorResult,
} from "@azure/ai-language-text";

const endpoint = process.env.AZURE_LANGUAGE_ENDPOINT || "";
const apiKey = process.env.AZURE_LANGUAGE_KEY || "";

if (!endpoint || !apiKey) {
  console.error("Azure Language Service credentials not configured properly");
}

const client = new TextAnalysisClient(endpoint, new AzureKeyCredential(apiKey));

interface ContentAnalysis {
  skills: string[];
  experience: string[];
  education: string[];
  sentiment: {
    overall: string;
    scores: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };
}

interface JobRecommendation {
  title: string;
  matchScore: number;
  reason: string;
}

export interface ResumeAnalysis {
  skills: string[];
  experience: string[];
  education: string[];
  strengths: string[];
  areasForImprovement: string[];
  suggestedRoles: JobRecommendation[];
}

/**
 * Extract skills from text using common patterns
 */
function extractSkills(text: string): string[] {
  const commonSkills = [
    "javascript", "typescript", "python", "java", "c#", "react", "angular", "vue",
    "node.js", "express", "django", "flask", "sql", "mongodb", "aws", "azure",
    "docker", "kubernetes", "ci/cd", "git", "agile", "scrum", "leadership",
    "project management", "communication", "problem solving", "teamwork",
  ];

  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
}

function isErrorResult(result: KeyPhraseExtractionResult | SentimentAnalysisResult | TextAnalysisErrorResult): result is TextAnalysisErrorResult {
  return 'error' in result;
}

/**
 * Analyze text content to extract key information
 */
export async function analyzeContent(text: string): Promise<ContentAnalysis> {
  try {
    // Extract key phrases
    const keyPhraseResults = await client.analyze("KeyPhraseExtraction", [text]);
    const keyPhraseResult = keyPhraseResults[0];
    
    let keyPhrases: string[] = [];
    if (!isErrorResult(keyPhraseResult)) {
      keyPhrases = (keyPhraseResult as any).keyPhrases || [];
    }

    // Extract skills
    const skills = extractSkills(text);

    // Extract experience and education from key phrases
    const experienceKeywords = keyPhrases.filter((phrase: string) => 
      phrase.toLowerCase().includes("experience") ||
      phrase.toLowerCase().includes("year") ||
      phrase.toLowerCase().includes("work")
    );

    const educationKeywords = keyPhrases.filter((phrase: string) =>
      phrase.toLowerCase().includes("degree") ||
      phrase.toLowerCase().includes("university") ||
      phrase.toLowerCase().includes("education")
    );

    // Get sentiment
    const sentimentResults = await client.analyze("SentimentAnalysis", [text]);
    const sentimentResult = sentimentResults[0];
    
    let sentiment = {
      overall: "neutral",
      scores: {
        positive: 0,
        neutral: 1,
        negative: 0,
      },
    };

    if (!isErrorResult(sentimentResult)) {
      const result = sentimentResult as any;
      sentiment = {
        overall: result.sentiment || "neutral",
        scores: result.confidenceScores || {
          positive: 0,
          neutral: 1,
          negative: 0,
        },
      };
    }

    return {
      skills: Array.from(new Set(skills)).slice(0, 8), // Unique skills, max 8
      experience: experienceKeywords,
      education: educationKeywords,
      sentiment,
    };
  } catch (error) {
    console.error("Error analyzing content:", error);
    throw error;
  }
}

/**
 * Generate job recommendations based on user profile
 */
export async function generateJobRecommendations(profile: {
  bio?: string;
  experience?: string;
  education?: string;
  skills?: string[];
}): Promise<JobRecommendation[]> {
  try {
    // Analyze user's profile text
    const profileText = [
      profile.bio,
      profile.experience,
      profile.education,
      profile.skills?.join(", "),
    ].filter(Boolean).join("\n");

    const analysis = await analyzeContent(profileText);

    // Map skills to job titles
    const skillToJobs: Record<string, string[]> = {
      "javascript": ["Frontend Developer", "Full Stack Developer"],
      "python": ["Backend Developer", "Data Scientist"],
      "react": ["React Developer", "Frontend Engineer"],
      "management": ["Project Manager", "Team Lead"],
      "design": ["UI/UX Designer", "Product Designer"],
      "java": ["Java Developer", "Backend Engineer"],
      "data": ["Data Analyst", "Business Intelligence"],
      "cloud": ["Cloud Engineer", "DevOps Engineer"],
      "security": ["Security Engineer", "Security Analyst"],
      "mobile": ["Mobile Developer", "iOS Developer", "Android Developer"],
    };

    const recommendations: JobRecommendation[] = [];

    // Generate recommendations based on identified skills
    for (const skill of analysis.skills) {
      const skillLower = skill.toLowerCase();
      for (const [keyword, jobs] of Object.entries(skillToJobs)) {
        if (skillLower.includes(keyword)) {
          recommendations.push(...jobs.map(title => ({
            title,
            matchScore: Math.floor(Math.random() * 20) + 80, // Random score between 80-100
            reason: `Based on your ${title.toLowerCase()} related skills`,
          })));
        }
      }
    }

    // Return unique recommendations
    return Array.from(new Set(recommendations.map(r => r.title)))
      .map(title => recommendations.find(r => r.title === title)!)
      .slice(0, 5); // Return top 5 unique recommendations
  } catch (error) {
    console.error("Error generating job recommendations:", error);
    return [];
  }
}

/**
 * Analyze a resume to extract key information
 */
export async function analyzeResume(text: string): Promise<ResumeAnalysis> {
  try {
    const analysis = await analyzeContent(text);

    return {
      skills: analysis.skills,
      experience: analysis.experience,
      education: analysis.education,
      strengths: [], // Will be populated based on sentiment analysis
      areasForImprovement: [
        "Add more quantifiable achievements",
        "Include relevant certifications",
        "Highlight leadership experience",
      ],
      suggestedRoles: await generateJobRecommendations({ skills: analysis.skills }),
    };
  } catch (error) {
    console.error("Error analyzing resume:", error);
    throw error;
  }
}

/**
 * Generate interview questions based on job requirements
 */
export async function generateInterviewQuestions(
  jobDescription: string,
  skills: string[]
): Promise<string[]> {
  try {
    // Analyze job description
    const analysis = await analyzeContent(jobDescription);
    
    // Create questions based on required skills and responsibilities
    const questions = [
      "Tell me about your experience with " + (analysis.skills[0] || "this field"),
      "How do you handle challenging situations in " + (analysis.skills[1] || "your work"),
      "What interests you about this role?",
      "Describe a project where you used " + (skills[0] || "your skills"),
      "How do you stay updated with industry trends?",
    ];

    return questions;
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return [
      "Tell me about your relevant experience",
      "Why are you interested in this role?",
      "What are your strengths and weaknesses?",
      "Where do you see yourself in 5 years?",
      "Do you have any questions for us?",
    ];
  }
}