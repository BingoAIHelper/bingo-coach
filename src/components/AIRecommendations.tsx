import { Award, User, Calendar, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { fetcher } from "@/lib/utils";

interface Recommendation {
  skills: string[];
  improvements: string[];
  actions: {
    type: string;
    title: string;
    description: string;
    coach?: {
      name: string;
      specialty: string;
      matchScore: number;
    };
    questions?: string[];
  }[];
  jobMatches: {
    title: string;
    company?: string;
    description?: string;
  }[];
}

export function AIRecommendations() {
  const { data: recommendations, error, isLoading } = useSWR<Recommendation>('/api/recommendations', fetcher);

  if (isLoading) {
    return (
      <div className="card-gradient rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card-gradient rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-6 text-center text-muted-foreground">
          Unable to load recommendations
        </div>
      </div>
    );
  }

  return (
    <div className="card-gradient rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-purple-500/10 p-2">
              <Award className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">AI-Powered Insights</h3>
              <p className="text-sm text-muted-foreground">Personalized recommendations based on your profile</p>
            </div>
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Skills & Improvements */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Top Skills Identified</h4>
              <div className="flex flex-wrap gap-2">
                {recommendations?.skills.map((skill, i) => (
                  <span key={i} className="px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Suggested Improvements</h4>
              <ul className="space-y-2">
                {recommendations?.improvements.map((improvement, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="rounded-full bg-amber-100 p-1">
                      <CheckCircle className="h-3 w-3 text-amber-600" />
                    </span>
                    {improvement}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Actions */}
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Recommended Actions</h4>
              <div className="space-y-3">
                {recommendations?.actions.map((action, i) => (
                  <button key={i} className="w-full flex items-center justify-between p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-green-100 p-2">
                        {action.type === 'coach' ? (
                          <User className="h-4 w-4 text-green-600" />
                        ) : (
                          <Calendar className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.description}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {action.type === 'coach' ? 'Connect' : 'Schedule'}
                    </Button>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}