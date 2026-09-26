import { DAY_ORDER, DAY_LABELS } from './constants';

export function formatOpeningHours(hours: Record<string, string> | null): string[] {
  if (!hours) return [];
  return DAY_ORDER.map((day) => {
    const label = DAY_LABELS[day];
    const value = hours[day] || hours[day.slice(0, 3)] || hours[day.charAt(0)];
    return `${label}: ${value || '—'}`;
  });
}

export function getTodayKey(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

export function isOpenNow(hours: Record<string, string> | null): boolean {
  if (!hours) return false;
  const today = getTodayKey();
  const todayHours = hours[today] || hours[today.slice(0, 3)];
  if (!todayHours || todayHours === 'closed') return false;

  const match = todayHours.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})/);
  if (!match) return false;

  const [, openH, openM, closeH, closeM] = match;
  const now = new Date();
  const currentMin = now.getHours() * 60 + now.getMinutes();
  const openMin = parseInt(openH) * 60 + parseInt(openM);
  const closeMin = parseInt(closeH) * 60 + parseInt(closeM);

  return currentMin >= openMin && currentMin < closeMin;
}

export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Unknown';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Unknown';
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
