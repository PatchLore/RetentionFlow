# Demo Setup Guide

This document explains how to set up and use the demo salon feature in RebookFlow.

## Overview

The demo feature allows visitors to try RebookFlow without creating an account. It provides:
- Pre-seeded demo data (35 clients, 3 stylists, 5 services)
- Realistic follow-up scenarios
- Full access to all features
- No WhatsApp API usage - all messaging uses click-to-open links

## Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_DEMO_EMAIL=demo@rebookflow.app
DEMO_USER_PASSWORD=your-secure-demo-password-here
```

**Important**: 
- Use a secure password for `DEMO_USER_PASSWORD`
- The email should be a valid format (it will be created automatically)
- These credentials are used server-side only

## Database Migration

Run the demo schema migration:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration file: `supabase/demo-schema.sql`

This adds:
- `is_demo` boolean flag to teams table
- `demo_reset_at` timestamp (for future auto-reset functionality)
- Index for efficient demo team lookups

## How It Works

### 1. Demo Team Creation

When a user clicks "Try Demo":
1. Server action `handleDemoLogin` is called
2. `ensureDemoTeamAndUser()` checks if demo team exists
3. If not, creates:
   - Demo team with `is_demo = true`
   - Demo user account (if doesn't exist)
   - Links user profile to demo team

### 2. Demo Data Seeding

On first demo login (or when no clients exist):
- `seedDemoDataForTeam()` is called
- Creates 35 clients with UK names and phone numbers
- Assigns clients to 3 stylists (Chloe, Amelia, Sofia)
- Creates 5 service types with realistic intervals
- Generates follow-ups with varied statuses (pending, overdue, sent)
- All data is tied to the demo team

### 3. Demo Login Flow

1. User clicks "Try Demo" button on login page
2. Server action ensures demo team/user exist
3. Seeds data if needed
4. Signs in user with demo credentials
5. Redirects to dashboard

## Accessing the Demo

1. Go to `/login` page
2. Click the **"Try Demo"** button (with sparkles icon)
3. You'll be automatically logged in and redirected to dashboard
4. Dashboard shows seeded data with KPIs, follow-ups, and charts

## Demo Data Details

### Services
- Full Colour (60 days)
- Cut & Finish (30 days)
- Balayage (90 days)
- Blow Dry (14 days)
- Highlights (75 days)

### Stylists
- Chloe
- Amelia
- Sofia

### Clients
- 35 clients with realistic UK names
- UK phone number format: +44 7XXX XXXXXX
- Varied last visit dates (1-120 days ago)
- Mix of due today, overdue, and upcoming

### Follow-ups
- Mix of statuses: pending, overdue, sent
- Realistic distribution based on due dates
- Some already contacted, some need attention

## Safety & Compliance

### WhatsApp Compliance ✅
- **No WhatsApp API usage** - all messaging uses click-to-open links
- Demo data includes phone numbers but they're fake
- Clicking "Send WhatsApp" opens `wa.me` link (doesn't actually send)
- Scheduler only creates database records, never sends messages

### Data Isolation ✅
- Demo team marked with `is_demo = true`
- RLS policies ensure demo users only see demo data
- Non-demo teams remain private
- Demo data can be safely reset without affecting real data

### Security ✅
- Demo credentials stored in environment variables
- Server-side only operations
- No hard-coded credentials
- Admin client used only for setup/seeding

## Resetting Demo Data

To reset demo data (useful for demos):

1. Create an API route or server action (future enhancement)
2. Verify user is demo user
3. Call `seedDemoDataForTeam(teamId)` - it will wipe and reseed

Example (future enhancement):
```typescript
// app/actions/resetDemo.ts
"use server";

export async function resetDemoData() {
  // Verify user is demo user
  // Get demo team ID
  // Call seedDemoDataForTeam()
}
```

## Troubleshooting

### Demo login fails
- Check environment variables are set correctly
- Verify Supabase admin client has proper permissions
- Check server logs for errors

### No demo data appears
- Verify `seedDemoDataForTeam()` was called
- Check team has `is_demo = true`
- Verify RLS policies allow access

### Dashboard shows empty
- Ensure demo data was seeded
- Check user's `team_id` matches demo team
- Verify queries include team clients

## Files Created/Modified

### New Files
- `supabase/demo-schema.sql` - Database migration
- `lib/demo/setupDemoTeam.ts` - Demo team/user setup
- `lib/demo/seedDemoData.ts` - Demo data seeding
- `app/actions/demoLogin.ts` - Demo login server action

### Modified Files
- `app/login/page.tsx` - Added "Try Demo" button
- `app/dashboard/page.tsx` - Enhanced with KPIs and retention rate
- `lib/followup-utils.ts` - Updated to support team queries

## Next Steps

1. Set environment variables
2. Run database migration
3. Test demo login flow
4. Verify dashboard shows seeded data
5. Test WhatsApp links (they open but don't send)

## Notes

- Demo data is realistic but fake (names, phone numbers)
- All WhatsApp interactions are manual (click-to-open)
- Demo can be reset without affecting real user data
- Future: Add "Reset Demo" button for easy demo resets

