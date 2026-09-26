import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Mail,
  Globe,
  Check,
  X,
  DoorOpen,
  ArrowUpRight,
  ArrowUpDown,
  Accessibility,
  SquareParking,
  Armchair,
  Route,
  Wrench,
  Calendar,
  HandHeart,
  User,
  Navigation,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CATEGORY_ICONS, CATEGORY_LABELS, DAY_ORDER, DAY_LABELS, DAY_FULL } from '@/lib/constants';
import { isOpenNow, formatOpeningHours, formatDate } from '@/lib/format';
import type { Place, PlaceFeature, PlaceAssistance } from '@/types';
import VerificationBadge from '@/components/VerificationBadge';

interface Props {
  place: Place;
  onBack: () => void;
  onStartQuest: (place: Place) => void;
}

const FEATURE_ICON_MAP: Record<string, typeof DoorOpen> = {
  entrance: DoorOpen,
  ramp: ArrowUpRight,
  lift: ArrowUpDown,
  toilet: Accessibility,
  parking: SquareParking,
  seating: Armchair,
  path: Route,
  equipment: Wrench,
};

export default function PlaceDetailPage({ place, onBack, onStartQuest }: Props) {
  const [features, setFeatures] = useState<PlaceFeature[]>([]);
  const [assistance, setAssistance] = useState<PlaceAssistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const [featRes, assistRes] = await Promise.all([
        supabase.from('place_features').select('*').eq('place_id', place.id).order('feature_type'),
        supabase.from('place_assistance').select('*').eq('place_id', place.id),
      ]);
      if (featRes.error || assistRes.error) {
        setError('Unable to load details.');
      } else {
        setFeatures(featRes.data || []);
        setAssistance(assistRes.data || []);
      }
      setLoading(false);
    }
    load();
  }, [place.id]);

  const Icon = CATEGORY_ICONS[place.category] || CATEGORY_ICONS.community;
  const open = isOpenNow(place.opening_hours);
  const hours = formatOpeningHours(place.opening_hours);

  const availableCount = features.filter((f) => f.is_available).length;

  return (
    <div className="space-y-6">
      <button onClick={onBack} className="btn-ghost -ml-3">
        <ArrowLeft className="h-4 w-4" />
        Back to Explore
      </button>

      {/* Header card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-blue-900 p-6 text-white sm:p-8">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <Icon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-extrabold leading-tight">{place.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-blue-200">
                <MapPin className="h-4 w-4" />
                {place.address}, {place.city}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={`badge ${
                    open
                      ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/30'
                      : 'bg-white/10 text-slate-300 ring-1 ring-white/20'
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  {open ? 'Open now' : 'Closed'}
                </span>
                <span className="badge bg-white/10 text-blue-200 ring-1 ring-white/20">
                  {CATEGORY_LABELS[place.category] || place.category}
                </span>
                <VerificationBadge status={place.verification_status} />
              </div>
            </div>
          </div>
          <button
            onClick={() => onStartQuest(place)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          >
            <Navigation className="h-4 w-4" />
            Start Route Quest
          </button>
        </div>
      </div>

      <p className="text-sm leading-relaxed text-slate-600">{place.description}</p>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="card text-center py-8">
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Accessibility Features */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Accessibility Features</h2>
              <span className="text-xs font-medium text-slate-400">
                {availableCount}/{features.length} available
              </span>
            </div>
            <div className="space-y-3">
              {features.length === 0 ? (
                <div className="card py-6 text-center">
                  <p className="text-sm text-slate-400">No accessibility details recorded yet.</p>
                </div>
              ) : (
                features.map((f) => {
                  const FeatureIcon = FEATURE_ICON_MAP[f.feature_type] || Check;
                  return (
                    <div
                      key={f.id}
                      className={`rounded-xl p-4 ring-1 transition-colors ${
                        f.is_available
                          ? 'bg-emerald-50/50 ring-emerald-200/50'
                          : 'bg-slate-50 ring-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div
                            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                              f.is_available
                                ? 'bg-emerald-100 text-emerald-600'
                                : 'bg-slate-200 text-slate-400'
                            }`}
                          >
                            <FeatureIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">{f.label}</p>
                            {f.details && (
                              <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                                {f.details}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              <VerificationBadge status={f.verification_status} />
                              <span className="text-[11px] text-slate-400">
                                Checked {formatDate(f.last_checked)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                            f.is_available
                              ? 'bg-emerald-500 text-white'
                              : 'bg-slate-300 text-white'
                          }`}
                        >
                          {f.is_available ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : (
                            <X className="h-3.5 w-3.5" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right column: Opening hours, Contact, Assistance */}
          <div className="space-y-6">
            {/* Opening Hours */}
            <div>
              <h2 className="section-title mb-4">Opening Hours</h2>
              <div className="card space-y-2">
                {hours.map((line, i) => {
                  const dayKey = DAY_ORDER[i];
                  const today = new Date().getDay();
                  const todayKey = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today];
                  const isToday = dayKey === todayKey;
                  return (
                    <div
                      key={dayKey}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
                        isToday ? 'bg-blue-50 font-semibold text-blue-700' : 'text-slate-600'
                      }`}
                    >
                      <span>{DAY_LABELS[dayKey]}</span>
                      <span>{line.split(': ')[1]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Contact */}
            <div>
              <h2 className="section-title mb-4">Contact</h2>
              <div className="card space-y-3">
                {place.phone && (
                  <a
                    href={`tel:${place.phone}`}
                    className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600"
                  >
                    <Phone className="h-4 w-4 text-slate-400" />
                    {place.phone}
                  </a>
                )}
                {place.email && (
                  <a
                    href={`mailto:${place.email}`}
                    className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600"
                  >
                    <Mail className="h-4 w-4 text-slate-400" />
                    {place.email}
                  </a>
                )}
                {place.website && (
                  <a
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-sm text-slate-600 hover:text-blue-600"
                  >
                    <Globe className="h-4 w-4 text-slate-400" />
                    Visit website
                  </a>
                )}
              </div>
            </div>

            {/* Assistance */}
            <div>
              <h2 className="section-title mb-4">Assistance Available</h2>
              <div className="space-y-3">
                {assistance.length === 0 ? (
                  <div className="card py-6 text-center">
                    <p className="text-sm text-slate-400">No assistance information recorded yet.</p>
                  </div>
                ) : (
                  assistance.map((a) => (
                    <div key={a.id} className="card space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600">
                          <HandHeart className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-slate-800">{a.assistance_type}</h3>
                          {a.description && (
                            <p className="mt-1 text-xs leading-relaxed text-slate-500">
                              {a.description}
                            </p>
                          )}
                        </div>
                        <VerificationBadge status={a.verification_status} />
                      </div>

                      <div className="space-y-1.5 rounded-lg bg-slate-50 p-3">
                        <p className="flex items-center gap-2 text-xs text-slate-600">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {a.availability}
                        </p>
                        {a.how_to_request && (
                          <p className="text-xs text-slate-500">
                            <span className="font-medium text-slate-600">How to request: </span>
                            {a.how_to_request}
                          </p>
                        )}
                        {a.contact_person && (
                          <p className="flex items-center gap-2 text-xs text-slate-500">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            {a.contact_person}
                            {a.contact_phone && (
                              <a
                                href={`tel:${a.contact_phone}`}
                                className="font-medium text-blue-600 hover:underline"
                              >
                                {a.contact_phone}
                              </a>
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Safety note */}
      <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
        <div className="flex gap-3">
          <Sparkles className="h-5 w-5 shrink-0 text-amber-500" />
          <p className="text-xs leading-relaxed text-amber-800">
            Accessibility details are provided for guidance only. Conditions can change — we recommend
            calling ahead to confirm specific features before travelling. Community-reported information
            has not been verified by the venue.
          </p>
        </div>
      </div>
    </div>
  );
}
