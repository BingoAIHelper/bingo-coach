"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Wand2, Trash2, Edit, Save } from "lucide-react";
import { toast } from "sonner";

interface Question {
  type: "multiple_choice" | "text" | "practical";
  question: string;
  options?: string[];
  scoring?: string;
}

interface Section {
  title: string;
  description: string;
  questions: Question[];
}

interface Assessment {
  title: string;
  description: string;
  duration: string;
  sections: Section[];
}

interface SeekerInfo {
  name: string;
  disabilities: string[];
  goals: string[];
  skillLevel: string;
  focusArea: string;
}

interface Seeker {
  id: string;
  name: string;
  assessment?: {
    title: string;
    score?: number;
    feedback?: string;
  };
  disabilities: string[];
  goals: string[];
  skillLevel: string;
  focusArea: string;
}

export default function AssessmentCreator() {
  const [mode, setMode] = useState<"manual" | "ai">("manual");
  const [assessment, setAssessment] = useState<Assessment>({
    title: "",
    description: "",
    duration: "60",
    sections: []
  });

  const [seekerInfo, setSeekerInfo] = useState<SeekerInfo>({
    name: "",
    disabilities: [],
    goals: [],
    skillLevel: "intermediate",
    focusArea: ""
  });

  const [seekers, setSeekers] = useState<Seeker[]>([]);
  const [selectedSeeker, setSelectedSeeker] = useState<string>("");
  const [currentSection, setCurrentSection] = useState<number>(-1);
  const [currentQuestion, setCurrentQuestion] = useState<number>(-1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch matched seekers
  useEffect(() => {
    const fetchSeekers = async () => {
      try {
        const response = await fetch('/api/coach-matching');
        if (!response.ok) throw new Error('Failed to fetch seekers');
        const data = await response.json();
        
        console.log('Raw API response:', data); // Debug log
        
        // Transform existing matches into seeker objects
        const matchedSeekers = data.existingMatches
          .filter((match: any) => match.status === "matched")
          .map((match: any) => {
            console.log('Processing match:', match); // Debug log
            return {
              id: match.seeker.id,
              name: match.seeker.name,
              assessment: match.seeker.assessment,
              disabilities: match.seeker.disabilities || [],
              goals: match.seeker.goals || [],
              skillLevel: match.seeker.skillLevel || "intermediate",
              focusArea: match.seeker.focusArea || ""
            };
          });
        
        console.log('Transformed seekers:', matchedSeekers); // Debug log
        setSeekers(matchedSeekers);

        // If there are seekers, select the first one by default
        if (matchedSeekers.length > 0) {
          setSelectedSeeker(matchedSeekers[0].id);
          // Also update the seeker info for the first seeker
          setSeekerInfo({
            name: matchedSeekers[0].name,
            disabilities: matchedSeekers[0].disabilities,
            goals: matchedSeekers[0].goals,
            skillLevel: matchedSeekers[0].skillLevel,
            focusArea: matchedSeekers[0].focusArea
          });
        }
      } catch (error) {
        console.error('Error fetching seekers:', error);
        toast.error('Failed to load seekers');
      }
    };

    fetchSeekers();
  }, []);

  // Update seeker info when a seeker is selected
  useEffect(() => {
    if (selectedSeeker) {
      const seeker = seekers.find(s => s.id === selectedSeeker);
      if (seeker) {
        console.log('Selected seeker:', seeker); // Debug log
        setSeekerInfo({
          name: seeker.name,
          disabilities: seeker.disabilities,
          goals: seeker.goals,
          skillLevel: seeker.skillLevel,
          focusArea: seeker.focusArea
        });

        // If there's an existing assessment, pre-fill the assessment title
        if (seeker.assessment) {
          setAssessment(prev => ({
            ...prev,
            title: `${seeker.name}'s Assessment`,
            description: `Assessment for ${seeker.name} based on their goals and skill level`
          }));
        }
      }
    }
  }, [selectedSeeker, seekers]);

  const handleGenerateAssessment = async () => {
    try {
      setIsGenerating(true);
      const response = await fetch("/api/assessments/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ seekerInfo }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate assessment");
      }

      const data = await response.json();
      setAssessment(data.assessment);
      toast.success("Assessment generated successfully");
    } catch (error) {
      console.error("Error generating assessment:", error);
      toast.error("Failed to generate assessment");
    } finally {
      setIsGenerating(false);
    }
  };

  const addSection = () => {
    setAssessment(prev => ({
      ...prev,
      sections: [
        ...prev.sections,
        {
          title: "",
          description: "",
          questions: []
        }
      ]
    }));
    setCurrentSection(assessment.sections.length);
  };

  const addQuestion = (sectionIndex: number) => {
    const newSections = [...assessment.sections];
    newSections[sectionIndex].questions.push({
      type: "multiple_choice",
      question: "",
      options: [""],
      scoring: ""
    });
    setAssessment({ ...assessment, sections: newSections });
    setCurrentSection(sectionIndex);
    setCurrentQuestion(newSections[sectionIndex].questions.length - 1);
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, updates: Partial<Question>) => {
    const newSections = [...assessment.sections];
    newSections[sectionIndex].questions[questionIndex] = {
      ...newSections[sectionIndex].questions[questionIndex],
      ...updates
    };
    setAssessment({ ...assessment, sections: newSections });
  };

  const addOption = (sectionIndex: number, questionIndex: number) => {
    const newSections = [...assessment.sections];
    const question = newSections[sectionIndex].questions[questionIndex];
    if (question.type === "multiple_choice") {
      question.options = [...(question.options || []), ""];
      setAssessment({ ...assessment, sections: newSections });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Create Assessment</h2>
          <p className="text-muted-foreground">Create or generate an assessment for your seeker</p>
        </div>
      </div>

      <Tabs value={mode} onValueChange={(value) => setMode(value as "manual" | "ai")}>
        <TabsList>
          <TabsTrigger value="manual">Manual Creation</TabsTrigger>
          <TabsTrigger value="ai">AI-Assisted</TabsTrigger>
        </TabsList>

        <TabsContent value="manual" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Assessment Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seeker">Select Seeker</Label>
                <Select
                  value={selectedSeeker}
                  onValueChange={setSelectedSeeker}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a seeker" />
                  </SelectTrigger>
                  <SelectContent>
                    {seekers.map((seeker) => (
                      <SelectItem key={seeker.id} value={seeker.id}>
                        {seeker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={assessment.title}
                  onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
                  placeholder="Enter assessment title"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={assessment.description}
                  onChange={(e) => setAssessment({ ...assessment, description: e.target.value })}
                  placeholder="Enter assessment description"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={assessment.duration}
                  onChange={(e) => setAssessment({ ...assessment, duration: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {assessment.sections.map((section, sectionIndex) => (
              <Card key={sectionIndex}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Input
                      value={section.title}
                      onChange={(e) => {
                        const newSections = [...assessment.sections];
                        newSections[sectionIndex].title = e.target.value;
                        setAssessment({ ...assessment, sections: newSections });
                      }}
                      placeholder="Section Title"
                      className="text-lg font-semibold"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        const newSections = assessment.sections.filter((_, i) => i !== sectionIndex);
                        setAssessment({ ...assessment, sections: newSections });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    value={section.description}
                    onChange={(e) => {
                      const newSections = [...assessment.sections];
                      newSections[sectionIndex].description = e.target.value;
                      setAssessment({ ...assessment, sections: newSections });
                    }}
                    placeholder="Section Description"
                  />
                  
                  <div className="space-y-4">
                    {section.questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="space-y-2 border p-4 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Select
                            value={question.type}
                            onValueChange={(value: "multiple_choice" | "text" | "practical") => {
                              updateQuestion(sectionIndex, questionIndex, { type: value });
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Question Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="practical">Practical</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              const newSections = [...assessment.sections];
                              newSections[sectionIndex].questions = section.questions.filter(
                                (_, i) => i !== questionIndex
                              );
                              setAssessment({ ...assessment, sections: newSections });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <Textarea
                          value={question.question}
                          onChange={(e) => {
                            updateQuestion(sectionIndex, questionIndex, { question: e.target.value });
                          }}
                          placeholder="Question Text"
                        />

                        {question.type === "multiple_choice" && (
                          <div className="space-y-2">
                            {question.options?.map((option, optionIndex) => (
                              <div key={optionIndex} className="flex items-center gap-2">
                                <Input
                                  value={option}
                                  onChange={(e) => {
                                    const newSections = [...assessment.sections];
                                    newSections[sectionIndex].questions[questionIndex].options![
                                      optionIndex
                                    ] = e.target.value;
                                    setAssessment({ ...assessment, sections: newSections });
                                  }}
                                  placeholder={`Option ${optionIndex + 1}`}
                                />
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => {
                                    const newSections = [...assessment.sections];
                                    newSections[sectionIndex].questions[
                                      questionIndex
                                    ].options = question.options?.filter((_, i) => i !== optionIndex);
                                    setAssessment({ ...assessment, sections: newSections });
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              variant="outline"
                              onClick={() => addOption(sectionIndex, questionIndex)}
                            >
                              Add Option
                            </Button>
                          </div>
                        )}

                        <div className="space-y-2">
                          <Label>Scoring Criteria</Label>
                          <Textarea
                            value={question.scoring}
                            onChange={(e) => {
                              updateQuestion(sectionIndex, questionIndex, { scoring: e.target.value });
                            }}
                            placeholder="Enter scoring criteria"
                          />
                        </div>
                      </div>
                    ))}
                    <Button variant="outline" onClick={() => addQuestion(sectionIndex)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Question
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            <Button onClick={addSection}>
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seeker Information</CardTitle>
              <CardDescription>
                Provide information about the seeker to generate a tailored assessment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="seeker">Select Seeker</Label>
                <Select
                  value={selectedSeeker}
                  onValueChange={setSelectedSeeker}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a seeker" />
                  </SelectTrigger>
                  <SelectContent>
                    {seekers.map((seeker) => (
                      <SelectItem key={seeker.id} value={seeker.id}>
                        {seeker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seeker-name">Seeker Name</Label>
                <Input
                  id="seeker-name"
                  value={seekerInfo.name}
                  onChange={(e) => setSeekerInfo({ ...seekerInfo, name: e.target.value })}
                  placeholder="Enter seeker's name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="disabilities">Disabilities/Accommodations</Label>
                <Textarea
                  id="disabilities"
                  value={seekerInfo.disabilities.join(", ")}
                  onChange={(e) => setSeekerInfo({
                    ...seekerInfo,
                    disabilities: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Enter disabilities/accommodations (comma-separated)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals">Career Goals</Label>
                <Textarea
                  id="goals"
                  value={seekerInfo.goals.join(", ")}
                  onChange={(e) => setSeekerInfo({
                    ...seekerInfo,
                    goals: e.target.value.split(",").map(s => s.trim()).filter(Boolean)
                  })}
                  placeholder="Enter career goals (comma-separated)"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="skill-level">Current Skill Level</Label>
                <Select
                  value={seekerInfo.skillLevel}
                  onValueChange={(value) => setSeekerInfo({ ...seekerInfo, skillLevel: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select skill level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="focus-area">Focus Area</Label>
                <Input
                  id="focus-area"
                  value={seekerInfo.focusArea}
                  onChange={(e) => setSeekerInfo({ ...seekerInfo, focusArea: e.target.value })}
                  placeholder="e.g., Frontend Development, UX Design"
                />
              </div>

              <Button
                className="w-full"
                onClick={handleGenerateAssessment}
                disabled={isGenerating}
              >
                <Wand2 className="h-4 w-4 mr-2" />
                {isGenerating ? "Generating..." : "Generate Assessment"}
              </Button>
            </CardContent>
          </Card>

          {assessment.title && (
            <Card>
              <CardHeader>
                <CardTitle>Generated Assessment</CardTitle>
                <CardDescription>Review and edit the generated assessment</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      value={assessment.title}
                      onChange={(e) => setAssessment({ ...assessment, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={assessment.description}
                      onChange={(e) => setAssessment({ ...assessment, description: e.target.value })}
                    />
                  </div>
                  {/* Sections and questions can be edited using the same components as manual creation */}
                  {/* You can extract this into a shared component if needed */}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button variant="outline">Cancel</Button>
        <Button>Save Assessment</Button>
      </div>
    </div>
  );
}