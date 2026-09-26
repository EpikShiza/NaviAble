import { useEffect, useState, useMemo } from 'react';
import { Search, MapPin, Clock, ChevronRight, Filter, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CATEGORY_ICONS, CATEGORY_LABELS, CATEGORIES } from '@/lib/constants';
import { isOpenNow, formatOpeningHours } from '@/lib/format';
import type { Place } from '@/types';
import VerificationBadge from '@/components/VerificationBadge';

interface Props {
  onSelectPlace: (place: Place) => void;
}

export default function ExplorePage({ onSelectPlace }: Props) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('places')
        .select('*')
        .order('name');
      if (err) {
        setError('Unable to load places. Please try again.');
      } else {
        setPlaces(data || []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    return places.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase()) ||
        p.address.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [places, search, activeCategory]);

  return (
    <div className="space-y-6">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-700 p-6 text-white sm:p-8">
        <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-cyan-300/20 blur-2xl" />
        <div className="relative">
          <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
            Find accessible places to go
          </h1>
          <p className="mt-2 max-w-lg text-sm text-blue-100 sm:text-base">
            Search destinations with step-free access, ramps, lifts, accessible toilets, parking, and more. Every detail shows whether it is venue-confirmed, community-reported, or unverified.
          </p>
        </div>
      </div>

      {/* Search bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, address, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveCategory('all')}
          className={`badge transition-all ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white ring-1 ring-blue-600'
              : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
          }`}
        >
          <Filter className="h-3 w-3" />
          All
        </button>
        {CATEGORIES.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const active = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`badge transition-all ${
                active
                  ? 'bg-blue-600 text-white ring-1 ring-blue-600'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:ring-slate-300'
              }`}
            >
              {Icon && <Icon className="h-3 w-3" />}
              {CATEGORY_LABELS[cat]}
            </button>
          );
        })}
      </div>

      {/* Results */}
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
          <p className="text-sm text-slate-500">No places found. Try a different search or category.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((place, i) => {
            const Icon = CATEGORY_ICONS[place.category] || CATEGORY_ICONS.community;
            const open = isOpenNow(place.opening_hours);
            const hours = formatOpeningHours(place.opening_hours);
            const todayShort = hours[0];

            return (
              <button
                key={place.id}
                onClick={() => onSelectPlace(place)}
                className="card group animate-fade-in-up text-left transition-all hover:shadow-md hover:ring-slate-300/60"
                style={{ animationDelay: `${i * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-display text-base font-bold text-slate-900 leading-tight group-hover:text-blue-700">
                        {place.name}
                      </h3>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                        <MapPin className="h-3 w-3" />
                        {place.address}, {place.city}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-blue-500" />
                </div>

                <p className="mt-3 line-clamp-2 text-sm text-slate-500">{place.description}</p>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <span
                    className={`badge ${
                      open
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
                        : 'bg-slate-100 text-slate-500 ring-1 ring-slate-200'
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {open ? 'Open now' : 'Closed'}
                  </span>
                  <VerificationBadge status={place.verification_status} />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
