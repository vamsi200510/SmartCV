'use client';

import React, { useState } from 'react';
import { 
  MessageSquareHeart, X, Star, Send, Loader2, CheckCircle2, 
  Bug, Lightbulb, Sparkles, Palette, AlertCircle 
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
  userName?: string;
}

const CATEGORIES = [
  { id: 'Feature Request', label: 'Feature Idea', icon: Lightbulb, color: 'text-amber-600 bg-amber-50 border-amber-200 hover:border-amber-400' },
  { id: 'Bug Report', label: 'Report Bug', icon: Bug, color: 'text-rose-600 bg-rose-50 border-rose-200 hover:border-rose-400' },
  { id: 'General Feedback', label: 'General', icon: MessageSquareHeart, color: 'text-emerald-600 bg-emerald-50 border-emerald-200 hover:border-emerald-400' },
  { id: 'Design & Templates', label: 'Design', icon: Palette, color: 'text-sky-600 bg-sky-50 border-sky-200 hover:border-sky-400' },
];

export default function FeedbackModal({
  isOpen,
  onClose,
  userEmail = '',
  userName = '',
}: FeedbackModalProps) {
  const [category, setCategory] = useState<string>('Feature Request');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState<string>(userName);
  const [email, setEmail] = useState<string>(userEmail);
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please write a brief feedback message.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || userName || 'SmartCV User',
          email: email.trim() || userEmail || 'user@smartcv.co',
          rating,
          category,
          message: message.trim(),
          currentUrl: typeof window !== 'undefined' ? window.location.href : '',
          userAgent: typeof window !== 'undefined' ? navigator.userAgent : '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit feedback.');
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setMessage('');
        onClose();
      }, 2500);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-[#E8DDD0] w-full max-w-lg overflow-hidden animate-scale-in flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-[#E8DDD0] bg-[#FFFEF9] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-2xl bg-[#FCE3C7] border border-[#F4B77E] flex items-center justify-center text-[#C2600E] shadow-xs">
              <MessageSquareHeart size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#241C12] tracking-tight">Share Your Feedback</h3>
              <p className="text-xs text-[#5C4E3E]">Help us shape and perfect the SmartCV experience.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full bg-[#FAF6F2] hover:bg-[#F5EFEB] border border-[#E8DDD0] text-slate-500 hover:text-[#241C12] flex items-center justify-center transition cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        </div>

        {submitted ? (
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-emerald-50 border-2 border-emerald-200 text-[#1F7A3D] flex items-center justify-center shadow-lg animate-bounce">
              <CheckCircle2 size={36} />
            </div>
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-[#241C12]">Thank you for your feedback!</h4>
              <p className="text-xs text-[#5C4E3E] max-w-xs">
                Your message has been directly sent to our lead development team. We appreciate you helping us make SmartCV better!
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4.5 overflow-y-auto custom-scrollbar flex-1">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Category Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#5C4E3E] uppercase tracking-wider">Feedback Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategory(cat.id)}
                      className={`p-2 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#C2600E] border-[#C2600E] text-white shadow-sm ring-2 ring-[#C2600E]/20'
                          : 'bg-white border-[#E8DDD0] text-slate-700 hover:bg-[#FAF6F2]'
                      }`}
                    >
                      <Icon size={14} className={isSelected ? 'text-white' : ''} />
                      <span className="text-[10.5px] leading-none">{cat.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Star Rating */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#5C4E3E] uppercase tracking-wider">How is your experience?</label>
              <div className="flex items-center gap-1.5 p-2 bg-[#FAF6F2] rounded-xl border border-[#E8DDD0] justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-125 cursor-pointer"
                  >
                    <Star
                      size={22}
                      className={`${
                        (hoverRating || rating) >= star
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      } transition-colors`}
                    />
                  </button>
                ))}
                <span className="text-xs font-extrabold text-[#C2600E] ml-2 min-w-[50px]">
                  {rating === 5 ? 'Amazing 🚀' : rating === 4 ? 'Good 👍' : rating === 3 ? 'Okay 😐' : rating === 2 ? 'Needs Work ⚠️' : 'Poor 👎'}
                </span>
              </div>
            </div>

            {/* Message Textarea */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#5C4E3E] uppercase tracking-wider">Your Message <span className="text-rose-500">*</span></label>
                <span className="text-[10px] text-slate-400">{message.length}/1000</span>
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
                rows={4}
                required
                placeholder="Tell us what you love, what broke, or what features you'd like to see next..."
                className="w-full p-3 text-xs rounded-xl bg-white border border-[#E8DDD0] text-[#241C12] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C2600E]/20 focus:border-[#C2600E] transition custom-scrollbar resize-none"
              />
            </div>

            {/* Sender Info (optional fields) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-[#5C4E3E] uppercase">Your Name (Optional)</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Smith"
                  className="w-full h-8.5 px-3 text-xs rounded-xl bg-white border border-[#E8DDD0] text-[#241C12] focus:outline-none focus:border-[#C2600E]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10.5px] font-bold text-[#5C4E3E] uppercase">Your Email (Optional)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full h-8.5 px-3 text-xs rounded-xl bg-white border border-[#E8DDD0] text-[#241C12] focus:outline-none focus:border-[#C2600E]"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#5C4E3E] hover:bg-[#FAF6F2] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !message.trim()}
                className="px-5 py-2 rounded-xl bg-[#C2600E] hover:bg-[#9C4A08] text-white text-xs font-bold flex items-center gap-1.5 shadow-md hover:shadow-lg disabled:opacity-50 transition cursor-pointer"
              >
                {submitting ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                <span>{submitting ? 'Sending…' : 'Send Feedback'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
