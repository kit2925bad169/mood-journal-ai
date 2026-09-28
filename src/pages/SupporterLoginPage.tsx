import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import {
  ArrowLeft,
  HeartHandshake,
  Lock,
  Mail,
  BadgeCheck,
  AlertCircle
} from 'lucide-react';
import { SupportedLanguage } from '../types.js';

const copy: Record<
  SupportedLanguage,
  {
    title: string;
    subtitle: string;
    idOrEmail: string;
    password: string;
    login: string;
    back: string;
    demoTitle: string;
    demoId: string;
    demoEmail: string;
    demoPassword: string;
    note: string;
    invalid: string;
  }
> = {
  en: {
    title: 'Human Supporter Login',
    subtitle:
      'Sign in directly to your private supporter dashboard',
    idOrEmail: 'Supporter ID or Email',
    password: 'Password',
    login: 'Sign in as Supporter',
    back: 'Back to user login',
    demoTitle: 'Runnable demo supporter',
    demoId: 'Supporter ID: HS001',
    demoEmail:
      'Email: supporter1@moodjournal.ai',
    demoPassword:
      'Password: Supporter123!',
    note:
      'Use the Supporter ID or email above. The demo supporter account is seeded automatically when the server starts.',
    invalid:
      'Invalid supporter credentials.'
  },

  ta: {
    title: 'மனித ஆதரவாளர் உள்நுழைவு',
    subtitle:
      'உங்கள் தனிப்பட்ட ஆதரவாளர் டாஷ்போர்டில் நேரடியாக உள்நுழைக',
    idOrEmail:
      'ஆதரவாளர் ID அல்லது மின்னஞ்சல்',
    password: 'கடவுச்சொல்',
    login: 'ஆதரவாளராக உள்நுழைக',
    back: 'பயனர் உள்நுழைவுக்கு திரும்பு',
    demoTitle:
      'இயங்கக்கூடிய டெமோ ஆதரவாளர்',
    demoId: 'ஆதரவாளர் ID: HS001',
    demoEmail:
      'மின்னஞ்சல்: supporter1@moodjournal.ai',
    demoPassword:
      'கடவுச்சொல்: Supporter123!',
    note:
      'மேலே உள்ள Supporter ID அல்லது மின்னஞ்சலை பயன்படுத்துங்கள்.',
    invalid:
      'ஆதரவாளர் உள்நுழைவு விவரங்கள் தவறாக உள்ளன.'
  },

  hi: {
    title: 'मानव सपोर्टर लॉगिन',
    subtitle:
      'अपने निजी सपोर्टर डैशबोर्ड में सीधे साइन इन करें',
    idOrEmail: 'सपोर्टर ID या ईमेल',
    password: 'पासवर्ड',
    login: 'सपोर्टर के रूप में साइन इन',
    back: 'यूज़र लॉगिन पर वापस जाएँ',
    demoTitle: 'चलने वाला डेमो सपोर्टर',
    demoId: 'सपोर्टर ID: HS001',
    demoEmail:
      'ईमेल: supporter1@moodjournal.ai',
    demoPassword:
      'पासवर्ड: Supporter123!',
    note:
      'ऊपर दिया गया Supporter ID या ईमेल इस्तेमाल करें।',
    invalid:
      'सपोर्टर क्रेडेंशियल गलत हैं।'
  },

  ml: {
    title: 'ഹ്യൂമൻ സപ്പോർട്ടർ ലോഗിൻ',
    subtitle:
      'നിങ്ങളുടെ സ്വകാര്യ സപ്പോർട്ടർ ഡാഷ്ബോർഡിലേക്ക് നേരിട്ട് പ്രവേശിക്കുക',
    idOrEmail:
      'സപ്പോർട്ടർ ID അല്ലെങ്കിൽ ഇമെയിൽ',
    password: 'പാസ്‌വേഡ്',
    login: 'സപ്പോർട്ടറായി സൈൻ ഇൻ ചെയ്യുക',
    back: 'യൂസർ ലോഗിനിലേക്ക് മടങ്ങുക',
    demoTitle:
      'പ്രവർത്തിക്കുന്ന ഡെമോ സപ്പോർട്ടർ',
    demoId: 'Supporter ID: HS001',
    demoEmail:
      'Email: supporter1@moodjournal.ai',
    demoPassword:
      'Password: Supporter123!',
    note:
      'മുകളിലുള്ള Supporter ID അല്ലെങ്കിൽ ഇമെയിൽ ഉപയോഗിക്കുക.',
    invalid:
      'സപ്പോർട്ടർ ലോഗിൻ വിവരങ്ങൾ തെറ്റാണ്.'
  },

  te: {
    title: 'హ్యూమన్ సపోర్టర్ లాగిన్',
    subtitle:
      'మీ వ్యక్తిగత సపోర్టర్ డాష్‌బోర్డ్‌లోకి నేరుగా సైన్ ఇన్ చేయండి',
    idOrEmail:
      'సపోర్టర్ ID లేదా ఇమెయిల్',
    password: 'పాస్‌వర్డ్',
    login: 'సపోర్టర్‌గా సైన్ ఇన్',
    back: 'యూజర్ లాగిన్‌కు తిరిగి వెళ్లండి',
    demoTitle:
      'పనిచేసే డెమో సపోర్టర్',
    demoId: 'సపోర్టర్ ID: HS001',
    demoEmail:
      'Email: supporter1@moodjournal.ai',
    demoPassword:
      'Password: Supporter123!',
    note:
      'పై Supporter ID లేదా ఇమెయిల్ ఉపయోగించండి.',
    invalid:
      'సపోర్టర్ వివరాలు తప్పుగా ఉన్నాయి.'
  },

  kn: {
    title: 'ಹ್ಯೂಮನ್ ಸಪೋರ್ಟರ್ ಲಾಗಿನ್',
    subtitle:
      'ನಿಮ್ಮ ಖಾಸಗಿ ಸಪೋರ್ಟರ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ನೇರವಾಗಿ ಸೈನ್ ಇನ್ ಮಾಡಿ',
    idOrEmail:
      'ಸಪೋರ್ಟರ್ ID ಅಥವಾ ಇಮೇಲ್',
    password: 'ಪಾಸ್‌ವರ್ಡ್',
    login: 'ಸಪೋರ್ಟರ್ ಆಗಿ ಸೈನ್ ಇನ್',
    back: 'ಬಳಕೆದಾರ ಲಾಗಿನ್‌ಗೆ ಹಿಂತಿರುಗಿ',
    demoTitle:
      'ಚಾಲನೆಯಲ್ಲಿರುವ ಡೆಮೋ ಸಪೋರ್ಟರ್',
    demoId: 'ಸಪೋರ್ಟರ್ ID: HS001',
    demoEmail:
      'Email: supporter1@moodjournal.ai',
    demoPassword:
      'Password: Supporter123!',
    note:
      'ಮೇಲಿನ Supporter ID ಅಥವಾ ಇಮೇಲ್ ಬಳಸಿ.',
    invalid:
      'ಸಪೋರ್ಟರ್ ವಿವರಗಳು ತಪ್ಪಾಗಿವೆ.'
  },

  ur: {
    title: 'ہیومن سپورٹر لاگ اِن',
    subtitle:
      'اپنے نجی سپورٹر ڈیش بورڈ میں براہ راست سائن اِن کریں',
    idOrEmail:
      'سپورٹر ID یا ای میل',
    password: 'پاس ورڈ',
    login: 'سپورٹر کے طور پر سائن اِن',
    back: 'صارف لاگ اِن پر واپس جائیں',
    demoTitle:
      'چلنے والا ڈیمو سپورٹر',
    demoId: 'سپورٹر ID: HS001',
    demoEmail:
      'ای میل: supporter1@moodjournal.ai',
    demoPassword:
      'پاس ورڈ: Supporter123!',
    note:
      'اوپر دیا گیا Supporter ID یا ای میل استعمال کریں۔',
    invalid:
      'سپورٹر کی معلومات درست نہیں ہیں۔'
  },

  tanglish: {
    title: 'Human Supporter Login',
    subtitle:
      'Unga private supporter dashboard-ku direct-a sign in pannunga',
    idOrEmail:
      'Supporter ID illa Email',
    password: 'Password',
    login: 'Supporter-a Sign in',
    back: 'User login-ku thirumbi ponga',
    demoTitle:
      'Working demo supporter',
    demoId: 'Supporter ID: HS001',
    demoEmail:
      'Email: supporter1@moodjournal.ai',
    demoPassword:
      'Password: Supporter123!',
    note:
      'Mela irukkura Supporter ID illa email use pannunga.',
    invalid:
      'Supporter credentials correct illa.'
  }
};

