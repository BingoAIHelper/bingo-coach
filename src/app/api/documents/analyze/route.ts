import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/database";
import * as openAIClient from "@/lib/azure/openai";

// Track ongoing analysis to prevent multiple requests overwhelming the API
let analysisInProgress = false;
let lastAnalysisTime = 0;
const MIN_ANALYSIS_INTERVAL = 20000; // 20 seconds between analyses

/**
 * Smarter document type detection based on content and filename
 */
function detectDocumentType(fileName: string, content: string): string {
  const fileNameLower = fileName.toLowerCase();
  const contentLower = content.toLowerCase().substring(0, 1000); // Check just the beginning
  
  // Resume detection
  if (fileNameLower.includes("resume") || fileNameLower.includes("cv")) {
    return "resume";
  }
  
  if (contentLower.includes("experience") &&
      (contentLower.includes("skills") || contentLower.includes("education"))) {
    return "resume";
  }
  
  // Cover letter detection
  if (fileNameLower.includes("cover") || fileNameLower.includes("letter")) {
    return "cover letter";
  }
  
  if (contentLower.includes("dear") &&
      (contentLower.includes("position") || contentLower.includes("opportunity"))) {
    return "cover letter";
  }
  
  // Default to general
  return "general";
}

/**
 * POST /api/documents/analyze - Analyze a document using Azure OpenAI
 */
export async function POST(request: NextRequest) {
  try {
    // Implement rate limiting for the endpoint itself
    const now = Date.now();
    if (analysisInProgress) {
      return NextResponse.json(
        {
          error: "Another analysis is in progress",
          message: "Please try again in a moment"
        },
        { status: 429 }
      );
    }
    
    if (now - lastAnalysisTime < MIN_ANALYSIS_INTERVAL) {
      const waitTime = Math.ceil((MIN_ANALYSIS_INTERVAL - (now - lastAnalysisTime)) / 1000);
      return NextResponse.json(
        {
          error: "Rate limit",
          message: `Please wait ${waitTime} seconds between document analyses`,
          retryAfter: waitTime
        },
        {
          status: 429,
          headers: { 'Retry-After': waitTime.toString() }
        }
      );
    }
    
    analysisInProgress = true;
    lastAnalysisTime = now;
    
    try {
      const session = await getServerSession(authOptions);
      
      if (!session || !session.user) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      const userId = session.user.id;
      const { documentId, documentType } = await request.json();
      
      if (!documentId) {
        return NextResponse.json(
          { error: "Missing document ID" },
          { status: 400 }
        );
      }

      // Get the document from the database
      const document = await prisma.document.findUnique({
        where: {
          id: documentId,
          userId, // Ensure the document belongs to the current user
        },
      });
      
      if (!document) {
        return NextResponse.json(
          { error: "Document not found" },
          { status: 404 }
        );
      }

      // Check if document analysis is completed
      if (document.analyzeStatus !== "completed") {
        return NextResponse.json(
          { error: "Document analysis is not yet complete" },
          { status: 400 }
        );
      }

      // Parse the analysis results to get the text content
      let documentText = "";
      let aiAnalysis = null;
      
      try {
        const analysisResults = JSON.parse(document.analyzeResults || "{}");
        documentText = analysisResults.content || "";
        
        // Check if AI analysis already exists and is not older than 7 days
        if (analysisResults.aiAnalysis && analysisResults.aiAnalysisTimestamp) {
          const analysisAge = Date.now() - new Date(analysisResults.aiAnalysisTimestamp).getTime();
          const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
          
          if (analysisAge < MAX_AGE) {
            console.log("Using cached AI analysis");
            return NextResponse.json({
              success: true,
              aiAnalysis: analysisResults.aiAnalysis,
              cached: true
            });
          }
        }
        
        if (!documentText) {
          return NextResponse.json(
            { error: "No text content available for AI analysis" },
            { status: 400 }
          );
        }
        
        // Smarter document type detection
        const detectedType = documentType || detectDocumentType(document.fileName, documentText);
        console.log(`Analyzing document type: ${detectedType}`);
        
        // Get AI analysis with improvement suggestions
        aiAnalysis = await openAIClient.analyzeDocument(documentText, detectedType);
        
        // Update document with AI analysis results
        await prisma.document.update({
          where: { id: documentId },
          data: {
            // Store the AI analysis as a string in a field
            analyzeResults: JSON.stringify({
              ...analysisResults,
              aiAnalysis,
              aiAnalysisTimestamp: new Date().toISOString()
            }),
          },
        });
        
        return NextResponse.json({
          success: true,
          aiAnalysis
        });
      } catch (error) {
        console.error("Error performing AI analysis:", error);
        
        // Better error handling
        if (error instanceof Error) {
          const errMsg = error.message.toLowerCase();
          
          if (errMsg.includes("rate limit")) {
            return NextResponse.json(
              {
                error: "AI service is busy",
                message: "Please try again in a minute",
                retryAfter: 60
              },
              {
                status: 429,
                headers: { 'Retry-After': '60' }
              }
            );
          }
          
          if (errMsg.includes("not exist") || errMsg.includes("deployment")) {
            return NextResponse.json(
              {
                error: "AI service configuration issue",
                message: "Please check your Azure OpenAI configuration"
              },
              { status: 503 }
            );
          }
        }
        
        return NextResponse.json(
          { error: "Failed to perform AI analysis" },
          { status: 500 }
        );
      }
    } finally {
      // Always release the lock
      analysisInProgress = false;
    }
  } catch (error) {
    console.error("Error in document analyze API:", error);
    // Release lock in case of unexpected errors
    analysisInProgress = false;
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}