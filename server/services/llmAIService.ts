import { GoogleGenAI } from '@google/genai';
import { AIAnalysisResult, SupportedLanguage } from './aiTypes.js';
import { PreprocessedJournal } from './preprocessing.js';
import { runMockAnalysis } from './mockAIService.js';

let genAIClient: GoogleGenAI | null = null;

const JOURNAL_MODEL = 'gemini-3.6-flash';
const CHAT_MODEL = 'gemini-3.6-flash';

function getClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (
    !apiKey ||
    apiKey === 'MY_GEMINI_API_KEY' ||
    apiKey === 'YOUR_GEMINI_API_KEY' ||
    apiKey === 'YOUR_ACTUAL_GEMINI_API_KEY'
  ) {
    return null;
  }

  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'mood-journal-ai'
        }
      }
    });
  }

  return genAIClient;
}

function cleanJson(text: string): string {
  return text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
}

/**
 * Detect Gemini quota errors.
 *
 * 429 is NOT treated as a temporary retry error.
 * The free quota can remain exhausted for a while, so repeatedly
 * sending requests only creates more failures.
 */
function isQuotaError(error: any): boolean {
  const message = String(
    error?.message ||
      error?.error?.message ||
      error ||
      ''
  ).toLowerCase();

  const code = Number(
    error?.status ||
      error?.error?.code ||
      error?.code ||
      0
  );

  return (
    code === 429 ||
    message.includes('429') ||
    message.includes('resource_exhausted') ||
    message.includes('quota exceeded') ||
    message.includes('quotaexceeded') ||
    message.includes('free_tier_requests') ||
    message.includes('generaterequestsperdayperproject-freetier') ||
    message.includes('rate limit')
  );
}

/**
 * Only these errors should be retried.
 *
 * IMPORTANT:
 * 429 quota errors are intentionally excluded.
 */
function isRetryableGeminiError(error: any): boolean {
  if (isQuotaError(error)) {
    return false;
  }

  const message = String(
    error?.message ||
      error?.error?.message ||
      error ||
      ''
  ).toLowerCase();

  const code = Number(
    error?.status ||
      error?.error?.code ||
      error?.code ||
      0
  );

  return (
    code === 500 ||
    code === 502 ||
    code === 503 ||
    code === 504 ||
    message.includes('500') ||
    message.includes('502') ||
    message.includes('503') ||
    message.includes('504') ||
    message.includes('high demand') ||
    message.includes('temporarily unavailable') ||
    message.includes('service unavailable')
  );
}