export const SupporterLoginPage: React.FC<{
  onNavigate: (page: string) => void;
}> = ({ onNavigate }) => {
  const { loginSupporter } = useAuth();
  const { language } = useLanguage();

  const c = copy[language] || copy.en;

  const [identifier, setIdentifier] =
    useState('');

  const [password, setPassword] =
    useState('');

  const [error, setError] =
    useState('');

  const [isLoading, setIsLoading] =
    useState(false);

  const submit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError('');

    if (
      !identifier.trim() ||
      !password
    ) {
      setError(c.invalid);
      return;
    }

    setIsLoading(true);

    try {
      await loginSupporter(
        identifier.trim(),
        password
      );

      // AuthContext/MainLayout will send the
      // authenticated supporter to supporter-dashboard.
      onNavigate('supporter-dashboard');
    } catch (err: any) {
      setError(
        err?.message || c.invalid
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8">

        <button
          type="button"
          onClick={() => onNavigate('login')}
          className="text-xs font-bold text-slate-500 flex items-center gap-2 mb-6 hover:text-emerald-600"
        >
          <ArrowLeft className="w-4 h-4" />

          {c.back}
        </button>

        <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4">
          <HeartHandshake className="w-7 h-7" />
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          {c.title}
        </h1>

        <p className="text-sm text-slate-500 mt-1 mb-6">
          {c.subtitle}
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />

            <span>{error}</span>
          </div>
        )}

        <form
          onSubmit={submit}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-bold block mb-1 text-slate-700 dark:text-slate-300">
              {c.idOrEmail}
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />

              <input
                value={identifier}
                onChange={(e) =>
                  setIdentifier(e.target.value)
                }
                required
                autoComplete="username"
                placeholder="HS001"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold block mb-1 text-slate-700 dark:text-slate-300">
              {c.password}
            </label>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />

              <input
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm disabled:opacity-50 transition-all"
          >
            {isLoading
              ? 'Signing in...'
              : c.login}
          </button>
        </form>

        {/* DEMO SUPPORTER */}
        <div className="mt-5 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 text-xs text-slate-600 dark:text-slate-300">

          <div className="font-black flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
            <BadgeCheck className="w-4 h-4" />

            {c.demoTitle}
          </div>

          <div className="mt-2 font-semibold">
            {c.demoId}
          </div>

          <div className="mt-1">
            {c.demoEmail}
          </div>

          <div className="mt-1">
            {c.demoPassword}
          </div>

          <p className="mt-2 text-[11px] leading-relaxed opacity-80">
            {c.note}
          </p>
        </div>
      </div>
    </div>
  );
};