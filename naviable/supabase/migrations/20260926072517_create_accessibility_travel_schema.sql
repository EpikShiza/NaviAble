/*
# Accessibility Travel Assistant — Schema & Seed Data

## Overview
Creates the full data model for an accessibility travel assistant app for disabled people.
The app is single-tenant (no sign-in), so all policies allow anon + authenticated access.

## New Tables
1. `places` — accessible destinations with location, opening hours, contact, verification status
2. `place_features` — accessibility features per place (ramps, lifts, toilets, parking, seating, etc.) with last-checked dates
3. `place_assistance` — what help a venue offers, availability windows, how to request, contact info
4. `helpers` — trained helper profiles: skills, verification status, bio, contact
5. `helper_availability` — weekly schedule slots for each helper
6. `lessons` — short consent-first wheelchair assistance lessons
7. `route_waypoints` — game-like route waypoints for the map quest feature

## Security
- RLS enabled on every table.
- All policies use `TO anon, authenticated` since this is a shared/public no-auth app.
- Full CRUD allowed for all users (community-contributed data model).
*/

-- ============================================================
-- PLACES
-- ============================================================
CREATE TABLE IF NOT EXISTS places (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL DEFAULT 'venue',
  description text,
  address text NOT NULL,
  city text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  phone text,
  email text,
  website text,
  opening_hours jsonb DEFAULT '{}',
  image_url text,
  verification_status text NOT NULL DEFAULT 'unverified',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE places ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_places" ON places;
CREATE POLICY "anon_select_places" ON places FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_places" ON places;
CREATE POLICY "anon_insert_places" ON places FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_places" ON places;
CREATE POLICY "anon_update_places" ON places FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_places" ON places;
CREATE POLICY "anon_delete_places" ON places FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- PLACE_FEATURES
-- ============================================================
CREATE TABLE IF NOT EXISTS place_features (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  feature_type text NOT NULL,
  label text NOT NULL,
  is_available boolean NOT NULL DEFAULT false,
  details text,
  verification_status text NOT NULL DEFAULT 'unverified',
  last_checked date,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE place_features ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_place_features" ON place_features;
CREATE POLICY "anon_select_place_features" ON place_features FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_place_features" ON place_features;
CREATE POLICY "anon_insert_place_features" ON place_features FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_place_features" ON place_features;
CREATE POLICY "anon_update_place_features" ON place_features FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_place_features" ON place_features;
CREATE POLICY "anon_delete_place_features" ON place_features FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- PLACE_ASSISTANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS place_assistance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  assistance_type text NOT NULL,
  description text,
  availability text NOT NULL,
  day_of_week text,
  start_time text,
  end_time text,
  how_to_request text,
  contact_person text,
  contact_phone text,
  verification_status text NOT NULL DEFAULT 'unverified',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE place_assistance ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_place_assistance" ON place_assistance;
CREATE POLICY "anon_select_place_assistance" ON place_assistance FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_place_assistance" ON place_assistance;
CREATE POLICY "anon_insert_place_assistance" ON place_assistance FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_place_assistance" ON place_assistance;
CREATE POLICY "anon_update_place_assistance" ON place_assistance FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_place_assistance" ON place_assistance;
CREATE POLICY "anon_delete_place_assistance" ON place_assistance FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- HELPERS
-- ============================================================
CREATE TABLE IF NOT EXISTS helpers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  avatar_url text,
  bio text,
  skills text[] DEFAULT '{}',
  languages text[] DEFAULT '{}',
  verification_status text NOT NULL DEFAULT 'unverified',
  verified_date date,
  years_experience int DEFAULT 0,
  rating numeric DEFAULT 0,
  review_count int DEFAULT 0,
  phone text,
  email text,
  service_area text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE helpers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_helpers" ON helpers;
CREATE POLICY "anon_select_helpers" ON helpers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_helpers" ON helpers;
CREATE POLICY "anon_insert_helpers" ON helpers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_helpers" ON helpers;
CREATE POLICY "anon_update_helpers" ON helpers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_helpers" ON helpers;
CREATE POLICY "anon_delete_helpers" ON helpers FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- HELPER_AVAILABILITY
-- ============================================================
CREATE TABLE IF NOT EXISTS helper_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  helper_id uuid NOT NULL REFERENCES helpers(id) ON DELETE CASCADE,
  day_of_week text NOT NULL,
  start_time text NOT NULL,
  end_time text NOT NULL,
  is_available boolean NOT NULL DEFAULT true,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE helper_availability ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_helper_availability" ON helper_availability;
CREATE POLICY "anon_select_helper_availability" ON helper_availability FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_helper_availability" ON helper_availability;
CREATE POLICY "anon_insert_helper_availability" ON helper_availability FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_helper_availability" ON helper_availability;
CREATE POLICY "anon_update_helper_availability" ON helper_availability FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_helper_availability" ON helper_availability;
CREATE POLICY "anon_delete_helper_availability" ON helper_availability FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- LESSONS
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  category text NOT NULL DEFAULT 'basics',
  summary text NOT NULL,
  content text NOT NULL,
  key_points text[] DEFAULT '{}',
  duration_minutes int DEFAULT 3,
  order_index int DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_lessons" ON lessons;
CREATE POLICY "anon_select_lessons" ON lessons FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_lessons" ON lessons;
CREATE POLICY "anon_insert_lessons" ON lessons FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_lessons" ON lessons;
CREATE POLICY "anon_update_lessons" ON lessons FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_lessons" ON lessons;
CREATE POLICY "anon_delete_lessons" ON lessons FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- ROUTE_WAYPOINTS
-- ============================================================
CREATE TABLE IF NOT EXISTS route_waypoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  place_id uuid NOT NULL REFERENCES places(id) ON DELETE CASCADE,
  order_index int NOT NULL DEFAULT 0,
  label text NOT NULL,
  waypoint_type text NOT NULL DEFAULT 'checkpoint',
  description text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  assistance_available boolean DEFAULT false,
  assistance_note text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE route_waypoints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_route_waypoints" ON route_waypoints;
CREATE POLICY "anon_select_route_waypoints" ON route_waypoints FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_route_waypoints" ON route_waypoints;
CREATE POLICY "anon_insert_route_waypoints" ON route_waypoints FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_route_waypoints" ON route_waypoints;
CREATE POLICY "anon_update_route_waypoints" ON route_waypoints FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_route_waypoints" ON route_waypoints;
CREATE POLICY "anon_delete_route_waypoints" ON route_waypoints FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- SEED: PLACES
-- ============================================================
INSERT INTO places (id, name, category, description, address, city, latitude, longitude, phone, email, website, opening_hours, verification_status) VALUES
('a1000000-0000-0000-0000-000000000001', 'Riverside Community Centre', 'community', 'A welcoming community hub with full step-free access, accessible toilets, and dedicated support staff.', '15 River Walk', 'London', 51.5074, -0.1278, '+44 20 7946 0001', 'info@riversidecc.org', 'https://riversidecc.org', '{"mon":"09:00-17:00","tue":"09:00-17:00","wed":"09:00-17:00","thu":"09:00-17:00","fri":"09:00-17:00","sat":"10:00-16:00","sun":"closed"}', 'venue-confirmed'),
('a1000000-0000-0000-0000-000000000002', 'Grand City Museum', 'museum', 'World-class exhibits with ramps, lifts to all floors, accessible toilets on every level, and free wheelchair loan.', '100 Museum Lane', 'London', 51.5098, -0.1342, '+44 20 7946 0002', 'access@museum.city', 'https://grandmuseum.city', '{"mon":"closed","tue":"10:00-18:00","wed":"10:00-18:00","thu":"10:00-20:00","fri":"10:00-18:00","sat":"10:00-18:00","sun":"10:00-18:00"}', 'venue-confirmed'),
('a1000000-0000-0000-0000-000000000003', 'Greenfield Park & Gardens', 'park', 'Expansive park with smooth paved paths, accessible picnic areas, and mobility scooter charging points.', '250 Garden Road', 'London', 51.5015, -0.1419, '+44 20 7946 0003', 'parks@city.gov', 'https://greenfieldpark.gov', '{"mon":"06:00-22:00","tue":"06:00-22:00","wed":"06:00-22:00","thu":"06:00-22:00","fri":"06:00-22:00","sat":"06:00-22:00","sun":"06:00-22:00"}', 'venue-confirmed'),
('a1000000-0000-0000-0000-000000000004', 'Central Library & Reading Rooms', 'library', 'Modern library with step-free entry, lifts, accessible study pods, and assistive technology workstations.', '5 Knowledge Square', 'London', 51.5145, -0.1258, '+44 20 7946 0004', 'help@centrallib.org', 'https://centrallib.org', '{"mon":"08:00-20:00","tue":"08:00-20:00","wed":"08:00-20:00","thu":"08:00-20:00","fri":"08:00-18:00","sat":"10:00-17:00","sun":"12:00-16:00"}', 'venue-confirmed'),
('a1000000-0000-0000-0000-000000000005', 'Harborview Shopping Centre', 'shopping', 'Three-level shopping centre with lifts, ramps, accessible toilets, designated parking bays, and a mobility assistance desk.', '1 Harbor Street', 'London', 51.5033, -0.1192, '+44 20 7946 0005', 'concierge@harborview.shop', 'https://harborview.shop', '{"mon":"09:00-21:00","tue":"09:00-21:00","wed":"09:00-21:00","thu":"09:00-21:00","fri":"09:00-21:00","sat":"09:00-21:00","sun":"10:00-18:00"}', 'venue-confirmed'),
('a1000000-0000-0000-0000-000000000006', 'Sunrise Cafe & Bistro', 'cafe', 'Cozy neighborhood cafe with ramp entry, wide aisles, accessible counter, and outdoor seating with shade umbrellas.', '42 Sunny Lane', 'London', 51.5101, -0.1305, '+44 20 7946 0006', 'hello@sunrisecafe.co', 'https://sunrisecafe.co', '{"mon":"08:00-18:00","tue":"08:00-18:00","wed":"08:00-18:00","thu":"08:00-18:00","fri":"08:00-20:00","sat":"09:00-20:00","sun":"09:00-17:00"}', 'community-reported'),
('a1000000-0000-0000-0000-000000000007', 'Riverside Sports Centre', 'sports', 'Adaptive sports facility with pool hoist, accessible changing rooms, and trained support staff for various activities.', '78 Sports Way', 'London', 51.5062, -0.1361, '+44 20 7946 0007', 'info@riversidesports.org', 'https://riversidesports.org', '{"mon":"06:00-22:00","tue":"06:00-22:00","wed":"06:00-22:00","thu":"06:00-22:00","fri":"06:00-22:00","sat":"07:00-20:00","sun":"08:00-18:00"}', 'venue-confirmed'),
('a1000000-0000-0000-0000-000000000008', 'City General Hospital — Outpatient Wing', 'healthcare', 'Outpatient wing with full accessibility: designated parking, ramp access, lifts, accessible toilets, and volunteer escorts.', '200 Health Boulevard', 'London', 51.5203, -0.1285, '+44 20 7946 0008', 'access@citygeneral.nhs', 'https://citygeneral.nhs', '{"mon":"07:00-20:00","tue":"07:00-20:00","wed":"07:00-20:00","thu":"07:00-20:00","fri":"07:00-20:00","sat":"08:00-16:00","sun":"closed"}', 'venue-confirmed')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: PLACE FEATURES
-- ============================================================
INSERT INTO place_features (place_id, feature_type, label, is_available, details, verification_status, last_checked) VALUES
('a1000000-0000-0000-0000-000000000001', 'entrance', 'Step-Free Entrance', true, 'Automatic sliding doors at street level with no threshold step.', 'venue-confirmed', '2026-08-15'),
('a1000000-0000-0000-0000-000000000001', 'ramp', 'Ramp Access', true, 'Gentle gradient ramp (1:20) at the side entrance.', 'venue-confirmed', '2026-08-15'),
('a1000000-0000-0000-0000-000000000001', 'toilet', 'Accessible Toilet', true, 'Right-hand transfer accessible toilet on the ground floor.', 'venue-confirmed', '2026-08-15'),
('a1000000-0000-0000-0000-000000000001', 'parking', 'Accessible Parking', true, '4 designated accessible bays within 30m of entrance.', 'venue-confirmed', '2026-08-15'),
('a1000000-0000-0000-0000-000000000001', 'seating', 'Accessible Seating', true, 'Removable seating in main hall to accommodate wheelchairs.', 'venue-confirmed', '2026-08-15'),
('a1000000-0000-0000-0000-000000000001', 'lift', 'Lift Access', false, 'Single-storey building — no lift required.', 'venue-confirmed', '2026-08-15'),
('a1000000-0000-0000-0000-000000000002', 'entrance', 'Step-Free Entrance', true, 'Level access through the main entrance with automatic doors.', 'venue-confirmed', '2026-09-01'),
('a1000000-0000-0000-0000-000000000002', 'ramp', 'Ramp Access', true, 'Ramp at rear entrance for deliveries and wheelchair users.', 'venue-confirmed', '2026-09-01'),
('a1000000-0000-0000-0000-000000000002', 'lift', 'Lift Access', true, 'Two large lifts serving all 4 floors with tactile buttons and voice announcements.', 'venue-confirmed', '2026-09-01'),
('a1000000-0000-0000-0000-000000000002', 'toilet', 'Accessible Toilets', true, 'Accessible toilets on every floor, including a Changing Places toilet on the ground floor.', 'venue-confirmed', '2026-09-01'),
('a1000000-0000-0000-0000-000000000002', 'parking', 'Accessible Parking', true, '12 accessible bays in the underground car park with lift to the museum.', 'venue-confirmed', '2026-09-01'),
('a1000000-0000-0000-0000-000000000002', 'seating', 'Accessible Seating', true, 'Wheelchair spaces in the lecture theatre and rest areas throughout galleries.', 'venue-confirmed', '2026-09-01'),
('a1000000-0000-0000-0000-000000000002', 'equipment', 'Wheelchair Loan', true, 'Free manual wheelchair loan — available at the information desk, no booking required.', 'venue-confirmed', '2026-09-01'),
('a1000000-0000-0000-0000-000000000003', 'entrance', 'Step-Free Entrance', true, 'Multiple step-free entries from all surrounding streets.', 'venue-confirmed', '2026-07-20'),
('a1000000-0000-0000-0000-000000000003', 'path', 'Smooth Paved Paths', true, 'Wide, smoothly paved paths throughout the park suitable for wheelchairs and scooters.', 'venue-confirmed', '2026-07-20'),
('a1000000-0000-0000-0000-000000000003', 'toilet', 'Accessible Toilets', true, '3 accessible toilets located at the north, central, and south entrances.', 'venue-confirmed', '2026-07-20'),
('a1000000-0000-0000-0000-000000000003', 'parking', 'Accessible Parking', true, '6 accessible bays at the main car park off Garden Road.', 'venue-confirmed', '2026-07-20'),
('a1000000-0000-0000-0000-000000000003', 'seating', 'Accessible Picnic Areas', true, 'Raised picnic tables with knee clearance at multiple locations.', 'venue-confirmed', '2026-07-20'),
('a1000000-0000-0000-0000-000000000003', 'equipment', 'Scooter Charging', true, '4 mobility scooter charging points near the cafe pavilion.', 'community-reported', '2026-06-10'),
('a1000000-0000-0000-0000-000000000004', 'entrance', 'Step-Free Entrance', true, 'Automatic doors at street level with a low-threshold entry.', 'venue-confirmed', '2026-09-10'),
('a1000000-0000-0000-0000-000000000004', 'lift', 'Lift Access', true, 'Two lifts to all 3 floors with Braille buttons and audible floor announcements.', 'venue-confirmed', '2026-09-10'),
('a1000000-0000-0000-0000-000000000004', 'toilet', 'Accessible Toilets', true, 'Accessible toilets on all floors with emergency pull cords.', 'venue-confirmed', '2026-09-10'),
('a1000000-0000-0000-0000-000000000004', 'seating', 'Accessible Study Pods', true, 'Adjustable-height study desks in the quiet study area.', 'venue-confirmed', '2026-09-10'),
('a1000000-0000-0000-0000-000000000004', 'equipment', 'Assistive Technology', true, 'Screen readers, magnifiers, and ergonomic input devices at 4 dedicated workstations.', 'venue-confirmed', '2026-09-10'),
('a1000000-0000-0000-0000-000000000005', 'entrance', 'Step-Free Entrance', true, 'All three entrances are step-free with automatic doors.', 'venue-confirmed', '2026-08-28'),
('a1000000-0000-0000-0000-000000000005', 'lift', 'Lift Access', true, 'Glass lifts to all 3 shopping levels with tactile and audible controls.', 'venue-confirmed', '2026-08-28'),
('a1000000-0000-0000-0000-000000000005', 'ramp', 'Ramp Access', true, 'Ramps connect all levels as an alternative to lifts and escalators.', 'venue-confirmed', '2026-08-28'),
('a1000000-0000-0000-0000-000000000005', 'toilet', 'Accessible Toilets', true, 'Accessible toilets on every level near the lift lobbies.', 'venue-confirmed', '2026-08-28'),
('a1000000-0000-0000-0000-000000000005', 'parking', 'Accessible Parking', true, '20 designated accessible bays across two car parks with extra-wide spaces.', 'venue-confirmed', '2026-08-28'),
('a1000000-0000-0000-0000-000000000005', 'seating', 'Rest Seating Areas', true, 'Bench seating with armrests at regular intervals throughout the centre.', 'venue-confirmed', '2026-08-28'),
('a1000000-0000-0000-0000-000000000006', 'entrance', 'Step-Free Entrance', true, 'Portable ramp available — staff will deploy on request.', 'community-reported', '2026-05-12'),
('a1000000-0000-0000-0000-000000000006', 'toilet', 'Accessible Toilet', false, 'No accessible toilet on-site. Nearest accessible toilet is at the library 200m away.', 'community-reported', '2026-05-12'),
('a1000000-0000-0000-0000-000000000006', 'seating', 'Accessible Seating', true, 'Tables with removable chairs and wide aisles between seating rows.', 'community-reported', '2026-05-12'),
('a1000000-0000-0000-0000-000000000006', 'parking', 'Accessible Parking', false, 'No on-site parking. Street parking available with 1 accessible bay 50m away.', 'unverified', NULL),
('a1000000-0000-0000-0000-000000000007', 'entrance', 'Step-Free Entrance', true, 'Level access through the main entrance with wide automatic doors.', 'venue-confirmed', '2026-08-05'),
('a1000000-0000-0000-0000-000000000007', 'lift', 'Lift Access', true, 'Lift to the upper gym level and pool viewing gallery.', 'venue-confirmed', '2026-08-05'),
('a1000000-0000-0000-0000-000000000007', 'toilet', 'Accessible Changing Rooms', true, 'Accessible changing rooms with shower seats and grab rails.', 'venue-confirmed', '2026-08-05'),
('a1000000-0000-0000-0000-000000000007', 'parking', 'Accessible Parking', true, '8 accessible bays in the main car park.', 'venue-confirmed', '2026-08-05'),
('a1000000-0000-0000-0000-000000000007', 'equipment', 'Pool Hoist', true, 'Ceiling-mounted pool hoist with trained staff assistance available.', 'venue-confirmed', '2026-08-05'),
('a1000000-0000-0000-0000-000000000008', 'entrance', 'Step-Free Entrance', true, 'Step-free main entrance with wide automatic sliding doors.', 'venue-confirmed', '2026-09-15'),
('a1000000-0000-0000-0000-000000000008', 'lift', 'Lift Access', true, 'Lifts to all floors with large buttons and voice announcements.', 'venue-confirmed', '2026-09-15'),
('a1000000-0000-0000-0000-000000000008', 'toilet', 'Accessible Toilets', true, 'Accessible toilets on every floor, plus a Changing Places facility on the ground floor.', 'venue-confirmed', '2026-09-15'),
('a1000000-0000-0000-0000-000000000008', 'parking', 'Accessible Parking', true, '30 accessible bays in the multi-storey car park with lift access to the hospital.', 'venue-confirmed', '2026-09-15'),
('a1000000-0000-0000-0000-000000000008', 'seating', 'Accessible Waiting Areas', true, 'Dedicated wheelchair-friendly waiting areas in every outpatient clinic.', 'venue-confirmed', '2026-09-15')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: PLACE ASSISTANCE
-- ============================================================
INSERT INTO place_assistance (place_id, assistance_type, description, availability, day_of_week, start_time, end_time, how_to_request, contact_person, contact_phone, verification_status) VALUES
('a1000000-0000-0000-0000-000000000001', 'volunteer escort', 'A volunteer can meet you at the entrance and guide you to your destination within the centre.', 'Mon–Fri, 09:00–16:00', 'monday', '09:00', '16:00', 'Call ahead or ask at the reception desk on arrival.', 'Reception Desk', '+44 20 7946 0001', 'venue-confirmed'),
('a1000000-0000-0000-0000-000000000002', 'wheelchair loan', 'Free manual wheelchair loan for the duration of your visit.', 'Tue–Sun, 10:00–17:30', 'tuesday', '10:00', '17:30', 'Available at the information desk — first come, first served. Photo ID required.', 'Information Desk', '+44 20 7946 0002', 'venue-confirmed'),
('a1000000-0000-0000-0000-000000000002', 'guided accessible tour', 'Monthly guided tour designed for visitors with mobility needs, covering highlights with step-free routes.', 'First Saturday of each month, 11:00–12:30', 'saturday', '11:00', '12:30', 'Book online or call the access line.', 'Access Coordinator', '+44 20 7946 0002', 'venue-confirmed'),
('a1000000-0000-0000-0000-000000000003', 'mobility scooter hire', 'Mobility scooters available for free loan within the park.', 'Daily, 09:00–17:00', 'monday', '09:00', '17:00', 'Visit the park centre near the north entrance. ID and a small refundable deposit required.', 'Park Centre', '+44 20 7946 0003', 'venue-confirmed'),
('a1000000-0000-0000-0000-000000000005', 'shopping assistance', 'Personal shopping assistant can help with browsing, carrying items, and reaching products.', 'Daily, 10:00–18:00', 'monday', '10:00', '18:00', 'Book at the concierge desk on the ground floor or call ahead.', 'Concierge Desk', '+44 20 7946 0005', 'venue-confirmed'),
('a1000000-0000-0000-0000-000000000007', 'pool support', 'Trained staff provide pool hoist assistance and in-water support for adaptive swimming sessions.', 'Tue and Thu, 10:00–12:00', 'tuesday', '10:00', '12:00', 'Book at least 24 hours in advance by phone.', 'Swim Coordinator', '+44 20 7946 0007', 'venue-confirmed'),
('a1000000-0000-0000-0000-000000000008', 'volunteer escort', 'Volunteer escorts available to guide you from the car park or entrance to your appointment.', 'Mon–Fri, 07:00–19:00', 'monday', '07:00', '19:00', 'Call the access line at least 1 hour before your appointment.', 'Patient Access Team', '+44 20 7946 0008', 'venue-confirmed')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: HELPERS
-- ============================================================
INSERT INTO helpers (id, name, avatar_url, bio, skills, languages, verification_status, verified_date, years_experience, rating, review_count, phone, email, service_area) VALUES
('b1000000-0000-0000-0000-000000000001', 'Sarah Mitchell', NULL, 'Certified access assistant with 8 years of experience supporting wheelchair users in central London. Patient, friendly, and always consent-first.', ARRAY['wheelchair assistance','mobility scooter guidance','route planning','travel companion'], ARRAY['English','French'], 'verified', '2026-01-15', 8, 4.9, 127, '+44 7700 900001', 'sarah.mitchell@accesshelp.org', 'Central London'),
('b1000000-0000-0000-0000-000000000002', 'James Okonkwo', NULL, 'Former NHS care worker turned independent access assistant. Specializes in hospital visits, medical appointments, and transport navigation.', ARRAY['wheelchair assistance','hospital escort','transport navigation','lifting techniques'], ARRAY['English','Igbo'], 'verified', '2026-03-20', 6, 4.8, 89, '+44 7700 900002', 'james.okonkwo@accesshelp.org', 'Central & North London'),
('b1000000-0000-0000-0000-000000000003', 'Priya Sharma', NULL, 'Occupational therapy student with a passion for accessible travel. Trained in safe wheelchair handling and route accessibility assessment.', ARRAY['wheelchair assistance','route assessment','accessible route planning','companion support'], ARRAY['English','Hindi','Punjabi'], 'verified', '2026-06-10', 3, 4.7, 42, '+44 7700 900003', 'priya.sharma@accesshelp.org', 'South London'),
('b1000000-0000-0000-0000-000000000004', 'Marcus Chen', NULL, 'Community volunteer and adaptive sports enthusiast. Helps with park visits, sports centre access, and outdoor accessibility.', ARRAY['wheelchair assistance','outdoor navigation','adaptive sports support','scooter handling'], ARRAY['English','Mandarin'], 'verified', '2026-02-08', 5, 4.8, 67, '+44 7700 900004', 'marcus.chen@accesshelp.org', 'East London'),
('b1000000-0000-0000-0000-000000000005', 'Elena Rodriguez', NULL, 'Trained in disability awareness and accessible tourism. Enjoys helping people discover museums, galleries, and cultural venues.', ARRAY['wheelchair assistance','cultural venue navigation','accessible tourism','travel companion'], ARRAY['English','Spanish','Portuguese'], 'verified', '2026-04-18', 7, 5.0, 95, '+44 7700 900005', 'elena.rodriguez@accesshelp.org', 'Central & West London'),
('b1000000-0000-0000-0000-000000000006', 'David Thompson', NULL, 'Retired nurse with deep knowledge of accessibility needs. Provides calm, reliable support for shopping trips and errands.', ARRAY['wheelchair assistance','shopping support','medical knowledge','patient care'], ARRAY['English'], 'verified', '2026-05-22', 4, 4.6, 31, '+44 7700 900006', 'david.thompson@accesshelp.org', 'West London')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED: HELPER AVAILABILITY
-- ============================================================
INSERT INTO helper_availability (helper_id, day_of_week, start_time, end_time, is_available, notes) VALUES
('b1000000-0000-0000-0000-000000000001', 'monday', '08:00', '18:00', true, NULL),
('b1000000-0000-0000-0000-000000000001', 'tuesday', '08:00', '18:00', true, NULL),
('b1000000-0000-0000-0000-000000000001', 'wednesday', '08:00', '14:00', true, 'Half day — mornings only'),
('b1000000-0000-0000-0000-000000000001', 'thursday', '08:00', '18:00', true, NULL),
('b1000000-0000-0000-0000-000000000001', 'friday', '08:00', '18:00', true, NULL),
('b1000000-0000-0000-0000-000000000001', 'saturday', '09:00', '16:00', true, 'Weekend shifts available'),
('b1000000-0000-0000-0000-000000000001', 'sunday', '00:00', '00:00', false, 'Not available'),
('b1000000-0000-0000-0000-000000000002', 'monday', '07:00', '19:00', true, NULL),
('b1000000-0000-0000-0000-000000000002', 'tuesday', '07:00', '19:00', true, NULL),
('b1000000-0000-0000-0000-000000000002', 'wednesday', '07:00', '19:00', true, NULL),
('b1000000-0000-0000-0000-000000000002', 'thursday', '07:00', '15:00', true, 'Half day'),
('b1000000-0000-0000-0000-000000000002', 'friday', '07:00', '19:00', true, NULL),
('b1000000-0000-0000-0000-000000000002', 'saturday', '00:00', '00:00', false, 'Not available'),
('b1000000-0000-0000-0000-000000000002', 'sunday', '00:00', '00:00', false, 'Not available'),
('b1000000-0000-0000-0000-000000000003', 'monday', '09:00', '17:00', true, NULL),
('b1000000-0000-0000-0000-000000000003', 'tuesday', '09:00', '17:00', true, NULL),
('b1000000-0000-0000-0000-000000000003', 'wednesday', '00:00', '00:00', false, 'University day'),
('b1000000-0000-0000-0000-000000000003', 'thursday', '09:00', '17:00', true, NULL),
('b1000000-0000-0000-0000-000000000003', 'friday', '09:00', '15:00', true, 'Half day'),
('b1000000-0000-0000-0000-000000000003', 'saturday', '10:00', '16:00', true, NULL),
('b1000000-0000-0000-0000-000000000003', 'sunday', '00:00', '00:00', false, 'Not available'),
('b1000000-0000-0000-0000-000000000004', 'monday', '00:00', '00:00', false, 'Not available'),
('b1000000-0000-0000-0000-000000000004', 'tuesday', '10:00', '18:00', true, NULL),
('b1000000-0000-0000-0000-000000000004', 'wednesday', '10:00', '18:00', true, NULL),
('b1000000-0000-0000-0000-000000000004', 'thursday', '10:00', '18:00', true, NULL),
('b1000000-0000-0000-0000-000000000004', 'friday', '10:00', '18:00', true, NULL),
('b1000000-0000-0000-0000-000000000004', 'saturday', '08:00', '20:00', true, 'Full weekend availability'),
('b1000000-0000-0000-0000-000000000004', 'sunday', '08:00', '20:00', true, 'Full weekend availability'),
('b1000000-0000-0000-0000-000000000005', 'monday', '09:00', '17:00', true, NULL),
('b1000000-0000-0000-0000-000000000005', 'tuesday', '09:00', '17:00', true, NULL),
('b1000000-0000-0000-0000-000000000005', 'wednesday', '09:00', '17:00', true, NULL),
('b1000000-0000-0000-0000-000000000005', 'thursday', '09:00', '17:00', true, NULL),
('b1000000-0000-0000-0000-000000000005', 'friday', '09:00', '17:00', true, NULL),
('b1000000-0000-0000-0000-000000000005', 'saturday', '10:00', '18:00', true, NULL),
('b1000000-0000-0000-0000-000000000005', 'sunday', '12:00', '17:00', true, 'Afternoons only'),
('b1000000-0000-0000-0000-000000000006', 'monday', '10:00', '16:00', true, NULL),
('b1000000-0000-0000-0000-000000000006', 'tuesday', '10:00', '16:00', true, NULL),
('b1000000-0000-0000-0000-000000000006', 'wednesday', '00:00', '00:00', false, 'Not available'),
('b1000000-0000-0000-0000-000000000006', 'thursday', '10:00', '16:00', true, NULL),
('b1000000-0000-0000-0000-000000000006', 'friday', '10:00', '16:00', true, NULL),
('b1000000-0000-0000-0000-000000000006', 'saturday', '10:00', '14:00', true, 'Mornings only'),
('b1000000-0000-0000-0000-000000000006', 'sunday', '00:00', '00:00', false, 'Not available')
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: LESSONS
-- ============================================================
INSERT INTO lessons (title, category, summary, content, key_points, duration_minutes, order_index) VALUES
('Always Ask First: Consent in Assistance', 'consent', 'The single most important rule: always ask the person before touching them or their wheelchair.', 'Every person with a disability is the expert on their own body and equipment. Before you help, introduce yourself and ask: "Would you like some assistance?" Then listen carefully to the answer.

If they say yes, ask how they would like to be helped. If they say no, respect that completely — no persuasion, no offence taken. They may have declined for a reason you cannot see, such as pain, a specific technique they prefer, or simply not needing help.

Consent is not a one-time question. Check in during the assistance too: "Is this speed okay?" "Would you like me to adjust anything?" The person can change their mind at any point.', ARRAY['Ask before you act — every time','The person knows their needs best','Respect a no as fully as a yes','Keep checking in during assistance'], 3, 1),
('Wheelchair Basics: Knowing the Parts', 'basics', 'Understand the key parts of a wheelchair so you can communicate clearly about assistance.', 'A wheelchair has several parts that matter when assisting:

- Push handles — at the top of the backrest. Use these to push from behind.
- Hand rims — the metal rings on the wheels. The user pushes these to self-propel.
- Brakes (or wheel locks) — usually a lever on each side that locks the wheel in place. Always engage brakes before the person transfers in or out.
- Footplates — where the feet rest. These can often swing away.
- Armrests — some are removable to make sideways transfer easier.

Wheelchair designs vary widely. Power chairs, sports chairs, and tilt-in-space chairs all work differently. Ask the person to explain their chair if you are unsure.', ARRAY['Learn the parts: push handles, brakes, footplates, armrests','Always engage brakes before transfers','Wheelchair designs differ — ask if unsure'], 4, 2),
('Engaging the Brakes: A Critical Habit', 'safety', 'Locking the brakes is the most important safety step before any transfer or stationary stop.', 'Brakes (also called wheel locks) prevent the wheelchair from rolling. This is critical:

- Before the person stands up or sits down (transfers in or out)
- When stopped on any slope, even a gentle one
- On public transport, before the vehicle moves
- During any adjustment to the chair

To engage: push the brake lever forward (on most chairs) until it clicks. Test by gently trying to roll the chair — it should not move. To release: pull the lever back.

Some brakes are push-lock (push to lock, push to release). Some are pull-lock. Power chairs have electronic brakes that engage automatically when the joystick is released.

Never assume the brakes are on. Always check.', ARRAY['Engage brakes before every transfer','Always lock brakes on slopes and transport','Test that the brake is actually holding','Brake types vary — learn the specific chair'], 3, 3),
('Pushing a Wheelchair Safely', 'technique', 'Learn the fundamentals of pushing a wheelchair smoothly and safely on different surfaces.', 'When pushing from behind:

- Use both hands on the push handles for control
- Walk at the persons pace, not yours
- Communicate before changes: "Small step ahead," "Turning left," "Slight slope"

On slopes:
- Going downhill, lean back and control the speed — never let the chair run away
- Going uphill, push steadily; if it is too steep, ask the person if they prefer to self-propel
- On very steep slopes, consider an alternative route

Over thresholds and small steps:
- For a small step up, tilt the chair slightly back on the rear wheels and roll over — but only if you have been shown how, and only for very small lips
- For steps, NEVER attempt to carry or lift the chair unless you are specifically trained
- Use ramps or lifts whenever available', ARRAY['Use both hands on push handles','Communicate every change in terrain','Control speed on downhill slopes','Never lift or carry without training'], 4, 4),
('Never Lift or Tip Without Training', 'safety', 'Lifting or tipping a wheelchair can cause serious injury. Know the limits and when to get help.', 'Lifting a person in a wheelchair is a high-risk action that requires specific training. General rules:

- Never lift a wheelchair with the person in it unless you have been trained and there is no safe alternative
- Never tip the chair backward to go down stairs with the person in it
- Never attempt to carry a power chair — they are extremely heavy

If you encounter stairs with no lift or ramp:
- Help the person transfer out of the chair if they are able and willing
- Carry the empty chair with another person (one at the front, one at the back)
- Help the person navigate the stairs in the way they prefer
- If the person cannot transfer, find an alternative accessible route — do not attempt the stairs

In emergencies, follow the persons lead. They know their body and their chair better than anyone.', ARRAY['Lifting is high-risk — training required','Never tip backward with a person in the chair','Power chairs are too heavy to lift safely','Find alternative routes instead of using stairs'], 3, 5),
('Assisting with Transfers', 'technique', 'Help someone move between their wheelchair and another seat, car, or bed — only with their guidance.', 'A transfer is when the person moves from the wheelchair to another surface. Your role is to support, not to lift.

Before assisting:
- Ask: "How would you like to do this?" — they will tell you their method
- Ensure the brakes are engaged
- Position the wheelchair close to the destination surface
- Check that footplates and armrests are moved if needed (ask first)

During the transfer:
- Offer a steadying arm or hand only where they want it
- Let them control the movement — do not pull or push them
- Be ready to support their balance if they ask for it

After:
- Make sure they are comfortable and stable before you move the chair
- Engage brakes on the chair if they will use it again soon

Some people use sliding boards. Some stand and pivot. Some fully lift themselves. Each method is different — let them lead.', ARRAY['Always ask how they want to transfer','Lock brakes before any transfer','Let them control the movement — do not lift','Offer a steadying arm, not a lifting force'], 4, 6),
('Navigating Doors and Narrow Spaces', 'technique', 'Practical techniques for getting through doors, corridors, and tight spaces smoothly.', 'Through doors:
- If the door opens toward you, pull it open, hold it with your body, and push the chair through
- If the door opens away from you, push it open and hold it with one hand while guiding the chair through with the other
- Automatic doors: slow down, let them open fully, then proceed
- Revolving doors: avoid them. Use the accessible side door instead

In narrow corridors:
- Center the chair in the passage
- Go slowly and watch for obstacles
- Communicate: "Narrowing ahead, slightly right"

In lifts:
- Enter first if possible, then pull the chair in backwards (so the person faces out)
- Or enter pushing forwards and turn the chair inside
- Engage brakes once inside
- Ask which floor before pressing buttons', ARRAY['Hold doors with your body, not your foot on the wheel','Avoid revolving doors — use the side door','Enter lifts backwards when possible','Engage brakes inside lifts'], 3, 7),
('Communication and Respect', 'consent', 'How to communicate respectfully with a wheelchair user throughout your time together.', 'Speak directly to the person in the wheelchair, not to a companion or carer. They are the primary person you are assisting.

Use clear, specific language:
- "There is a ramp to the left" is more helpful than "The accessible way is over there"
- "About 10 metres ahead, slight downhill" gives them real information

Do not lean on the wheelchair — it is part of the persons personal space, like an extension of their body.

Do not move the chair without telling the person first, even small adjustments.

If the person is with a companion, still address the person you are assisting. The companion can help if the person asks them to.

Be natural. You do not need to use different language or tone. Just be respectful, clear, and responsive.', ARRAY['Speak directly to the person, not a companion','Be specific with directions and distances','Do not lean on or rest against the wheelchair','Never move the chair without telling them'], 3, 8)
ON CONFLICT DO NOTHING;

-- ============================================================
-- SEED: ROUTE WAYPOINTS
-- ============================================================
INSERT INTO route_waypoints (place_id, order_index, label, waypoint_type, description, latitude, longitude, assistance_available, assistance_note) VALUES
('a1000000-0000-0000-0000-000000000001', 0, 'Starting Point — Riverside Community Centre', 'start', 'Your journey begins here. Check in at reception for any assistance you need.', 51.5074, -0.1278, true, 'Volunteer escorts available Mon–Fri, 09:00–16:00'),
('a1000000-0000-0000-0000-000000000001', 1, 'Accessible Crossing — River Walk', 'crossing', 'Signal-controlled pedestrian crossing with tactile paving and audible signals.', 51.5080, -0.1285, false, NULL),
('a1000000-0000-0000-0000-000000000001', 2, 'Rest Stop — Bench with Armrests', 'rest', 'Seated rest point with shade. Good spot to check your route before the next leg.', 51.5088, -0.1310, false, NULL),
('a1000000-0000-0000-0000-000000000001', 3, 'Assistance Point — Grand City Museum', 'assistance', 'Wheelchair loan and accessible tours available. Accessible toilets on all floors.', 51.5098, -0.1342, true, 'Free wheelchair loan at the information desk'),
('a1000000-0000-0000-0000-000000000001', 4, 'Cafe Stop — Sunrise Cafe', 'rest', 'Refuel and rest. Ramp entry available on request. Wide aisles inside.', 51.5101, -0.1305, false, NULL),
('a1000000-0000-0000-0000-000000000001', 5, 'Destination — Central Library', 'finish', 'You have arrived! Accessible study pods, assistive technology, and quiet spaces await.', 51.5145, -0.1258, true, 'Staff assistance available at all service desks')
ON CONFLICT DO NOTHING;

INSERT INTO route_waypoints (place_id, order_index, label, waypoint_type, description, latitude, longitude, assistance_available, assistance_note) VALUES
('a1000000-0000-0000-0000-000000000003', 0, 'Starting Point — Greenfield Park North Gate', 'start', 'Begin your park adventure here. Scooter hire available at the park centre.', 51.5015, -0.1419, true, 'Free mobility scooter hire, 09:00–17:00'),
('a1000000-0000-0000-0000-000000000003', 1, 'Waypoint — Rose Garden Path', 'checkpoint', 'Smooth paved path through the rose garden. Enjoy the sensory experience.', 51.5025, -0.1425, false, NULL),
('a1000000-0000-0000-0000-000000000003', 2, 'Assistance Point — Scooter Charging Hub', 'assistance', '4 mobility scooter charging points near the cafe pavilion. Rest and recharge.', 51.5035, -0.1410, true, 'Scooter charging and accessible toilets nearby'),
('a1000000-0000-0000-0000-000000000003', 3, 'Waypoint — Lake View Point', 'checkpoint', 'Accessible viewing platform over the lake with bench seating.', 51.5045, -0.1405, false, NULL),
('a1000000-0000-0000-0000-000000000003', 4, 'Rest Stop — Picnic Area', 'rest', 'Raised picnic tables with knee clearance. Great spot for a break.', 51.5055, -0.1412, false, NULL),
('a1000000-0000-0000-0000-000000000003', 5, 'Destination — South Gate Exit', 'finish', 'You have completed the park route! Accessible toilet and parking at the south gate.', 51.5065, -0.1419, true, 'Accessible parking and toilet at south gate')
ON CONFLICT DO NOTHING;

INSERT INTO route_waypoints (place_id, order_index, label, waypoint_type, description, latitude, longitude, assistance_available, assistance_note) VALUES
('a1000000-0000-0000-0000-000000000005', 0, 'Starting Point — Harborview Shopping Centre', 'start', 'Begin your shopping journey. Concierge desk on the ground floor can assist.', 51.5033, -0.1192, true, 'Personal shopping assistant available 10:00–18:00'),
('a1000000-0000-0000-0000-000000000005', 1, 'Level 1 — Accessible Toilets', 'checkpoint', 'Accessible toilet near the lift lobby. Emergency pull cord installed.', 51.5035, -0.1195, false, NULL),
('a1000000-0000-0000-0000-000000000005', 2, 'Level 2 — Rest Area', 'rest', 'Bench seating with armrests. Take a break between shops.', 51.5037, -0.1198, false, NULL),
('a1000000-0000-0000-0000-000000000005', 3, 'Assistance Point — Food Court', 'assistance', 'Staff can help with carrying trays and finding accessible seating.', 51.5039, -0.1201, true, 'Staff assistance for trays and seating'),
('a1000000-0000-0000-0000-000000000005', 4, 'Level 3 — Accessible Fitting Rooms', 'checkpoint', 'Spacious accessible fitting rooms in the department store.', 51.5041, -0.1204, false, NULL),
('a1000000-0000-0000-0000-000000000005', 5, 'Destination — Ground Floor Exit', 'finish', 'You have completed your shopping route! Concierge can help you to your car.', 51.5033, -0.1192, true, 'Concierge escort to car park available')
ON CONFLICT DO NOTHING;

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_places_city ON places(city);
CREATE INDEX IF NOT EXISTS idx_places_category ON places(category);
CREATE INDEX IF NOT EXISTS idx_place_features_place_id ON place_features(place_id);
CREATE INDEX IF NOT EXISTS idx_place_assistance_place_id ON place_assistance(place_id);
CREATE INDEX IF NOT EXISTS idx_helper_availability_helper_id ON helper_availability(helper_id);
CREATE INDEX IF NOT EXISTS idx_route_waypoints_place_id ON route_waypoints(place_id);
CREATE INDEX IF NOT EXISTS idx_lessons_order ON lessons(order_index);
