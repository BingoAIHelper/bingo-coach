import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";
import { getCoaches, getCoachById } from "@/lib/azure/cosmos";

export async function GET(request: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const coachId = searchParams.get("id");
    
    // If coach ID is provided, get specific coach
    if (coachId) {
      const coach = await getCoachById(coachId);
      
      if (!coach) {
        return NextResponse.json(
          { error: "Coach not found" },
          { status: 404 }
        );
      }
      
      return NextResponse.json({ coach });
    }
    
    // Get filters from query parameters
    const skills = searchParams.get("skills")?.split(",") || [];
    const communicationStyles = searchParams.get("communicationStyles")?.split(",") || [];
    const teachingStyles = searchParams.get("teachingStyles")?.split(",") || [];
    
    // Build query for Cosmos DB
    let querySpec: any = { query: "SELECT * FROM c" };
    
    if (skills.length > 0 || communicationStyles.length > 0 || teachingStyles.length > 0) {
      let queryString = "SELECT * FROM c WHERE ";
      const queryParams: any[] = [];
      let conditions: string[] = [];
      
      if (skills.length > 0) {
        const skillConditions = skills.map((skill, index) => {
          const paramName = `@skill${index}`;
          queryParams.push({ name: paramName, value: skill });
          return `ARRAY_CONTAINS(c.skills, ${paramName})`;
        });
        
        conditions.push(`(${skillConditions.join(" OR ")})`);
      }
      
      if (communicationStyles.length > 0) {
        const styleConditions = communicationStyles.map((style, index) => {
          const paramName = `@commStyle${index}`;
          queryParams.push({ name: paramName, value: style });
          return `ARRAY_CONTAINS(c.communicationStyles, ${paramName})`;
        });
        
        conditions.push(`(${styleConditions.join(" OR ")})`);
      }
      
      if (teachingStyles.length > 0) {
        const styleConditions = teachingStyles.map((style, index) => {
          const paramName = `@teachStyle${index}`;
          queryParams.push({ name: paramName, value: style });
          return `ARRAY_CONTAINS(c.teachingStyles, ${paramName})`;
        });
        
        conditions.push(`(${styleConditions.join(" OR ")})`);
      }
      
      queryString += conditions.join(" AND ");
      
      querySpec = {
        query: queryString,
        parameters: queryParams
      };
    }
    
    // Get coaches from Cosmos DB
    const coaches = await getCoaches(querySpec);
    
    return NextResponse.json({ coaches });
  } catch (error) {
    console.error("Error getting coaches:", error);
    return NextResponse.json(
      { error: "Failed to get coaches" },
      { status: 500 }
    );
  }
} 