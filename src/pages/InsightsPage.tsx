import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  TrendingUp,
  Sparkles,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
  Clock,
  Compass
} from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [insights, setInsights] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    api.getInsights(language)
      .then((data) => setInsights(data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [language]);

  if (isLoading) {
    return <div className="py-20 text-center text-xs text-slate-500">Synthesizing emotional patterns...</div>;
  }

  const sentimentTotal = (insights?.sentimentSplit?.positive || 0) + (insights?.sentimentSplit?.negative || 0) + (insights?.sentimentSplit?.neutral || 0) || 1;
  const positivePct = Math.round(((insights?.sentimentSplit?.positive || 0) / sentimentTotal) * 100);
  const negativePct = Math.round(((insights?.sentimentSplit?.negative || 0) / sentimentTotal) * 100);
  const neutralPct = Math.max(0, 100 - positivePct - negativePct);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span className="p-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">📊</span>
          <span>Emotional Insights & Trends</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Comprehensive synthesis of triggers, contexts, and mood resilience over time
        </p>
      </div>

      {/* Main Pattern Summary Card */}
      <div className="bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-800 space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" /> Primary Trend Observation
        </span>
        <h2 className="text-xl sm:text-2xl font-extrabold leading-snug">
          {insights?.latestInsight}
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed max-w-3xl">
          Based on analysis across {insights?.totalJournals || 0} reflections, your emotional rhythms reflect strong responsiveness to work pacing, structured mornings, and social connection.
        </p>
      </div>

      {/* Sentiment Ratio & Top Emotion */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sentiment Distribution */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600" /> Overall Sentiment Split
          </h3>

          <div className="h-4 w-full rounded-full overflow-hidden flex bg-slate-100 dark:bg-slate-800">
            <div style={{ width: `${positivePct}%` }} className="bg-emerald-500 transition-all duration-500" title={`Positive ${positivePct}%`} />
            <div style={{ width: `${neutralPct}%` }} className="bg-amber-400 transition-all duration-500" title={`Neutral ${neutralPct}%`} />
            <div style={{ width: `${negativePct}%` }} className="bg-rose-500 transition-all duration-500" title={`Negative ${negativePct}%`} />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Positive ({positivePct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-400" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Neutral ({neutralPct}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">Stress / Low ({negativePct}%)</span>
            </div>
          </div>
        </div>

        {/* Most Common Emotion */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dominant Emotion</span>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {insights?.mostCommonEmotion || 'Balanced'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Most frequently occurring emotional baseline in your writing
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> High self-awareness recorded
          </div>
        </div>
      </div>

      {/* Triggers & Contexts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Identified Triggers */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Common Triggers
          </h3>
          <p className="text-xs text-slate-500">Events or factors most frequently linked to stress or low mood scores:</p>
          <div className="space-y-2 pt-1">
            {insights?.frequentTriggers?.length > 0 ? (
              insights.frequentTriggers.map((trig: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{trig.name}</span>
                  <span className="text-slate-400">{trig.count} {trig.count === 1 ? 'time' : 'times'}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-4">No recurring stress triggers identified yet.</p>
            )}
          </div>
        </div>

        {/* Positive Enablers */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-emerald-500" /> Positive Enablers
          </h3>
          <p className="text-xs text-slate-500">Activities and routines that consistently lift your mood score:</p>
          <div className="space-y-2 pt-1">
            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1">
              <span className="font-bold text-emerald-900 dark:text-emerald-200">Outdoor Morning Movement</span>
              <p className="text-slate-600 dark:text-slate-400">Correlates with an average +1.5 boost to daily mood scores.</p>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60 text-xs space-y-1">
              <span className="font-bold text-emerald-900 dark:text-emerald-200">Clear Milestone Completion</span>
              <p className="text-slate-600 dark:text-slate-400">Finishing prioritized deliverables drastically reduces evening anxiety.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Wellness Disclaimer */}
      <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-500 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>{t.disclaimer}</span>
      </div>
    </div>
  );
};
