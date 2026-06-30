import React, { useState, useEffect } from 'react';
import { Map, Navigation, Compass, MapPin, Milestone, Info, ZoomIn, ZoomOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity } from '../types';

interface ItineraryMapProps {
  activities: Activity[];
  destination: string;
}

export default function ItineraryMap({ activities, destination }: ItineraryMapProps) {
  const [activePin, setActivePin] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.2);

  // Auto-activate the first activity pin when activities list changes
  useEffect(() => {
    if (activities && activities.length > 0) {
      setActivePin(activities[0].id);
    }
  }, [activities]);

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-slate-400 h-[450px]" id="map-fallback">
        <Map className="w-12 h-12 text-slate-600 mb-3 animate-pulse" />
        <p className="text-sm font-sans">No geo-data loaded yet.</p>
        <p className="text-xs text-slate-500 max-w-xs mt-1">Generate an itinerary with IBM Bob to see the interactive GPS route planner.</p>
      </div>
    );
  }

  // Normalize coordinates to fit safely inside our visual grid (from 10% to 90% space)
  const lats = activities.map(a => a.coordinates.lat);
  const lngs = activities.map(a => a.coordinates.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);

  const latRange = maxLat - minLat || 1;
  const lngRange = maxLng - minLng || 1;

  const getCoordinatesPercentage = (lat: number, lng: number) => {
    // Return relative X, Y from 15% to 85% layout bounds
    const x = 15 + ((lng - minLng) / lngRange) * 70;
    const y = 85 - ((lat - minLat) / latRange) * 70; // Invert Y as 0 is top
    return { x: `${x * zoomLevel}%`, y: `${y * zoomLevel}%` };
  };

  const activeActivity = activities.find(a => a.id === activePin) || activities[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col h-[450px]" id="itinerary-map">
      {/* Map Header */}
      <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <Navigation className="w-4.5 h-4.5 text-emerald-400" />
          <span className="text-xs font-semibold text-slate-200">Granite GPS Optimized Map Engine</span>
          <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.5 rounded-md font-mono">
            {destination}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setZoomLevel(prev => Math.max(0.8, prev - 0.2))}
            className="p-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-slate-500 font-mono w-10 text-center">{Math.round(zoomLevel * 100)}%</span>
          <button
            onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.2))}
            className="p-1 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded transition"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Map Content View */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden cursor-grab active:cursor-grabbing">
        {/* Styled Vector Map Grid Background */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          {/* Mock Street Grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:40px_40px]" />
          {/* River / Waterbody body */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M -100,200 Q 150,150 250,300 T 550,220 T 900,350 L 900,450 L -100,450 Z"
              fill="#1e293b"
              opacity="0.6"
            />
            <path
              d="M 50,-100 Q 200,100 250,200 T 450,500"
              fill="none"
              stroke="#334155"
              strokeWidth="12"
              opacity="0.3"
            />
            <circle cx="250" cy="180" r="120" fill="#1e293b" opacity="0.4" />
          </svg>
        </div>

        {/* Outer Zoom Wrapper */}
        <div className="w-full h-full relative transition-all duration-300">
          {/* Draw Route Paths between activities */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {activities.length > 1 && activities.slice(0, -1).map((act, index) => {
              const nextAct = activities[index + 1];
              const p1 = getCoordinatesPercentage(act.coordinates.lat, act.coordinates.lng);
              const p2 = getCoordinatesPercentage(nextAct.coordinates.lat, nextAct.coordinates.lng);
              return (
                <g key={`route-${index}`}>
                  <motion.line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeDasharray="6,4"
                    initial={{ strokeDashoffset: 0 }}
                    animate={{ strokeDashoffset: -20 }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 1.5 }}
                  />
                  {/* Outer glow path */}
                  <line
                    x1={p1.x}
                    y1={p1.y}
                    x2={p2.x}
                    y2={p2.y}
                    stroke="#10b981"
                    strokeWidth="6"
                    opacity="0.15"
                  />
                </g>
              );
            })}
          </svg>

          {/* Activity Location Markers / Pins */}
          {activities.map((act) => {
            const { x, y } = getCoordinatesPercentage(act.coordinates.lat, act.coordinates.lng);
            const isSelected = activePin === act.id;
            const slotColor =
              act.timeSlot === 'Morning' ? 'bg-amber-500' :
              act.timeSlot === 'Afternoon' ? 'bg-orange-500' :
              'bg-purple-500';

            return (
              <div
                key={act.id}
                style={{ left: x, top: y }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
              >
                <button
                  onClick={() => setActivePin(act.id)}
                  className="relative group flex items-center justify-center"
                >
                  {/* Glowing ring */}
                  {isSelected && (
                    <span className="absolute w-10 h-10 bg-indigo-500/30 rounded-full animate-ping pointer-events-none" />
                  )}

                  <div className={`w-8 h-8 rounded-full border-2 border-slate-950 flex items-center justify-center shadow-lg transition-transform duration-300 hover:scale-110 ${
                    isSelected ? 'bg-indigo-600' : slotColor
                  }`}>
                    <MapPin className="w-4.5 h-4.5 text-white" />
                  </div>

                  {/* Tiny Label popover */}
                  <div className="absolute top-9 bg-slate-900 border border-slate-800 text-white rounded px-2 py-0.5 text-[9px] whitespace-nowrap shadow-md opacity-80 group-hover:opacity-100 transition">
                    {act.timeSlot}: {act.title.substring(0, 16)}...
                  </div>
                </button>
              </div>
            );
          })}
        </div>

        {/* Selected Attraction Quick info overlay card (Floating) */}
        <AnimatePresence>
          {activeActivity && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute bottom-4 left-4 right-4 bg-slate-900/95 border border-slate-800/80 rounded-xl p-4 shadow-2xl backdrop-blur-md flex gap-4 z-30"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className={`text-[9px] px-2 py-0.5 font-bold uppercase rounded-full ${
                    activeActivity.timeSlot === 'Morning' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                    activeActivity.timeSlot === 'Afternoon' ? 'bg-orange-950 text-orange-300 border border-orange-800' :
                    'bg-purple-950 text-purple-300 border border-purple-800'
                  }`}>
                    {activeActivity.timeSlot}
                  </span>
                  <h4 className="text-xs font-semibold text-slate-100">{activeActivity.title}</h4>
                </div>
                <p className="text-[10px] text-slate-400 font-sans line-clamp-2">{activeActivity.description}</p>
                <div className="flex items-center gap-2 mt-2.5 text-[10px] text-slate-500 font-mono">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-500" />
                    {activeActivity.locationName}
                  </span>
                  <span>•</span>
                  <span>{activeActivity.durationMinutes} mins</span>
                </div>
              </div>

              {activeActivity.transportToNext && (
                <div className="border-l border-slate-800 pl-4 w-32 flex flex-col justify-center shrink-0">
                  <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold font-mono">
                    <Milestone className="w-3.5 h-3.5" />
                    <span>Next Transit</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 mt-1 uppercase">
                    {activeActivity.transportToNext.mode}
                  </span>
                  <span className="text-[9px] text-slate-400 mt-0.5">
                    {activeActivity.transportToNext.distanceKm} km | {activeActivity.transportToNext.durationMinutes} mins
                  </span>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
