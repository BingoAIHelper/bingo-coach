"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useToast } from "../ui/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface Coach {
  id: string;
  name: string;
  expertise: string[];
  specialties: string[];
  bio?: string;
  yearsExperience?: number;
  industries?: string[];
  coachingStyle?: string;
  avatar?: string;
}

interface Conversation {
  id: string;
}

interface Match {
  id: string;
  coachId: string;
  seekerId: string;
  status: "pending" | "matched" | "declined";
  matchScore: number;
  matchReason?: string;
  coach: Coach;
  conversation?: Conversation;
}

export default function CoachesSection() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user) {
      fetchMatches();
    }
  }, [session]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/coach-matching");
      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }
      const data = await response.json();
      setMatches(data.matches || []);
      setError(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMatchAction = async (matchId: string, action: "accept" | "decline") => {
    try {
      setActionLoading(matchId);
      const response = await fetch("/api/coach-matching", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matchId, action }),
      });

      if (!response.ok) {
        throw new Error("Failed to process match action");
      }

      const data = await response.json();
      
      // Update matches list with new status
      setMatches(matches.map(match =>
        match.id === matchId
          ? { ...match, status: data.match.status, conversation: data.conversation }
          : match
      ));

      toast({
        title: action === "accept" ? "Match Accepted" : "Match Declined",
        description: action === "accept"
          ? "You can now start a conversation with this coach"
          : "Match has been declined",
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to process action";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!matches.length) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-center p-8">
        <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No Coach Matches Yet</h3>
        <p className="text-muted-foreground max-w-md">
          Complete your assessment to get matched with coaches that best fit your career goals and needs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <Card key={match.id} className="overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={match.coach.avatar} alt={match.coach.name} />
                  <AvatarFallback>{match.coach.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{match.coach.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary">
                      {match.matchScore}% Match
                    </Badge>
                    <Badge variant="outline">
                      {match.status === "pending" ? "New Match" : match.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {match.status === "pending" ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleMatchAction(match.id, "decline")}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === match.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Decline"
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleMatchAction(match.id, "accept")}
                      disabled={!!actionLoading}
                    >
                      {actionLoading === match.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Accept"
                      )}
                    </Button>
                  </>
                ) : match.status === "matched" && match.conversation ? (
                  <Button size="sm" asChild>
                    <Link href={`/seeker/conversations?id=${match.conversation.id}`}>
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Link>
                  </Button>
                ) : null}
              </div>
            </div>

            {match.matchReason && (
              <div className="mt-4 p-3 bg-primary/5 rounded-lg">
                <p className="text-sm font-medium text-primary">Why this match?</p>
                <p className="text-sm text-muted-foreground mt-1">{match.matchReason}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}