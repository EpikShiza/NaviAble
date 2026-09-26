-- NaviAble assistance request flow.
-- Keeps the existing schema and adds only the data needed for requester -> helper -> feedback.

ALTER TABLE helpers
  ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

DROP INDEX IF EXISTS idx_helpers_user_id_unique;
CREATE UNIQUE INDEX idx_helpers_user_id_unique
  ON helpers(user_id);

CREATE TABLE IF NOT EXISTS assistance_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  helper_id uuid NOT NULL REFERENCES helpers(id) ON DELETE RESTRICT,
  request_type text NOT NULL,
  location text NOT NULL,
  requested_for timestamptz,
  description text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','in_progress','completed','declined','cancelled')),
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  declined_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assistance_requests ENABLE ROW LEVEL SECURITY;

ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS assistance_request_id uuid REFERENCES assistance_requests(id) ON DELETE SET NULL;

ALTER TABLE feedback
  ADD COLUMN IF NOT EXISTS helper_id uuid REFERENCES helpers(id) ON DELETE SET NULL;

DROP POLICY IF EXISTS "insert_feedback" ON feedback;
CREATE POLICY "insert_feedback" ON feedback
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    assistance_request_id IS NULL
    OR (
      auth.uid() = user_id
      AND EXISTS (
        SELECT 1 FROM assistance_requests ar
        WHERE ar.id = feedback.assistance_request_id
          AND ar.requester_id = auth.uid()
          AND ar.status = 'completed'
          AND ar.helper_id = feedback.helper_id
      )
    )
  );

DROP POLICY IF EXISTS "requesters_select_own_requests" ON assistance_requests;
CREATE POLICY "requesters_select_own_requests" ON assistance_requests
  FOR SELECT TO authenticated
  USING (
    auth.uid() = requester_id
    OR EXISTS (SELECT 1 FROM helpers h WHERE h.id = assistance_requests.helper_id AND h.user_id = auth.uid())
  );

DROP POLICY IF EXISTS "requesters_insert_requests" ON assistance_requests;
CREATE POLICY "requesters_insert_requests" ON assistance_requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "request_participants_update" ON assistance_requests;
CREATE POLICY "request_participants_update" ON assistance_requests
  FOR UPDATE TO authenticated
  USING (
    auth.uid() = requester_id
    OR EXISTS (SELECT 1 FROM helpers h WHERE h.id = assistance_requests.helper_id AND h.user_id = auth.uid())
  )
  WITH CHECK (
    auth.uid() = requester_id
    OR EXISTS (SELECT 1 FROM helpers h WHERE h.id = assistance_requests.helper_id AND h.user_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_assistance_requests_requester ON assistance_requests(requester_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistance_requests_helper ON assistance_requests(helper_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_assistance_requests_status ON assistance_requests(status);
CREATE INDEX IF NOT EXISTS idx_feedback_helper_id ON feedback(helper_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_feedback_one_per_requester_request
  ON feedback(assistance_request_id, user_id)
  WHERE assistance_request_id IS NOT NULL AND user_id IS NOT NULL;

CREATE OR REPLACE FUNCTION set_assistance_request_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS assistance_requests_updated_at ON assistance_requests;
CREATE TRIGGER assistance_requests_updated_at
  BEFORE UPDATE ON assistance_requests
  FOR EACH ROW EXECUTE FUNCTION set_assistance_request_updated_at();
