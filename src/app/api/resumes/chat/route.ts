import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { createResume, getUserById, getResumesByUserId } from "@/lib/database";
import { generateChatCompletion } from "@/lib/azure/openai";
import { analyzeDocument } from "@/lib/azure/formRecognizer";
import { analyzeResume } from "@/lib/azure/language";
import type { ResumeAnalysis } from "@/lib/azure/language";

interface Document {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  content?: string;
}

interface JobRecommendation {
  title: string;
  score: number;
  reasons: string[];
}

interface DocumentAnalysis {
  fileName: string;
  content: string;
  analysis: ResumeAnalysis;
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get user ID from session
    const userId = (session.user as any).id;
    
    // Get the message from request body
    const { message, context } = await request.json();
    
    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Get user data and existing resumes
    const [user, existingResumes] = await Promise.all([
      getUserById(userId),
      getResumesByUserId(userId)
    ]);

    // Analyze documents if they exist
    let documentAnalysis: DocumentAnalysis[] = [];
    if (user?.documents) {
      const resumeDocs = (user.documents as Document[]).filter(doc => 
        doc.fileType.toLowerCase().includes('resume') || 
        doc.fileName.toLowerCase().includes('resume')
      );

      const analysisResults = await Promise.all(
        resumeDocs.map(async (doc: Document) => {
          try {
            // Extract text content using Form Recognizer
            const docAnalysis = await analyzeDocument(doc.fileUrl);
            const textContent = docAnalysis.content || "";

            // Analyze content with Language Service
            const resumeAnalysis = await analyzeResume(textContent);

            return {
              fileName: doc.fileName,
              content: textContent,
              analysis: resumeAnalysis
            } as DocumentAnalysis;
          } catch (error) {
            console.error(`Error analyzing document ${doc.fileName}:`, error);
            return null;
          }
        })
      );

      documentAnalysis = analysisResults.filter((result): result is DocumentAnalysis => result !== null);
    }

    // Prepare system context with simplified document info
    const systemContext = {
      user: {
        name: user?.name,
        email: user?.email,
        location: user?.location,
        bio: user?.bio
      },
      existingResumes: existingResumes.map(resume => ({
        title: resume.title,
        content: resume.content
      })),
      documents: documentAnalysis.map(doc => ({
        fileName: doc.fileName,
        skills: doc.analysis.skills,
        experience: doc.analysis.experience,
        education: doc.analysis.education,
        strengths: doc.analysis.strengths,
        improvements: doc.analysis.areasForImprovement
      }))
    };

    // Prepare messages for Azure OpenAI
    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      {
        role: "system",
        content: `You are an AI resume builder assistant. Help create and refine resumes based on user input, profile data, and analyzed documents.

${documentAnalysis.length > 0 ? `I have analyzed the following documents and extracted relevant information:
${JSON.stringify(documentAnalysis, null, 2)}

Please use this information when creating or updating the resume. Incorporate relevant skills, experience, and education from these documents.` : ''}

When providing the final resume content, use the following format with clear section headers and spacing:

📋 RESUME COMPLETE

=== Summary ===
[A concise professional summary that highlights key strengths and career objectives]

=== Professional Experience ===
[Job Title] | [Company] | [Start Date] - [End Date]
• [Key responsibility or achievement]
• [Another key responsibility or achievement]
• [Another notable accomplishment]

[Next Job Title] | [Company] | [Start Date] - [End Date]
• [Key responsibility or achievement]
• [Another key responsibility or achievement]
• [Another notable accomplishment]

=== Education ===
[Degree] | [School] | [Year]
[Additional education entries in the same format]

=== Skills ===
[Skill 1], [Skill 2], [Skill 3], ...

Only use the above format when presenting a complete resume. For regular conversation and questions, use natural dialogue. Current context: ${JSON.stringify(systemContext)}`
      },
      {
        role: "user",
        content: message
      }
    ];

    if (context?.previousMessages) {
      const typedPreviousMessages = context.previousMessages.map((msg: { role: string; content: any }) => ({
        role: msg.role as "system" | "user" | "assistant",
        content: String(msg.content)
      }));
      messages.splice(1, 0, ...typedPreviousMessages);
    }

    // Get completion from Azure OpenAI
    const aiResponse = await generateChatCompletion(messages, 800, 0.7);

    // Check if we need to create/update a resume
    if (aiResponse.includes("SAVE_RESUME")) {
      const resumeContent = aiResponse.split("SAVE_RESUME")[1].trim();
      
      // Create new resume
      const resumeData = {
        userId,
        title: `Resume ${existingResumes.length + 1}`,
        content: resumeContent,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await createResume(resumeData);
    }

    return NextResponse.json({
      message: aiResponse,
      context: {
        previousMessages: [
          ...messages.slice(1).filter(msg => msg.role !== "system"),
          { role: "assistant", content: aiResponse }
        ]
      }
    });
  } catch (error) {
    console.error("Error in resume chat:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}