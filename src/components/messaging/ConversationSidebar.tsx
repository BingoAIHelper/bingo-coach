"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle } from "lucide-react";
import { decryptMessage } from "@/lib/utils/encryption";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
    userId: string;
  };
  seeker: {
    id: string;
    name: string;
    profileImage?: string;
  };
  messages: Message[];
}

interface ConversationSidebarProps {
  initialConversations: Conversation[];
}

export default function ConversationSidebar({ initialConversations = [] }: ConversationSidebarProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const pathname = usePathname();
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update conversations when initialConversations changes
  useEffect(() => {
    setConversations(initialConversations);
  }, [initialConversations]);

  // Fetch conversations and messages
  useEffect(() => {
    const fetchConversations = async () => {
      if (!session?.user?.id) return;
      
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/conversations');
        if (!response.ok) {
          throw new Error('Failed to fetch conversations');
        }
        const data = await response.json();
        // Ensure we have an array of conversations
        setConversations(data.conversations || []);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        setError('Failed to fetch messages');
        toast({
          title: "Error",
          description: "Failed to fetch messages. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [session?.user?.id, toast]);

  const getOtherParty = (conversation: Conversation) => {
    if (!session?.user?.id) return null;
    // Compare with coach.userId instead of coach.id
    return session.user.id === conversation.coach.userId
      ? conversation.seeker
      : conversation.coach;
  };

  const getMessagePreview = (conversation: Conversation) => {
    if (!conversation.messages || conversation.messages.length === 0) {
      return "No messages yet";
    }

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (!lastMessage) return "No messages yet";

    if (lastMessage.type === "document_ref") {
      return "Shared a document";
    } else if (lastMessage.type === "assessment_ref") {
      return "Shared an assessment";
    }

    return lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 47) + "..."
      : lastMessage.content;
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
      <div className="flex flex-col items-center justify-center min-h-[200px] space-y-4">
        <p className="text-red-500">{error}</p>
        <Button 
          onClick={() => {
            setLoading(true);
            setError(null);
            // Retry fetching conversations
            const fetchConversations = async () => {
              try {
                const response = await fetch('/api/conversations');
                if (!response.ok) {
                  throw new Error('Failed to fetch conversations');
                }
                const data = await response.json();
                setConversations(data.conversations || []);
                setLoading(false);
              } catch (error) {
                setError('Failed to fetch messages');
                setLoading(false);
                toast({
                  title: "Error",
                  description: "Failed to fetch messages. Please try again.",
                  variant: "destructive"
                });
              }
            };
            fetchConversations();
          }}
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="font-semibold text-lg mb-4">Messages</div>
      {!conversations || conversations.length === 0 ? (
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
              href={`${pathname}?id=${conversation.id}`}
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
                      {getMessagePreview(conversation)}
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