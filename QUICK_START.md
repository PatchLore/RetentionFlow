# Quick Start Guide

## Step 1: Get Supabase Credentials

1. **Create a Supabase account** (if you don't have one):
   - Go to https://supabase.com
   - Sign up for free

2. **Create a new project**:
   - Click "New Project"
   - Choose a name and database password
   - Wait for project to be created (~2 minutes)

3. **Get your API credentials**:
   - Go to **Settings** → **API** in your Supabase dashboard
   - Copy these values:
     - **Project URL** (looks like: `https://xxxxx.supabase.co`)
     - **anon public** key (long string starting with `eyJ...`)
     - **service_role** key (long string, keep this secret!)

## Step 2: Add Credentials to .env.local

Open `.env.local` in your project root and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**: Replace the example values with your actual Supabase credentials!

## Step 3: Set Up Database

1. In Supabase dashboard, go to **SQL Editor**
2. Run these SQL files in order:
   - First: `supabase/schema.sql` (base schema)
   - Then: `supabase/team-schema.sql` (team features)
   - Finally: `supabase/demo-schema.sql` (demo support)

## Step 4: Restart Server

After adding credentials:
1. Stop the server: `Ctrl + C` in terminal
2. Start again: `npm run dev`
3. Open http://localhost:3000

## Step 5: Test the App

### Option A: Try Demo (Easiest!)
1. Go to http://localhost:3000/login
2. Click **"Try Demo"** button
3. You'll be logged in with pre-seeded demo data
4. Explore the dashboard!

### Option B: Create Your Own Account
1. Go to http://localhost:3000/signup
2. Create an account
3. Start adding clients and managing your salon

## Troubleshooting

### "Supabase Not Configured" Error
- Make sure `.env.local` exists in project root
- Check that values don't have quotes around them
- Restart the server after editing `.env.local`

### Database Errors
- Make sure you ran all 3 SQL migration files
- Check Supabase dashboard → Database → Tables to verify tables exist

### Demo Login Fails
- Make sure `NEXT_PUBLIC_DEMO_EMAIL` and `DEMO_USER_PASSWORD` are set in `.env.local`
- Check server logs for specific errors

## What You Can Test

✅ **Dashboard** - View KPIs, follow-ups, clients  
✅ **Clients** - Add, edit, view clients  
✅ **Follow-ups** - See due clients, send WhatsApp messages  
✅ **Reports** - View analytics and charts  
✅ **Settings** - Manage service rules and team  
✅ **AI Personalization** - Improve messages with AI (needs OpenAI key)  

## Next Steps

- Add your real clients
- Customize service rules
- Set up team members
- Explore all features!

Need help? Check the README.md or DEMO_SETUP.md files.

