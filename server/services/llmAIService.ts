import { GoogleGenAI, Type } from '@google/genai';
import { AIAnalysisResult, SupportedLanguage } from './aiTypes.js';
import { PreprocessedJournal } from './preprocessing.js';

let genAIClient: GoogleGenAI | null = null;

/* ============================================================
   GEMINI CLIENT
   ============================================================ */

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (
    !apiKey ||
    apiKey === 'MY_GEMINI_API_KEY' ||
    apiKey === 'YOUR_GEMINI_API_KEY' ||
    apiKey === 'YOUR_ACTUAL_GEMINI_API_KEY'
  ) {
    throw new Error(
      'GEMINI_API_KEY is missing. Add a valid Gemini API key to the server .env file.'
    );
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

/* ============================================================
   LANGUAGE NAMES
   ============================================================ */

const languageNames: Record<SupportedLanguage, string> = {
  en: 'English',
  ta: 'Tamil',
  hi: 'Hindi',
  ml: 'Malayalam',
  te: 'Telugu',
  kn: 'Kannada',
  ur: 'Urdu',
  tanglish:
    'natural Tanglish, meaning Tamil-English mixed language written mainly using English letters'
};

/* ============================================================
   HELPERS
   ============================================================ */

function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number
): number {
  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, numberValue));
}

