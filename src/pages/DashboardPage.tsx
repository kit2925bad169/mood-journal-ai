import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import { MoodTrendPoint, EmotionCount } from '../types.js';
import { MoodTrendChart } from '../components/MoodTrendChart.js';
import { EmotionDonutChart } from '../components/EmotionDonutChart.js';
import {
  PenLine,
  MessageSquare,
  History,
  TrendingUp,
  Sparkles,
  Info,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const DashboardPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [trends, setTrends] = useState<MoodTrendPoint[]>([]);
  const [emotions, setEmotions] = useState<EmotionCount[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [insights, setInsights] = useState<any>(null);
  const [selectedRange, setSelectedRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('mood');
  const [isLoading, setIsLoading] = useState(true);

  // Determine greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t.dashboard.greetingMorning;
    if (hour < 17) return t.dashboard.greetingAfternoon;
    return t.dashboard.greetingEvening;
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const [trendRes, emotionRes, insightRes] = await Promise.all([
        api.getMoodTrends(selectedRange, selectedMetric),
        api.getEmotions(),
        api.getInsights(language)
      ]);

      setTrends(trendRes.trends);
      setEmotions(emotionRes.emotions);
      setTotalEntries(emotionRes.totalEntries);
      setInsights(insightRes);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedRange, selectedMetric, language]);

  const currentMood = insights?.currentMood;

  const getMoodEmoji = (mood?: string) => {
    switch (mood?.toLowerCase()) {
      case 'happy':
        return '😊';
      case 'calm':
        return '😌';
      case 'stressed':
        return '😟';
      case 'neutral':
        return '😐';
      case 'reflective':
        return '🤔';
      default:
        return '🌱';
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Welcome & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{getGreeting()}, {user?.name?.split(' ')[0] || 'Friend'}</span>
            <span className="inline-block animate-wave origin-bottom-right">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.dashboard.reflectPrompt}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => onNavigate('journal')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm hover:scale-105 active:scale-95 transition-all"
          >
            <PenLine className="w-4 h-4" />
            <span>{t.dashboard.writeNewJournal}</span>
          </button>

          <button
            onClick={() => onNavigate('chat')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <MessageSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>{t.dashboard.chatAI}</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-all"
          >
            <History className="w-4 h-4" />
            <span>{t.dashboard.viewHistory}</span>
          </button>
        </div>
      </div>

      {/* Row 1: Current Mood Summary Card + Latest AI Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Current Mood Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {t.dashboard.currentMood}
              </span>
              <span className="text-2xl">{getMoodEmoji(currentMood?.mood)}</span>
            </div>

            {currentMood ? (
              <div className="space-y-3">
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white">
                    {currentMood.mood}
                  </h3>
                  <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    ({currentMood.emotion})
                  </span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800/80">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.dashboard.moodScore}: {currentMood.score} / 5</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-2 border-emerald-500 pl-2.5 my-2">
                  "{currentMood.summary}"
                </p>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                No reflections recorded yet. Write your first journal entry!
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
            <Info className="w-3.5 h-3.5 shrink-0" />
            <span>{t.dashboard.moodScoreExpl}</span>
          </div>
        </div>

        {/* Latest AI Insight Banner */}
        <div className="lg:col-span-2 bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-7 shadow-sm border border-emerald-800 flex flex-col justify-between relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-300" />
                {t.dashboard.latestInsight}
              </span>
              <button
                onClick={() => onNavigate('insights')}
                className="text-xs font-bold text-emerald-200 hover:text-white flex items-center gap-1 hover:underline"
              >
                <span>{t.dashboard.viewInsights}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-lg sm:text-xl font-bold text-white leading-snug">
              {insights?.latestInsight || 'Write your daily reflection to generate personalized insights into your emotional patterns.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
                <span className="font-semibold text-emerald-300 block mb-0.5">🌱 Positive Pattern:</span>
                <span className="text-emerald-50 text-[11px] leading-relaxed">
                  {insights?.positivePattern || 'Sustained focus & morning movement elevate your daily mood score.'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-xs">
                <span className="font-semibold text-emerald-300 block mb-0.5">⚠️ Stress Pattern:</span>
                <span className="text-emerald-50 text-[11px] leading-relaxed">
                  {insights?.stressPattern || 'Late evening deadlines and workload correlate with low scores.'}
                </span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 mt-2 border-t border-emerald-800/80 text-[11px] text-emerald-200/80 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            <span>AI insights are grounded in your journal text. Always non-medical.</span>
          </div>
        </div>
      </div>

      {/* Row 2: Mood Trend Line Chart */}
      <MoodTrendChart
        data={trends}
        selectedRange={selectedRange}
        onRangeChange={setSelectedRange}
        selectedMetric={selectedMetric}
        onMetricChange={setSelectedMetric}
        isLoading={isLoading}
      />

      {/* Row 3: Emotion Donut Chart & Frequent Contexts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmotionDonutChart data={emotions} totalEntries={totalEntries} />

        {/* Frequent Contexts Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600">🏷️</span>
                  {t.dashboard.frequentContexts}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Themes most commonly identified in your reflections
                </p>
              </div>
            </div>

            {insights?.frequentContexts && insights.frequentContexts.length > 0 ? (
              <div className="space-y-3.5 pt-2">
                {insights.frequentContexts.map((ctx: any, idx: number) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{ctx.name}</span>
                      <span className="text-slate-500 dark:text-slate-400 font-bold">{ctx.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-500"
                        style={{ width: `${ctx.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                No contexts identified yet. Continue writing reflections to build context insights.
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Total Entries Analyzed</span>
            <span className="font-bold text-slate-900 dark:text-white">{totalEntries}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
