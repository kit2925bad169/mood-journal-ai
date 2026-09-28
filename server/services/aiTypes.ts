export interface AIAnalysisResult {
  mood: string; // e.g. 'Stressed', 'Calm', 'Happy', 'Low', 'Neutral'
  emotion: string; // e.g. 'Anxiety', 'Joy', 'Frustration', 'Stress', 'Sadness', 'Peace', 'Pride'
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  moodScore: number; // Scale 1 (Very Low) to 5 (Very Good)
  confidence: number; // 0.0 - 1.0 (e.g. 0.89)
  contexts: string[]; // e.g. ['Deadlines', 'Workload', 'Long hours']
  keywords: string[]; // e.g. ['deadlines', 'worked late', 'stressed']
  triggers: string[]; // e.g. ['Deadline pressure', 'Heavy workload']
  stressIndicators: string[]; // e.g. ['Late working hours', 'Task overload']
  explanation: {
    summary: string;
    explicitMentions: string[];
    aiInferences: string[];
    bulletPoints: string[];
  };
  aiResponse: string;
  followUpQuestion: string;
  contributingFactors: string[];
  suggestions: Array<{
    title: string;
    description: string;
    category: string;
  }>;
  safetyCheck: {
    isCrisisDetected: boolean;
    calmMessage?: string;
    resources?: string[];
  };
}

export type SupportedLanguage = 'en' | 'ta' | 'hi' | 'ml' | 'te' | 'kn' | 'ur' | 'tanglish';
