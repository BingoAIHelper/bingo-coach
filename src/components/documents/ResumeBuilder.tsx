"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const RESUME_STYLES = [
  { id: "professional", name: "Professional" },
  { id: "modern", name: "Modern" },
  { id: "creative", name: "Creative" },
  { id: "minimal", name: "Minimal" },
];

const CHAT_QUESTIONS = [
  "What are your key professional achievements?",
  "What technical skills do you possess?",
  "What is your educational background?",
  "What are your career objectives?",
  "Do you have any certifications or special training?",
];

export default function ResumeBuilder() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [existingDocs, setExistingDocs] = useState<any[]>([]);
  const [hasPermission, setHasPermission] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Load existing documents if permission granted
    if (hasPermission) {
      fetchExistingDocuments();
    }
  }, [hasPermission]);

  const fetchExistingDocuments = async () => {
    try {
      const response = await fetch("/api/documents");
      const data = await response.json();
      setExistingDocs(data.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast({
        title: "Error",
        description: "Failed to fetch existing documents",
        variant: "destructive",
      });
    }
  };

  const handlePermissionGrant = async () => {
    setHasPermission(true);
  };

  const handleAnswerSubmit = () => {
    if (currentAnswer.trim()) {
      setAnswers({
        ...answers,
        [CHAT_QUESTIONS[step]]: currentAnswer.trim(),
      });
      setCurrentAnswer("");
      if (step < CHAT_QUESTIONS.length - 1) {
        setStep(step + 1);
      }
    }
  };

  const handleGenerateResume = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/resumes/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
          style: selectedStyle,
          existingDocuments: hasPermission ? existingDocs : [],
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate resume");
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Resume generated successfully",
      });

      // Reset the form
      setStep(0);
      setAnswers({});
      setCurrentAnswer("");
      setSelectedStyle("");
    } catch (error) {
      console.error("Error generating resume:", error);
      toast({
        title: "Error",
        description: "Failed to generate resume",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const isComplete = step === CHAT_QUESTIONS.length - 1 && 
                    Object.keys(answers).length === CHAT_QUESTIONS.length &&
                    selectedStyle;

  if (!hasPermission) {
    return (
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Resume Builder</h2>
        <p className="mb-4">
          Would you like to use your existing documents to help create your resume?
          This will help us generate a more personalized resume.
        </p>
        <div className="flex gap-4">
          <Button onClick={handlePermissionGrant}>Yes, use my documents</Button>
          <Button variant="outline" onClick={() => setHasPermission(false)}>
            No, start fresh
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Resume Builder</h2>
      
      {step < CHAT_QUESTIONS.length ? (
        <div className="space-y-4">
          <p className="font-medium">{CHAT_QUESTIONS[step]}</p>
          <Textarea
            value={currentAnswer}
            onChange={(e) => setCurrentAnswer(e.target.value)}
            placeholder="Type your answer here..."
            className="min-h-[100px]"
          />
          <Button onClick={handleAnswerSubmit}>
            {step === CHAT_QUESTIONS.length - 1 ? "Final Step" : "Next"}
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="font-medium">Choose a resume style:</p>
          <Select value={selectedStyle} onValueChange={setSelectedStyle}>
            <SelectTrigger>
              <SelectValue placeholder="Select a style" />
            </SelectTrigger>
            <SelectContent>
              {RESUME_STYLES.map((style) => (
                <SelectItem key={style.id} value={style.id}>
                  {style.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={handleGenerateResume}
            disabled={!isComplete || isGenerating}
            className="w-full"
          >
            {isGenerating ? "Generating..." : "Generate Resume"}
          </Button>
        </div>
      )}

      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Step {step + 1} of {CHAT_QUESTIONS.length + 1}
        </p>
      </div>
    </Card>
  );
}