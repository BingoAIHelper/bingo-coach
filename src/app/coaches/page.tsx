 "use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Calendar, CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";

interface Coach {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  rating: number;
  reviewCount: number;
  specialties: string[];
  communicationMethods: string[];
  accessibilitySkills: string[];
  disabilityExpertise: string[];
  availability: string;
  successRate: string;
  bio: string;
  matchScore?: number;
  matchReason?: string;
}

export default function CoachesPage() {
  const { data: session } = useSession();
  const [recommendedCoaches, setRecommendedCoaches] = useState<Coach[]>([]);
  const [allCoaches, setAllCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCoaches = async () => {
      try {
        // Fetch AI-recommended matches
        const matchesResponse = await fetch('/api/coach-matching');
        const matchesData = await matchesResponse.json();
        
        // Fetch all coaches
        const coachesResponse = await fetch('/api/coaches');
        const coachesData = await coachesResponse.json();
        
        if (matchesData.matches) {
          setRecommendedCoaches(matchesData.matches);
        }
        
        if (coachesData.coaches) {
          setAllCoaches(coachesData.coaches);
        }
      } catch (error) {
        console.error('Error fetching coaches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCoaches();
  }, []);

  const CoachCard = ({ coach, isRecommended = false }: { coach: Coach; isRecommended?: boolean }) => (
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
              <p className="text-sm text-muted-foreground">{coach.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{coach.rating}</span>
                <span className="text-sm text-muted-foreground">({coach.reviewCount} reviews)</span>
                {isRecommended && coach.matchScore && (
                  <Badge variant="secondary" className="ml-2">
                    {coach.matchScore}% Match
                  </Badge>
                )}
                          </div>
                        </div>
                      </div>
          <Button variant="outline" className="shrink-0">
            View Profile
                        </Button>
                      </div>
                    
        <div className="mt-4">
          <div className="flex flex-wrap gap-2 mb-3">
                          {coach.specialties.map((specialty, index) => (
              <Badge key={index} variant="outline">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {coach.bio}
          </p>
          {isRecommended && coach.matchReason && (
            <div className="mt-2 p-3 bg-primary/5 rounded-lg">
              <p className="text-sm font-medium text-primary">Why this match?</p>
              <p className="text-sm text-muted-foreground mt-1">{coach.matchReason}</p>
                      </div>
          )}
                    </div>
                    
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {coach.availability}
                        </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" />
            {coach.successRate}
                      </div>
                    </div>
                  </CardContent>
                </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading coaches...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-6xl py-8 space-y-8">
      {recommendedCoaches.length > 0 && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle>Recommended Coaches</CardTitle>
              <CardDescription>
                These coaches are specifically matched to your profile, experience, and goals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recommendedCoaches.map((coach) => (
                  <CoachCard key={coach.id} coach={coach} isRecommended={true} />
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      <section>
        <Card>
          <CardHeader>
            <CardTitle>All Coaches</CardTitle>
            <CardDescription>
              Browse our complete list of qualified career coaches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {allCoaches.map((coach) => (
                <CoachCard key={coach.id} coach={coach} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}