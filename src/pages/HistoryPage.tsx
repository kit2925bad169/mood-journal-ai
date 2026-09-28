import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import { JournalEntry } from '../types.js';
import {
  Search,
  Filter,
  Calendar,
  PenLine,
  Mic,
  Trash2,
  Edit3,
  X,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Layers,
  ArrowRight
} from 'lucide-react';

export const HistoryPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { t, language } = useLanguage();

  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMoodFilter, setSelectedMoodFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Edit modal state
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    loadJournals();
  }, [selectedMoodFilter]);

  const loadJournals = async () => {
    try {
      setIsLoading(true);
      const res = await api.getJournals({
        mood: selectedMoodFilter || undefined,
        search: searchQuery || undefined
      });
      setJournals(res.journals);
    } catch (err) {
      console.error('Error fetching journal history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadJournals();
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this journal reflection?')) return;
    try {
      await api.deleteJournal(id);
      setJournals((prev) => prev.filter((j) => j.id !== id));
      if (selectedJournal?.id === id) {
        setSelectedJournal(null);
      }
    } catch (err) {
      alert('Failed to delete journal entry.');
    }
  };

  const handleStartEdit = (entry: JournalEntry) => {
    setSelectedJournal(entry);
    setEditText(entry.text);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedJournal || !editText.trim()) return;
    setIsUpdating(true);
    try {
      const res = await api.updateJournal(selectedJournal.id, editText.trim(), language);
      setIsEditing(false);
      setSelectedJournal({
        ...selectedJournal,
        text: editText.trim(),
        ...res.analysis,
        score: res.analysis.moodScore
      });
      loadJournals();
    } catch (err) {
      alert('Failed to update reflection.');
    } finally {
      setIsUpdating(false);
    }
  };

  const getMoodBadgeClass = (mood: string) => {
    switch (mood?.toLowerCase()) {
      case 'happy':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
      case 'calm':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300';
      case 'stressed':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16">
      {/* Header & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">📜</span>
            <span>Journal History</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, search, and reflect upon your past emotional milestones
          </p>
        </div>

        {/* Search & Mood Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reflections..."
              className="pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-48 sm:w-56"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </form>

          <select
            value={selectedMoodFilter}
            onChange={(e) => setSelectedMoodFilter(e.target.value)}
            className="text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Moods</option>
            <option value="Stressed">Stressed</option>
            <option value="Calm">Calm</option>
            <option value="Happy">Happy</option>
            <option value="Neutral">Neutral</option>
          </select>
        </div>
      </div>

      {/* Journals Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-xs text-slate-500">Loading your reflections...</div>
      ) : journals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">No reflections found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
            {searchQuery || selectedMoodFilter ? 'Try clearing your search filters.' : 'Start your first daily reflection to build your mood timeline.'}
          </p>
          <button
            onClick={() => onNavigate('journal')}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
          >
            Write First Reflection
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {journals.map((entry) => (
            <div
              key={entry.id}
              onClick={() => setSelectedJournal(entry)}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    {entry.inputType === 'voice' ? <Mic className="w-3.5 h-3.5 text-emerald-600" /> : <PenLine className="w-3.5 h-3.5" />}
                    <span>{new Date(entry.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${getMoodBadgeClass(entry.mood)}`}>
                    {entry.mood}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 line-clamp-3 leading-relaxed">
                  "{entry.text}"
                </p>

                {/* Context tags */}
                {entry.contexts && entry.contexts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {entry.contexts.slice(0, 2).map((c, i) => (
                      <span key={i} className="text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-md">
                        {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Emotion: <strong className="text-slate-700 dark:text-slate-300">{entry.emotion}</strong></span>
                <span className="text-emerald-600 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detailed Journal Modal */}
      {selectedJournal && !isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="text-xs text-slate-400">
                  {new Date(selectedJournal.createdAt).toLocaleString([], { dateStyle: 'long', timeStyle: 'short' })}
                </span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <span>{selectedJournal.mood}</span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-slate-600 dark:text-slate-400">{selectedJournal.emotion}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedJournal(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* User Raw Text */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Your Reflection:
              </span>
              <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                {selectedJournal.text}
              </p>
            </div>

            {/* Explainable AI breakdown */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4" /> Explainable AI Reasoning
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {selectedJournal.explanation?.summary}
              </p>

              {/* Mentions vs Inferences */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Explicitly stated:</span>
                  <ul className="space-y-1 text-slate-500 dark:text-slate-400 list-disc list-inside">
                    {selectedJournal.explanation?.explicitMentions?.map((m, i) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block mb-1">AI Inferred:</span>
                  <ul className="space-y-1 text-slate-500 dark:text-slate-400 list-disc list-inside">
                    {selectedJournal.explanation?.aiInferences?.map((inf, i) => (
                      <li key={i}>{inf}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* AI Response */}
            {selectedJournal.aiResponse && (
              <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-slate-800 dark:text-slate-100 leading-relaxed">
                <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">Personalized AI Reflection:</span>
                "{selectedJournal.aiResponse}"
              </div>
            )}

            {/* Action Bar */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleDelete(selectedJournal.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Entry</span>
              </button>

              <button
                onClick={() => handleStartEdit(selectedJournal)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 hover:opacity-90 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Reflection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedJournal && isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Edit Reflection
            </h3>
            <p className="text-xs text-slate-500">
              Updating your reflection will re-analyze your text with the AI engine to update mood scores and explanation tags.
            </p>

            <textarea
              rows={6}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={isUpdating}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
              >
                {isUpdating ? 'Re-analyzing...' : 'Save & Re-analyze'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
