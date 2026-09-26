/*
# Assistance requests + helper feedback

## Overview
Adds the real assistance request workflow between travelers and helpers, plus
a feedback mechanism tied to completed requests. This is additive: no existing
table is altered in a breaking way.

## Changes to existing tables
### `helpers`
- Adds `profile_id` (uuid, nullable, FK to profiles) so a signed-in "employee"
  account can be linked to a row in the public helpers directory. Nullable so
  existing seed/demo helpers (not tied to any real account) keep working.

## New Tables
### `assistance_requests`
The core request lifecycle: a traveler (`requester_id`) requests help from a
specific helper (`helper_id`). Status moves:
  pending -> accepted -> in_progress -> completed
  pending -> declined
  pending/accepted -> cancelled

### `helper_feedback`
Rating + comment left by the requester after a request is completed. One
feedback row per assistance request (enforced with a unique constraint).

## Security
- RLS enabled on all new/changed tables.
- `assistance_requests`: readable/updatable by the requester or by the helper
  the request is assigned to (matched via `helpers.profile_id = auth.uid()`).
  Insert is restricted to the requester creating their own request.
- `helper_feedback`: readable by any authenticated user (consistent with the
  existing public `feedback` table's transparency model). Insert is restricted
  to the requester of a completed request they own.
*/

-- ============================================================
-- HELPERS: link to an authenticated profile
-- ============================================================
ALTER TABLE helpers ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES profiles(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_helpers_profile_id ON helpers(profile_id) WHERE profile_id IS NOT NULL;

-- ============================================================
-- ASSISTANCE_REQUESTS
-- ============================================================
CREATE TABLE IF NOT EXISTS assistance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  helper_id uuid NOT NULL REFERENCES helpers(id) ON DELETE CASCADE,
  place_id uuid REFERENCES places(id) ON DELETE SET NULL,
  request_type text NOT NULL DEFAULT 'general assistance',
  description text,
  location_text text,
  preferred_time text,
  status text NOT NULL DEFAULT 'pending',
  decline_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  completed_at timestamptz,
  CONSTRAINT assistance_requests_status_check CHECK (
    status IN ('pending', 'accepted', 'declined', 'in_progress', 'completed', 'cancelled')
  )
);

ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_or_assigned_requests" ON assistance_requests;
CREATE POLICY "select_own_or_assigned_requests" ON assistance_requests FOR SELECT
  TO authenticated USING (
    auth.uid() = requester_id
    OR EXISTS (
      SELECT 1 FROM helpers h WHERE h.id = assistance_requests.helper_id AND h.profile_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "insert_own_requests" ON assistance_requests;
CREATE POLICY "insert_own_requests" ON assistance_requests FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "update_own_or_assigned_requests" ON assistance_requests;
CREATE POLICY "update_own_or_assigned_requests" ON assistance_requests FOR UPDATE
  TO authenticated USING (
    auth.uid() = requester_id
    OR EXISTS (
      SELECT 1 FROM helpers h WHERE h.id = assistance_requests.helper_id AND h.profile_id = auth.uid()
    )
  ) WITH CHECK (
    auth.uid() = requester_id
    OR EXISTS (
      SELECT 1 FROM helpers h WHERE h.id = assistance_requests.helper_id AND h.profile_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_assistance_requests_requester ON assistance_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_assistance_requests_helper ON assistance_requests(helper_id);
CREATE INDEX IF NOT EXISTS idx_assistance_requests_status ON assistance_requests(status);
CREATE INDEX IF NOT EXISTS idx_assistance_requests_created_at ON assistance_requests(created_at DESC);

-- ============================================================
-- HELPER_FEEDBACK
-- ============================================================
CREATE TABLE IF NOT EXISTS helper_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assistance_request_id uuid NOT NULL UNIQUE REFERENCES assistance_requests(id) ON DELETE CASCADE,
  helper_id uuid NOT NULL REFERENCES helpers(id) ON DELETE CASCADE,
  requester_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating int NOT NULL,
  comment text,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT helper_feedback_rating_check CHECK (rating BETWEEN 1 AND 5)
);

ALTER TABLE helper_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_helper_feedback" ON helper_feedback;
CREATE POLICY "select_helper_feedback" ON helper_feedback FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_completed_feedback" ON helper_feedback;
CREATE POLICY "insert_own_completed_feedback" ON helper_feedback FOR INSERT
  TO authenticated WITH CHECK (
    auth.uid() = requester_id
    AND EXISTS (
      SELECT 1 FROM assistance_requests ar
      WHERE ar.id = assistance_request_id
        AND ar.requester_id = auth.uid()
        AND ar.status = 'completed'
    )
  );

CREATE INDEX IF NOT EXISTS idx_helper_feedback_helper_id ON helper_feedback(helper_id);
CREATE INDEX IF NOT EXISTS idx_helper_feedback_created_at ON helper_feedback(created_at DESC);
