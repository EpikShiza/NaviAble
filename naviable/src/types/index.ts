export type VerificationStatus = 'venue-confirmed' | 'community-reported' | 'unverified' | 'verified';
export type UserRole = 'traveler' | 'employee';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export type ApplicationStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';

export interface HelperApplication {
  id: string;
  user_id: string;
  status: ApplicationStatus;
  full_name: string;
  phone: string | null;
  city: string | null;
  service_area: string | null;
  skills: string[];
  languages: string[];
  years_experience: number;
  bio: string | null;
  certifications: string | null;
  availability_notes: string | null;
  reference_contacts: string | null;
  has_wheelchair_training: boolean;
  has_first_aid: boolean;
  consent_background_check: boolean;
  agree_to_code_of_conduct: boolean;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  description: string | null;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  email: string | null;
  website: string | null;
  opening_hours: Record<string, string> | null;
  image_url: string | null;
  verification_status: VerificationStatus;
  created_at: string;
}

export interface PlaceFeature {
  id: string;
  place_id: string;
  feature_type: string;
  label: string;
  is_available: boolean;
  details: string | null;
  verification_status: VerificationStatus;
  last_checked: string | null;
}

export interface PlaceAssistance {
  id: string;
  place_id: string;
  assistance_type: string;
  description: string | null;
  availability: string;
  day_of_week: string | null;
  start_time: string | null;
  end_time: string | null;
  how_to_request: string | null;
  contact_person: string | null;
  contact_phone: string | null;
  verification_status: VerificationStatus;
}

export interface Helper {
  id: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  skills: string[];
  languages: string[];
  verification_status: VerificationStatus;
  verified_date: string | null;
  years_experience: number;
  rating: number;
  review_count: number;
  phone: string | null;
  email: string | null;
  service_area: string | null;
  profile_id?: string | null;
}

export type RequestStatus = 'pending' | 'accepted' | 'declined' | 'in_progress' | 'completed' | 'cancelled';

export interface AssistanceRequest {
  id: string;
  requester_id: string;
  helper_id: string;
  place_id: string | null;
  request_type: string;
  description: string | null;
  location_text: string | null;
  preferred_time: string | null;
  status: RequestStatus;
  decline_reason: string | null;
  created_at: string;
  updated_at: string;
  accepted_at: string | null;
  completed_at: string | null;
}

export interface HelperFeedback {
  id: string;
  assistance_request_id: string;
  helper_id: string;
  requester_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface HelperAvailability {
  id: string;
  helper_id: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  notes: string | null;
}

export interface Lesson {
  id: string;
  title: string;
  category: string;
  summary: string;
  content: string;
  key_points: string[];
  duration_minutes: number;
  order_index: number;
}

export interface RouteWaypoint {
  id: string;
  place_id: string;
  order_index: number;
  label: string;
  waypoint_type: 'start' | 'checkpoint' | 'crossing' | 'rest' | 'assistance' | 'finish';
  description: string | null;
  latitude: number;
  longitude: number;
  assistance_available: boolean;
  assistance_note: string | null;
}

export interface Feedback {
  id: string;
  user_id: string | null;
  place_id: string | null;
  rating: number;
  tags: string[];
  written_feedback: string | null;
  accessibility_accurate: string | null;
  created_at: string;
}

export interface PlaceWithDetails extends Place {
  features?: PlaceFeature[];
  assistance?: PlaceAssistance[];
  waypoints?: RouteWaypoint[];
}
