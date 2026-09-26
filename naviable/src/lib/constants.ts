import {
  Building2,
  Landmark,
  Trees,
  BookOpen,
  ShoppingBag,
  Coffee,
  Dumbbell,
  HeartPulse,
  type LucideIcon,
} from 'lucide-react';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  community: Building2,
  museum: Landmark,
  park: Trees,
  library: BookOpen,
  shopping: ShoppingBag,
  cafe: Coffee,
  sports: Dumbbell,
  healthcare: HeartPulse,
};

export const CATEGORY_LABELS: Record<string, string> = {
  community: 'Community',
  museum: 'Museum',
  park: 'Park',
  library: 'Library',
  shopping: 'Shopping',
  cafe: 'Cafe',
  sports: 'Sports',
  healthcare: 'Healthcare',
};

export const CATEGORIES = Object.keys(CATEGORY_LABELS);

export const FEATURE_ICONS: Record<string, string> = {
  entrance: 'DoorOpen',
  ramp: 'ArrowUpRight',
  lift: 'ArrowUpDown',
  toilet: 'Accessibility',
  parking: 'SquareParking',
  seating: 'Armchair',
  path: 'Route',
  equipment: 'Wrench',
};

export const DAY_ORDER = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export const DAY_LABELS: Record<string, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

export const DAY_FULL: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const WAYPOINT_COLORS: Record<string, string> = {
  start: '#22c55e',
  checkpoint: '#3b82f6',
  crossing: '#f59e0b',
  rest: '#8b5cf6',
  assistance: '#ec4899',
  finish: '#ef4444',
};
