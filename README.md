# RebookFlow

A client retention system for beauty salons built with Next.js 15, Supabase, and Tailwind CSS.

## Features

- **Client Management**: Add, edit, and manage client information
- **Automatic Due Date Calculation**: Automatically calculates next appointment due dates based on service type
- **Follow-up Tracking**: Track and manage client follow-ups
- **WhatsApp Integration**: Send WhatsApp messages via click-to-open links
- **Message Templates**: Customizable message templates for reminders, reviews, and birthdays
- **Dashboard**: View today's follow-ups and weekly due clients

## Tech Stack

- **Next.js 15** - React framework with App Router
- **Supabase** - Authentication, database, and storage
- **Tailwind CSS** - Styling
- **Shadcn UI** - UI components
- **TypeScript** - Type safety

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to get your project URL and anon key
3. Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

4. Fill in your Supabase credentials in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Set Up Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `supabase/schema.sql` to create all tables, RLS policies, and default service rules

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── clients/           # Client management pages
│   ├── templates/         # Message templates page
│   ├── reports/           # Reports page (placeholder)
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── components/            # React components
│   ├── ui/                # Shadcn UI components
│   ├── navbar.tsx         # Navigation bar
│   └── followup-card.tsx  # Follow-up card component
├── lib/                   # Utility functions
│   ├── supabase/          # Supabase client setup
│   ├── types.ts           # TypeScript types
│   ├── message-utils.ts   # Message utilities (server)
│   ├── message-utils-client.ts # Message utilities (client)
│   └── followup-utils.ts  # Follow-up utilities
├── supabase/              # Database schema
│   └── schema.sql         # SQL schema file
└── middleware.ts          # Next.js middleware for auth
```

## Database Schema

### Tables

- **profiles**: User profiles (extends auth.users)
- **clients**: Client information
- **service_rules**: Service types and their interval days
- **followups**: Follow-up tracking

### Default Service Rules

The schema includes default service rules:
- Haircut: 30 days
- Hair Color: 60 days
- Highlights: 60 days
- Perm: 90 days
- And more...

## Usage

1. **Sign Up**: Create an account
2. **Add Clients**: Go to Clients > Add Client
3. **View Dashboard**: See today's follow-ups and weekly due clients
4. **Send WhatsApp**: Click "Send WhatsApp" to open WhatsApp Web with a pre-filled message
5. **Customize Templates**: Go to Templates to customize your message templates

## Environment Variables

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon/public key
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (for admin operations)

## Building for Production

```bash
npm run build
npm start
```

## License

ISC

