import React, { useEffect, useState } from 'react';
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
  ArrowRight,
  ShieldCheck,
  Heart,
  Brain,
  BarChart3,
  Tags,
  Activity,
  ChevronRight,
  Sun,
  Zap,
} from 'lucide-react';

export const DashboardPage: React.FC<{
  onNavigate: (page: string) => void;
}> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [trends, setTrends] = useState<MoodTrendPoint[]>([]);
  const [emotions, setEmotions] = useState<EmotionCount[]>([]);
  const [totalEntries, setTotalEntries] = useState(0);
  const [insights, setInsights] = useState<any>(null);

  const [selectedRange, setSelectedRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('mood');
  const [isLoading, setIsLoading] = useState(true);

  // ---------------------------------------------------------
  // Greeting
  // ---------------------------------------------------------

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return t.dashboard.greetingMorning;
    if (hour < 17) return t.dashboard.greetingAfternoon;

    return t.dashboard.greetingEvening;
  };

  // ---------------------------------------------------------
  // Load dashboard data
  // ---------------------------------------------------------

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      const [trendRes, emotionRes, insightRes] = await Promise.all([
        api.getMoodTrends(selectedRange, selectedMetric),
        api.getEmotions(),
        api.getInsights(language),
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

  // ---------------------------------------------------------
  // Mood helpers
  // ---------------------------------------------------------

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
      case 'sad':
        return '😔';
      case 'excited':
        return '🤩';
      case 'anxious':
        return '😰';
      default:
        return '🌱';
    }
  };

  const getMoodGradient = (mood?: string) => {
    switch (mood?.toLowerCase()) {
      case 'happy':
        return 'from-yellow-400 via-orange-400 to-pink-500';

      case 'calm':
        return 'from-emerald-400 via-teal-400 to-cyan-500';

      case 'stressed':
        return 'from-orange-400 via-red-400 to-pink-500';

      case 'sad':
        return 'from-blue-400 via-indigo-400 to-purple-500';

      case 'excited':
        return 'from-pink-400 via-fuchsia-400 to-purple-500';

      case 'anxious':
        return 'from-violet-400 via-purple-400 to-indigo-500';

      default:
        return 'from-emerald-400 via-cyan-400 to-blue-500';
    }
  };

  return (
    <div className="relative min-h-full overflow-hidden bg-gradient-to-br from-pink-50 via-sky-50 to-emerald-50 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950">

      {/* =====================================================
          COLORFUL BACKGROUND
      ===================================================== */}

      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-pink-300/20 blur-3xl dark:bg-pink-500/10" />

      <div className="pointer-events-none absolute right-[-120px] top-20 h-96 w-96 rounded-full bg-purple-300/20 blur-3xl dark:bg-purple-500/10" />

      <div className="pointer-events-none absolute left-[35%] top-[45%] h-80 w-80 rounded-full bg-cyan-300/15 blur-3xl dark:bg-cyan-500/10" />

      <div className="pointer-events-none absolute bottom-[-100px] right-[20%] h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl dark:bg-emerald-500/10" />

      <div className="relative mx-auto max-w-7xl space-y-7 px-1 pb-14">

        {/* =====================================================
            HERO
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-r from-white/90 via-pink-50/80 to-sky-50/90 p-6 shadow-xl shadow-purple-900/5 backdrop-blur-xl dark:border-slate-800 dark:from-slate-900/95 dark:via-indigo-950/40 dark:to-slate-900/95 sm:p-8">

          {/* Decorative colorful circles */}

          <div className="absolute -right-10 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-pink-300/30 to-purple-300/20 blur-3xl" />

          <div className="absolute bottom-[-80px] left-[40%] h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">

            <div className="max-w-2xl">

              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-gradient-to-r from-pink-50 to-purple-50 px-3 py-1.5 text-[11px] font-black text-purple-700 shadow-sm dark:border-purple-800 dark:from-pink-950/30 dark:to-purple-950/30 dark:text-purple-300">
                <Sparkles className="h-3.5 w-3.5 text-pink-500" />
                Your personal AI wellness space
              </div>

              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white sm:text-4xl">

                {getGreeting()},{' '}

                <span className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent">
                  {user?.name?.split(' ')[0] || 'Friend'}
                </span>

                <span className="ml-2 inline-block animate-wave origin-bottom-right">
                  👋
                </span>

              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                {t.dashboard.reflectPrompt}
              </p>

              {/* Mini statistics */}

              <div className="mt-6 flex flex-wrap gap-3">

                <div className="flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-3 py-2 text-xs font-bold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                  <Activity className="h-4 w-4" />
                  {totalEntries} reflections
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-purple-100 bg-purple-50/80 px-3 py-2 text-xs font-bold text-purple-700 dark:border-purple-900 dark:bg-purple-950/30 dark:text-purple-300">
                  <Brain className="h-4 w-4" />
                  AI insights
                </div>

                <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-orange-50/80 px-3 py-2 text-xs font-bold text-orange-700 dark:border-orange-900 dark:bg-orange-950/30 dark:text-orange-300">
                  <Heart className="h-4 w-4" />
                  Personal wellness
                </div>

              </div>
            </div>

            {/* Quick actions */}

            <div className="flex flex-wrap gap-2.5 lg:max-w-md lg:justify-end">

              <button
                onClick={() => onNavigate('journal')}
                className="group flex items-center gap-2 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-purple-500/20 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/30 active:scale-95"
              >
                <span className="rounded-lg bg-white/15 p-1">
                  <PenLine className="h-4 w-4" />
                </span>

                {t.dashboard.writeNewJournal}

                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => onNavigate('chat')}
                className="flex items-center gap-2 rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-xs font-black text-cyan-700 shadow-sm transition-all hover:-translate-y-1 hover:bg-cyan-100 dark:border-cyan-900 dark:bg-cyan-950/30 dark:text-cyan-300 dark:hover:bg-cyan-950/50"
              >
                <MessageSquare className="h-4 w-4" />
                {t.dashboard.chatAI}
              </button>

              <button
                onClick={() => onNavigate('history')}
                className="flex items-center gap-2 rounded-2xl border border-transparent px-4 py-3 text-xs font-bold text-slate-600 transition-all hover:bg-white/80 dark:text-slate-400 dark:hover:bg-slate-800"
              >
                <History className="h-4 w-4" />
                {t.dashboard.viewHistory}
              </button>

            </div>
          </div>
        </section>

        {/* =====================================================
            MOOD + AI INSIGHT
        ===================================================== */}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ===================================================
              CURRENT MOOD
          =================================================== */}

          <div className="group relative overflow-hidden rounded-[2rem] border border-white/90 bg-white/90 p-6 shadow-xl shadow-pink-900/5 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl dark:border-slate-800 dark:bg-slate-900/90">

            <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-pink-300/30 to-orange-300/20 blur-3xl" />

            <div className="relative">

              <div className="flex items-start justify-between">

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18em] text-pink-500">
                    {t.dashboard.currentMood}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Latest emotional check-in
                  </p>
                </div>

                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-100 via-orange-100 to-yellow-100 text-3xl shadow-inner dark:from-pink-950/40 dark:via-orange-950/30 dark:to-yellow-950/30">
                  {getMoodEmoji(currentMood?.mood)}
                </div>

              </div>

              {currentMood ? (
                <div className="mt-7">

                  <div className="flex items-end gap-2">

                    <h2 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                      {currentMood.mood}
                    </h2>

                    <span className="mb-1 rounded-full bg-gradient-to-r from-pink-100 to-purple-100 px-2.5 py-1 text-xs font-black text-purple-600 dark:from-pink-950/40 dark:to-purple-950/40 dark:text-purple-300">
                      {currentMood.emotion}
                    </span>

                  </div>

                  {/* Mood score */}

                  <div className="mt-6">

                    <div className="mb-2 flex items-center justify-between">

                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Mood score
                      </span>

                      <span className="text-sm font-black text-purple-600 dark:text-purple-400">
                        {currentMood.score}/5
                      </span>

                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-gradient-to-r from-pink-100 via-purple-100 to-blue-100 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800">

                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${getMoodGradient(
                          currentMood?.mood
                        )} shadow-sm transition-all duration-700`}
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, Number(currentMood.score || 0) * 20)
                          )}%`,
                        }}
                      />

                    </div>

                  </div>

                  {/* Summary */}

                  <div className="mt-6 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4 dark:border-purple-900/50 dark:from-purple-950/20 dark:via-pink-950/20 dark:to-orange-950/20">

                    <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                      <Sparkles className="h-3.5 w-3.5" />
                      Reflection summary
                    </div>

                    <p className="text-xs leading-5 text-slate-700 dark:text-slate-300">
                      {currentMood.summary}
                    </p>

                  </div>

                </div>
              ) : (
                <div className="mt-8 rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 p-7 text-center dark:from-pink-950/20 dark:to-purple-950/20">

                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm dark:bg-slate-800">
                    🌱
                  </div>

                  <p className="text-xs font-semibold text-slate-500">
                    No reflections recorded yet.
                  </p>

                  <button
                    onClick={() => onNavigate('journal')}
                    className="mt-3 text-xs font-black text-purple-600 hover:underline dark:text-purple-400"
                  >
                    Write your first journal →
                  </button>

                </div>
              )}

              <div className="mt-5 flex items-center gap-2 border-t border-slate-100 pt-4 text-[10px] leading-4 text-slate-400 dark:border-slate-800">
                <Info className="h-3.5 w-3.5 shrink-0" />
                {t.dashboard.moodScoreExpl}
              </div>

            </div>
          </div>

          {/* ===================================================
              AI INSIGHT
          =================================================== */}

          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-6 text-white shadow-2xl shadow-purple-600/20 lg:col-span-2 sm:p-7">

            {/* Glow */}

            <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-pink-300/20 blur-3xl" />

            <div className="absolute bottom-[-80px] left-1/3 h-64 w-64 rounded-full bg-cyan-300/15 blur-3xl" />

            <div className="absolute right-[30%] top-[40%] h-32 w-32 rounded-full bg-yellow-300/10 blur-2xl" />

            <div className="relative flex h-full flex-col">

              <div className="flex items-start justify-between gap-4">

                <div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white backdrop-blur-sm">
                    <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                    {t.dashboard.latestInsight}
                  </div>

                  <h2 className="mt-5 max-w-2xl text-xl font-black leading-snug sm:text-2xl">
                    {insights?.latestInsight ||
                      'Write your daily reflection to generate personalized insights into your emotional patterns.'}
                  </h2>

                </div>

                <button
                  onClick={() => onNavigate('insights')}
                  className="hidden shrink-0 items-center gap-1 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-[10px] font-black text-white backdrop-blur-sm transition hover:bg-white/20 sm:flex"
                >
                  {t.dashboard.viewInsights}
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>

              </div>

              {/* Insight cards */}

              <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2">

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/15">

                  <div className="mb-3 flex items-center gap-2 text-xs font-black text-yellow-200">

                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-yellow-300/15">
                      🌱
                    </span>

                    Positive Pattern

                  </div>

                  <p className="text-[11px] leading-5 text-white/80">
                    {insights?.positivePattern ||
                      'Your positive moments and daily activities will appear here as your journal history grows.'}
                  </p>

                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/15">

                  <div className="mb-3 flex items-center gap-2 text-xs font-black text-orange-200">

                    <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-orange-300/15">
                      💡
                    </span>

                    Stress Pattern

                  </div>

                  <p className="text-[11px] leading-5 text-white/80">
                    {insights?.stressPattern ||
                      'As you continue journaling, AI can identify recurring situations connected with stress.'}
                  </p>

                </div>

              </div>

              <div className="mt-auto flex items-center gap-2 border-t border-white/15 pt-5 text-[10px] text-white/70">

                <ShieldCheck className="h-3.5 w-3.5 shrink-0" />

                <span>
                  AI insights are grounded in your journal text. Always
                  non-medical.
                </span>

              </div>

            </div>
          </div>

        </section>

        {/* =====================================================
            MOOD TREND
        ===================================================== */}

        <section className="overflow-hidden rounded-[2rem] border border-white/80 bg-white/90 p-3 shadow-xl shadow-blue-900/5 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 sm:p-4">

          <div className="mb-2 flex items-center gap-3 px-2 pt-2">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-blue-500/20">
              <TrendingUp className="h-4 w-4" />
            </div>

            <div>

              <p className="text-sm font-black text-slate-900 dark:text-white">
                Your emotional journey
              </p>

              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Track how your mood changes over time
              </p>

            </div>

          </div>

          <MoodTrendChart
            data={trends}
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
            selectedMetric={selectedMetric}
            onMetricChange={setSelectedMetric}
            isLoading={isLoading}
          />

        </section>

        {/* =====================================================
            EMOTIONS + CONTEXTS
        ===================================================== */}

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">

          {/* Emotion breakdown */}

          <div className="overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-white via-pink-50/50 to-purple-50/50 p-5 shadow-xl shadow-pink-900/5 backdrop-blur-xl dark:border-slate-800 dark:from-slate-900 dark:via-pink-950/10 dark:to-purple-950/10 sm:p-6">

            <div className="mb-4 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-400 to-purple-500 text-white shadow-lg shadow-purple-500/20">
                <BarChart3 className="h-4 w-4" />
              </div>

              <div>

                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  Emotion breakdown
                </h3>

                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Patterns across your reflections
                </p>

              </div>

            </div>

            <EmotionDonutChart
              data={emotions}
              totalEntries={totalEntries}
            />

          </div>

          {/* Contexts */}

          <div className="flex flex-col overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-br from-white via-sky-50/50 to-cyan-50/50 p-6 shadow-xl shadow-cyan-900/5 backdrop-blur-xl dark:border-slate-800 dark:from-slate-900 dark:via-sky-950/10 dark:to-cyan-950/10">

            <div className="flex items-start justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/20">
                  <Tags className="h-4 w-4" />
                </div>

                <div>

                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    {t.dashboard.frequentContexts}
                  </h3>

                  <p className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">
                    Themes found in your reflections
                  </p>

                </div>

              </div>

              <div className="rounded-xl bg-cyan-50 px-3 py-1.5 text-[10px] font-black text-cyan-600 dark:bg-cyan-950/30 dark:text-cyan-300">
                {totalEntries} analyzed
              </div>

            </div>

            {insights?.frequentContexts &&
            insights.frequentContexts.length > 0 ? (
              <div className="mt-7 space-y-5">

                {insights.frequentContexts.map(
                  (ctx: any, idx: number) => (
                    <div key={idx}>

                      <div className="mb-2 flex items-center justify-between">

                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                          {ctx.name}
                        </span>

                        <span className="rounded-full bg-gradient-to-r from-cyan-50 to-blue-50 px-2 py-0.5 text-[10px] font-black text-blue-600 dark:from-cyan-950/40 dark:to-blue-950/40 dark:text-blue-300">
                          {ctx.percentage}%
                        </span>

                      </div>

                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 shadow-sm transition-all duration-700"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(0, Number(ctx.percentage) || 0)
                            )}%`,
                          }}
                        />

                      </div>

                    </div>
                  )
                )}

              </div>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center py-14 text-center">

                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-purple-100 text-2xl shadow-sm dark:from-cyan-950/30 dark:to-purple-950/30">
                  🧩
                </div>

                <p className="max-w-xs text-xs leading-5 text-slate-400">
                  No contexts identified yet. Continue writing reflections
                  to build meaningful insights.
                </p>

              </div>
            )}

            <div className="mt-7 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">

              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Total entries analyzed
              </span>

              <div className="flex items-center gap-2">

                <span className="flex h-7 min-w-7 items-center justify-center rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-2 text-xs font-black text-white shadow-sm">
                  {totalEntries}
                </span>

                <span className="text-[10px] text-slate-400">
                  reflections
                </span>

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            COLORFUL WELLNESS STRIP
        ===================================================== */}

        <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-gradient-to-r from-pink-100 via-purple-100 via-50% to-cyan-100 p-5 shadow-xl shadow-purple-900/5 dark:border-slate-800 dark:from-pink-950/30 dark:via-purple-950/30 dark:to-cyan-950/30 sm:p-6">

          <div className="absolute -right-12 -top-20 h-48 w-48 rounded-full bg-pink-300/30 blur-3xl" />

          <div className="absolute -bottom-20 left-[30%] h-48 w-48 rounded-full bg-cyan-300/20 blur-3xl" />

          <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-start gap-4">

              <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-2xl bg-white/80 text-2xl shadow-md dark:bg-slate-800/80">
                🌈
              </div>

              <div>

                <div className="flex items-center gap-2">

                  <h3 className="text-sm font-black text-slate-800 dark:text-white">
                    Your wellbeing is a journey.
                  </h3>

                  <Sun className="h-4 w-4 text-orange-500" />

                </div>

                <p className="mt-1 max-w-xl text-[11px] leading-5 text-slate-600 dark:text-slate-400">
                  Small reflections can reveal meaningful patterns. Keep
                  checking in with yourself and let your journal grow with
                  you.
                </p>

              </div>

            </div>

            <button
              onClick={() => onNavigate('journal')}
              className="group flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 px-5 py-3 text-xs font-black text-white shadow-lg shadow-purple-500/20 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-500/30"
            >
              <Zap className="h-3.5 w-3.5" />
              Reflect now
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
            </button>

          </div>

        </section>

      </div>
    </div>
  );
};