function normalizeAnalysis(
  value: any,
  preprocessed: PreprocessedJournal,
  rawText: string,
  lang: SupportedLanguage
): AIAnalysisResult {
  const fallback = runMockAnalysis(
    preprocessed,
    rawText,
    lang
  );

  return {
    ...fallback,
    ...value,

    mood:
      typeof value?.mood === 'string'
        ? value.mood
        : fallback.mood,

    emotion:
      typeof value?.emotion === 'string'
        ? value.emotion
        : fallback.emotion,

    sentiment:
      typeof value?.sentiment === 'string'
        ? value.sentiment
        : fallback.sentiment,

    moodScore:
      Number.isFinite(Number(value?.moodScore))
        ? Math.min(
            5,
            Math.max(1, Number(value.moodScore))
          )
        : fallback.moodScore,

    confidence:
      Number.isFinite(Number(value?.confidence))
        ? Math.min(
            0.99,
            Math.max(0.5, Number(value.confidence))
          )
        : fallback.confidence,

    contexts:
      Array.isArray(value?.contexts)
        ? value.contexts.map(String)
        : fallback.contexts,

    keywords:
      Array.isArray(value?.keywords)
        ? value.keywords.map(String)
        : fallback.keywords,

    triggers:
      Array.isArray(value?.triggers)
        ? value.triggers.map(String)
        : fallback.triggers,

    explanation:
      value?.explanation &&
      typeof value.explanation === 'object'
        ? value.explanation
        : fallback.explanation,

    aiResponse:
      typeof value?.aiResponse === 'string'
        ? value.aiResponse
        : fallback.aiResponse,

    followUpQuestion:
      typeof value?.followUpQuestion === 'string'
        ? value.followUpQuestion
        : fallback.followUpQuestion,

    contributingFactors:
      Array.isArray(value?.contributingFactors)
        ? value.contributingFactors.map(String)
        : fallback.contributingFactors,

    suggestions:
      Array.isArray(value?.suggestions)
        ? value.suggestions
            .filter(
              (item: any) =>
                item &&
                typeof item === 'object'
            )
            .map((item: any) => ({
              title: String(item.title || ''),
              description: String(
                item.description || ''
              ),
              category: String(
                item.category || 'General'
              )
            }))
        : fallback.suggestions,

    safetyCheck:
      value?.safetyCheck &&
      typeof value.safetyCheck === 'object'
        ? {
            isCrisisDetected:
              value.safetyCheck
                .isCrisisDetected === true,

            calmMessage: String(
              value.safetyCheck.calmMessage || ''
            ),

            resources:
              Array.isArray(
                value.safetyCheck.resources
              )
                ? value.safetyCheck.resources.map(
                    String
                  )
                : []
          }
        : fallback.safetyCheck
  } as AIAnalysisResult;
}

/**
 * ---------------------------------------------------------
 * JOURNAL ANALYSIS
 * ---------------------------------------------------------
 */
