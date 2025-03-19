/**
 * Helper functions for handling coach data and array conversions
 */

interface CoachArrayFields {
  expertise: string[];
  specialties: string[];
  assessmentTypes: string[];
  languages: string[];
  certifications: string[];
  industries: string[];
}

/**
 * Convert array fields to JSON strings for database storage
 */
export function serializeCoachArrays(coach: Partial<CoachArrayFields>): Record<string, string> {
  const serialized: Record<string, string> = {};

  (Object.keys(coach) as Array<keyof CoachArrayFields>).forEach((key) => {
    const value = coach[key];
    if (Array.isArray(value)) {
      serialized[key] = JSON.stringify(value);
    }
  });

  return serialized;
}

/**
 * Parse JSON strings back to arrays from database
 */
export function deserializeCoachArrays(coach: Record<string, any>): Partial<CoachArrayFields> {
  const deserialized: Partial<CoachArrayFields> = {};

  ['expertise', 'specialties', 'assessmentTypes', 'languages', 'certifications', 'industries'].forEach((key) => {
    try {
      if (typeof coach[key] === 'string') {
        deserialized[key as keyof CoachArrayFields] = JSON.parse(coach[key]);
      }
    } catch (error) {
      console.warn(`Failed to parse ${key} array:`, error);
      deserialized[key as keyof CoachArrayFields] = [];
    }
  });

  return deserialized;
}

/**
 * Format coach data for database storage
 */
export function formatCoachForStorage(coachData: any) {
  const arrayFields = {
    expertise: coachData.expertise || [],
    specialties: coachData.specialties || [],
    assessmentTypes: coachData.assessmentTypes || [],
    languages: coachData.languages || [],
    certifications: coachData.certifications || [],
    industries: coachData.industries || [],
  };

  const serializedArrays = serializeCoachArrays(arrayFields);

  return {
    ...coachData,
    ...serializedArrays,
  };
}

/**
 * Format coach data from database for use in application
 */
export function formatCoachFromStorage(coachData: any) {
  const deserializedArrays = deserializeCoachArrays(coachData);

  return {
    ...coachData,
    ...deserializedArrays,
  };
}

/**
 * Calculate match score between a seeker and coach
 */
export function calculateMatchScore(
  seekerProfile: any,
  coachProfile: any,
  seekerAssessment: any
): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 0;

  // Check expertise match
  const expertiseMatch = coachProfile.expertise.some((exp: string) => 
    seekerProfile.interests?.includes(exp) || 
    seekerAssessment?.areas?.includes(exp)
  );
  if (expertiseMatch) {
    score += 30;
    reasons.push("Expertise aligns with seeker's interests and assessment areas");
  }

  // Check industry match
  const industryMatch = coachProfile.industries.some((ind: string) =>
    seekerProfile.targetIndustries?.includes(ind)
  );
  if (industryMatch) {
    score += 20;
    reasons.push("Coach has experience in seeker's target industries");
  }

  // Check language match
  const languageMatch = seekerProfile.languages?.some((lang: string) =>
    coachProfile.languages.includes(lang)
  );
  if (languageMatch) {
    score += 15;
    reasons.push("Language preferences match");
  }

  // Check experience level
  if (coachProfile.yearsExperience >= 5) {
    score += 15;
    reasons.push("Coach has significant experience");
  }

  // Check certifications
  if (coachProfile.certifications.length > 0) {
    score += 10;
    reasons.push("Coach has relevant certifications");
  }

  // Normalize score to 0-100 range
  score = Math.min(100, score);

  return {
    score,
    reasons
  };
}