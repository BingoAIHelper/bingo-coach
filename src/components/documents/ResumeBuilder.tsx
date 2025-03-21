'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from "@/components/ui/use-toast"
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { MessageSquare, Send, Loader2, Download } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { CardHeader, CardContent, CardFooter } from "@/components/ui/card";
// Import Azure AI services
// import { useFormRecognizer } from '@/lib/azure/formRecognizer';
// import { useLanguage } from '@/lib/azure/language';
// import { useOpenAI } from '@/lib/azure/openai';

interface ResumeBuilderProps {
  documents: {
    id: string;
    title: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    analyzeStatus: string;
    analyzeResults: string | null;
    analyzeError: string | null;
    createdAt: string;
    updatedAt: string;
  }[];
  profile: any;
}

interface ResumeData {
  title: string;
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    year: string;
  }>;
  skills: string[];
}

export function ResumeBuilder({ documents, profile }: ResumeBuilderProps) {
  interface Message {
    role: "system" | "user" | "assistant";
    content: string;
  }

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [hasConsented, setHasConsented] = useState(false)
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [hasCompleteResume, setHasCompleteResume] = useState(false);

  const handleQuickAction = async (action: 'use_info' | 'start_scratch') => {
    setIsLoading(true);
    try {
      const message = action === 'use_info' 
        ? "Please use my existing information to create a resume"
        : "Let's start from scratch and create a new resume";
      
      setInput('');
      
      // Add user message to chat
      const userMessage: Message = {
        role: "user",
        content: message
      };
      setMessages(prevMessages => [...prevMessages, userMessage]);

      // Send to API
      const response = await fetch('/api/resumes/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          context: {
            previousMessages: messages
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();
      
      // Add AI response to chat
      setMessages(prevMessages => [...prevMessages, {
        role: "assistant",
        content: data.message
      }]);

    } catch (error) {
      console.error('Error in chat:', error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleConsent = async (checked: boolean) => {
    if (checked) {
      setIsLoading(true);
      try {
        // Get user data
        const userData = {
          documents,
          profile
        };

        // Initialize chat with system message (hidden from UI) and welcome message
        const initialMessages: Message[] = [
          {
            role: "system",
            content: `Let's create a resume together. I'll help you build a professional resume using your profile data and documents. I'll guide you through the process step by step. Here's your current data: ${JSON.stringify(userData)}`
          },
          {
            role: "assistant",
            content: "Hi! I'm your AI resume builder assistant. I'll help you create a professional resume. I see you have some documents and profile information. Would you like me to use this information to create a draft resume, or would you prefer to start from scratch?"
          }
        ];

        // Only display messages that aren't system messages
        setMessages(initialMessages.filter(msg => msg.role !== "system"));
        setHasConsented(true);
        
        toast({
          title: "Resume Builder Started",
          description: "I'll guide you through creating your resume. Just chat with me and I'll help you build it step by step.",
        });
      } catch (error) {
        console.error('Error starting resume generation:', error);
        toast({
          title: "Error",
          description: "Failed to start resume generation. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSend = async () => {
    if (input.trim() !== '') {
      setIsLoading(true);
      try {
        const userMessage: Message = {
          role: "user",
          content: input
        };
        
        // Add user message to chat
        setMessages(prevMessages => [...prevMessages, userMessage]);
        setInput('');

        // Send to API
        const response = await fetch('/api/resumes/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: input,
            context: {
              previousMessages: messages
            }
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        
        // Add AI response to chat
        setMessages(prevMessages => [...prevMessages, {
          role: "assistant",
          content: data.message
        }]);

      } catch (error) {
        console.error('Error in chat:', error);
        toast({
          title: "Error",
          description: "Failed to get AI response. Please try again.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGeneratePDF = async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Extract resume data from messages
      const resumeData: ResumeData = {
        title: 'My Resume',
        summary: '',
        experience: [],
        education: [],
        skills: [],
      };

      // Find the last assistant message that contains resume data
      const lastResumeMessage = messages
        .filter(msg => msg.role === 'assistant')
        .reverse()
        .find(msg => msg.content.includes('📋 RESUME COMPLETE'));

      if (!lastResumeMessage) {
        throw new Error('No complete resume found in conversation');
      }

      // Parse resume data from the message
      const content = lastResumeMessage.content;
      
      // Extract summary
      const summaryMatch = content.match(/=== Summary ===\n([\s\S]*?)\n===|=== Summary ===\n([\s\S]*?)$/);
      if (summaryMatch) {
        resumeData.summary = (summaryMatch[1] || summaryMatch[2]).trim();
      }

      // Extract experience
      const experienceMatch = content.match(/=== Professional Experience ===\n([\s\S]*?)\n===|=== Professional Experience ===\n([\s\S]*?)$/);
      if (experienceMatch) {
        const expSection = (experienceMatch[1] || experienceMatch[2]).trim();
        const experiences = expSection.split('\n\n').filter(Boolean);
        
        resumeData.experience = experiences.map(exp => {
          const [header, ...bullets] = exp.split('\n');
          const [title, company, dates] = header.split(' | ');
          const [startDate, endDate] = dates ? dates.split(' - ') : ['', ''];
          
          return {
            title: title?.trim() || '',
            company: company?.trim() || '',
            startDate: startDate?.trim() || '',
            endDate: endDate?.trim() || '',
            description: bullets
              .filter(b => b.trim().startsWith('•'))
              .map(b => b.trim().substring(2).trim())
              .join('\n'),
          };
        });
      }

      // Extract education
      const educationMatch = content.match(/=== Education ===\n([\s\S]*?)\n===|=== Education ===\n([\s\S]*?)$/);
      if (educationMatch) {
        const eduSection = (educationMatch[1] || educationMatch[2]).trim();
        const eduItems = eduSection.split('\n').filter(Boolean);
        
        resumeData.education = eduItems.map(item => {
          const [degree, school, year] = item.split(' | ');
          return {
            degree: degree?.trim() || '',
            school: school?.trim() || '',
            year: year?.trim() || '',
          };
        });
      }

      // Extract skills
      const skillsMatch = content.match(/=== Skills ===\n([\s\S]*?)($|\n===)/);
      if (skillsMatch) {
        resumeData.skills = skillsMatch[1]
          .split(',')
          .map(skill => skill.trim())
          .filter(Boolean);
      }

      // Send to API to generate PDF
      const response = await fetch('/api/resumes/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resumeData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF');
      }

      const data = await response.json();
      
      // Download the PDF
      const link = document.createElement('a');
      link.href = data.pdfUrl;
      link.download = `${profile.name?.replace(/\s+/g, '-')}-resume.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Success",
        description: "Resume PDF has been generated and downloaded.",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Error",
        description: "Failed to generate resume PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const formatMessage = (content: string) => {
    // Check if this is a complete resume
    if (content.includes('📋 RESUME COMPLETE')) {
      setHasCompleteResume(true);
      
      // Split the content into sections
      return content.split('\n').map((line, index) => {
        if (line.startsWith('===')) {
          // Section headers
          return (
            <h4 key={index} className="font-semibold text-primary mt-4 mb-2">
              {line.replace(/===/g, '').trim()}
            </h4>
          );
        } else if (line.startsWith('•')) {
          // Bullet points
          return (
            <p key={index} className="ml-4 text-sm">
              {line}
            </p>
          );
        } else if (line === '📋 RESUME COMPLETE') {
          // Resume complete header
          return (
            <div key={index} className="flex items-center gap-2 text-primary font-semibold mb-4">
              <span>{line}</span>
            </div>
          );
        } else {
          // Regular text
          return (
            <p key={index} className="text-sm">
              {line}
            </p>
          );
        }
      });
    } else {
      // Regular conversation message
      return <p className="text-sm leading-relaxed">{content}</p>;
    }
  };

  if (!hasConsented) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-3 rounded-full bg-primary/10">
            <MessageSquare className="h-8 w-8 text-primary" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">AI Resume Builder</h3>
            <p className="text-muted-foreground">
              Let our AI assistant help you create a professional resume using your profile and documents.
            </p>
          </div>
          <div className="w-full max-w-sm space-y-4 pt-4">
            <div className="flex items-start space-x-3 text-left">
              <Checkbox 
                id="terms" 
                onCheckedChange={handleConsent}
                disabled={isLoading}
              />
              <label
                htmlFor="terms"
                className="text-sm leading-relaxed"
              >
                I consent to the use of my profile data and uploaded documents for generating my resume. This information will be processed by our AI to create personalized resume suggestions.
              </label>
            </div>
            {isLoading && (
              <div className="flex items-center justify-center space-x-2 text-primary">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Initializing AI assistant...</span>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Resume Builder
            </h2>
            <p className="text-sm text-muted-foreground">
              Chat with AI to create your professional resume
            </p>
          </div>
          {hasCompleteResume && (
            <Button
              onClick={handleGeneratePDF}
              disabled={isGeneratingPDF}
              variant="outline"
              className="ml-2"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {!hasConsented ? (
          <div className="flex items-start space-x-2">
            <Checkbox
              id="consent"
              checked={hasConsented}
              onCheckedChange={handleConsent}
            />
            <label
              htmlFor="consent"
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              I understand that this AI assistant will help me create a resume and may use my profile information and uploaded documents.
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${
                      msg.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`rounded-lg px-4 py-2 max-w-[80%] ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-lg px-4 py-2 max-w-[80%] bg-muted">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {messages.length === 1 && (
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={() => handleQuickAction('use_info')}
                  disabled={isLoading}
                  variant="outline"
                >
                  Use my information
                </Button>
                <Button
                  onClick={() => handleQuickAction('start_scratch')}
                  disabled={isLoading}
                  variant="outline"
                >
                  Start from scratch
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                disabled={isLoading}
              />
              <Button onClick={handleSend} disabled={!input.trim() || isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}