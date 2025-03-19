"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useToast } from "../ui/use-toast";

interface Coach {
  id: string;
  name: string;
  expertise: string[];
  specialties: string[];
  bio?: string;
  yearsExperience?: number;
  industries?: string[];
  coachingStyle?: string;
}

interface Match {
  id: string;
  coachId: string;
  seekerId: string;
  status: string;
  matchScore: number;
  matchReason?: string;
  coach: Coach;
  conversation?: {
    id: string;
    status: string;
  };
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
      setMatches(data.matches);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Recommended Coaches</CardTitle>
          <CardDescription>
            Connect with coaches matched to your needs and goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No coach matches available. Complete your assessment to get matched with coaches.
              </p>
            ) : (
              matches.map((match) => (
                <div key={match.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-lg">{match.coach.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                        <span className="font-medium">{match.matchScore}% Match</span>
                        {match.status !== "pending" && (
                          <span className={`text-sm px-2 py-0.5 rounded-full ${
                            match.status === "matched" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                          }`}>
                            {match.status.charAt(0).toUpperCase() + match.status.slice(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      {match.coach.yearsExperience
                        ? `${match.coach.yearsExperience} years of experience`
                        : "Experienced coach"}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {match.coach.specialties?.map((specialty, i) => (
                        <span
                          key={i}
                          className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>

                  {match.matchReason && (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium mb-1">Why this match?</p>
                      <p>{match.matchReason}</p>
                    </div>
                  )}

                  <div className="flex gap-3 mt-4">
                    {match.status === "pending" ? (
                      <>
                        <Button
                          className="flex-1"
                          onClick={() => handleMatchAction(match.id, "accept")}
                          disabled={actionLoading === match.id}
                        >
                          {actionLoading === match.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <ThumbsUp className="h-4 w-4 mr-2" />
                          )}
                          Accept Match
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => handleMatchAction(match.id, "decline")}
                          disabled={actionLoading === match.id}
                        >
                          {actionLoading === match.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <ThumbsDown className="h-4 w-4 mr-2" />
                          )}
                          Decline
                        </Button>
                      </>
                    ) : match.status === "matched" && match.conversation ? (
                      <Link
                        href={`/conversations/${match.conversation.id}`}
                        className="w-full"
                      >
                        <Button className="w-full">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Continue Conversation
                        </Button>
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}