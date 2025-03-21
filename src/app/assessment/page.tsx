"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Define the assessment sections and questions
const disabilityOptions = [
  { id: "visual", label: "Visual Impairment" },
  { id: "hearing", label: "Hearing Impairment" },
  { id: "mobility", label: "Mobility Impairment" },
  { id: "cognitive", label: "Cognitive Disability" },
  { id: "learning", label: "Learning Disability" },
  { id: "speech", label: "Speech Impairment" },
  { id: "anxiety", label: "Anxiety" },
  { id: "depression", label: "Depression" },
  { id: "autism", label: "Autism Spectrum" },
  { id: "adhd", label: "ADHD" },
  { id: "other", label: "Other" },
];

const jobPreferenceOptions = [
  { id: "remote", label: "Remote Work" },
  { id: "hybrid", label: "Hybrid Work" },
  { id: "onsite", label: "On-site Work" },
  { id: "fulltime", label: "Full-time" },
  { id: "parttime", label: "Part-time" },
  { id: "contract", label: "Contract" },
  { id: "flexible", label: "Flexible Hours" },
];

const learningStyleOptions = [
  { id: "visual", label: "Visual Learning" },
  { id: "auditory", label: "Auditory Learning" },
  { id: "reading", label: "Reading/Writing" },
  { id: "kinesthetic", label: "Kinesthetic (Hands-on)" },
  { id: "social", label: "Social Learning" },
  { id: "solitary", label: "Solitary Learning" },
];

const communicationStyleOptions = [
  { id: "text", label: "Text-based Communication" },
  { id: "voice", label: "Voice Communication" },
  { id: "video", label: "Video Communication" },
  { id: "asl", label: "American Sign Language" },
  { id: "simplified", label: "Simplified Language" },
];

