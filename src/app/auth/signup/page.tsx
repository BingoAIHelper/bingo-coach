"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAccessibility } from "@/context/AccessibilityContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AccessibilityWidget } from "@/components/AccessibilityWidget";
import { AccessibilityOnboarding } from "@/components/AccessibilityOnboarding";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultRole = searchParams.get("role") === "coach" ? "coach" : "seeker";
  const { settings, speakText } = useAccessibility();
  
  // Form data across all steps
  const [formData, setFormData] = useState({
    role: defaultRole as "seeker" | "coach",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    location: "",
    phone: "",
    agreeToTerms: false
  });
  
  // UI state
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const totalSteps = 4;

  // Handle form field changes
  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Announce step content for screen readers
  useEffect(() => {
    if (settings.autoReadContent) {
      const stepTexts = [
        "Step 1: Account Type. Choose whether you are a job seeker or a job coach.",
        "Step 2: Basic Information. Enter your name, email and create a password.",
        "Step 3: Profile Details. Add information about yourself that will help create your profile.",
        "Step 4: Accessibility Preferences. Customize your experience to meet your accessibility needs."
      ];
      
      speakText(stepTexts[currentStep - 1]);
    }
  }, [currentStep, settings.autoReadContent, speakText]);

  // Handle step navigation
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Validate the current step before proceeding
  const validateStep = (): boolean => {
    setError("");

    switch (currentStep) {
      case 1:
        // Account type step - always valid since we have a default
        return true;
      
      case 2:
        // Basic information validation
        if (!formData.firstName.trim()) {
          setError("First name is required");
          return false;
        }
        if (!formData.lastName.trim()) {
          setError("Last name is required");
          return false;
        }
        if (!formData.email.trim()) {
          setError("Email is required");
          return false;
        }
        if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
          setError("Please enter a valid email address");
          return false;
        }
        if (!formData.password) {
          setError("Password is required");
          return false;
        }
        if (formData.password.length < 8) {
          setError("Password must be at least 8 characters long");
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          setError("Passwords do not match");
          return false;
        }
        return true;
      
      case 3:
        // Profile details - these are optional so always valid
        return true;
      
      case 4:
        // Terms agreement
        if (!formData.agreeToTerms) {
          setError("You must agree to the Terms of Service and Privacy Policy");
          return false;
        }
        return true;
    }

    return true;
  };

  // Handle step button click
  const handleStepAction = () => {
    if (!validateStep()) {
      return;
    }
    
    if (currentStep < totalSteps) {
      goToNextStep();
    } else {
      handleSubmit();
    }
  };

  // Handle submission of the entire form
  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Call the registration API
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          role: formData.role,
          bio: formData.bio || undefined,
          location: formData.location || undefined,
          phone: formData.phone || undefined
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      console.log('Registration successful:', data);
      
      // Announce success to screen readers
      if (settings.textToSpeech) {
        speakText("Account created successfully. Redirecting to sign in page.");
      }
      
      // Redirect to sign in page after successful registration
      // Use window.location to bypass middleware and prevent redirect loops
      window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(`/${formData.role}/assessment`)}`;
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "An error occurred during registration. Please try again.");
      setIsLoading(false);
      
      // Announce error to screen readers
      if (settings.textToSpeech) {
        speakText("Registration error: " + (err instanceof Error ? err.message : "An error occurred during registration. Please try again."));
      }
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
      e.preventDefault();
      handleStepAction();
    }
  };

  // Compute progress percentage
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="flex flex-col min-h-screen" onKeyDown={handleKeyDown}>
      <Header />
      
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <Card className="w-full max-w-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
            <CardDescription>
              Sign up to start your journey with Bingo
            </CardDescription>
            <Progress value={progressPercentage} className="h-2" aria-label={`Step ${currentStep} of ${totalSteps}`} />
          </CardHeader>
          
          <CardContent className="pt-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4" role="alert">
                {error}
              </div>
            )}
            
            {/* Step 1: Account Type */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Step 1: Choose Account Type</h2>
                <p className="text-sm text-muted-foreground">
                  Are you looking for a job or are you a job coach?
                </p>
                
                <Tabs
                  defaultValue={formData.role}
                  onValueChange={(value) => handleChange("role", value as "seeker" | "coach")}
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="seeker">Job Seeker</TabsTrigger>
                    <TabsTrigger value="coach">Job Coach</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="seeker" className="p-4 border rounded-md mt-4">
                    <h3 className="font-medium">Job Seeker Account</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Find job opportunities, get personalized recommendations, and connect with job coaches.
                    </p>
                  </TabsContent>
                  
                  <TabsContent value="coach" className="p-4 border rounded-md mt-4">
                    <h3 className="font-medium">Job Coach Account</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Help job seekers find opportunities, provide career advice, and offer resume reviews.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            
            {/* Step 2: Basic Information */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Step 2: Basic Information</h2>
                <p className="text-sm text-muted-foreground">
                  Enter your name, email and create a password.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => handleChange("firstName", e.target.value)}
                      required
                      aria-required="true"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => handleChange("lastName", e.target.value)}
                      required
                      aria-required="true"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    required
                    aria-required="true"
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    required
                    aria-required="true"
                  />
                </div>
              </div>
            )}
            
            {/* Step 3: Profile Details */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Step 3: Profile Details</h2>
                <p className="text-sm text-muted-foreground">
                  Tell us more about yourself. These details will help us personalize your experience.
                </p>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    placeholder="Tell us about yourself, your skills, experience, or what you're looking for..."
                    value={formData.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                    className="min-h-24"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    placeholder="City, State, Country"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(123) 456-7890"
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
              </div>
            )}
            
            {/* Step 4: Accessibility Preferences */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Step 4: Finish Up</h2>
                <p className="text-sm text-muted-foreground">
                  Review your information and agree to the terms.
                </p>
                
                <div className="p-4 border rounded-md bg-muted/30">
                  <h3 className="font-medium mb-2">Account Summary</h3>
                  <p className="text-sm"><strong>Name:</strong> {formData.firstName} {formData.lastName}</p>
                  <p className="text-sm"><strong>Email:</strong> {formData.email}</p>
                  <p className="text-sm"><strong>Account Type:</strong> {formData.role === "seeker" ? "Job Seeker" : "Job Coach"}</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="terms"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    checked={formData.agreeToTerms}
                    onChange={(e) => handleChange("agreeToTerms", e.target.checked)}
                    required
                    aria-required="true"
                  />
                  <Label htmlFor="terms" className="text-sm font-normal">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                
                <div className="mt-4">
                  <h3 className="font-medium mb-2">Accessibility Preferences</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    After signing up, you can customize your accessibility preferences. You'll be guided through our accessibility settings to ensure the best experience.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4">
            <div className="flex justify-between w-full">
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
                <div></div> // Empty div to maintain layout
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
                  isLoading ? "Creating Account..." : "Create Account"
                )}
              </Button>
            </div>
            
            {currentStep === 1 && (
              <>
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/auth/signin" className="text-primary hover:underline">
                    Sign in
                  </Link>
                </div>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-muted"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" type="button" className="w-full">
                    Microsoft
                  </Button>
                  <Button variant="outline" type="button" className="w-full">
                    Google
                  </Button>
                </div>
              </>
            )}
          </CardFooter>
        </Card>
      </main>
      
      <Footer />
      <AccessibilityWidget />
      <AccessibilityOnboarding />
    </div>
  );
}