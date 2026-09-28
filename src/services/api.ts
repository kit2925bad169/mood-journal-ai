import {
  User,
  JournalEntry,
  AIAnalysisResult,
  PreprocessedJournal,
  MoodTrendPoint,
  EmotionCount,
  GoalItem,
  ReminderItem,
  SupportTicket,
  ChatMessage,
  SupportedLanguage,
  SupporterProfile,
  SupportRequest,
  SupportMessage
} from '../types.js';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('mood_journal_token');

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({}));

    throw new Error(
      errorBody.error || `Request failed with status ${res.status}`
    );
  }

  return res.json();
}

export const api = {
  // ============================================================
  // AUTH
  // ============================================================

  async login(
    identifier: string,
    pass: string
  ): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: identifier,
        password: pass
      })
    });

    return handleResponse(res);
  },

  async loginSupporter(
    identifier: string,
    pass: string
  ): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/supporter-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        identifier,
        password: pass
      })
    });

    return handleResponse(res);
  },

  async register(data: {
    name: string;
    email: string;
    mobile?: string;
    password: string;
    confirmPassword?: string;
  }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: {
        ...getAuthHeader()
      }
    });

    return handleResponse(res);
  },

  // ============================================================
  // AI ANALYSIS
  // ============================================================

  async analyzeText(
    text: string,
    lang: SupportedLanguage
  ): Promise<{
    preprocessed: PreprocessedJournal;
    analysis: AIAnalysisResult;
  }> {
    const res = await fetch(`${API_BASE}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        text,
        lang
      })
    });

    return handleResponse(res);
  },

  // ============================================================
  // JOURNALS CRUD
  // ============================================================

  async saveJournal(data: {
    text: string;
    input_type: 'text' | 'voice';
    language?: SupportedLanguage;
    analysis?: AIAnalysisResult;
    human_support_requested?: boolean;
    human_support_notes?: string;
  }): Promise<{
    message: string;
    journalId: string;
  }> {
    const res = await fetch(`${API_BASE}/journals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(data)
    });

    return handleResponse(res);
  },

  async getJournals(filters?: {
    mood?: string;
    emotion?: string;
    search?: string;
  }): Promise<{ journals: JournalEntry[] }> {
    const params = new URLSearchParams();

    if (filters?.mood) {
      params.append('mood', filters.mood);
    }

    if (filters?.emotion) {
      params.append('emotion', filters.emotion);
    }

    if (filters?.search) {
      params.append('search', filters.search);
    }

    const res = await fetch(
      `${API_BASE}/journals?${params.toString()}`,
      {
        headers: {
          ...getAuthHeader()
        }
      }
    );

    return handleResponse(res);
  },

  async getJournal(
    id: string
  ): Promise<{ journal: JournalEntry }> {
    const res = await fetch(`${API_BASE}/journals/${id}`, {
      headers: {
        ...getAuthHeader()
      }
    });

    return handleResponse(res);
  },

  async updateJournal(
    id: string,
    text: string,
    lang: SupportedLanguage
  ): Promise<{
    message: string;
    analysis: AIAnalysisResult;
  }> {
    const res = await fetch(`${API_BASE}/journals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        text,
        lang
      })
    });

    return handleResponse(res);
  },

  async deleteJournal(
    id: string
  ): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/journals/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader()
      }
    });

    return handleResponse(res);
  },

  // ============================================================
  // MOOD TRENDS & INSIGHTS
  // ============================================================

  async getMoodTrends(
    range: string = '7d',
    metric: string = 'mood'
  ): Promise<{
    trends: MoodTrendPoint[];
    hasEnoughData: boolean;
    totalCount: number;
  }> {
    const res = await fetch(
      `${API_BASE}/mood-trends?range=${range}&metric=${metric}`,
      {
        headers: {
          ...getAuthHeader()
        }
      }
    );

    return handleResponse(res);
  },

  async getEmotions(): Promise<{
    emotions: EmotionCount[];
    totalEntries: number;
  }> {
    const res = await fetch(`${API_BASE}/emotions`, {
      headers: {
        ...getAuthHeader()
      }
    });

    return handleResponse(res);
  },

  async getInsights(
    lang: SupportedLanguage = 'en'
  ): Promise<{
    totalJournals: number;
    currentMood: {
      mood: string;
      emotion: string;
      score: number;
      summary: string;
    } | null;
    latestInsight: string;
    mostCommonEmotion: string;
    frequentContexts: Array<{
      name: string;
      count: number;
      percentage: number;
    }>;
    frequentTriggers: Array<{
      name: string;
      count: number;
    }>;
    positivePattern: string;
    stressPattern: string;
    sentimentSplit: {
      positive: number;
      negative: number;
      neutral: number;
    };
  }> {
    const res = await fetch(
      `${API_BASE}/insights?lang=${encodeURIComponent(lang)}`,
      {
        headers: {
          ...getAuthHeader()
        }
      }
    );

    return handleResponse(res);
  },

  // ============================================================
  // AI CHATBOT
  // ============================================================

  async sendChatMessage(
    message: string,
    lang: SupportedLanguage
  ): Promise<{
    reply: string;
    createdAt: string;
  }> {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        message,
        lang
      })
    });

    return handleResponse(res);
  },

  async getChatHistory(): Promise<{
    messages: ChatMessage[];
  }> {
    const res = await fetch(`${API_BASE}/chat/history`, {
      headers: {
        ...getAuthHeader()
      }
    });

    return handleResponse(res);
  },

  async clearChatHistory(): Promise<{
    message: string;
  }> {
    const res = await fetch(`${API_BASE}/chat/history`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader()
      }
    });

    return handleResponse(res);
  },

  // ============================================================
  // HUMAN SUPPORT
  // ============================================================

  async getSupporters(): Promise<{
    supporters: SupporterProfile[];
  }> {
    const res = await fetch(`${API_BASE}/supporters`, {
      headers: {
        ...getAuthHeader()
      }
    });

    return handleResponse(res);
  },

  async requestSupport(
    supporterId: string,
    journalId?: string,
    notes?: string
  ): Promise<{
    message: string;
    request: SupportRequest;
  }> {
    const res = await fetch(`${API_BASE}/support/request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        supporterId,
        journalId,
        notes
      })
    });

    return handleResponse(res);
  },

  async getSupportRequests(): Promise<{
    requests: SupportRequest[];
  }> {
    const res = await fetch(`${API_BASE}/support/requests`, {
      headers: {
        ...getAuthHeader()
      }
    });

    return handleResponse(res);
  },

  async getSupportStatus(): Promise<{
    hasActiveRequest: boolean;
    supporter: any;
    requests: SupportRequest[];
  }> {
    const res = await fetch(`${API_BASE}/support/status`, {
      headers: {
        ...getAuthHeader()
      }
    });

    return handleResponse(res);
  },

  async getSupportMessages(
    sessionId: string
  ): Promise<{
    session: any;
    messages: SupportMessage[];
  }> {
    const res = await fetch(
      `${API_BASE}/support/request/${sessionId}/messages`,
      {
        headers: {
          ...getAuthHeader()
        }
      }
    );

    return handleResponse(res);
  },

  async sendSupportMessage(
    sessionId: string,
    message: string
  ): Promise<{
    message: SupportMessage;
  }> {
    const res = await fetch(
      `${API_BASE}/support/request/${sessionId}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          message
        })
      }
    );

    return handleResponse(res);
  },

  async endSupportSession(
    sessionId: string
  ): Promise<{ message: string }> {
    const res = await fetch(
      `${API_BASE}/support/request/${sessionId}/end`,
      {
        method: 'POST',
        headers: {
          ...getAuthHeader()
        }
      }
    );

    return handleResponse(res);
  },

  async rateSupporter(
    sessionId: string,
    rating: number,
    feedback?: string
  ): Promise<{ message: string }> {
    const res = await fetch(
      `${API_BASE}/support/request/${sessionId}/rating`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          rating,
          feedback
        })
      }
    );

    return handleResponse(res);
  },

  // ============================================================
  // SUPPORTER DASHBOARD
  // ============================================================

  async getSupporterDashboard(): Promise<{
    profile: SupporterProfile;
    requests: any[];
  }> {
    const res = await fetch(
      `${API_BASE}/supporter/dashboard`,
      {
        headers: {
          ...getAuthHeader()
        }
      }
    );

    return handleResponse(res);
  },

  async acceptSupportRequest(
    requestId: string
  ): Promise<{
    message: string;
    sessionId: string;
  }> {
    const res = await fetch(
      `${API_BASE}/supporter/requests/${requestId}/accept`,
      {
        method: 'POST',
        headers: {
          ...getAuthHeader()
        }
      }
    );

    return handleResponse(res);
  },

  async declineSupportRequest(
    requestId: string
  ): Promise<{ message: string }> {
    const res = await fetch(
      `${API_BASE}/supporter/requests/${requestId}/decline`,
      {
        method: 'POST',
        headers: {
          ...getAuthHeader()
        }
      }
    );

    return handleResponse(res);
  },

  async setSupporterAvailability(
    availability: 'Available' | 'Offline'
  ): Promise<{
    message: string;
    availability: string;
  }> {
    const res = await fetch(
      `${API_BASE}/supporter/status`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          availability
        })
      }
    );

    return handleResponse(res);
  },

  async getSupporterRatings(): Promise<{
    ratings: Array<{
      rating: number;
      feedback?: string | null;
      createdAt: string;
    }>;
  }> {
    const res = await fetch(
      `${API_BASE}/supporter/ratings`,
      {
        headers: {
          ...getAuthHeader()
        }
      }
    );

    return handleResponse(res);
  },

  // ============================================================
  // GOALS
  // ============================================================

  async getGoals(): Promise<{
    goals: GoalItem[];
  }> {
    const res = await fetch(`${API_BASE}/goals`, {
      headers: {
        ...getAuthHeader()
      }
    });

    return handleResponse(res);
  },

  async createGoal(
    title: string,
    frequency: string,
    progress: number = 0
  ): Promise<{
    goal: GoalItem;
  }> {
    const res = await fetch(`${API_BASE}/goals`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        title,
        frequency,
        progress
      })
    });

    return handleResponse(res);
  },

  async analyzeJournalAgainstAllGoals(
    journalId: string
  ): Promise<{
    journalId: string;
    analyzed: boolean;
    verifiedGoals: string[];
    results: Array<{
      goalId: string;
      verified: boolean;
      duplicate?: boolean;
      pointsAwarded: number;
      progress?: number;
      reason: string;
      evidence?: string;
    }>;
  }> {
    const res = await fetch(
      `${API_BASE}/goals/analyze-journal`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          journalId
        })
      }
    );

    return handleResponse(res);
  },

  async verifyJournalForGoal(
    goalId: string,
    journalId: string
  ): Promise<{
    verified: boolean;
    duplicate?: boolean;
    pointsAwarded: number;
    progress?: number;
    reason: string;
  }> {
    const res = await fetch(
      `${API_BASE}/goals/${goalId}/check-journal`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader()
        },
        body: JSON.stringify({
          journalId
        })
      }
    );

    return handleResponse(res);
  },

  async getGoalEvidence(
    goalId: string
  ): Promise<{
    evidence: Array<{
      id: string;
      journalId: string;
      points: number;
      reason: string;
      createdAt: string;
      journalPreview: string;
    }>;
  }> {
    const res = await fetch(
      `${API_BASE}/goals/${goalId}/evidence`,
      {
        headers: {
          ...getAuthHeader()
        }
      }
    );

    return handleResponse(res);
  },

  async updateGoal(
    id: string,
    updates: Partial<{
      title: string;
      frequency: string;
      progress: number;
    }>
  ): Promise<void> {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(updates)
    });

    return handleResponse(res);
  },

  async deleteGoal(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/goals/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader()
      }
    });

    return handleResponse(res);
  },

  // ============================================================
  // REMINDERS
  // ============================================================

  async getReminders(): Promise<{
    reminders: ReminderItem[];
  }> {
    const res = await fetch(`${API_BASE}/reminders`, {
      headers: {
        ...getAuthHeader()
      }
    });

    return handleResponse(res);
  },

  async addReminder(
    message: string,
    scheduled_time: string
  ): Promise<{
    reminder: ReminderItem;
  }> {
    const res = await fetch(`${API_BASE}/reminders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        message,
        scheduled_time
      })
    });

    return handleResponse(res);
  },

  async toggleReminder(
    id: string,
    enabled: boolean
  ): Promise<void> {
    const res = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({
        enabled
      })
    });

    return handleResponse(res);
  },

  async deleteReminder(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/reminders/${id}`, {
      method: 'DELETE',
      headers: {
        ...getAuthHeader()
      }
    });

    return handleResponse(res);
  },

  // ============================================================
  // PRIVACY & DATA
  // ============================================================

  async exportData(): Promise<any> {
    const res = await fetch(
      `${API_BASE}/privacy/export`,
      {
        headers: {
          ...getAuthHeader()
        }
      }
    );

    return handleResponse(res);
  },

  async deleteAccount(): Promise<void> {
    const res = await fetch(
      `${API_BASE}/privacy/account`,
      {
        method: 'DELETE',
        headers: {
          ...getAuthHeader()
        }
      }
    );

    return handleResponse(res);
  }
};