export async function runLLMAnalysis(
  preprocessed: PreprocessedJournal,
  rawText: string,
  lang: SupportedLanguage = 'en'
): Promise<AIAnalysisResult> {
  const client = getClient();

  /**
   * If Gemini is not configured, immediately use local analysis.
   */
  if (!client) {
    console.warn(
      '⚠️ Gemini is not configured. Using local journal analysis fallback.'
    );

    return runMockAnalysis(
      preprocessed,
      rawText,
      lang
    );
  }

  if (!rawText || !rawText.trim()) {
    console.warn(
      '⚠️ Empty journal received. Using local analysis fallback.'
    );

    return runMockAnalysis(
      preprocessed,
      rawText,
      lang
    );
  }

  const languageNames: Record<
    SupportedLanguage,
    string
  > = {
    en: 'English',
    ta: 'Tamil',
    hi: 'Hindi',
    ml: 'Malayalam',
    te: 'Telugu',
    kn: 'Kannada',
    ur: 'Urdu',
    tanglish:
      'natural Tanglish (Tamil-English mix written with English letters)'
  };

  /**
   * IMPORTANT:
   * rawText is explicitly included here.
   *
   * This prevents the previous bug where "en" was accidentally
   * sent to Gemini instead of the journal text.
   */
  const journalText = rawText.trim();

  const prompt = `You are Mood Journal AI, an empathetic wellness reflection assistant.

Analyze ONLY the journal entry provided below.

Do not analyze the language code.
Do not analyze previous journals.
Do not invent facts.
Do not diagnose medical or mental-health conditions.

Understand:
- English
- Tamil
- Tanglish
- Hindi
- Telugu
- Malayalam
- Kannada
- Urdu
- mixed-language writing

Return all human-readable fields in ${languageNames[lang]}.

IMPORTANT:
- Base the analysis directly on the user's journal.
- Clearly distinguish what the user explicitly said from reasonable interpretation.
- Do not exaggerate emotions.
- Do not diagnose.
- If the journal is short, still analyze the actual meaning.
- Do not describe the journal as generic "daily thoughts" unless that is actually what it says.

JOURNAL ENTRY:

"""
${journalText}
"""

Return ONLY valid JSON using exactly this structure:

{
  "mood": "Happy|Calm|Stressed|Low|Neutral|Mixed",
  "emotion": "short emotion",
  "sentiment": "Positive|Negative|Neutral|Mixed",
  "moodScore": 1,
  "confidence": 0.8,
  "contexts": [],
  "keywords": [],
  "triggers": [],
  "explanation": {
    "summary": "",
    "explicitMentions": [],
    "aiInferences": [],
    "bulletPoints": []
  },
  "aiResponse": "",
  "followUpQuestion": "",
  "contributingFactors": [],
  "suggestions": [
    {
      "title": "",
      "description": "",
      "category": ""
    }
  ],
  "safetyCheck": {
    "isCrisisDetected": false,
    "calmMessage": "",
    "resources": []
  }
}

Rules:
- moodScore must be between 1 and 5.
- confidence must be between 0.50 and 0.99.
- contexts, keywords, triggers, contributingFactors and resources must be arrays.
- If there is no evidence of crisis, isCrisisDetected must be false.
- Do not invent crisis information.
- Keep suggestions practical and relevant to the actual journal.
- The aiResponse must directly acknowledge the user's journal.
- The followUpQuestion should be useful and gentle.
`;

  console.log(
    `📝 Gemini received journal: ${JSON.stringify(journalText)}`
  );

  console.log(
    `🧠 Gemini journal analysis model: ${JOURNAL_MODEL}`
  );

  let lastError: any = null;

  /**
   * Only retry genuine temporary server/model errors.
   *
   * We DO NOT retry 429 quota errors.
   */
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(
        `🧠 Gemini journal analysis attempt ${attempt}/2`
      );

      const response: any =
        await Promise.race([
          client.models.generateContent({
            model: JOURNAL_MODEL,
            contents: prompt,

            config: {
              systemInstruction:
                'Return compact valid JSON only. Be empathetic, factual, specific to the journal, and non-diagnostic.',

              responseMimeType:
                'application/json',

              temperature: 0.4,

              /**
               * Increased from 900 to prevent
               * "Unterminated string in JSON" errors.
               */
              maxOutputTokens: 1800
            }
          }),

          new Promise<never>((_, reject) => {
            setTimeout(
              () =>
                reject(
                  new Error(
                    'Gemini journal analysis timed out after 20000ms.'
                  )
                ),
              20000
            );
          })
        ]);

      const responseText = String(
        response?.text || ''
      ).trim();

      if (!responseText) {
        throw new Error(
          'Gemini returned an empty journal analysis response.'
        );
      }

      const cleaned = cleanJson(
        responseText
      );

      const parsed = JSON.parse(cleaned);

      console.log(
        '✅ Gemini journal analysis response received.'
      );

      return normalizeAnalysis(
        parsed,
        preprocessed,
        journalText,
        lang
      );
    } catch (error: any) {
      lastError = error;

      console.error(
        `❌ Gemini journal analysis attempt ${attempt} failed:`,
        error?.message || error
      );

      /**
       * QUOTA ERROR
       *
       * Immediately use the local fallback.
       */
      if (isQuotaError(error)) {
        console.warn(
          '⚠️ Gemini quota is exhausted. Using local journal analysis fallback.'
        );

        return runMockAnalysis(
          preprocessed,
          journalText,
          lang
        );
      }

      /**
       * Do not retry non-temporary errors.
       */
      if (
        !isRetryableGeminiError(error) ||
        attempt === 2
      ) {
        break;
      }

      console.log(
        '⏳ Gemini temporarily unavailable. Retrying in 4000ms...'
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 4000)
      );
    }
  }

  /**
   * Genuine temporary Gemini failure.
   * Use local analysis instead of breaking the Journal page.
   */
  if (isRetryableGeminiError(lastError)) {
    console.warn(
      '⚠️ Gemini is temporarily unavailable. Using local journal analysis fallback.'
    );

    return runMockAnalysis(
      preprocessed,
      journalText,
      lang
    );
  }

  /**
   * Any other Gemini failure also falls back locally.
   *
   * This means the Journal page remains usable even if
   * Gemini returns an unexpected error.
   */
  console.warn(
    '⚠️ Gemini journal analysis failed. Using local journal analysis fallback.'
  );

  return runMockAnalysis(
    preprocessed,
    journalText,
    lang
  );
}

