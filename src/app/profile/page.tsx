"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useAccessibility } from "@/context/AccessibilityContext";
import { MainLayout } from "@/components/MainLayout";
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
            <div className="md:w-64 space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${userData.profileComplete}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{userData.profileComplete}%</span>
                    </div>
                    <p className="text-sm text-muted-foreground">Profile completion</p>
                  </div>
                </CardContent>
              </Card>
              
              <div className="space-y-1">
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="#personal-info">
                    <User className="h-4 w-4 mr-2" />
                    Personal Information
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="#accessibility">
                    <Settings className="h-4 w-4 mr-2" />
                    Accessibility
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="#experience">
                    <Briefcase className="h-4 w-4 mr-2" />
                    Experience
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="#resumes">
                    <FileText className="h-4 w-4 mr-2" />
                    Resumes
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="#calendar">
                    <Calendar className="h-4 w-4 mr-2" />
                    Calendar
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="#notifications">
                    <Bell className="h-4 w-4 mr-2" />
                    Notifications
                  </a>
                </Button>
                <Button variant="ghost" className="w-full justify-start" asChild>
                  <a href="#privacy">
                    <Shield className="h-4 w-4 mr-2" />
                    Privacy
                  </a>
                </Button>
              </div>
              
              <Button variant="outline" className="w-full" onClick={() => signOut()}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
            
            <div className="flex-1 space-y-8">
              <Card id="personal-info">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details and contact information.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={userData.firstName}
                        onChange={(e) => handleInputChange("firstName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={userData.lastName}
                        onChange={(e) => handleInputChange("lastName", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={userData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input 
                        id="phone" 
                        type="tel" 
                        value={userData.phone}
                        onChange={(e) => handleInputChange("phone", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input 
                        id="location" 
                        value={userData.location}
                        onChange={(e) => handleInputChange("location", e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea 
                      id="bio" 
                      rows={4}
                      value={userData.bio}
                      onChange={(e) => handleInputChange("bio", e.target.value)}
                      placeholder="Tell us about yourself, your career goals, and what you're looking for in a job."
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </Card>
              
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