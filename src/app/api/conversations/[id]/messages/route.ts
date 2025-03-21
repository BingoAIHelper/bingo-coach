import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  getCoachMatchById,
  createMessage,
  getDocumentById,
  getAssessmentById,
  getConversationById,
  getMessagesByConversationId,
} from "@/lib/database";

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated" }),
        { status: 401 }
      );
    }

    // Ensure we have the conversation ID
    const { id: conversationId } = context.params;
    if (!conversationId) {
      return new NextResponse(
        JSON.stringify({ error: "Conversation ID is required" }),
        { status: 400 }
      );
    }

    // Get the conversation to verify permissions
    const conversation = await getConversationById(conversationId);
    if (!conversation) {
      return new NextResponse(
        JSON.stringify({ error: "Conversation not found" }),
        { status: 404 }
      );
    }

    // Verify the user has access to this conversation
    if (conversation.coach.userId !== session.user.id && conversation.seekerId !== session.user.id) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 403 }
      );
    }

    // Get messages
    const messages = await getMessagesByConversationId(conversationId);

    return new NextResponse(
      JSON.stringify({ messages: messages || [] }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching messages:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error", messages: [] }),
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { id: conversationId } = context.params;
    if (!conversationId) {
      return NextResponse.json(
        { error: "Conversation ID is required" },
        { status: 400 }
      );
    }

    // Get the conversation to verify permissions
    const conversation = await getConversationById(conversationId);
    if (!conversation) {
      return NextResponse.json(
        { error: "Conversation not found" },
        { status: 404 }
      );
    }

    // Verify user has access to this conversation
    if (conversation.coach.userId !== session.user.id && conversation.seekerId !== session.user.id) {
      return NextResponse.json(
        { error: "Access denied" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type = "text", content, documentId, assessmentId } = body;

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
      conversationId,
      senderId: session.user.id,
      type,
      content: content || "",
      documentId: type === "document_ref" ? documentId : undefined,
      assessmentId: type === "assessment_ref" ? assessmentId : undefined
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