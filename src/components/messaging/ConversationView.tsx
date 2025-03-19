"use client";

import { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Paperclip, FileText, ChartBar } from "lucide-react";
import { encryptMessage, decryptMessage } from "@/lib/utils/encryption";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  type: string;
  content: string;
  createdAt: string;
  documentId?: string;
  assessmentId?: string;
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
    score?: number;
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
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showDocuments, setShowDocuments] = useState(false);
  const [showAssessments, setShowAssessments] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session?.user) {
      fetchMessages();
      fetchDocuments();
      fetchAssessments();
    }
  }, [session, conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/conversations/${conversationId}/messages`);
      if (!response.ok) {
        throw new Error("Failed to fetch messages");
      }
      const data = await response.json();
      setMessages(data.messages);
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

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      if (!response.ok) throw new Error("Failed to fetch documents");
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  };

  const fetchAssessments = async () => {
    try {
      const response = await fetch("/api/assessments");
      if (!response.ok) throw new Error("Failed to fetch assessments");
      const data = await response.json();
      setAssessments(data.assessments);
    } catch (error) {
      console.error("Error fetching assessments:", error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    try {
      setSending(true);
      const encrypted = await encryptMessage(newMessage, conversationId);
      
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "text",
          content: encrypted,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();
      setMessages([...messages, data]);
      setNewMessage("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send message";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const shareDocument = async (documentId: string) => {
    try {
      setSending(true);
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "document_ref",
          documentId,
        }),
      });

      if (!response.ok) throw new Error("Failed to share document");
      
      const data = await response.json();
      setMessages([...messages, data]);
      setShowDocuments(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share document",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const shareAssessment = async (assessmentId: string) => {
    try {
      setSending(true);
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "assessment_ref",
          assessmentId,
        }),
      });

      if (!response.ok) throw new Error("Failed to share assessment");
      
      const data = await response.json();
      setMessages([...messages, data]);
      setShowAssessments(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to share assessment",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const renderMessage = async (message: Message) => {
    if (message.type === "document_ref" && message.document) {
      return (
        <div className="flex items-center gap-2 p-2 bg-accent rounded">
          <FileText className="h-5 w-5" />
          <div>
            <div className="font-medium">{message.document.title}</div>
            <div className="text-sm text-muted-foreground">{message.document.fileName}</div>
          </div>
        </div>
      );
    }

    if (message.type === "assessment_ref" && message.assessment) {
      return (
        <div className="flex items-center gap-2 p-2 bg-accent rounded">
          <ChartBar className="h-5 w-5" />
          <div>
            <div className="font-medium">{message.assessment.title}</div>
            {message.assessment.score !== undefined && (
              <div className="text-sm text-muted-foreground">Score: {message.assessment.score}</div>
            )}
          </div>
        </div>
      );
    }

    try {
      const decrypted = await decryptMessage(message.content, conversationId);
      return decrypted;
    } catch (error) {
      console.error("Failed to decrypt message:", error);
      return "Message unavailable";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
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
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              <div className="text-sm mb-1 opacity-70">{message.sender.name}</div>
              <div>{renderMessage(message)}</div>
              <div className="text-xs mt-1 opacity-70">
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Dialog open={showDocuments} onOpenChange={setShowDocuments}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Document</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 mt-4">
                {documents.map((doc) => (
                  <Card
                    key={doc.id}
                    className="p-3 cursor-pointer hover:bg-accent"
                    onClick={() => shareDocument(doc.id)}
                  >
                    <div className="font-medium">{doc.title}</div>
                    <div className="text-sm text-muted-foreground">{doc.fileName}</div>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAssessments} onOpenChange={setShowAssessments}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <ChartBar className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Share Assessment</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 mt-4">
                {assessments.map((assessment) => (
                  <Card
                    key={assessment.id}
                    className="p-3 cursor-pointer hover:bg-accent"
                    onClick={() => shareAssessment(assessment.id)}
                  >
                    <div className="font-medium">{assessment.title}</div>
                    {assessment.score !== undefined && (
                      <div className="text-sm text-muted-foreground">
                        Score: {assessment.score}
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>

          <Textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
          />
          <Button
            onClick={sendMessage}
            disabled={sending || !newMessage.trim()}
          >
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}