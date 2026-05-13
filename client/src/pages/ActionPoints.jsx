import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ClipboardList,
  Save,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import ActionPointsAPI from '../api/actionPoints';

/* ── Helpers ──────────────────────────────────────────────────── */
function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/* ── Status indicator pill ───────────────────────────────────── */
function SaveStatus({ status, updatedAt }) {
  if (status === 'saved')
    return (
      <span className="inline-flex items-center gap-1.5 text-emerald-600 text-sm font-semibold">
        <CheckCircle2 className="w-4 h-4" />
        Saved {updatedAt ? `· ${formatDate(updatedAt)}` : ''}
      </span>
    );
  if (status === 'saving')
    return (
      <span className="inline-flex items-center gap-1.5 text-primary-600 text-sm font-semibold animate-pulse">
        <Loader2 className="w-4 h-4 animate-spin" />
        Saving…
      </span>
    );
  if (status === 'error')
    return (
      <span className="inline-flex items-center gap-1.5 text-red-500 text-sm font-semibold">
        <AlertCircle className="w-4 h-4" />
        Save failed
      </span>
    );
  if (status === 'typing')
    return (
      <span className="inline-flex items-center gap-1.5 text-slate-400 text-sm font-medium">
        <Clock className="w-4 h-4" />
        Unsaved changes
      </span>
    );
  // idle / initial
  if (updatedAt)
    return (
      <span className="inline-flex items-center gap-1.5 text-slate-400 text-sm font-medium">
        <Clock className="w-4 h-4" />
        Last saved {formatDate(updatedAt)}
      </span>
    );
  return null;
}

/* ── Main Component ─────────────────────────────────────────── */
export default function ActionPoints() {
  const [content, setContent] = useState('');
  const [updatedAt, setUpdatedAt] = useState(null);
  const [status, setStatus] = useState('idle'); // idle | loading | typing | saving | saved | error
  const [charCount, setCharCount] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const debounceRef = useRef(null);
  const textareaRef = useRef(null);

  /* ── Load saved content on mount ── */
  useEffect(() => {
    setStatus('loading');
    ActionPointsAPI.get()
      .then(({ data }) => {
        setContent(data.content || '');
        setCharCount((data.content || '').length);
        setUpdatedAt(data.updatedAt);
        setStatus('idle');
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Failed to load action points');
        setStatus('idle');
      });
  }, []);

  /* ── Ctrl+S / Cmd+S shortcut ── */
  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        triggerSave(content);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [content]); // re-register when content changes

  /* ── Core save function ── */
  const triggerSave = useCallback(
    async (text) => {
      clearTimeout(debounceRef.current);
      setStatus('saving');
      try {
        const { data } = await ActionPointsAPI.save(text);
        setUpdatedAt(data.updatedAt);
        setStatus('saved');
      } catch (err) {
        setStatus('error');
        toast.error(err.response?.data?.message || 'Failed to save');
      }
    },
    []
  );

  /* ── Textarea change handler with 2s debounce auto-save ── */
  const handleChange = (e) => {
    const val = e.target.value;
    setContent(val);
    setCharCount(val.length);
    setStatus('typing');

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      triggerSave(val);
    }, 2000);
  };

  /* ── Manual save via button ── */
  const handleManualSave = () => {
    triggerSave(content);
  };

  /* ── Clear all ── */
  const handleClear = async () => {
    setShowClearConfirm(false);
    setContent('');
    setCharCount(0);
    clearTimeout(debounceRef.current);
    await triggerSave('');
    toast.success('Action points cleared');
    textareaRef.current?.focus();
  };

  /* ── Cleanup debounce timer on unmount ── */
  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const isLoading = status === 'loading';
  const isSaving = status === 'saving';

  return (
    <div className="min-h-screen bg-gray-50 pb-16">

      {/* ── Sticky Page Header ─────────────────────────────────── */}
      <div className="bg-white border-b-2 border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          {/* Left: back + title */}
          <div className="flex items-center gap-3">
            <Link
              to="/ideas"
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Back to Ideas"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-50 border border-primary-100 rounded-xl flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-primary-600" />
              </div>
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                Action Points
              </h1>
            </div>
          </div>

          {/* Right: save status + actions */}
          <div className="flex items-center gap-3">
            <SaveStatus status={status} updatedAt={updatedAt} />

            {/* Clear button */}
            {content.length > 0 && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-red-600
                           hover:bg-red-50 border border-red-100 rounded-xl transition-colors"
                title="Clear all content"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Clear
              </button>
            )}

            {/* Manual Save button */}
            <button
              onClick={handleManualSave}
              disabled={isSaving || isLoading}
              className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 disabled:opacity-60
                         text-white font-bold px-5 py-2 rounded-xl transition-all duration-200 text-sm
                         shadow-md shadow-primary-500/20 active:scale-95 border-2 border-primary-400"
            >
              {isSaving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Save
            </button>
          </div>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-5xl mx-auto px-4 py-8"
      >
        {/* Clear confirmation overlay */}
        {showClearConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setShowClearConfirm(false)}
            />
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full border-2 border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Clear all content?</h3>
                  <p className="text-sm text-slate-500 mt-0.5">This action cannot be undone.</p>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClear}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl transition-colors active:scale-95"
                >
                  Yes, Clear
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Card */}
        <div className="bg-white border-2 border-gray-100 rounded-3xl shadow-sm overflow-hidden">
          {/* Card header bar */}
          <div className="px-6 py-4 border-b-2 border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                Private notepad — visible to admins only
              </p>
              
            </div>
            <span className="text-xs font-mono text-slate-400 tabular-nums">
              {charCount.toLocaleString()} chars
            </span>
          </div>

          {/* Textarea */}
          {isLoading ? (
            <div className="flex items-center justify-center h-[60vh]">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
                <p className="text-slate-500 text-sm font-medium">Loading…</p>
              </div>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleChange}
              placeholder={`Write your action points here…\n\n• Action item 1\n• Action item 2\n\nUse this space for any team action points, reminders, or notes.`}
              className="w-full min-h-[62vh] px-6 py-6 text-slate-800 font-medium text-base leading-8
                         placeholder-slate-300 resize-none focus:outline-none
                         font-[Outfit,Inter,sans-serif]"
              spellCheck
              autoFocus={!isLoading}
            />
          )}
        </div>

        {/* Mobile clear button */}
        {content.length > 0 && (
          <div className="flex justify-end mt-4 sm:hidden">
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600
                         hover:bg-red-50 border border-red-100 rounded-xl transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear all
            </button>
          </div>
        )}

        {/* Tips section */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
           // { label: 'Auto-save', desc: 'Content saves automatically 2 seconds after you stop typing.' },
            { label: 'Keyboard shortcut', desc: 'Press Ctrl+S (or ⌘+S on Mac) to save instantly at any time.' },
            { label: 'Admin only', desc: 'This page is private and accessible only to admin accounts.' },
          ].map((tip) => (
            <div
              key={tip.label}
              className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-sm"
            >
              <p className="text-xs font-black text-primary-600 uppercase tracking-wider mb-1">
                {tip.label}
              </p>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">{tip.desc}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
