NaviAble 

Navigate the world with confidence.

NaviAble is an app that helps people with mobility problems find accessible places, plan routes, find helpers, and share feedback about their experience.

We wanted to make something that makes it easier for people to know if a place is actually accessible before they go there.

What it does

Find accessible places

Check things like ramps, lifts, toilets, parking, seating, etc.

See if the accessibility information is confirmed or not

Explore places on a map

Follow routes using the Route Quest feature

Find helpers and see their skills and availability

Apply to become a helper

Learn about wheelchair assistance

Give feedback after a journey

Use the app without making an account

Change the language

Tech stack

We used:

React

TypeScript

Vite

Tailwind CSS

Supabase

Leaflet + OpenStreetMap

Lucide React

Supabase is used for the database and login system.

Running the project

You need Node.js 18+ and npm.

First install the packages:

npm install


Then create a .env file:

cp .env.example .env


Add your Supabase details:

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key


The SQL files in supabase/migrations/ also need to be run in your Supabase project.

After that:

npm run dev


Then open the local URL shown in the terminal.

Maps

We're using Leaflet and OpenStreetMap for the maps.

The Route Quest isn't live navigation. The routes and checkpoints are already stored in the database.

We didn't use Google Maps, so you don't need a Google Maps API key for this project.

Project structure

Most of the code is inside src.

src/
├── components/
├── hooks/
├── lib/
├── pages/
└── types/

supabase/
└── migrations/


The pages folder contains the main screens like the landing page, Explore page, map, helpers, lessons, and feedback.

Supabase

Supabase is used for most of the backend:

User accounts

Places

Helpers

Lessons

Routes

Applications

Feedback

The migrations folder contains the database setup and some demo data.

Don't put your Supabase service role key in the frontend.

Quick demo

If you just want to see the main flow:

Landing
   ↓
Explore
   ↓
Find a place
   ↓
Check accessibility
   ↓
Start Route Quest
   ↓
Finish route
   ↓
Give feedback


You can also sign up and try the helper features.

Some limitations

This is still a prototype, so there are a few things we haven't added yet:

No live navigation or traffic

Route Quest uses predefined routes

Guest progress is lost after refreshing the page

No automated tests yet

Some of the places and other data are demo data

What we changed

The project already had most of the main features.

We mainly:

Fixed the language selector so the page updates when the language is changed

Added .env.example

Added this README

Kept the existing Leaflet map instead of changing the whole map system

That's basically it.

Running checks

You can run these before a demo:

npm run lint
npm run typecheck
npm run build


Made for our project NaviAble 

The idea is simple: make it easier to find places that are actually accessible.