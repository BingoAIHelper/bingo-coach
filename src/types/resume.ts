export interface Experience {
  title: string;
  company: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  degree: string;
  school: string;
  year: string;
}

export interface ResumeData {
  title: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
} 