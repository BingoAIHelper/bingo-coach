import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/database";
import { analyzeDocument } from "@/lib/azure/formRecognizer";
import { analyzeResume, generateJobRecommendations, generateInterviewQuestions } from "@/lib/azure/language";

export async function GET() {
  try {
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user data and documents
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        documents: true,
        resumes: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Initialize recommendations object
    const recommendations = {
      skills: [] as string[],
      improvements: [] as string[],
      actions: [] as any[],
      jobMatches: [] as any[],
    };

    // Analyze resume if available
    const resumeDoc = user.documents.find(doc => 
      doc.fileType.toLowerCase().includes('resume') || 
      doc.fileName.toLowerCase().includes('resume')
    );

    if (resumeDoc?.fileUrl) {
      // Analyze document structure with Form Recognizer
      const docAnalysis = await analyzeDocument(resumeDoc.fileUrl);
      const textContent = docAnalysis.content || "";

      // Analyze content with Language Service
      const resumeAnalysis = await analyzeResume(textContent);

      if (resumeAnalysis) {
        recommendations.skills = resumeAnalysis.skills;
        recommendations.improvements = resumeAnalysis.areasForImprovement;
        recommendations.jobMatches = resumeAnalysis.suggestedRoles;
      }
    }

    // Generate interview questions for top job match
    if (recommendations.jobMatches.length > 0) {
      const topJob = recommendations.jobMatches[0];
      const questions = await generateInterviewQuestions(
        topJob.title,
        recommendations.skills
      );

      // Add interview prep action if questions generated successfully
      if (questions && questions.length > 0) {
        recommendations.actions.push({
          type: 'interview',
          title: 'Prepare for Interviews',
          description: 'Practice with AI-generated questions',
          questions,
        });
      }
    }

    // Add coach matching action if profile is sufficiently complete
    if (recommendations.skills.length > 0) {
      // Find coaches that match user's needs
      const matchingCoaches = await prisma.user.findMany({
        where: {
          isCoach: true,
          OR: [
            { bio: { contains: recommendations.skills[0] } },
            { bio: { contains: recommendations.skills[1] } },
          ],
        },
        take: 3,
      });

      if (matchingCoaches.length > 0) {
        const topCoach = matchingCoaches[0];
        recommendations.actions.push({
          type: 'coach',
          title: 'Connect with Career Coach',
          description: `${topCoach.name} specializes in your field`,
          coach: {
            name: topCoach.name,
            specialty: topCoach.bio?.split('\n')[0] || 'Career Development',
            matchScore: 95, // Calculate actual match score
          },
        });
      }
    }

    return NextResponse.json(recommendations);
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}