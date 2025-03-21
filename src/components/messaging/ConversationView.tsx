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
  senderId: string;
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
    sections?: Record<string, {
      title: string;
      questions: {
        type: string;
        question: string;
        answer: string | string[];
      }[];
    }>;
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
  const [selectedAssessment, setSelectedAssessment] = useState<any>(null);

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
      if (!conversation) return;

      try {
        // Determine which user's assessments to fetch based on the conversation
        const userId = session?.user?.id === conversation.coach.id 
          ? conversation.seeker.id 
          : conversation.coach.id;

        const response = await fetch(`/api/assessments?userId=${userId}`);
        if (!response.ok) throw new Error("Failed to fetch assessments");
        const data = await response.json();
        setAssessments(data.assessments || []);
      } catch (error) {
        console.error("Error fetching assessments:", error);
      }
    };

    fetchDocuments();
    if (conversation) {
      fetchAssessments();
    }
  }, [conversation, session?.user?.id]);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to accept match");
      }
      
      const data = await response.json();
      
      // Update conversation status
      setConversation((prev: Conversation | null) => {
        if (!prev?.match) return null;
        return {
          ...prev,
          status: "matched",
          match: {
            ...prev.match,
            status: "matched",
            id: prev.match.id
          }
        };
      });
      
      // Refresh messages to get the new system messages
      const messagesResponse = await fetch(`/api/conversations/${conversationId}/messages`);
      if (messagesResponse.ok) {
        const messagesData = await messagesResponse.json();
        setMessages(messagesData.messages || []);
      }
      
      toast({
        title: "Match Accepted",
        description: "You can now start working together!",
      });
    } catch (error) {
      console.error("Error accepting match:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to accept match. Please try again.",
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

  const handleAssessmentClick = (assessmentId: string) => {
    const assessment = assessments.find(a => a.id === assessmentId);
    if (assessment) {
      setSelectedAssessment(assessment);
    }
  };

  const renderAssessmentSummary = (message: Message) => {
    if (!message.assessment) return null;
    
    return (
      <div className="mt-2 p-3 bg-muted rounded-lg">
        <h4 className="font-medium">{message.assessment.title}</h4>
        {message.assessment.sections && Object.entries(message.assessment.sections).map(([key, section]) => (
          <div key={key} className="mt-2">
            <h5 className="text-sm font-medium">{section.title}</h5>
            <div className="mt-1 space-y-1">
              {section.questions.map((q, idx) => (
                <div key={idx} className="text-sm">
                  <p className="text-muted-foreground">{q.question}</p>
                  <p className="font-medium">
                    {Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
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
          <div key={message.id} className="flex flex-col space-y-2">
            <div className={`flex ${message.sender.id === session?.user?.id ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[70%] rounded-lg p-3 ${
                message.sender.id === session?.user?.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted"
              }`}>
                {message.type === "document_ref" && message.document ? (
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{message.document.title}</span>
                  </div>
                ) : message.type === "assessment_ref" && message.assessment?.id ? (
                  <div 
                    className="flex items-center gap-2 cursor-pointer hover:underline"
                    onClick={() => handleAssessmentClick(message.assessment.id)}
                  >
                    <FileText className="h-4 w-4" />
                    <span>Assessment: {message.assessment.title}</span>
                  </div>
                ) : (
                  <p className="text-sm">{message.content}</p>
                )}
                {message.assessment && renderAssessmentSummary(message)}
              </div>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(message.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Assessment Details Modal */}
      {selectedAssessment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[90%] max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{selectedAssessment.title}</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAssessment(null)}
                >
                  Close
                </Button>
              </div>
              
              {selectedAssessment.sections?.map((section: any, idx: number) => (
                <div key={idx} className="mb-6">
                  <h4 className="font-medium mb-2">{section.title}</h4>
                  <div className="space-y-2">
                    {section.questions.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="text-sm">
                        <p className="text-muted-foreground">{q.question}</p>
                        <p className="font-medium">
                          {Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

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