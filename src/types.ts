export type SupportedLanguage = 'en' | 'ta' | 'hi' | 'ml' | 'te' | 'kn' | 'ur' | 'tanglish';

export interface User {
  id: string;
  name: string;
  email: string;
  mobile?: string | null;
  created_at?: string;
  role?: 'user' | 'supporter';
}

export interface PreprocessedJournal {
  cleanedText: string;
  sentences: string[];
  keywords: string[];
  wordCount: number;
}

export interface ExplanationData {
  summary: string;
  explicitMentions: string[];
  aiInferences: string[];
  bulletPoints: string[];
}

export interface Suggestion {
  title: string;
  description: string;
  category: string;
}

export interface SafetyCheck {
  isCrisisDetected: boolean;
  calmMessage?: string;
  resources?: string[];
}

export interface AIAnalysisResult {
  mood: string;
  emotion: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  moodScore: number;
  confidence: number;
  contexts: string[];
  keywords: string[];
  triggers: string[];
  stressIndicators: string[];
  explanation: ExplanationData;
  aiResponse: string;
  followUpQuestion: string;
  contributingFactors: string[];
  suggestions: Suggestion[];
  safetyCheck: SafetyCheck;
}

export interface JournalEntry {
  id: string;
  text: string;
  inputType: 'text' | 'voice';
  createdAt: string;
  language?: SupportedLanguage;
  mood: string;
  emotion: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral' | 'Mixed';
  score: number;
  confidence: number;
  contexts: string[];
  keywords: string[];
  triggers: string[];
  explanation: ExplanationData;
  aiResponse: string;
  suggestions: Suggestion[];
}

export interface MoodTrendPoint {
  id: string;
  journalId: string;
  date: string;
  createdAt: string;
  mood: string;
  emotion: string;
  sentiment: string;
  score: number;
  summary: string;
  context: string;
}

export interface EmotionCount {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface GoalItem {
  id: string;
  title: string;
  frequency: string;
  progress: number;
  createdAt: string;
}

export interface ReminderItem {
  id: string;
  message: string;
  enabled: boolean;
  scheduledTime: string;
}

export interface SupportTicket {
  id: string;
  supporterName: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: string;
}


export interface SupporterProfile {
  userId: string;
  supporterId: string;
  name: string;
  title: string;
  bio: string;
  availability: 'Available' | 'Busy' | 'Offline' | string;
  avatarUrl?: string | null;
  averageRating: number;
  ratingCount: number;
}

export interface SupportRequest {
  id: string;
  journalId?: string | null;
  supporterId: string;
  supporterName: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  acceptedAt?: string | null;
  endedAt?: string | null;
  sessionId?: string | null;
  sessionStatus?: string | null;
  rated?: boolean;
}

export interface SupportMessage {
  id: string;
  senderId: string;
  senderRole: 'user' | 'supporter';
  senderName?: string;
  message: string;
  createdAt: string;
}
