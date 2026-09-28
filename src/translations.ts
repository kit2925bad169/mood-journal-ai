import { SupportedLanguage } from './types.js';

export interface TranslationDict {
  appName: string;
  tagline: string;
  disclaimer: string;
  nav: {
    home: string;
    newJournal: string;
    chatWithAI: string;
    history: string;
    insights: string;
    goals: string;
    support: string;
    settings: string;
    logout: string;
  };
  auth: {
    welcomeBack: string;
    loginSubtitle: string;
    login: string;
    createNewAccount: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    name: string;
    emailOrMobile: string;
    email: string;
    mobile: string;
    password: string;
    confirmPassword: string;
    forgotPassword: string;
    registerSubtitle: string;
    demoLogin: string;
  };
  dashboard: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    reflectPrompt: string;
    currentMood: string;
    currentEmotion: string;
    moodScore: string;
    moodScoreExpl: string;
    moodTrend: string;
    emotionBreakdown: string;
    frequentContexts: string;
    latestInsight: string;
    writeNewJournal: string;
    chatAI: string;
    viewHistory: string;
    viewInsights: string;
    notEnoughData: string;
    continueJournaling: string;
    noEmotionData: string;
  };
  journal: {
    title: string;
    subtitle: string;
    textMode: string;
    voiceMode: string;
    writePlaceholder: string;
    characterCount: string;
    analyzeJournal: string;
    analyzing: string;
    clear: string;
    startSpeaking: string;
    stopSpeaking: string;
    listening: string;
    listenToResponse: string;
    listenAudio: string;
    stopAudio: string;
    whyAiIdentified: string;
    confidence: string;
    confidenceNote: string;
    whatYouSaid: string;
    whatAiInferred: string;
    personalizedSuggestions: string;
    saveJournal: string;
    savedSuccess: string;
    talkToHuman: string;
    continueWithAI: string;
  };
  chatbot: {
    title: string;
    subtitle: string;
    inputPlaceholder: string;
    send: string;
    voice: string;
    listening: string;
    typing: string;
    clearChat: string;
  };
  filters: {
    days7: string;
    days30: string;
    months3: string;
    months6: string;
    year1: string;
    mood: string;
    emotion: string;
    sentiment: string;
  };
  common: {
    language: string;
    darkMode: string;
    lightMode: string;
    loading: string;
    save: string;
    cancel: string;
    delete: string;
    confirm: string;
  };
}