/**
 * ---------------------------------------------------------
 * CHATBOT
 * ---------------------------------------------------------
 */

function getLocalChatbotFallback(
  userMessage: string,
  latestJournalSummary: string | undefined,
  lang: SupportedLanguage
): string {
  const message =
    userMessage.trim();

  const journal =
    latestJournalSummary?.trim();

  const languageName: Record<
    SupportedLanguage,
    string
  > = {
    en: 'English',
    ta: 'Tamil',
    hi: 'Hindi',
    ml: 'Malayalam',
    te: 'Telugu',
    kn: 'Kannada',
    ur: 'Urdu',
    tanglish:
      'natural Tanglish'
  };

  if (lang === 'ta') {
    return `நான் இப்போது AI சேவையை அணுக முடியாத நிலையில் இருக்கிறேன். ஆனால் நீங்கள் பகிர்ந்த "${message}" என்பதை கவனமாக எடுத்துக்கொள்கிறேன். சிறிது நேரம் கழித்து மீண்டும் முயற்சி செய்யலாம்.`;
  }

  if (lang === 'tanglish') {
    return `Ippo AI service temporarily unavailable. Neenga sonna "${message}" important-aa irukku. Konjam later again try pannunga.`;
  }

  if (lang === 'hi') {
    return `अभी AI सेवा अस्थायी रूप से उपलब्ध नहीं है। आपने जो कहा है — "${message}" — उसे मैं ध्यान में रख रहा हूँ। थोड़ी देर बाद फिर कोशिश करें।`;
  }

  /**
   * English default.
   *
   * We mention the latest journal only when available.
   */
  if (journal) {
    return `I’m temporarily unable to reach Gemini right now, but I’m still here with you. Based on your current message, "${message}", and your recent journal context, it may help to take things one step at a time. Please try the AI conversation again in a little while.`;
  }

  return `I’m temporarily unable to reach Gemini right now, but I’m still here with you. I’ve received your message: "${message}". Please try the AI conversation again in a little while.`;
}

