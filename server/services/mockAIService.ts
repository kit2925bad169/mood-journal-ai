import { AIAnalysisResult, SupportedLanguage } from './aiTypes.js';
import { PreprocessedJournal } from './preprocessing.js';

interface KeywordPattern {
  words: string[];
  mood: string;
  emotion: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  score: number;
  context: string;
  trigger: string;
}

const CRISIS_WORDS = [
  'kill myself', 'end my life', 'suicide', 'want to die', 'end it all', 'hurt myself', 'self harm',
  'தற்கொலை', 'சாக வேண்டும்', 'வாழ பிடிக்கவில்லை',
  'आत्महत्या', 'मरना चाहता', 'खुद को नुकसान',
  'ആത്മഹത്യ', 'മരിക്കണം',
  'ఆత్మహత్య', 'చనిపోవాలని ఉంది',
  'ಆತ್ಮಹತ್ಯೆ', 'ಸಾಯಬೇಕು'
];

const PATTERNS: KeywordPattern[] = [
  // Work & Deadlines & Stress
  {
    words: ['deadline', 'deadlines', 'workload', 'late', 'worked late', 'overwhelmed', 'pressure', 'target', 'boss', 'scolded', 'manager', 'assignment', 'exam', 'exams', 'urgent', 'stressed', 'stress', 'tired', 'exhausted', 'பணி', 'வேலை', 'அழுத்தம்', 'நேரம்', 'சோர்வு', 'தாமதம்', 'பரிட்சை', 'काम', 'तनाव', 'दबाव', 'थकावट', 'परीक्षा', 'असाइनमेंट', 'ജോലി', 'സമ്മർദ്ദം', 'ക്ഷീണം', 'പരീക്ഷ', 'పని', 'ఒత్తిడి', 'అలసట', 'పరీక్ష', 'ಕೆಲಸ', 'ಒತ್ತಡ', 'ಆಯಾಸ', 'ಪರೀಕ್ಷೆ'],
    mood: 'Stressed',
    emotion: 'Anxiety',
    sentiment: 'Negative',
    score: 2,
    context: 'Workload & Deadlines',
    trigger: 'Tight deadlines and heavy workload pressure'
  },
  // Sad / Low
  {
    words: ['sad', 'lonely', 'low', 'down', 'cried', 'crying', 'hopeless', 'depressed', 'unhappy', 'alone', 'hurt', 'கவலை', 'துக்கம்', 'தனிமை', 'அழுகை', 'வருத்தம்', 'उदासी', 'अकेला', 'रोना', 'निराश', 'दुखी', 'സങ്കടം', 'ഏകാന്തത', 'കരച്ചിൽ', 'బాధ', 'ఒంటరితనం', 'ఏడుపు', 'ದುಃಖ', 'ಒಂಟಿತನ', 'ಅಳು'],
    mood: 'Low',
    emotion: 'Sadness',
    sentiment: 'Negative',
    score: 2,
    context: 'Emotional Wellbeing',
    trigger: 'Feeling isolated or emotional strain'
  },
  // Happy / Proud / Success
  {
    words: ['happy', 'excited', 'great', 'awesome', 'proud', 'achieved', 'won', 'success', 'successful', 'enjoyed', 'presentation', 'promotion', 'celebrate', 'good day', 'wonderful', 'மகிழ்ச்சி', 'வெற்றி', 'பெருமை', 'ஆனந்தம்', 'சிறப்பு', 'खुशी', 'सफलता', 'गर्व', 'उत्कृष्ट', 'शानदार', 'സന്തോഷം', 'വിജയം', 'അഭിമാനം', 'సంతోషం', 'విజయం', 'గర్వం', 'ಸಂತೋಷ', 'ಗೆಲುವು', 'ಹೆಮ್ಮೆ'],
    mood: 'Happy',
    emotion: 'Joy',
    sentiment: 'Positive',
    score: 5,
    context: 'Achievement & Personal Growth',
    trigger: 'Completing a major goal or positive validation'
  },
  // Calm / Peace / Rest
  {
    words: ['calm', 'peace', 'peaceful', 'relaxed', 'walk', 'slept well', 'sleep', 'morning', 'coffee', 'meditation', 'nature', 'gentle', 'rest', 'quiet', 'அமைதி', 'ஓய்வு', 'நல்ல தூக்கம்', 'காலை நடை', 'தியானம்', 'शांति', 'आराम', 'अच्छी नींद', 'सुबह की सैर', 'ध्यान', 'സമാധാനം', 'വിശ്രമം', 'നല്ല ഉറക്കം', 'ప్రశాంతత', 'విశ్రాంతి', 'మంచి నిద్ర', 'ಶಾಂತಿ', 'ವಿಶ್ರಾಂತಿ', 'ಉತ್ತಮ ನಿದ್ರೆ'],
    mood: 'Calm',
    emotion: 'Peace',
    sentiment: 'Positive',
    score: 4,
    context: 'Rest & Mindfulness',
    trigger: 'Restful sleep and unhurried routine'
  },
  // Frustration / Conflict
  {
    words: ['angry', 'frustrated', 'annoyed', 'irritated', 'argue', 'fight', 'disappointed', 'unfair', 'criticized', 'கோபம்', 'ஏமாற்றம்', 'எரிச்சல்', 'சண்டை', 'गुस्सा', 'निराशा', 'चिढ़', 'बहस', 'ദേഷ്യം', 'നിരാശ', 'തർക്കം', 'కోపం', 'నిరాశ', 'గొడవ', 'ಕೋಪ', 'ನಿರಾಶೆ', 'ಜಗಳ'],
    mood: 'Low / Stressed',
    emotion: 'Frustration',
    sentiment: 'Negative',
    score: 2,
    context: 'Interpersonal Conflict & Expectations',
    trigger: 'Unmet expectations or criticism'
  }
];