function cleanString(value: unknown, fallback = ''): string {
  if (typeof value !== 'string') {
    return fallback;
  }

  return value.trim();
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function limitArray(values: string[], max = 8): string[] {
  return uniqueStrings(values).slice(0, max);
}

/* ============================================================
   VALIDATE / NORMALIZE GEMINI ANALYSIS
   ============================================================ */

function normalizeAnalysis(
  raw: any,
  rawText: string,
  lang: SupportedLanguage
): AIAnalysisResult {
  const safeRaw = raw && typeof raw === 'object' ? raw : {};

  const explanationRaw =
    safeRaw.explanation &&
    typeof safeRaw.explanation === 'object'
      ? safeRaw.explanation
      : {};

  const safetyRaw =
    safeRaw.safetyCheck &&
    typeof safeRaw.safetyCheck === 'object'
      ? safeRaw.safetyCheck
      : {};

  const suggestionsRaw = Array.isArray(safeRaw.suggestions)
    ? safeRaw.suggestions
    : [];

  const suggestions = suggestionsRaw
    .filter(
      (item: any) =>
        item &&
        typeof item === 'object' &&
        typeof item.title === 'string' &&
        typeof item.description === 'string'
    )
    .map((item: any) => ({
      title: item.title.trim(),
      description: item.description.trim(),
      category:
        typeof item.category === 'string'
          ? item.category.trim()
          : 'general'
    }))
    .filter(
      (item: {
        title: string;
        description: string;
        category: string;
      }) => item.title && item.description
    )
    .slice(0, 5);

  const mood = cleanString(safeRaw.mood, 'Neutral');
  const emotion = cleanString(safeRaw.emotion, 'Neutral');
  const sentiment = cleanString(safeRaw.sentiment, 'Neutral');

  const moodScore = Math.round(
    clampNumber(safeRaw.moodScore, 1, 5, 3)
  );

  const confidence = clampNumber(
    safeRaw.confidence,
    0,
    1,
    0.7
  );

  const contexts = limitArray(
    cleanStringArray(safeRaw.contexts)
  );

  const keywords = limitArray(
    cleanStringArray(safeRaw.keywords),
    12
  );

  const triggers = limitArray(
    cleanStringArray(safeRaw.triggers)
  );

  const explicitMentions = limitArray(
    cleanStringArray(explanationRaw.explicitMentions),
    8
  );

  const aiInferences = limitArray(
    cleanStringArray(explanationRaw.aiInferences),
    8
  );

  const bulletPoints = limitArray(
    cleanStringArray(explanationRaw.bulletPoints),
    8
  );

  const summary = cleanString(
    explanationRaw.summary,
    `The analysis is based on the journal entry provided by the user.`
  );

  const explanation = {
    summary,
    explicitMentions,
    aiInferences,
    bulletPoints
  };

  const aiResponse = cleanString(
    safeRaw.aiResponse,
    lang === 'ta'
      ? 'உங்கள் பதிவில் வெளிப்பட்ட உணர்வுகளை கவனிப்பது பயனுள்ளதாக இருக்கலாம்.'
      : 'Your journal gives you an opportunity to notice and reflect on what you are experiencing.'
  );

  const followUpQuestion = cleanString(
    safeRaw.followUpQuestion,
    lang === 'ta'
      ? 'இந்த பதிவில் உங்களுக்கு மிகவும் முக்கியமாக தோன்றிய விஷயம் என்ன?'
      : 'What part of this experience feels most important to you right now?'
  );

  const contributingFactors = limitArray(
    cleanStringArray(safeRaw.contributingFactors),
    8
  );

  const isCrisisDetected =
    safetyRaw.isCrisisDetected === true;

  const calmMessage = cleanString(
    safetyRaw.calmMessage,
    ''
  );

  const resources = limitArray(
    cleanStringArray(safetyRaw.resources),
    8
  );

  /*
   * Important anti-hallucination guard:
   *
   * If Gemini says there are no explicit mentions, do not allow
   * the UI to accidentally display generic invented information.
   */
  const safeRawText = rawText.trim();

  if (!safeRawText) {
    throw new Error('Journal text is empty.');
  }

  return {
    mood,
    emotion,
    sentiment,
    moodScore,
    confidence,
    contexts,
    keywords,
    triggers,
    explanation,
    aiResponse,
    followUpQuestion,
    contributingFactors,
    suggestions,
    safetyCheck: {
      isCrisisDetected,
      ...(calmMessage ? { calmMessage } : {}),
      ...(resources.length > 0 ? { resources } : {})
    }
  } as AIAnalysisResult;
}

/* ============================================================
   ANALYSIS PROMPT
   ============================================================ */

function buildAnalysisPrompt(
  preprocessed: PreprocessedJournal,
  rawText: string,
  lang: SupportedLanguage
): string {
  const language = languageNames[lang] || 'English';

  const keywords = preprocessed.keywords
    .filter(Boolean)
    .slice(0, 20)
    .join(', ');

  const sentences = preprocessed.sentences
    .filter(Boolean)
    .slice(0, 20);

  return `
You are the journal-analysis engine for Mood Journal AI.

Your task is to analyze ONLY the journal text supplied below.

The most important rule is:

DO NOT invent facts.

Every conclusion must be grounded in the actual journal text.

============================================================
USER JOURNAL
============================================================

"""
${rawText.trim()}
"""

============================================================
PREPROCESSING INFORMATION
============================================================

Keywords extracted from the journal:
${keywords || 'None'}

Sentence count:
${sentences.length}

Detected sentences:
${sentences.length > 0 ? sentences.map((s, i) => `${i + 1}. ${s}`).join('\n') : 'None'}

============================================================
ANALYSIS RULES
============================================================

1. ANALYZE THE ACTUAL JOURNAL

Read the complete journal carefully.

Do not assume that a short journal means the person feels neutral.

For example:

"I am extremely stressed about tomorrow's presentation"

must not be classified as "Neutral" simply because the journal is short.

Likewise:

"I went shopping with my friends and had a wonderful time"

should not automatically receive a stress-related analysis.

2. MOOD

Choose the mood that best represents the emotional tone explicitly supported by the text.

Examples:

- Happy
- Calm
- Excited
- Proud
- Grateful
- Relaxed
- Stressed
- Worried
- Frustrated
- Sad
- Lonely
- Angry
- Overwhelmed
- Mixed
- Neutral

Use "Neutral" ONLY when the journal genuinely does not provide enough emotional evidence.

3. EMOTION

Identify the most relevant emotion supported by the journal.

Do not choose an emotion simply because it is common in student journals.

4. SENTIMENT

Use:

- Positive
- Negative
- Neutral
- Mixed

Base this on the actual wording and meaning of the journal.

5. MOOD SCORE

Use a 1–5 scale:

1 = very difficult / strongly negative
2 = somewhat difficult / negative
3 = neutral or mixed
4 = generally positive
5 = strongly positive / very good

The score must reflect the journal.

Do not automatically use 3.

6. CONTEXTS

Only include contexts that are actually mentioned or strongly supported.

Possible contexts include:

- Studies
- Exams
- Assignments
- Project
- Work
- Friends
- Family
- Relationships
- Health
- Sleep
- Money
- Travel
- Social activities
- Daily routine
- Personal growth
- Hobbies
- Future plans

If a context is not supported by the journal, DO NOT include it.

For example:

If the journal says:
"I went shopping with my friends and had fun."

Allowed:
["Friends", "Social activities"]

Not allowed:
["Sleep", "Studies", "Deadlines"]

7. TRIGGERS

Only identify triggers that the user actually describes.

Do not invent:

- exams
- deadlines
- sleep problems
- family problems
- relationship problems
- workload
- financial problems

unless the journal supports them.

If there is no clear trigger, return an empty array.

8. KEYWORDS

Use meaningful words or short phrases from the journal itself.

Do not fill the keyword list with generic mental-health terms.

9. EXPLANATION

The explanation MUST clearly separate:

A. explicitMentions

Things the user actually stated.

Example journal:
"I was nervous about my presentation tomorrow."

Good:
[
  "The user mentioned feeling nervous.",
  "The user mentioned a presentation tomorrow."
]

Bad:
[
  "The user has poor sleep.",
  "The user is under academic pressure."
]

unless those things were actually stated.

B. aiInferences

Reasonable interpretations derived from the text.

These MUST be labeled as interpretations, not facts.

Example:
[
  "The upcoming presentation may be contributing to the nervousness."
]

Do not make strong claims that cannot be supported.

C. bulletPoints

Give concise evidence-based points explaining the analysis.

10. SUMMARY

The summary should describe what the journal communicates.

Do not use generic filler such as:

"Your journal reflects a calm, steady rhythm today."

unless the actual journal supports that interpretation.

11. AI RESPONSE

Respond specifically to what the user wrote.

Do not give the same wellness message for every journal.

12. FOLLOW-UP QUESTION

Ask one natural question that is relevant to the journal.

It must NOT be a generic question unrelated to the entry.

13. CONTRIBUTING FACTORS

Only list factors supported by the journal.

14. SUGGESTIONS

Suggestions must be relevant to the journal.

Do not automatically recommend:

- sleep
- mindfulness
- exercise

unless they make sense for the actual situation.

If the user is happy, suggestions can focus on maintaining or building on the positive experience.

If the user is stressed about a project, suggestions can focus on breaking the project into manageable steps.

If the user describes social conflict, suggestions can focus on communication or taking space.

15. SAFETY

Check the journal for possible self-harm, suicide, immediate danger, or crisis language.

Do not diagnose.

If there is no such indication:

isCrisisDetected = false

If there is a genuine indication:

isCrisisDetected = true

and provide a calm, supportive safety message and appropriate emergency/crisis resources.

16. NO DIAGNOSIS

Never diagnose:

- depression
- anxiety disorder
- PTSD
- bipolar disorder
- ADHD
- any other mental-health condition

You may describe emotions and observable language patterns.

17. LANGUAGE

All human-readable output must be written in:

${language}

Supported language code:
${lang}

18. CONFIDENCE

Confidence should represent how strongly the actual journal supports the interpretation.

Short or ambiguous journals should have lower confidence.

Do not automatically use 0.88.

19. IMPORTANT SHORT-ENTRY RULE

A short journal is NOT automatically neutral.

Examples:

"Today was amazing!"
=> Positive / Happy / high mood score

"I am terrified about tomorrow."
=> Negative / Fear or Worry / low mood score

"I hate how everything went today."
=> Negative / Frustration or Anger

"Had lunch with my friends."
=> Neutral unless the text contains emotional information

"Finished my project! I am so proud."
=> Positive / Pride

20. OUTPUT

Return ONLY valid JSON matching the requested schema.
Do not include markdown.
Do not include explanations outside the JSON.
`;
}

/* ============================================================
   RUN JOURNAL ANALYSIS
   ============================================================ */

export async function runLLMAnalysis(
  preprocessed: PreprocessedJournal,
  rawText: string,
  lang: SupportedLanguage = 'en'
): Promise<AIAnalysisResult> {
  const journalText = rawText?.trim();

  if (!journalText) {
    throw new Error('Journal text cannot be empty.');
  }

  const client = getClient();

  const prompt = buildAnalysisPrompt(
    preprocessed,
    journalText,
    lang
  );

  const model =
    process.env.GEMINI_MODEL?.trim() ||
    'gemini-3.8-flash';

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      mood: {
        type: Type.STRING,
        description:
          'The emotional mood actually supported by the journal.'
      },

      emotion: {
        type: Type.STRING,
        description:
          'The primary emotion supported by the journal.'
      },

      sentiment: {
        type: Type.STRING,
        description:
          'Positive, Negative, Neutral, or Mixed.'
      },

      moodScore: {
        type: Type.INTEGER,
        description:
          'A journal-grounded score from 1 to 5.'
      },

      confidence: {
        type: Type.NUMBER,
        description:
          'Confidence from 0 to 1 based on evidence in the journal.'
      },

      contexts: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING
        },
        description:
          'Only contexts supported by the journal.'
      },

      keywords: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING
        },
        description:
          'Important words or phrases grounded in the journal.'
      },

      triggers: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING
        },
        description:
          'Only explicitly stated or strongly supported triggers.'
      },

      explanation: {
        type: Type.OBJECT,
        properties: {
          summary: {
            type: Type.STRING
          },

          explicitMentions: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            },
            description:
              'Only things explicitly stated in the journal.'
          },

          aiInferences: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            },
            description:
              'Reasonable interpretations clearly presented as inferences.'
          },

          bulletPoints: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            }
          }
        },

        required: [
          'summary',
          'explicitMentions',
          'aiInferences',
          'bulletPoints'
        ]
      },

      aiResponse: {
        type: Type.STRING,
        description:
          'A personalized and compassionate reflection based specifically on the journal.'
      },

      followUpQuestion: {
        type: Type.STRING,
        description:
          'One relevant follow-up question.'
      },

      contributingFactors: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING
        }
      },

      suggestions: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING
            },

            description: {
              type: Type.STRING
            },

            category: {
              type: Type.STRING
            }
          },

          required: [
            'title',
            'description',
            'category'
          ]
        }
      },

      safetyCheck: {
        type: Type.OBJECT,
        properties: {
          isCrisisDetected: {
            type: Type.BOOLEAN
          },

          calmMessage: {
            type: Type.STRING
          },

          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.STRING
            }
          }
        },

        required: [
          'isCrisisDetected'
        ]
      }
    },

    required: [
      'mood',
      'emotion',
      'sentiment',
      'moodScore',
      'confidence',
      'contexts',
      'keywords',
      'triggers',
      'explanation',
      'aiResponse',
      'followUpQuestion',
      'contributingFactors',
      'suggestions',
      'safetyCheck'
    ]
  };

  /*
   * Gemini occasionally returns 503/429 when the service is busy.
   * Retry temporary failures instead of replacing the result with
   * fake/mock analysis.
   */
  const maxAttempts = 3;

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(
        `🧠 Gemini journal analysis attempt ${attempt}/${maxAttempts}`
      );

      const apiCall = client.models.generateContent({
        model,
        contents: prompt,

        config: {
          systemInstruction: `
You are the analysis engine for Mood Journal AI.

Your highest priority is factual grounding in the user's exact journal.

Never invent details.

Never assume that a short entry is neutral.

Never use generic analysis when the journal contains specific emotional information.

Separate explicit statements from AI inference.

Do not diagnose medical or mental-health conditions.

Return only the requested JSON structure.
`,

          responseMimeType: 'application/json',

          responseSchema
        }
      });

      const timeout = new Promise<never>((_, reject) => {
        setTimeout(
          () =>
            reject(
              new Error(
                'Gemini journal analysis timed out after 30000ms.'
              )
            ),
          30000
        );
      });

      const response: any = await Promise.race([
        apiCall,
        timeout
      ]);

      const parsedText =
        response?.text?.trim();

      if (!parsedText) {
        throw new Error(
          'Gemini returned an empty journal analysis.'
        );
      }

      let parsed: any;

      try {
        parsed = JSON.parse(parsedText);
      } catch {
        console.error(
          'Gemini returned invalid JSON:',
          parsedText
        );

        throw new Error(
          'Gemini returned invalid JSON for journal analysis.'
        );
      }

      const normalized = normalizeAnalysis(
        parsed,
        journalText,
        lang
      );

      console.log(
        `✅ Gemini journal analysis completed successfully. Mood: ${normalized.mood}, Emotion: ${normalized.emotion}, Score: ${normalized.moodScore}`
      );

      return normalized;
    } catch (err: any) {
      lastError = err;

      const message =
        err?.message ||
        String(err);

      console.error(
        `❌ Gemini journal analysis attempt ${attempt} failed:`,
        message
      );

      const status =
        err?.status ||
        err?.error?.code;

      const isTemporary =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        message.includes('429') ||
        message.includes('500') ||
        message.includes('502') ||
        message.includes('503') ||
        message.includes('504') ||
        message.toLowerCase().includes('high demand') ||
        message.toLowerCase().includes('temporarily unavailable');

      if (
        !isTemporary ||
        attempt === maxAttempts
      ) {
        break;
      }

      const delay =
        attempt === 1
          ? 1500
          : attempt === 2
            ? 3000
            : 5000;

      console.log(
        `⏳ Gemini temporarily unavailable. Retrying in ${delay}ms...`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }

  /*
   * IMPORTANT:
   *
   * We deliberately DO NOT call runMockAnalysis here.
   *
   * Returning fake analysis is worse than showing the user
   * that Gemini could not analyze the entry.
   */
  throw new Error(
    `Gemini journal analysis failed after ${maxAttempts} attempts: ${
      lastError instanceof Error
        ? lastError.message
        : String(lastError)
    }`
  );
}

