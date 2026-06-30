import React, { useState, useEffect } from 'react';
import { BrainCircuit, Star, Trash2, Heart, HeartOff, Sparkles } from 'lucide-react';
import { UserFeedback } from './ActivityFeedback';

interface AIPreferencesDashboardProps {
  onPreferencesCleared?: () => void;
  refreshTrigger?: number;
}

export default function AIPreferencesDashboard({
  onPreferencesCleared,
  refreshTrigger = 0
}: AIPreferencesDashboardProps) {
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);

  const loadPreferences = () => {
    try {
      const stored = localStorage.getItem('user-preferences');
      if (stored) {
        setFeedbacks(JSON.parse(stored));
      } else {
        setFeedbacks([]);
      }
    } catch (e) {
      console.error('Error loading user-preferences:', e);
    }
  };

  useEffect(() => {
    loadPreferences();
  }, [refreshTrigger]);

  const handleDeleteItem = (activityTitle: string, destination: string) => {
    try {
      const updated = feedbacks.filter(
        (f) =>
          !(
            f.activityTitle.toLowerCase() === activityTitle.toLowerCase() &&
            f.destination.toLowerCase() === destination.toLowerCase()
          )
      );
      localStorage.setItem('user-preferences', JSON.stringify(updated));
      setFeedbacks(updated);
      if (onPreferencesCleared) onPreferencesCleared();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearAll = () => {
    if (window.confirm('Are you sure you want to reset your travel AI preference engine memory?')) {
      localStorage.removeItem('user-preferences');
      setFeedbacks([]);
      if (onPreferencesCleared) onPreferencesCleared();
    }
  };

  const likedCount = feedbacks.filter((f) => f.rating >= 4).length;
  const dislikedCount = feedbacks.filter((f) => f.rating <= 2).length;

  return (
    <div 
      className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col gap-4 shadow-xl"
      id="ai-preferences-dashboard-card"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-indigo-400 animate-pulse" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">AI Preference Memory</h2>
        </div>
        <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded-full font-bold font-mono">
          {feedbacks.length} Tuned
        </span>
      </div>

      <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
        Activities you rate are saved to your local profile. The AI analyzes these to prioritize similar spots and avoid things you disliked.
      </p>

      {feedbacks.length === 0 ? (
        <div className="bg-slate-950/40 rounded-xl p-4 border border-white/5 text-center flex flex-col items-center justify-center gap-1.5">
          <Sparkles className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500 font-medium">No custom preferences captured yet</span>
          <p className="text-[10px] text-slate-600 font-sans">
            Rate any activity in generated itineraries to begin tuning Anakin V2 & IBM Bob.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Quick stats grid */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-xl p-2 flex flex-col">
              <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold flex items-center justify-center gap-1">
                <Heart className="w-3 h-3 text-emerald-400 fill-emerald-400" /> Loves
              </span>
              <span className="text-base font-extrabold text-emerald-300 font-mono mt-0.5">{likedCount}</span>
            </div>
            <div className="bg-rose-950/30 border border-rose-900/40 rounded-xl p-2 flex flex-col">
              <span className="text-[9px] font-mono text-rose-400 uppercase font-bold flex items-center justify-center gap-1">
                <HeartOff className="w-3 h-3 text-rose-400 fill-rose-400" /> Dislikes
              </span>
              <span className="text-base font-extrabold text-rose-300 font-mono mt-0.5">{dislikedCount}</span>
            </div>
          </div>

          {/* List of captured preferences */}
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
            {feedbacks.map((f, i) => (
              <div
                key={i}
                className="bg-slate-950/80 border border-white/5 rounded-xl p-2.5 flex items-start justify-between gap-2 text-xs group/pref"
                id={`pref-item-${f.activityTitle.replace(/\s+/g, '-')}`}
              >
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] text-indigo-400 font-semibold truncate max-w-[130px]" title={f.destination}>
                      {f.destination}
                    </span>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-2.5 h-2.5 ${
                            idx < f.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-slate-200 truncate" title={f.activityTitle}>
                    {f.activityTitle}
                  </span>
                  {f.comment && (
                    <span className="text-[10px] text-slate-400 italic font-sans pl-1.5 border-l border-white/10 leading-tight">
                      "{f.comment}"
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteItem(f.activityTitle, f.destination)}
                  className="text-slate-600 hover:text-rose-400 p-1 rounded hover:bg-white/5 opacity-0 group-hover/pref:opacity-100 transition-all shrink-0"
                  title="Remove this preference"
                  id={`btn-delete-pref-${f.activityTitle.replace(/\s+/g, '-')}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Clear Engine Memory */}
          <button
            onClick={handleClearAll}
            className="w-full py-1.5 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-[10px] font-bold font-mono transition-all flex items-center justify-center gap-1"
            id="btn-clear-all-preferences"
          >
            <Trash2 className="w-3 h-3" />
            Clear AI Model Memory
          </button>
        </div>
      )}
    </div>
  );
}
