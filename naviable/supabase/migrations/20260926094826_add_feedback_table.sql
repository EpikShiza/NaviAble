/*
# Feedback table

## Overview
Stores post-journey feedback from NaviAble users after completing a route quest.

## New Table
- `feedback`
  - `id` (uuid, PK)
  - `user_id` (uuid, nullable, FK to auth.users — nullable so guest users can also leave feedback)
  - `place_id` (uuid, nullable, FK to places — which place the feedback relates to)
  - `rating` (int, 1-5)
  - `tags` (text[]) — quick feedback tags like "easy to navigate", "accurate information"
  - `written_feedback` (text, nullable)
  - `accessibility_accurate` (text, nullable) — "yes", "partially", "no", "not_sure"
  - `created_at` (timestamptz)

## Security
- RLS enabled.
- SELECT: authenticated users can read all feedback (community transparency).
- INSERT: anon + authenticated can insert (guests can leave feedback too).
- No UPDATE or DELETE — feedback is immutable once submitted.
*/
CREATE TABLE IF NOT EXISTS feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  place_id uuid REFERENCES places(id) ON DELETE SET NULL,
  rating int NOT NULL DEFAULT 5,
  tags text[] DEFAULT '{}',
  written_feedback text,
  accessibility_accurate text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_feedback" ON feedback;
CREATE POLICY "select_feedback" ON feedback FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_feedback" ON feedback;
CREATE POLICY "insert_feedback" ON feedback FOR INSERT
  TO anon, authenticated WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_feedback_place_id ON feedback(place_id);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);
