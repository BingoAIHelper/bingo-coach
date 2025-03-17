import { getJobs, createJob } from "@/lib/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const jobs = await getJobs();
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching jobs" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const jobData = await req.json();
    
    // Validate required fields
    if (!jobData.title || !jobData.company || !jobData.description || !jobData.requirements) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    const newJob = await createJob(jobData);
    return NextResponse.json(newJob, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "An error occurred while creating the job" },
      { status: 500 }
    );
  }
} 