/*
# User profiles and helper applications

## Overview
Adds authentication support to AccessWay. Two user roles:
- "traveler": people with disabilities who use the app to find accessible places and helpers.
- "employee": helpers/assistants who want to offer their services, applying Upwork-style.

## New Tables

### 1. `profiles`
Stores the role and display info for each authenticated user.
- `id` (uuid, PK, FK to auth.users) — one row per auth user
- `role` (text) — 'traveler' or 'employee'
- `full_name` (text) — display name
- `phone` (text, nullable) — contact phone
- `city` (text, nullable) — user's city
- `bio` (text, nullable) — short bio
- `avatar_url` (text, nullable) — profile photo URL
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### 2. `helper_applications`
Upwork-style multi-step application for employees who want to become verified helpers.
- `id` (uuid, PK)
- `user_id` (uuid, FK to auth.users, defaults to auth.uid())
- `status` (text) — 'draft', 'submitted', 'under_review', 'approved', 'rejected'
- `full_name`, `phone`, `city`, `service_area` — contact details
- `skills` (text[]) — wheelchair assistance, route planning, etc.
- `languages` (text[]) — languages spoken
- `years_experience` (int) — years of relevant experience
- `bio` (text) — professional summary / cover letter
- `certifications` (text, nullable) — relevant certifications or training
- `availability_notes` (text, nullable) — general availability description
- `reference_contacts` (text, nullable) — reference contact info
- `has_wheelchair_training` (boolean) — formal wheelchair handling training
- `has_first_aid` (boolean) — first aid certification
- `consent_background_check` (boolean) — consent to background check
- `agree_to_code_of_conduct` (boolean) — agrees to consent-first code of conduct
- `submitted_at` (timestamptz, nullable)
- `reviewed_at` (timestamptz, nullable)
- `reviewer_notes` (text, nullable)
- `created_at`, `updated_at` (timestamptz)

## Security
- RLS enabled on both tables.
- `profiles`: users can read all profiles (community directory) but only update their own. Insert is self-only (on signup). Delete is self-only.
- `helper_applications`: users can CRUD only their own applications. Insert defaults user_id to auth.uid().
- Both use `TO authenticated` with ownership checks via `auth.uid()`.

## Important Notes
1. `profiles.id` references `auth.users(id)` — the profile row is created after signup via a frontend insert.
2. `helper_applications.user_id` has `DEFAULT auth.uid()` so the frontend insert omits user_id.
3. Existing public tables (places, helpers, etc.) keep their anon+authenticated policies — public browsing still works without login.
*/
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'traveler',
  full_name text NOT NULL DEFAULT '',
  phone text,
  city text,
  bio text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_profiles" ON profiles;
CREATE POLICY "select_profiles" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "delete_own_profile" ON profiles;
CREATE POLICY "delete_own_profile" ON profiles FOR DELETE
  TO authenticated USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS helper_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft',
  full_name text NOT NULL DEFAULT '',
  phone text,
  city text,
  service_area text,
  skills text[] DEFAULT '{}',
  languages text[] DEFAULT '{}',
  years_experience int DEFAULT 0,
  bio text,
  certifications text,
  availability_notes text,
  reference_contacts text,
  has_wheelchair_training boolean DEFAULT false,
  has_first_aid boolean DEFAULT false,
  consent_background_check boolean DEFAULT false,
  agree_to_code_of_conduct boolean DEFAULT false,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewer_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE helper_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_applications" ON helper_applications;
CREATE POLICY "select_own_applications" ON helper_applications FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_applications" ON helper_applications;
CREATE POLICY "insert_own_applications" ON helper_applications FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_applications" ON helper_applications;
CREATE POLICY "update_own_applications" ON helper_applications FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_applications" ON helper_applications;
CREATE POLICY "delete_own_applications" ON helper_applications FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_helper_applications_user_id ON helper_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_helper_applications_status ON helper_applications(status);
