import { NextResponse } from "next/server";
import { generateChatCompletion } from "@/lib/azure/openai";

interface SeekerInfo {
  name: string;
  disabilities: string[];
  goals: string[];
  skillLevel: string;
  focusArea: string;
}

export async function POST(req: Request) {
  try {
    const { seekerInfo } = await req.json() as { seekerInfo: SeekerInfo };

    // Create a detailed prompt for the AI
    const prompt = `Create a detailed assessment for a job seeker with the following profile:
Name: ${seekerInfo.name}
Disabilities/Accommodations: ${seekerInfo.disabilities.join(", ")}
Career Goals: ${seekerInfo.goals.join(", ")}
Current Skill Level: ${seekerInfo.skillLevel}
Focus Area: ${seekerInfo.focusArea}

The assessment should:
1. Be appropriate for their skill level and accommodations
2. Focus on their career goals and focus area
3. Include a mix of question types (multiple choice, open-ended, practical)
4. Be structured in clear sections
5. Include scoring criteria

Format the response as a JSON object with the following structure:
{
  "title": "Assessment title",
  "description": "Brief description",
  "duration": "Estimated time in minutes",
  "sections": [
    {
      "title": "Section title",
      "description": "Section description",
      "questions": [
        {
          "type": "multiple_choice|text|practical",
          "question": "Question text",
          "options": ["Option 1", "Option 2"] // for multiple choice
          "scoring": "Scoring criteria"
        }
      ]
    }
  ]
}`;

    // Generate assessment using Azure OpenAI
    const messages = [
      { role: "system" as const, content: "You are an expert assessment creator for job seekers." },
      { role: "user" as const, content: prompt }
    ];
    const assessmentString = await generateChatCompletion(messages, 2000, 0.7);
    let assessment;
    try {
      assessment = JSON.parse(assessmentString);
    } catch (error) {
      console.error("Failed to parse AI response:", error);
      return NextResponse.json(
        { error: "Failed to generate valid assessment" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      assessment,
      message: "Assessment generated successfully"
    });
  } catch (error) {
    console.error("Error generating assessment:", error);
    return NextResponse.json(
      { error: "Failed to generate assessment" },
      { status: 500 }
    );
  }
}