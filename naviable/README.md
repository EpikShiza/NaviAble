# NaviAble

Navigate the world with confidence.

NaviAble is a hackathon prototype that helps people with mobility-related accessibility needs find accessible places, plan routes, find helpers, request assistance, and share feedback.

## What it does

- Find accessible places and view accessibility information
- Explore places on a Leaflet/OpenStreetMap map
- Follow predefined Route Quest routes
- Find helpers, skills, availability, and verification status
- Apply to become a helper
- Create and track assistance requests
- Give helpers a real request workflow: pending → accepted → in progress → completed
- Leave feedback after completed assistance
- Show helper statistics and stored feedback
- Learn about wheelchair assistance
- Use guest browsing for the main accessibility experience
- Change the interface language

## Tech stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Supabase (authentication + database)
- Leaflet + OpenStreetMap
- Lucide React

## Run locally

Requirements: Node.js 18+ and npm.

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from the example:

```bash
cp .env.example .env
```

3. Add the values from your Supabase project:

```text
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Apply the Supabase migrations that are not already applied. In particular, the assistance workflow requires:

```text
supabase/migrations/20260926103000_add_assistance_requests.sql
```

Do not put a Supabase service-role key in the frontend.

5. Start the development server:

```bash
npm run dev
```

## Core assistance demo

Use two accounts for the complete demonstration:

```text
Traveler
  ↓
Helpers
  ↓
Select helper
  ↓
Request assistance
  ↓
My Requests
  ↓
Helper Dashboard
  ↓
Accept / Decline
  ↓
Start
  ↓
Complete
  ↓
Traveler submits feedback
  ↓
Helper dashboard shows feedback + updated rating
```

A helper account becomes connected to a helper profile when the existing helper application is submitted. The demo does not pretend that this submission is a real-world verification process; the profile remains `unverified` until an actual review is performed.

## Maps

NaviAble uses Leaflet and OpenStreetMap. Route Quest uses predefined routes and checkpoints stored in the database; it is not live navigation and does not require a Google Maps API key.

## Vercel

This is a Vite single-page application and does not use browser URL routing for its in-app views, so no Vercel rewrite file is required for the current architecture.

Use the normal Vercel Vite deployment flow and add the same two `VITE_` environment variables in the Vercel project settings.

Build command:

```bash
npm run build
```

The project intentionally does not add Google Maps, WebSockets, SMS/email infrastructure, or other production services.

## Validation

Available scripts:

```bash
npm run lint
npm run typecheck
npm run build
```

There are currently no automated application tests.

## Project structure

```text
src/
├── components/
├── hooks/
├── lib/
├── pages/
└── types/

supabase/
└── migrations/
```

## Prototype limitations

- No live navigation or traffic data
- Route Quest uses predefined routes
- Guest progress is local to the current session
- Some place/helper data is demo data
- Real helper verification is not implemented
- No real-time request notifications

These are intentional prototype boundaries rather than blockers for the hackathon demo.