const baseTranslations: Record<string, TranslationDict> = {
  en: {
    appName: 'Mood Journal AI',
    tagline: 'Understand Your Emotions • Track Your Trends • Build a Healthier You',
    disclaimer: 'AI insights are for self-reflection and general wellness only. They are not a medical diagnosis or a replacement for professional support.',
    nav: {
      home: 'Home',
      newJournal: 'New Journal',
      chatWithAI: 'Chat with AI',
      history: 'History',
      insights: 'Insights',
      goals: 'Goals',
      support: 'Human Support',
      settings: 'Settings',
      logout: 'Logout',
    },
    auth: {
      welcomeBack: 'Welcome Back',
      loginSubtitle: 'Continue your journey of understanding your emotions.',
      login: 'Login',
      createNewAccount: 'Create New Account',
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: 'Already have an account?',
      name: 'Full Name',
      emailOrMobile: 'Email / Mobile Number',
      email: 'Email Address',
      mobile: 'Mobile Number',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      forgotPassword: 'Forgot Password?',
      registerSubtitle: 'Start understanding your emotions, one journal at a time.',
      demoLogin: '⚡ One-Click Demo Account',
    },
    dashboard: {
      greetingMorning: 'Good morning',
      greetingAfternoon: 'Good afternoon',
      greetingEvening: 'Good evening',
      reflectPrompt: "Take a moment to reflect on today's journey...",
      currentMood: 'Current Mood',
      currentEmotion: 'Current Emotion',
      moodScore: 'Mood Score',
      moodScoreExpl: 'Mood score is an AI-generated reflection based on the language in your journal entry.',
      moodTrend: 'Mood Trend',
      emotionBreakdown: 'Emotion Breakdown',
      frequentContexts: 'Frequent Contexts',
      latestInsight: 'Latest AI Insight',
      writeNewJournal: 'Write New Journal',
      chatAI: 'Chat with AI',
      viewHistory: 'View History',
      viewInsights: 'View Insights',
      notEnoughData: 'Not enough journal entries yet.',
      continueJournaling: 'Continue journaling to build your mood trend.',
      noEmotionData: 'No emotion data yet. Write your first entry to see the breakdown.',
    },
    journal: {
      title: 'Daily Reflection & Journal',
      subtitle: 'Express your thoughts freely via writing or voice.',
      textMode: 'Text Mode',
      voiceMode: 'Voice Mode',
      writePlaceholder: 'Write your thoughts here... How was your day? What challenges or wins did you experience?',
      characterCount: 'characters',
      analyzeJournal: 'Analyze Journal',
      analyzing: 'AI is analyzing your reflections...',
      clear: 'Clear',
      startSpeaking: 'Start Speaking',
      stopSpeaking: 'Stop Recording',
      listening: 'Listening... speak naturally',
      listenToResponse: '🔊 Listen to AI Response',
      listenAudio: 'Listen',
      stopAudio: 'Stop Audio',
      whyAiIdentified: 'Why did the AI identify this?',
      confidence: 'Confidence',
      confidenceNote: 'AI confidence indicates how strongly the journal text supports this interpretation. It is not a medical certainty.',
      whatYouSaid: 'What you explicitly mentioned:',
      whatAiInferred: 'What the AI inferred:',
      personalizedSuggestions: 'Personalized Wellness Suggestions',
      saveJournal: 'Save Journal',
      savedSuccess: 'Journal saved to your reflection history!',
      talkToHuman: 'Talk to Supporter',
      continueWithAI: 'Continue with AI',
    },
    chatbot: {
      title: 'Mood Journal AI Assistant',
      subtitle: 'Your personal reflection assistant',
      inputPlaceholder: "Tell me how you're feeling today...",
      send: 'Send',
      voice: 'Voice',
      listening: 'Listening to your voice...',
      typing: 'AI assistant is reflecting...',
      clearChat: 'Clear Chat',
    },
    filters: {
      days7: '7 Days',
      days30: '30 Days',
      months3: '3 Months',
      months6: '6 Months',
      year1: '1 Year',
      mood: 'Mood',
      emotion: 'Emotion',
      sentiment: 'Sentiment',
    },
    common: {
      language: 'Language',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      loading: 'Loading...',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      confirm: 'Confirm',
    },
  },
  ta: {
    appName: 'Mood Journal AI',
    tagline: 'உங்கள் உணர்வுகளைப் புரிந்து கொள்ளுங்கள் • மாற்றங்களைக் கண்காணிக்கவும் • ஆரோக்கியமாக வாழுங்கள்',
    disclaimer: 'AI நுண்ணறிவுகள் சுய-பிரதிபலிப்பு மற்றும் பொதுவான நல்வாழ்வுக்கானவை மட்டுமே. அவை மருத்துவ நோயறிதல் அல்ல.',
    nav: {
      home: 'முகப்பு',
      newJournal: 'புதிய குறிப்பு',
      chatWithAI: 'AI உடன் உரையாடுங்கள்',
      history: 'வரலாறு',
      insights: 'நுண்ணறிவுகள்',
      goals: 'இலக்குகள்',
      support: 'மனித ஆதரவு',
      settings: 'அமைப்புகள்',
      logout: 'வெளியேறு',
    },
    auth: {
      welcomeBack: 'மீண்டும் வருக',
      loginSubtitle: 'உங்கள் உணர்வுகளைப் புரிந்துகொள்ளும் பயணத்தைத் தொடருங்கள்.',
      login: 'உள்நுழைக',
      createNewAccount: 'Create New Account',
      dontHaveAccount: 'கணக்கு இல்லையா?',
      alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
      name: 'முழு பெயர்',
      emailOrMobile: 'மின்னஞ்சல் / மொபைல் எண்',
      email: 'மின்னஞ்சல் முகவரி',
      mobile: 'மொபைல் எண்',
      password: 'கடவுச்சொல்',
      confirmPassword: 'கடவுச்சொல்லை உறுதிப்படுத்தவும்',
      forgotPassword: 'கடவுச்சொல் மறந்துவிட்டதா?',
      registerSubtitle: 'ஒவ்வொரு குறிப்பின் மூலமும் உங்கள் உணர்வுகளைப் புரிந்து கொள்ளத் தொடங்குங்கள்.',
      demoLogin: '⚡ ஒரே கிளிக்கில் மாதிரி கணக்கு',
    },
    dashboard: {
      greetingMorning: 'காலை வணக்கம்',
      greetingAfternoon: 'மதிய வணக்கம்',
      greetingEvening: 'மாலை வணக்கம்',
      reflectPrompt: 'இன்றைய பயணத்தைப் பற்றி சிறிது நேரம் சிந்தியுங்கள்...',
      currentMood: 'தற்போதைய மனநிலை',
      currentEmotion: 'தற்போதைய உணர்ச்சி',
      moodScore: 'மனநிலை மதிப்பீடு',
      moodScoreExpl: 'மனநிலை மதிப்பீடு என்பது உங்கள் குறிப்பின் வார்த்தைகளை அடிப்படையாகக் கொண்ட AI பிரதிபலிப்பாகும்.',
      moodTrend: 'மனநிலை போக்கு',
      emotionBreakdown: 'உணர்ச்சிப் பகிர்வு',
      frequentContexts: 'அடிக்கடி வரும் சூழல்கள்',
      latestInsight: 'சமீபத்திய AI நுண்ணறிவு',
      writeNewJournal: 'புதிய குறிப்பு எழுதுங்கள்',
      chatAI: 'AI உடன் உரையாடுங்கள்',
      viewHistory: 'வரலாற்றைக் காண்க',
      viewInsights: 'நுண்ணறிவுகளைக் காண்க',
      notEnoughData: 'போதுமான குறிப்புகள் இன்னும் இல்லை.',
      continueJournaling: 'மனநிலை போக்கை உருவாக்க தொடர்ந்து குறிப்புகளை எழுதுங்கள்.',
      noEmotionData: 'இன்னும் உணர்ச்சித் தரவு இல்லை. விவரங்களைப் பார்க்க முதல் குறிப்பை எழுதவும்.',
    },
    journal: {
      title: 'தினசரி பிரதிபலிப்பு & குறிப்பு',
      subtitle: 'எழுத்து அல்லது குரல் மூலம் உங்கள் எண்ணங்களை சுதந்திரமாக வெளிப்படுத்துங்கள்.',
      textMode: 'உரை முறை',
      voiceMode: 'குரல் முறை',
      writePlaceholder: 'உங்கள் எண்ணங்களை இங்கே எழுதுங்கள்... உங்கள் நாள் எப்படி இருந்தது? நீங்கள் சந்தித்த சவால்கள் என்ன?',
      characterCount: 'எழுத்துக்கள்',
      analyzeJournal: 'குறிப்பை பகுப்பாய்வு செய்க',
      analyzing: 'AI உங்கள் குறிப்பைப் பகுப்பாய்வு செய்கிறது...',
      clear: 'அழி',
      startSpeaking: 'பேசத் தொடங்குங்கள்',
      stopSpeaking: 'பதிவை நிறுத்துங்கள்',
      listening: 'கேட்கிறது... இயல்பாகப் பேசுங்கள்',
      listenToResponse: '🔊 AI பதிலைக் கேளுங்கள்',
      listenAudio: 'கேளுங்கள்',
      stopAudio: 'நிறுத்துங்கள்',
      whyAiIdentified: 'AI இதை ஏன் அடையாளம் கண்டது?',
      confidence: 'நம்பகத்தன்மை',
      confidenceNote: 'AI நம்பிக்கையளவு குறிப்பின் மொழியை அடிப்படையாகக் கொண்டது, இது மருத்துவ உறுதிப்பாடு அல்ல.',
      whatYouSaid: 'நீங்கள் வெளிப்படையாகக் கூறியவை:',
      whatAiInferred: 'AI கணித்தவை:',
      personalizedSuggestions: 'தனிப்பயனாக்கப்பட்ட நல்வாழ்வு பரிந்துரைகள்',
      saveJournal: 'குறிப்பைச் சேமிக்கவும்',
      savedSuccess: 'குறிப்பு வெற்றிகரமாகச் சேமிக்கப்பட்டது!',
      talkToHuman: 'ஆதரவாளரிடம் பேசுங்கள்',
      continueWithAI: 'AI உடன் தொடருங்கள்',
    },
    chatbot: {
      title: 'Mood Journal AI உதவியாளர்',
      subtitle: 'உங்கள் தனிப்பட்ட பிரதிபலிப்பு உதவியாளர்',
      inputPlaceholder: 'இன்று நீங்கள் எப்படி உணர்கிறீர்கள் என்பதை என்னிடம் கூறுங்கள்...',
      send: 'அனுப்பு',
      voice: 'குரல்',
      listening: 'உங்கள் குரலைக் கேட்கிறது...',
      typing: 'AI உதவியாளர் சிந்திக்கிறார்...',
      clearChat: 'உரையாடலை அழி',
    },
    filters: {
      days7: '7 நாட்கள்',
      days30: '30 நாட்கள்',
      months3: '3 மாதங்கள்',
      months6: '6 மாதங்கள்',
      year1: '1 ஆண்டு',
      mood: 'மனநிலை',
      emotion: 'உணர்ச்சி',
      sentiment: 'எண்ணம்',
    },
    common: {
      language: 'மொழி',
      darkMode: 'இருண்ட பயன்முறை',
      lightMode: 'வெளிச்ச பயன்முறை',
      loading: 'ஏற்றுகிறது...',
      save: 'சேமி',
      cancel: 'ரத்து',
      delete: 'நீக்கு',
      confirm: 'உறுதி செய்',
    },
  },
  hi: {
    appName: 'Mood Journal AI',
    tagline: 'अपनी भावनाओं को समझें • रुझानों को ट्रैक करें • स्वस्थ जीवन बनाएं',
    disclaimer: 'AI अंतर्दृष्टि केवल आत्म-चिंतन और सामान्य तंदुरुस्ती के लिए है। यह कोई चिकित्सीय निदान नहीं है।',
    nav: {
      home: 'होम',
      newJournal: 'नई डायरी',
      chatWithAI: 'AI से बात करें',
      history: 'इतिहास',
      insights: 'अंतर्दृष्टि',
      goals: 'लक्ष्य',
      support: 'मानवीय सहायता',
      settings: 'सेटिंग्स',
      logout: 'लॉग आउट',
    },
    auth: {
      welcomeBack: 'वापसी पर स्वागत है',
      loginSubtitle: 'अपनी भावनाओं को समझने की अपनी यात्रा जारी रखें।',
      login: 'लॉग इन करें',
      createNewAccount: 'Create New Account',
      dontHaveAccount: 'खाता नहीं है?',
      alreadyHaveAccount: 'पहले से खाता है?',
      name: 'पूरा नाम',
      emailOrMobile: 'ईमेल / मोबाइल नंबर',
      email: 'ईमेल पता',
      mobile: 'मोबाइल नंबर',
      password: 'पासवर्ड',
      confirmPassword: 'पासवर्ड की पुष्टि करें',
      forgotPassword: 'पासवर्ड भूल गए?',
      registerSubtitle: 'डायरी के माध्यम से अपनी भावनाओं को समझना शुरू करें।',
      demoLogin: '⚡ डेमो खाते से लॉगिन करें',
    },
    dashboard: {
      greetingMorning: 'शुभ प्रभात',
      greetingAfternoon: 'शुभ दोपहर',
      greetingEvening: 'शुभ संध्या',
      reflectPrompt: 'आज के दिन पर विचार करने के लिए कुछ समय निकालें...',
      currentMood: 'वर्तमान मनोदशा',
      currentEmotion: 'वर्तमान भावना',
      moodScore: 'मूड स्कोर',
      moodScoreExpl: 'मूड स्कोर आपकी डायरी की भाषा पर आधारित एक AI-जनरेटेड प्रतिबिंब है।',
      moodTrend: 'मूड का रुझान',
      emotionBreakdown: 'भावनाओं का विभाजन',
      frequentContexts: 'बार-बार आने वाले संदर्भ',
      latestInsight: 'नवीनतम AI अंतर्दृष्टि',
      writeNewJournal: 'नई डायरी लिखें',
      chatAI: 'AI से बात करें',
      viewHistory: 'इतिहास देखें',
      viewInsights: 'अंतर्दृष्टि देखें',
      notEnoughData: 'अभी पर्याप्त डायरी प्रविष्टियाँ नहीं हैं।',
      continueJournaling: 'मूड रुझान देखने के लिए डायरी लिखना जारी रखें।',
      noEmotionData: 'अभी कोई भावना डेटा नहीं है।',
    },
    journal: {
      title: 'दैनिक चिंतन एवं डायरी',
      subtitle: 'लिखकर या बोलकर अपने विचार व्यक्त करें।',
      textMode: 'टेक्स्ट मोड',
      voiceMode: 'वॉइस मोड',
      writePlaceholder: 'यहाँ अपने विचार लिखें... आपका दिन कैसा रहा? क्या चुनौतियाँ या उपलब्धियाँ रहीं?',
      characterCount: 'वर्ण',
      analyzeJournal: 'डायरी का विश्लेषण करें',
      analyzing: 'AI आपकी प्रविष्टि का विश्लेषण कर रहा है...',
      clear: 'साफ़ करें',
      startSpeaking: 'बोलना शुरू करें',
      stopSpeaking: 'रिकॉर्डिंग रोकें',
      listening: 'सुन रहा है... स्वाभाविक रूप से बोलें',
      listenToResponse: '🔊 AI प्रतिक्रिया सुनें',
      listenAudio: 'सुनें',
      stopAudio: 'रोकें',
      whyAiIdentified: 'AI ने इसे क्यों पहचाना?',
      confidence: 'सटीकता',
      confidenceNote: 'AI विश्वास स्तर इस बात को दर्शाता है कि पाठ इस व्याख्या का कितना समर्थन करता है।',
      whatYouSaid: 'आपने स्पष्ट रूप से जो कहा:',
      whatAiInferred: 'AI ने जो अनुमान लगाया:',
      personalizedSuggestions: 'व्यक्तिगत सुझाव',
      saveJournal: 'डायरी सहेजें',
      savedSuccess: 'डायरी सफलतापूर्वक सहेजी गई!',
      talkToHuman: 'सहायक से बात करें',
      continueWithAI: 'AI के साथ जारी रखें',
    },
    chatbot: {
      title: 'Mood Journal AI सहायक',
      subtitle: 'आपका व्यक्तिगत चिंतन सहायक',
      inputPlaceholder: 'मुझे बताएं कि आप आज कैसा महसूस कर रहे हैं...',
      send: 'भेजें',
      voice: 'आवाज़',
      listening: 'आपकी आवाज़ सुन रहा है...',
      typing: 'AI विचार कर रहा है...',
      clearChat: 'चैट साफ़ करें',
    },
    filters: {
      days7: '7 दिन',
      days30: '30 दिन',
      months3: '3 महीने',
      months6: '6 महीने',
      year1: '1 वर्ष',
      mood: 'मूड',
      emotion: 'भावना',
      sentiment: 'विचार',
    },
    common: {
      language: 'भाषा',
      darkMode: 'डार्क मोड',
      lightMode: 'लाइट मोड',
      loading: 'लोड हो रहा है...',
      save: 'सहेजें',
      cancel: 'रद्द करें',
      delete: 'हटाएं',
      confirm: 'पुष्टि करें',
    },
  },
  ml: {
    appName: 'Mood Journal AI',
    tagline: 'വികാരങ്ങൾ മനസ്സിലാക്കുക • ട്രെൻഡുകൾ നിരീക്ഷിക്കുക • കൂടുതൽ ആരോഗ്യവാനാകൂ',
    disclaimer: 'AI ഉൾക്കാഴ്ചകൾ സ്വയം പ്രതിഫലനത്തിനും പൊതുവായ ക്ഷേമത്തിനും മാത്രമുള്ളതാണ്. ഇത് വൈദ്യശാസ്ത്രപരമായ രോഗനിർണയമല്ല.',
    nav: {
      home: 'ഹോം',
      newJournal: 'പുതിയ കുറിപ്പ്',
      chatWithAI: 'AI-യുമായി സംസാരിക്കുക',
      history: 'ചരിത്രം',
      insights: 'ഉൾക്കാഴ്ചകൾ',
      goals: 'ലക്ഷ്യങ്ങൾ',
      support: 'മാനവ സഹായം',
      settings: 'ക്രമീകരണങ്ങൾ',
      logout: 'ലോഗ്ഔട്ട്',
    },
    auth: {
      welcomeBack: 'സ്വാഗതം',
      loginSubtitle: 'നിങ്ങളുടെ വികാരങ്ങൾ മനസ്സിലാക്കാനുള്ള യാത്ര തുടരുക.',
      login: 'ലോഗിൻ ചെയ്യുക',
      createNewAccount: 'Create New Account',
      dontHaveAccount: 'അക്കൗണ്ട് ഇല്ലേ?',
      alreadyHaveAccount: 'ഇതിനകം അക്കൗണ്ട് ഉണ്ടോ?',
      name: 'പൂർണ്ണമായ പേര്',
      emailOrMobile: 'ഇമെയിൽ / മൊബൈൽ നമ്പർ',
      email: 'ഇമെയിൽ',
      mobile: 'മൊബൈൽ നമ്പർ',
      password: 'പാസ്‌വേഡ്',
      confirmPassword: 'പാസ്‌വേഡ് സ്ഥിരീകരിക്കുക',
      forgotPassword: 'പാസ്‌വേഡ് മറന്നോ?',
      registerSubtitle: 'നിങ്ങളുടെ മാനസികാവസ്ഥ മനസ്സിലാക്കാൻ ആരംഭിക്കുക.',
      demoLogin: '⚡ ഡെമോ അക്കൗണ്ട് ലോഗിൻ',
    },
    dashboard: {
      greetingMorning: 'സുപ്രഭാതം',
      greetingAfternoon: 'ശുഭദിനം',
      greetingEvening: 'ശുഭസായാഹ്നം',
      reflectPrompt: 'ഇന്നത്തെ ദിവസത്തെക്കുറിച്ച് അല്പം ചിന്തിക്കൂ...',
      currentMood: 'നിലവിലെ മാനസികാവസ്ഥ',
      currentEmotion: 'നിലവിലെ വികാരം',
      moodScore: 'മൂഡ് സ്കോർ',
      moodScoreExpl: 'നിങ്ങളുടെ കുറിപ്പിലെ ഭാഷയെ അടിസ്ഥാനമാക്കിയുള്ള ഒരു AI പ്രതിഫലനമാണ് മൂഡ് സ്കോർ.',
      moodTrend: 'മൂഡ് ട്രെൻഡ്',
      emotionBreakdown: 'വികാര വിഭജനം',
      frequentContexts: 'പതിവ് സാഹചര്യങ്ങൾ',
      latestInsight: 'ഏറ്റവും പുതിയ AI ഉൾക്കാഴ്ച',
      writeNewJournal: 'പുതിയ കുറിപ്പ് എഴുതുക',
      chatAI: 'AI-യുമായി സംസാരിക്കുക',
      viewHistory: 'ചരിത്രം കാണുക',
      viewInsights: 'ഉൾക്കാഴ്ചകൾ കാണുക',
      notEnoughData: 'മതിയായ കുറിപ്പുകൾ ഇതുവരെ ഇല്ല.',
      continueJournaling: 'നിങ്ങളുടെ മൂഡ് ട്രെൻഡ് രൂപീകരിക്കാൻ കുറിപ്പുകൾ എഴുതുന്നത് തുടരുക.',
      noEmotionData: 'വികാര ഡാറ്റ ലഭ്യമല്ല.',
    },
    journal: {
      title: 'പ്രതിഫലനവും കുറിപ്പും',
      subtitle: 'എഴുത്തോ ശബ്ദമോ ഉപയോഗിച്ച് നിങ്ങളുടെ ചിന്തകൾ പങ്കിടൂ.',
      textMode: 'ടെക്സ്റ്റ് മോഡ്',
      voiceMode: 'വോയ്സ് മോഡ്',
      writePlaceholder: 'നിങ്ങളുടെ ചിന്തകൾ ഇവിടെ എഴുതുക...',
      characterCount: 'അക്ഷരങ്ങൾ',
      analyzeJournal: 'വിശകലനം ചെയ്യുക',
      analyzing: 'AI വിശകലനം ചെയ്യുന്നു...',
      clear: 'മായ്ക്കുക',
      startSpeaking: 'സംസാരിച്ചു തുടങ്ങുക',
      stopSpeaking: 'റെക്കോർഡിംഗ് നിർത്തുക',
      listening: 'കേൾക്കുന്നു...',
      listenToResponse: '🔊 AI മറുപടി കേൾക്കുക',
      listenAudio: 'കേൾക്കൂ',
      stopAudio: 'നിർത്തൂ',
      whyAiIdentified: 'AI ഇത് എന്ത് കൊണ്ട് കണ്ടെത്തി?',
      confidence: 'കൃത്യത',
      confidenceNote: 'AI സൂചിക ഒരു സാദ്ധ്യതാ നിരീക്ഷണമാണ്, വൈദ്യശാസ്ത്രപരമായ ഉറപ്പല്ല.',
      whatYouSaid: 'നിങ്ങൾ വ്യക്തമായി പറഞ്ഞത്:',
      whatAiInferred: 'AI അനുമാനിച്ചത്:',
      personalizedSuggestions: 'വ്യക്തിഗത നിർദ്ദേശങ്ങൾ',
      saveJournal: 'കുറിപ്പ് സൂക്ഷിക്കുക',
      savedSuccess: 'കുറിപ്പ് വിജയകരമായി സൂക്ഷിച്ചു!',
      talkToHuman: 'സഹായകനുമായി സംസാരിക്കുക',
      continueWithAI: 'AI-യുമായി തുടരുക',
    },
    chatbot: {
      title: 'Mood Journal AI അസിസ്റ്റന്റ്',
      subtitle: 'നിങ്ങളുടെ സ്വകാര്യ ചിന്താ സഹായി',
      inputPlaceholder: 'ഇന്ന് നിങ്ങൾക്ക് എന്താണ് തോന്നുന്നത് എന്ന് പറയൂ...',
      send: 'അയക്കുക',
      voice: 'വോയ്സ്',
      listening: 'ശ്രദ്ധിക്കുന്നു...',
      typing: 'AI മറുപടി നൽകുന്നു...',
      clearChat: 'ചാറ്റ് ഒഴിവാക്കുക',
    },
    filters: {
      days7: '7 ദിവസങ്ങൾ',
      days30: '30 ദിവസങ്ങൾ',
      months3: '3 മാസങ്ങൾ',
      months6: '6 മാസങ്ങൾ',
      year1: '1 വർഷം',
      mood: 'മാനസികാവസ്ഥ',
      emotion: 'വികാരം',
      sentiment: 'ഭാവം',
    },
    common: {
      language: 'ഭാഷ',
      darkMode: 'ഡാർക്ക് മോഡ്',
      lightMode: 'ലൈറ്റ് മോഡ്',
      loading: 'ലോഡ് ചെയ്യുന്നു...',
      save: 'സേവ് ചെയ്യുക',
      cancel: 'റദ്ദാക്കുക',
      delete: 'ഡിലീറ്റ്',
      confirm: 'സ്ഥിരീകരിക്കുക',
    },
  },
  te: {
    appName: 'Mood Journal AI',
    tagline: 'మీ భావోద్వేగాలను అర్థం చేసుకోండి • ట్రెండ్‌లను ట్రాక్ చేయండి • ఆరోగ్యంగా ఉండండి',
    disclaimer: 'AI అంతర్దృష్టులు కేవలం స్వీయ ప్రతిబింబం మరియు సాధారణ ఆరోగ్యం కోసం మాత్రమే. ఇవి వైద్య నిర్ధారణ కావు.',
    nav: {
      home: 'హోమ్',
      newJournal: 'కొత్త జర్నల్',
      chatWithAI: 'AI తో చాట్ చేయండి',
      history: 'చరిత్ర',
      insights: 'అంతర్దృష్టులు',
      goals: 'లక్ష్యాలు',
      support: 'మానవ సహాయం',
      settings: 'సెట్టింగ్‌లు',
      logout: 'లాగౌట్',
    },
    auth: {
      welcomeBack: 'పునఃస్వాగతం',
      loginSubtitle: 'మీ భావోద్వేగాలను అర్థం చేసుకునే ప్రయాణాన్ని కొనసాగించండి.',
      login: 'లాగిన్',
      createNewAccount: 'Create New Account',
      dontHaveAccount: 'ఖాతా లేదా?',
      alreadyHaveAccount: 'ఇప్పటికే ఖాతా ఉందా?',
      name: 'పూర్తి పేరు',
      emailOrMobile: 'ఈమెయిల్ / మొబైల్ నంబర్',
      email: 'ఈమెయిల్',
      mobile: 'మొబైల్ నంబర్',
      password: 'పాస్‌వర్డ్',
      confirmPassword: 'పాస్‌వర్డ్ నిర్ధారించండి',
      forgotPassword: 'పాస్‌వర్డ్ మర్చిపోయారా?',
      registerSubtitle: 'మీ భావాలను అర్థం చేసుకోవడం ప్రారంభించండి.',
      demoLogin: '⚡ డెమో ఖాతాతో ప్రవేశించండి',
    },
    dashboard: {
      greetingMorning: 'శుభోదయం',
      greetingAfternoon: 'శుభ మధ్యాహ్నం',
      greetingEvening: 'శుభ సాయంత్రం',
      reflectPrompt: 'నేటి మీ రోజు గురించి కాసేపు ఆలోచించండి...',
      currentMood: 'ప్రస్తుత మానసిక స్థితి',
      currentEmotion: 'ప్రస్తుత భావోద్వేగం',
      moodScore: 'మూడ్ స్కోర్',
      moodScoreExpl: 'మూడ్ స్కోర్ అనేది మీ జర్నల్ భాష ఆధారంగా రూపొందించిన AI విశ్లేషణ.',
      moodTrend: 'మూడ్ ట్రెండ్',
      emotionBreakdown: 'భావోద్వేగ విభజన',
      frequentContexts: 'తరచుగా వచ్చే సందర్భాలు',
      latestInsight: 'తాజా AI అంతర్దృష్టి',
      writeNewJournal: 'కొత్త జర్నల్ రాయండి',
      chatAI: 'AI తో చాట్ చేయండి',
      viewHistory: 'చరిత్రను చూడండి',
      viewInsights: 'అంతర్దృష్టులను చూడండి',
      notEnoughData: 'ఇంకా తగినన్ని జర్నల్ ఎంట్రీలు లేవు.',
      continueJournaling: 'ట్రెండ్‌ను రూపొందించడానికి జర్నల్ రాయడం కొనసాగించండి.',
      noEmotionData: 'భావోద్వేగ డేటా లేదు.',
    },
    journal: {
      title: 'దైనందిన జర్నల్ & ప్రతిబింబం',
      subtitle: 'వ్రాత లేదా వాయిస్ ద్వారా మీ ఆలోచనలను స్వేచ్ఛగా వ్యక్తీకరించండి.',
      textMode: 'టెక్స్ట్ మోడ్',
      voiceMode: 'వాయిస్ మోడ్',
      writePlaceholder: 'మీ ఆలోచనలను ఇక్కడ రాయండి...',
      characterCount: 'అక్షరాలు',
      analyzeJournal: 'జర్నల్‌ను విశ్లేషించండి',
      analyzing: 'AI విశ్లేషిస్తోంది...',
      clear: 'క్లియర్ చేయండి',
      startSpeaking: 'మాట్లాడటం ప్రారంభించండి',
      stopSpeaking: 'రికార్డింగ్ ఆపండి',
      listening: 'వింటోంది... మాట్లాడండి',
      listenToResponse: '🔊 AI ప్రతిస్పందన వినండి',
      listenAudio: 'వినండి',
      stopAudio: 'ఆపండి',
      whyAiIdentified: 'AI దీన్ని ఎందుకు గుర్తించింది?',
      confidence: 'ఖచ్చితత్వం',
      confidenceNote: 'AI నమ్మకం జర్నల్ వాక్యాలపై ఆధారపడి ఉంటుంది, ఇది వైద్య నిర్ధారణ కాదు.',
      whatYouSaid: 'మీరు స్పష్టంగా చెప్పినవి:',
      whatAiInferred: 'AI ఊహించినవి:',
      personalizedSuggestions: 'వ్యక్తిగత సూచనలు',
      saveJournal: 'జర్నల్‌ను సేవ్ చేయండి',
      savedSuccess: 'జర్నల్ విజయవంతంగా సేవ్ చేయబడింది!',
      talkToHuman: 'సహాయకుడితో మాట్లాడండి',
      continueWithAI: 'AI తో కొనసాగించండి',
    },
    chatbot: {
      title: 'Mood Journal AI సహాయకుడు',
      subtitle: 'మీ వ్యక్తిగత ప్రతిబింబ సహాయకుడు',
      inputPlaceholder: 'ఈ రోజు మీరు ఎలా భావిస్తున్నారో చెప్పండి...',
      send: 'పంపండి',
      voice: 'వాయిస్',
      listening: 'మీ వాయిస్ వింటోంది...',
      typing: 'AI ఆలోచిస్తోంది...',
      clearChat: 'చాట్‌ను క్లియర్ చేయండి',
    },
    filters: {
      days7: '7 రోజులు',
      days30: '30 రోజులు',
      months3: '3 నెలలు',
      months6: '6 నెలలు',
      year1: '1 సంవత్సరం',
      mood: 'మూడ్',
      emotion: 'భావోద్వేగం',
      sentiment: 'అభిప్రాయం',
    },
    common: {
      language: 'భాష',
      darkMode: 'డార్క్ మోడ్',
      lightMode: 'లైట్ మోడ్',
      loading: 'లోడ్ అవుతోంది...',
      save: 'సేవ్',
      cancel: 'రద్దు చేయండి',
      delete: 'తొలగించండి',
      confirm: 'నిర్ధారించండి',
    },
  },
  kn: {
    appName: 'Mood Journal AI',
    tagline: 'ನಿಮ್ಮ ಭಾವನೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಿ • ಟ್ರೆಂಡ್‌ಗಳನ್ನು ಗಮನಿಸಿ • ಆರೋಗ್ಯವಾಗಿರಿ',
    disclaimer: 'AI ಒಳನೋಟಗಳು ಕೇವಲ ಸ್ವಯಂ-ಪ್ರತಿಬಿಂಬ ಮತ್ತು ಸಾಮಾನ್ಯ ಯೋಗಕ್ಷೇಮಕ್ಕಾಗಿ ಮಾತ್ರ. ಇದು ವೈದ್ಯಕೀಯ ರೋಗನಿರ್ಣಯವಲ್ಲ.',
    nav: {
      home: 'ಮುಖಪುಟ',
      newJournal: 'ಹೊಸ ದಿನಚರಿ',
      chatWithAI: 'AI ಜೊತೆ ಚಾಟ್ ಮಾಡಿ',
      history: 'ಇತಿಹಾಸ',
      insights: 'ಒಳನೋಟಗಳು',
      goals: 'ಗುರಿಗಳು',
      support: 'ಮಾನವ ಬೆಂಬಲ',
      settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
      logout: 'ಲಾಗ್‌ಔಟ್',
    },
    auth: {
      welcomeBack: 'ಮರಳಿ ಸ್ವಾಗತ',
      loginSubtitle: 'ನಿಮ್ಮ ಭಾವನೆಗಳನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳುವ ಪಯಣವನ್ನು ಮುಂದುವರಿಸಿ.',
      login: 'ಲಾಗಿನ್',
      createNewAccount: 'Create New Account',
      dontHaveAccount: 'ಖಾತೆ ಇಲ್ಲವೇ?',
      alreadyHaveAccount: 'ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?',
      name: 'ಪೂರ್ಣ ಹೆಸರು',
      emailOrMobile: 'ಇಮೇಲ್ / ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
      email: 'ಇಮೇಲ್',
      mobile: 'ಮೊಬೈಲ್ ಸಂಖ್ಯೆ',
      password: 'ಪಾಸ್‌ವರ್ಡ್',
      confirmPassword: 'ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ',
      forgotPassword: 'ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?',
      registerSubtitle: 'ನಿಮ್ಮ ಭಾವನೆಗಳನ್ನು ದಿನಚರಿಯ ಮೂಲಕ ಅರಿಯಲು ಪ್ರಾರಂಭಿಸಿ.',
      demoLogin: '⚡ ಡೆಮೊ ಖಾತೆಯಿಂದ ಪ್ರವೇಶಿಸಿ',
    },
    dashboard: {
      greetingMorning: 'ಶುಭೋದಯ',
      greetingAfternoon: 'ಶುಭ ಮಧ್ಯಾಹ್ನ',
      greetingEvening: 'ಶುಭ ಸಂಜೆ',
      reflectPrompt: 'ಇಂದಿನ ದಿನದ ಬಗ್ಗೆ ಸ್ವಲ್ಪ ಸಮಯ ಚಿಂತಿಸಿ...',
      currentMood: 'ಪ್ರಸ್ತುತ ಮನಸ್ಥಿತಿ',
      currentEmotion: 'ಪ್ರಸ್ತುತ ಭಾವನೆ',
      moodScore: 'ಮೂಡ್ ಸ್ಕೋರ್',
      moodScoreExpl: 'ಮೂಡ್ ಸ್ಕೋರ್ ನಿಮ್ಮ ದಿನಚರಿಯ ಭಾಷೆಯನ್ನು ಆಧರಿಸಿದ AI ಪ್ರತಿಬಿಂಬವಾಗಿದೆ.',
      moodTrend: 'ಮೂಡ್ ಟ್ರೆಂಡ್',
      emotionBreakdown: 'ಭಾವನೆಗಳ ವಿಶ್ಲೇಷಣೆ',
      frequentContexts: 'ಸಾಮಾನ್ಯ ಸಂದರ್ಭಗಳು',
      latestInsight: 'ಇತ್ತೀಚಿನ AI ಒಳನೋಟ',
      writeNewJournal: 'ಹೊಸ ದಿನಚರಿ ಬರೆಯಿರಿ',
      chatAI: 'AI ಜೊತೆ ಚಾಟ್ ಮಾಡಿ',
      viewHistory: 'ಇತಿಹಾಸ ನೋಡಿ',
      viewInsights: 'ಒಳನೋಟಗಳನ್ನು ನೋಡಿ',
      notEnoughData: 'ಇನ್ನೂ ಸಾಕಷ್ಟು ದಿನಚರಿ ನಮೂದುಗಳಿಲ್ಲ.',
      continueJournaling: 'ಮೂಡ್ ಟ್ರೆಂಡ್ ವೀಕ್ಷಿಸಲು ದಿನಚರಿ ಬರೆಯುವುದನ್ನು ಮುಂದುವರಿಸಿ.',
      noEmotionData: 'ಯಾವುದೇ ಭಾವನಾ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ.',
    },
    journal: {
      title: 'ದೈನಂದಿನ ದಿನಚರಿ & ಚಿಂತನೆ',
      subtitle: 'ಬರವಣಿಗೆ ಅಥವಾ ಧ್ವನಿಯ ಮೂಲಕ ನಿಮ್ಮ ಅನಿಸಿಕೆಗಳನ್ನು ಹಂಚಿಕೊಳ್ಳಿ.',
      textMode: 'ಪಠ್ಯ ಮೋಡ್',
      voiceMode: 'ಧ್ವನಿ ಮೋಡ್',
      writePlaceholder: 'ನಿಮ್ಮ ಆಲೋಚನೆಗಳನ್ನು ಇಲ್ಲಿ ಬರೆಯಿರಿ...',
      characterCount: 'ಅಕ್ಷರಗಳು',
      analyzeJournal: 'ದಿನಚರಿ ವಿಶ್ಲೇಷಿಸಿ',
      analyzing: 'AI ವಿಶ್ಲೇಷಿಸುತ್ತಿದೆ...',
      clear: 'ತೆರವುಗೊಳಿಸಿ',
      startSpeaking: 'ಮಾತನಾಡಲು ಪ್ರಾರಂಭಿಸಿ',
      stopSpeaking: 'ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ',
      listening: 'ಆಲಿಸುತ್ತಿದೆ... ಮಾತನಾಡಿ',
      listenToResponse: '🔊 AI ಪ್ರತಿಕ್ರಿಯೆ ಕೇಳಿ',
      listenAudio: 'ಕೇಳಿ',
      stopAudio: 'ನಿಲ್ಲಿಸಿ',
      whyAiIdentified: 'AI ಇದನ್ನು ಏಕೆ ಗುರುತಿಸಿತು?',
      confidence: 'ನಿಖರತೆ',
      confidenceNote: 'AI ವಿಶ್ವಾಸಾರ್ಹತೆಯು ಪಠ್ಯದ ಮೇಲಿನ ಅವಲೋಕನವಾಗಿದೆ, ಇದು ವೈದ್ಯಕೀಯ ಖಚಿತತೆಯಲ್ಲ.',
      whatYouSaid: 'ನೀವು ಸ್ಪಷ್ಟವಾಗಿ ಹೇಳಿದ್ದು:',
      whatAiInferred: 'AI ಊಹಿಸಿದ್ದು:',
      personalizedSuggestions: 'ವೈಯಕ್ತಿಕಗೊಳಿಸಿದ ಸಲಹೆಗಳು',
      saveJournal: 'ದಿನಚರಿ ಉಳಿಸಿ',
      savedSuccess: 'ದಿನಚರಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!',
      talkToHuman: 'ಸಹಾಯಕರೊಂದಿಗೆ ಮಾತನಾಡಿ',
      continueWithAI: 'AI ಜೊತೆ ಮುಂದುವರಿಯಿರಿ',
    },
    chatbot: {
      title: 'Mood Journal AI ಸಹಾಯಕ',
      subtitle: 'ನಿಮ್ಮ ವೈಯಕ್ತಿಕ ಚಿಂತನಾ ಸಹಾಯಕ',
      inputPlaceholder: 'ಇಂದು ನೀವು ಹೇಗೆ ಅನುಭವಿಸುತ್ತಿದ್ದೀರಿ ಎಂದು ತಿಳಿಸಿ...',
      send: 'ಕಳುಹಿಸಿ',
      voice: 'ಧ್ವನಿ',
      listening: 'ನಿಮ್ಮ ಧ್ವನಿಯನ್ನು ಆಲಿಸುತ್ತಿದೆ...',
      typing: 'AI ಯೋಚಿಸುತ್ತಿದೆ...',
      clearChat: 'ಚಾಟ್ ತೆರವುಗೊಳಿಸಿ',
    },
    filters: {
      days7: '7 ದಿನಗಳು',
      days30: '30 ದಿನಗಳು',
      months3: '3 ತಿಂಗಳು',
      months6: '6 ತಿಂಗಳು',
      year1: '1 ವರ್ಷ',
      mood: 'ಮೂಡ್',
      emotion: 'ಭಾವನೆ',
      sentiment: 'ಮನೋಭಾವ',
    },
    common: {
      language: 'ಭಾಷೆ',
      darkMode: 'ಡಾರ್ಕ್ ಮೋಡ್',
      lightMode: 'ಲೈಟ್ ಮೋಡ್',
      loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
      save: 'ಉಳಿಸಿ',
      cancel: 'ರದ್ದುಮಾಡಿ',
      delete: 'ಅಳಿಸಿ',
      confirm: 'ದೃಢೀಕರಿಸಿ',
    },
  },
};

