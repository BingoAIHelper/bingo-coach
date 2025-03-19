import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/database";
import { analyzeDocument } from "@/lib/azure/formRecognizer";
import * as blobStorageClient from "@/lib/azure/storage";

/**
 * GET /api/documents - Get all documents for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    const documents = await prisma.document.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/documents - Upload a new document and start analysis
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const formData = await request.formData();
    
    // Extract form data
    const title = formData.get("title") as string;
    const file = formData.get("file") as File;
    
    if (!title || !file) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Access Azure Storage details
    const storageConnectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
    const containerName = process.env.AZURE_STORAGE_CONTAINER;

    if (!storageConnectionString || !containerName) {
      return NextResponse.json(
        { error: "Storage configuration is missing" },
        { status: 500 }
      );
    }

    // TODO: Upload the file to Azure Blob Storage
    // For now, let's assume we have a function to upload and get the URL
    const blobStorageClient = await import("@/lib/azure/storage");
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileName = `documents/${userId}/${Date.now()}-${file.name}`;
    
    const fileUrl = await blobStorageClient.uploadFile(
      fileBuffer,
      fileName
    );

    // Create document record in database
    const document = await prisma.document.create({
      data: {
        userId,
        title,
        fileName: file.name,
        fileUrl,
        fileType: file.type,
        fileSize: file.size,
        analyzeStatus: "pending",
      },
    });

    // Start document analysis in background (don't await)
    analyzeDocumentBackground(document.id, fileUrl);

    return NextResponse.json({
      document: {
        ...document,
        analyzeResults: null, // Don't send the results yet
      },
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json(
      { error: "Failed to upload document" },
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

/**
 * DELETE /api/documents/:id - Delete a document
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
    const id = params.id;

    // Check if document exists and belongs to the user
    const document = await prisma.document.findUnique({
      where: {
        id,
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
    const blobStorageClient = await import("@/lib/azure/storage");
    
    // The document.fileUrl contains the full URL to the blob
    await blobStorageClient.deleteFile(document.fileUrl);

    // Delete the document from the database
    await prisma.document.delete({
      where: { id },
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