import { useState, useEffect } from 'react';
import {
  Navigation2,
  ArrowLeft,
  ArrowRight,
  ArrowLeft as ArrowLeftIcon,
  Check,
  Loader2,
  AlertCircle,
  User,
  Phone,
  MapPin,
  HandHeart,
  Languages,
  Clock,
  Award,
  FileText,
  ShieldCheck,
  HeartPulse,
  Accessibility,
  Star,
  Send,
  Eye,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import type { HelperApplication } from '@/types';

interface Props {
  onBack: () => void;
  onComplete: () => void;
}

const STEPS = [
  { id: 0, label: 'Profile', icon: User },
  { id: 1, label: 'Skills', icon: HandHeart },
  { id: 2, label: 'Experience', icon: Award },
  { id: 3, label: 'Availability', icon: Clock },
  { id: 4, label: 'Verification', icon: ShieldCheck },
  { id: 5, label: 'Review', icon: FileText },
];

const SKILL_OPTIONS = [
  'wheelchair assistance',
  'mobility scooter guidance',
  'route planning',
  'travel companion',
  'hospital escort',
  'transport navigation',
  'lifting techniques',
  'route assessment',
  'companion support',
  'outdoor navigation',
  'adaptive sports support',
  'cultural venue navigation',
  'accessible tourism',
  'shopping support',
];

const LANGUAGE_OPTIONS = ['English', 'Spanish', 'French', 'German', 'Mandarin', 'Hindi', 'Punjabi', 'Igbo', 'Portuguese', 'Arabic', 'British Sign Language'];

export default function EmployeeApplicationPage({ onBack, onComplete }: Props) {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [appId, setAppId] = useState<string | null>(null);
  const [viewedFromReview, setViewedFromReview] = useState(false);

  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    city: '',
    service_area: '',
    skills: [] as string[],
    languages: [] as string[],
    years_experience: 0,
    bio: '',
    certifications: '',
    availability_notes: '',
    reference_contacts: '',
    has_wheelchair_training: false,
    has_first_aid: false,
    consent_background_check: false,
    agree_to_code_of_conduct: false,
  });

  useEffect(() => {
    async function loadExisting() {
      if (!user) return;
      const { data, error: err } = await supabase
        .from('helper_applications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .maybeSingle();
      if (err) {
        console.warn('Application load error:', err.message);
      }
      if (data) {
        const app = data as HelperApplication;
        setAppId(app.id);
        setForm({
          full_name: app.full_name || profile?.full_name || '',
          phone: app.phone || '',
          city: app.city || '',
          service_area: app.service_area || '',
          skills: app.skills || [],
          languages: app.languages || [],
          years_experience: app.years_experience || 0,
          bio: app.bio || '',
          certifications: app.certifications || '',
          availability_notes: app.availability_notes || '',
          reference_contacts: app.reference_contacts || '',
          has_wheelchair_training: app.has_wheelchair_training || false,
          has_first_aid: app.has_first_aid || false,
          consent_background_check: app.consent_background_check || false,
          agree_to_code_of_conduct: app.agree_to_code_of_conduct || false,
        });
        if (app.status === 'submitted' || app.status === 'under_review' || app.status === 'approved') {
          setStep(5);
        }
      } else {
        setForm((prev) => ({ ...prev, full_name: profile?.full_name || '' }));
      }
      setLoading(false);
    }
    loadExisting();
  }, [user, profile]);

  function update<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleArrayItem(key: 'skills' | 'languages', item: string) {
    setForm((prev) => {
      const arr = prev[key];
      return { ...prev, [key]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item] };
    });
  }

  async function saveDraft() {
    if (!user) return;
    setSaving(true);
    setError(null);
    const payload = { ...form, user_id: user.id };
    if (appId) {
      const { error: err } = await supabase.from('helper_applications').update(payload).eq('id', appId);
      if (err) setError(err.message);
    } else {
      const { data, error: err } = await supabase.from('helper_applications').insert(payload).select('id').maybeSingle();
      if (err) {
        setError(err.message);
      } else if (data) {
        setAppId((data as HelperApplication).id);
      }
    }
    setSaving(false);
  }

  async function submitApplication() {
    if (!user) return;
    if (!form.consent_background_check || !form.agree_to_code_of_conduct) {
      setError('Please complete the consent and code of conduct sections before submitting.');
      return;
    }
    if (!form.full_name.trim() || !form.phone?.trim() || !form.city?.trim()) {
      setError('Please fill in your name, phone, and city before submitting.');
      setStep(0);
      return;
    }
    if (form.skills.length === 0) {
      setError('Please select at least one skill.');
      setStep(1);
      return;
    }
    if (!form.bio.trim()) {
      setError('Please write a professional summary.');
      setStep(2);
      return;
    }

    setSaving(true);
    setError(null);
    const payload = { ...form, user_id: user.id, status: 'submitted', submitted_at: new Date().toISOString() };
    if (appId) {
      const { error: err } = await supabase.from('helper_applications').update(payload).eq('id', appId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { data, error: err } = await supabase.from('helper_applications').insert(payload).select('id').maybeSingle();
      if (err) { setError(err.message); setSaving(false); return; }
      if (data) setAppId((data as HelperApplication).id);
    }
    setSaving(false);
    onComplete();
  }

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    setViewedFromReview(false);
  }

  function prev() {
    if (step > 0) setStep(step - 1);
    setViewedFromReview(false);
  }

  function jumpTo(target: number) {
    setStep(target);
    setViewedFromReview(true);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white">
              <Navigation2 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-display text-sm font-bold text-slate-900 leading-none">Helper Application</h1>
              <p className="text-[11px] text-slate-400 mt-0.5">NaviAble Helper Portal</p>
            </div>
          </div>
          <button onClick={onBack} className="btn-ghost text-xs">
            <ArrowLeft className="h-4 w-4" />
            Exit
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 pb-12 sm:px-6">
        {/* Progress steps */}
        <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60 sm:p-5">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const StepIcon = s.icon;
              const isDone = i < step;
              const isCurrent = i === step;
              return (
                <div key={s.id} className="flex flex-1 items-center">
                  <button
                    onClick={() => jumpTo(i)}
                    className="flex flex-col items-center gap-1.5"
                  >
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                        isDone
                          ? 'bg-teal-500 text-white'
                          : isCurrent
                            ? 'bg-teal-600 text-white ring-4 ring-teal-100'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isDone ? <Check className="h-4 w-4" /> : <StepIcon className="h-4 w-4" />}
                    </div>
                    <span className={`text-[10px] font-medium ${isCurrent ? 'text-teal-700' : isDone ? 'text-teal-600' : 'text-slate-400'}`}>
                      {s.label}
                    </span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`mx-1 h-0.5 flex-1 rounded-full transition-colors ${i < step ? 'bg-teal-400' : 'bg-slate-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-50 p-3.5 ring-1 ring-red-200">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Step content */}
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60 sm:p-7">
          {/* Step 0: Profile */}
          {step === 0 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">Tell us about yourself</h2>
                <p className="mt-1 text-sm text-slate-500">Basic contact information so travelers and our team can reach you.</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Full Name <span className="text-red-500">*</span></label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input type="text" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} className="input-field pl-12" placeholder="Jane Doe" />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">Phone <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} className="input-field pl-12" placeholder="+44 7700 900000" />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">City <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                    <input type="text" value={form.city} onChange={(e) => update('city', e.target.value)} className="input-field pl-12" placeholder="London" />
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Service Area</label>
                <input type="text" value={form.service_area} onChange={(e) => update('service_area', e.target.value)} className="input-field" placeholder="e.g. Central & North London" />
                <p className="mt-1 text-xs text-slate-400">The geographic area where you can provide assistance.</p>
              </div>
            </div>
          )}

          {/* Step 1: Skills */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">What skills do you have?</h2>
                <p className="mt-1 text-sm text-slate-500">Select all the areas where you can assist travelers. Be honest — travelers rely on this.</p>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <HandHeart className="h-4 w-4 text-teal-500" />
                  Assistance Skills <span className="text-red-500">*</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => (
                    <button
                      key={skill}
                      onClick={() => toggleArrayItem('skills', skill)}
                      className={`badge capitalize transition-all ${
                        form.skills.includes(skill)
                          ? 'bg-teal-600 text-white ring-1 ring-teal-600'
                          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-teal-300'
                      }`}
                    >
                      {form.skills.includes(skill) && <Check className="h-3 w-3" />}
                      {skill}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Languages className="h-4 w-4 text-teal-500" />
                  Languages Spoken
                </h3>
                <div className="flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => toggleArrayItem('languages', lang)}
                      className={`badge transition-all ${
                        form.languages.includes(lang)
                          ? 'bg-teal-600 text-white ring-1 ring-teal-600'
                          : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-teal-300'
                      }`}
                    >
                      {form.languages.includes(lang) && <Check className="h-3 w-3" />}
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">Your experience</h2>
                <p className="mt-1 text-sm text-slate-500">Tell us about your background, training, and certifications.</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Years of Relevant Experience</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min={0}
                    max={30}
                    value={form.years_experience}
                    onChange={(e) => update('years_experience', parseInt(e.target.value))}
                    className="flex-1 accent-teal-600"
                  />
                  <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-lg font-bold text-teal-700">
                    {form.years_experience}
                  </div>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Professional Summary <span className="text-red-500">*</span></label>
                <textarea
                  value={form.bio}
                  onChange={(e) => update('bio', e.target.value)}
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Describe your experience assisting people with disabilities, your approach to care, and what makes you a great helper. This is like a cover letter — tell us your story."
                />
                <p className="mt-1 text-xs text-slate-400">Minimum 2-3 sentences. This is what travelers will see on your profile.</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Certifications & Training</label>
                <textarea
                  value={form.certifications}
                  onChange={(e) => update('certifications', e.target.value)}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="List any relevant certifications: first aid, disability awareness training, NVQ in Health & Social Care, manual handling certificate, etc."
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Reference Contacts</label>
                <textarea
                  value={form.reference_contacts}
                  onChange={(e) => update('reference_contacts', e.target.value)}
                  rows={3}
                  className="input-field resize-none"
                  placeholder="Provide contact details for 1-2 people who can vouch for your assistance work (name, relationship, phone or email)."
                />
                <p className="mt-1 text-xs text-slate-400">We may contact references during the review process.</p>
              </div>
            </div>
          )}

          {/* Step 3: Availability */}
          {step === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">When are you available?</h2>
                <p className="mt-1 text-sm text-slate-500">Describe your general availability. You can set detailed weekly hours after approval.</p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">Availability Notes</label>
                <textarea
                  value={form.availability_notes}
                  onChange={(e) => update('availability_notes', e.target.value)}
                  rows={5}
                  className="input-field resize-none"
                  placeholder="e.g. Available Mon–Fri 8am–6pm, some Saturdays. Flexible for hospital appointments with notice. Not available Sundays."
                />
              </div>

              <div className="rounded-xl bg-teal-50 p-4 ring-1 ring-teal-200">
                <p className="text-xs leading-relaxed text-teal-800">
                  <strong>Tip:</strong> Be specific about your availability. Travelers search for helpers
                  who match their schedule. You can update this later.
                </p>
              </div>
            </div>
          )}

          {/* Step 4: Verification */}
          {step === 4 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">Verification & Consent</h2>
                <p className="mt-1 text-sm text-slate-500">These items are required to become a verified helper on AccessWay.</p>
              </div>

              <div className="space-y-3">
                {/* Wheelchair training */}
                <label className={`flex cursor-pointer items-start gap-4 rounded-xl p-4 ring-1 transition-all ${form.has_wheelchair_training ? 'bg-teal-50 ring-teal-200' : 'bg-white ring-slate-200 hover:ring-slate-300'}`}>
                  <button
                    type="button"
                    onClick={() => update('has_wheelchair_training', !form.has_wheelchair_training)}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all ${form.has_wheelchair_training ? 'bg-teal-600 text-white' : 'bg-slate-200 text-transparent'}`}
                  >
                    {form.has_wheelchair_training && <Check className="h-4 w-4" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <Accessibility className="h-5 w-5 text-teal-600" />
                      <p className="text-sm font-semibold text-slate-800">I have formal wheelchair handling training</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Completed a recognized course in safe wheelchair handling, transfers, and assistance techniques.</p>
                  </div>
                </label>

                {/* First aid */}
                <label className={`flex cursor-pointer items-start gap-4 rounded-xl p-4 ring-1 transition-all ${form.has_first_aid ? 'bg-teal-50 ring-teal-200' : 'bg-white ring-slate-200 hover:ring-slate-300'}`}>
                  <button
                    type="button"
                    onClick={() => update('has_first_aid', !form.has_first_aid)}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all ${form.has_first_aid ? 'bg-teal-600 text-white' : 'bg-slate-200 text-transparent'}`}
                  >
                    {form.has_first_aid && <Check className="h-4 w-4" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <HeartPulse className="h-5 w-5 text-teal-600" />
                      <p className="text-sm font-semibold text-slate-800">I hold a valid first aid certification</p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">Current first aid certificate from a recognized provider (e.g. Red Cross, St John Ambulance).</p>
                  </div>
                </label>

                {/* Background check */}
                <label className={`flex cursor-pointer items-start gap-4 rounded-xl p-4 ring-1 transition-all ${form.consent_background_check ? 'bg-teal-50 ring-teal-200' : 'bg-white ring-slate-200 hover:ring-slate-300'}`}>
                  <button
                    type="button"
                    onClick={() => update('consent_background_check', !form.consent_background_check)}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all ${form.consent_background_check ? 'bg-teal-600 text-white' : 'bg-slate-200 text-transparent'}`}
                  >
                    {form.consent_background_check && <Check className="h-4 w-4" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-5 w-5 text-teal-600" />
                      <p className="text-sm font-semibold text-slate-800">I consent to a background check <span className="text-red-500">*</span></p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">AccessWay may conduct a background check before approving your application. This helps keep travelers safe.</p>
                  </div>
                </label>

                {/* Code of conduct */}
                <label className={`flex cursor-pointer items-start gap-4 rounded-xl p-4 ring-1 transition-all ${form.agree_to_code_of_conduct ? 'bg-teal-50 ring-teal-200' : 'bg-white ring-slate-200 hover:ring-slate-300'}`}>
                  <button
                    type="button"
                    onClick={() => update('agree_to_code_of_conduct', !form.agree_to_code_of_conduct)}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md transition-all ${form.agree_to_code_of_conduct ? 'bg-teal-600 text-white' : 'bg-slate-200 text-transparent'}`}
                  >
                    {form.agree_to_code_of_conduct && <Check className="h-4 w-4" />}
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <HeartPulse className="h-5 w-5 text-teal-600" />
                      <p className="text-sm font-semibold text-slate-800">I agree to the Consent-First Code of Conduct <span className="text-red-500">*</span></p>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">I will always ask before assisting, respect the person's decisions about their own body and equipment, never lift or tip a wheelchair without training, and follow all guidance from the person I am assisting.</p>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-5">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">Review your application</h2>
                <p className="mt-1 text-sm text-slate-500">Check everything below before submitting. You can edit any section by tapping it.</p>
              </div>

              {/* Review sections */}
              <div className="space-y-3">
                <ReviewSection title="Profile" onClick={() => jumpTo(0)} fields={[
                  { label: 'Name', value: form.full_name },
                  { label: 'Phone', value: form.phone },
                  { label: 'City', value: form.city },
                  { label: 'Service Area', value: form.service_area || 'Not specified' },
                ]} />

                <ReviewSection title="Skills & Languages" onClick={() => jumpTo(1)} fields={[
                  { label: 'Skills', value: form.skills.length > 0 ? form.skills.join(', ') : 'None selected' },
                  { label: 'Languages', value: form.languages.length > 0 ? form.languages.join(', ') : 'None selected' },
                ]} />

                <ReviewSection title="Experience" onClick={() => jumpTo(2)} fields={[
                  { label: 'Years', value: `${form.years_experience} years` },
                  { label: 'Summary', value: form.bio || 'Not provided' },
                  { label: 'Certifications', value: form.certifications || 'None listed' },
                  { label: 'References', value: form.reference_contacts || 'None provided' },
                ]} />

                <ReviewSection title="Availability" onClick={() => jumpTo(3)} fields={[
                  { label: 'Notes', value: form.availability_notes || 'Not specified' },
                ]} />

                <ReviewSection title="Verification" onClick={() => jumpTo(4)} fields={[
                  { label: 'Wheelchair Training', value: form.has_wheelchair_training ? 'Yes' : 'No' },
                  { label: 'First Aid', value: form.has_first_aid ? 'Yes' : 'No' },
                  { label: 'Background Check Consent', value: form.consent_background_check ? 'Given' : 'Not given' },
                  { label: 'Code of Conduct', value: form.agree_to_code_of_conduct ? 'Agreed' : 'Not agreed' },
                ]} />
              </div>

              {viewedFromReview && (
                <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3.5 ring-1 ring-blue-200">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <p className="text-xs text-blue-600">Reviewing a section. Click "Review" to come back here, or "Submit" when ready.</p>
                </div>
              )}

              <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
                <p className="text-xs leading-relaxed text-amber-800">
                  <strong>Before you submit:</strong> Double-check your phone and email — we use these to
                  contact you about your application. After submitting, our team will review your application
                  and conduct background checks before approving your helper profile.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Navigation buttons */}
        <div className="mt-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button onClick={prev} disabled={step === 0} className="btn-secondary disabled:opacity-40">
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </button>
            <button onClick={saveDraft} disabled={saving} className="btn-ghost">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Draft'}
            </button>
          </div>

          {step < STEPS.length - 1 ? (
            <button onClick={next} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow-md active:scale-[0.98]">
              Continue
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={submitApplication} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow-md active:scale-[0.98] disabled:opacity-50">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit Application
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ title, fields, onClick }: { title: string; fields: { label: string; value: string }[]; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group block w-full rounded-xl bg-slate-50 p-4 text-left ring-1 ring-slate-200/60 transition-all hover:ring-teal-300"
    >
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800">
          <Star className="h-4 w-4 text-teal-500" />
          {title}
        </h3>
        <span className="text-xs font-medium text-teal-600 opacity-0 transition-opacity group-hover:opacity-100">Edit</span>
      </div>
      <div className="mt-3 space-y-2">
        {fields.map((f) => (
          <div key={f.label} className="flex gap-2 text-xs">
            <span className="w-28 shrink-0 font-medium text-slate-400">{f.label}</span>
            <span className="flex-1 text-slate-600">{f.value}</span>
          </div>
        ))}
      </div>
    </button>
  );
}
