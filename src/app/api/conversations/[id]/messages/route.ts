import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/route";
import {
  getCoachMatchById,
  createMessage,
  getDocumentById,
  getAssessmentById,
} from "@/lib/database";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the match to verify permissions
    const match = await getCoachMatchById(params.id);
    if (!match) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this conversation
    if (match.coachId !== session.user.id && match.seekerId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Return messages with conversation
    return NextResponse.json({
      messages: match.conversation?.messages || []
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Get the match to verify permissions
    const match = await getCoachMatchById(params.id);
    if (!match) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this conversation
    if (match.coachId !== session.user.id && match.seekerId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    // Verify match status allows messaging
    if (match.status !== "matched") {
      return NextResponse.json(
        { error: "Cannot send messages until both parties have matched" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { type, content, documentId, assessmentId } = body;

    // Validate message type
    if (!["text", "document_ref", "assessment_ref"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid message type" },
        { status: 400 }
      );
    }

    // Validate references if present
    if (type === "document_ref") {
      if (!documentId) {
        return NextResponse.json(
          { error: "Document ID is required" },
          { status: 400 }
        );
      }

      const document = await getDocumentById(documentId);
      if (!document || document.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Invalid document reference" },
          { status: 400 }
        );
      }
    }

    if (type === "assessment_ref") {
      if (!assessmentId) {
        return NextResponse.json(
          { error: "Assessment ID is required" },
          { status: 400 }
        );
      }

      const assessment = await getAssessmentById(assessmentId);
      if (!assessment || assessment.userId !== session.user.id) {
        return NextResponse.json(
          { error: "Invalid assessment reference" },
          { status: 400 }
        );
      }
    }

    // Create the message
    const message = await createMessage({
      conversationId: match.conversation!.id,
      senderId: session.user.id,
      type,
      content: content || "",
      documentId: type === "document_ref" ? documentId : undefined,
      assessmentId: type === "assessment_ref" ? assessmentId : undefined,
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error("Error creating message:", error);
    return NextResponse.json(
      { error: "Failed to create message" },
      { status: 500 }
    );
  }
}