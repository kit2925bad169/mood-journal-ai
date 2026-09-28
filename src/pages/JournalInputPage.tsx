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
  Lightbulb
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
      text:
        'Today I had two tight project deadlines. I worked late and felt very stressed because I could not finish everything on time.'
    },
    {
      title: 'Morning Calm',
      text:
        'Went for a peaceful walk in the park this morning. Felt refreshed, centered, and ready to tackle my tasks.'
    },
    {
      title: 'Presentation Win',
      text:
        'I completed our team presentation today! The feedback was amazing and I felt really proud and confident.'
    },
    {
      title: 'Overwhelmed',
      text:
        'My manager criticized my draft and I felt overwhelmed and frustrated. I need to take a step back and reorganize.'
    }
  ];

  /*
   * IMPORTANT:
   * This is the single handler used by VoiceRecorder.
   *
   * Whatever the microphone produces becomes the actual
   * journal textarea value.
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

    /*
     * New transcription means previous AI analysis
     * should no longer be displayed.
     */
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
      console.log(
        '🤖 Sending journal to Gemini:',
        cleanedText
      );

      const res = await api.analyzeText(
        cleanedText,
        language
      );

      setPreprocessedData(res.preprocessed);
      setAnalysisResult(res.analysis);
    } catch (err: any) {
      console.error(
        '❌ Journal analysis failed:',
        err
      );

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
        human_support_notes: notes
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
      console.error(
        '❌ Failed to save journal:',
        err
      );

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
    <div className="max-w-4xl mx-auto space-y-6 pb-16">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">

        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">

            <span className="p-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
              ✍️
            </span>

            {t.journal.title}

          </h1>

          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.journal.subtitle}
          </p>
        </div>

        {/* LANGUAGE */}
        <div className="flex items-center gap-2 self-start sm:self-auto">

          <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />

          <select
            value={language}
            onChange={(e) =>
              setLanguage(
                e.target.value as any
              )
            }
            className="text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-3 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
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

      {/* =====================================================
          MODE SWITCHER
      ====================================================== */}

      <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl w-full sm:w-80">

        {/* TEXT MODE */}
        <button
          type="button"
          onClick={handleTextMode}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === 'text'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <PenLine className="w-4 h-4" />

          <span>
            {t.journal.textMode}
          </span>
        </button>

        {/* VOICE MODE */}
        <button
          type="button"
          onClick={handleVoiceMode}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
            mode === 'voice'
              ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4" />

          <span>
            {t.journal.voiceMode}
          </span>
        </button>

      </div>

      {/* =====================================================
          MAIN JOURNAL CARD
      ====================================================== */}

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">

        {/* =================================================
            VOICE RECORDER
        ================================================== */}

        {mode === 'voice' && (
          <VoiceRecorder
            onTranscriptionComplete={
              handleVoiceTranscription
            }
            isAnalyzing={isAnalyzing}
          />
        )}

        {/* =================================================
            JOURNAL TEXTAREA
        ================================================== */}

        <div>

          <div className="flex items-center justify-between mb-2">

            <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">

              {mode === 'voice'
                ? 'Review & Edit Your Spoken Journal'
                : 'Write Your Thoughts'}

            </label>

            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
              {journalText.length}{' '}
              {t.journal.characterCount}
            </span>

          </div>

          <textarea
            rows={5}
            value={journalText}
            onChange={(e) => {
              setJournalText(
                e.target.value
              );

              /*
               * User edited the journal,
               * so previous analysis is no longer
               * guaranteed to match the text.
               */
              setAnalysisResult(null);
              setPreprocessedData(null);
              setIsSaved(false);
            }}
            placeholder={
              t.journal.writePlaceholder
            }
            className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-slate-100 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 transition-all resize-y"
          />

        </div>

        {/* =================================================
            SAMPLE PROMPTS
        ================================================== */}

        <div className="pt-1">

          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 flex items-center gap-1 mb-2">

            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />

            Try a sample reflection:

          </span>

          <div className="flex flex-wrap gap-2">

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
                  className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs hover:border-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
                >
                  {prompt.title}
                </button>
              )
            )}

          </div>

        </div>

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">

            <AlertCircle className="w-4 h-4 shrink-0" />

            <span>
              {error}
            </span>

          </div>
        )}

        {/* =================================================
            ACTION BUTTONS
        ================================================== */}

        <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">

          {/* CLEAR */}
          <button
            type="button"
            onClick={handleClear}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all disabled:opacity-50"
          >
            <RotateCcw className="w-3.5 h-3.5" />

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
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm shadow-md hover:scale-105 active:scale-95 transition-all"
          >
            <Sparkles className="w-4 h-4" />

            <span>
              {isAnalyzing
                ? t.journal.analyzing
                : t.journal.analyzeJournal}
            </span>

          </button>

        </div>

      </div>

      {/* =====================================================
          AI ANALYSIS
      ====================================================== */}

      {analysisResult && (
        <AIResponseCard
          analysis={analysisResult}
          preprocessed={
            preprocessedData || undefined
          }
          onSave={handleSave}
          isSaving={isSaving}
          saved={isSaved}
        />
      )}

    </div>
  );
};