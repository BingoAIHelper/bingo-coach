import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getConversationsByUserId } from "@/lib/database";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse(
        JSON.stringify({ error: "Not authenticated", conversations: [] }),
        { status: 401 }
      );
    }

    const conversations = await getConversationsByUserId(session.user.id);
    
    // Ensure we always return an array, even if empty
    return new NextResponse(
      JSON.stringify({ conversations: conversations || [] }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error", conversations: [] }),
      { status: 500 }
    );
  }
}