export default function AssessmentPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    disabilities: [] as string[],
    disabilityDetails: "",
    jobPreferences: [] as string[],
    jobTypes: [] as string[],
    jobIndustry: "",
    timeframe: "",
    learningStyles: [] as string[],
    communicationStyles: [] as string[],
    assistanceNeeded: [] as string[],
    additionalInfo: "",
  });
  
  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }
  
  // Show loading state while checking authentication
  if (status === "loading") {
    return (
      <MainLayout>
        <div className="container py-10">
          <div className="flex justify-center items-center min-h-[50vh]">
            <p className="text-lg">Loading assessment...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  const handleCheckboxChange = (field: string, value: string) => {
    setFormData((prev) => {
      const currentValues = prev[field as keyof typeof prev] as string[];
      
      if (currentValues.includes(value)) {
        return {
          ...prev,
          [field]: currentValues.filter((item) => item !== value),
        };
      } else {
        return {
          ...prev,
          [field]: [...currentValues, value],
        };
      }
    });
  };
  
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleSubmit = async () => {
    try {
      // Submit assessment data to API
      const response = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error("Failed to submit assessment");
      }
      
      toast.success("Assessment completed successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast.error("Failed to submit assessment. Please try again.");
    }
  };
  
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => prev - 1);
  
  return (
    <MainLayout>
      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold tracking-tight">Personal Assessment</h1>
            <p className="text-muted-foreground mt-2">
              Help us understand your needs and preferences to provide the best job coaching experience.
            </p>
          </div>
          
          <div className="flex justify-between mb-8">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div 
                key={stepNumber}
                className={`flex flex-col items-center ${
                  stepNumber === step ? "text-primary" : stepNumber < step ? "text-muted-foreground" : "text-muted-foreground/50"
                }`}
              >
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                    stepNumber === step 
                      ? "bg-primary text-primary-foreground" 
                      : stepNumber < step 
                        ? "bg-primary/20 text-primary" 
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {stepNumber}
                </div>
                <span className="text-sm">
                  {stepNumber === 1 && "Accessibility"}
                  {stepNumber === 2 && "Job Preferences"}
                  {stepNumber === 3 && "Learning Style"}
                  {stepNumber === 4 && "Review"}
                </span>
              </div>
            ))}
          </div>
          
          <Card>
            {step === 1 && (
              <>
                <CardHeader>
                  <CardTitle>Accessibility Needs</CardTitle>
                  <CardDescription>
                    Help us understand your accessibility needs to provide appropriate accommodations.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>Do you have any disabilities or accessibility needs?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {disabilityOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`disability-${option.id}`} 
                            checked={formData.disabilities.includes(option.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleCheckboxChange("disabilities", option.id);
                              } else {
                                handleCheckboxChange("disabilities", option.id);
                              }
                            }}
                          />
                          <Label htmlFor={`disability-${option.id}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="disability-details">Please provide any additional details about your accessibility needs:</Label>
                    <Textarea 
                      id="disability-details" 
                      placeholder="Share any specific accommodations that would help you..."
                      value={formData.disabilityDetails}
                      onChange={(e) => handleInputChange("disabilityDetails", e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <Label>Preferred communication styles:</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {communicationStyleOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`communication-${option.id}`} 
                            checked={formData.communicationStyles.includes(option.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleCheckboxChange("communicationStyles", option.id);
                              } else {
                                handleCheckboxChange("communicationStyles", option.id);
                              }
                            }}
                          />
                          <Label htmlFor={`communication-${option.id}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </>
            )}
            
            {step === 2 && (
              <>
                <CardHeader>
                  <CardTitle>Job Preferences</CardTitle>
                  <CardDescription>
                    Tell us about your job preferences and career goals.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>What type of work environment do you prefer?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {jobPreferenceOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`job-pref-${option.id}`} 
                            checked={formData.jobPreferences.includes(option.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleCheckboxChange("jobPreferences", option.id);
                              } else {
                                handleCheckboxChange("jobPreferences", option.id);
                              }
                            }}
                          />
                          <Label htmlFor={`job-pref-${option.id}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="job-industry">What industry are you interested in?</Label>
                    <Select 
                      value={formData.jobIndustry} 
                      onValueChange={(value) => handleInputChange("jobIndustry", value)}
                    >
                      <SelectTrigger id="job-industry">
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="hospitality">Hospitality</SelectItem>
                        <SelectItem value="government">Government</SelectItem>
                        <SelectItem value="nonprofit">Non-profit</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeframe">When would you like to start working?</Label>
                    <RadioGroup 
                      id="timeframe" 
                      value={formData.timeframe}
                      onValueChange={(value) => handleInputChange("timeframe", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="immediately" id="immediately" />
                        <Label htmlFor="immediately">Immediately</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1-3months" id="1-3months" />
                        <Label htmlFor="1-3months">Within 1-3 months</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="3-6months" id="3-6months" />
                        <Label htmlFor="3-6months">Within 3-6 months</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="6months+" id="6months+" />
                        <Label htmlFor="6months+">More than 6 months</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </CardContent>
              </>
            )}
            
            {step === 3 && (
              <>
                <CardHeader>
                  <CardTitle>Learning & Assistance</CardTitle>
                  <CardDescription>
                    Tell us about your learning style and what assistance you need.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <Label>What learning styles work best for you?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {learningStyleOptions.map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`learning-${option.id}`} 
                            checked={formData.learningStyles.includes(option.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleCheckboxChange("learningStyles", option.id);
                              } else {
                                handleCheckboxChange("learningStyles", option.id);
                              }
                            }}
                          />
                          <Label htmlFor={`learning-${option.id}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <Label>What assistance do you need with your job search?</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { id: "resume", label: "Resume Building" },
                        { id: "interview", label: "Interview Preparation" },
                        { id: "search", label: "Job Search Strategies" },
                        { id: "networking", label: "Networking" },
                        { id: "skills", label: "Skills Development" },
                        { id: "accommodation", label: "Workplace Accommodations" },
                      ].map((option) => (
                        <div key={option.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`assistance-${option.id}`} 
                            checked={formData.assistanceNeeded.includes(option.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleCheckboxChange("assistanceNeeded", option.id);
                              } else {
                                handleCheckboxChange("assistanceNeeded", option.id);
                              }
                            }}
                          />
                          <Label htmlFor={`assistance-${option.id}`}>{option.label}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="additional-info">Is there anything else you'd like to share with your job coach?</Label>
                    <Textarea 
                      id="additional-info" 
                      placeholder="Share any additional information that might help your coach..."
                      value={formData.additionalInfo}
                      onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
                    />
                  </div>
                </CardContent>
              </>
            )}
            
            {step === 4 && (
              <>
                <CardHeader>
                  <CardTitle>Review Your Assessment</CardTitle>
                  <CardDescription>
                    Please review your assessment before submitting.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Accessibility Needs</h3>
                      <div className="mt-2 text-sm">
                        {formData.disabilities.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {formData.disabilities.map((id) => (
                              <span key={id} className="bg-muted px-2 py-1 rounded-md">
                                {disabilityOptions.find(option => option.id === id)?.label}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground">No disabilities selected</p>
                        )}
                      </div>
                      
                      {formData.disabilityDetails && (
                        <div className="mt-2">
                          <p className="text-sm font-medium">Additional details:</p>
                          <p className="text-sm text-muted-foreground">{formData.disabilityDetails}</p>
                        </div>
                      )}
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium">Communication Styles:</p>
                        {formData.communicationStyles.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.communicationStyles.map((id) => (
                              <span key={id} className="bg-muted px-2 py-1 rounded-md text-sm">
                                {communicationStyleOptions.find(option => option.id === id)?.label}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No communication styles selected</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium">Job Preferences</h3>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Work Environment:</p>
                        {formData.jobPreferences.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.jobPreferences.map((id) => (
                              <span key={id} className="bg-muted px-2 py-1 rounded-md text-sm">
                                {jobPreferenceOptions.find(option => option.id === id)?.label}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No preferences selected</p>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium">Industry:</p>
                        <p className="text-sm text-muted-foreground">
                          {formData.jobIndustry ? formData.jobIndustry.charAt(0).toUpperCase() + formData.jobIndustry.slice(1) : "Not specified"}
                        </p>
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium">Timeframe:</p>
                        <p className="text-sm text-muted-foreground">
                          {formData.timeframe === "immediately" && "Immediately"}
                          {formData.timeframe === "1-3months" && "Within 1-3 months"}
                          {formData.timeframe === "3-6months" && "Within 3-6 months"}
                          {formData.timeframe === "6months+" && "More than 6 months"}
                          {!formData.timeframe && "Not specified"}
                        </p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t">
                      <h3 className="font-medium">Learning & Assistance</h3>
                      <div className="mt-2">
                        <p className="text-sm font-medium">Learning Styles:</p>
                        {formData.learningStyles.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.learningStyles.map((id) => (
                              <span key={id} className="bg-muted px-2 py-1 rounded-md text-sm">
                                {learningStyleOptions.find(option => option.id === id)?.label}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No learning styles selected</p>
                        )}
                      </div>
                      
                      <div className="mt-4">
                        <p className="text-sm font-medium">Assistance Needed:</p>
                        {formData.assistanceNeeded.length > 0 ? (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.assistanceNeeded.map((id) => (
                              <span key={id} className="bg-muted px-2 py-1 rounded-md text-sm">
                                {id.charAt(0).toUpperCase() + id.slice(1)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No assistance needs selected</p>
                        )}
                      </div>
                      
                      {formData.additionalInfo && (
                        <div className="mt-4">
                          <p className="text-sm font-medium">Additional Information:</p>
                          <p className="text-sm text-muted-foreground">{formData.additionalInfo}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </>
            )}
            
            <CardFooter className="flex justify-between">
              {step > 1 ? (
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              ) : (
                <div></div>
              )}
              
              {step < 4 ? (
                <Button onClick={nextStep}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit}>
                  Submit Assessment
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
} 