const makeLanguageVariant = (base: TranslationDict, overrides: any): TranslationDict => ({
  ...base,
  ...overrides,
  nav: { ...base.nav, ...(overrides.nav || {}) },
  auth: { ...base.auth, ...(overrides.auth || {}) },
  dashboard: { ...base.dashboard, ...(overrides.dashboard || {}) },
  journal: { ...base.journal, ...(overrides.journal || {}) },
  chatbot: { ...base.chatbot, ...(overrides.chatbot || {}) },
  filters: { ...base.filters, ...(overrides.filters || {}) },
  common: { ...base.common, ...(overrides.common || {}) },
});

export const translations: Record<SupportedLanguage, TranslationDict> = {
  ...(baseTranslations as Record<SupportedLanguage, TranslationDict>),
  tanglish: makeLanguageVariant(baseTranslations.en, {
    tagline: 'Unga feelings-a purinjukonga • Mood trends-a track pannunga • Nalla feel pannunga',
    nav: { home: 'Home', newJournal: 'Pudhu Journal', chatWithAI: 'AI kooda Chat', history: 'Journal History', insights: 'Insights', goals: 'Goals', support: 'Human Support', settings: 'Settings', logout: 'Logout' },
    auth: { welcomeBack: 'Welcome back', loginSubtitle: 'Unga feelings-a purinjukka continue pannunga.', login: 'Login', createNewAccount: 'Create Account', dontHaveAccount: 'Account illaya?', alreadyHaveAccount: 'Already account irukka?', name: 'Full Name', emailOrMobile: 'Email / Mobile', email: 'Email', mobile: 'Mobile', password: 'Password', confirmPassword: 'Confirm Password', forgotPassword: 'Password maranthutingala?', registerSubtitle: 'Journal moolama unga feelings-a purinjukka start pannunga.', demoLogin: 'Demo Login' },
    dashboard: { greetingMorning: 'Good morning', greetingAfternoon: 'Good afternoon', greetingEvening: 'Good evening', reflectPrompt: 'Innaiku unga day pathi konjam reflect pannunga...', currentMood: 'Current Mood', currentEmotion: 'Current Emotion', moodScore: 'Mood Score', moodScoreExpl: 'Unga journal words base panni AI create pannina reflection.', moodTrend: 'Mood Trend', emotionBreakdown: 'Emotion Breakdown', frequentContexts: 'Frequent Contexts', latestInsight: 'Latest AI Insight', writeNewJournal: 'Pudhu Journal ezhuthunga', chatAI: 'AI kooda Chat', viewHistory: 'History paarunga', viewInsights: 'Insights paarunga', notEnoughData: 'Innum enough journal entries illa.', continueJournaling: 'Mood trend build panna journal continue pannunga.', noEmotionData: 'Innum emotion data illa.' },
    journal: { title: 'Daily Journal & Reflection', subtitle: 'Text illa voice use panni unga thoughts-a freely share pannunga.', textMode: 'Text Mode', voiceMode: 'Voice Mode', writePlaceholder: 'Unga thoughts-a inga type pannunga... Innaiku day epdi irundhuchu?', characterCount: 'characters', analyzeJournal: 'Journal Analyze', analyzing: 'AI unga journal-a analyze pannuthu...', clear: 'Clear', startSpeaking: 'Pesunga', stopSpeaking: 'Recording Stop', listening: 'Kekuthu... natural-a pesunga', listenToResponse: '🔊 AI response kekka', listenAudio: 'Listen', stopAudio: 'Stop', whyAiIdentified: 'AI idha yen identify pannuchu?', confidence: 'Confidence', confidenceNote: 'AI confidence text support-a mattum indicate pannum; medical certainty illa.', whatYouSaid: 'Neenga sonnadhu:', whatAiInferred: 'AI infer pannadhu:', personalizedSuggestions: 'Personalized Suggestions', saveJournal: 'Journal Save', savedSuccess: 'Journal history-la save aayiduchu!', talkToHuman: 'Supporter kooda Pesunga', continueWithAI: 'AI kooda Continue' },
    chatbot: { title: 'Mood Journal AI Assistant', subtitle: 'Unga personal reflection assistant', inputPlaceholder: 'Innaiku epdi feel panreenga nu sollunga...', send: 'Send', voice: 'Voice', listening: 'Unga voice kekuthu...', typing: 'AI reflect pannuthu...', clearChat: 'Chat Clear' },
    common: { language: 'Language', darkMode: 'Dark Mode', lightMode: 'Light Mode', loading: 'Loading...', save: 'Save', cancel: 'Cancel', delete: 'Delete', confirm: 'Confirm' }
  }),
  ur: makeLanguageVariant(baseTranslations.en, {
    tagline: 'اپنے جذبات کو سمجھیں • رجحانات دیکھیں • بہتر محسوس کریں',
    nav: { home: 'ہوم', newJournal: 'نئی ڈائری', chatWithAI: 'AI سے بات کریں', history: 'تاریخ', insights: 'تجزیات', goals: 'اہداف', support: 'انسانی مدد', settings: 'ترتیبات', logout: 'لاگ آؤٹ' },
    auth: { welcomeBack: 'خوش آمدید', loginSubtitle: 'اپنے جذبات کو سمجھنے کا سفر جاری رکھیں۔', login: 'لاگ اِن', createNewAccount: 'نیا اکاؤنٹ بنائیں', dontHaveAccount: 'اکاؤنٹ نہیں ہے؟', alreadyHaveAccount: 'پہلے سے اکاؤنٹ ہے؟', name: 'پورا نام', emailOrMobile: 'ای میل / موبائل', email: 'ای میل', mobile: 'موبائل', password: 'پاس ورڈ', confirmPassword: 'پاس ورڈ کی تصدیق', forgotPassword: 'پاس ورڈ بھول گئے؟', registerSubtitle: 'اپنی ڈائری کے ذریعے جذبات کو سمجھنا شروع کریں۔', demoLogin: 'ڈیمو اکاؤنٹ سے لاگ اِن' },
    dashboard: { greetingMorning: 'صبح بخیر', greetingAfternoon: 'دوپہر بخیر', greetingEvening: 'شام بخیر', reflectPrompt: 'آج کے دن پر کچھ دیر غور کریں...', currentMood: 'موجودہ موڈ', currentEmotion: 'موجودہ جذبہ', moodScore: 'موڈ اسکور', moodScoreExpl: 'آپ کی ڈائری کے متن پر مبنی AI عکاسی۔', moodTrend: 'موڈ کا رجحان', emotionBreakdown: 'جذبات کی تقسیم', frequentContexts: 'عام حالات', latestInsight: 'تازہ AI بصیرت', writeNewJournal: 'نئی ڈائری لکھیں', chatAI: 'AI سے بات کریں', viewHistory: 'تاریخ دیکھیں', viewInsights: 'بصیرت دیکھیں', notEnoughData: 'ابھی کافی ڈائری اندراجات نہیں ہیں۔', continueJournaling: 'موڈ کا رجحان بنانے کے لیے ڈائری لکھتے رہیں۔', noEmotionData: 'ابھی جذبات کا ڈیٹا نہیں ہے۔' },
    journal: { title: 'روزانہ ڈائری اور عکاسی', subtitle: 'تحریر یا آواز کے ذریعے اپنے خیالات بیان کریں۔', textMode: 'تحریری موڈ', voiceMode: 'آواز کا موڈ', writePlaceholder: 'اپنے خیالات یہاں لکھیں...', characterCount: 'حروف', analyzeJournal: 'ڈائری کا تجزیہ کریں', analyzing: 'AI آپ کی ڈائری کا تجزیہ کر رہا ہے...', clear: 'صاف کریں', startSpeaking: 'بولنا شروع کریں', stopSpeaking: 'ریکارڈنگ روکیں', listening: 'سن رہا ہے...', listenToResponse: '🔊 AI جواب سنیں', listenAudio: 'سنیں', stopAudio: 'روکیں', whyAiIdentified: 'AI نے اسے کیوں پہچانا؟', confidence: 'اعتماد', confidenceNote: 'یہ طبی تشخیص نہیں ہے۔', whatYouSaid: 'آپ نے کہا:', whatAiInferred: 'AI نے سمجھا:', personalizedSuggestions: 'ذاتی تجاویز', saveJournal: 'ڈائری محفوظ کریں', savedSuccess: 'ڈائری محفوظ ہو گئی!', talkToHuman: 'انسانی معاون سے بات کریں', continueWithAI: 'AI کے ساتھ جاری رکھیں' },
    chatbot: { title: 'Mood Journal AI معاون', subtitle: 'آپ کا ذاتی عکاسی معاون', inputPlaceholder: 'آج آپ کیسا محسوس کر رہے ہیں؟', send: 'بھیجیں', voice: 'آواز', listening: 'آپ کی آواز سن رہا ہے...', typing: 'AI جواب تیار کر رہا ہے...', clearChat: 'چیٹ صاف کریں' },
    common: { language: 'زبان', darkMode: 'ڈارک موڈ', lightMode: 'لائٹ موڈ', loading: 'لوڈ ہو رہا ہے...', save: 'محفوظ کریں', cancel: 'منسوخ', delete: 'حذف کریں', confirm: 'تصدیق' }
  })
};
