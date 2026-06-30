import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Trash2, Check, BrainCircuit } from 'lucide-react';

interface ActivityFeedbackProps {
  activityTitle: string;
  destination: string;
  onFeedbackChange?: () => void;
}

export interface UserFeedback {
  activityTitle: string;
  destination: string;
  rating: number; // 1 to 5
  comment: string;
  timestamp: number;
}

export default function ActivityFeedback({
  activityTitle,
  destination,
  onFeedbackChange
}: ActivityFeedbackProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // Load existing feedback on mount or when activityTitle/destination changes
  useEffect(() => {
    try {
      const stored = localStorage.getItem('user-preferences');
      if (stored) {
        const feedbacks: UserFeedback[] = JSON.parse(stored);
        const found = feedbacks.find(
          (f) =>
            f.activityTitle.toLowerCase() === activityTitle.toLowerCase() &&
            f.destination.toLowerCase() === destination.toLowerCase()
        );
        if (found) {
          setRating(found.rating);
          setComment(found.comment || '');
          setIsSaved(true);
          return;
        }
      }
    } catch (e) {
      console.error('Error loading user feedback:', e);
    }
    // Reset if not found
    setRating(0);
    setComment('');
    setIsSaved(false);
  }, [activityTitle, destination]);

  const handleSave = () => {
    if (rating === 0) return;

    try {
      const stored = localStorage.getItem('user-preferences');
      let feedbacks: UserFeedback[] = stored ? JSON.parse(stored) : [];

      // Filter out existing one for this activity
      feedbacks = feedbacks.filter(
        (f) =>
          !(
            f.activityTitle.toLowerCase() === activityTitle.toLowerCase() &&
            f.destination.toLowerCase() === destination.toLowerCase()
          )
      );

      // Add new feedback
      feedbacks.push({
        activityTitle,
        destination,
        rating,
        comment,
        timestamp: Date.now()
      });

      localStorage.setItem('user-preferences', JSON.stringify(feedbacks));
      setIsSaved(true);
      if (onFeedbackChange) onFeedbackChange();
    } catch (e) {
      console.error('Error saving user feedback:', e);
    }
  };

  const handleClear = () => {
    try {
      const stored = localStorage.getItem('user-preferences');
      if (stored) {
        let feedbacks: UserFeedback[] = JSON.parse(stored);
        feedbacks = feedbacks.filter(
          (f) =>
            !(
              f.activityTitle.toLowerCase() === activityTitle.toLowerCase() &&
              f.destination.toLowerCase() === destination.toLowerCase()
            )
        );
        localStorage.setItem('user-preferences', JSON.stringify(feedbacks));
      }
      setRating(0);
      setComment('');
      setIsSaved(false);
      setIsExpanded(false);
      if (onFeedbackChange) onFeedbackChange();
    } catch (e) {
      console.error('Error clearing feedback:', e);
    }
  };

  return (
    <div 
      className="mt-3 border-t border-white/5 pt-3 w-full flex flex-col gap-2 bg-slate-900/40 p-3 rounded-xl border border-white/5"
      id={`feedback-box-${activityTitle.replace(/\s+/g, '-')}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
          <BrainCircuit className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          {isSaved ? 'AI Preference Captured' : 'Rate to influence future plans'}
        </span>

        {/* Clear Button */}
        {isSaved && (
          <button
            onClick={handleClear}
            className="text-[10px] text-rose-400/80 hover:text-rose-400 font-mono flex items-center gap-0.5 transition-colors"
            title="Remove feedback"
            id={`btn-clear-${activityTitle.replace(/\s+/g, '-')}`}
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        {/* Star Selection Row */}
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => {
            const isFilled = hoverRating ? star <= hoverRating : star <= rating;
            return (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRating(star);
                  setIsSaved(false);
                  setIsExpanded(true);
                }}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 hover:scale-110 transition-transform focus:outline-none"
                id={`star-${star}-${activityTitle.replace(/\s+/g, '-')}`}
              >
                <Star
                  className={`w-4 h-4 transition-colors ${
                    isFilled
                      ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.3)]'
                      : 'text-slate-600 hover:text-slate-400'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Rating description */}
        {rating > 0 && (
          <span className="text-[11px] font-mono font-medium text-slate-300">
            {rating === 5 ? 'Loved it!' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Weak' : 'Disliked'}
          </span>
        )}

        {/* Toggle Comment Field */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`ml-auto text-[10px] font-mono px-2 py-1 rounded transition-colors flex items-center gap-1 ${
            comment || isExpanded
              ? 'bg-slate-800 text-slate-300 border border-white/5'
              : 'text-slate-500 hover:text-slate-300'
          }`}
          id={`btn-comment-toggle-${activityTitle.replace(/\s+/g, '-')}`}
        >
          <MessageSquare className="w-3 h-3" />
          {comment ? 'Edit Note' : 'Add Note'}
        </button>
      </div>

      {/* Expanded feedback notes form */}
      {(isExpanded || comment) && (
        <div className="flex flex-col gap-2 mt-2">
          <textarea
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
              setIsSaved(false);
            }}
            placeholder="Tell Anakin and IBM Bob why you liked or disliked this activity..."
            rows={1.5}
            className="w-full text-xs bg-slate-950/80 border border-white/10 rounded-lg p-2 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 resize-none font-sans"
            id={`input-comment-${activityTitle.replace(/\s+/g, '-')}`}
          />
          <div className="flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-mono">
              Saved locally to <code className="text-slate-400">user-preferences</code>
            </span>
            <button
              onClick={handleSave}
              disabled={rating === 0 || isSaved}
              className={`text-[10px] font-mono font-bold px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
                isSaved
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md'
              }`}
              id={`btn-save-feedback-${activityTitle.replace(/\s+/g, '-')}`}
            >
              {isSaved ? (
                <>
                  <Check className="w-3 h-3" />
                  Captured
                </>
              ) : (
                <>
                  Save Preference
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
