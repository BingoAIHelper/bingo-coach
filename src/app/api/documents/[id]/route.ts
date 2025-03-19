import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/database";
import * as blobStorageClient from "@/lib/azure/storage";

/**
 * GET /api/documents/[id] - Get a specific document by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const documentId = params.id;
    
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

    // If the document's fileUrl is a direct Azure Storage blob URL,
    // generate a SAS token URL for client access
    if (document.fileUrl.includes('blob.core.windows.net')) {
      try {
        const sasUrl = await blobStorageClient.getSasUrl(document.fileUrl, 60); // 60 minutes expiry
        
        return NextResponse.json({
          document: {
            ...document,
            fileUrl: sasUrl,
            // If analysis results are stored as a string, parse them
            analyzeResults: document.analyzeResults 
              ? typeof document.analyzeResults === 'string' 
                ? JSON.parse(document.analyzeResults) 
                : document.analyzeResults
              : null
          }
        });
      } catch (error) {
        console.error("Error generating SAS URL:", error);
        
        // Return the document without a SAS URL if there's an error
        return NextResponse.json({
          document: {
            ...document,
            // If analysis results are stored as a string, parse them
            analyzeResults: document.analyzeResults 
              ? typeof document.analyzeResults === 'string' 
                ? JSON.parse(document.analyzeResults) 
                : document.analyzeResults
              : null
          }
        });
      }
    }

    // Return the document as is if it doesn't need a SAS URL
    return NextResponse.json({
      document: {
        ...document,
        // If analysis results are stored as a string, parse them
        analyzeResults: document.analyzeResults 
          ? typeof document.analyzeResults === 'string' 
            ? JSON.parse(document.analyzeResults) 
            : document.analyzeResults
          : null
      }
    });
  } catch (error) {
    console.error("Error fetching document:", error);
    return NextResponse.json(
      { error: "Failed to fetch document" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/documents/[id] - Delete a document
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    // Fix: Need to await params for Next.js dynamic route handlers
    const { id: documentId } = params;

    // Check if document exists and belongs to the user
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Delete the file from Azure Blob Storage
    try {
      await blobStorageClient.deleteFile(document.fileUrl);
    } catch (error) {
      console.error("Error deleting file from storage:", error);
      // Continue with deleting the database record even if file deletion fails
    }

    // Delete the document from the database
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json(
      { error: "Failed to delete document" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/documents/[id] - Update a document (e.g., to reanalyze)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const documentId = params.id;
    const body = await request.json();

    // Check if document exists and belongs to the user
    const document = await prisma.document.findUnique({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      return NextResponse.json(
        { error: "Document not found" },
        { status: 404 }
      );
    }

    // Handle reanalysis if requested
    if (body.reanalyze === true) {
      // Update status to analyzing
      await prisma.document.update({
        where: { id: documentId },
        data: { 
          analyzeStatus: "analyzing",
          analyzeResults: null,
          analyzeError: null,
        },
      });

      // Start document analysis in background
      const { analyzeDocument } = await import("@/lib/azure/formRecognizer");
      analyzeDocumentBackground(documentId, document.fileUrl);

      return NextResponse.json({
        success: true,
        message: "Document reanalysis started",
      });
    }

    // Handle other updates
    const updateData: any = {};
    if (body.title) updateData.title = body.title;

    const updatedDocument = await prisma.document.update({
      where: { id: documentId },
      data: updateData,
    });

    return NextResponse.json({ document: updatedDocument });
  } catch (error) {
    console.error("Error updating document:", error);
    return NextResponse.json(
      { error: "Failed to update document" },
      { status: 500 }
    );
  }
}

/**
 * Background function to analyze a document
 */
async function analyzeDocumentBackground(documentId: string, fileUrl: string) {
  try {
    // Update status to analyzing
    await prisma.document.update({
      where: { id: documentId },
      data: { analyzeStatus: "analyzing" },
    });

    // Import required functions
    const { analyzeDocument } = await import("@/lib/azure/formRecognizer");

    // Analyze the document
    const analysisResult = await analyzeDocument(fileUrl);

    // Convert analysis result to string (since we're storing as Text, not JSON)
    const analysisResultString = JSON.stringify(analysisResult);

    // Update document with analysis results
    await prisma.document.update({
      where: { id: documentId },
      data: {
        analyzeStatus: "completed",
        analyzeResults: analysisResultString,
      },
    });
  } catch (error) {
    console.error(`Error analyzing document ${documentId}:`, error);
    
    // Update status to failed
    await prisma.document.update({
      where: { id: documentId },
      data: {
        analyzeStatus: "failed",
        analyzeError: error instanceof Error ? error.message : "Unknown error",
      },
    });
  }
}