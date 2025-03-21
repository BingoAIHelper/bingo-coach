'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Award, Target, Loader2, MessageSquare, Users, Star } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { redirect } from "next/navigation";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Coach {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  location?: string;
  expertise?: string[];
  specialties?: string[];
  industries?: string[];
  yearsExperience?: number;
  certifications?: string[];
  coachingStyle?: string;
  bio?: string;
  matchScore?: number;
  matchReason?: string;
  matchStatus?: string;
  rating?: number;
  totalReviews?: number;
  availability?: string[];
  conversationId?: string;
}

export default function SeekerCoachesPage() {
  const { data: session, status } = useSession();
  const [existingMatches, setExistingMatches] = useState<Coach[]>([]);
  const [recommendedCoaches, setRecommendedCoaches] = useState<Coach[]>([]);
  const [availableCoaches, setAvailableCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  // Redirect if user is not a seeker
  if (session?.user?.role === "coach") {
    redirect("/coach/dashboard");
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/coach-matching');
        const data = await response.json();
        
        // Transform existing matches into coach objects
        const matchedCoaches = data.existingMatches.map((match: any) => ({
          id: match.coach.id,
          name: match.coach.name,
          title: match.coach.title || '',
          avatar: match.coach.avatar || '',
          location: match.coach.location || '',
          expertise: match.coach.expertise ? JSON.parse(match.coach.expertise) : [],
          specialties: match.coach.specialties ? JSON.parse(match.coach.specialties) : [],
          industries: match.coach.industries ? JSON.parse(match.coach.industries) : [],
          yearsExperience: match.coach.yearsExperience,
          certifications: match.coach.certifications ? JSON.parse(match.coach.certifications) : [],
          coachingStyle: match.coach.coachingStyle,
          bio: match.coach.bio,
          matchScore: match.matchScore,
          matchReason: match.matchReason,
          matchStatus: match.status,
          rating: match.coach.rating || 4.5,
          totalReviews: match.coach.totalReviews || Math.floor(Math.random() * 50) + 1,
          availability: match.coach.availability ? JSON.parse(match.coach.availability) : [],
          conversationId: match.conversation?.id
        }));

        // Transform recommended matches into coach objects
        const recommendedCoaches = data.recommendedMatches.map((match: any) => ({
          id: match.coachId,
          name: match.coach?.name || '',
          title: match.coach?.title || '',
          avatar: match.coach?.avatar || '',
          location: match.coach?.location || '',
          expertise: match.coach?.expertise ? JSON.parse(match.coach?.expertise) : [],
          specialties: match.coach?.specialties ? JSON.parse(match.coach?.specialties) : [],
          industries: match.coach?.industries ? JSON.parse(match.coach?.industries) : [],
          yearsExperience: match.coach?.yearsExperience,
          certifications: match.coach?.certifications ? JSON.parse(match.coach?.certifications) : [],
          coachingStyle: match.coach?.coachingStyle,
          bio: match.coach?.bio,
          matchScore: match.matchScore,
          matchReason: match.matchReason,
          rating: match.coach?.rating || 4.5,
          totalReviews: match.coach?.totalReviews || Math.floor(Math.random() * 50) + 1,
          availability: match.coach?.availability ? JSON.parse(match.coach?.availability) : []
        }));

        // Transform available coaches into coach objects
        const availableCoachObjects = data.availableUsers.map((coach: any) => ({
          id: coach.id,
          name: coach.name,
          title: coach.title || '',
          avatar: coach.avatar || '',
          location: coach.location || '',
          expertise: coach.expertise ? JSON.parse(coach.expertise) : [],
          specialties: coach.specialties ? JSON.parse(coach.specialties) : [],
          industries: coach.industries ? JSON.parse(coach.industries) : [],
          yearsExperience: coach.yearsExperience,
          certifications: coach.certifications ? JSON.parse(coach.certifications) : [],
          coachingStyle: coach.coachingStyle,
          bio: coach.bio,
          rating: coach.rating || 4.5,
          totalReviews: coach.totalReviews || Math.floor(Math.random() * 50) + 1,
          availability: coach.availability ? JSON.parse(coach.availability) : []
        }));

        setExistingMatches(matchedCoaches);
        setRecommendedCoaches(recommendedCoaches);
        setAvailableCoaches(availableCoachObjects);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load coaches. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const CoachCard = ({ coach, isRecommended = false, isMatched = false }: { coach: Coach; isRecommended?: boolean; isMatched?: boolean }) => {
    const [isRequesting, setIsRequesting] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();

    const handleMatchRequest = async () => {
      if (!session?.user?.id) return;
      
      setIsRequesting(true);
      try {
        const response = await fetch('/api/match-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coachId: coach.id,
            seekerId: session.user.id,
            matchScore: coach.matchScore,
            matchReason: coach.matchReason
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to request match');
        }

        toast.success('Match request sent successfully!');
        // Refresh the page to show updated status
        window.location.reload();
      } catch (error) {
        console.error('Error requesting match:', error);
        toast.error('Failed to send match request. Please try again.');
      } finally {
        setIsRequesting(false);
      }
    };

    const handleMessageClick = () => {
      if (coach.conversationId) {
        router.push(`/messages/${coach.conversationId}`);
      }
    };

    return (
      <Card className="overflow-hidden transition-all hover:border-primary">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={coach.avatar} alt={coach.name} />
                <AvatarFallback>{coach.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{coach.name}</h3>
                {coach.title && (
                  <p className="text-sm text-muted-foreground">{coach.title}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {coach.location && (
                    <span className="text-sm text-muted-foreground">{coach.location}</span>
                  )}
                  {(isRecommended || isMatched) && coach.matchScore && (
                    <Badge variant="secondary">
                      {coach.matchScore}% Match
                    </Badge>
                  )}
                  {isMatched && coach.matchStatus && (
                    <Badge variant={
                      coach.matchStatus === "matched" ? "default" :
                      coach.matchStatus === "pending" ? "secondary" :
                      "outline"
                    }>
                      {coach.matchStatus.charAt(0).toUpperCase() + coach.matchStatus.slice(1)}
                    </Badge>
                  )}
                  {coach.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{coach.rating}</span>
                      {coach.totalReviews && (
                        <span className="text-sm text-muted-foreground">({coach.totalReviews})</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {isMatched ? (
                <>
                  {coach.matchStatus === "matched" && (
                    <Button variant="outline" size="sm" onClick={handleMessageClick}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  )}
                  <Button size="sm">
                    View Details
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm">
                    View Profile
                  </Button>
                  <Button 
                    size="sm"
                    onClick={handleMatchRequest}
                    disabled={isRequesting}
                  >
                    {isRequesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Requesting...
                      </>
                    ) : (
                      'Request Match'
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {coach.expertise && coach.expertise.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Briefcase className="h-4 w-4" />
                  Areas of Expertise
                </div>
                <div className="flex flex-wrap gap-2">
                  {coach.expertise.map((exp, index) => (
                    <Badge key={index} variant="outline">
                      {exp}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {coach.specialties && coach.specialties.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Award className="h-4 w-4" />
                  Specialties
                </div>
                <div className="flex flex-wrap gap-2">
                  {coach.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {(isRecommended || isMatched) && coach.matchReason && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                <p className="text-sm font-medium text-primary">Why this match?</p>
                <p className="text-sm text-muted-foreground mt-1">{coach.matchReason}</p>
              </div>
            )}
          </div>

          {coach.availability && coach.availability.length > 0 && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Available: {coach.availability.join(', ')}</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Finding the perfect coach for you...</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        {existingMatches.length > 0 && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Your Coaches</CardTitle>
                <CardDescription>
                  Coaches you are currently working with or have matched with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {existingMatches.map((coach) => (
                    <CoachCard 
                      key={coach.id} 
                      coach={coach} 
                      isMatched={true}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {recommendedCoaches.length > 0 && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Recommended Coaches</CardTitle>
                <CardDescription>
                  These coaches are a great match for your goals and experience level
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendedCoaches.map((coach) => (
                    <CoachCard 
                      key={coach.id} 
                      coach={coach} 
                      isRecommended={true} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {availableCoaches.length > 0 && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle>All Coaches</CardTitle>
                <CardDescription>
                  Browse all available career coaches
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableCoaches.map((coach) => (
                    <CoachCard key={coach.id} coach={coach} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {existingMatches.length === 0 && recommendedCoaches.length === 0 && availableCoaches.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Coaches Available</h3>
                <p className="text-muted-foreground">
                  There are currently no coaches available. Please check back later!
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  return (
    <MainLayout>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar />
        <div className="flex-1 overflow-auto">
          <div className="container max-w-6xl mx-auto p-8">
            {renderContent()}
          </div>
        </div>
      </div>
    </MainLayout>
  );
} 