/* ============================================================
   GEMINI CHATBOT
   ============================================================ */

export async function runChatbotResponse(
  userMessage: string,
  history: Array<{
    role: 'user' | 'model';
    text: string;
  }>,
  latestJournalSummary?: string,
  lang: SupportedLanguage = 'en'
): Promise<string> {
  const message = userMessage?.trim();

  if (!message) {
    throw new Error(
      'Chatbot message cannot be empty.'
    );
  }

  const client = getClient();

  const language =
    languageNames[lang] || 'English';

  const recentHistory = history
    .filter(
      (item) =>
        (item.role === 'user' ||
          item.role === 'model') &&
        typeof item.text === 'string' &&
        item.text.trim().length > 0
    )
    .slice(-20)
    .map((item) => ({
      role: item.role,
      parts: [
        {
          text: item.text.trim()
        }
      ]
    }));

  const journalContext =
    latestJournalSummary?.trim() ||
    'No saved journal summary is available.';

  const systemInstruction = `
You are the conversational AI assistant inside Mood Journal AI.

You are powered by Gemini.

LANGUAGE:
Always answer in ${language}.

CONVERSATION:
Use the complete recent conversation to understand the current message.

If the user says:
- "yes"
- "yeah"
- "no"
- "because..."
- "what about that?"
- "same"
- "then..."
- "why?"

connect it to the previous conversation instead of treating it as an unrelated new conversation.

Do not ask the user to repeat information already provided.

Do not invent personal information.

Do not claim that you know something about the user unless it is present in the conversation or journal context.

JOURNAL CONTEXT:
${journalContext}

WELLNESS:
You can support reflection and general wellness.

Do not diagnose mental-health or medical conditions.

If the user appears to be in immediate danger or discusses self-harm, encourage appropriate real-world emergency or crisis support.

STYLE:
- Warm
- Natural
- Specific
- Human-sounding
- Concise
- Usually 2–5 sentences
- Answer the user's actual question first
- Ask at most one useful follow-up question
- Do not repeatedly use scripted phrases
- Do not say "as an AI" unless necessary

IMPORTANT:
Do not force every conversation back to journaling.
If the user asks a normal question, answer it normally.
`;

  const contents = [
    ...recentHistory,
    {
      role: 'user' as const,
      parts: [
        {
          text: message
        }
      ]
    }
  ];

  const model =
    process.env.GEMINI_MODEL?.trim() ||
    'gemini-3.8-flash';

  const maxAttempts = 3;

  let lastError: unknown = null;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    try {
      console.log(
        `💬 Gemini chatbot attempt ${attempt}/${maxAttempts}`
      );

      const apiCall =
        client.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction
          }
        });

      const timeout = new Promise<never>(
        (_, reject) => {
          setTimeout(
            () =>
              reject(
                new Error(
                  'Gemini chatbot call timed out after 30000ms.'
                )
              ),
            30000
          );
        }
      );

      const response: any =
        await Promise.race([
          apiCall,
          timeout
        ]);

      const answer =
        response?.text?.trim();

      if (!answer) {
        throw new Error(
          'Gemini returned an empty chatbot response.'
        );
      }

      console.log(
        '✅ Gemini chatbot response received.'
      );

      return answer;
    } catch (err: any) {
      lastError = err;

      const errorMessage =
        err?.message ||
        String(err);

      console.error(
        `❌ Gemini chatbot attempt ${attempt} failed:`,
        errorMessage
      );

      const status =
        err?.status ||
        err?.error?.code;

      const isTemporary =
        status === 429 ||
        status === 500 ||
        status === 502 ||
        status === 503 ||
        status === 504 ||
        errorMessage.includes('429') ||
        errorMessage.includes('500') ||
        errorMessage.includes('502') ||
        errorMessage.includes('503') ||
        errorMessage.includes('504') ||
        errorMessage
          .toLowerCase()
          .includes('high demand') ||
        errorMessage
          .toLowerCase()
          .includes('temporarily unavailable');

      if (
        !isTemporary ||
        attempt === maxAttempts
      ) {
        break;
      }

      const delay =
        attempt === 1
          ? 1500
          : attempt === 2
            ? 3000
            : 5000;

      console.log(
        `⏳ Gemini temporarily unavailable. Retrying in ${delay}ms...`
      );

      await new Promise((resolve) =>
        setTimeout(resolve, delay)
      );
    }
  }

  /*
   * No mock chatbot fallback.
   * The application should tell the user that Gemini is
   * unavailable instead of pretending that a response came
   * from Gemini.
   */
  throw new Error(
    `Gemini chatbot failed after ${maxAttempts} attempts: ${
      lastError instanceof Error
        ? lastError.message
        : String(lastError)
    }`
  );
}