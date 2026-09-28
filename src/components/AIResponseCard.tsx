import React, { useState, useEffect } from 'react';
import {
  AIAnalysisResult,
  PreprocessedJournal
} from '../types.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  Sparkles,
  Volume2,
  Square,
  CheckCircle2,
  HelpCircle,
  BookmarkCheck,
  UserCheck,
  ArrowRight,
  ShieldAlert,
  Info,
  Layers,
  HeartHandshake
} from 'lucide-react';
import { SafetyAlert } from './SafetyAlert.js';

interface AIResponseCardProps {
  analysis: AIAnalysisResult;
  preprocessed?: PreprocessedJournal;
  onSave: (humanSupport: boolean, notes?: string) => Promise<void>;
  isSaving: boolean;
  saved: boolean;
}

export const AIResponseCard: React.FC<AIResponseCardProps> = ({
  analysis,
  preprocessed,
  onSave,
  isSaving,
  saved
}) => {
  const { t, localeCode } = useLanguage();
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [selectedSupporterOption, setSelectedSupporterOption] = useState<'none' | 'supporter' | 'ai'>('none');
  const [supportNotes, setSupportNotes] = useState('');

  // Stop voice synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (!('speechSynthesis' in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
    } else {
      window.speechSynthesis.cancel();
      const textToSpeak = `${analysis.aiResponse} ${analysis.followUpQuestion || ''}`;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = localeCode;
      utterance.rate = 0.95;

      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
      setIsPlayingAudio(true);
    }
  };

  const getMoodBadgeClass = (mood: string) => {
    switch (mood.toLowerCase()) {
      case 'happy':
      case 'positive':
        return 'bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700';
      case 'calm':
      case 'peaceful':
        return 'bg-teal-100 dark:bg-teal-950/70 text-teal-800 dark:text-teal-300 border-teal-300 dark:border-teal-700';
      case 'stressed':
      case 'anxious':
        return 'bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 mt-6">
      {/* Safety Alert if detected */}
      {analysis.safetyCheck && <SafetyAlert safety={analysis.safetyCheck} />}

      {/* Visual Workflow Tracker */}
      <div className="bg-slate-50 dark:bg-slate-900/40 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[500px] text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[10px] font-bold">1</span>
            <span>Preprocessing</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[10px] font-bold">2</span>
            <span>AI Understanding</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[10px] font-bold">3</span>
            <span>Explainability</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[10px] font-bold">4</span>
            <span>Personalized Response</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600" />
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[10px] font-bold">5</span>
            <span>Suggestions</span>
          </div>
        </div>
      </div>

      {/* Primary Understanding Summary Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Mood Analysis
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <span>{analysis.mood}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-slate-700 dark:text-slate-300">{analysis.emotion}</span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3 py-1.5 rounded-xl border text-xs font-bold ${getMoodBadgeClass(analysis.mood)}`}>
              Mood: {analysis.mood}
            </span>
            <span className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300">
              Sentiment: {analysis.sentiment}
            </span>
            <span className="px-3 py-1.5 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 text-xs font-bold text-indigo-700 dark:text-indigo-300">
              Score: {analysis.moodScore} / 5
            </span>
          </div>
        </div>

        {/* Mood Score Explanation Banner */}
        <div className="mt-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>{t.dashboard.moodScoreExpl}</span>
        </div>

        {/* Confidence Meter */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" /> {t.journal.confidence}: {Math.round(analysis.confidence * 100)}%
            </span>
            <span className="text-slate-400 text-[11px]">Analysis Confidence</span>
          </div>
          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round(analysis.confidence * 100)}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
            {t.journal.confidenceNote}
          </p>
        </div>
      </div>

      {/* Explainable AI Section ("Why did the AI identify this?") */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h4 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          {t.journal.whyAiIdentified}
        </h4>

        {/* Summary note */}
        {analysis.explanation?.summary && (
          <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed">
            {analysis.explanation.summary}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Explicit User Mentions */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {t.journal.whatYouSaid}
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {analysis.explanation?.explicitMentions?.map((m, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>"{m}"</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI Inferences */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              {t.journal.whatAiInferred}
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              {analysis.explanation?.aiInferences?.map((inf, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-slate-400">•</span>
                  <span>{inf}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Triggers and Contexts Badges */}
        <div className="pt-2 flex flex-wrap gap-2 text-xs">
          {analysis.contexts?.map((ctx, i) => (
            <span key={i} className="px-2.5 py-1 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 font-medium border border-teal-200 dark:border-teal-800">
              Context: {ctx}
            </span>
          ))}
          {analysis.triggers?.map((trig, i) => (
            <span key={i} className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-medium border border-rose-200 dark:border-rose-800">
              Trigger: {trig}
            </span>
          ))}
        </div>
      </div>

      {/* Personalized AI Reflection & Voice Audio */}
      <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/70 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> AI Reflection & Perspective
          </span>

          {/* Voice Audio Listen Button */}
          {'speechSynthesis' in window && (
            <button
              onClick={handleToggleSpeech}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isPlayingAudio
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-50'
              }`}
            >
              {isPlayingAudio ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" /> {t.journal.stopAudio}
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" /> {t.journal.listenAudio}
                </>
              )}
            </button>
          )}
        </div>

        <p className="text-slate-800 dark:text-slate-100 text-base leading-relaxed">
          {analysis.aiResponse}
        </p>

        {analysis.followUpQuestion && (
          <div className="p-3.5 rounded-xl bg-white/80 dark:bg-slate-900/80 border border-emerald-200 dark:border-emerald-800 text-xs sm:text-sm text-slate-700 dark:text-slate-300 italic">
            <strong>Gentle Reflection:</strong> "{analysis.followUpQuestion}"
          </div>
        )}
      </div>

      {/* Personalized Suggestions Cards */}
      {analysis.suggestions && analysis.suggestions.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h4 className="text-base font-bold text-slate-900 dark:text-white">
            💡 {t.journal.personalizedSuggestions}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            {analysis.suggestions.map((s, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-bold text-slate-900 dark:text-white">{s.title}</h5>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                    {s.category}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optional Human Supporter Option */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Real Human Support</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose a real supporter and see their current availability and ratings.</p>
          </div>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400">
          You can save this journal and then choose a specific human supporter from the Human Support page.
        </p>

        <div className="flex flex-wrap gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => setSelectedSupporterOption('supporter')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              selectedSupporterOption === 'supporter'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {t.journal.talkToHuman}
          </button>
          <button
            type="button"
            onClick={() => setSelectedSupporterOption('ai')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedSupporterOption === 'ai'
                ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {t.journal.continueWithAI}
          </button>
        </div>
      </div>

      {/* Save Action Bar */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-xs text-slate-500 dark:text-slate-400 italic">
          {t.disclaimer}
        </p>

        <button
          type="button"
          onClick={() => onSave(selectedSupporterOption === 'supporter', supportNotes)}
          disabled={isSaving || saved}
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all ${
            saved
              ? 'bg-emerald-600 text-white cursor-default'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-105 active:scale-95'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          {saved ? t.journal.savedSuccess : isSaving ? 'Saving...' : t.journal.saveJournal}
        </button>
      </div>
    </div>
  );
};
