'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Briefcase, GraduationCap, Target, Loader2, MessageSquare, Users } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { MainLayout } from "@/components/layout/MainLayout";
import { DashboardSidebar } from "@/components/layout/DashboardSidebar";
import { redirect } from "next/navigation";
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Seeker {
  id: string;
  name: string;
  avatar?: string;
  title?: string;
  location?: string;
  experience?: string[];
  education?: string[];
  goals?: string[];
  interests?: string[];
  matchScore?: number;
  matchReason?: string;
  assessmentCompleted: boolean;
  assessment?: {
    title: string;
    sections: {
      title: string;
      questions: {
        type: string;
        question: string;
        answer: string | string[];
      }[];
    }[];
    completedAt: string;
  };
  lastActive: string;
  matchStatus?: string;
  matchId?: string;
  conversationId?: string;
}

export default function CoachSeekersPage() {
  const { data: session, status } = useSession();
  const [existingMatches, setExistingMatches] = useState<Seeker[]>([]);
  const [recommendedSeekers, setRecommendedSeekers] = useState<Seeker[]>([]);
  const [availableSeekers, setAvailableSeekers] = useState<Seeker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Redirect to login if not authenticated
  if (status === "unauthenticated") {
    redirect("/auth/signin");
  }

  // Redirect if user is not a coach
  if (session?.user?.role !== "coach") {
    redirect("/seeker/dashboard");
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!session?.user?.id) return;
      
      setIsLoading(true);
      try {
        const response = await fetch('/api/coach-matching');
        const data = await response.json();
        
        // Transform existing matches into seeker objects
        const matchedSeekers = data.existingMatches.map((match: any) => ({
          id: match.seeker.id,
          name: match.seeker.name,
          title: match.seeker.title || '',
          avatar: match.seeker.avatar || '',
          location: match.seeker.location || '',
          matchScore: match.matchScore,
          matchReason: match.matchReason,
          matchStatus: match.status,
          matchId: match.id,
          conversationId: match.conversation?.id,
          assessmentCompleted: match.seeker.assessmentCompleted,
          assessment: match.seeker.assessment,
          lastActive: match.seeker.lastActive
        }));

        // Transform recommended matches into seeker objects
        const recommendedSeekers = data.recommendedMatches.map((seeker: any) => ({
          id: seeker.id,
          name: seeker.name || '',
          title: seeker.title || '',
          avatar: seeker.avatar || '',
          location: seeker.location || '',
          matchScore: seeker.matchScore,
          matchReason: seeker.matchReason,
          assessmentCompleted: seeker.assessmentCompleted,
          assessment: seeker.assessment,
          lastActive: seeker.lastActive
        }));

        // Transform available seekers into seeker objects
        const availableSeekerObjects = data.availableUsers.map((seeker: any) => ({
          id: seeker.id,
          name: seeker.name,
          title: seeker.title || '',
          avatar: seeker.avatar || '',
          location: seeker.location || '',
          assessmentCompleted: seeker.assessmentCompleted,
          assessment: seeker.assessment,
          lastActive: seeker.lastActive
        }));

        setExistingMatches(matchedSeekers);
        setRecommendedSeekers(recommendedSeekers);
        setAvailableSeekers(availableSeekerObjects);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load seekers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const SeekerCard = ({ seeker, isRecommended = false, isMatched = false, matchStatus }: { seeker: Seeker; isRecommended?: boolean; isMatched?: boolean; matchStatus?: string }) => {
    const [isRequesting, setIsRequesting] = useState(false);
    const [showAssessment, setShowAssessment] = useState(false);
    const { data: session } = useSession();
    const router = useRouter();

    const handleMatchRequest = async () => {
      if (!session?.user?.id) {
        toast.error('Please sign in to request a match');
        return;
      }
      
      setIsRequesting(true);
      try {
        const response = await fetch('/api/match-request', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            coachId: session.user.id,
            seekerId: seeker.id,
            matchScore: seeker.matchScore,
            matchReason: seeker.matchReason
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

    const handleMatchResponse = async (accept: boolean) => {
      if (!session?.user?.id || !seeker.matchId) return;
      
      setIsRequesting(true);
      try {
        const response = await fetch('/api/match-request', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            matchId: seeker.matchId,
            status: accept ? 'matched' : 'declined'
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to respond to match');
        }

        toast.success(accept ? 'Match accepted!' : 'Match declined');
        // Refresh the page to show updated status
        window.location.reload();
      } catch (error) {
        console.error('Error responding to match:', error);
        toast.error('Failed to respond to match request. Please try again.');
      } finally {
        setIsRequesting(false);
      }
    };

    const handleMessageClick = () => {
      if (seeker.conversationId) {
        router.push(`/messages/${seeker.conversationId}`);
      }
    };

    const renderAssessmentSummary = () => {
      if (!seeker.assessment) return null;

      return (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Target className="h-4 w-4" />
              Assessment Summary
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAssessment(!showAssessment)}
            >
              {showAssessment ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>

          {showAssessment && (
            <div className="space-y-4 bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">{seeker.assessment.title}</h4>
                <span className="text-sm text-muted-foreground">
                  Completed {new Date(seeker.assessment.completedAt).toLocaleDateString()}
                </span>
              </div>

              {seeker.assessment.sections.map((section, idx) => (
                <div key={idx} className="space-y-2">
                  <h5 className="text-sm font-medium">{section.title}</h5>
                  <div className="space-y-1">
                    {section.questions.map((q, qIdx) => (
                      <div key={qIdx} className="text-sm">
                        <p className="text-muted-foreground">{q.question}</p>
                        <p className="font-medium">
                          {Array.isArray(q.answer) ? q.answer.join(', ') : q.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    };

    return (
      <Card className="overflow-hidden transition-all hover:border-primary">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={seeker.avatar} alt={seeker.name} />
                <AvatarFallback>{seeker.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-lg">{seeker.name}</h3>
                {seeker.title && (
                  <p className="text-sm text-muted-foreground">{seeker.title}</p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {seeker.location && (
                    <span className="text-sm text-muted-foreground">{seeker.location}</span>
                  )}
                  {(isRecommended || isMatched) && seeker.matchScore && (
                    <Badge variant="secondary">
                      {seeker.matchScore}% Match
                    </Badge>
                  )}
                  {isMatched && matchStatus && (
                    <Badge variant={
                      matchStatus === "matched" ? "default" :
                      matchStatus === "pending" ? "secondary" :
                      "outline"
                    }>
                      {matchStatus.charAt(0).toUpperCase() + matchStatus.slice(1)}
                    </Badge>
                  )}
                  {seeker.assessmentCompleted && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      Assessment Completed
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {isMatched ? (
                <>
                  {matchStatus === "matched" && (
                    <Button variant="outline" size="sm" onClick={handleMessageClick}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  )}
                  <Button size="sm">
                    View Details
                  </Button>
                </>
              ) : matchStatus === 'pending' ? (
                <>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleMatchResponse(false)}
                    disabled={isRequesting}
                  >
                    Decline
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleMatchResponse(true)}
                    disabled={isRequesting}
                  >
                    {isRequesting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Accept Match'
                    )}
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
                      'Connect'
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Briefcase className="h-4 w-4" />
                Experience
              </div>
              <div className="flex flex-wrap gap-2">
                {seeker.experience?.map((exp, index) => (
                  <Badge key={index} variant="outline">
                    {exp}
                  </Badge>
                )) || (
                  <span className="text-sm text-muted-foreground">No experience listed</span>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Target className="h-4 w-4" />
                Career Goals
              </div>
              <div className="flex flex-wrap gap-2">
                {seeker.goals?.map((goal, index) => (
                  <Badge key={index} variant="outline">
                    {goal}
                  </Badge>
                )) || (
                  <span className="text-sm text-muted-foreground">No goals listed</span>
                )}
              </div>
            </div>

            {seeker.assessmentCompleted && renderAssessmentSummary()}

            {(isRecommended || isMatched) && seeker.matchReason && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                <p className="text-sm font-medium text-primary">Why this match?</p>
                <p className="text-sm text-muted-foreground mt-1">{seeker.matchReason}</p>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Last active {seeker.lastActive}</span>
          </div>
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
            <span>Loading potential matches...</span>
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
                <CardTitle>Current Matches</CardTitle>
                <CardDescription>
                  Job seekers you are currently coaching or have matched with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {existingMatches.map((seeker) => (
                    <SeekerCard 
                      key={seeker.id} 
                      seeker={seeker} 
                      isMatched={true}
                      matchStatus={seeker.matchStatus}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {recommendedSeekers.length > 0 && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Recommended Matches</CardTitle>
                <CardDescription>
                  These job seekers closely match your expertise and coaching style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendedSeekers.map((seeker) => (
                    <SeekerCard 
                      key={seeker.id} 
                      seeker={seeker} 
                      isRecommended={true} 
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {availableSeekers.length > 0 && (
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Available Job Seekers</CardTitle>
                <CardDescription>
                  Browse all job seekers looking for career coaching
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableSeekers.map((seeker) => (
                    <SeekerCard key={seeker.id} seeker={seeker} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {existingMatches.length === 0 && recommendedSeekers.length === 0 && availableSeekers.length === 0 && (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No Seekers Available</h3>
                <p className="text-muted-foreground">
                  There are currently no job seekers looking for coaching. Check back later!
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