export function runMockAnalysis(
  preprocessed: PreprocessedJournal,
  rawText: string,
  lang: SupportedLanguage = 'en'
): AIAnalysisResult {
  const lower = rawText.toLowerCase();

  // 1. Safety & Crisis Check
  const isCrisis = CRISIS_WORDS.some((cw) => lower.includes(cw));
  if (isCrisis) {
    return {
      mood: 'Very Low',
      emotion: 'Deep Distress',
      sentiment: 'Negative',
      moodScore: 1,
      confidence: 0.95,
      contexts: ['Emotional Crisis', 'Personal Wellbeing'],
      keywords: ['distress', 'support needed'],
      triggers: ['Overwhelming emotional weight'],
      stressIndicators: ['Severe acute distress language detected'],
      explanation: {
        summary: 'Your entry contains words indicating significant emotional pain.',
        explicitMentions: ['Severe emotional pain expressed in journal'],
        aiInferences: ['User may be experiencing intense acute distress and needs care'],
        bulletPoints: [
          'High emotional intensity keywords detected',
          'Urgent self-reflection safety threshold reached'
        ]
      },
      aiResponse: getMultilingualCrisisResponse(lang),
      followUpQuestion: 'Would you be open to speaking with someone you trust or a free helpline right now?',
      contributingFactors: ['High emotional burden', 'Feeling isolated'],
      suggestions: [
        {
          title: 'Reach out to a trusted contact',
          description: 'A close friend, mentor, or family member who can listen right now.',
          category: 'mindset'
        },
        {
          title: 'Contact a certified wellness counselor',
          description: 'Free, confidential helplines are available 24/7.',
          category: 'general'
        }
      ],
      safetyCheck: {
        isCrisisDetected: true,
        calmMessage: 'It sounds like you may be going through something very difficult. You do not have to handle it alone.',
        resources: [
          'USA & Canada: Call or text 988 (Suicide & Crisis Lifeline)',
          'India: Kiran Helpline 1800-599-0019 or Vandrevala Foundation (+91 9999 666 555)',
          'UK: Call 111 (NHS Mental Health Services) or text SHOUT to 85258',
          'International: Find a local crisis line at findahelpline.com'
        ]
      }
    };
  }

  // 2. Keyword matching and pattern detection
  let matchedPattern: KeywordPattern | null = null;
  const detectedKeywords: string[] = [];
  const detectedContexts: string[] = [];
  const detectedTriggers: string[] = [];

  for (const pattern of PATTERNS) {
    const hits = pattern.words.filter((w) => lower.includes(w));
    if (hits.length > 0) {
      if (!matchedPattern || hits.length > 1) {
        matchedPattern = pattern;
      }
      detectedKeywords.push(...hits.slice(0, 3));
      if (!detectedContexts.includes(pattern.context)) {
        detectedContexts.push(pattern.context);
      }
      if (!detectedTriggers.includes(pattern.trigger)) {
        detectedTriggers.push(pattern.trigger);
      }
    }
  }

  // Fallback if no specific pattern found
  if (!matchedPattern) {
    matchedPattern = {
      words: [],
      mood: 'Neutral',
      emotion: 'Reflective',
      sentiment: 'Neutral',
      score: 3,
      context: 'Daily Routine',
      trigger: 'General daily experiences'
    };
    detectedContexts.push('Daily Reflection');
    detectedTriggers.push('Routine day-to-day events');
  }

  // Determine explicit mentions from preprocessed sentences
  const explicitMentions: string[] = [];
  if (lower.includes('deadline') || lower.includes('work') || lower.includes('வேலை') || lower.includes('काम')) {
    explicitMentions.push('User explicitly mentioned workload or deadlines');
  }
  if (lower.includes('stress') || lower.includes('tired') || lower.includes('exhausted') || lower.includes('அழுத்தம்')) {
    explicitMentions.push('User explicitly stated feeling stressed or tired');
  }
  if (lower.includes('happy') || lower.includes('proud') || lower.includes('presentation') || lower.includes('மகிழ்ச்சி')) {
    explicitMentions.push('User explicitly shared a positive milestone or feeling');
  }
  if (lower.includes('sleep') || lower.includes('walk') || lower.includes('morning')) {
    explicitMentions.push('User mentioned daily routine habits like sleep or walking');
  }
  if (explicitMentions.length === 0) {
    explicitMentions.push(`User reflected on their daily thoughts (${preprocessed.wordCount} words)`);
  }

  const aiInferences: string[] = [
    `Interpreted tone as predominantly ${matchedPattern.sentiment.toLowerCase()}`,
    `Associated experiences with context: ${matchedPattern.context}`
  ];

  const bulletPoints: string[] = [
    `Identified emotional markers: ${detectedKeywords.slice(0, 3).join(', ') || 'reflective vocabulary'}`,
    `Contextual cues related to ${matchedPattern.context}`,
    `Sentiment intensity aligned with a ${matchedPattern.mood} state`
  ];

  // Contributing factors
  const contributingFactors = detectedTriggers.length > 0 ? detectedTriggers : ['Everyday responsibilities and schedule'];

  // Personalized AI response and follow-up based on language
  const { responseText, followUp, suggestions } = getMultilingualResponseAndSuggestions(
    matchedPattern.mood,
    matchedPattern.emotion,
    matchedPattern.context,
    lang,
    rawText
  );

  const result: AIAnalysisResult = {
    mood: matchedPattern.mood,
    emotion: matchedPattern.emotion,
    sentiment: matchedPattern.sentiment,
    moodScore: matchedPattern.score,
    confidence: 0.88,
    contexts: detectedContexts.slice(0, 4),
    keywords: Array.from(new Set([...detectedKeywords, ...preprocessed.keywords])).slice(0, 8),
    triggers: detectedTriggers.slice(0, 3),
    stressIndicators: matchedPattern.sentiment === 'Negative'
      ? ['High workload demands', 'Time constraint pressure', 'Fatigue language']
      : ['No elevated stress markers detected'],
    explanation: {
      summary: `Your journal indicates signs of ${matchedPattern.mood.toLowerCase()} related to ${matchedPattern.context.toLowerCase()}.`,
      explicitMentions,
      aiInferences,
      bulletPoints
    },
    aiResponse: responseText,
    followUpQuestion: followUp,
    contributingFactors,
    suggestions,
    safetyCheck: {
      isCrisisDetected: false
    }
  };

  return localizeMockAnalysis(result, lang, matchedPattern.mood);
}

function localizeMockAnalysis(result: AIAnalysisResult, lang: SupportedLanguage, mood: string): AIAnalysisResult {
  if (lang === 'en') return result;

  if (lang === 'ta') {
    return {
      ...result,
      stressIndicators: result.sentiment === 'Negative' ? ['பணிச்சுமை அழுத்தம்', 'காலக்கெடு அழுத்தம்', 'சோர்வு குறித்த வார்த்தைகள்'] : ['குறிப்பிடத்தக்க அழுத்த அறிகுறிகள் இல்லை'],
      explanation: {
        summary: `உங்கள் குறிப்பில் ${mood.toLowerCase()} மனநிலையுடன் தொடர்புடைய சில முறைகள் காணப்படுகின்றன.`,
        explicitMentions: ['நீங்கள் குறிப்பிட்ட உணர்வுகள் மற்றும் நிகழ்வுகள் கவனிக்கப்பட்டன.'],
        aiInferences: ['உங்கள் வார்த்தைகளின் அடிப்படையில் மொத்த உணர்ச்சி நிலை புரிந்துகொள்ளப்பட்டது.'],
        bulletPoints: ['முக்கியமான உணர்ச்சி வார்த்தைகள் அடையாளம் காணப்பட்டன.', 'சூழல் மற்றும் மனநிலை மதிப்பெண் ஒன்றாகக் கருதப்பட்டது.']
      },
      suggestions: result.suggestions.map((s, i) => ({ ...s, title: i===0?'பெரிய பணியை சிறு படிகளாகப் பிரிக்கவும்':i===1?'முக்கிய பணிக்கு முன்னுரிமை கொடுக்கவும்':'சிறிய இடைவெளி எடுத்துக்கொள்ளவும்', description:i===0?'பெரிய பணியை எளிய சிறு படிகளாகப் பிரிக்கவும்.':i===1?'மிக முக்கியமான பணியை முதலில் முடிக்க முயற்சிக்கவும்.':'சிறிது நேரம் நின்று மூச்சை சீராக்கி மீண்டும் கவனம் செலுத்துங்கள்.' }))
    };
  }

  if (lang === 'hi') {
    return {
      ...result,
      stressIndicators: result.sentiment === 'Negative' ? ['काम का दबाव', 'समय-सीमा का दबाव', 'थकान से जुड़े शब्द'] : ['स्पष्ट तनाव संकेत नहीं मिले'],
      explanation: {
        summary: `आपकी डायरी में ${mood.toLowerCase()} मनोदशा से जुड़े कुछ पैटर्न दिखाई देते हैं।`,
        explicitMentions: ['आपके बताए भावनाओं और घटनाओं को देखा गया।'],
        aiInferences: ['आपके शब्दों के आधार पर समग्र भावनात्मक स्वर समझा गया।'],
        bulletPoints: ['महत्वपूर्ण भावनात्मक शब्दों की पहचान की गई।', 'संदर्भ और मूड स्कोर को साथ देखा गया।']
      },
      suggestions: result.suggestions.map((s, i) => ({ ...s, title: i===0?'काम को छोटे चरणों में बाँटें':i===1?'महत्वपूर्ण काम को प्राथमिकता दें':'छोटा विराम लें', description:i===0?'बड़े काम को आसान छोटे चरणों में बाँटें।':i===1?'सबसे जरूरी काम पहले पूरा करने की कोशिश करें।':'थोड़ा रुककर सांस लें और फिर ध्यान केंद्रित करें।' }))
    };
  }

  if (lang === 'te') {
    return {
      ...result,
      explanation: { summary: `మీ జర్నల్‌లో ${mood} మూడ్‌కు సంబంధించిన కొన్ని నమూనాలు కనిపిస్తున్నాయి.`, explicitMentions: ['మీరు చెప్పిన భావాలు మరియు సంఘటనలను పరిగణించాం.'], aiInferences: ['మీ పదాల ఆధారంగా మొత్తం భావోద్వేగ స్వరాన్ని అర్థం చేసుకున్నాం.'], bulletPoints: ['ముఖ్యమైన భావోద్వేగ పదాలను గుర్తించాం.', 'సందర్భం మరియు మూడ్ స్కోర్‌ను కలిసి పరిగణించాం.'] },
      suggestions: result.suggestions.map((s, i) => ({ ...s, title: i===0?'పనిని చిన్న దశలుగా విభజించండి':i===1?'ముఖ్యమైన పనికి ప్రాధాన్యత ఇవ్వండి':'చిన్న విరామం తీసుకోండి', description:i===0?'పెద్ద పనిని సులభమైన చిన్న దశలుగా విభజించండి.':i===1?'అత్యవసరమైన పనిని ముందుగా పూర్తి చేయండి.':'కొద్దిసేపు ఆగి శ్వాస తీసుకుని మళ్లీ దృష్టి పెట్టండి.' }))
    };
  }

  if (lang === 'kn') {
    return {
      ...result,
      explanation: { summary: `ನಿಮ್ಮ ದಿನಚರಿಯಲ್ಲಿ ${mood} ಮನಸ್ಥಿತಿಗೆ ಸಂಬಂಧಿಸಿದ ಕೆಲವು ಮಾದರಿಗಳು ಕಂಡುಬರುತ್ತವೆ.`, explicitMentions: ['ನೀವು ಹೇಳಿದ ಭಾವನೆಗಳು ಮತ್ತು ಘಟನೆಗಳನ್ನು ಗಮನಿಸಲಾಗಿದೆ.'], aiInferences: ['ನಿಮ್ಮ ಪದಗಳ ಆಧಾರದ ಮೇಲೆ ಒಟ್ಟಾರೆ ಭಾವನಾತ್ಮಕ ಧಾಟಿಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲಾಗಿದೆ.'], bulletPoints: ['ಮುಖ್ಯ ಭಾವನಾತ್ಮಕ ಪದಗಳನ್ನು ಗುರುತಿಸಲಾಗಿದೆ.', 'ಸಂದರ್ಭ ಮತ್ತು ಮೂಡ್ ಸ್ಕೋರ್ ಅನ್ನು ಒಟ್ಟಿಗೆ ಪರಿಗಣಿಸಲಾಗಿದೆ.'] },
      suggestions: result.suggestions.map((s, i) => ({ ...s, title: i===0?'ಕೆಲಸವನ್ನು ಸಣ್ಣ ಹಂತಗಳಾಗಿ ವಿಭಜಿಸಿ':i===1?'ಮುಖ್ಯ ಕೆಲಸಕ್ಕೆ ಆದ್ಯತೆ ನೀಡಿ':'ಸಣ್ಣ ವಿರಾಮ ತೆಗೆದುಕೊಳ್ಳಿ', description:i===0?'ದೊಡ್ಡ ಕೆಲಸವನ್ನು ಸುಲಭವಾದ ಸಣ್ಣ ಹಂತಗಳಾಗಿ ವಿಭಜಿಸಿ.':i===1?'ಅತ್ಯಂತ ಮುಖ್ಯವಾದ ಕೆಲಸವನ್ನು ಮೊದಲು ಮುಗಿಸಲು ಪ್ರಯತ್ನಿಸಿ.':'ಸ್ವಲ್ಪ ವಿರಾಮ ತೆಗೆದುಕೊಂಡು ಉಸಿರಾಟವನ್ನು ಸರಿಪಡಿಸಿ ಮತ್ತೆ ಗಮನ ಕೊಡಿ.' }))
    };
  }

  if (lang === 'ml') {
    return {
      ...result,
      explanation: { summary: `നിങ്ങളുടെ കുറിപ്പിൽ ${mood} മനോഭാവവുമായി ബന്ധപ്പെട്ട ചില മാതൃകകൾ കാണുന്നു.`, explicitMentions: ['നിങ്ങൾ പറഞ്ഞ വികാരങ്ങളും സംഭവങ്ങളും പരിഗണിച്ചു.'], aiInferences: ['നിങ്ങളുടെ വാക്കുകളുടെ അടിസ്ഥാനത്തിൽ മൊത്തത്തിലുള്ള വികാരഭാവം മനസ്സിലാക്കി.'], bulletPoints: ['പ്രധാന വികാര വാക്കുകൾ കണ്ടെത്തി.', 'സാഹചര്യവും മൂഡ് സ്കോറും ഒരുമിച്ച് പരിഗണിച്ചു.'] }
    };
  }

  if (lang === 'tanglish') {
    const stressed = mood.toLowerCase().includes('stress');
    return {
      ...result,
      stressIndicators: stressed ? ['Workload pressure', 'Time pressure', 'Tiredness language'] : ['Major stress markers detect aagala'],
      explanation: {
        summary: `Unga journal-la ${mood.toLowerCase()} mood-ku related-aana patterns theriyudhu.`,
        explicitMentions: ['Journal-la neenga sonna feelings and events use pannappattadhu.'],
        aiInferences: ['Unga words base panni overall emotional tone interpret pannappattadhu.'],
        bulletPoints: ['Journal-la important emotional words identify pannappattadhu.', 'Context and mood score together-a consider pannappattadhu.']
      },
      suggestions: result.suggestions.map((s, i) => ({
        ...s,
        title: i === 0 ? 'Small steps try pannunga' : i === 1 ? 'Priority-a focus pannunga' : 'Konjam mindful break edunga',
        description: i === 0 ? 'Big task-a manageable small steps-a divide pannunga.' : i === 1 ? 'Most important task first complete panna try pannunga.' : 'Konjam pause eduthu breathe and reset pannunga.'
      }))
    };
  }

  if (lang === 'ur') {
    return {
      ...result,
      stressIndicators: result.sentiment === 'Negative' ? ['کام کا دباؤ', 'وقت کی پابندی کا دباؤ', 'تھکن کے الفاظ'] : ['واضح دباؤ کے اشارے نہیں ملے'],
      explanation: {
        summary: `آپ کی ڈائری میں ${mood.toLowerCase()} کیفیت سے متعلق کچھ نمونے نظر آتے ہیں۔`,
        explicitMentions: ['آپ کے بیان کردہ جذبات اور واقعات کو دیکھا گیا۔'],
        aiInferences: ['آپ کے الفاظ کی بنیاد پر مجموعی جذباتی انداز سمجھا گیا۔'],
        bulletPoints: ['اہم جذباتی الفاظ کو دیکھا گیا۔', 'سیاق و سباق اور موڈ اسکور کو ساتھ سمجھا گیا۔']
      },
      suggestions: result.suggestions.map((s, i) => ({
        ...s,
        title: i === 0 ? 'کام کو چھوٹے مراحل میں تقسیم کریں' : i === 1 ? 'اہم کام کو ترجیح دیں' : 'مختصر وقفہ لیں',
        description: i === 0 ? 'بڑے کام کو آسان اور چھوٹے مراحل میں تقسیم کریں۔' : i === 1 ? 'سب سے ضروری کام پہلے مکمل کرنے کی کوشش کریں۔' : 'تھوڑی دیر رک کر سانس لیں اور دوبارہ توجہ مرکوز کریں۔'
      }))
    };
  }

  return result;
}

function getMultilingualCrisisResponse(lang: SupportedLanguage): string {
  switch (lang) {
    case 'ta':
      return 'நீங்கள் மிகவும் கடினமான சூழலில் இருப்பதை உங்கள் வார்த்தைகள் காட்டுகின்றன. நீங்கள் தனியாக இதை எதிர்கொள்ள வேண்டியதில்லை. உங்களுக்கு ஆதரவாக இருக்க மனிதர்கள் உள்ளனர்.';
    case 'hi':
      return 'लगता है कि आप बहुत कठिन समय से गुजर रहे हैं। आपको इसका अकेले सामना करने की ज़रूरत नहीं है। कृपया किसी अपने या हेल्पलाइन से बात करें।';
    case 'ml':
      return 'നിങ്ങൾ വളരെ ബുദ്ധിമുട്ടുള്ള ഒരു സാഹചര്യത്തിലൂടെയാണ് കടന്നുപോകുന്നതെന്ന് തോന്നുന്നു. നിങ്ങൾ ഒറ്റയ്ക്കല്ല, സഹായം ലഭ്യമാണ്.';
    case 'te':
      return 'మీరు చాలా కష్టమైన సమయాన్ని ఎదుర్కొంటున్నట్లు అనిపిస్తుంది. మీరు ఒంటరిగా ఉండాల్సిన అవసరం లేదు.';
    case 'kn':
      return 'ನೀವು ಕಠಿಣ ಪರಿಸ್ಥಿತಿಯನ್ನು ಎದುರಿಸುತ್ತಿರುವಂತೆ ತೋರುತ್ತಿದೆ. ನೀವು ಏಕಾಂಗಿಯಾಗಿ ಇರಬೇಕಾಗಿಲ್ಲ.';
    case 'ur':
      return 'آپ کے الفاظ سے لگتا ہے کہ آپ بہت مشکل وقت سے گزر رہے ہیں۔ آپ کو یہ سب اکیلے برداشت کرنے کی ضرورت نہیں ہے۔';
    case 'tanglish':
      return 'Unga words romba difficult situation-a indicate pannudhu. Idha neenga thaniya handle panna vendam; trusted person kitta reach out pannunga.';
    default:
      return 'It sounds like you may be going through something very difficult. You do not have to handle it alone. Support and a caring ear are available.';
  }
}

function getMultilingualResponseAndSuggestions(
  mood: string,
  emotion: string,
  context: string,
  lang: SupportedLanguage,
  rawText: string
) {
  // English Defaults
  let responseText = '';
  let followUp = '';
  let suggestions: Array<{ title: string; description: string; category: string }> = [];

  const lower = rawText.toLowerCase();

  if (mood === 'Stressed' || emotion === 'Anxiety') {
    if (lang === 'ta') {
      responseText = 'இன்று உங்களுக்கு அதிகமான பணிச்சுமை மற்றும் அழுத்தமான நாளாக இருந்ததாகத் தெரிகிறது, குறிப்பாக முடிக்க வேண்டிய பணிகள் அதிகமாக இருந்தபோது.';
      followUp = 'பணிகளை முடிப்பதில் உங்களுக்கு மிகக் கடினமாக இருந்த விஷயம் எது?';
    } else if (lang === 'hi') {
      responseText = 'आपकी डायरी से लगता है कि आज का दिन काफी तनावपूर्ण रहा, खासकर समय सीमा और भारी काम के कारण।';
      followUp = 'कार्यों को पूरा करने की कोशिश करते समय आपको सबसे बड़ी कठिनाई क्या आई?';
    } else if (lang === 'ml') {
      responseText = 'ഇന്ന് ജോലിഭാരവും സമയപരിധിയും കാരണം തികച്ചും സമ്മർദ്ദം നിറഞ്ഞ ദിവസമായിരുന്നുവെന്ന് തോന്നുന്നു.';
      followUp = 'ജോലികൾ പൂർത്തിയാക്കാൻ ശ്രമിക്കുമ്പോൾ നിങ്ങൾ നേരിട്ട പ്രധാന തടസ്സം എന്തായിരുന്നു?';
    } else if (lang === 'te') {
      responseText = 'ఈ రోజు పని ఒత్తిడి మరియు గడువుల కారణంగా మీకు చాలా కష్టమైన రోజుగా ఉన్నట్లు తెలుస్తోంది.';
      followUp = 'పనులను పూర్తి చేయడంలో మీకు అత్యంత కష్టంగా అనిపించిన అంశం ఏమిటి?';
    } else if (lang === 'kn') {
      responseText = 'ಇಂದು ಕೆಲಸದ ಹೊರೆ ಮತ್ತು ಗಡುವಿನಿಂದಾಗಿ ನಿಮಗೆ ಸಾಕಷ್ಟು ಒತ್ತಡದ ದಿನವಾಗಿದ್ದಂತೆ ತೋರುತ್ತಿದೆ.';
      followUp = 'ಕೆಲಸಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಪ್ರಯತ್ನಿಸುವಾಗ ನೀವು ಎದುರಿಸಿದ ಮುಖ್ಯ ಸವಾಲು ಯಾವುದು?';
    } else {
      responseText = 'That sounds like a demanding day, especially with multiple deadlines and heavy tasks requiring your energy.';
      followUp = 'What difficulty did you face while trying to complete the tasks today?';
    }

    suggestions = [
      {
        title: 'Break large tasks into smaller steps',
        description: 'Divide monolithic projects into 20-minute digestible milestones to reduce overwhelm.',
        category: 'workload'
      },
      {
        title: 'Prioritize top 2 critical tasks',
        description: 'Identify the two items with true deadlines and defer the rest until tomorrow.',
        category: 'workload'
      },
      {
        title: 'Take intentional 5-minute micro-breaks',
        description: 'Step away from the screen, stretch, and take 3 deep breaths between focus blocks.',
        category: 'mindset'
      }
    ];
  } else if (mood === 'Happy' || emotion === 'Joy' || emotion === 'Pride') {
    if (lang === 'ta') {
      responseText = 'இன்று நீங்கள் சிறப்பாகச் செய்துள்ளீர்கள்! உங்கள் சாதனையை எண்ணி மகிழ்ச்சியடைகிறேன்.';
      followUp = 'இந்த வெற்றியை அடைய உங்களுக்கு மிகவும் உதவிய உத்தி அல்லது முயற்சி எது?';
    } else if (lang === 'hi') {
      responseText = 'शानदार! आपकी डायरी आपकी उपलब्धि और सकारात्मक ऊर्जा को दर्शाती है। आप पर गर्व है!';
      followUp = 'इस सकारात्मक अनुभव को कल भी बनाए रखने के लिए आप क्या कर सकते हैं?';
    } else if (lang === 'ml') {
      responseText = 'അഭിനന്ദനങ്ങൾ! നിങ്ങളുടെ ഇന്നത്തെ നേട്ടത്തിൽ സന്തോഷം തോന്നുന്നു.';
      followUp = 'ഈ വിജയം നേടാൻ നിങ്ങളെ ഏറ്റവും കൂടുതൽ സഹായിച്ചത് എന്തായിരുന്നു?';
    } else if (lang === 'te') {
      responseText = 'అభినందనలు! మీ ప్రదర్శన మరియు విజయం చాలా స్ఫూర్తిదాయకంగా ఉన్నాయి.';
      followUp = 'ఈ విజయాన్ని సాధించడంలో మీకు అత్యంత ఉపయోగపడిన ఆలోచన ఏమిటి?';
    } else if (lang === 'kn') {
      responseText = 'ಅಭಿನಂದನೆಗಳು! ನಿಮ್ಮ ಸಾಧನೆ ಮತ್ತು ಸಂತೋಷವು ನಿಮ್ಮ ಬರಹದಲ್ಲಿ ಎದ್ದು ಕಾಣುತ್ತಿದೆ.';
      followUp = 'ಈ ಯಶಸ್ಸನ್ನು ಸಾಧಿಸಲು ನಿಮಗೆ ಹೆಚ್ಚು ನೆರವಾದ ಅಂಶ ಯಾವುದು?';
    } else {
      responseText = 'Great work! Your entry radiates a well-earned sense of pride and accomplishment.';
      followUp = 'What strategy or mindset helped you achieve this positive result today?';
    }

    suggestions = [
      {
        title: 'Celebrate and savor this win',
        description: 'Take a moment to acknowledge your hard work before jumping straight into the next goal.',
        category: 'positive'
      },
      {
        title: 'Note down what worked well',
        description: 'Document the specific preparation or attitude that gave you confidence so you can repeat it.',
        category: 'positive'
      },
      {
        title: 'Share your joy with someone',
        description: 'Mentioning your milestone to a colleague or friend reinforces positive self-efficacy.',
        category: 'mindset'
      }
    ];
  } else if (mood === 'Low' || emotion === 'Sadness') {
    if (lang === 'ta') {
      responseText = 'இன்று உங்கள் மனம் சோர்வாகவும் அமைதியின்றியும் இருப்பதை உணர முடிகிறது. சில நாட்கள் இப்படி இருப்பது இயல்பானதுதான்.';
      followUp = 'இப்போது உங்களுக்கு சற்றே ஆறுதல் அளிக்கக்கூடிய எளிய செயல் ஒன்று சொல்ல முடியுமா?';
    } else if (lang === 'hi') {
      responseText = 'आज आप थोड़ा उदास और अकेला महसूस कर रहे हैं। ऐसा महसूस होना सामान्य है, खुद पर ज्यादा कठोर न हों।';
      followUp = 'क्या कोई ऐसी छोटी सी चीज़ है जो अभी आपके मन को थोड़ा हल्का कर सके?';
    } else if (lang === 'ml') {
      responseText = 'ഇന്ന് നിങ്ങൾക്ക് മാനസികമായി അല്പം പ്രയാസം തോന്നുന്നുവെന്ന് മനസ്സിലാക്കുന്നു.';
      followUp = 'നിങ്ങൾക്ക് ഇപ്പോൾ അല്പം ആശ്വാസം നൽകാൻ കഴിയുന്ന എന്തെങ്കിലും ഉണ്ടോ?';
    } else if (lang === 'te') {
      responseText = 'ఈ రోజు మీకు మానసికంగా కొంచెం భారంగా ఉన్నట్లు అనిపిస్తుంది.';
      followUp = 'మీ మనస్సును తేలికపరచడానికి ఏదైనా చిన్న సహాయం లేదా విశ్రాంతి అవసరమా?';
    } else if (lang === 'kn') {
      responseText = 'ಇಂದು ನಿಮ್ಮ ಮನಸ್ಸು ಸ್ವಲ್ಪ ಭಾರವಾಗಿರುವಂತೆ ತೋರುತ್ತಿದೆ. ಹೀಗಾಗುವುದು ಸಹಜ.';
      followUp = 'ನಿಮಗೆ ಈಗ ಸ್ವಲ್ಪ ಸಮಾಧಾನ ತರಲು ಯಾವುದಾದರೂ ಸರಳ ಕೆಲಸ ನೆರವಾಗಬಹುದೇ?';
    } else {
      responseText = 'It sounds like today has been emotionally heavy and quiet. It is completely okay to have low-energy days.';
      followUp = 'What is one gentle, comforting thing you can do for yourself this evening?';
    }

    suggestions = [
      {
        title: 'Allow yourself gentle rest',
        description: 'Give yourself permission to pause without judging your current productivity.',
        category: 'mindset'
      },
      {
        title: 'Warm drink or short mindful walk',
        description: 'A warm tea or stepping outside for 5 minutes of fresh air can ground the nervous system.',
        category: 'sleep'
      },
      {
        title: 'Connect with a trusted friend',
        description: 'Even a short text message can help you feel less isolated.',
        category: 'general'
      }
    ];
  } else {
    // Calm / Neutral / Routine
    if (lang === 'ta') {
      responseText = 'உங்கள் இன்றைய குறிப்பு அமைதியான மற்றும் சீரான மனநிலையை வெளிப்படுத்துகிறது.';
      followUp = 'இன்றைய நாளில் உங்கள் மன அமைதிக்கு முக்கிய காரணமாக இருந்தது எது?';
    } else if (lang === 'hi') {
      responseText = 'आपकी डायरी एक संतुलित और शांत दिन की ओर इशारा करती है। यह निरंतरता बहुत अच्छी है।';
      followUp = 'आज के दिन का कौन सा हिस्सा आपको सबसे शांतिपूर्ण लगा?';
    } else if (lang === 'ml') {
      responseText = 'നിങ്ങളുടെ ഇന്നത്തെ ദിവസം സമാധാനപരവും സന്തുലിതവുമായിരുന്നു എന്ന് തോന്നുന്നു.';
      followUp = 'ഇന്നത്തെ ദിവസത്തിൽ നിങ്ങൾക്ക് ഏറ്റവും പ്രിയപ്പെട്ട നിമിഷം ഏതായിരുന്നു?';
    } else if (lang === 'te') {
      responseText = 'ఈ రోజు ప్రశాంతమైన మరియు స్థిరమైన భావోద్వేగాలను మీ డైరీ సూచిస్తోంది.';
      followUp = 'ఈ రోజు మీకు అత్యంత విశ్రాంతినిచ్చిన విషయం ఏమిటి?';
    } else if (lang === 'kn') {
      responseText = 'ನಿಮ್ಮ ಇಂದಿನ ದಿನಚರಿಯು ಶಾಂತಿಯುತ ಮತ್ತು ಸಮತೋಲಿತ ಮನಸ್ಥಿತಿಯನ್ನು ತೋರಿಸುತ್ತದೆ.';
      followUp = 'ಇಂದಿನ ದಿನದಲ್ಲಿ ನಿಮಗೆ ಅತ್ಯಂತ ನೆಮ್ಮದಿ ನೀಡಿದ ಕ್ಷಣ ಯಾವುದು?';
    } else {
      responseText = 'Your journal reflects a calm, steady rhythm today. Balance is a powerful foundation for wellness.';
      followUp = 'What part of your routine helped you feel most grounded today?';
    }

    suggestions = [
      {
        title: 'Protect your consistent sleep schedule',
        description: 'Aim to sleep and wake at the same time to anchor your circadian rhythm.',
        category: 'sleep'
      },
      {
        title: 'Maintain daily mindfulness pauses',
        description: 'Continue taking time to observe your thoughts and journal your reflections.',
        category: 'mindset'
      },
      {
        title: 'Set an enjoyable personal goal',
        description: 'Use this steady energy to invest in a creative hobby or light exercise.',
        category: 'general'
      }
    ];
  }

  return { responseText, followUp, suggestions };
}
