"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { User, Settings, Briefcase, FileText, Calendar, Bell, Shield, LogOut } from "lucide-react";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { settings: accessibilitySettings, updateSettings: updateAccessibilitySettings } = useAccessibility();
  
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    profileImage: "",
    skills: [] as string[],
    education: "",
    experience: "",
    profileComplete: 0,
    accessibility: {
      highContrast: accessibilitySettings.highContrast,
      largeText: accessibilitySettings.largeText,
      reducedMotion: accessibilitySettings.reducedMotion,
      screenReader: accessibilitySettings.screenReader,
      colorBlindMode: accessibilitySettings.colorBlindMode,
    },
    notifications: {
      email: true,
      sms: false,
      jobAlerts: true,
      coachMessages: true,
      applicationUpdates: true,
    },
    privacy: {
      profileVisibility: "coaches",
      shareContactInfo: false,
      allowDataCollection: true,
    },
  });

  // Fetch user data from the API
  useEffect(() => {
    const fetchUserData = async () => {
      if (session?.user?.id) {
        try {
          setLoading(true);
          const response = await fetch(`/api/users/profile?userId=${session.user.id}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          
          const userData = await response.json();
          
          // Calculate profile completion percentage
          const requiredFields = ['firstName', 'lastName', 'email', 'bio', 'location', 'phone'];
          const filledFields = requiredFields.filter(field =>
            userData[field] && userData[field].toString().trim() !== ''
          );
          const profileComplete = Math.round((filledFields.length / requiredFields.length) * 100);
          
          setUserData(prev => ({
            ...prev,
            ...userData,
            profileComplete,
            // Default values for fields not in the database schema
            skills: userData.skills || [],
            education: userData.education || "",
            experience: userData.experience || "",
          }));
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast.error('Failed to load profile data');
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUserData();
  }, [session]);

  // Sync accessibility settings with context
  useEffect(() => {
    setUserData(prev => ({
      ...prev,
      accessibility: {
        highContrast: accessibilitySettings.highContrast,
        largeText: accessibilitySettings.largeText,
        reducedMotion: accessibilitySettings.reducedMotion,
        screenReader: accessibilitySettings.screenReader,
        colorBlindMode: accessibilitySettings.colorBlindMode,
      }
    }));
  }, [accessibilitySettings]);
  
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
            <p className="text-lg">Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  const handleInputChange = (field: string, value: any) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  const handleAccessibilityChange = (field: string, value: any) => {
    // Update both local state and global context
    setUserData((prev) => ({
      ...prev,
      accessibility: {
        ...prev.accessibility,
        [field]: value,
      },
    }));

    // Update the global accessibility context
    if (field === "colorBlindMode") {
      updateAccessibilitySettings({ 
        colorBlindMode: value as "none" | "protanopia" | "deuteranopia" | "tritanopia" | "achromatopsia" 
      });
    } else {
      updateAccessibilitySettings({ [field]: value });
    }
  };
  
  const handleNotificationChange = (field: string, value: any) => {
    setUserData((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [field]: value,
      },
    }));
  };
  
  const handlePrivacyChange = (field: string, value: any) => {
    setUserData((prev) => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value,
      },
    }));
  };
  
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      
      // Prepare the data for update - only include fields that exist in the User model
      const updateData = {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: userData.name || `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        phone: userData.phone,
        bio: userData.bio,
        location: userData.location,
        profileImage: userData.profileImage,
      };
      
      // Send to the API
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      
      const updatedUser = await response.json();
      
      // Update local state with the response
      setUserData(prev => ({
        ...prev,
        ...updatedUser,
      }));
      
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
              <p className="text-muted-foreground mt-2">
                Manage your personal information and preferences.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <p className="font-medium">{userData.firstName} {userData.lastName}</p>
                <p className="text-sm text-muted-foreground">{userData.email}</p>
              </div>
              <Avatar className="h-12 w-12">
                {userData.profileImage ? (
                  <AvatarImage src={userData.profileImage} alt={`${userData.firstName} ${userData.lastName}`} />
                ) : null}
                <AvatarFallback>
                  {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-72 space-y-6">
              <div className="profile-sidebar">
                <div className="space-y-6">
                  {/* Profile Completion */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium">Profile Completion</h3>
                      <span className="text-sm font-medium">{userData.profileComplete}%</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 rounded-full ${
                          userData.profileComplete >= 80 ? 'bg-green-500' :
                          userData.profileComplete >= 50 ? 'bg-blue-500' :
                          'bg-amber-500'
                        }`}
                        style={{ width: `${userData.profileComplete}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Complete your profile to improve job matches</p>
                  </div>

                  {/* Navigation */}
                  <div className="space-y-1">
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                      <a href="#personal-info">
                        <User className="h-4 w-4 mr-3" />
                        Personal Information
                      </a>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                      <a href="#accessibility">
                        <Settings className="h-4 w-4 mr-3" />
                        Accessibility
                      </a>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                      <a href="#experience">
                        <Briefcase className="h-4 w-4 mr-3" />
                        Experience
                      </a>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                      <a href="#resumes">
                        <FileText className="h-4 w-4 mr-3" />
                        Resumes
                      </a>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                      <a href="#calendar">
                        <Calendar className="h-4 w-4 mr-3" />
                        Calendar
                      </a>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                      <a href="#notifications">
                        <Bell className="h-4 w-4 mr-3" />
                        Notifications
                      </a>
                    </Button>
                    <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 hover:text-primary transition-colors" asChild>
                      <a href="#privacy">
                        <Shield className="h-4 w-4 mr-3" />
                        Privacy
                      </a>
                    </Button>
                  </div>
                </div>

                {/* Sign Out Button */}
                <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/50"
                    onClick={() => signOut()}
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex-1 space-y-8">
              <div id="personal-info" className="card-gradient rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Personal Information</h3>
                      <p className="text-sm text-muted-foreground">Update your personal details and contact information</p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName" className="text-sm font-medium">First Name</Label>
                        <Input
                          id="firstName"
                          value={userData.firstName}
                          onChange={(e) => handleInputChange("firstName", e.target.value)}
                          className="mt-2"
                          placeholder="Enter your first name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName" className="text-sm font-medium">Last Name</Label>
                        <Input
                          id="lastName"
                          value={userData.lastName}
                          onChange={(e) => handleInputChange("lastName", e.target.value)}
                          className="mt-2"
                          placeholder="Enter your last name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="mt-2"
                          placeholder="your.email@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={userData.phone}
                          onChange={(e) => handleInputChange("phone", e.target.value)}
                          className="mt-2"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="location" className="text-sm font-medium">Location</Label>
                        <Input
                          id="location"
                          value={userData.location}
                          onChange={(e) => handleInputChange("location", e.target.value)}
                          className="mt-2"
                          placeholder="City, State, Country"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="bio" className="text-sm font-medium">Professional Bio</Label>
                        <Textarea
                          id="bio"
                          rows={4}
                          value={userData.bio}
                          onChange={(e) => handleInputChange("bio", e.target.value)}
                          className="mt-2 resize-none"
                          placeholder="Tell us about yourself, your career goals, and what you're looking for in a job."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-muted-foreground">
                      Last updated: {new Date().toLocaleDateString()}
                    </p>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="min-w-[120px]"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </div>
              </div>
              
              <Card id="accessibility">
                <CardHeader>
                  <CardTitle>Accessibility Settings</CardTitle>
                  <CardDescription>
                    Customize your experience to meet your accessibility needs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="display">
                    <TabsList className="grid grid-cols-3 w-full md:w-auto">
                      <TabsTrigger value="display">Display</TabsTrigger>
                      <TabsTrigger value="reading">Reading</TabsTrigger>
                      <TabsTrigger value="interaction">Interaction</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="display" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="high-contrast">High Contrast</Label>
                          <p className="text-sm text-muted-foreground">
                            Increase contrast between text and background
                          </p>
                        </div>
                        <Switch 
                          id="high-contrast" 
                          checked={userData.accessibility.highContrast}
                          onCheckedChange={(checked) => handleAccessibilityChange("highContrast", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="large-text">Large Text</Label>
                          <p className="text-sm text-muted-foreground">
                            Increase text size throughout the application
                          </p>
                        </div>
                        <Switch 
                          id="large-text" 
                          checked={userData.accessibility.largeText}
                          onCheckedChange={(checked) => handleAccessibilityChange("largeText", checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="color-blind-mode">Color Blind Mode</Label>
                          <p className="text-sm text-muted-foreground">
                            Adjust colors for different types of color blindness
                          </p>
                        </div>
                        <select 
                          id="color-blind-mode"
                          className="p-2 border rounded-md"
                          value={userData.accessibility.colorBlindMode}
                          onChange={(e) => handleAccessibilityChange("colorBlindMode", e.target.value)}
                        >
                          <option value="none">None</option>
                          <option value="protanopia">Protanopia (Red-Blind)</option>
                          <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                          <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                          <option value="achromatopsia">Achromatopsia (Monochromacy)</option>
                        </select>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="reading" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="screen-reader">Screen Reader Support</Label>
                          <p className="text-sm text-muted-foreground">
                            Optimize content for screen readers
                          </p>
                        </div>
                        <Switch 
                          id="screen-reader" 
                          checked={userData.accessibility.screenReader}
                          onCheckedChange={(checked) => handleAccessibilityChange("screenReader", checked)}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="interaction" className="space-y-4 mt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label htmlFor="reduced-motion">Reduced Motion</Label>
                          <p className="text-sm text-muted-foreground">
                            Minimize animations and transitions
                          </p>
                        </div>
                        <Switch 
                          id="reduced-motion" 
                          checked={userData.accessibility.reducedMotion}
                          onCheckedChange={(checked) => handleAccessibilityChange("reducedMotion", checked)}
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardFooter>
              </Card>
              
              <Card id="notifications">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control how and when you receive notifications.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch 
                      id="email-notifications" 
                      checked={userData.notifications.email}
                      onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via text message
                      </p>
                    </div>
                    <Switch 
                      id="sms-notifications" 
                      checked={userData.notifications.sms}
                      onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="job-alerts">Job Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about new job matches
                      </p>
                    </div>
                    <Switch 
                      id="job-alerts" 
                      checked={userData.notifications.jobAlerts}
                      onCheckedChange={(checked) => handleNotificationChange("jobAlerts", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="coach-messages">Coach Messages</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about messages from coaches
                      </p>
                    </div>
                    <Switch 
                      id="coach-messages" 
                      checked={userData.notifications.coachMessages}
                      onCheckedChange={(checked) => handleNotificationChange("coachMessages", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="application-updates">Application Updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications about your job applications
                      </p>
                    </div>
                    <Switch 
                      id="application-updates" 
                      checked={userData.notifications.applicationUpdates}
                      onCheckedChange={(checked) => handleNotificationChange("applicationUpdates", checked)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveProfile}>Save Preferences</Button>
                </CardFooter>
              </Card>
              
              <Card id="privacy">
                <CardHeader>
                  <CardTitle>Privacy Settings</CardTitle>
                  <CardDescription>
                    Control who can see your information and how it's used.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="profile-visibility">Profile Visibility</Label>
                    <select 
                      id="profile-visibility"
                      className="w-full p-2 border rounded-md"
                      value={userData.privacy.profileVisibility}
                      onChange={(e) => handlePrivacyChange("profileVisibility", e.target.value)}
                    >
                      <option value="public">Public - Visible to everyone</option>
                      <option value="coaches">Coaches Only - Visible to coaches and admins</option>
                      <option value="private">Private - Visible only to you and admins</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="share-contact">Share Contact Information</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow coaches and employers to see your contact information
                      </p>
                    </div>
                    <Switch 
                      id="share-contact" 
                      checked={userData.privacy.shareContactInfo}
                      onCheckedChange={(checked) => handlePrivacyChange("shareContactInfo", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-collection">Data Collection</Label>
                      <p className="text-sm text-muted-foreground">
                        Allow us to collect data to improve your experience
                      </p>
                    </div>
                    <Switch 
                      id="data-collection" 
                      checked={userData.privacy.allowDataCollection}
                      onCheckedChange={(checked) => handlePrivacyChange("allowDataCollection", checked)}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSaveProfile}>Save Preferences</Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 