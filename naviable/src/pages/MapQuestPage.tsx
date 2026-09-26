import { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  MapPin,
  Flag,
  Coffee,
  LifeBuoy,
  Crosshair,
  Navigation2,
  Loader2,
  Trophy,
  Info,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { supabase } from '@/lib/supabase';
import { CATEGORY_ICONS, CATEGORY_LABELS, WAYPOINT_COLORS } from '@/lib/constants';
import type { Place, RouteWaypoint } from '@/types';

interface Props {
  place: Place;
  onBack: () => void;
  onComplete: (place: Place) => void;
}

const WAYPOINT_ICONS: Record<string, typeof Flag> = {
  start: Navigation2,
  checkpoint: Crosshair,
  crossing: Crosshair,
  rest: Coffee,
  assistance: LifeBuoy,
  finish: Trophy,
};

const WAYPOINT_LABELS: Record<string, string> = {
  start: 'Start',
  checkpoint: 'Checkpoint',
  crossing: 'Crossing',
  rest: 'Rest Stop',
  assistance: 'Assistance',
  finish: 'Destination',
};

function createWaypointIcon(type: string, index: number, isCompleted: boolean): L.DivIcon {
  const color = isCompleted ? '#22c55e' : WAYPOINT_COLORS[type] || '#3b82f6';
  const ringClass = type === 'start' ? 'pulse-ring' : '';
  return L.divIcon({
    className: 'custom-div-icon',
    html: `<div class="waypoint-marker ${ringClass}" style="background-color: ${color}">${index + 1}</div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

function MapBoundsFitter({ waypoints }: { waypoints: RouteWaypoint[] }) {
  const map = useMap();
  useEffect(() => {
    if (waypoints.length === 0) return;
    const bounds = L.latLngBounds(waypoints.map((w) => [w.latitude, w.longitude] as [number, number]));
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [waypoints, map]);
  return null;
}

export default function MapQuestPage({ place, onBack, onComplete }: Props) {
  const [waypoints, setWaypoints] = useState<RouteWaypoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('route_waypoints')
        .select('*')
        .eq('place_id', place.id)
        .order('order_index');
      if (err) {
        setError('Unable to load route data.');
      } else if (!data || data.length === 0) {
        setError('No route waypoints are available for this place yet.');
      } else {
        setWaypoints(data);
      }
      setLoading(false);
    }
    load();
  }, [place.id]);

  const progress = waypoints.length > 0 ? Math.round((completed.size / waypoints.length) * 100) : 0;
  const allDone = completed.size === waypoints.length && waypoints.length > 0;

  const routeCoords: [number, number][] = waypoints.map((w) => [w.latitude, w.longitude]);

  function advance() {
    if (currentStep < waypoints.length - 1) {
      setCompleted((prev) => new Set(prev).add(currentStep));
      const next = currentStep + 1;
      setCurrentStep(next);
      const wp = waypoints[next];
      if (wp && mapRef.current) {
        mapRef.current.setView([wp.latitude, wp.longitude], 15, { animate: true });
      }
    } else {
      setCompleted((prev) => new Set(prev).add(currentStep));
      onComplete(place);
    }
  }

  function jumpTo(index: number) {
    setCurrentStep(index);
    const wp = waypoints[index];
    if (wp && mapRef.current) {
      mapRef.current.setView([wp.latitude, wp.longitude], 15, { animate: true });
    }
  }

  const Icon = CATEGORY_ICONS[place.category] || CATEGORY_ICONS.community;
  const currentWp = waypoints[currentStep];

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="btn-ghost -ml-3">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      {/* Quest header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-cyan-600 to-teal-600 p-6 text-white sm:p-7">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
        <div className="relative flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <Icon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-display text-xl font-extrabold sm:text-2xl">{place.name}</h1>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-blue-100">
                <MapPin className="h-3.5 w-3.5" />
                {place.address}
              </p>
              <p className="mt-1 text-xs text-blue-200">
                {CATEGORY_LABELS[place.category]} • Route Quest
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative mt-5">
          <div className="flex items-center justify-between text-xs font-medium text-blue-100">
            <span>Progress</span>
            <span>{completed.size}/{waypoints.length} waypoints</span>
          </div>
          <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
        </div>
      ) : error ? (
        <div className="card text-center py-10">
          <AlertTriangle className="mx-auto h-8 w-8 text-amber-400" />
          <p className="mt-3 text-sm text-slate-500">{error}</p>
        </div>
      ) : (
        <>
          {allDone && (
            <div className="animate-fade-in-up rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white shadow-md">
              <div className="flex items-center gap-3">
                <Trophy className="h-7 w-7 shrink-0" />
                <div>
                  <h3 className="font-display text-lg font-bold">Route Complete!</h3>
                  <p className="text-sm text-emerald-50">
                    You reached {place.name}. Remember: this route is a guide, not a guarantee — always
                    stay alert to current conditions.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-5">
            {/* Map */}
            <div className="lg:col-span-3">
              <div className="h-[400px] overflow-hidden rounded-2xl ring-1 ring-slate-200 lg:h-[560px]">
                <MapContainer
                  center={[place.latitude, place.longitude]}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  ref={(m) => { if (m) mapRef.current = m; }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <Polyline
                    positions={routeCoords}
                    pathOptions={{
                      color: '#2563eb',
                      weight: 4,
                      opacity: 0.6,
                      dashArray: '8 8',
                    }}
                  />
                  {waypoints.map((wp, i) => {
                    const isCompleted = completed.has(i);
                    const isCurrent = i === currentStep;
                    return (
                      <Marker
                        key={wp.id}
                        position={[wp.latitude, wp.longitude]}
                        icon={createWaypointIcon(wp.waypoint_type, i, isCompleted)}
                        zIndexOffset={isCurrent ? 1000 : 0}
                      >
                        <Popup>
                          <div className="space-y-1">
                            <p className="font-semibold text-slate-800">{wp.label}</p>
                            {wp.description && <p className="text-slate-500">{wp.description}</p>}
                            {wp.assistance_available && wp.assistance_note && (
                              <p className="text-pink-600 font-medium">Assistance: {wp.assistance_note}</p>
                            )}
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                  <MapBoundsFitter waypoints={waypoints} />
                </MapContainer>
              </div>
            </div>

            {/* Waypoint list */}
            <div className="lg:col-span-2 space-y-3">
              {/* Current waypoint card */}
              {currentWp && (
                <div className="animate-fade-in-up rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
                  <div className="flex items-center gap-2">
                    {(() => {
                      const WpIcon = WAYPOINT_ICONS[currentWp.waypoint_type] || Crosshair;
                      const color = WAYPOINT_COLORS[currentWp.waypoint_type] || '#3b82f6';
                      return (
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-white"
                          style={{ backgroundColor: color }}
                        >
                          <WpIcon className="h-5 w-5" />
                        </div>
                      );
                    })()}
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        {WAYPOINT_LABELS[currentWp.waypoint_type]} • Step {currentStep + 1} of {waypoints.length}
                      </p>
                      <h3 className="text-sm font-bold text-slate-900">{currentWp.label}</h3>
                    </div>
                  </div>
                  {currentWp.description && (
                    <p className="mt-3 text-sm leading-relaxed text-slate-500">{currentWp.description}</p>
                  )}
                  {currentWp.assistance_available && currentWp.assistance_note && (
                    <div className="mt-3 flex items-start gap-2 rounded-lg bg-pink-50 p-3 ring-1 ring-pink-100">
                      <LifeBuoy className="h-4 w-4 shrink-0 text-pink-500" />
                      <p className="text-xs text-pink-700">{currentWp.assistance_note}</p>
                    </div>
                  )}
                  <button
                    onClick={advance}
                    disabled={completed.has(currentStep)}
                    className="btn-primary mt-4 w-full"
                  >
                    {completed.has(currentStep) ? (
                      <>
                        <Check className="h-4 w-4" /> Reached
                      </>
                    ) : currentStep === waypoints.length - 1 ? (
                      <>
                        <Trophy className="h-4 w-4" /> Complete Route
                      </>
                    ) : (
                      <>
                        <Flag className="h-4 w-4" /> Mark as Reached
                      </>
                    )}
                  </button>
                  {allDone && !completed.has(currentStep) && (
                    <button
                      onClick={() => onComplete(place)}
                      className="btn-secondary mt-2 w-full"
                    >
                      <Trophy className="h-4 w-4" /> Share Feedback
                    </button>
                  )}
                </div>
              )}

              {/* Waypoint timeline */}
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200/60">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  All Waypoints
                </p>
                <div className="space-y-1">
                  {waypoints.map((wp, i) => {
                    const WpIcon = WAYPOINT_ICONS[wp.waypoint_type] || Crosshair;
                    const isCompleted = completed.has(i);
                    const isCurrent = i === currentStep;
                    const color = isCompleted ? '#22c55e' : WAYPOINT_COLORS[wp.waypoint_type] || '#3b82f6';
                    return (
                      <button
                        key={wp.id}
                        onClick={() => jumpTo(i)}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors ${
                          isCurrent ? 'bg-blue-50' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white text-xs font-bold"
                          style={{ backgroundColor: color }}
                        >
                          {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`truncate text-sm ${isCurrent ? 'font-semibold text-blue-700' : 'font-medium text-slate-700'}`}>
                            {wp.label}
                          </p>
                          <p className="text-[11px] text-slate-400">{WAYPOINT_LABELS[wp.waypoint_type]}</p>
                        </div>
                        {wp.assistance_available && (
                          <LifeBuoy className="h-3.5 w-3.5 shrink-0 text-pink-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Safety note */}
              <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200">
                <div className="flex gap-3">
                  <Info className="h-5 w-5 shrink-0 text-amber-500" />
                  <p className="text-xs leading-relaxed text-amber-800">
                    Route waypoints are for guidance and motivation, not a guarantee of safe passage.
                    Conditions change — stay alert and use your judgment. If a route looks unsafe, find an
                    alternative.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
