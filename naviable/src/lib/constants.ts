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

export const REQUEST_STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  declined: 'Declined',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export const REQUEST_STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  accepted: 'bg-blue-50 text-blue-700 ring-1 ring-blue-200',
  declined: 'bg-red-50 text-red-700 ring-1 ring-red-200',
  in_progress: 'bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200',
  completed: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  cancelled: 'bg-slate-100 text-slate-500 ring-1 ring-slate-200',
};

export const WAYPOINT_COLORS: Record<string, string> = {
  start: '#22c55e',
  checkpoint: '#3b82f6',
  crossing: '#f59e0b',
  rest: '#8b5cf6',
  assistance: '#ec4899',
  finish: '#ef4444',
};
