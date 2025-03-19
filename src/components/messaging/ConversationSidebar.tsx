"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle } from "lucide-react";
import { decryptMessage } from "@/lib/utils/encryption";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

interface Message {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
}

interface Conversation {
  id: string;
  status: string;
  updatedAt: string;
  coach: {
    id: string;
    name: string;
    profileImage?: string;
  };
  seeker: {
    id: string;
    name: string;
    profileImage?: string;
  };
  messages: Message[];
}

export default function ConversationSidebar() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchConversations();
    }
  }, [session]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/conversations");
      if (!response.ok) {
        throw new Error("Failed to fetch conversations");
      }
      const data = await response.json();
      setConversations(data.conversations);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getLastMessage = async (conversation: Conversation) => {
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (!lastMessage) return "No messages yet";

    if (lastMessage.type === "document_ref") {
      return "Shared a document";
    } else if (lastMessage.type === "assessment_ref") {
      return "Shared an assessment";
    }

    try {
      // Use conversation ID as encryption key
      const decrypted = await decryptMessage(lastMessage.content, conversation.id);
      return decrypted.length > 50 ? decrypted.substring(0, 47) + "..." : decrypted;
    } catch (error) {
      console.error("Failed to decrypt message:", error);
      return "Message unavailable";
    }
  };

  const getOtherParty = (conversation: Conversation) => {
    if (!session?.user?.id) return null;
    return session.user.id === conversation.coach.id
      ? conversation.seeker
      : conversation.coach;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="font-semibold text-lg mb-4">Messages</div>
      {conversations.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No conversations yet
        </p>
      ) : (
        conversations.map((conversation) => {
          const otherParty = getOtherParty(conversation);
          if (!otherParty) return null;

          return (
            <Link
              key={conversation.id}
              href={`/conversations/${conversation.id}`}
              className="block"
            >
              <Card
                className={`p-4 hover:bg-accent cursor-pointer ${
                  selectedId === conversation.id ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedId(conversation.id)}
              >
                <div className="flex items-center gap-3">
                  {otherParty.profileImage ? (
                    <img
                      src={otherParty.profileImage}
                      alt={otherParty.name}
                      className="w-10 h-10 rounded-full"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate">{otherParty.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(conversation.updatedAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {getLastMessage(conversation)}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })
      )}
    </div>
  );
}