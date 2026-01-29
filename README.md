# Teacher Portfolio Platform

A secure, production-ready Teacher Academic Portfolio Platform for managing teacher profiles, tracking professional development, and linking performance with student outcomes.

## Technology Stack

- **Frontend:** Next.js 15 (App Router), React, TypeScript
- **Backend:** Supabase (PostgreSQL, Auth, Storage)
- **Authentication:** Supabase Auth with RBAC
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Configure your Supabase credentials in `.env.local`

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

### Database Setup

1. Create a new Supabase project
2. Run the SQL migrations from `supabase/migrations/001_initial_schema.sql`
3. Set up Row Level Security policies
4. Configure storage buckets

## Project Structure

```
src/
├── app/           # Next.js App Router pages
├── components/    # Reusable React components
├── lib/           # Utilities, Supabase client, constants
├── types/         # TypeScript type definitions
└── styles/        # Global styles and CSS modules
```

## User Roles

- **Teacher:** Can view and edit their own portfolio
- **Admin:** Full access to all teacher profiles and system management

## Features

- Google Form-based registration
- Automated email onboarding
- Profile management with photo upload
- Skills tracking with admin approval
- Yearly goals management
- Student results integration
- Comprehensive admin dashboard

## Security

- Row Level Security (RLS) on all database tables
- Role-Based Access Control (RBAC)
- JWT authentication
- Input validation and sanitization

## License

Proprietary - Educational Institution Use Only
