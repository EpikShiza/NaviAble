import { useEffect, useState } from 'react';
import { Navigation2, Accessibility, MapPinned, Users, ArrowRight, Search, ShieldCheck, Compass, MessageSquare } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet';
import LanguageSelector from '@/components/LanguageSelector';
import { getStoredLanguage, subscribeToLanguageChange, t, type LanguageCode } from '@/lib/i18n';

interface Props {
  onGetStarted: () => void;
  onExplore: () => void;
}

const LONDON_CENTER: [number, number] = [51.5098, -0.1305];

// Sample waypoints for the hero map visual
const HERO_ROUTE: [number, number][] = [
  [51.5074, -0.1278],
  [51.5088, -0.1310],
  [51.5098, -0.1342],
  [51.5101, -0.1305],
  [51.5145, -0.1258],
];

const FEATURE_CARDS = [
  {
    icon: Navigation2,
    title: 'Accessible Navigation',
    desc: 'Step-free routes with clear waypoints, progress markers, and assistance points.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: MapPinned,
    title: 'Smarter Places',
    desc: 'Detailed accessibility profiles — ramps, lifts, toilets, parking, and more.',
    color: 'bg-teal-50 text-teal-600',
  },
  {
    icon: Users,
    title: 'Personalized Experience',
    desc: 'Connect with verified helpers and choose exactly what info to share.',
    color: 'bg-violet-50 text-violet-600',
  },
  {
    icon: MessageSquare,
    title: 'Community Feedback',
    desc: 'Real user reviews keep accessibility information accurate and up to date.',
    color: 'bg-amber-50 text-amber-600',
  },
];

const JOURNEY_STEPS = [
  { icon: Search, title: 'Search for a destination', desc: 'Find accessible places near you or plan ahead.' },
  { icon: MapPinned, title: 'Discover accessible information', desc: 'See ramps, lifts, toilets, parking, and assistance details.' },
  { icon: Navigation2, title: 'Navigate confidently', desc: 'Follow game-like route quests with clear waypoints.' },
  { icon: MessageSquare, title: 'Share your experience', desc: 'Leave feedback to help others navigate better.' },
];

export default function LandingPage({ onGetStarted, onExplore }: Props) {
  const [lang, setLang] = useState<LanguageCode>(getStoredLanguage());

  // Keep hero copy in sync if the language is changed from the selector in this page's own header.
  useEffect(() => subscribeToLanguageChange(setLang), []);

  return (
    <div className="min-h-screen bg-white">
      {/* Top nav */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
              <Navigation2 className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-extrabold tracking-tight text-slate-900">NaviAble</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSelector compact />
            <button onClick={onGetStarted} className="btn-primary px-4 py-2 text-xs sm:text-sm">
              {t('landing.get_started', lang)}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-white" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:gap-12 lg:py-20">
          {/* Left: Text */}
          <div className="animate-fade-in-up">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-100">
              <Accessibility className="h-3.5 w-3.5" />
              Accessibility-first navigation
            </div>
            <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              {t('landing.hero_title', lang)}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-500 sm:text-lg">
              {t('landing.hero_sub', lang)} — making routes, places, and accessibility information easier to discover.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button onClick={onGetStarted} className="btn-primary py-3.5 text-base">
                {t('landing.get_started', lang)}
                <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={onExplore} className="btn-secondary py-3.5 text-base">
                <Compass className="h-4 w-4" />
                {t('landing.explore_now', lang)}
              </button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Verified accessibility data
              </div>
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-blue-500" />
                Trained helper network
              </div>
            </div>
          </div>

          {/* Right: Hero map visual */}
          <div className="animate-fade-in-up rounded-2xl overflow-hidden shadow-xl ring-1 ring-slate-200/60" style={{ animationDelay: '100ms' }}>
            <div className="h-[300px] sm:h-[380px] lg:h-[440px]">
              <MapContainer
                center={LONDON_CENTER}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
                attributionControl={false}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polyline
                  positions={HERO_ROUTE}
                  pathOptions={{ color: '#2563eb', weight: 4, opacity: 0.7, dashArray: '8 8' }}
                />
                {HERO_ROUTE.map((pos, i) => (
                  <CircleMarker
                    key={i}
                    center={pos}
                    radius={i === 0 ? 10 : i === HERO_ROUTE.length - 1 ? 10 : 7}
                    pathOptions={{
                      color: '#fff',
                      weight: 3,
                      fillColor: i === 0 ? '#22c55e' : i === HERO_ROUTE.length - 1 ? '#ef4444' : '#2563eb',
                      fillOpacity: 1,
                    }}
                  >
                    <Popup>
                      <div className="space-y-0.5">
                        <p className="font-semibold text-slate-800">
                          {i === 0 ? 'Start' : i === HERO_ROUTE.length - 1 ? 'Destination' : `Waypoint ${i}`}
                        </p>
                        <p className="text-xs text-slate-500">Accessible route preview</p>
                      </div>
                    </Popup>
                  </CircleMarker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>
      </section>

      {/* How NaviAble Helps */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">How NaviAble Helps</h2>
            <p className="mt-3 text-sm text-slate-500 sm:text-base">Everything you need to navigate the world with confidence.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURE_CARDS.map((card, i) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className="animate-fade-in-up rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200/60 transition-all hover:shadow-md"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 font-display text-base font-bold text-slate-900">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{card.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* User Journey */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl">Your journey with NaviAble</h2>
            <p className="mt-3 text-sm text-slate-500 sm:text-base">From search to destination — in four simple steps.</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {JOURNEY_STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                  {i < JOURNEY_STEPS.length - 1 && (
                    <div className="absolute left-[3.25rem] top-10 hidden h-0.5 w-[calc(100%-1.5rem)] bg-gradient-to-r from-blue-200 to-transparent lg:block" />
                  )}
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-100">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-50 text-[10px] font-bold text-blue-600">{i + 1}</span>
                      <h3 className="font-display text-sm font-bold text-slate-900">{step.title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">{step.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 px-6 py-14 text-center text-white sm:px-12 sm:py-20">
          <div className="absolute right-0 top-0 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-cyan-300/20 blur-2xl" />
          <div className="relative">
            <h2 className="font-display text-3xl font-extrabold sm:text-4xl">Make every journey more accessible.</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm text-blue-100 sm:text-base">
              Join NaviAble today and navigate with confidence.
            </p>
            <button
              onClick={onGetStarted}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 text-sm font-bold text-blue-700 shadow-lg transition-all hover:shadow-xl active:scale-[0.98]"
            >
              Start Exploring
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white">
              <Navigation2 className="h-4 w-4" />
            </div>
            <span className="font-display text-sm font-bold text-slate-700">NaviAble</span>
          </div>
          <p className="text-xs text-slate-400">Navigate the world with confidence.</p>
        </div>
      </footer>
    </div>
  );
}
