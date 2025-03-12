 "use client";

import { useState } from "react";
import { MainLayout } from "@/components/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Filter, Search, Star, Calendar, MessageSquare } from "lucide-react";

// Mock coach data
const mockCoaches = [
  {
    id: "coach-1",
    name: "Sarah Johnson",
    avatar: "/avatars/sarah.jpg",
    title: "Career Transition Specialist",
    rating: 4.9,
    reviewCount: 127,
    specialties: ["Career Transitions", "Resume Building", "Interview Preparation"],
    communicationMethods: ["Video", "Text", "Voice"],
    accessibilitySkills: ["Sign Language (ASL)", "Screen Reader Experience", "Cognitive Accessibility"],
    disabilityExpertise: ["Visual Impairments", "Hearing Impairments", "Cognitive Disabilities"],
    availability: "Available next week",
    successRate: "92% job placement",
    bio: "With over 10 years of experience helping individuals with disabilities find meaningful employment, I specialize in career transitions and interview preparation. I'm fluent in ASL and experienced with various assistive technologies.",
  },
  {
    id: "coach-2",
    name: "Michael Chen",
    avatar: "/avatars/michael.jpg",
    title: "Technical Interview Coach",
    rating: 4.8,
    reviewCount: 93,
    specialties: ["Technical Interviews", "Software Development", "Remote Work Preparation"],
    communicationMethods: ["Video", "Text"],
    accessibilitySkills: ["Screen Reader Experience", "Alternative Input Devices", "Simplified Language"],
    disabilityExpertise: ["Mobility Impairments", "ADHD", "Autism Spectrum"],
    availability: "Available this week",
    successRate: "88% job placement",
    bio: "As a former tech recruiter and software developer with ADHD, I understand the challenges of technical interviews. I specialize in helping neurodivergent individuals showcase their talents and secure positions in the tech industry.",
  },
  {
    id: "coach-3",
    name: "Amara Washington",
    avatar: "/avatars/amara.jpg",
    title: "Workplace Accommodations Specialist",
    rating: 4.7,
    reviewCount: 85,
    specialties: ["Workplace Accommodations", "Job Search Strategies", "Disability Disclosure"],
    communicationMethods: ["Video", "Text", "Voice"],
    accessibilitySkills: ["Sign Language (ASL)", "Simplified Language", "Alternative Communication Methods"],
    disabilityExpertise: ["Hearing Impairments", "Speech Disabilities", "Learning Disabilities"],
    availability: "Limited availability",
    successRate: "90% accommodation success",
    bio: "I focus on helping clients navigate workplace accommodations and disability disclosure conversations. With a background in HR and disability advocacy, I provide practical strategies for securing and maintaining employment.",
  },
  {
    id: "coach-4",
    name: "David Rodriguez",
    avatar: "/avatars/david.jpg",
    title: "Remote Work Specialist",
    rating: 4.9,
    reviewCount: 112,
    specialties: ["Remote Work Strategies", "Digital Accessibility", "Productivity Tools"],
    communicationMethods: ["Video", "Text"],
    accessibilitySkills: ["Screen Reader Experience", "Alternative Input Devices", "Cognitive Accessibility"],
    disabilityExpertise: ["Mobility Impairments", "Chronic Illness", "Visual Impairments"],
    availability: "Available this week",
    successRate: "94% job placement",
    bio: "Specializing in remote work opportunities, I help clients with mobility impairments and chronic illnesses find flexible employment. I'm experienced with digital accessibility tools and remote collaboration platforms.",
  },
  {
    id: "coach-5",
    name: "Priya Patel",
    avatar: "/avatars/priya.jpg",
    title: "Neurodiversity Employment Specialist",
    rating: 4.8,
    reviewCount: 76,
    specialties: ["Neurodiversity in the Workplace", "Sensory-Friendly Environments", "Executive Functioning"],
    communicationMethods: ["Text", "Voice"],
    accessibilitySkills: ["Simplified Language", "Alternative Communication Methods", "Cognitive Accessibility"],
    disabilityExpertise: ["Autism Spectrum", "ADHD", "Learning Disabilities"],
    availability: "Available next week",
    successRate: "89% job placement",
    bio: "As an autistic professional, I specialize in helping neurodivergent individuals navigate the job market. I focus on identifying strengths, developing coping strategies, and finding inclusive employers.",
  },
];

