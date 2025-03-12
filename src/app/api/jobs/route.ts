import { NextRequest, NextResponse } from "next/server";
import { getJobs, createJob } from "@/lib/azure/cosmos";

export async function GET(request: NextRequest) {
  try {
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";
    const location = searchParams.get("location") || "";
    const category = searchParams.get("category") || "";
    
    // Build the query for Cosmos DB
    let querySpec: any = { query: "SELECT * FROM c" };
    
    if (query || location || category) {
      let queryString = "SELECT * FROM c WHERE ";
      const queryParams: any[] = [];
      
      if (query) {
        queryString += "CONTAINS(c.title, @query) OR CONTAINS(c.description, @query)";
        queryParams.push({ name: "@query", value: query });
      }
      
      if (location) {
        if (queryParams.length > 0) queryString += " AND ";
        queryString += "CONTAINS(c.location, @location)";
        queryParams.push({ name: "@location", value: location });
      }
      
      if (category) {
        if (queryParams.length > 0) queryString += " AND ";
        queryString += "c.category = @category";
        queryParams.push({ name: "@category", value: category });
      }
      
      querySpec = {
        query: queryString,
        parameters: queryParams
      };
    }
    
    // Get jobs from Cosmos DB
    const jobs = await getJobs(querySpec);
    
    return NextResponse.json({ jobs });
  } catch (error) {
    console.error("Error getting jobs:", error);
    return NextResponse.json(
      { error: "Failed to get jobs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const jobData = await request.json();
    
    // Validate job data
    if (!jobData.title || !jobData.description || !jobData.company) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Add additional fields
    jobData.id = `job-${Date.now()}`;
    jobData.createdAt = new Date().toISOString();
    jobData.updatedAt = new Date().toISOString();
    
    // Create job in Cosmos DB
    const job = await createJob(jobData);
    
    return NextResponse.json({ job }, { status: 201 });
  } catch (error) {
    console.error("Error creating job:", error);
    return NextResponse.json(
      { error: "Failed to create job" },
      { status: 500 }
    );
  }
} 