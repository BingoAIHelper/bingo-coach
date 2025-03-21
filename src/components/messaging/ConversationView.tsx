"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, PaperclipIcon, FileText } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Message {
  id: string;
  content: string;
  type: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
  };
  document?: {
    id: string;
    title: string;
    fileName: string;
  };
  assessment?: {
    id: string;
    title: string;
    score: number;
  };
}

interface Conversation {
  id: string;
  status: string;
  match?: {
    id: string;
    status: string;
  };
  coach: {
    id: string;
    name: string;
  };
  seeker: {
    id: string;
    name: string;
  };
}

interface ConversationViewProps {
  conversationId: string;
}

export default function ConversationView({ conversationId }: ConversationViewProps) {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [documents, setDocuments] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [accepting, setAccepting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation details
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const response = await fetch(`/api/conversations/${conversationId}`);
        if (!response.ok) throw new Error("Failed to fetch conversation");
        const data = await response.json();
        console.log("Fetched conversation:", data); // Debug log
        setConversation(data);
      } catch (error) {
        console.error("Error fetching conversation:", error);
      }
    };

    if (conversationId) {
      fetchConversation();
    }
  }, [conversationId]);

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/conversations/${conversationId}/messages`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast({
          title: "Error",
          description: "Failed to load messages. Please try again.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    if (conversationId) {
      fetchMessages();
    }
  }, [conversationId, toast]);

  // Fetch documents and assessments
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const response = await fetch("/api/documents");
        if (!response.ok) throw new Error("Failed to fetch documents");
        const data = await response.json();
        setDocuments(data.documents || []);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };

    const fetchAssessments = async () => {
      try {
        const response = await fetch("/api/assessments");
        if (!response.ok) throw new Error("Failed to fetch assessments");
        const data = await response.json();
        setAssessments(data.assessments || []);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      }
    };

    fetchDocuments();
    fetchAssessments();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAcceptMatch = async () => {
    if (!conversation?.match?.id) return;

    try {
      setAccepting(true);
      const response = await fetch("/api/match-request", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          matchId: conversation.match.id,
          status: "matched"
        }),
      });

      if (!response.ok) throw new Error("Failed to accept match");
      
      const data = await response.json();
      setConversation((prev: Conversation | null) => prev ? ({
        ...prev,
        status: "matched"
      }) : null);
      
      toast({
        title: "Match Accepted",
        description: "You can now start working together!",
      });
    } catch (error) {
      console.error("Error accepting match:", error);
      toast({
        title: "Error",
        description: "Failed to accept match. Please try again.",
        variant: "destructive"
      });
    } finally {
      setAccepting(false);
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || !session?.user?.id) return;

    try {
      setSending(true);
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newMessage,
          type: "text"
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      
      const message = await response.json();
      setMessages(prev => [...prev, message]);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {conversation?.match?.status === "pending" && (
          <div className="flex justify-center mb-4">
            <Button
              onClick={handleAcceptMatch}
              disabled={accepting}
              className="bg-primary hover:bg-primary/90"
            >
              {accepting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Accept Match
            </Button>
          </div>
        )}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender.id === session?.user?.id ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] rounded-lg p-3 ${
                message.sender.id === session?.user?.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}
            >
              {message.type === "document_ref" && message.document ? (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>{message.document.title}</span>
                </div>
              ) : message.type === "assessment_ref" && message.assessment ? (
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Assessment: {message.assessment.title}</span>
                </div>
              ) : (
                <p>{message.content}</p>
              )}
              <div className="text-xs mt-1 opacity-70">
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            disabled={sending || conversation?.status === "pending"}
          />
          <Button
            onClick={handleSend}
            disabled={!newMessage.trim() || sending || conversation?.status === "pending"}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}