export async function runChatbotResponse(
  userMessage: string,
  history: Array<{
    role: 'user' | 'model';
    text: string;
  }>,
  latestJournalSummary?: string,
  lang: SupportedLanguage = 'en'
): Promise<string> {
  const client = getClient();

  /**
   * If Gemini is not configured, use local fallback.
   */
  if (!client) {
    console.warn(
      '⚠️ Gemini is not configured. Using local chatbot fallback.'
    );

    return getLocalChatbotFallback(
      userMessage,
      latestJournalSummary,
      lang
    );
  }

  const languageName: Record<
    SupportedLanguage,
    string
  > = {
    en: 'English',
    ta: 'Tamil',
    hi: 'Hindi',
    ml: 'Malayalam',
    te: 'Telugu',
    kn: 'Kannada',
    ur: 'Urdu',
    tanglish:
      'natural Tanglish (Tamil-English mix written using English letters)'
  };

  const recentHistory = history
    .filter(
      (message) =>
        (
          message.role === 'user' ||
          message.role === 'model'
        ) &&
        typeof message.text === 'string' &&
        message.text.trim().length > 0
    )
    .slice(-20)
    .map((message) => ({
      role: message.role,
      parts: [
        {
          text: message.text.trim()
        }
      ]
    }));

  const journalContext =
    latestJournalSummary?.trim() ||
    'No saved journal entries are available yet.';

  const systemInstruction = `You are the conversational AI assistant inside Mood Journal AI.

You are powered by Google Gemini.

LANGUAGE:
Always answer in ${languageName[lang]}.

If the user writes in English, respond naturally in English.
If the user writes in Tamil, respond naturally in Tamil.
If the user writes in Tanglish, respond naturally in Tanglish.
Do not unnecessarily switch languages.

CONVERSATION:
- Use the entire conversation history.
- Remember what the user has already told you.
- Understand follow-up messages.
- Connect follow-up messages with previous messages.
- Never ask the user to repeat information already available.
- Do not treat every message as a completely new conversation.
- Do not repeatedly say "You said".
- Do not use canned or scripted responses.
- Do not invent facts about the user.

NATURAL CONVERSATION:
- Respond directly to the user's actual message.
- Be warm, empathetic and conversational.
- Acknowledge emotions naturally.
- Give practical suggestions when appropriate.
- Ask at most one useful follow-up question when genuinely helpful.
- Do not force every conversation back to journaling.
- If the user asks a normal question, answer it normally.

MOOD JOURNAL:
- Use saved journal context when relevant.
- Discuss moods, emotions, journal entries, patterns and goals.
- Clearly distinguish observations from assumptions.
- Never diagnose medical or mental-health conditions.

SAFETY:
- You are a wellness and self-reflection assistant.
- You are not a doctor or therapist.
- Never diagnose a mental-health or medical condition.
- If the user describes immediate danger or an emergency, encourage them to contact local emergency services or a trusted person who can help immediately.

STYLE:
- Warm.
- Natural.
- Conversational.
- Specific to the user's message.
- Usually 2-5 sentences.
- Avoid repetitive sentence structures.
- Respond directly before asking a question.

SAVED JOURNAL CONTEXT:
${journalContext}`;

  const contents = [
    ...recentHistory,
    {
      role: 'user' as const,
      parts: [
        {
          text: userMessage.trim()
        }
      ]
    }
  ];

  let lastError: any = null;

  /**
   * Chatbot:
   * retry genuine temporary errors,
   * but NEVER retry quota errors.
   */
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      console.log(
        `🤖 Gemini chatbot attempt ${attempt}/2 using ${CHAT_MODEL}...`
      );

      const response: any =
        await Promise.race([
          client.models.generateContent({
            model: CHAT_MODEL,
            contents,

            config: {
              systemInstruction,
              temperature: 0.8,
              maxOutputTokens: 500
            }
          }),

          new Promise<never>((_, reject) => {
            setTimeout(
              () =>
                reject(
                  new Error(
                    'Gemini chatbot timed out after 30000ms.'
                  )
                ),
              30000
            );
          })
        ]);

      const answer = String(
        response?.text || ''
      ).trim();

      if (!answer) {
        throw new Error(
          'Gemini returned an empty chatbot response.'
        );
      }

      console.log(
        '✅ Gemini chatbot response received.'
      );

      return answer;
    } catch (error: any) {
      lastError = error;

      console.error(
        `❌ Gemini chatbot attempt ${attempt} failed:`,
        error?.message || error
      );

      /**
       * QUOTA:
       * Immediately use local fallback.
       */
      if (isQuotaError(error)) {
        console.warn(
          '⚠️ Gemini chatbot quota exhausted. Using local chatbot fallback.'
        );

        return getLocalChatbotFallback(
          userMessage,
          latestJournalSummary,
          lang
        );
      }

      /**
       * Don't retry permanent errors.
       */
      if (
        !isRetryableGeminiError(error) ||
        attempt === 2
      ) {
        break;
      }

      console.log(
        '⏳ Gemini chatbot temporarily unavailable. Retrying in 3000ms...'
      );

      await new Promise((resolve) =>
        setTimeout(resolve, 3000)
      );
    }
  }

  /**
   * Genuine temporary Gemini failure.
   */
  console.warn(
    '⚠️ Gemini chatbot unavailable. Using local chatbot fallback.'
  );

  return getLocalChatbotFallback(
    userMessage,
    latestJournalSummary,
    lang
  );
}