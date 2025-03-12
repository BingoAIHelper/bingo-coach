# Bingo Job Coach Platform

Bingo is a comprehensive job coaching platform designed specifically for individuals with disabilities. The platform leverages modern technologies including machine learning, AI, and Azure cloud services to provide personalized assistance in job seeking, skill development, and career advancement.

## Features

- **User Authentication**: Secure signup and login for job seekers and coaches
- **Personalized Assessments**: Tailored assessments for both job seekers and coaches
- **Resume Reviews and Summaries**: AI-powered resume analysis and improvement suggestions
- **Job Matching**: Intelligent job matching based on skills, preferences, and accessibility needs
- **Accessibility Options**: 
  - Text-to-Speech and Speech-to-Text capabilities
  - Colorblind-friendly themes
  - Communication options for various disabilities
  - Pop-up assistance (enabled by default)
- **Job Coach Framework**:
  - Personalized assistance in seeker assessments
  - Training modules
  - Support via AI chatbot
  - Scheduling and calendar integration
  - Mock interviews and resume building

## Technology Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Authentication**: NextAuth.js, Azure AD B2C
- **Database**: Azure Cosmos DB
- **AI/ML**: Azure OpenAI, Azure Form Recognizer, Azure Text Analytics
- **Communication**: Azure Communication Services
- **Deployment**: Azure App Service

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

The application is configured for deployment to Azure:

```bash
npm run azure-build
npm run azure-deploy
```

## License

[MIT](LICENSE)
