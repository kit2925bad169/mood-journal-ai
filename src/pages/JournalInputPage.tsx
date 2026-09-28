import React, { useState } from 'react';
import { useLanguage, LANGUAGE_OPTIONS } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import { AIAnalysisResult, PreprocessedJournal } from '../types.js';
import { VoiceRecorder } from '../components/VoiceRecorder.js';
import { AIResponseCard } from '../components/AIResponseCard.js';
import {
  PenLine,
  Mic,
  Globe,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Lightbulb,
  Heart,
  Brain,
  ArrowRight,
  CheckCircle2,
  WandSparkles,
} from 'lucide-react';

export const JournalInputPage: React.FC<{
  onNavigate: (page: string) => void;
}> = ({ onNavigate }) => {
  const { language, setLanguage, t } = useLanguage();

  const [mode, setMode] = useState<'text' | 'voice'>('text');
  const [journalText, setJournalText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [analysisResult, setAnalysisResult] =
    useState<AIAnalysisResult | null>(null);
  const [preprocessedData, setPreprocessedData] =
    useState<PreprocessedJournal | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  /*
   * Sample prompts
   */
  const samplePrompts = [
    {
      title: 'Deadline Stress',
      emoji: '😮‍💨',
      text:
        'Today I had two tight project deadlines. I worked late and felt very stressed because I could not finish everything on time.',
      style:
        'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 dark:border-rose-900 dark:bg-rose-950/20 dark:text-rose-300',
    },
    {
      title: 'Morning Calm',
      emoji: '🌿',
      text:
        'Went for a peaceful walk in the park this morning. Felt refreshed, centered, and ready to tackle my tasks.',
      style:
        'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-300',
    },
    {
      title: 'Presentation Win',
      emoji: '🎉',
      text:
        'I completed our team presentation today! The feedback was amazing and I felt really proud and confident.',
      style:
        'border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 dark:border-purple-900 dark:bg-purple-950/20 dark:text-purple-300',
    },
    {
      title: 'Overwhelmed',
      emoji: '🫶',
      text:
        'My manager criticized my draft and I felt overwhelmed and frustrated. I need to take a step back and reorganize.',
      style:
        'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 dark:border-orange-900 dark:bg-orange-950/20 dark:text-orange-300',
    },
  ];

  /*
   * Voice transcription
   */
  const handleVoiceTranscription = (text: string) => {
    const cleanedText = (text || '').trim();

    console.log(
      '🎤 JournalInputPage received transcription:',
      cleanedText
    );

    if (!cleanedText) {
      return;
    }

    setJournalText(cleanedText);
    setAnalysisResult(null);
    setPreprocessedData(null);
    setIsSaved(false);
    setError('');
  };

  /*
   * Analyze journal
   */
  const handleAnalyze = async () => {
    const cleanedText = journalText.trim();

    if (cleanedText.length < 5) {
      setError(
        'Please write or speak at least a few words about your day before analyzing.'
      );
      return;
    }

    setError('');
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setPreprocessedData(null);
    setIsSaved(false);

    try {
      console.log('🤖 Sending journal to Gemini:', cleanedText);

      const res = await api.analyzeText(
        cleanedText,
        language
      );

      setPreprocessedData(res.preprocessed);
      setAnalysisResult(res.analysis);
    } catch (err: any) {
      console.error('❌ Journal analysis failed:', err);

      setError(
        err?.message ||
          'Failed to analyze journal. Please try again.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  /*
   * Clear journal
   */
  const handleClear = () => {
    setJournalText('');
    setAnalysisResult(null);
    setPreprocessedData(null);
    setError('');
    setIsSaved(false);
  };

  /*
   * Save journal
   */
  const handleSave = async (
    humanSupport: boolean,
    notes?: string
  ) => {
    if (!analysisResult) {
      return;
    }

    const cleanedText = journalText.trim();

    if (!cleanedText) {
      setError('Your journal text is empty.');
      return;
    }

    setIsSaving(true);

    try {
      await api.saveJournal({
        text: cleanedText,
        input_type: mode,
        language,
        analysis: analysisResult,
        human_support_requested: humanSupport,
        human_support_notes: notes,
      });

      setIsSaved(true);

      setTimeout(() => {
        onNavigate(
          humanSupport
            ? 'support'
            : 'history'
        );
      }, 1200);
    } catch (err: any) {
      console.error('❌ Failed to save journal:', err);

      setError(
        err?.message ||
          'Failed to save journal.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  /*
   * Switch to text mode
   */
  const handleTextMode = () => {
    setMode('text');
    setError('');
  };

  /*
   * Switch to voice mode
   */
  const handleVoiceMode = () => {
    setMode('voice');
    setError('');
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50/50 to-cyan-50/60 dark:from-slate-950 dark:via-purple-950/10 dark:to-slate-950">

      {/* =====================================================
          COLORFUL BACKGROUND GLOWS
      ====================================================== */}

      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-500/10" />

      <div className="pointer-events-none absolute right-[-120px] top-20 h-96 w-96 rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-500/10" />

      <div className="pointer-events-none absolute bottom-[-100px] left-[30%] h-96 w-96 rounded-full bg-cyan-300/15 blur-3xl dark:bg-cyan-500/10" />

      <div className="relative mx-auto max-w-5xl space-y-6 pb-16">

        {/* =====================================================
            HERO HEADER
        ====================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-r from-white/90 via-pink-50/90 to-purple-50/90 p-6 shadow-xl shadow-purple-900/5 backdrop-blur-xl dark:border-slate-800 dark:from-slate-900/95 dark:via-pink-950/20 dark:to-purple-950/20 sm:p-8">

          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-pink-300/30 to-purple-300/20 blur-3xl" />

          <div className="absolute bottom-[-100px] left-[35%] h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-purple-700 shadow-sm dark:border-purple-800 dark:from-pink-950/30 dark:to-purple-950/30 dark:text-purple-300">

                <Sparkles className="h-3.5 w-3.5 text-pink-500" />

                Private reflection space

              </div>

              <h1 className="flex items-center gap-3 text-3xl font-black tracking-tight text-slate-900 dark:text-white">

                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-500 text-xl text-white shadow-lg shadow-purple-500/20">
                  ✍️
                </span>

                {t.journal.title}

              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                {t.journal.subtitle}
              </p>

              <div className="mt-5 flex flex-wrap gap-2">

                <span className="flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <Heart className="h-3.5 w-3.5" />
                  Reflect
                </span>

                <span className="flex items-center gap-1.5 rounded-xl bg-purple-50 px-3 py-1.5 text-[10px] font-bold text-purple-700 dark:bg-purple-950/30 dark:text-purple-300">
                  <Brain className="h-3.5 w-3.5" />
                  AI analysis
                </span>

                <span className="flex items-center gap-1.5 rounded-xl bg-cyan-50 px-3 py-1.5 text-[10px] font-bold text-cyan-700 dark:bg-cyan-950/30 dark:text-cyan-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Personal insights
                </span>

              </div>
            </div>

            {/* LANGUAGE */}

            <div className="self-start rounded-2xl border border-white bg-white/80 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/70 sm:self-center">

              <div className="mb-2 flex items-center gap-2">

                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 text-white">
                  <Globe className="h-3.5 w-3.5" />
                </div>

                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                  Language
                </span>

              </div>

              <select
                value={language}
                onChange={(e) =>
                  setLanguage(
                    e.target.value as any
                  )
                }
                className="w-full min-w-[170px] rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 outline-none transition focus:border-purple-400 focus:ring-2 focus:ring-purple-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:ring-purple-900"
              >
                {LANGUAGE_OPTIONS.map(
                  (option) => (
                    <option
                      key={option.code}
                      value={option.code}
                    >
                      {option.nativeName} (
                      {option.label})
                    </option>
                  )
                )}
              </select>

            </div>

          </div>
        </section>

        {/* =====================================================
            MODE SWITCHER
        ====================================================== */}

        <div className="flex w-full rounded-2xl border border-white/80 bg-white/70 p-1.5 shadow-lg shadow-purple-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 sm:w-[360px]">

          {/* TEXT MODE */}

          <button
            type="button"
            onClick={handleTextMode}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition-all duration-200 ${
              mode === 'text'
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg shadow-purple-500/20'
                : 'text-slate-500 hover:bg-white hover:text-purple-600 dark:hover:bg-slate-800 dark:hover:text-purple-400'
            }`}
          >

            <PenLine className="h-4 w-4" />

            <span>
              {t.journal.textMode}
            </span>

          </button>

          {/* VOICE MODE */}

          <button
            type="button"
            onClick={handleVoiceMode}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-black transition-all duration-200 ${
              mode === 'voice'
                ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-blue-500/20'
                : 'text-slate-500 hover:bg-white hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400'
            }`}
          >

            <Mic className="h-4 w-4" />

            <span>
              {t.journal.voiceMode}
            </span>

          </button>

        </div>

        {/* =====================================================
            MAIN JOURNAL CARD
        ====================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/90 p-5 shadow-2xl shadow-purple-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:p-7">

          {/* Decorative top gradient */}

          <div className="absolute left-0 right-0 top-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 via-cyan-400 to-emerald-400" />

          {/* =================================================
              JOURNAL INTRO
          ================================================== */}

          <div className="mb-6 flex items-start gap-4">

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 to-purple-100 text-xl shadow-sm dark:from-pink-950/40 dark:to-purple-950/40">
              💭
            </div>

            <div>

              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {mode === 'voice'
                  ? 'Share your thoughts by voice'
                  : 'What is on your mind?'}
              </h2>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                {mode === 'voice'
                  ? 'Speak naturally. Your transcription will appear below so you can review it before analysis.'
                  : 'There is no perfect way to journal. Write naturally about what happened, how you felt, or what is on your mind.'}
              </p>

            </div>

          </div>

          {/* =================================================
              VOICE RECORDER
          ================================================== */}

          {mode === 'voice' && (
            <div className="mb-5 rounded-2xl border border-cyan-200 bg-gradient-to-br from-cyan-50 via-blue-50 to-purple-50 p-4 dark:border-cyan-900/60 dark:from-cyan-950/20 dark:via-blue-950/20 dark:to-purple-950/20">

              <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-cyan-700 dark:text-cyan-300">

                <Mic className="h-3.5 w-3.5" />

                Voice journal

              </div>

              <VoiceRecorder
                onTranscriptionComplete={
                  handleVoiceTranscription
                }
                isAnalyzing={isAnalyzing}
              />

            </div>
          )}

          {/* =================================================
              TEXTAREA
          ================================================== */}

          <div>

            <div className="mb-2 flex items-center justify-between">

              <label className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">

                {mode === 'voice'
                  ? 'Review & edit your spoken journal'
                  : 'Write your thoughts'}

              </label>

              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                {journalText.length}{' '}
                {t.journal.characterCount}
              </span>

            </div>

            <div className="relative">

              <textarea
                rows={7}
                value={journalText}
                onChange={(e) => {
                  setJournalText(
                    e.target.value
                  );

                  setAnalysisResult(null);
                  setPreprocessedData(null);
                  setIsSaved(false);
                }}
                placeholder={
                  t.journal.writePlaceholder
                }
                className="w-full resize-y rounded-2xl border-2 border-slate-100 bg-gradient-to-br from-slate-50/80 via-pink-50/20 to-purple-50/30 p-5 text-sm leading-7 text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-purple-300 focus:bg-white focus:ring-4 focus:ring-purple-100 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100 dark:placeholder:text-slate-600 dark:focus:border-purple-700 dark:focus:bg-slate-800 dark:focus:ring-purple-950/40"
              />

              {/* Bottom hint */}

              <div className="pointer-events-none absolute bottom-3 left-4 flex items-center gap-1.5 text-[9px] font-medium text-slate-400">
                <Sparkles className="h-3 w-3 text-purple-400" />
                Your reflection stays private
              </div>

            </div>

          </div>

          {/* =================================================
              SAMPLE PROMPTS
          ================================================== */}

          <div className="mt-6">

            <div className="mb-3 flex items-center gap-2">

              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-300 to-orange-400 text-white">
                <Lightbulb className="h-3.5 w-3.5" />
              </div>

              <div>

                <span className="block text-[11px] font-black text-slate-700 dark:text-slate-200">
                  Need inspiration?
                </span>

                <span className="block text-[9px] text-slate-400">
                  Try one of these reflection starters
                </span>

              </div>

            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

              {samplePrompts.map(
                (prompt, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => {
                      setJournalText(
                        prompt.text
                      );

                      setAnalysisResult(
                        null
                      );

                      setPreprocessedData(
                        null
                      );

                      setIsSaved(false);
                      setError('');
                    }}
                    className={`group flex items-center gap-3 rounded-2xl border p-3 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${prompt.style}`}
                  >

                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/70 text-lg shadow-sm dark:bg-slate-900/50">
                      {prompt.emoji}
                    </span>

                    <span className="min-w-0">

                      <span className="block text-xs font-black">
                        {prompt.title}
                      </span>

                      <span className="mt-0.5 block truncate text-[9px] opacity-70">
                        Click to use this example
                      </span>

                    </span>

                    <ArrowRight className="ml-auto h-3.5 w-3.5 shrink-0 opacity-40 transition-transform group-hover:translate-x-1" />

                  </button>
                )
              )}

            </div>

          </div>

          {/* =================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 p-4 text-xs text-rose-700 shadow-sm dark:border-rose-900 dark:from-rose-950/30 dark:to-pink-950/20 dark:text-rose-300">

              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-950/50">
                <AlertCircle className="h-4 w-4" />
              </div>

              <span className="pt-1">
                {error}
              </span>

            </div>
          )}

          {/* =================================================
              ACTION BUTTONS
          ================================================== */}

          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5 dark:border-slate-800">

            {/* CLEAR */}

            <button
              type="button"
              onClick={handleClear}
              disabled={isAnalyzing}
              className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-500 transition-all hover:bg-slate-100 hover:text-slate-800 disabled:opacity-50 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              <RotateCcw className="h-3.5 w-3.5" />

              <span>
                {t.journal.clear}
              </span>
            </button>

            {/* ANALYZE */}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={
                isAnalyzing ||
                !journalText.trim()
              }
              className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-purple-500/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-purple-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:px-7 sm:text-sm"
            >

              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                  <span>
                    {t.journal.analyzing}
                  </span>
                </>
              ) : (
                <>
                  <WandSparkles className="h-4 w-4" />

                  <span>
                    {t.journal.analyzeJournal}
                  </span>

                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </>
              )}

            </button>

          </div>

        </section>

        {/* =====================================================
            ANALYSIS RESULT
        ====================================================== */}

        {analysisResult && (
          <section className="relative">

            {/* Colorful AI section heading */}

            <div className="mb-4 flex items-center gap-3">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white shadow-lg shadow-pink-500/20">
                <Sparkles className="h-5 w-5" />
              </div>

              <div>

                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  Your AI reflection
                </h2>

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Gemini analyzed the reflection you just wrote
                </p>

              </div>

            </div>

            <AIResponseCard
              analysis={analysisResult}
              preprocessed={
                preprocessedData || undefined
              }
              onSave={handleSave}
              isSaving={isSaving}
              saved={isSaved}
            />

          </section>
        )}

        {/* =====================================================
            BOTTOM WELLNESS MESSAGE
        ====================================================== */}

        {!analysisResult && !isAnalyzing && (
          <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-r from-emerald-100 via-cyan-100 to-purple-100 p-5 shadow-lg shadow-cyan-900/5 dark:border-slate-800 dark:from-emerald-950/20 dark:via-cyan-950/20 dark:to-purple-950/20">

            <div className="absolute -right-12 -top-16 h-40 w-40 rounded-full bg-purple-300/20 blur-3xl" />

            <div className="relative flex items-center gap-4">

              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-sm dark:bg-slate-800/80">
                🌱
              </div>

              <div>

                <h3 className="text-xs font-black text-slate-800 dark:text-white">
                  There is no right way to feel.
                </h3>

                <p className="mt-1 text-[10px] leading-5 text-slate-600 dark:text-slate-400">
                  Just describe your experience honestly. Your AI companion
                  is here to help you notice patterns and reflect.
                </p>

              </div>

            </div>

          </section>
        )}

      </div>
    </div>
  );
};