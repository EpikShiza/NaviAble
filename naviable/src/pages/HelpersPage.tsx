import { useEffect, useState, useMemo } from 'react';
import {
  Search,
  Star,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Clock,
  Check,
  X,
  Loader2,
  HandHeart,
  Languages,
  Calendar,
  Send,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { DAY_ORDER, DAY_LABELS } from '@/lib/constants';
import { formatRating, formatDate } from '@/lib/format';
import type { Helper, HelperAvailability } from '@/types';
import VerificationBadge from '@/components/VerificationBadge';

interface HelperWithAvailability extends Helper {
  availability?: HelperAvailability[];
}

interface Props {
  onRequestCreated?: () => void;
  onSignInRequired?: () => void;
}

export default function HelpersPage({ onRequestCreated, onSignInRequired }: Props) {
  const [helpers, setHelpers] = useState<HelperWithAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [skillFilter, setSkillFilter] = useState('all');
  const { user } = useAuth();
  const [selectedHelper, setSelectedHelper] = useState<HelperWithAvailability | null>(null);
  const [requestOpen, setRequestOpen] = useState(false);
  const [requestType, setRequestType] = useState('Wheelchair assistance');
  const [requestLocation, setRequestLocation] = useState('');
  const [requestedFor, setRequestedFor] = useState('');
  const [requestDescription, setRequestDescription] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('helpers')
        .select('*, helper_availability(*)');
      if (err) {
        setError('Unable to load helpers.');
      } else {
        setHelpers(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const allSkills = useMemo(() => {
    const skills = new Set<string>();
    helpers.forEach((h) => h.skills?.forEach((s) => skills.add(s)));
    return Array.from(skills).sort();
  }, [helpers]);

  const filtered = useMemo(() => {
    return helpers.filter((h) => {
      const matchesSearch =
        !search ||
        h.name.toLowerCase().includes(search.toLowerCase()) ||
        h.bio?.toLowerCase().includes(search.toLowerCase()) ||
        h.service_area?.toLowerCase().includes(search.toLowerCase());
      const matchesSkill = skillFilter === 'all' || h.skills?.includes(skillFilter);
      return matchesSearch && matchesSkill;
    });
  }, [helpers, search, skillFilter]);

  function getTodayAvailability(helper: HelperWithAvailability): HelperAvailability | undefined {
    const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][new Date().getDay()];
    return helper.availability?.find((a) => a.day_of_week === today);
  }

  function openRequest() {
    if (!user) {
      onSignInRequired?.();
      return;
    }
    setRequestError(null);
    setRequestOpen(true);
  }

  async function submitRequest() {
    if (!user || !selectedHelper) return;
    if (!requestLocation.trim()) { setRequestError('Please add the place or location where you need help.'); return; }
    setRequestSubmitting(true);
    setRequestError(null);
    const { error: err } = await supabase.from('assistance_requests').insert({
      requester_id: user.id,
      helper_id: selectedHelper.id,
      request_type: requestType,
      location: requestLocation.trim(),
      requested_for: requestedFor ? new Date(requestedFor).toISOString() : null,
      description: requestDescription.trim() || null,
    });
    if (err) {
      setRequestError(err.message);
      setRequestSubmitting(false);
      return;
    }
    setRequestSubmitting(false);
    setRequestOpen(false);
    setSelectedHelper(null);
    setRequestLocation('');
    setRequestedFor('');
    setRequestDescription('');
    onRequestCreated?.();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 p-6 text-white sm:p-8">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">Trained Helpers</h1>
          <p className="mt-2 max-w-lg text-sm text-cyan-50 sm:text-base">
            Connect with verified helpers who have the skills and knowledge to assist you. Browse
            profiles, check their availability, and reach out when you are ready.
          </p>
        </div>
      </div>

      {/* Search + skill filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, area, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
      </div>

      {allSkills.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSkillFilter('all')}
            className={`badge transition-all ${
              skillFilter === 'all'
                ? 'bg-blue-600 text-white ring-1 ring-blue-600'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
            }`}
          >
            All Skills
          </button>
          {allSkills.map((skill) => (
            <button
              key={skill}
              onClick={() => setSkillFilter(skill)}
              className={`badge transition-all capitalize ${
                skillFilter === skill
                  ? 'bg-blue-600 text-white ring-1 ring-blue-600'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="card text-center py-12">
          <p className="text-sm text-slate-500">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-sm text-slate-500">No helpers found. Try a different search.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((helper, i) => {
            const todayAvail = getTodayAvailability(helper);
            const availableToday = todayAvail?.is_available;
            return (
              <button
                key={helper.id}
                onClick={() => setSelectedHelper(helper)}
                className="card group animate-fade-in-up text-left transition-all hover:shadow-md hover:ring-slate-300/60"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-xl font-bold text-white">
                    {helper.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display text-base font-bold text-slate-900 group-hover:text-blue-700">
                      {helper.name}
                    </h3>
                    {helper.service_area && (
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {helper.service_area}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-medium text-amber-600">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {formatRating(helper.rating)} ({helper.review_count})
                      </span>
                      {helper.verification_status === 'verified' && (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600">
                          <ShieldCheck className="h-3.5 w-3.5" />
                          Verified
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-slate-500">{helper.bio}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {availableToday !== undefined && (
                    <span
                      className={`badge ${
                        availableToday
                          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                          : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {availableToday
                        ? `Today ${todayAvail?.start_time}–${todayAvail?.end_time}`
                        : 'Off today'}
                    </span>
                  )}
                  {helper.skills.slice(0, 2).map((skill) => (
                    <span key={skill} className="badge bg-blue-50 text-blue-600 ring-1 ring-blue-100">
                      {skill}
                    </span>
                  ))}
                  {helper.skills.length > 2 && (
                    <span className="text-xs text-slate-400">+{helper.skills.length - 2} more</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Helper detail modal */}
      {selectedHelper && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onClick={() => setSelectedHelper(null)}
        >
          <div
            className="animate-fade-in-up max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-2xl font-bold text-white">
                  {selectedHelper.name.charAt(0)}
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-slate-900">{selectedHelper.name}</h2>
                  {selectedHelper.service_area && (
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-slate-400">
                      <MapPin className="h-4 w-4" />
                      {selectedHelper.service_area}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {formatRating(selectedHelper.rating)} ({selectedHelper.review_count} reviews)
                    </span>
                  </div>
                  <div className="mt-2">
                    <VerificationBadge status={selectedHelper.verification_status} size="md" />
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedHelper(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-slate-600">{selectedHelper.bio}</p>

            {/* Skills */}
            <div className="mt-5">
              <h3 className="text-sm font-semibold text-slate-700">Skills</h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedHelper.skills.map((skill) => (
                  <span key={skill} className="badge bg-blue-50 text-blue-600 ring-1 ring-blue-100 capitalize">
                    <HandHeart className="h-3 w-3" />
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            {selectedHelper.languages.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-slate-700">Languages</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedHelper.languages.map((lang) => (
                    <span key={lang} className="badge bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                      <Languages className="h-3 w-3" />
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            <div className="mt-4 flex items-center gap-4 rounded-xl bg-slate-50 p-3">
              <div>
                <p className="text-xs text-slate-400">Experience</p>
                <p className="text-sm font-bold text-slate-700">{selectedHelper.years_experience} years</p>
              </div>
              {selectedHelper.verified_date && (
                <div>
                  <p className="text-xs text-slate-400">Verified since</p>
                  <p className="text-sm font-bold text-slate-700">{formatDate(selectedHelper.verified_date)}</p>
                </div>
              )}
            </div>

            {/* Weekly availability */}
            {selectedHelper.availability && selectedHelper.availability.length > 0 && (
              <div className="mt-5">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Calendar className="h-4 w-4" />
                  Weekly Availability
                </h3>
                <div className="mt-2 space-y-1.5">
                  {DAY_ORDER.map((day) => {
                    const avail = selectedHelper.availability?.find((a) => a.day_of_week === day);
                    if (!avail) return null;
                    return (
                      <div
                        key={day}
                        className="flex items-center justify-between rounded-lg px-3 py-2 text-sm ring-1 ring-slate-100"
                      >
                        <span className="font-medium text-slate-600">{DAY_LABELS[day]}</span>
                        {avail.is_available ? (
                          <span className="flex items-center gap-1.5 text-emerald-600">
                            <Check className="h-3.5 w-3.5" />
                            {avail.start_time}–{avail.end_time}
                            {avail.notes && <span className="text-xs text-slate-400">({avail.notes})</span>}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <X className="h-3.5 w-3.5" />
                            {avail.notes || 'Unavailable'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Contact */}
            <div className="mt-5 space-y-2">
              <h3 className="text-sm font-semibold text-slate-700">Contact</h3>
              {selectedHelper.phone && (
                <a
                  href={`tel:${selectedHelper.phone}`}
                  className="btn-secondary w-full"
                >
                  <Phone className="h-4 w-4" />
                  {selectedHelper.phone}
                </a>
              )}
              {selectedHelper.email && (
                <a
                  href={`mailto:${selectedHelper.email}`}
                  className="btn-secondary w-full"
                >
                  <Mail className="h-4 w-4" />
                  {selectedHelper.email}
                </a>
              )}
            </div>

            <button onClick={openRequest} className="btn-primary mt-5 w-full">
              <HandHeart className="h-4 w-4" /> Request assistance from {selectedHelper.name.split(' ')[0]}
            </button>

            {!user && (
              <p className="mt-2 text-center text-xs text-slate-400">Sign in as a traveler to send an assistance request.</p>
            )}

            {/* Privacy note */}
            <p className="mt-4 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-400">
              You choose what personal information to share when contacting a helper. Only share what you
              are comfortable with.
            </p>
          </div>
        </div>
      )}

      {requestOpen && selectedHelper && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-xs font-semibold uppercase tracking-wide text-blue-600">New assistance request</p><h2 className="mt-1 font-display text-xl font-bold text-slate-900">Request {selectedHelper.name.split(' ')[0]}'s help</h2><p className="mt-1 text-sm text-slate-500">Only share the information needed to coordinate the assistance.</p></div>
              <button onClick={() => setRequestOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100" aria-label="Close request form"><X className="h-5 w-5" /></button>
            </div>
            <div className="mt-5 space-y-4">
              <div><label className="mb-1.5 block text-sm font-medium text-slate-700">What do you need help with?</label><select value={requestType} onChange={(e) => setRequestType(e.target.value)} className="input-field"><option>Wheelchair assistance</option><option>Hospital or appointment escort</option><option>Transport navigation</option><option>Accessible route support</option><option>Shopping or errand support</option><option>Other assistance</option></select></div>
              <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Where do you need help?</label><div className="relative"><MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={requestLocation} onChange={(e) => setRequestLocation(e.target.value)} className="input-field pl-11" placeholder="e.g. King's Cross Station, London" /></div></div>
              <div><label className="mb-1.5 block text-sm font-medium text-slate-700">When do you need help? <span className="font-normal text-slate-400">(optional)</span></label><input type="datetime-local" value={requestedFor} onChange={(e) => setRequestedFor(e.target.value)} className="input-field" /></div>
              <div><label className="mb-1.5 block text-sm font-medium text-slate-700">Anything the helper should know? <span className="font-normal text-slate-400">(optional)</span></label><textarea rows={3} value={requestDescription} onChange={(e) => setRequestDescription(e.target.value)} className="input-field resize-none" placeholder="Add useful context, preferred assistance, or meeting details." /></div>
              {requestError && <div className="flex items-start gap-2 rounded-xl bg-rose-50 p-3 ring-1 ring-rose-200"><AlertCircle className="h-4 w-4 shrink-0 text-rose-500" /><p className="text-xs text-rose-600">{requestError}</p></div>}
              <button disabled={requestSubmitting} onClick={() => void submitRequest()} className="btn-primary w-full">{requestSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending request…</> : <><Send className="h-4 w-4" /> Send assistance request</>}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
