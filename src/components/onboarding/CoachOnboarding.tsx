import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MultiSelect } from "@/components/ui/multi-select";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { ChevronLeft, ChevronRight } from "lucide-react";

type OnboardingData = {
  bio: string;
  expertise: string[];
  specialties: string[];
  yearsExperience: number;
  industries: string[];
  coachingStyle: string;
  hourlyRate: number;
  availability: string[];
  languages: string[];
  certifications: string[];
  profileComplete: boolean;
};

export function CoachOnboarding() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const { toast } = useToast();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const totalSteps = 4;
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    bio: "",
    expertise: [],
    specialties: [],
    yearsExperience: 0,
    industries: [],
    coachingStyle: "",
    hourlyRate: 0,
    availability: [],
    languages: [],
    certifications: [],
    profileComplete: false
  });

  const handleChange = (field: keyof OnboardingData, value: string | number | string[] | boolean) => {
    setOnboardingData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStep = (): boolean => {
    setError("");

    switch (currentStep) {
      case 1:
        if (!onboardingData.bio.trim()) {
          setError("Please provide a bio");
          return false;
        }
        if (onboardingData.expertise.length === 0) {
          setError("Please select at least one area of expertise");
          return false;
        }
        return true;

      case 2:
        if (!onboardingData.yearsExperience) {
          setError("Please enter your years of experience");
          return false;
        }
        if (onboardingData.industries.length === 0) {
          setError("Please select at least one industry");
          return false;
        }
        if (!onboardingData.coachingStyle) {
          setError("Please select your coaching style");
          return false;
        }
        return true;

      case 3:
        if (!onboardingData.hourlyRate) {
          setError("Please set your hourly rate");
          return false;
        }
        if (onboardingData.availability.length === 0) {
          setError("Please select your availability");
          return false;
        }
        return true;

      case 4:
        if (onboardingData.languages.length === 0) {
          setError("Please select at least one language");
          return false;
        }
        return true;
    }

    return true;
  };

  const handleStepAction = () => {
    if (!validateStep()) {
      return;
    }
    
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch('/api/coach/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...onboardingData,
          profileComplete: true
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      toast({
        title: "Profile Updated",
        description: "Your coach profile has been completed successfully.",
      });

      // Update session to reflect profile completion
      await update();

      // Redirect to coach dashboard
      router.push('/coach/dashboard');
    } catch (err) {
      console.error("Profile update error:", err);
      setError(err instanceof Error ? err.message : "Failed to update profile");
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Complete Your Coach Profile</CardTitle>
        <CardDescription>
          Help us match you with the right job seekers by completing your profile
        </CardDescription>
        <Progress value={progressPercentage} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bio">Professional Bio</Label>
              <Textarea
                id="bio"
                value={onboardingData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                placeholder="Tell us about your coaching experience and approach..."
                className="min-h-32"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expertise">Areas of Expertise</Label>
              <MultiSelect
                value={onboardingData.expertise}
                onChange={(value) => handleChange("expertise", value)}
                options={[
                  "Career Transition",
                  "Leadership Development",
                  "Interview Preparation",
                  "Resume Writing",
                  "Networking",
                  "Personal Branding",
                  "Salary Negotiation",
                  "Work-Life Balance",
                  "Professional Development",
                  "Executive Coaching"
                ]}
                placeholder="Select your areas of expertise"
              />
            </div>
          </div>
        )}

        {/* Step 2: Experience */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="yearsExperience">Years of Experience</Label>
              <Input
                id="yearsExperience"
                type="number"
                min="0"
                value={onboardingData.yearsExperience}
                onChange={(e) => handleChange("yearsExperience", parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industries">Industries</Label>
              <MultiSelect
                value={onboardingData.industries}
                onChange={(value) => handleChange("industries", value)}
                options={[
                  "Technology",
                  "Healthcare",
                  "Finance",
                  "Education",
                  "Manufacturing",
                  "Retail",
                  "Consulting",
                  "Non-profit",
                  "Government",
                  "Other"
                ]}
                placeholder="Select industries you specialize in"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="coachingStyle">Coaching Style</Label>
              <Select
                value={onboardingData.coachingStyle}
                onValueChange={(value) => handleChange("coachingStyle", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your coaching style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="directive">Directive</SelectItem>
                  <SelectItem value="holistic">Holistic</SelectItem>
                  <SelectItem value="supportive">Supportive</SelectItem>
                  <SelectItem value="challenging">Challenging</SelectItem>
                  <SelectItem value="analytical">Analytical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {/* Step 3: Availability & Rates */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
              <Input
                id="hourlyRate"
                type="number"
                min="0"
                step="10"
                value={onboardingData.hourlyRate}
                onChange={(e) => handleChange("hourlyRate", parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="availability">Availability</Label>
              <MultiSelect
                value={onboardingData.availability}
                onChange={(value) => handleChange("availability", value)}
                options={[
                  "Weekday Mornings",
                  "Weekday Afternoons",
                  "Weekday Evenings",
                  "Weekend Mornings",
                  "Weekend Afternoons",
                  "Weekend Evenings",
                  "Flexible"
                ]}
                placeholder="Select your availability"
              />
            </div>
          </div>
        )}

        {/* Step 4: Qualifications */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="languages">Languages</Label>
              <MultiSelect
                value={onboardingData.languages}
                onChange={(value) => handleChange("languages", value)}
                options={[
                  "English",
                  "Spanish",
                  "French",
                  "German",
                  "Mandarin",
                  "Japanese",
                  "Korean",
                  "Arabic",
                  "Hindi",
                  "Other"
                ]}
                placeholder="Select languages you can coach in"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certifications">Certifications</Label>
              <MultiSelect
                value={onboardingData.certifications}
                onChange={(value) => handleChange("certifications", value)}
                options={[
                  "ICF ACC",
                  "ICF PCC",
                  "ICF MCC",
                  "CPCC",
                  "BCC",
                  "SHRM-CP",
                  "SHRM-SCP",
                  "Other"
                ]}
                placeholder="Select your certifications"
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        {currentStep > 1 ? (
          <Button
            type="button"
            variant="outline"
            onClick={goToPreviousStep}
            className="flex items-center"
          >
            <ChevronLeft className="h-4 w-4 mr-2" /> Back
          </Button>
        ) : (
          <div></div>
        )}

        <Button
          type="button"
          onClick={handleStepAction}
          disabled={isLoading}
          className="flex items-center"
        >
          {currentStep < totalSteps ? (
            <>Next <ChevronRight className="h-4 w-4 ml-2" /></>
          ) : (
            isLoading ? "Saving..." : "Complete Profile"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
} 