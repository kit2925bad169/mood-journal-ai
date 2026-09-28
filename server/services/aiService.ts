import { AIAnalysisResult, SupportedLanguage } from './aiTypes.js';
import {
  preprocessJournal,
  PreprocessedJournal
} from './preprocessing.js';
import { runMockAnalysis } from './mockAIService.js';
import {
  runLLMAnalysis,
  runChatbotResponse
} from './llmAIService.js';

export async function analyzeJournalEntry(
  rawText: string,
  lang: SupportedLanguage = 'en'
): Promise<{
  preprocessed: PreprocessedJournal;
  analysis: AIAnalysisResult;
}> {
  const preprocessed = preprocessJournal(rawText);

  // Temporary debugging logs to verify exactly what reaches the AI.
  console.log(
    '📝 JOURNAL TEXT RECEIVED BY AI:',
    JSON.stringify(rawText)
  );
  console.log(
    '🌐 JOURNAL LANGUAGE:',
    lang
  );

  const aiMode =
    process.env.AI_MODE ||
    (
      process.env.GEMINI_API_KEY &&
      process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' &&
      process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY'
        ? 'llm'
        : 'mock'
    );

  let analysis: AIAnalysisResult;

  if (aiMode === 'llm') {
    // Pass the actual journal text to Gemini.
    analysis = await runLLMAnalysis(
      preprocessed,
      rawText,
      lang
    );
  } else {
    analysis = runMockAnalysis(
      preprocessed,
      rawText,
      lang
    );
  }

  return {
    preprocessed,
    analysis
  };
}

export async function chatWithAI(
  userMessage: string,
  history: Array<{
    role: 'user' | 'model';
    text: string;
  }>,
  latestJournalSummary?: string,
  lang: SupportedLanguage = 'en'
): Promise<string> {
  return runChatbotResponse(
    userMessage,
    history,
    latestJournalSummary,
    lang
  );
}

export * from './aiTypes.js';
export * from './preprocessing.js';