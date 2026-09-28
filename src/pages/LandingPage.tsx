import React from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { useAuth } from '../context/AuthContext.js';
import {
  Sparkles,
  Mic,
  Brain,
  TrendingUp,
  Lightbulb,
  HeartHandshake,
  ShieldCheck,
  ArrowRight,
  Lock,
  CheckCircle2,
  Calendar,
  Layers
} from 'lucide-react';

export const LandingPage: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const { t } = useLanguage();
  const { isAuthenticated, loginDemo } = useAuth();

  const handleStart = () => {
    if (isAuthenticated) {
      onNavigate('journal');
    } else {
      onNavigate('login');
    }
  };

  const handleDemoClick = async () => {
    try {
      await loginDemo();
      onNavigate('dashboard');
    } catch (err) {
      onNavigate('login');
    }
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI Mood Analysis',
      desc: 'Accurately identifies your mood, emotion, and sentiment from natural written or spoken thoughts.'
    },
    {
      icon: Mic,
      title: 'Voice Journaling',
      desc: 'Speak naturally with integrated speech-to-text supporting English, Tamil, Hindi, Malayalam, Telugu, and Kannada.'
    },
    {
      icon: Brain,
      title: 'Explainable AI',
      desc: 'Transparent reasoning explaining explicit mentions, AI inferences, keywords, and detected triggers.'
    },
    {
      icon: TrendingUp,
      title: 'Mood Tracking & Trends',
      desc: 'Intuitive 1-5 numerical trend lines and emotion donut charts mapping your emotional rhythms over weeks and months.'
    },
    {
      icon: Lightbulb,
      title: 'Personalized Suggestions',
      desc: 'Practical, non-medical wellness suggestions for workload balancing, sleep hygiene, and mindset.'
    },
    {
      icon: HeartHandshake,
      title: 'Human Supporter Option',
      desc: 'Connect with a mentor or team lead whenever you desire human empathy alongside AI perspective.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="absolute inset-0 pointer-events-none flex justify-center">
          <div className="w-[600px] h-[400px] bg-emerald-400/10 dark:bg-emerald-500/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800 mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI-Powered Wellness & Self-Reflection</span>
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-tight max-w-4xl mx-auto">
            Understand Your Emotions. <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              Build a Better Tomorrow.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Write or speak about your day. Let AI help you understand your emotions, discover patterns and receive personalized wellness suggestions.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              onClick={handleStart}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 hover:scale-105 active:scale-95 transition-all"
            >
              <span>Start Journaling</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleDemoClick}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 transition-all flex items-center justify-center gap-2"
            >
              <span>⚡ Explore Live Demo</span>
            </button>
          </div>

          {/* Privacy Message */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Your journal is private. You control what you share.</span>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Holistic Emotional Intelligence at Your Fingertips
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Designed for daily clarity, academic resilience, and mindful personal growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-750 hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-700 transition-all group"
                >
                  <div className="w-11 h-11 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
                    {feat.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Explainable AI Highlight Banner */}
      <section className="py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-8 sm:p-12 shadow-xl border border-emerald-800">
          <div className="max-w-2xl">
            <span className="text-emerald-400 font-bold uppercase tracking-wider text-xs">
              Transparent & Ethical AI
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold mt-2 leading-tight">
              AI That Tells You <em>Why</em>, Not Just What.
            </h2>
            <p className="mt-4 text-emerald-100/90 text-sm sm:text-base leading-relaxed">
              Every interpretation highlights explicit sentences you wrote, what the AI inferred, and your confidence score — keeping you in total control of your self-understanding.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Medical Claims</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>6 Languages Supported</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Private & Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Prominent Non-Medical Disclaimer Footer */}
      <footer className="py-8 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 px-4">
        <div className="max-w-3xl mx-auto space-y-2">
          <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Wellness & Self-Reflection Notice
          </p>
          <p className="leading-relaxed">
            {t.disclaimer}
          </p>
          <p className="pt-2 text-[11px] text-slate-400">
            © {new Date().getFullYear()} Mood Journal AI. Understand Your Emotions • Track Your Trends • Build a Healthier You.
          </p>
        </div>
      </footer>
    </div>
  );
};
