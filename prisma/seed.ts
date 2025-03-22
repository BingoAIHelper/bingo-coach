const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const hashedPassword1 = await bcrypt.hash('Password123!', 10);
  const hashedPassword2 = await bcrypt.hash('Password456!', 10);
  const hashedCoachPassword = await bcrypt.hash('CoachPassword123!', 10);

  // Create test users
  const user1 = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      firstName: 'Test',
      lastName: 'User',
      password: hashedPassword1,
      role: 'seeker',
      location: 'New York, NY',
      phone: '555-123-4567',
      isCoach: false,
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'jane@example.com' },
    update: {},
    create: {
      email: 'jane@example.com',
      name: 'Jane Smith',
      firstName: 'Jane',
      lastName: 'Smith',
      password: hashedPassword2,
      role: 'seeker',
      location: 'San Francisco, CA',
      phone: '555-987-6543',
      isCoach: false,
    },
  });

  // Create a coach
  const coach = await prisma.coach.upsert({
    where: {
      email: "coach@example.com"
    },
    update: {},
    create: {
      name: "Career Coach",
      email: "coach@example.com",
      bio: "Experienced career coach with 10+ years helping job seekers find their dream positions.",
      expertise: "Resume Writing, Interview Preparation, Career Transition",
      specialties: "Career Growth, Leadership Development",
      industries: "Technology, Finance",
      languages: "English, Spanish",
      certifications: "Certified Career Coach (CCC)",
      hourlyRate: 75,
      rating: 4.8,
      availability: "Mon-Fri, 9am-5pm ET",
      createdAt: new Date(),
      updatedAt: new Date(),
      user: {
        create: {
          id: "unique-user-id", // Replace with a unique ID or remove if auto-generated
          email: "coach@example.com",
          password: hashedCoachPassword, // Replace with a securely hashed password
          role: "coach",
          isCoach: true,
          name: "Career Coach",
          createdAt: new Date(),
          updatedAt: new Date()
        }
      }
    }
  });

  // Create jobs
  const job1 = await prisma.job.create({
    data: {
      title: 'Software Engineer',
      company: 'Tech Solutions Inc.',
      location: 'Remote',
      description: 'We are looking for a talented software engineer to join our team.',
      requirements: 'Experience with JavaScript, React, and Node.js. 3+ years of experience.',
      salary: '$100,000 - $130,000',
      contactEmail: 'jobs@techsolutions.com',
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: 'Product Manager',
      company: 'Innovate Labs',
      location: 'San Francisco, CA',
      description: 'Join our team as a product manager to lead the development of cutting-edge products.',
      requirements: 'Experience in product management, agile methodologies, and market research.',
      salary: '$120,000 - $150,000',
      contactEmail: 'careers@innovatelabs.com',
    },
  });

  // Create a resume for user1
  const resume = await prisma.resume.create({
    data: {
      userId: user1.id,
      title: 'Software Developer Resume',
      content: `# John Doe
Software Developer
john@example.com | 555-123-4567 | linkedin.com/in/johndoe

## Experience
**Senior Developer** at Tech Solutions Inc.
March 2020 - Present
- Led development of key features for company's main product
- Mentored junior developers

**Software Engineer** at Startup XYZ
January 2018 - February 2020
- Developed web applications using React and Node.js
- Collaborated with design team on UI/UX improvements

## Education
**Bachelor of Science in Computer Science**
University of Technology, 2017

## Skills
JavaScript, TypeScript, React, Node.js, SQL, Git`,
      file: null, // Optional field
      createdAt: new Date(),
      updatedAt: new Date()
    },
  });

  // Create an assessment for user1
  const assessment = await prisma.assessment.create({
    data: {
      userId: user1.id,
      title: 'Career Readiness Assessment',
      description: 'Evaluate readiness for career transition.',
      sections: JSON.stringify([{ title: "Technical Skills", score: 90 }, { title: "Soft Skills", score: 80 }]),
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    },
  });

  // Create an application
  const application = await prisma.application.create({
    data: {
      userId: user1.id,
      jobId: job1.id,
      status: 'Applied',
      coverLetter: 'Dear Hiring Manager, I am excited to apply for the Software Engineer position at Tech Solutions Inc...',
      resumeId: resume.id,
      feedback: null, // Optional field
      submittedDate: new Date(),
      updatedAt: new Date()
    },
  });

  console.log({ 
    user1: { ...user1, password: 'REDACTED' }, 
    user2: { ...user2, password: 'REDACTED' }, 
    coach, 
    job1, 
    job2, 
    resume, 
    assessment, 
    application 
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });