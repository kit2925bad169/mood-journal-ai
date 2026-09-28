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
  'kill myself',
  'end my life',
  'suicide',
  'want to die',
  'end it all',
  'hurt myself',
  'self harm',
  'தற்கொலை',
  'சாக வேண்டும்',
  'வாழ பிடிக்கவில்லை',
  'आत्महत्या',
  'मरना चाहता',
  'खुद को नुकसान',
  'ആത്മഹത്യ',
  'മരിക്കണം',
  'ఆత్మహత్య',
  'చనిపోవాలని ఉంది',
  'ಆತ್ಮಹತ್ಯೆ',
  'ಸಾಯಬೇಕು'
];

const PATTERNS: KeywordPattern[] = [
  {
    words: [
      'worried',
      'worry',
      'worrying',
      'concerned',
      'concern',
      'nervous',
      'anxious',
      'anxiety',
      'fear',
      'afraid',
      'scared',
      'project',
      'deadline',
      'deadlines',
      'workload',
      'pressure',
      'target',
      'boss',
      'manager',
      'assignment',
      'exam',
      'exams',
      'urgent',
      'stressed',
      'stress',
      'tired',
      'exhausted',
      'overwhelmed',
      'work',
      'college',
      'presentation',
      'submission',
      'பணி',
      'வேலை',
      'அழுத்தம்',
      'கவலை',
      'பதட்டம்',
      'நேரம்',
      'சோர்வு',
      'தாமதம்',
      'பரிட்சை',
      'திட்டம்',
      'काम',
      'तनाव',
      'दबाव',
      'चिंता',
      'परीक्षा',
      'असाइनमेंट',
      'प्रोजेक्ट',
      'ജോലി',
      'സമ്മർദ്ദം',
      'ആശങ്ക',
      'പരീക്ഷ',
      'പദ്ധതി',
      'పని',
      'ఒత్తిడి',
      'ఆందోళన',
      'అలసట',
      'పరీక్ష',
      'ప్రాజెక్ట్',
      'ಕೆಲಸ',
      'ಒತ್ತಡ',
      'ಆತಂಕ',
      'ಪರೀಕ್ಷೆ'
    ],
    mood: 'Stressed',
    emotion: 'Anxiety',
    sentiment: 'Negative',
    score: 2,
    context: 'Workload & Personal Concerns',
    trigger: 'Worry, pressure, deadlines, or concern about responsibilities'
  },

  {
    words: [
      'sad',
      'lonely',
      'low',
      'down',
      'cried',
      'crying',
      'hopeless',
      'depressed',
      'unhappy',
      'alone',
      'hurt',
      'empty',
      'miss',
      'missing',
      'heartbroken',
      'கவலை',
      'துக்கம்',
      'தனிமை',
      'அழுகை',
      'வருத்தம்',
      'उदासी',
      'अकेला',
      'रोना',
      'निराश',
      'दुखी',
      'സങ്കടം',
      'ഏകാന്തത',
      'കരച്ചിൽ',
      'బాధ',
      'ఒంటరితనం',
      'ఏడుపు',
      'ದುಃಖ',
      'ಒಂಟಿತನ',
      'ಅಳು'
    ],
    mood: 'Low',
    emotion: 'Sadness',
    sentiment: 'Negative',
    score: 2,
    context: 'Emotional Wellbeing',
    trigger: 'Feeling isolated, hurt, disappointed, or emotionally low'
  },

  {
    words: [
      'happy',
      'excited',
      'great',
      'awesome',
      'proud',
      'achieved',
      'won',
      'success',
      'successful',
      'enjoyed',
      'presentation',
      'promotion',
      'celebrate',
      'celebrated',
      'good day',
      'wonderful',
      'amazing',
      'glad',
      'relieved',
      'மகிழ்ச்சி',
      'வெற்றி',
      'பெருமை',
      'ஆனந்தம்',
      'சிறப்பு',
      'खुशी',
      'सफलता',
      'गर्व',
      'उत्कृष्ट',
      'शानदार',
      'സന്തോഷം',
      'വിജയം',
      'അഭിമാനം',
      'సంతోషం',
      'విజయం',
      'గర్వం',
      'ಸಂತೋಷ',
      'ಗೆಲುವು',
      'ಹೆಮ್ಮೆ'
    ],
    mood: 'Happy',
    emotion: 'Joy',
    sentiment: 'Positive',
    score: 5,
    context: 'Achievement & Positive Experiences',
    trigger: 'Positive experience, achievement, progress, or meaningful success'
  },

  {
    words: [
      'calm',
      'peace',
      'peaceful',
      'relaxed',
      'relaxing',
      'walk',
      'walked',
      'slept well',
      'sleep',
      'morning',
      'coffee',
      'meditation',
      'nature',
      'gentle',
      'rest',
      'rested',
      'quiet',
      'comfortable',
      'அமைதி',
      'ஓய்வு',
      'நல்ல தூக்கம்',
      'காலை நடை',
      'தியானம்',
      'शांति',
      'आराम',
      'अच्छी नींद',
      'सुबह की सैर',
      'ध्यान',
      'സമാധാനം',
      'വിശ്രമം',
      'നല്ല ഉറക്കം',
      'ప్రశాంతత',
      'విశ్రాంతి',
      'మంచి నిద్ర',
      'ಶಾಂತಿ',
      'ವಿಶ್ರಾಂತಿ',
      'ಉತ್ತಮ ನಿದ್ರೆ'
    ],
    mood: 'Calm',
    emotion: 'Peace',
    sentiment: 'Positive',
    score: 4,
    context: 'Rest & Mindfulness',
    trigger: 'Rest, sleep, calm activities, or peaceful routine'
  },

  {
    words: [
      'angry',
      'frustrated',
      'frustrating',
      'annoyed',
      'irritated',
      'argue',
      'argued',
      'fight',
      'fighting',
      'disappointed',
      'unfair',
      'criticized',
      'criticism',
      'கோபம்',
      'ஏமாற்றம்',
      'எரிச்சல்',
      'சண்டை',
      'गुस्सा',
      'निराशा',
      'चिढ़',
      'बहस',
      'ദേഷ്യം',
      'നിരാശ',
      'തർക്കം',
      'కోపం',
      'నిరాశ',
      'గొడవ',
      'ಕೋಪ',
      'ನಿರಾಶೆ',
      'ಜಗಳ'
    ],
    mood: 'Low / Stressed',
    emotion: 'Frustration',
    sentiment: 'Negative',
    score: 2,
    context: 'Interpersonal Conflict & Frustration',
    trigger: 'Conflict, criticism, frustration, or unmet expectations'
  }
];

export function runMockAnalysis(
  preprocessed: PreprocessedJournal,
  rawText: string,
  lang: SupportedLanguage = 'en'
): AIAnalysisResult {
  const originalText = rawText.trim();
  const lower = originalText.toLowerCase();

  console.log('🧠 LOCAL FALLBACK ANALYZING ACTUAL JOURNAL:', JSON.stringify(originalText));

  // ---------------------------------------------------------
  // 1. CRISIS CHECK
  // ---------------------------------------------------------

  const isCrisis = CRISIS_WORDS.some((word) =>
    lower.includes(word.toLowerCase())
  );

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
        summary:
          'Your entry contains words indicating significant emotional pain.',
        explicitMentions: ['Severe emotional pain expressed in journal'],
        aiInferences: [
          'The journal contains language associated with significant distress.'
        ],
        bulletPoints: [
          'High emotional intensity detected',
          'Immediate emotional support may be important'
        ]
      },
      aiResponse: getMultilingualCrisisResponse(lang),
      followUpQuestion:
        'Would you be open to speaking with someone you trust or a free helpline right now?',
      contributingFactors: ['High emotional burden'],
      suggestions: [
        {
          title: 'Reach out to a trusted contact',
          description:
            'A close friend, mentor, or family member who can listen right now.',
          category: 'mindset'
        },
        {
          title: 'Contact a certified wellness counselor',
          description:
            'Consider contacting an appropriate crisis or mental-health support service.',
          category: 'general'
        }
      ],
      safetyCheck: {
        isCrisisDetected: true,
        calmMessage:
          'It sounds like you may be going through something very difficult. You do not have to handle it alone.',
        resources: [
          'India: Kiran Helpline 1800-599-0019',
          'India: Vandrevala Foundation +91 9999 666 555',
          'USA & Canada: Call or text 988',
          'International: Find a local crisis line at findahelpline.com'
        ]
      }
    };
  }

  // ---------------------------------------------------------
  // 2. FIND THE BEST MATCHING PATTERN
  // ---------------------------------------------------------

  let matchedPattern: KeywordPattern | null = null;
  let highestMatchCount = 0;

  const detectedKeywords: string[] = [];
  const detectedContexts: string[] = [];
  const detectedTriggers: string[] = [];

  for (const pattern of PATTERNS) {
    const hits = pattern.words.filter((word) =>
      lower.includes(word.toLowerCase())
    );

    if (hits.length > 0) {
      detectedKeywords.push(...hits.slice(0, 5));

      if (!detectedContexts.includes(pattern.context)) {
        detectedContexts.push(pattern.context);
      }

      if (!detectedTriggers.includes(pattern.trigger)) {
        detectedTriggers.push(pattern.trigger);
      }

      if (hits.length > highestMatchCount) {
        highestMatchCount = hits.length;
        matchedPattern = pattern;
      }
    }
  }

  // ---------------------------------------------------------
  // 3. SPECIAL CONTEXT DETECTION
  // ---------------------------------------------------------

  const projectWords = [
    'project',
    'projects',
    'assignment',
    'assignments',
    'presentation',
    'submission',
    'college project',
    'final project',
    'திட்டம்',
    'அசைன்மென்ட்',
    'प्रोजेक्ट',
    'असाइनमेंट',
    'ప్రాజెక్ట్',
    'అసైన్‌మెంట్',
    'ಪ್ರಾಜೆಕ್ಟ್'
  ];

  const relationshipWords = [
    'friend',
    'friends',
    'family',
    'parent',
    'parents',
    'mother',
    'father',
    'boyfriend',
    'girlfriend',
    'relationship',
    'நண்பர்',
    'குடும்பம்',
    'दोस्त',
    'परिवार',
    'സുഹൃത്ത്',
    'കുടുംബം',
    'స్నేహితుడు',
    'కుటుంబం'
  ];

  const sleepWords = [
    'sleep',
    'slept',
    'sleeping',
    'insomnia',
    'tired',
    'exhausted',
    'நித்திரை',
    'தூக்கம்',
    'नींद',
    'थका',
    'ഉറക്കം',
    'ക്ഷീണം',
    'నిద్ర',
    'అలసట',
    'ನಿದ್ರೆ',
    'ಆಯಾಸ'
  ];

  const healthWords = [
    'sick',
    'ill',
    'health',
    'headache',
    'pain',
    'fever',
    'hospital',
    'doctor',
    'உடல்நலம்',
    'வலி',
    'தலைவலி',
    'स्वास्थ्य',
    'दर्द',
    'स्वास्थ्य',
    'ആരോഗ്യം',
    'വേദന',
    'ఆరోగ్యం',
    'నొప్పి',
    'ಆರೋಗ್ಯ'
  ];

  const hasProjectContext = containsAny(lower, projectWords);
  const hasRelationshipContext = containsAny(lower, relationshipWords);
  const hasSleepContext = containsAny(lower, sleepWords);
  const hasHealthContext = containsAny(lower, healthWords);

  // ---------------------------------------------------------
  // 4. FALLBACK PATTERN
  // ---------------------------------------------------------

  if (!matchedPattern) {
    matchedPattern = {
      words: [],
      mood: 'Neutral',
      emotion: 'Reflective',
      sentiment: 'Neutral',
      score: 3,
      context: 'Daily Reflection',
      trigger: 'General daily experiences'
    };

    detectedContexts.push('Daily Reflection');
    detectedTriggers.push('Routine day-to-day events');
  }

  // ---------------------------------------------------------
  // 5. BUILD REAL EXPLICIT MENTIONS
  // ---------------------------------------------------------

  const explicitMentions: string[] = [];

  if (hasProjectContext) {
    explicitMentions.push('You mentioned a project, assignment, presentation, or academic task.');
  }

  if (hasRelationshipContext) {
    explicitMentions.push('You mentioned a relationship, friend, family member, or social connection.');
  }

  if (hasSleepContext) {
    explicitMentions.push('You mentioned sleep, tiredness, or rest.');
  }

  if (hasHealthContext) {
    explicitMentions.push('You mentioned a health or physical wellbeing concern.');
  }

  if (
    lower.includes('worried') ||
    lower.includes('worry') ||
    lower.includes('worrying') ||
    lower.includes('concerned') ||
    lower.includes('anxious') ||
    lower.includes('nervous')
  ) {
    explicitMentions.push(
      'You explicitly described worry, concern, nervousness, or anxiety.'
    );
  }

  if (
    lower.includes('happy') ||
    lower.includes('excited') ||
    lower.includes('proud') ||
    lower.includes('success') ||
    lower.includes('achieved')
  ) {
    explicitMentions.push(
      'You explicitly described a positive feeling or achievement.'
    );
  }

  if (
    lower.includes('sad') ||
    lower.includes('lonely') ||
    lower.includes('alone') ||
    lower.includes('crying') ||
    lower.includes('hurt')
  ) {
    explicitMentions.push(
      'You explicitly described sadness, loneliness, or emotional difficulty.'
    );
  }

  if (explicitMentions.length === 0) {
    explicitMentions.push(
      `The journal contains ${preprocessed.wordCount} words describing your recent experience.`
    );
  }

  // ---------------------------------------------------------
  // 6. REAL JOURNAL-SPECIFIC INFERENCES
  // ---------------------------------------------------------

  const aiInferences: string[] = [];

  if (matchedPattern.sentiment === 'Negative') {
    aiInferences.push(
      `The overall tone appears ${matchedPattern.sentiment.toLowerCase()} based on the words used.`
    );
  } else if (matchedPattern.sentiment === 'Positive') {
    aiInferences.push(
      `The overall tone appears positive based on the words used.`
    );
  } else {
    aiInferences.push(
      'The journal does not contain strong positive or negative emotional markers.'
    );
  }

  if (hasProjectContext) {
    aiInferences.push(
      'The emotional concern appears connected to a project or academic/work responsibility.'
    );
  }

  if (hasRelationshipContext) {
    aiInferences.push(
      'The journal appears to connect the emotional experience with social or relationship factors.'
    );
  }

  if (hasSleepContext) {
    aiInferences.push(
      'Sleep or fatigue appears to be part of the experience described.'
    );
  }

  if (hasHealthContext) {
    aiInferences.push(
      'The journal contains a physical or health-related context.'
    );
  }

  // ---------------------------------------------------------
  // 7. JOURNAL-SPECIFIC BULLET POINTS
  // ---------------------------------------------------------

  const bulletPoints: string[] = [];

  if (detectedKeywords.length > 0) {
    bulletPoints.push(
      `Relevant words detected: ${Array.from(
        new Set(detectedKeywords)
      ).slice(0, 5).join(', ')}`
    );
  }

  if (hasProjectContext) {
    bulletPoints.push(
      'Your journal connects the emotional experience with a project or task.'
    );
  }

  if (
    lower.includes('worried') ||
    lower.includes('worry') ||
    lower.includes('concerned')
  ) {
    bulletPoints.push(
      'The journal specifically expresses worry or concern rather than simply describing a busy day.'
    );
  }

  if (hasRelationshipContext) {
    bulletPoints.push(
      'Social or relationship context is present in the journal.'
    );
  }

  if (hasSleepContext) {
    bulletPoints.push(
      'Sleep or energy-related language appears in the journal.'
    );
  }

  if (bulletPoints.length === 0) {
    bulletPoints.push(
      `The journal was interpreted from its ${preprocessed.wordCount} words and detected emotional vocabulary.`
    );
  }

  // ---------------------------------------------------------
  // 8. CONTEXT-SPECIFIC TRIGGERS
  // ---------------------------------------------------------

  const contributingFactors: string[] = [];

  if (hasProjectContext) {
    contributingFactors.push('Project or academic responsibility');
  }

  if (
    lower.includes('deadline') ||
    lower.includes('urgent') ||
    lower.includes('due')
  ) {
    contributingFactors.push('Time pressure or deadline');
  }

  if (
    lower.includes('worried') ||
    lower.includes('worry') ||
    lower.includes('concerned') ||
    lower.includes('anxious') ||
    lower.includes('nervous')
  ) {
    contributingFactors.push('Worry or uncertainty');
  }

  if (hasRelationshipContext) {
    contributingFactors.push('Relationship or social situation');
  }

  if (hasSleepContext) {
    contributingFactors.push('Sleep or fatigue');
  }

  if (hasHealthContext) {
    contributingFactors.push('Physical or health-related concern');
  }

  if (contributingFactors.length === 0) {
    contributingFactors.push(...detectedTriggers.slice(0, 3));
  }

  if (contributingFactors.length === 0) {
    contributingFactors.push('Everyday thoughts and experiences');
  }

  // ---------------------------------------------------------
  // 9. STRESS INDICATORS
  // ---------------------------------------------------------

  const stressIndicators =
    matchedPattern.sentiment === 'Negative'
      ? [
          hasProjectContext
            ? 'Project or responsibility pressure'
            : 'Negative emotional language',
          lower.includes('deadline') || lower.includes('urgent')
            ? 'Time constraint pressure'
            : 'Emotional concern',
          hasSleepContext ? 'Fatigue or sleep-related language' : 'Worry-related language'
        ]
      : ['No elevated stress markers detected'];

  // ---------------------------------------------------------
  // 10. PERSONALIZED RESPONSE
  // ---------------------------------------------------------

  const {
    responseText,
    followUp,
    suggestions
  } = getMultilingualResponseAndSuggestions(
    matchedPattern.mood,
    matchedPattern.emotion,
    matchedPattern.context,
    lang,
    originalText
  );

  const result: AIAnalysisResult = {
    mood: matchedPattern.mood,
    emotion: matchedPattern.emotion,
    sentiment: matchedPattern.sentiment,
    moodScore: matchedPattern.score,
    confidence: Math.min(
      0.95,
      0.70 + Math.min(highestMatchCount, 5) * 0.04
    ),
    contexts: Array.from(new Set(detectedContexts)).slice(0, 4),
    keywords: Array.from(
      new Set([
        ...detectedKeywords,
        ...preprocessed.keywords
      ])
    ).slice(0, 10),
    triggers: Array.from(
      new Set(detectedTriggers)
    ).slice(0, 4),
    stressIndicators,
    explanation: {
      summary: buildJournalSpecificSummary(
        matchedPattern,
        originalText,
        hasProjectContext,
        hasRelationshipContext,
        hasSleepContext,
        hasHealthContext
      ),
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

  return localizeMockAnalysis(
    result,
    lang,
    matchedPattern.mood
  );
}

function containsAny(text: string, words: string[]): boolean {
  return words.some((word) =>
    text.includes(word.toLowerCase())
  );
}

function buildJournalSpecificSummary(
  pattern: KeywordPattern,
  rawText: string,
  hasProjectContext: boolean,
  hasRelationshipContext: boolean,
  hasSleepContext: boolean,
  hasHealthContext: boolean
): string {
  const lower = rawText.toLowerCase();

  const isWorry =
    lower.includes('worried') ||
    lower.includes('worry') ||
    lower.includes('worrying') ||
    lower.includes('concerned') ||
    lower.includes('anxious') ||
    lower.includes('nervous');

  if (hasProjectContext && isWorry) {
    return 'Your journal suggests that you were feeling worried or concerned about a project or task. The concern appears connected to that specific responsibility rather than being a general description of your mood.';
  }

  if (hasProjectContext && pattern.sentiment === 'Positive') {
    return 'Your journal describes a positive experience connected to a project, assignment, presentation, or academic task.';
  }

  if (hasRelationshipContext && pattern.sentiment === 'Negative') {
    return 'Your journal suggests that your emotional experience may be connected to a relationship or social situation.';
  }

  if (hasSleepContext && pattern.sentiment === 'Negative') {
    return 'Your journal contains emotional or stress-related language together with sleep or fatigue-related experiences.';
  }

  if (hasHealthContext) {
    return 'Your journal includes a health or physical wellbeing context that appears connected to how you felt.';
  }

  return `Your journal reflects ${pattern.mood.toLowerCase()} feelings in the context of ${pattern.context.toLowerCase()}.`;
}

function localizeMockAnalysis(
  result: AIAnalysisResult,
  lang: SupportedLanguage,
  mood: string
): AIAnalysisResult {
  if (lang === 'en') {
    return result;
  }

  if (lang === 'ta') {
    return {
      ...result,
      stressIndicators:
        result.sentiment === 'Negative'
          ? [
              'பணிச்சுமை அல்லது பொறுப்பு அழுத்தம்',
              'கவலை அல்லது மன அழுத்தம்',
              'சோர்வு அல்லது தூக்கம் தொடர்பான அறிகுறிகள்'
            ]
          : ['குறிப்பிடத்தக்க அழுத்த அறிகுறிகள் இல்லை'],
      explanation: {
        summary: `உங்கள் குறிப்பில் ${mood.toLowerCase()} மனநிலையுடன் தொடர்புடைய சில அம்சங்கள் காணப்படுகின்றன.`,
        explicitMentions: [
          'நீங்கள் குறிப்பிட்ட உணர்வுகள் மற்றும் நிகழ்வுகள் கவனிக்கப்பட்டன.'
        ],
        aiInferences: [
          'உங்கள் வார்த்தைகளின் அடிப்படையில் உணர்ச்சி நிலை புரிந்துகொள்ளப்பட்டது.'
        ],
        bulletPoints: [
          'முக்கியமான உணர்ச்சி வார்த்தைகள் அடையாளம் காணப்பட்டன.',
          'குறிப்பிட்ட சூழல் மற்றும் மனநிலை ஒன்றாகக் கருதப்பட்டது.'
        ]
      },
      suggestions: result.suggestions.map((s, i) => ({
        ...s,
        title:
          i === 0
            ? 'பெரிய பணியை சிறு படிகளாகப் பிரிக்கவும்'
            : i === 1
              ? 'முக்கிய பணிக்கு முன்னுரிமை கொடுக்கவும்'
              : 'சிறிய இடைவெளி எடுத்துக்கொள்ளவும்',
        description:
          i === 0
            ? 'பெரிய பணியை எளிய சிறு படிகளாகப் பிரிக்கவும்.'
            : i === 1
              ? 'மிக முக்கியமான பணியை முதலில் முடிக்க முயற்சிக்கவும்.'
              : 'சிறிது நேரம் இடைவெளி எடுத்து மீண்டும் கவனம் செலுத்துங்கள்.'
      }))
    };
  }

  if (lang === 'hi') {
    return {
      ...result,
      stressIndicators:
        result.sentiment === 'Negative'
          ? ['काम या जिम्मेदारी का दबाव', 'चिंता या तनाव', 'थकान या नींद से जुड़े संकेत']
          : ['स्पष्ट तनाव संकेत नहीं मिले'],
      explanation: {
        summary: `आपकी डायरी में ${mood.toLowerCase()} मनोदशा से जुड़े कुछ संकेत दिखाई देते हैं।`,
        explicitMentions: ['आपके बताए भावनाओं और घटनाओं को देखा गया।'],
        aiInferences: ['आपके शब्दों के आधार पर भावनात्मक स्वर समझा गया।'],
        bulletPoints: [
          'महत्वपूर्ण भावनात्मक शब्दों की पहचान की गई।',
          'संदर्भ और मूड को साथ में देखा गया।'
        ]
      }
    };
  }

  if (lang === 'te') {
    return {
      ...result,
      explanation: {
        summary: `మీ జర్నల్‌లో ${mood} మూడ్‌కు సంబంధించిన కొన్ని సంకేతాలు కనిపిస్తున్నాయి.`,
        explicitMentions: [
          'మీరు చెప్పిన భావాలు మరియు సంఘటనలను పరిగణించాం.'
        ],
        aiInferences: [
          'మీ పదాల ఆధారంగా మొత్తం భావోద్వేగ స్వరాన్ని అర్థం చేసుకున్నాం.'
        ],
        bulletPoints: [
          'ముఖ్యమైన భావోద్వేగ పదాలను గుర్తించాం.',
          'సందర్భం మరియు మూడ్‌ను కలిసి పరిగణించాం.'
        ]
      }
    };
  }

  if (lang === 'kn') {
    return {
      ...result,
      explanation: {
        summary: `ನಿಮ್ಮ ದಿನಚರಿಯಲ್ಲಿ ${mood} ಮನಸ್ಥಿತಿಗೆ ಸಂಬಂಧಿಸಿದ ಕೆಲವು ಸೂಚನೆಗಳು ಕಂಡುಬರುತ್ತವೆ.`,
        explicitMentions: [
          'ನೀವು ಹೇಳಿದ ಭಾವನೆಗಳು ಮತ್ತು ಘಟನೆಗಳನ್ನು ಗಮನಿಸಲಾಗಿದೆ.'
        ],
        aiInferences: [
          'ನಿಮ್ಮ ಪದಗಳ ಆಧಾರದ ಮೇಲೆ ಒಟ್ಟಾರೆ ಭಾವನಾತ್ಮಕ ಧಾಟಿಯನ್ನು ಅರ್ಥಮಾಡಿಕೊಳ್ಳಲಾಗಿದೆ.'
        ],
        bulletPoints: [
          'ಮುಖ್ಯ ಭಾವನಾತ್ಮಕ ಪದಗಳನ್ನು ಗುರುತಿಸಲಾಗಿದೆ.',
          'ಸಂದರ್ಭ ಮತ್ತು ಮೂಡ್ ಅನ್ನು ಒಟ್ಟಿಗೆ ಪರಿಗಣಿಸಲಾಗಿದೆ.'
        ]
      }
    };
  }

  if (lang === 'ml') {
    return {
      ...result,
      explanation: {
        summary: `നിങ്ങളുടെ കുറിപ്പിൽ ${mood} മനോഭാവവുമായി ബന്ധപ്പെട്ട ചില സൂചനകൾ കാണുന്നു.`,
        explicitMentions: [
          'നിങ്ങൾ പറഞ്ഞ വികാരങ്ങളും സംഭവങ്ങളും പരിഗണിച്ചു.'
        ],
        aiInferences: [
          'നിങ്ങളുടെ വാക്കുകളുടെ അടിസ്ഥാനത്തിൽ മൊത്തത്തിലുള്ള വികാരഭാവം മനസ്സിലാക്കി.'
        ],
        bulletPoints: [
          'പ്രധാന വികാര വാക്കുകൾ കണ്ടെത്തി.',
          'സാഹചര്യവും മൂഡ് സ്കോറും ഒരുമിച്ച് പരിഗണിച്ചു.'
        ]
      }
    };
  }

  if (lang === 'tanglish') {
    return {
      ...result,
      stressIndicators:
        result.sentiment === 'Negative'
          ? [
              'Work or responsibility pressure',
              'Worry or tension',
              'Tiredness or sleep-related language'
            ]
          : ['Major stress markers detect aagala'],
      explanation: {
        summary: `Unga journal-la ${mood.toLowerCase()} mood-ku related-aana signals theriyudhu.`,
        explicitMentions: [
          'Journal-la neenga sonna feelings and events consider pannappattadhu.'
        ],
        aiInferences: [
          'Unga words base panni overall emotional tone interpret pannappattadhu.'
        ],
        bulletPoints: [
          'Important emotional words identify pannappattadhu.',
          'Journal context and mood together-a consider pannappattadhu.'
        ]
      }
    };
  }

  if (lang === 'ur') {
    return {
      ...result,
      stressIndicators:
        result.sentiment === 'Negative'
          ? ['کام یا ذمہ داری کا دباؤ', 'فکر یا تناؤ', 'تھکن یا نیند سے متعلق اشارے']
          : ['واضح دباؤ کے اشارے نہیں ملے'],
      explanation: {
        summary: `آپ کی ڈائری میں ${mood.toLowerCase()} کیفیت سے متعلق کچھ اشارے نظر آتے ہیں۔`,
        explicitMentions: [
          'آپ کے بیان کردہ جذبات اور واقعات کو دیکھا گیا۔'
        ],
        aiInferences: [
          'آپ کے الفاظ کی بنیاد پر مجموعی جذباتی انداز سمجھا گیا۔'
        ],
        bulletPoints: [
          'اہم جذباتی الفاظ کو دیکھا گیا۔',
          'سیاق و سباق اور موڈ کو ساتھ سمجھا گیا۔'
        ]
      }
    };
  }

  return result;
}

function getMultilingualCrisisResponse(
  lang: SupportedLanguage
): string {
  switch (lang) {
    case 'ta':
      return 'நீங்கள் மிகவும் கடினமான சூழலில் இருப்பதை உங்கள் வார்த்தைகள் காட்டுகின்றன. நீங்கள் தனியாக இதை எதிர்கொள்ள வேண்டியதில்லை. உங்களுக்கு ஆதரவாக இருக்க மனிதர்கள் உள்ளனர்.';

    case 'hi':
      return 'लगता है कि आप बहुत कठिन समय से गुजर रहे हैं। आपको इसका अकेले सामना करने की ज़रूरत नहीं है। कृपया किसी भरोसेमंद व्यक्ति या हेल्पलाइन से बात करें।';

    case 'ml':
      return 'നിങ്ങൾ വളരെ ബുദ്ധിമുട്ടുള്ള ഒരു സാഹചര്യത്തിലൂടെയാണ് കടന്നുപോകുന്നതെന്ന് തോന്നുന്നു. നിങ്ങൾ ഒറ്റയ്ക്കല്ല, സഹായം ലഭ്യമാണ്.';

    case 'te':
      return 'మీరు చాలా కష్టమైన సమయాన్ని ఎదుర్కొంటున్నట్లు అనిపിക്കുന്നു. మీరు ఒంటరిగా ఉండాల్సిన అవసరం లేదు.';

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
  let responseText = '';
  let followUp = '';

  let suggestions: Array<{
    title: string;
    description: string;
    category: string;
  }> = [];

  const lower = rawText.toLowerCase();

  const hasProject =
    lower.includes('project') ||
    lower.includes('assignment') ||
    lower.includes('presentation') ||
    lower.includes('submission') ||
    lower.includes('deadline') ||
    lower.includes('திட்டம்') ||
    lower.includes('प्रोजेक्ट');

  const hasWorry =
    lower.includes('worried') ||
    lower.includes('worry') ||
    lower.includes('worrying') ||
    lower.includes('concerned') ||
    lower.includes('anxious') ||
    lower.includes('nervous') ||
    lower.includes('கவலை') ||
    lower.includes('चिंता');

  const hasRelationship =
    lower.includes('friend') ||
    lower.includes('family') ||
    lower.includes('parent') ||
    lower.includes('relationship') ||
    lower.includes('நண்பர்') ||
    lower.includes('குடும்பம்');

  const hasSleep =
    lower.includes('sleep') ||
    lower.includes('slept') ||
    lower.includes('tired') ||
    lower.includes('exhausted') ||
    lower.includes('தூக்கம்');

  // ---------------------------------------------------------
  // STRESS / WORRY
  // ---------------------------------------------------------

  if (mood === 'Stressed' || emotion === 'Anxiety') {
    if (hasProject && hasWorry) {
      if (lang === 'ta') {
        responseText =
          'உங்கள் குறிப்பைப் பார்த்தால், உங்கள் திட்டத்தைப் பற்றி நீங்கள் கவலைப்பட்டதாகத் தெரிகிறது. அந்த திட்டம் தொடர்பான பொறுப்பு அல்லது முடிவு குறித்து மனதில் அழுத்தம் இருந்திருக்கலாம்.';
        followUp =
          'உங்கள் திட்டத்தைப் பற்றி உங்களுக்கு அதிகமாக கவலை ஏற்படுத்திய விஷயம் என்ன?';
      } else if (lang === 'tanglish') {
        responseText =
          'Unga journal-la project pathi neenga worried-a irundhadhu clear-a theriyudhu. Project itself or adha complete panna vendiya responsibility dhaan unga mind-la pressure create pannirukkalam.';
        followUp =
          'Project-la exactly endha part dhaan unga mind-ku most worry kuduthuchu?';
      } else if (lang === 'hi') {
        responseText =
          'आपकी डायरी से लगता है कि आप अपने प्रोजेक्ट को लेकर चिंतित थे। प्रोजेक्ट की जिम्मेदारी या उसे पूरा करने को लेकर दबाव महसूस हुआ होगा।';
        followUp =
          'प्रोजेक्ट को लेकर आपको सबसे ज्यादा चिंता किस बात की थी?';
      } else {
        responseText =
          'Your journal suggests that you were worried about your project. The concern appears connected to that specific responsibility rather than simply being a generally stressful day.';
        followUp =
          'What part of the project was causing you the most worry?';
      }
    } else if (lang === 'ta') {
      responseText =
        'உங்கள் குறிப்பில் கவலை மற்றும் அழுத்தம் தொடர்பான உணர்வுகள் தெரிகின்றன. உங்கள் மனதில் இருக்கும் குறிப்பிட்ட காரணத்தை கவனிப்பது உதவியாக இருக்கலாம்.';
      followUp =
        'இப்போது உங்கள் மனதில் அதிகமாக இருக்கும் கவலை எது?';
    } else if (lang === 'hi') {
      responseText =
        'आपकी डायरी में चिंता और तनाव से जुड़े भाव दिखाई देते हैं। आपके मन में सबसे ज्यादा दबाव किस वजह से உள்ளது, அதை पहचानுவது मदद कर सकता है.';
      followUp =
        'अभी आपके मन में सबसे बड़ी चिंता क्या है?';
    } else if (lang === 'tanglish') {
      responseText =
        'Unga journal-la worry and stress related feelings theriyudhu. Exact-a enna concern nu identify pannina adha manageable-a handle panna help aagalam.';
      followUp =
        'Ippo unga mind-la biggest concern enna?';
    } else {
      responseText =
        'Your journal suggests that you are carrying some worry or pressure. Identifying the specific source of that concern may make it easier to work through.';
      followUp =
        'What is the specific thing that is worrying you most right now?';
    }

    suggestions = [
      {
        title: 'Break the problem into smaller steps',
        description:
          hasProject
            ? 'Write down the next one or two concrete actions for the project instead of thinking about the whole task at once.'
            : 'Focus on one small action you can realistically complete next.',
        category: 'mindset'
      },
      {
        title: 'Separate what you can control',
        description:
          'Write down what is within your control today and temporarily set aside what is not.',
        category: 'mindset'
      },
      {
        title: 'Take a short reset',
        description:
          'Step away for a few minutes, breathe slowly, drink some water, and return with a clearer starting point.',
        category: 'general'
      }
    ];
  }

  // ---------------------------------------------------------
  // HAPPY
  // ---------------------------------------------------------

  else if (
    mood === 'Happy' ||
    emotion === 'Joy' ||
    emotion === 'Pride'
  ) {
    if (hasProject) {
      if (lang === 'ta') {
        responseText =
          'உங்கள் குறிப்பில் திட்டம் அல்லது பணியைப் பற்றிய நேர்மறையான உணர்வு தெரிகிறது. நீங்கள் செய்த முன்னேற்றம் உங்களுக்கு மகிழ்ச்சியை அளித்துள்ளது.';
        followUp =
          'இந்த திட்டத்தில் நீங்கள் மிகவும் பெருமைப்படும் விஷயம் எது?';
      } else if (lang === 'tanglish') {
        responseText =
          'Unga journal-la project or work related-aana positive feeling theriyudhu. Neenga achieve pannadhu unga confidence-ku nalla boost kuduthirukku.';
        followUp =
          'Indha project-la neenga most proud-a feel panra part enna?';
      } else {
        responseText =
          'Your journal reflects a positive experience connected to your project or work. It sounds like the progress or result gave you a meaningful sense of achievement.';
        followUp =
          'What part of this achievement are you most proud of?';
      }
    } else if (lang === 'ta') {
      responseText =
        'உங்கள் குறிப்பில் மகிழ்ச்சி மற்றும் நேர்மறையான அனுபவம் தெளிவாக தெரிகிறது. இந்த நல்ல தருணத்தை கவனித்து ரசிப்பது நல்லது.';
      followUp =
        'இன்றைய மகிழ்ச்சியான அனுபவத்தில் உங்களுக்கு மிகவும் பிடித்த பகுதி எது?';
    } else if (lang === 'hi') {
      responseText =
        'आपकी डायरी में सकारात्मक अनुभव और खुशी स्पष्ट दिखाई देती है। इस अच्छे अनुभव को पहचानना महत्वपूर्ण है।';
      followUp =
        'आज के सकारात्मक अनुभव में आपको सबसे अच्छा क्या लगा?';
    } else if (lang === 'tanglish') {
      responseText =
        'Unga journal-la positive feeling and happiness clear-a theriyudhu. Indha good moment-a acknowledge pannradhu useful.';
      followUp =
        'Indha positive experience-la ungalukku romba pidicha part enna?';
    } else {
      responseText =
        'Your journal reflects a positive experience and a sense of progress or achievement. Taking a moment to recognize what went well can help reinforce that experience.';
      followUp =
        'What part of today made you feel happiest or most proud?';
    }

    suggestions = [
      {
        title: 'Celebrate the progress',
        description:
          'Take a moment to recognize what you accomplished instead of immediately moving to the next task.',
        category: 'positive'
      },
      {
        title: 'Remember what worked',
        description:
          'Notice the preparation, effort, or mindset that helped create this positive experience.',
        category: 'positive'
      },
      {
        title: 'Share the good moment',
        description:
          'Consider sharing your positive experience with someone you trust.',
        category: 'general'
      }
    ];
  }

  // ---------------------------------------------------------
  // LOW / SAD
  // ---------------------------------------------------------

  else if (
    mood === 'Low' ||
    emotion === 'Sadness'
  ) {
    if (hasRelationship) {
      if (lang === 'ta') {
        responseText =
          'உங்கள் குறிப்பில் ஒரு உறவு அல்லது நெருக்கமான நபர் தொடர்பான மன அழுத்தம் அல்லது வருத்தம் இருப்பது தெரிகிறது.';
        followUp =
          'அந்த உறவில் உங்களுக்கு மிகவும் கடினமாக இருந்த விஷயம் என்ன?';
      } else if (lang === 'tanglish') {
        responseText =
          'Unga journal-la friend, family, or relationship related-aana emotional difficulty theriyudhu.';
        followUp =
          'Andha relationship situation-la unga mind-ku most difficult-a irundhadhu enna?';
      } else {
        responseText =
          'Your journal suggests that the emotional difficulty may be connected to a relationship or social situation.';
        followUp =
          'What part of that relationship or situation felt hardest for you?';
      }
    } else if (lang === 'ta') {
      responseText =
        'இன்று உங்கள் மனநிலை சற்றே சோர்வாக அல்லது கனமாக இருந்ததாகத் தெரிகிறது. உங்களை குறை கூறாமல் சிறிது நேரம் எடுத்துக்கொள்ளலாம்.';
      followUp =
        'இப்போது உங்களுக்கு சிறிது ஆறுதல் அளிக்கக்கூடிய விஷயம் என்ன?';
    } else if (lang === 'hi') {
      responseText =
        'आपकी डायरी से लगता है कि आज भावनात्मक रूप से थोड़ा भारी महसूस हुआ। खुद पर बहुत कठोर होने की जरूरत नहीं है।';
      followUp =
        'अभी आपको थोड़ा बेहतर महसूस कराने वाली छोटी चीज़ क्या हो सकती है?';
    } else if (lang === 'tanglish') {
      responseText =
        'Unga journal-la today konjam emotionally heavy-a feel pannirukeenga-nu theriyudhu. Self-a judge pannama konjam gentle-a irukkalam.';
      followUp =
        'Ippo konjam better-a feel panna enna small thing help aagum?';
    } else {
      responseText =
        'Your journal sounds emotionally heavy today. You do not need to judge yourself for having a difficult or low-energy day.';
      followUp =
        'What is one small thing that might make the next hour a little easier?';
    }

    suggestions = [
      {
        title: 'Give yourself some gentle space',
        description:
          'Allow yourself to pause without judging your productivity or emotions.',
        category: 'mindset'
      },
      {
        title: 'Do one grounding activity',
        description:
          'Try a short walk, quiet breathing, music, or another simple activity that usually helps you settle.',
        category: 'mindset'
      },
      {
        title: 'Connect with someone you trust',
        description:
          'A short conversation or message can help you feel less alone.',
        category: 'general'
      }
    ];
  }

  // ---------------------------------------------------------
  // CALM / NEUTRAL
  // ---------------------------------------------------------

  else {
    if (hasSleep) {
      if (lang === 'ta') {
        responseText =
          'உங்கள் குறிப்பில் தூக்கம் அல்லது ஓய்வு தொடர்பான அனுபவம் தெரிகிறது. உங்கள் உடல் மற்றும் மனநிலைக்கு ஓய்வு முக்கியமானதாக இருக்கலாம்.';
        followUp =
          'உங்கள் தூக்கம் அல்லது ஓய்வில் இன்று எப்படி இருந்தது?';
      } else if (lang === 'tanglish') {
        responseText =
          'Unga journal-la sleep or rest related experience theriyudhu. Good rest unga overall wellbeing-ku useful-a irukkalam.';
        followUp =
          'Innaikku unga sleep or rest eppadi irundhuchu?';
      } else {
        responseText =
          'Your journal includes sleep or rest-related experiences. Rest can be an important part of maintaining your overall wellbeing.';
        followUp =
          'How did your sleep or rest feel today?';
      }
    } else if (lang === 'ta') {
      responseText =
        'உங்கள் குறிப்பு ஒரு சாதாரண அல்லது சீரான நாளைப் பற்றிய சிந்தனையை காட்டுகிறது. உங்கள் சொந்த உணர்வுகளை கவனிப்பது தொடர்ந்து பயனுள்ளதாக இருக்கும்.';
      followUp =
        'இன்றைய நாளில் உங்களுக்கு முக்கியமாக நினைவில் நிற்கும் விஷயம் எது?';
    } else if (lang === 'tanglish') {
      responseText =
        'Unga journal-la normal and reflective experience theriyudhu. Neenga feel pannadhu enna-nu notice pannradhu useful habit.';
      followUp =
        'Innaikku unga mind-la most important-a remain aana thought enna?';
    } else {
      responseText =
        'Your journal reflects a relatively steady or reflective experience. Paying attention to these everyday thoughts can help you notice patterns over time.';
      followUp =
        'What part of today feels most important to remember?';
    }

    suggestions = [
      {
        title: 'Continue journaling',
        description:
          'Regular short entries can make emotional patterns easier to notice over time.',
        category: 'mindset'
      },
      {
        title: 'Protect your rest',
        description:
          'Keep making space for sleep, breaks, and activities that help you recharge.',
        category: 'sleep'
      },
      {
        title: 'Notice one positive moment',
        description:
          'Before ending the day, identify one thing that went reasonably well.',
        category: 'positive'
      }
    ];
  }

  return {
    responseText,
    followUp,
    suggestions
  };
}