export default function CoachesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    specialty: "",
    communicationMethod: "",
    disabilityExpertise: [] as string[],
  });
  const [showFilters, setShowFilters] = useState(false);
  
  // Filter coaches based on search term and filters
  const filteredCoaches = mockCoaches.filter((coach) => {
    // Search term filter
    const searchMatch = 
      coach.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coach.specialties.some(specialty => 
        specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    
    // Specialty filter
    const specialtyMatch = !filters.specialty || coach.specialties.includes(filters.specialty);
    
    // Communication method filter
    const communicationMatch = !filters.communicationMethod || 
      coach.communicationMethods.includes(filters.communicationMethod);
    
    // Disability expertise filter
    const expertiseMatch = 
      filters.disabilityExpertise.length === 0 || 
      filters.disabilityExpertise.some(expertise => 
        coach.disabilityExpertise.some(coachExpertise => 
          coachExpertise.toLowerCase().includes(expertise.toLowerCase())
        )
      );
    
    return searchMatch && specialtyMatch && communicationMatch && expertiseMatch;
  });
  
  const handleExpertiseFilterChange = (expertise: string) => {
    setFilters(prev => {
      const currentExpertise = [...prev.disabilityExpertise];
      
      if (currentExpertise.includes(expertise)) {
        return {
          ...prev,
          disabilityExpertise: currentExpertise.filter(e => e !== expertise),
        };
      } else {
        return {
          ...prev,
          disabilityExpertise: [...currentExpertise, expertise],
        };
      }
    });
  };
  
  return (
    <MainLayout>
      <div className="container py-10">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Job Coaches</h1>
            <p className="text-muted-foreground mt-2">
              Connect with specialized coaches who understand your unique needs and can help you achieve your career goals.
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search coaches by name, specialty, or keywords..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
          
          {showFilters && (
            <Card>
              <CardHeader>
                <CardTitle>Filter Coaches</CardTitle>
                <CardDescription>
                  Find coaches that match your specific needs and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty</Label>
                    <Select 
                      value={filters.specialty} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, specialty: value }))}
                    >
                      <SelectTrigger id="specialty">
                        <SelectValue placeholder="Select specialty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Specialties</SelectItem>
                        <SelectItem value="Career Transitions">Career Transitions</SelectItem>
                        <SelectItem value="Resume Building">Resume Building</SelectItem>
                        <SelectItem value="Interview Preparation">Interview Preparation</SelectItem>
                        <SelectItem value="Technical Interviews">Technical Interviews</SelectItem>
                        <SelectItem value="Workplace Accommodations">Workplace Accommodations</SelectItem>
                        <SelectItem value="Remote Work Strategies">Remote Work Strategies</SelectItem>
                        <SelectItem value="Neurodiversity in the Workplace">Neurodiversity in the Workplace</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="communication">Communication Method</Label>
                    <Select 
                      value={filters.communicationMethod} 
                      onValueChange={(value) => setFilters(prev => ({ ...prev, communicationMethod: value }))}
                    >
                      <SelectTrigger id="communication">
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Methods</SelectItem>
                        <SelectItem value="Video">Video</SelectItem>
                        <SelectItem value="Text">Text</SelectItem>
                        <SelectItem value="Voice">Voice</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Disability Expertise</Label>
                    <div className="grid grid-cols-1 gap-2">
                      {["Visual Impairments", "Hearing Impairments", "Mobility Impairments", "Cognitive Disabilities", "Autism Spectrum", "ADHD"].map((expertise) => (
                        <div key={expertise} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`expertise-${expertise}`} 
                            checked={filters.disabilityExpertise.includes(expertise)}
                            onCheckedChange={() => handleExpertiseFilterChange(expertise)}
                          />
                          <Label htmlFor={`expertise-${expertise}`}>{expertise}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setFilters({ specialty: "", communicationMethod: "", disabilityExpertise: [] })}
                >
                  Reset Filters
                </Button>
                <Button onClick={() => setShowFilters(false)}>
                  Apply Filters
                </Button>
              </CardFooter>
            </Card>
          )}
          
          <div className="grid grid-cols-1 gap-6">
            {filteredCoaches.length > 0 ? (
              filteredCoaches.map((coach) => (
                <Card key={coach.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 border-2 border-primary/10">
                          <AvatarImage src={coach.avatar} alt={coach.name} />
                          <AvatarFallback>{coach.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle>{coach.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {coach.title}
                          </CardDescription>
                          <div className="flex items-center mt-1 text-sm">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            <span>{coach.rating}</span>
                            <span className="text-muted-foreground ml-1">({coach.reviewCount} reviews)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button variant="outline" size="sm" className="gap-1">
                          <Calendar className="h-4 w-4" />
                          Schedule
                        </Button>
                        <Button variant="outline" size="sm" className="gap-1">
                          <MessageSquare className="h-4 w-4" />
                          Message
                        </Button>
                        <Button asChild size="sm">
                          <a href={`/coaches/${coach.id}`}>View Profile</a>
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{coach.bio}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Specialties:</h4>
                        <div className="flex flex-wrap gap-2">
                          {coach.specialties.map((specialty, index) => (
                            <Badge key={index} variant="secondary">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Disability Expertise:</h4>
                        <div className="flex flex-wrap gap-2">
                          {coach.disabilityExpertise.map((expertise, index) => (
                            <Badge key={index} variant="outline">
                              {expertise}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Accessibility Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {coach.accessibilitySkills.map((skill, index) => (
                            <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Communication Methods:</h4>
                        <div className="flex flex-wrap gap-2">
                          {coach.communicationMethods.map((method, index) => (
                            <Badge key={index} variant="outline">
                              {method}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="bg-muted/50 flex flex-col sm:flex-row justify-between gap-2">
                    <div className="text-sm">
                      <span className="font-medium">{coach.availability}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">{coach.successRate}</span>
                    </div>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium">No coaches found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search or filters to find more coaches.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}