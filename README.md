# GenSheet

An intelligent checksheet generation and management platform powered by Google Gemini AI. GenSheet enables organizations to create, execute, and manage checksheets efficiently for quality assurance, inspections, and compliance across various industries.

## Overview

GenSheet is a modern web application built with Next.js that leverages AI to automatically generate comprehensive checksheets based on user requirements. It provides a complete workflow for creating, managing, and executing checklists with real-time reporting and analytics.

## Key Features

- AI-Powered Generation: Automatically generate detailed checksheets using Google Gemini AI based on industry and use case
- Drag-and-Drop Builder: Intuitive checksheet builder with drag-and-drop functionality
- Multiple Field Types: Support for various input types including checkboxes, numbers, text, photos, GPS, signatures, ratings, and more
- Role-Based Access: User management with role-based permissions (INSPECTOR, MANAGER, ADMIN)
- PDF Generation: Export completed checksheets and results as PDF documents
- Image Management: Integration with Cloudinary for image upload and storage
- Real-Time Reporting: View execution results and analytics in real-time
- Multi-Organization Support: Manage checksheets across multiple departments and locations
- Authentication: Secure authentication with NextAuth
- Database: PostgreSQL with Prisma ORM for robust data management

## Tech Stack

- Frontend: Next.js 16, React 19, TypeScript
- UI Components: Radix UI, Tailwind CSS
- Form Handling: React Hook Form with Zod validation
- AI: Google Generative AI (Gemini 2.0 Flash)
- Database: PostgreSQL with Prisma ORM
- Authentication: NextAuth v5
- Image Management: Cloudinary
- Charts: Recharts
- PDF Generation: jsPDF with AutoTable
- Drag & Drop: dnd-kit

## Project Structure

```
app/                    # Next.js app directory
  (auth)/              # Authentication routes
  (dashboard)/         # Protected dashboard routes
    ai/               # AI checksheet generation
    checksheets/      # Checksheet management
    templates/        # Templates management
    reports/          # Reporting and analytics
    settings/         # User settings
  (marketing)/         # Public marketing pages
  api/                # API routes
    ai/generate/      # AI generation endpoint
    auth/             # Authentication endpoints
    checksheets/      # Checksheet CRUD endpoints
    results/          # Results endpoints
    upload/           # File upload endpoints

components/           # React components
  ui/                # Reusable UI components

lib/                 # Utility libraries
  auth.ts           # NextAuth configuration
  gemini.ts         # Google AI integration
  cloudinary.ts     # Cloudinary integration
  prisma.ts         # Prisma client setup
  utils.ts          # Helper utilities

prisma/             # Database configuration
  schema.prisma     # Database schema
  migrations/       # Database migrations
  seed.js          # Database seeding script

types/              # TypeScript type definitions
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Google AI API key (for Gemini integration)
- Cloudinary account (for image management)
- NextAuth configuration

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gensheet
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file with:
DATABASE_URL="postgresql://user:password@localhost:5432/gensheet"
GOOGLE_AI_API_KEY="your-google-ai-key"
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-key"
CLOUDINARY_API_SECRET="your-cloudinary-secret"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-random-secret"
```

4. Set up the database:
```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio (database GUI)
- `npm run prisma:seed` - Seed database with initial data

## Database Schema

The application includes models for:

- User: User accounts with roles and organization affiliation
- Organization: Multi-tenant organization management
- Checksheet: Template and execution records
- ChecksheetAssignment: User assignments to checksheets
- ChecksheetResult: Execution results and responses
- Checkpoint: Individual items within a checksheet
- Notification: User notifications and alerts
- VerificationToken: Email verification tokens
- Account/Session: NextAuth authentication records

## Usage

### Creating a Checksheet

1. Navigate to the Checksheets section
2. Click "Create New Checksheet"
3. Choose AI Generation or Manual Builder
4. For AI Generation: Provide requirements and let Gemini generate the checksheet
5. For Manual: Use the drag-and-drop builder to add checkpoints
6. Define field types, validation rules, and sections
7. Save and publish the checksheet

### Executing a Checksheet

1. Navigate to Execute section
2. Select a checksheet from available options
3. Fill in all required fields
4. Attach photos or files as needed
5. Submit the execution

### Viewing Results

1. Go to Reports section
2. View analytics and completion rates
3. Download results as PDF
4. Generate compliance reports by department/location

## API Endpoints

- `GET/POST /api/checksheets` - Manage checksheets
- `GET/POST /api/checksheets/[id]` - Individual checksheet operations
- `POST /api/checksheets/[id]/execute` - Execute a checksheet
- `GET/POST /api/results` - Manage execution results
- `POST /api/ai/generate` - Generate checksheet with AI
- `POST /api/upload` - Upload files/images

## Authentication

The application uses NextAuth v5 with:
- Email/password authentication
- Optional OAuth providers
- Role-based access control (INSPECTOR, MANAGER, ADMIN)
- Session management with JWT tokens

## Development

### Code Style

- Use TypeScript for type safety
- Follow ESLint configuration
- Use Tailwind CSS for styling
- Component-based architecture

### Database Changes

After modifying `prisma/schema.prisma`:
```bash
npm run prisma:migrate
npm run prisma:generate
```

## Contributing

Guidelines for contributing:
1. Create a feature branch
2. Make your changes with clear commit messages
3. Ensure code passes linting
4. Submit a pull request with description

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check database credentials

### AI Generation Errors
- Verify GOOGLE_AI_API_KEY is valid
- Check API quota and rate limits
- Review error logs for specific issues

### Image Upload Issues
- Verify Cloudinary credentials
- Check file size limits
- Ensure internet connection for uploads

## License

This project is private and proprietary.

## Support

For issues and feature requests, please contact the development team.
