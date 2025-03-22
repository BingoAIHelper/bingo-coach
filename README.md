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
- **AI-Powered Matching**: Intelligent matching between job seekers and career coaches
- **Assessment Tools**: Comprehensive career assessments and skill evaluations
- **Document Analysis**: AI-powered resume and document analysis
- **Real-time Communication**: Built-in messaging system between seekers and coaches
- **Progress Tracking**: Monitor and track career development progress
- **Resource Library**: Access to career development resources and materials

## Technology Stack

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Next.js API Routes
- **Authentication**: NextAuth.js, Azure AD B2C
- **Database**: Azure Cosmos DB
- **AI/ML**: Azure OpenAI, Azure Form Recognizer, Azure Text Analytics
- **Communication**: Azure Communication Services
- **Deployment**: Azure App Service
- Node.js 18.x or later
- npm 9.x or later
- Docker and Docker Compose
- Azure account (for production deployment)
## Getting Started

### Local Development Setup

#### Using Bash:
1. Clone the repository:
```bash
git clone https://github.com/yourusername/bingo-job-coach-platform.git
cd bingo-job-coach-platform
```

2. Run the setup script (based on OS):
```bash
npm run setup:local-windows
```

```bash
npm run setup:local-mac
```

This will:
- Set up environment variables
- Start Docker containers
- Install dependencies
- Set up the database
- Generate Prisma client
- Run migrations
- Seed the database
- Build the application

3. Start the development server:
```bash
npm run dev
```

4. Start the development backend server:
```bash
npm run db:studio
```
### Azure Deployment

1. Make sure you have the Azure CLI installed and are logged in:
```bash
az login
```

2. Run the deployment script:
```bash
npm run deploy:azure
```

This will:
- Create all necessary Azure resources
- Set up environment variables
- Deploy the application
- Configure all services

## Available Scripts

- `npm run setup:local-mac` - Set up local development environment
- `npm run setup:local-windows` - Set up local development environment
- `npm run deploy:azure` - Deploy to Azure
- `npm run dev` - Start development server
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:studio` - Open Prisma Studio
- `npm run db:setup` - Set up database with Docker
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed the database

## Environment Variables

### Required Variables

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_URL` - NextAuth.js URL
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `ENCRYPTION_KEY` - Message encryption key
- `JWT_SECRET` - JWT secret for authentication

### Optional Variables (Azure Services)

- `AZURE_OPENAI_API_KEY` - Azure OpenAI API key
- `AZURE_OPENAI_ENDPOINT` - Azure OpenAI endpoint
- `AZURE_OPENAI_DEPLOYMENT_NAME` - Azure OpenAI deployment name
- `AZURE_STORAGE_CONNECTION_STRING` - Azure Storage connection string
- `AZURE_STORAGE_CONTAINER` - Azure Storage container name
- `AZURE_FORM_RECOGNIZER_KEY` - Azure Form Recognizer key
- `AZURE_FORM_RECOGNIZER_ENDPOINT` - Azure Form Recognizer endpoint
- `AZURE_TEXT_ANALYTICS_KEY` - Azure Text Analytics key
- `AZURE_TEXT_ANALYTICS_ENDPOINT` - Azure Text Analytics endpoint
- `AZURE_COMMUNICATION_CONNECTION_STRING` - Azure Communication Services connection string
- `MICROSOFT_CLIENT_ID` - Microsoft authentication client ID
- `MICROSOFT_CLIENT_SECRET` - Microsoft authentication client secret

## Project Structure

```
bingo-job-coach-platform/
├── src/
│   ├── app/                 # Next.js app directory
│   ├── components/          # React components
│   ├── lib/                 # Utility functions and services
│   └── types/              # TypeScript type definitions
├── prisma/                 # Database schema and migrations
├── public/                 # Static assets
└── scripts/               # Setup and deployment scripts
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
