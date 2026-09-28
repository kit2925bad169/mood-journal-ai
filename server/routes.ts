import { Router, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import { getDb, saveDb } from './db.js';
import {
  AuthRequest,
  requireAuth,
  hashPassword,
  comparePassword,
  generateToken,
  requireSupporter,
} from './auth.js';
import { analyzeJournalEntry, chatWithAI, SupportedLanguage } from './services/aiService.js';
import { supabase } from './supabase.js';

export const apiRouter = Router();

type AllGoalVerificationResult = {
  goalId: string;
  verified: boolean;
  reason: string;
  evidence: string;
};

async function verifyAllGoalsWithGemini(
  goals: Array<{ id: string; title: string }>,
  journalText: string
): Promise<AllGoalVerificationResult[]> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (
    !apiKey ||
    apiKey === 'MY_GEMINI_API_KEY' ||
    apiKey === 'YOUR_GEMINI_API_KEY' ||
    apiKey === 'YOUR_ACTUAL_GEMINI_API_KEY'
  ) {
    throw new Error('Gemini API key is missing or invalid.');
  }

  if (!journalText.trim()) {
    throw new Error('The selected journal is empty.');
  }

  const genAI = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'mood-journal-ai'
      }
    }
  });

  const model = process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash';

  const goalList = goals
    .map((goal) => `${goal.id} | ${goal.title}`)
    .join('\n');

  const prompt = `
You are the goal-evidence evaluator for Mood Journal AI.

Analyze ONLY the SELECTED JOURNAL below.
Do not use any other journal, previous history, memory, or database information.

Evaluate the selected journal against EVERY goal listed below.
Understand the meaning of the journal rather than matching keywords.

IMPORTANT:
- verified=true ONLY when the journal clearly describes a behavior or outcome that actually happened.
- Plans, wishes, intentions, fears, hopes, recommendations, or future actions are NOT evidence.
- A goal keyword appearing in the journal is NOT enough.
- Do not invent missing facts.
- Do not infer an action merely from a positive emotion.
- The journal may be written in English, Tamil, Tanglish, Telugu, Hindi, Urdu, Kannada, Malayalam, or mixed language.
- Interpret the meaning before deciding.
- Ignore unrelated parts of the journal.
- Do not diagnose any medical or mental-health condition.

GOAL RULES:

Reduce Stress:
Verify only when the journal clearly describes actually reducing, relieving, calming, or managing stress, such as a calming activity, relaxation, meditation, breathing, a break, or explicitly saying stress was reduced.

Connect With Others:
Verify only when the journal describes actually meeting, talking with, calling, visiting, spending meaningful time with, or connecting with another person.
Mentioning family/friends or missing them does not count by itself.

Help Others:
Verify only when the journal describes actually helping, supporting, assisting, teaching, comforting, sharing with, or doing something useful for another person.

Explore New Places:
Verify only when the journal describes actually visiting, going to, exploring, discovering, or spending time in a new or unfamiliar place.
Statements such as wanting, planning, or being afraid to explore do not count.

Drink Enough Water:
Verify only when the journal clearly describes actually drinking water, drinking enough water, or staying hydrated through completed hydration behavior.
The phrase "I am hydrated" can count when it clearly describes the user's current completed hydration state, but a future intention such as "I want to drink more water" must not count.

Improve Sleep:
Verify only when the journal clearly describes actually sleeping well, getting enough sleep, sleeping sufficiently, or having restful/good-quality sleep.
Statements about wanting or planning to sleep better do not count.

GOALS:
${goalList}

SELECTED JOURNAL:
${journalText}

Return ONLY valid JSON with this exact shape:
{
  "results": [
    {
      "goalId": "exact goal id",
      "verified": true,
      "reason": "short explanation",
      "evidence": "short evidence from the selected journal"
    }
  ]
}

Return exactly one result for every supplied goal.
Use the exact goalId values supplied above.
`;

  let lastError: unknown = null;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response: any = await Promise.race([
        genAI.models.generateContent({
          model,
          contents: prompt
        }),
        new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error('Gemini goal analysis timed out after 30000ms.')),
            30000
          );
        })
      ]);

      let text = String(response?.text || '').trim();

      if (!text) {
        throw new Error('Gemini returned an empty response.');
      }

      text = text
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      let parsed: any;

      try {
        parsed = JSON.parse(text);
      } catch {
        const start = text.indexOf('{');
        const end = text.lastIndexOf('}');

        if (start < 0 || end <= start) {
          throw new Error(`Gemini returned invalid JSON: ${text.slice(0, 500)}`);
        }

        parsed = JSON.parse(text.slice(start, end + 1));
      }

      const rawResults = Array.isArray(parsed?.results)
        ? parsed.results
        : [];

      return goals.map((goal) => {
        const found = rawResults.find(
          (item: any) => String(item?.goalId) === String(goal.id)
        );

        return {
          goalId: goal.id,
          verified: found?.verified === true,
          reason:
            typeof found?.reason === 'string' && found.reason.trim()
              ? found.reason.trim()
              : 'The selected journal does not clearly verify this goal.',
          evidence:
            typeof found?.evidence === 'string' ? found.evidence.trim() : ''
        };
      });
    } catch (err: any) {
      lastError = err;
      console.error(`Gemini all-goal analysis attempt ${attempt} failed:`, err?.message || err);

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 1500));
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error('Gemini could not analyze the selected journal.');
}

// ==========================================
// GOALS + GEMINI JOURNAL EVIDENCE VERIFICATION
// Persistent Supabase implementation
// ==========================================

apiRouter.get('/goals', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('goals')
      .select('id, title, frequency, progress, created_at')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({
      goals: (data || []).map((goal: any) => ({
        id: goal.id,
        title: goal.title,
        frequency: goal.frequency,
        progress: Number(goal.progress || 0),
        createdAt: goal.created_at
      }))
    });
  } catch (err: any) {
    console.error('Error fetching goals:', err);
    res.status(500).json({
      error: 'Failed to fetch goals',
      details: err?.message || String(err)
    });
  }
});

apiRouter.post('/goals', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { title, frequency = 'Daily', progress = 0 } = req.body;

    if (!title || String(title).trim().length === 0) {
      res.status(400).json({ error: 'Title is required' });
      return;
    }

    const goalId = `goal_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const createdAt = new Date().toISOString();
    const safeProgress = Math.min(100, Math.max(0, Number(progress) || 0));

    const { data, error } = await supabase
      .from('goals')
      .insert({
        id: goalId,
        user_id: req.user!.id,
        title: String(title).trim(),
        frequency: String(frequency),
        progress: safeProgress,
        created_at: createdAt
      })
      .select('id, title, frequency, progress, created_at')
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Goal created',
      goal: {
        id: data.id,
        title: data.title,
        frequency: data.frequency,
        progress: Number(data.progress || 0),
        createdAt: data.created_at
      }
    });
  } catch (err: any) {
    console.error('Error creating goal:', err);
    res.status(500).json({
      error: 'Failed to create goal',
      details: err?.message || String(err)
    });
  }
});

// Analyze ONE selected journal against ALL six goals in ONE Gemini request.
apiRouter.post('/goals/analyze-journal', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const journalId = String(req.body?.journalId || '').trim();

    if (!journalId) {
      res.status(400).json({ error: 'Journal ID is required.' });
      return;
    }

    const [{ data: goals, error: goalsError }, { data: journal, error: journalError }] =
      await Promise.all([
        supabase
          .from('goals')
          .select('id, title, frequency, progress, created_at')
          .eq('user_id', req.user!.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('journals')
          .select('id, text')
          .eq('id', journalId)
          .eq('user_id', req.user!.id)
          .maybeSingle()
      ]);

    if (goalsError) throw goalsError;
    if (journalError) throw journalError;

    if (!journal) {
      res.status(404).json({ error: 'Selected journal was not found.' });
      return;
    }

    const goalRows = (goals || []).map((goal: any) => ({
      id: String(goal.id),
      title: String(goal.title)
    }));

    if (goalRows.length === 0) {
      res.status(400).json({ error: 'No goals are available for this user.' });
      return;
    }

    const journalText = String(journal.text || '').trim();

    if (!journalText) {
      res.status(400).json({ error: 'The selected journal is empty.' });
      return;
    }

    console.log('Analyzing selected journal against goals:', {
      userId: req.user!.id,
      journalId,
      goalCount: goalRows.length
    });

    const verificationResults = await verifyAllGoalsWithGemini(
      goalRows,
      journalText
    );

    const finalResults: any[] = [];
    const verifiedGoals: string[] = [];

    for (const result of verificationResults) {
      const goal = (goals || []).find(
        (item: any) => String(item.id) === String(result.goalId)
      );

      if (!goal) continue;

      const currentProgress = Number(goal.progress || 0);

      // If Gemini says no, do not change progress.
      if (!result.verified) {
        finalResults.push({
          goalId: result.goalId,
          verified: false,
          duplicate: false,
          pointsAwarded: 0,
          progress: currentProgress,
          reason: result.reason,
          evidence: result.evidence
        });
        continue;
      }

      // Same goal + same journal can never award points twice.
      const { data: existingEvidence, error: evidenceLookupError } = await supabase
        .from('goal_evidence')
        .select('id, points, reason, verification_status')
        .eq('goal_id', result.goalId)
        .eq('journal_id', journalId)
        .eq('user_id', req.user!.id)
        .maybeSingle();

      if (evidenceLookupError) throw evidenceLookupError;

      if (existingEvidence) {
        finalResults.push({
          goalId: result.goalId,
          verified: true,
          duplicate: true,
          pointsAwarded: 0,
          progress: currentProgress,
          reason: 'This journal has already been counted for this goal.',
          evidence: result.evidence
        });
        continue;
      }

      const points = 10;
      const newProgress = Math.min(100, currentProgress + points);
      const evidenceId = `evidence_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

      const { error: evidenceInsertError } = await supabase
        .from('goal_evidence')
        .insert({
          id: evidenceId,
          goal_id: result.goalId,
          journal_id: journalId,
          user_id: req.user!.id,
          points,
          reason: result.reason || 'Gemini verified evidence from the selected journal.',
          verification_status: 'verified',
          created_at: new Date().toISOString()
        });

      if (evidenceInsertError) throw evidenceInsertError;

      const { error: goalUpdateError } = await supabase
        .from('goals')
        .update({ progress: newProgress })
        .eq('id', result.goalId)
        .eq('user_id', req.user!.id);

      if (goalUpdateError) throw goalUpdateError;

      verifiedGoals.push(result.goalId);

      finalResults.push({
        goalId: result.goalId,
        verified: true,
        duplicate: false,
        pointsAwarded: points,
        progress: newProgress,
        reason: result.reason,
        evidence: result.evidence
      });
    }

    res.json({
      journalId,
      analyzed: true,
      verifiedGoals,
      results: finalResults
    });
  } catch (err: any) {
    console.error('Gemini all-goal journal analysis error:', err);

    res.status(500).json({
      error: 'Gemini could not analyze the selected journal. Please try again.',
      details: err?.message || String(err)
    });
  }
});

// Backward-compatible endpoint. It still uses Gemini, but analyzes the selected
// goal using the same selected journal and the same evidence rules.
apiRouter.post('/goals/:id/check-journal', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const journalId = String(req.body?.journalId || '').trim();

    if (!journalId) {
      res.status(400).json({ error: 'Journal ID is required for verification.' });
      return;
    }

    const [{ data: goal, error: goalError }, { data: journal, error: journalError }] =
      await Promise.all([
        supabase
          .from('goals')
          .select('id, title, progress')
          .eq('id', req.params.id)
          .eq('user_id', req.user!.id)
          .maybeSingle(),
        supabase
          .from('journals')
          .select('id, text')
          .eq('id', journalId)
          .eq('user_id', req.user!.id)
          .maybeSingle()
      ]);

    if (goalError) throw goalError;
    if (journalError) throw journalError;

    if (!goal) {
      res.status(404).json({ error: 'Goal not found.' });
      return;
    }

    if (!journal) {
      res.status(404).json({ error: 'Journal not found.' });
      return;
    }

    const [verification] = await verifyAllGoalsWithGemini(
      [{ id: String(goal.id), title: String(goal.title) }],
      String(journal.text || '').trim()
    );

    const currentProgress = Number(goal.progress || 0);

    if (!verification.verified) {
      res.json({
        verified: false,
        duplicate: false,
        pointsAwarded: 0,
        progress: currentProgress,
        reason: verification.reason,
        evidence: verification.evidence
      });
      return;
    }

    const { data: existing, error: existingError } = await supabase
      .from('goal_evidence')
      .select('id')
      .eq('goal_id', goal.id)
      .eq('journal_id', journalId)
      .eq('user_id', req.user!.id)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existing) {
      res.json({
        verified: true,
        duplicate: true,
        pointsAwarded: 0,
        progress: currentProgress,
        reason: 'This journal has already been counted for this goal.',
        evidence: verification.evidence
      });
      return;
    }

    const points = 10;
    const newProgress = Math.min(100, currentProgress + points);
    const evidenceId = `evidence_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    const { error: insertError } = await supabase
      .from('goal_evidence')
      .insert({
        id: evidenceId,
        goal_id: goal.id,
        journal_id: journalId,
        user_id: req.user!.id,
        points,
        reason: verification.reason,
        verification_status: 'verified',
        created_at: new Date().toISOString()
      });

    if (insertError) throw insertError;

    const { error: updateError } = await supabase
      .from('goals')
      .update({ progress: newProgress })
      .eq('id', goal.id)
      .eq('user_id', req.user!.id);

    if (updateError) throw updateError;

    res.json({
      verified: true,
      duplicate: false,
      pointsAwarded: points,
      progress: newProgress,
      reason: verification.reason,
      evidence: verification.evidence
    });
  } catch (err: any) {
    console.error('Gemini goal verification error:', err);
    res.status(500).json({
      error: 'Failed to verify journal against goal.',
      details: err?.message || String(err)
    });
  }
});

apiRouter.get('/goals/:id/evidence', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('goal_evidence')
      .select('id, journal_id, points, reason, created_at, verification_status')
      .eq('goal_id', req.params.id)
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const journalIds = (data || []).map((item: any) => item.journal_id);
    let journals: any[] = [];

    if (journalIds.length > 0) {
      const { data: journalRows, error: journalError } = await supabase
        .from('journals')
        .select('id, text')
        .in('id', journalIds)
        .eq('user_id', req.user!.id);

      if (journalError) throw journalError;
      journals = journalRows || [];
    }

    const journalMap = new Map(
      journals.map((journal: any) => [journal.id, journal.text])
    );

    res.json({
      evidence: (data || []).map((item: any) => ({
        id: item.id,
        journalId: item.journal_id,
        points: Number(item.points || 0),
        reason: item.reason,
        createdAt: item.created_at,
        verificationStatus: item.verification_status,
        journalPreview: String(journalMap.get(item.journal_id) || '').slice(0, 120)
      }))
    });
  } catch (err: any) {
    console.error('Error fetching goal evidence:', err);
    res.status(500).json({
      error: 'Failed to fetch goal evidence',
      details: err?.message || String(err)
    });
  }
});

apiRouter.put('/goals/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const updates: Record<string, any> = {};

    if (req.body?.title !== undefined) {
      updates.title = String(req.body.title).trim();
    }

    if (req.body?.frequency !== undefined) {
      updates.frequency = String(req.body.frequency);
    }

    if (req.body?.progress !== undefined) {
      updates.progress = Math.min(100, Math.max(0, Number(req.body.progress) || 0));
    }

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: 'No goal changes were supplied.' });
      return;
    }

    const { error } = await supabase
      .from('goals')
      .update(updates)
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);

    if (error) throw error;

    res.json({ message: 'Goal updated' });
  } catch (err: any) {
    console.error('Error updating goal:', err);
    res.status(500).json({
      error: 'Failed to update goal',
      details: err?.message || String(err)
    });
  }
});

apiRouter.delete('/goals/:id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id);

    if (error) throw error;

    res.json({ message: 'Goal removed' });
  } catch (err: any) {
    console.error('Error deleting goal:', err);
    res.status(500).json({
      error: 'Failed to delete goal',
      details: err?.message || String(err)
    });
  }
});

apiRouter.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Mood Journal AI',
    disclaimer: 'AI insights are for self-reflection and general wellness only. They are not a medical diagnosis or a replacement for professional support.',
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 1. AUTHENTICATION ENDPOINTS
// ==========================================

apiRouter.post('/auth/register', async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, mobile, password, confirmPassword } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      res.status(400).json({ error: 'Passwords do not match' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      res.status(400).json({ error: 'Invalid email format' });
      return;
    }

    const db = await getDb();

    const existing = db.exec(
      `SELECT id FROM users WHERE LOWER(email) = LOWER(?)`,
      [email.trim()]
    );

    if (existing.length > 0 && existing[0].values.length > 0) {
      res.status(409).json({
        error: 'An account with this email already exists'
      });
      return;
    }

    const userId =
      'usr_' +
      Date.now() +
      '_' +
      Math.random().toString(36).substring(2, 7);

    const passwordHash = await hashPassword(password);
    const now = new Date().toISOString();

    db.run(
      `INSERT INTO users
       (id, name, email, mobile, password_hash, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name.trim(),
        email.trim().toLowerCase(),
        mobile ? mobile.trim() : null,
        passwordHash,
        now
      ]
    );

    saveDb(db);

    const token = generateToken({
      id: userId,
      email: email.trim().toLowerCase(),
      name: name.trim()
    });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        mobile
      }
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({
      error: 'Server error during registration'
    });
  }
});

apiRouter.post('/auth/login', async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        error: 'Email / mobile and password are required'
      });
      return;
    }

    const db = await getDb();
    const cleanIdentifier = email.trim().toLowerCase();

    const result = db.exec(
      `SELECT
         u.id,
         u.name,
         u.email,
         u.mobile,
         u.password_hash,
         u.role
       FROM users u
       LEFT JOIN supporter_profiles sp
         ON sp.user_id = u.id
       WHERE LOWER(u.email) = ?
          OR u.mobile = ?
          OR UPPER(COALESCE(sp.supporter_id, '')) = UPPER(?)
       LIMIT 1`,
      [
        cleanIdentifier,
        cleanIdentifier,
        cleanIdentifier
      ]
    );

    if (
      result.length === 0 ||
      result[0].values.length === 0
    ) {
      res.status(401).json({
        error:
          'Invalid credentials. Please check your email and password.'
      });
      return;
    }

    const row = result[0].values[0];

    const user = {
      id: row[0] as string,
      name: row[1] as string,
      email: row[2] as string,
      mobile: row[3] as string | null,
      passwordHash: row[4] as string,
      role:
        (row[5] as 'user' | 'supporter') || 'user'
    };

    const isMatch = await comparePassword(
      password,
      user.passwordHash
    );

    if (!isMatch) {
      res.status(401).json({
        error:
          'Invalid credentials. Please check your email and password.'
      });
      return;
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);

    res.status(500).json({
      error: 'Server error during login'
    });
  }
});

// ============================================================
// SEPARATE HUMAN SUPPORTER LOGIN
// ============================================================

apiRouter.post(
  '/auth/supporter-login',
  async (req: AuthRequest, res: Response) => {
    try {
      const rawIdentifier = String(req.body?.identifier ?? '').trim();
      const rawPassword = String(req.body?.password ?? '');
      const identifier = rawIdentifier.toLowerCase();

      if (!rawIdentifier || !rawPassword) {
        res.status(400).json({
          error: 'Supporter ID/email and password are required'
        });
        return;
      }

      // Demo supporter login is intentionally independent of SQLite.
      // Vercel serverless instances do not provide reliable persistent SQLite storage.
      const validIdentifier =
        identifier === 'hs001' ||
        identifier === 'supporter1@moodjournal.ai';

      const validPassword = rawPassword === 'Supporter123!';

      if (!validIdentifier || !validPassword) {
        res.status(401).json({
          error: 'Invalid supporter credentials.'
        });
        return;
      }

      const token = generateToken({
        id: 'usr_supporter_001',
        email: 'supporter1@moodjournal.ai',
        name: 'Ananya Support',
        role: 'supporter'
      });

      res.json({
        message: 'Supporter login successful',
        token,
        user: {
          id: 'usr_supporter_001',
          name: 'Ananya Support',
          email: 'supporter1@moodjournal.ai',
          mobile: null,
          role: 'supporter'
        }
      });
    } catch (err: any) {
      console.error('Supporter login error:', err);
      res.status(500).json({
        error: 'Server error during supporter login'
      });
    }
  }
);

apiRouter.post('/auth/demo', async (_req: AuthRequest, res: Response) => {
  try {
    const db = await getDb();

    const result = db.exec(
      `SELECT id, name, email, mobile, role
       FROM users
       WHERE email = 'demo@moodjournal.ai'`
    );

    if (
      result.length === 0 ||
      result[0].values.length === 0
    ) {
      res.status(404).json({
        error: 'Demo account not initialized'
      });
      return;
    }

    const row = result[0].values[0];

    const user = {
      id: row[0] as string,
      name: row[1] as string,
      email: row[2] as string,
      mobile: row[3] as string | null,
      role:
        (row[4] as 'user' | 'supporter') ||
        'user'
    };

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    res.json({
      message: 'Demo login successful',
      token,
      user
    });
  } catch (err) {
    res.status(500).json({
      error: 'Demo login failed'
    });
  }
});

apiRouter.get(
  '/auth/me',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = await getDb();

      const result = db.exec(
        `SELECT
           id,
           name,
           email,
           mobile,
           role,
           created_at
         FROM users
         WHERE id = ?`,
        [req.user!.id]
      );

      // On Vercel, the local SQLite file can be recreated between
      // serverless invocations. The JWT is still valid, so do not
      // log the user out just because the SQLite profile is missing.
      if (
        result.length === 0 ||
        result[0].values.length === 0
      ) {
        res.json({
          user: {
            id: req.user!.id,
            name: req.user!.name,
            email: req.user!.email,
            mobile: null,
            role: req.user!.role || 'user',
            created_at: null
          }
        });
        return;
      }

      const row = result[0].values[0];

      res.json({
        user: {
          id: row[0],
          name: row[1],
          email: row[2],
          mobile: row[3],
          role: row[4],
          created_at: row[5]
        }
      });
    } catch (err) {
      // Keep a valid logged-in JWT usable even when SQLite is temporarily
      // unavailable in a serverless invocation.
      res.json({
        user: {
          id: req.user!.id,
          name: req.user!.name,
          email: req.user!.email,
          mobile: null,
          role: req.user!.role || 'user',
          created_at: null
        }
      });
    }
  }
);

apiRouter.post('/auth/logout', (_req, res) => {
  res.json({
    message: 'Logged out successfully'
  });
});

// ==========================================
// 2. AI MOOD ANALYZER ENDPOINTS
// ==========================================

apiRouter.post(
  '/analyze',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        text,
        lang = 'en'
      } = req.body;

      if (
        !text ||
        typeof text !== 'string' ||
        text.trim().length === 0
      ) {
        res.status(400).json({
          error:
            'Journal text is required for analysis'
        });
        return;
      }

      const {
        preprocessed,
        analysis
      } = await analyzeJournalEntry(
        text.trim(),
        lang as SupportedLanguage
      );

      res.json({
        preprocessed,
        analysis
      });
    } catch (err: any) {
      console.error(
        'Analysis error:',
        err
      );

      res.status(500).json({
        error: 'Analysis failed',
        details: err?.message
      });
    }
  }
);

apiRouter.get(
  '/analysis/:journalId',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = await getDb();

      const result = db.exec(
        `SELECT a.*
         FROM analyses a
         JOIN journals j
           ON a.journal_id = j.id
         WHERE a.journal_id = ?
           AND j.user_id = ?`,
        [
          req.params.journalId,
          req.user!.id
        ]
      );

      if (
        result.length === 0 ||
        result[0].values.length === 0
      ) {
        res.status(404).json({
          error: 'Analysis not found'
        });
        return;
      }

      const row = result[0].values[0];
      const columns = result[0].columns;

      const data: Record<string, any> = {};

      columns.forEach((col, idx) => {
        data[col] = row[idx];
      });

      res.json({
        analysis: {
          ...data,
          contexts: JSON.parse(
            data.contexts || '[]'
          ),
          keywords: JSON.parse(
            data.keywords || '[]'
          ),
          triggers: JSON.parse(
            data.triggers || '[]'
          ),
          explanation: JSON.parse(
            data.explanation || '{}'
          ),
          suggestions: JSON.parse(
            data.suggestions || '[]'
          )
        }
      });
    } catch (err) {
      res.status(500).json({
        error: 'Failed to retrieve analysis'
      });
    }
  }
);

// ==========================================
// 3. JOURNALS CRUD
// ==========================================

apiRouter.post(
  '/journals',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        text,
        input_type = 'text',
        language = 'en',
        analysis
      } = req.body;

      if (!text || text.trim().length === 0) {
        res.status(400).json({
          error: 'Journal text cannot be empty'
        });
        return;
      }

      const journalId =
        'jrn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const analysisId =
        'ans_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const historyId =
        'hst_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);

      const now = new Date();
      const dateStr = now.toISOString();
      const shortDate = now.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });

      let finalAnalysis = analysis;

      if (!finalAnalysis) {
        const analyzed = await analyzeJournalEntry(
          text.trim(),
          language as SupportedLanguage
        );
        finalAnalysis = analyzed.analysis;
      }

      const { error: journalError } = await supabase
        .from('journals')
        .insert({
          id: journalId,
          user_id: req.user!.id,
          text: text.trim(),
          input_type,
          language,
          created_at: dateStr
        });

      if (journalError) {
        console.error('Supabase journal insert error:', journalError);
        throw new Error(`Failed to save journal: ${journalError.message}`);
      }

      const { error: analysisError } = await supabase
        .from('analyses')
        .insert({
          id: analysisId,
          journal_id: journalId,
          mood: finalAnalysis.mood || 'Neutral',
          emotion: finalAnalysis.emotion || 'Calm',
          sentiment: finalAnalysis.sentiment || 'Neutral',
          confidence: finalAnalysis.confidence || 0.88,
          contexts: finalAnalysis.contexts || [],
          keywords: finalAnalysis.keywords || [],
          triggers: finalAnalysis.triggers || [],
          explanation: finalAnalysis.explanation || {},
          ai_response: finalAnalysis.aiResponse || '',
          suggestions: finalAnalysis.suggestions || [],
          created_at: dateStr
        });

      if (analysisError) {
        await supabase.from('journals').delete().eq('id', journalId);
        console.error('Supabase analysis insert error:', analysisError);
        throw new Error(`Failed to save analysis: ${analysisError.message}`);
      }

      const { error: historyError } = await supabase
        .from('mood_history')
        .insert({
          id: historyId,
          user_id: req.user!.id,
          journal_id: journalId,
          mood: finalAnalysis.mood || 'Neutral',
          emotion: finalAnalysis.emotion || 'Calm',
          sentiment: finalAnalysis.sentiment || 'Neutral',
          score: finalAnalysis.moodScore || 3,
          summary: text.trim().slice(0, 80) + '...',
          date: shortDate
        });

      if (historyError) {
        await supabase.from('analyses').delete().eq('id', analysisId);
        await supabase.from('journals').delete().eq('id', journalId);
        console.error('Supabase mood history insert error:', historyError);
        throw new Error(`Failed to save mood history: ${historyError.message}`);
      }

      res.status(201).json({
        message: 'Journal saved successfully',
        journalId,
        analysisId
      });
    } catch (err: any) {
      console.error('Error saving journal:', err);
      res.status(500).json({
        error: 'Failed to save journal',
        details: err?.message || 'Unknown error'
      });
    }
  }
);

apiRouter.get(
  '/journals',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { mood, emotion, search } = req.query;

      const { data, error } = await supabase
        .from('journals')
        .select(`
          id,
          user_id,
          text,
          input_type,
          language,
          created_at,
          analyses (
            id,
            mood,
            emotion,
            sentiment,
            confidence,
            contexts,
            keywords,
            triggers,
            explanation,
            ai_response,
            suggestions,
            created_at
          ),
          mood_history (
            id,
            score,
            summary,
            date
          )
        `)
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase journal fetch error:', error);
        throw new Error(error.message);
      }

      let journals = (data || []).map((journal: any) => {
        const analysis = Array.isArray(journal.analyses)
          ? journal.analyses[0]
          : journal.analyses;
        const history = Array.isArray(journal.mood_history)
          ? journal.mood_history[0]
          : journal.mood_history;

        return {
          id: journal.id,
          text: journal.text,
          inputType: journal.input_type || 'text',
          createdAt: journal.created_at,
          language: journal.language || 'en',
          mood: analysis?.mood || 'Neutral',
          emotion: analysis?.emotion || 'Calm',
          sentiment: analysis?.sentiment || 'Neutral',
          score: history?.score || 3,
          confidence: analysis?.confidence || 0.85,
          contexts: analysis?.contexts || [],
          keywords: analysis?.keywords || [],
          triggers: analysis?.triggers || [],
          explanation: analysis?.explanation || {},
          aiResponse: analysis?.ai_response || '',
          suggestions: analysis?.suggestions || []
        };
      });

      if (mood) {
        journals = journals.filter(
          (journal: any) =>
            String(journal.mood).toLowerCase() === String(mood).toLowerCase()
        );
      }

      if (emotion) {
        journals = journals.filter(
          (journal: any) =>
            String(journal.emotion).toLowerCase() === String(emotion).toLowerCase()
        );
      }

      if (search) {
        const searchText = String(search).toLowerCase();
        journals = journals.filter((journal: any) =>
          String(journal.text).toLowerCase().includes(searchText)
        );
      }

      res.json({ journals });
    } catch (err: any) {
      console.error('Error fetching journals:', err);
      res.status(500).json({
        error: 'Failed to fetch journals',
        details: err?.message || 'Unknown error'
      });
    }
  }
);

apiRouter.get(
  '/journals/:id',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('journals')
        .select(`
          id,
          user_id,
          text,
          input_type,
          language,
          created_at,
          analyses (
            id,
            mood,
            emotion,
            sentiment,
            confidence,
            contexts,
            keywords,
            triggers,
            explanation,
            ai_response,
            suggestions,
            created_at
          ),
          mood_history (
            id,
            score,
            summary,
            date
          )
        `)
        .eq('id', req.params.id)
        .eq('user_id', req.user!.id)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        res.status(404).json({ error: 'Journal entry not found' });
        return;
      }

      const analysis = Array.isArray((data as any).analyses)
        ? (data as any).analyses[0]
        : (data as any).analyses;
      const history = Array.isArray((data as any).mood_history)
        ? (data as any).mood_history[0]
        : (data as any).mood_history;

      res.json({
        journal: {
          id: (data as any).id,
          text: (data as any).text,
          inputType: (data as any).input_type || 'text',
          createdAt: (data as any).created_at,
          language: (data as any).language || 'en',
          mood: analysis?.mood || 'Neutral',
          emotion: analysis?.emotion || 'Calm',
          sentiment: analysis?.sentiment || 'Neutral',
          score: history?.score || 3,
          confidence: analysis?.confidence || 0.85,
          contexts: analysis?.contexts || [],
          keywords: analysis?.keywords || [],
          triggers: analysis?.triggers || [],
          explanation: analysis?.explanation || {},
          aiResponse: analysis?.ai_response || '',
          suggestions: analysis?.suggestions || []
        }
      });
    } catch (err: any) {
      console.error('Error fetching journal:', err);
      res.status(500).json({
        error: 'Failed to fetch journal entry',
        details: err?.message || 'Unknown error'
      });
    }
  }
);

apiRouter.put(
  '/journals/:id',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { text, lang = 'en' } = req.body;

      if (!text || text.trim().length === 0) {
        res.status(400).json({ error: 'Text cannot be empty' });
        return;
      }

      const { data: existing, error: existingError } = await supabase
        .from('journals')
        .select('id')
        .eq('id', req.params.id)
        .eq('user_id', req.user!.id)
        .maybeSingle();

      if (existingError) {
        throw new Error(existingError.message);
      }

      if (!existing) {
        res.status(404).json({ error: 'Journal not found' });
        return;
      }

      const { analysis } = await analyzeJournalEntry(
        text.trim(),
        lang as SupportedLanguage
      );

      const { error: journalError } = await supabase
        .from('journals')
        .update({
          text: text.trim(),
          language: lang
        })
        .eq('id', req.params.id)
        .eq('user_id', req.user!.id);

      if (journalError) {
        throw new Error(journalError.message);
      }

      const { error: analysisError } = await supabase
        .from('analyses')
        .update({
          mood: analysis.mood,
          emotion: analysis.emotion,
          sentiment: analysis.sentiment,
          confidence: analysis.confidence,
          contexts: analysis.contexts || [],
          keywords: analysis.keywords || [],
          triggers: analysis.triggers || [],
          explanation: analysis.explanation || {},
          ai_response: analysis.aiResponse || '',
          suggestions: analysis.suggestions || []
        })
        .eq('journal_id', req.params.id);

      if (analysisError) {
        throw new Error(analysisError.message);
      }

      const { error: historyError } = await supabase
        .from('mood_history')
        .update({
          mood: analysis.mood,
          emotion: analysis.emotion,
          sentiment: analysis.sentiment,
          score: analysis.moodScore || 3,
          summary: text.trim().slice(0, 80) + '...'
        })
        .eq('journal_id', req.params.id)
        .eq('user_id', req.user!.id);

      if (historyError) {
        throw new Error(historyError.message);
      }

      res.json({
        message: 'Journal updated successfully',
        analysis
      });
    } catch (err: any) {
      console.error('Error updating journal:', err);
      res.status(500).json({
        error: 'Failed to update journal',
        details: err?.message || 'Unknown error'
      });
    }
  }
);

apiRouter.delete(
  '/journals/:id',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { data: journal, error: findError } = await supabase
        .from('journals')
        .select('id')
        .eq('id', req.params.id)
        .eq('user_id', req.user!.id)
        .maybeSingle();

      if (findError) {
        throw new Error(findError.message);
      }

      if (!journal) {
        res.status(404).json({ error: 'Journal not found' });
        return;
      }

      await supabase
        .from('goal_evidence')
        .delete()
        .eq('journal_id', req.params.id)
        .eq('user_id', req.user!.id);

      const { error: deleteError } = await supabase
        .from('journals')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.user!.id);

      if (deleteError) {
        throw new Error(deleteError.message);
      }

      res.json({
        message: 'Journal deleted successfully'
      });
    } catch (err: any) {
      console.error('Error deleting journal:', err);
      res.status(500).json({
        error: 'Failed to delete journal',
        details: err?.message || 'Unknown error'
      });
    }
  }
);

// ==========================================
// 4. MOOD TRENDS & INSIGHTS
// ==========================================

apiRouter.get(
  '/mood-trends',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        range = '7d',
        metric = 'mood'
      } = req.query;

      const db = await getDb();

      let days = 7;

      if (range === '30d')
        days = 30;
      else if (range === '3m')
        days = 90;
      else if (range === '6m')
        days = 180;
      else if (range === '1y')
        days = 365;

      const cutoffDate =
        new Date(
          Date.now() -
            days * 86400000
        ).toISOString();

      const result = db.exec(
        `SELECT
           h.id,
           h.journal_id,
           h.mood,
           h.emotion,
           h.sentiment,
           h.score,
           h.summary,
           h.date,
           j.created_at,
           a.contexts
         FROM mood_history h
         JOIN journals j
           ON h.journal_id = j.id
         LEFT JOIN analyses a
           ON h.journal_id = a.journal_id
         WHERE h.user_id = ?
           AND j.created_at >= ?
         ORDER BY j.created_at ASC`,
        [
          req.user!.id,
          cutoffDate
        ]
      );

      if (result.length === 0) {
        res.json({
          trends: [],
          hasEnoughData: false,
          totalCount: 0
        });
        return;
      }

      const columns =
        result[0].columns;

      const trends =
        result[0].values.map(
          (row) => {
            const item: Record<
              string,
              any
            > = {};

            columns.forEach(
              (col, idx) => {
                item[col] =
                  row[idx];
              }
            );

            const parsedContexts =
              item.contexts
                ? JSON.parse(
                    item.contexts
                  )
                : [];

            return {
              id: item.id,
              journalId:
                item.journal_id,
              date: item.date,
              createdAt:
                item.created_at,
              language:
                item.language ||
                'en',
              mood: item.mood,
              emotion:
                item.emotion,
              sentiment:
                item.sentiment,
              score: item.score,
              summary:
                item.summary,
              context:
                parsedContexts[0] ||
                'General'
            };
          }
        );

      res.json({
        trends,
        hasEnoughData:
          trends.length >= 2,
        totalCount:
          trends.length
      });
    } catch (err) {
      console.error(
        'Error fetching mood trends:',
        err
      );

      res.status(500).json({
        error:
          'Failed to fetch mood trends'
      });
    }
  }
);

apiRouter.get(
  '/emotions',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = await getDb();

      const result = db.exec(
        `SELECT
           a.emotion,
           COUNT(*) as count
         FROM analyses a
         JOIN journals j
           ON a.journal_id = j.id
         WHERE j.user_id = ?
         GROUP BY a.emotion
         ORDER BY count DESC`,
        [req.user!.id]
      );

      if (
        result.length === 0 ||
        result[0].values.length === 0
      ) {
        res.json({
          emotions: [],
          totalEntries: 0
        });
        return;
      }

      const rows =
        result[0].values;

      const totalEntries =
        rows.reduce(
          (acc, r) =>
            acc + (r[1] as number),
          0
        );

      const colors: Record<
        string,
        string
      > = {
        Anxiety: '#f43f5e',
        Stress: '#f97316',
        Frustration: '#e11d48',
        Sadness: '#6366f1',
        Joy: '#10b981',
        Pride: '#06b6d4',
        Peace: '#3b82f6',
        Calm: '#14b8a6',
        Reflective: '#8b5cf6'
      };

      const emotions =
        rows.map((r) => {
          const name =
            r[0] as string;

          const count =
            r[1] as number;

          const percentage =
            Math.round(
              (count /
                totalEntries) *
                100
            );

          return {
            name,
            count,
            percentage,
            color:
              colors[name] ||
              '#64748b'
          };
        });

      res.json({
        emotions,
        totalEntries
      });
    } catch (err) {
      res.status(500).json({
        error:
          'Failed to fetch emotion distribution'
      });
    }
  }
);

apiRouter.get(
  '/insights',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const lang = String(
        req.query.lang || 'en'
      );

      const db = await getDb();

      const countRes = db.exec(
        `SELECT COUNT(*)
         FROM journals
         WHERE user_id = ?`,
        [req.user!.id]
      );

      const totalJournals =
        countRes.length > 0 &&
        countRes[0].values.length >
          0
          ? (countRes[0]
              .values[0][0] as number)
          : 0;

      if (totalJournals === 0) {
        const empty =
          lang === 'ta'
            ? 'உங்கள் உணர்ச்சி முறைகளை அறிய முதல் குறிப்பை எழுதுங்கள்.'
            : lang === 'hi'
            ? 'अपनी भावनात्मक प्रवृत्तियों को जानने के लिए पहली डायरी लिखें।'
            : lang === 'te'
            ? 'మీ భావోద్వేగ నమూనాలను తెలుసుకోవడానికి మొదటి జర్నల్ రాయండి.'
            : lang === 'kn'
            ? 'ನಿಮ್ಮ ಭಾವನಾತ್ಮಕ ಮಾದರಿಗಳನ್ನು ತಿಳಿಯಲು ಮೊದಲ ದಿನಚರಿ ಬರೆಯಿರಿ.'
            : lang === 'ur'
            ? 'اپنے جذباتی رجحانات کو سمجھنے کے لیے پہلی ڈائری لکھیں۔'
            : lang === 'tanglish'
            ? 'Unga emotional patterns-a purinjukka first journal write pannunga.'
            : 'Start journaling to discover your emotional patterns.';

        res.json({
          totalJournals: 0,
          latestInsight: empty,
          mostCommonEmotion:
            'None yet',
          frequentContexts: [],
          frequentTriggers: [],
          positivePattern: empty,
          stressPattern: empty,
          currentMood: null
        });

        return;
      }

      const latestRes = db.exec(
        `SELECT
           a.mood,
           a.emotion,
           a.sentiment,
           h.score,
           a.contexts,
           a.triggers,
           a.explanation,
           j.created_at
         FROM journals j
         JOIN analyses a
           ON j.id = a.journal_id
         LEFT JOIN mood_history h
           ON j.id = h.journal_id
         WHERE j.user_id = ?
         ORDER BY j.created_at DESC
         LIMIT 1`,
        [req.user!.id]
      );

      let latestMood = 'Calm';
      let latestEmotion = 'Peace';
      let latestScore = 4;
      let latestSummary =
        'Balanced and reflective';

      if (
        latestRes.length > 0 &&
        latestRes[0].values.length >
          0
      ) {
        const row =
          latestRes[0].values[0];

        latestMood =
          row[0] as string;

        latestEmotion =
          row[1] as string;

        latestScore =
          (row[3] as number) || 4;

        try {
          const exp =
            JSON.parse(
              row[6] as string
            );

          latestSummary =
            exp.summary ||
            latestSummary;
        } catch {}
      }

      const allAnalyses =
        db.exec(
          `SELECT
             a.contexts,
             a.triggers,
             a.emotion,
             a.sentiment
           FROM analyses a
           JOIN journals j
             ON a.journal_id = j.id
           WHERE j.user_id = ?`,
          [req.user!.id]
        );

      const contextCounts:
        Record<string, number> =
        {};

      const triggerCounts:
        Record<string, number> =
        {};

      const emotionCounts:
        Record<string, number> =
        {};

      let positiveCount = 0;
      let negativeCount = 0;

      if (
        allAnalyses.length > 0 &&
        allAnalyses[0].values
          .length > 0
      ) {
        for (const r of
          allAnalyses[0].values) {
          try {
            const contexts =
              JSON.parse(
                r[0] as string
              );

            contexts.forEach(
              (c: string) => {
                contextCounts[c] =
                  (contextCounts[c] ||
                    0) + 1;
              }
            );
          } catch {}

          try {
            const triggers =
              JSON.parse(
                r[1] as string
              );

            triggers.forEach(
              (t: string) => {
                triggerCounts[t] =
                  (triggerCounts[t] ||
                    0) + 1;
              }
            );
          } catch {}

          const emotion =
            r[2] as string;

          emotionCounts[emotion] =
            (emotionCounts[emotion] ||
              0) + 1;

          const sentiment =
            r[3] as string;

          if (
            sentiment ===
            'Positive'
          ) {
            positiveCount++;
          } else if (
            sentiment ===
            'Negative'
          ) {
            negativeCount++;
          }
        }
      }

      const frequentContexts =
        Object.entries(
          contextCounts
        )
          .map(
            ([name, count]) => ({
              name,
              count,
              percentage:
                Math.round(
                  (count /
                    totalJournals) *
                    100
                )
            })
          )
          .sort(
            (a, b) =>
              b.count - a.count
          )
          .slice(0, 5);

      const frequentTriggers =
        Object.entries(
          triggerCounts
        )
          .map(
            ([name, count]) => ({
              name,
              count
            })
          )
          .sort(
            (a, b) =>
              b.count - a.count
          )
          .slice(0, 4);

      let topEmotion = 'Calm';
      let maxEmotionCount = 0;

      for (const [
        em,
        count
      ] of Object.entries(
        emotionCounts
      )) {
        if (
          count >
          maxEmotionCount
        ) {
          maxEmotionCount =
            count;

          topEmotion = em;
        }
      }

      let latestInsight =
        'Your mood remained consistently balanced across your recent reflections.';

      if (
        contextCounts[
          'Deadlines'
        ] ||
        contextCounts[
          'Workload & Deadlines'
        ]
      ) {
        latestInsight =
          'Stress appeared frequently during deadline-heavy days. Your mood improved notably after completing planned tasks.';
      } else if (
        positiveCount >
        negativeCount
      ) {
        latestInsight =
          'Positive patterns are strong on days where you prioritize sleep and outdoor movement.';
      }

      const insightText =
        (() => {
          if (lang === 'ta')
            return {
              latest:
                latestInsight.includes(
                  'Stress'
                )
                  ? 'காலக்கெடு அதிகமான நாட்களில் அழுத்தம் அதிகமாக இருந்தது. திட்டமிட்ட பணிகளை முடித்த பிறகு உங்கள் மனநிலை மேம்பட்டது.'
                  : latestInsight.includes(
                      'Positive'
                    )
                  ? 'தூக்கம் மற்றும் வெளிப்புற நடைப்பயிற்சிக்கு முன்னுரிமை கொடுத்த நாட்களில் நேர்மறையான மனநிலை அதிகமாக இருந்தது.'
                  : 'உங்கள் சமீபத்திய குறிப்புகளில் மனநிலை பெரும்பாலும் சமநிலையாக இருந்தது.',
              positive:
                'திட்டமிட்ட பணிகளை முடித்ததும் மற்றும் வெளியில் நேரம் செலவிட்டதும் மனநிலை மேம்பட்டது.',
              stress:
                'தாமதமான வேலை நேரம் மற்றும் பல பணிகளுடன் அதிக அழுத்தம் காணப்பட்டது.'
            };

          if (lang === 'hi')
            return {
              latest:
                latestInsight.includes(
                  'Stress'
                )
                  ? 'समय-सीमा वाले दिनों में तनाव अधिक दिखा और योजनाबद्ध काम पूरा करने के बाद आपका मूड बेहतर हुआ।'
                  : 'आपकी हाल की डायरी में मूड अपेक्षाकृत संतुलित रहा।',
              positive:
                'योजनाबद्ध काम पूरा करने और बाहर समय बिताने के बाद मूड बेहतर दिखा।',
              stress:
                'देर शाम काम और एक साथ कई काम करने पर तनाव अधिक दिखा।'
            };

          if (lang === 'te')
            return {
              latest:
                latestInsight.includes(
                  'Stress'
                )
                  ? 'గడువులు ఎక్కువగా ఉన్న రోజుల్లో ఒత్తిడి కనిపించింది. ప్రణాళిక చేసిన పనులను పూర్తి చేసిన తర్వాత మీ మూడ్ మెరుగుపడింది.'
                  : 'మీ తాజా జర్నల్‌లలో మూడ్ సాధారణంగా సమతుల్యంగా ఉంది.',
              positive:
                'పనులు పూర్తి చేయడం మరియు బయట కొంత సమయం గడపడం తర్వాత మూడ్ మెరుగుపడింది.',
              stress:
                'ఆలస్యంగా పని చేయడం మరియు అనేక పనులు ఒకేసారి చేయడం వల్ల ఒత్తిడి పెరిగింది.'
            };

          if (lang === 'kn')
            return {
              latest:
                latestInsight.includes(
                  'Stress'
                )
                  ? 'ಗಡುವುಗಳಿರುವ ದಿನಗಳಲ್ಲಿ ಒತ್ತಡ ಹೆಚ್ಚಾಗಿತ್ತು. ಯೋಜಿಸಿದ ಕೆಲಸಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ ನಂತರ ನಿಮ್ಮ ಮನಸ್ಥಿತಿ ಉತ್ತಮವಾಯಿತು.'
                  : 'ನಿಮ್ಮ ಇತ್ತೀಚಿನ ದಿನಚರಿಗಳಲ್ಲಿ ಮನಸ್ಥಿತಿ ಸಾಮಾನ್ಯವಾಗಿ ಸಮತೋಲನದಲ್ಲಿತ್ತು.',
              positive:
                'ಯೋಜಿತ ಕೆಲಸಗಳನ್ನು ಪೂರ್ಣಗೊಳಿಸಿದ ನಂತರ ಮತ್ತು ಹೊರಗೆ ಸಮಯ ಕಳೆದ ನಂತರ ಮನಸ್ಥಿತಿ ಉತ್ತಮವಾಯಿತು.',
              stress:
                'ತಡವಾಗಿ ಕೆಲಸ ಮಾಡುವುದು ಮತ್ತು ಅನೇಕ ಕೆಲಸಗಳನ್ನು ಒಂದೇ ಸಮಯದಲ್ಲಿ ಮಾಡುವಾಗ ಒತ್ತಡ ಹೆಚ್ಚಾಯಿತು.'
            };

          if (lang === 'ur')
            return {
              latest:
                latestInsight.includes(
                  'Stress'
                )
                  ? 'آخری تاریخ والے دنوں میں دباؤ زیادہ نظر آیا، جبکہ منصوبہ بند کام مکمل کرنے کے بعد موڈ بہتر ہوا۔'
                  : 'آپ کی حالیہ ڈائری میں موڈ کافی متوازن رہا۔',
              positive:
                'منصوبہ بند کام مکمل کرنے اور باہر وقت گزارنے کے بعد موڈ بہتر نظر آیا۔',
              stress:
                'دیر سے کام کرنے اور ایک ساتھ کئی کام کرنے پر دباؤ زیادہ نظر آیا۔'
            };

          if (
            lang ===
            'tanglish'
          )
            return {
              latest:
                latestInsight.includes(
                  'Stress'
                )
                  ? 'Deadline adhigama irundha days-la stress adhigama irundhuchu. Planned tasks complete pannina apram unga mood improve aayiduchu.'
                  : 'Unga recent journals-la mood mostly balanced-a irundhuchu.',
              positive:
                'Planned tasks complete pannina and konjam outdoor time spend pannina mood better-a irundhuchu.',
              stress:
                'Late evening work and multiple tasks same time-la pannumbodhu stress adhigama irundhuchu.'
            };

          return {
            latest:
              latestInsight,
            positive:
              'Mood improved after completing planned tasks and getting outdoor sunlight.',
            stress:
              'Higher stress indicators correlate with late evening work sessions and multi-tasking.'
          };
        })();

      res.json({
        totalJournals,
        currentMood: {
          mood: latestMood,
          emotion:
            latestEmotion,
          score: latestScore,
          summary:
            latestSummary
        },
        latestInsight:
          insightText.latest,
        mostCommonEmotion:
          topEmotion,
        frequentContexts,
        frequentTriggers,
        positivePattern:
          insightText.positive,
        stressPattern:
          insightText.stress,
        sentimentSplit: {
          positive:
            positiveCount,
          negative:
            negativeCount,
          neutral: Math.max(
            0,
            totalJournals -
              positiveCount -
              negativeCount
          )
        }
      });
    } catch (err) {
      console.error(
        'Error generating insights:',
        err
      );

      res.status(500).json({
        error:
          'Failed to compute insights'
      });
    }
  }
);

// ==========================================
// 5. AI CHATBOT
// ==========================================

apiRouter.post(
  '/chat',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        message,
        lang = 'en'
      } = req.body;

      if (
        !message ||
        message.trim().length === 0
      ) {
        res.status(400).json({
          error:
            'Message cannot be empty'
        });
        return;
      }

      const db = await getDb();

      const recentJournals =
        db.exec(
          `SELECT
             j.text,
             j.created_at,
             a.mood,
             a.emotion,
             a.sentiment,
             a.contexts,
             a.triggers,
             a.ai_response
           FROM journals j
           LEFT JOIN analyses a
             ON j.id = a.journal_id
           WHERE j.user_id = ?
           ORDER BY j.created_at DESC
           LIMIT 8`,
          [req.user!.id]
        );

      let journalSummary:
        | string
        | undefined =
        undefined;

      if (
        recentJournals.length >
          0 &&
        recentJournals[0].values
          .length > 0
      ) {
        journalSummary =
          recentJournals[0].values
            .map(
              (
                r: any,
                index: number
              ) => {
                const text =
                  String(
                    r[0] ?? ''
                  )
                    .replace(
                      /\s+/g,
                      ' '
                    )
                    .slice(
                      0,
                      500
                    );

                return [
                  `Journal ${index + 1} (${r[1]})`,
                  `text: ${text}`,
                  `mood: ${r[2] ?? 'unknown'}`,
                  `emotion: ${r[3] ?? 'unknown'}`,
                  `sentiment: ${r[4] ?? 'unknown'}`,
                  `contexts: ${r[5] ?? ''}`,
                  `triggers: ${r[6] ?? ''}`,
                  `insight: ${String(
                    r[7] ?? ''
                  )
                    .replace(
                      /\s+/g,
                      ' '
                    )
                    .slice(
                      0,
                      300
                    )}`
                ].join(
                  ' | '
                );
              }
            )
            .join('\n');
      }

      const pastChat =
        db.exec(
          `SELECT
             role,
             text
           FROM chat_messages
           WHERE user_id = ?
           ORDER BY created_at DESC
           LIMIT 20`,
          [req.user!.id]
        );

      const history: Array<{
        role:
          | 'user'
          | 'model';
        text: string;
      }> = [];

      if (
        pastChat.length > 0 &&
        pastChat[0].values
          .length > 0
      ) {
        pastChat[0].values
          .reverse()
          .forEach((r) => {
            history.push({
              role:
                r[0] === 'user'
                  ? 'user'
                  : 'model',
              text: r[1] as string
            });
          });
      }

      const now =
        new Date().toISOString();

      const userMsgId =
        'msg_' + Date.now();

      db.run(
        `INSERT INTO chat_messages
         (id, user_id, role, text, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          userMsgId,
          req.user!.id,
          'user',
          message.trim(),
          now
        ]
      );

      const botReply =
        await chatWithAI(
          message.trim(),
          history,
          journalSummary,
          lang as SupportedLanguage
        );

      const botMsgId =
        'msg_' +
        (Date.now() + 1);

      db.run(
        `INSERT INTO chat_messages
         (id, user_id, role, text, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [
          botMsgId,
          req.user!.id,
          'model',
          botReply,
          new Date().toISOString()
        ]
      );

      saveDb(db);

      res.json({
        reply: botReply,
        createdAt:
          new Date().toISOString()
      });
    } catch (err: any) {
      console.error(
        'Chat error:',
        err
      );

      res.status(500).json({
        error:
          'Chat reflection failed',
        details: err?.message
      });
    }
  }
);

apiRouter.get(
  '/chat/history',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = await getDb();

      const result = db.exec(
        `SELECT
           id,
           role,
           text,
           created_at
         FROM chat_messages
         WHERE user_id = ?
         ORDER BY created_at ASC
         LIMIT 40`,
        [req.user!.id]
      );

      if (result.length === 0) {
        res.json({
          messages: []
        });
        return;
      }

      const messages =
        result[0].values.map(
          (r) => ({
            id: r[0],
            role: r[1],
            text: r[2],
            createdAt: r[3]
          })
        );

      res.json({
        messages
      });
    } catch (err) {
      res.status(500).json({
        error:
          'Failed to retrieve chat history'
      });
    }
  }
);

apiRouter.delete(
  '/chat/history',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = await getDb();

      db.run(
        `DELETE FROM chat_messages
         WHERE user_id = ?`,
        [req.user!.id]
      );

      saveDb(db);

      res.json({
        message:
          'Chat history cleared'
      });
    } catch (err) {
      res.status(500).json({
        error:
          'Failed to clear chat history'
      });
    }
  }
);

// ==========================================
// 6. HUMAN SUPPORTER FEATURE
// ==========================================

const SUPPORTER_DISPLAY_NAME = 'Ananya Support';

function supportErrorDetails(error: any): string {
  return error?.message || String(error || 'Unknown Supabase error');
}

apiRouter.get(
  '/supporters',
  requireAuth,
  async (_req: AuthRequest, res: Response) => {
    try {
      const { data: profiles, error } = await supabase
        .from('supporter_profiles')
        .select(
          'user_id,supporter_id,title,bio,availability,avatar_url'
        )
        .order('supporter_id', { ascending: true });

      if (error) throw error;

      const supporterUserIds = (profiles || []).map(
        (p: any) => p.user_id
      );

      let ratingRows: any[] = [];

      if (supporterUserIds.length > 0) {
        const { data, error: ratingError } = await supabase
          .from('support_ratings')
          .select('supporter_id,rating')
          .in('supporter_id', supporterUserIds);

        if (ratingError) throw ratingError;
        ratingRows = data || [];
      }

      const supporters = (profiles || []).map((p: any) => {
        const ratings = ratingRows.filter(
          (r) => r.supporter_id === p.user_id
        );

        const averageRating =
          ratings.length > 0
            ? ratings.reduce(
                (sum, r) => sum + Number(r.rating || 0),
                0
              ) / ratings.length
            : 0;

        return {
          userId: p.user_id,
          supporterId: p.supporter_id,
          name:
            p.supporter_id === 'HS001'
              ? SUPPORTER_DISPLAY_NAME
              : p.title || 'Human Wellness Supporter',
          title: p.title,
          bio: p.bio,
          availability: p.availability,
          avatarUrl: p.avatar_url,
          averageRating,
          ratingCount: ratings.length
        };
      });

      res.json({ supporters });
    } catch (err) {
      console.error('Error fetching supporters:', err);

      res.status(500).json({
        error: 'Failed to fetch supporters',
        details: supportErrorDetails(err)
      });
    }
  }
);

apiRouter.post(
  '/support/request',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        journalId,
        supporterId,
        notes = ''
      } = req.body;

      if (!supporterId) {
        res.status(400).json({
          error: 'Please choose a human supporter'
        });
        return;
      }

      const { data: supporter, error: supporterError } =
        await supabase
          .from('supporter_profiles')
          .select(
            'user_id,supporter_id,title,bio,availability,avatar_url'
          )
          .eq('supporter_id', String(supporterId))
          .maybeSingle();

      if (supporterError) throw supporterError;

      if (!supporter) {
        res.status(404).json({
          error: 'Supporter not found'
        });
        return;
      }

      const availability = String(
        supporter.availability || 'Available'
      );

      if (availability.toLowerCase() === 'offline') {
        res.status(409).json({
          error:
            'This supporter is currently offline. Please choose another supporter.'
        });
        return;
      }

      if (availability.toLowerCase() === 'busy') {
        res.status(409).json({
          error:
            'This supporter is currently in another session. Please choose another available supporter.'
        });
        return;
      }

      const { data: activeRequests, error: activeError } =
        await supabase
          .from('support_requests')
          .select('id')
          .eq('user_id', req.user!.id)
          .eq('supporter_id', supporter.user_id)
          .in('status', ['pending', 'accepted', 'active'])
          .order('created_at', { ascending: false })
          .limit(1);

      if (activeError) throw activeError;

      if (activeRequests && activeRequests.length > 0) {
        res.status(409).json({
          error:
            'You already have an active request with this supporter',
          requestId: activeRequests[0].id
        });
        return;
      }

      const supportId =
        'sup_' +
        Date.now() +
        '_' +
        Math.random().toString(36).slice(2, 7);

      const now = new Date().toISOString();

      const { data: request, error: insertError } =
        await supabase
          .from('support_requests')
          .insert({
            id: supportId,
            user_id: req.user!.id,
            journal_id: journalId || null,
            supporter_name:
              supporter.supporter_id === 'HS001'
                ? SUPPORTER_DISPLAY_NAME
                : supporter.title || 'Human Wellness Supporter',
            supporter_id: supporter.user_id,
            status: 'pending',
            notes: String(notes || '').trim() || null,
            created_at: now
          })
          .select(
            'id,supporter_id,supporter_name,status,created_at'
          )
          .single();

      if (insertError) throw insertError;

      res.status(201).json({
        message:
          'Support request sent to the selected supporter.',
        request: {
          id: request.id,
          supporterId: String(supporterId),
          supporterName: request.supporter_name,
          status: request.status,
          createdAt: request.created_at
        }
      });
    } catch (err: any) {
      console.error('Support request error:', err);

      res.status(500).json({
        error: 'Failed to submit support request',
        details: supportErrorDetails(err)
      });
    }
  }
);

apiRouter.get(
  '/support/requests',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { data: requests, error } = await supabase
        .from('support_requests')
        .select(
          'id,journal_id,supporter_id,supporter_name,status,notes,created_at,accepted_at,ended_at'
        )
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const requestRows = requests || [];
      const requestIds = requestRows.map((r: any) => r.id);

      let sessions: any[] = [];
      let ratings: any[] = [];

      if (requestIds.length > 0) {
        const { data: sessionRows, error: sessionError } =
          await supabase
            .from('support_sessions')
            .select(
              'id,request_id,user_id,supporter_id,status,started_at,ended_at'
            )
            .in('request_id', requestIds);

        if (sessionError) throw sessionError;
        sessions = sessionRows || [];

        const sessionIds = sessions.map((s) => s.id);

        if (sessionIds.length > 0) {
          const { data: ratingRows, error: ratingError } =
            await supabase
              .from('support_ratings')
              .select('session_id')
              .in('session_id', sessionIds);

          if (ratingError) throw ratingError;
          ratings = ratingRows || [];
        }
      }

      const mapped = requestRows.map((r: any) => {
        const session =
          sessions.find((s) => s.request_id === r.id) || null;

        return {
          id: r.id,
          journalId: r.journal_id,
          supporterId: r.supporter_id,
          supporterName: r.supporter_name,
          status: r.status,
          notes: r.notes,
          createdAt: r.created_at,
          acceptedAt: r.accepted_at,
          endedAt: r.ended_at,
          sessionId: session?.id || null,
          sessionStatus: session?.status || null,
          rated: session
            ? ratings.some(
                (rating) => rating.session_id === session.id
              )
            : false
        };
      });

      res.json({
        requests: mapped
      });
    } catch (err) {
      console.error('Error fetching support requests:', err);

      res.status(500).json({
        error: 'Failed to fetch support requests',
        details: supportErrorDetails(err)
      });
    }
  }
);

apiRouter.get(
  '/support/status',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { data: requests, error } = await supabase
        .from('support_requests')
        .select(
          'id,supporter_id,supporter_name,status,notes,created_at,accepted_at,ended_at'
        )
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const rows = requests || [];
      const requestIds = rows.map((r: any) => r.id);

      let sessions: any[] = [];
      let ratings: any[] = [];

      if (requestIds.length > 0) {
        const { data: sessionRows, error: sessionError } =
          await supabase
            .from('support_sessions')
            .select(
              'id,request_id,user_id,supporter_id,status,started_at,ended_at'
            )
            .in('request_id', requestIds);

        if (sessionError) throw sessionError;
        sessions = sessionRows || [];

        const sessionIds = sessions.map((s) => s.id);

        if (sessionIds.length > 0) {
          const { data: ratingRows, error: ratingError } =
            await supabase
              .from('support_ratings')
              .select('session_id')
              .in('session_id', sessionIds);

          if (ratingError) throw ratingError;
          ratings = ratingRows || [];
        }
      }

      const mapped = rows.map((r: any) => {
        const session =
          sessions.find((s) => s.request_id === r.id) || null;

        return {
          id: r.id,
          supporterId: r.supporter_id,
          supporterName: r.supporter_name,
          status: r.status,
          notes: r.notes,
          createdAt: r.created_at,
          sessionId: session?.id || null,
          sessionStatus: session?.status || null,
          rated: session
            ? ratings.some(
                (rating) => rating.session_id === session.id
              )
            : false
        };
      });

      res.json({
        hasActiveRequest: mapped.some((r) =>
          ['pending', 'accepted', 'active'].includes(
            String(r.status)
          )
        ),
        supporter: null,
        requests: mapped
      });
    } catch (err) {
      console.error('Error fetching support status:', err);

      res.status(500).json({
        error: 'Failed to fetch support status',
        details: supportErrorDetails(err)
      });
    }
  }
);

// Supporter dashboard
apiRouter.get(
  '/supporter/dashboard',
  requireAuth,
  requireSupporter,
  async (req: AuthRequest, res: Response) => {
    try {
      const { data: profile, error: profileError } =
        await supabase
          .from('supporter_profiles')
          .select(
            'user_id,supporter_id,title,bio,availability,avatar_url'
          )
          .eq('user_id', req.user!.id)
          .maybeSingle();

      if (profileError) throw profileError;

      if (!profile) {
        res.status(403).json({
          error: 'Supporter account is not configured correctly.'
        });
        return;
      }

      const { data: requests, error: requestError } =
        await supabase
          .from('support_requests')
          .select(
            'id,user_id,journal_id,supporter_id,supporter_name,status,notes,created_at,accepted_at,ended_at'
          )
          .eq('supporter_id', req.user!.id)
          .order('created_at', { ascending: false });

      if (requestError) throw requestError;

      const requestRows = requests || [];
      const requestIds = requestRows.map((r: any) => r.id);

      let sessions: any[] = [];

      if (requestIds.length > 0) {
        const { data: sessionRows, error: sessionError } =
          await supabase
            .from('support_sessions')
            .select(
              'id,request_id,user_id,supporter_id,status,started_at,ended_at'
            )
            .in('request_id', requestIds);

        if (sessionError) throw sessionError;
        sessions = sessionRows || [];
      }

      const mappedRequests = requestRows
        .map((r: any) => {
          const session =
            sessions.find((s) => s.request_id === r.id) || null;

          return {
            id: r.id,
            userId: r.user_id,
            userName:
              r.user_id === req.user!.id
                ? req.user!.name
                : 'Journal User',
            userEmail:
              r.user_id === req.user!.id
                ? req.user!.email
                : null,
            journalId: r.journal_id,
            status: r.status,
            notes: r.notes,
            createdAt: r.created_at,
            sessionId: session?.id || null,
            sessionStatus: session?.status || null
          };
        })
        .sort((a, b) => {
          const order: Record<string, number> = {
            pending: 1,
            accepted: 2,
            active: 3
          };

          return (
            (order[a.status] || 4) -
              (order[b.status] || 4) ||
            String(b.createdAt).localeCompare(
              String(a.createdAt)
            )
          );
        });

      const { data: ratingRows, error: ratingError } =
        await supabase
          .from('support_ratings')
          .select('rating')
          .eq('supporter_id', req.user!.id);

      if (ratingError) throw ratingError;

      const ratingValues = ratingRows || [];

      const averageRating =
        ratingValues.length > 0
          ? ratingValues.reduce(
              (sum, r) => sum + Number(r.rating || 0),
              0
            ) / ratingValues.length
          : 0;

      res.json({
        profile: {
          supporterId: profile.supporter_id,
          title: profile.title,
          bio: profile.bio,
          availability: profile.availability,
          avatarUrl: profile.avatar_url,
          averageRating,
          ratingCount: ratingValues.length
        },
        requests: mappedRequests
      });
    } catch (err) {
      console.error('Supporter dashboard error:', err);

      res.status(500).json({
        error: 'Failed to load supporter dashboard',
        details: supportErrorDetails(err)
      });
    }
  }
);

apiRouter.post(
  '/supporter/requests/:id/accept',
  requireAuth,
  requireSupporter,
  async (req: AuthRequest, res: Response) => {
    try {
      const { data: request, error: requestError } =
        await supabase
          .from('support_requests')
          .select('id,user_id,supporter_id,status')
          .eq('id', req.params.id)
          .eq('supporter_id', req.user!.id)
          .maybeSingle();

      if (requestError) throw requestError;

      if (!request) {
        res.status(404).json({
          error: 'Support request not found'
        });
        return;
      }

      if (request.status !== 'pending') {
        res.status(409).json({
          error: 'This request is no longer pending'
        });
        return;
      }

      const now = new Date().toISOString();

      const sessionId =
        'sess_' +
        Date.now() +
        '_' +
        Math.random().toString(36).slice(2, 7);

      const { error: updateError } = await supabase
        .from('support_requests')
        .update({
          status: 'accepted',
          accepted_at: now
        })
        .eq('id', req.params.id)
        .eq('supporter_id', req.user!.id)
        .eq('status', 'pending');

      if (updateError) throw updateError;

      const { error: sessionError } = await supabase
        .from('support_sessions')
        .insert({
          id: sessionId,
          request_id: req.params.id,
          user_id: request.user_id,
          supporter_id: req.user!.id,
          status: 'active',
          started_at: now
        });

      if (sessionError) throw sessionError;

      const { error: profileError } = await supabase
        .from('supporter_profiles')
        .update({ availability: 'Busy' })
        .eq('user_id', req.user!.id);

      if (profileError) throw profileError;

      res.json({
        message: 'Request accepted',
        sessionId
      });
    } catch (err) {
      console.error('Support accept error:', err);

      res.status(500).json({
        error: 'Failed to accept request',
        details: supportErrorDetails(err)
      });
    }
  }
);

apiRouter.post(
  '/supporter/requests/:id/decline',
  requireAuth,
  requireSupporter,
  async (req: AuthRequest, res: Response) => {
    try {
      const { data: request, error: requestError } =
        await supabase
          .from('support_requests')
          .select('id,status')
          .eq('id', req.params.id)
          .eq('supporter_id', req.user!.id)
          .maybeSingle();

      if (requestError) throw requestError;

      if (!request) {
        res.status(404).json({
          error: 'Support request not found'
        });
        return;
      }

      const { error } = await supabase
        .from('support_requests')
        .update({ status: 'declined' })
        .eq('id', req.params.id)
        .eq('supporter_id', req.user!.id);

      if (error) throw error;

      res.json({
        message: 'Request declined'
      });
    } catch (err) {
      res.status(500).json({
        error: 'Failed to decline request',
        details: supportErrorDetails(err)
      });
    }
  }
);

apiRouter.post(
  '/supporter/status',
  requireAuth,
  requireSupporter,
  async (req: AuthRequest, res: Response) => {
    try {
      const { availability } = req.body;

      if (
        !['Available', 'Offline'].includes(
          availability
        )
      ) {
        res.status(400).json({
          error:
            'Availability must be Available or Offline'
        });
        return;
      }

      const { error } = await supabase
        .from('supporter_profiles')
        .update({ availability })
        .eq('user_id', req.user!.id);

      if (error) throw error;

      res.json({
        message: 'Availability updated',
        availability
      });
    } catch (err) {
      res.status(500).json({
        error: 'Failed to update availability',
        details: supportErrorDetails(err)
      });
    }
  }
);

apiRouter.get(
  '/support/request/:id/messages',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { data: session, error: sessionError } =
        await supabase
          .from('support_sessions')
          .select(
            'id,request_id,user_id,supporter_id,status'
          )
          .eq('id', req.params.id)
          .maybeSingle();

      if (sessionError) throw sessionError;

      if (!session) {
        res.status(404).json({
          error: 'Support session not found'
        });
        return;
      }

      if (
        session.user_id !== req.user!.id &&
        session.supporter_id !== req.user!.id
      ) {
        res.status(403).json({
          error:
            'You do not have access to this support session'
        });
        return;
      }

      const { data: messages, error: messageError } =
        await supabase
          .from('support_messages')
          .select(
            'id,sender_id,sender_role,message,created_at'
          )
          .eq('session_id', req.params.id)
          .order('created_at', { ascending: true });

      if (messageError) throw messageError;

      res.json({
        session: {
          id: session.id,
          userId: session.user_id,
          supporterId: session.supporter_id,
          status: session.status
        },
        messages: (messages || []).map((m: any) => ({
          id: m.id,
          senderId: m.sender_id,
          senderRole: m.sender_role,
          message: m.message,
          createdAt: m.created_at,
          senderName:
            m.sender_role === 'supporter'
              ? SUPPORTER_DISPLAY_NAME
              : m.sender_id === req.user!.id
              ? req.user!.name
              : 'User'
        }))
      });
    } catch (err) {
      res.status(500).json({
        error: 'Failed to load support messages',
        details: supportErrorDetails(err)
      });
    }
  }
);

apiRouter.post(
  '/support/request/:id/messages',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { message } = req.body;

      if (!message || !String(message).trim()) {
        res.status(400).json({
          error: 'Message cannot be empty'
        });
        return;
      }

      const { data: session, error: sessionError } =
        await supabase
          .from('support_sessions')
          .select(
            'id,user_id,supporter_id,status'
          )
          .eq('id', req.params.id)
          .maybeSingle();

      if (sessionError) throw sessionError;

      if (!session) {
        res.status(404).json({
          error: 'Support session not found'
        });
        return;
      }

      if (
        session.user_id !== req.user!.id &&
        session.supporter_id !== req.user!.id
      ) {
        res.status(403).json({
          error:
            'You do not have access to this support session'
        });
        return;
      }

      if (session.status !== 'active') {
        res.status(409).json({
          error: 'This support session is not active'
        });
        return;
      }

      const id =
        'sm_' +
        Date.now() +
        '_' +
        Math.random().toString(36).slice(2, 7);

      const now = new Date().toISOString();

      const senderRole =
        req.user!.role === 'supporter'
          ? 'supporter'
          : 'user';

      const cleanMessage = String(message).trim();

      const { error: insertError } = await supabase
        .from('support_messages')
        .insert({
          id,
          session_id: req.params.id,
          sender_id: req.user!.id,
          sender_role: senderRole,
          message: cleanMessage,
          created_at: now
        });

      if (insertError) throw insertError;

      res.status(201).json({
        message: {
          id,
          senderId: req.user!.id,
          senderRole,
          message: cleanMessage,
          createdAt: now
        }
      });
    } catch (err) {
      res.status(500).json({
        error: 'Failed to send support message',
        details: supportErrorDetails(err)
      });
    }
  }
);

apiRouter.post(
  '/support/request/:id/end',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { data: session, error: sessionError } =
        await supabase
          .from('support_sessions')
          .select(
            'id,request_id,user_id,supporter_id,status'
          )
          .eq('id', req.params.id)
          .maybeSingle();

      if (sessionError) throw sessionError;

      if (!session) {
        res.status(404).json({
          error: 'Support session not found'
        });
        return;
      }

      if (
        session.user_id !== req.user!.id &&
        session.supporter_id !== req.user!.id
      ) {
        res.status(403).json({
          error:
            'You do not have access to this support session'
        });
        return;
      }

      if (session.status === 'ended') {
        res.json({
          message: 'Session already ended'
        });
        return;
      }

      const now = new Date().toISOString();

      const { error: sessionUpdateError } =
        await supabase
          .from('support_sessions')
          .update({
            status: 'ended',
            ended_at: now
          })
          .eq('id', req.params.id);

      if (sessionUpdateError) throw sessionUpdateError;

      const { error: requestUpdateError } =
        await supabase
          .from('support_requests')
          .update({
            status: 'completed',
            ended_at: now
          })
          .eq('id', session.request_id);

      if (requestUpdateError) throw requestUpdateError;

      const { error: profileError } = await supabase
        .from('supporter_profiles')
        .update({ availability: 'Available' })
        .eq('user_id', session.supporter_id);

      if (profileError) throw profileError;

      res.json({
        message: 'Support session ended'
      });
    } catch (err) {
      res.status(500).json({
        error: 'Failed to end support session',
        details: supportErrorDetails(err)
      });
    }
  }
);

apiRouter.post(
  '/support/request/:id/rating',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { rating, feedback = '' } = req.body;

      const numericRating = Number(rating);

      if (
        !Number.isInteger(numericRating) ||
        numericRating < 1 ||
        numericRating > 5
      ) {
        res.status(400).json({
          error: 'Rating must be an integer from 1 to 5'
        });
        return;
      }

      const { data: session, error: sessionError } =
        await supabase
          .from('support_sessions')
          .select(
            'id,user_id,supporter_id,status'
          )
          .eq('id', req.params.id)
          .maybeSingle();

      if (sessionError) throw sessionError;

      if (!session) {
        res.status(404).json({
          error: 'Support session not found'
        });
        return;
      }

      if (session.user_id !== req.user!.id) {
        res.status(403).json({
          error:
            'Only the user can rate the completed support session'
        });
        return;
      }

      if (session.status !== 'ended') {
        res.status(409).json({
          error:
            'End the conversation before rating the supporter'
        });
        return;
      }

      const { data: existingRating, error: existingError } =
        await supabase
          .from('support_ratings')
          .select('id')
          .eq('session_id', req.params.id)
          .maybeSingle();

      if (existingError) throw existingError;

      if (existingRating) {
        res.status(409).json({
          error:
            'This support session has already been rated'
        });
        return;
      }

      const ratingId = 'rating_' + Date.now();

      const { error: insertError } = await supabase
        .from('support_ratings')
        .insert({
          id: ratingId,
          session_id: req.params.id,
          user_id: session.user_id,
          supporter_id: session.supporter_id,
          rating: numericRating,
          feedback:
            String(feedback || '').trim() || null,
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      res.status(201).json({
        message:
          'Thank you. Your rating has been recorded.'
      });
    } catch (err) {
      res.status(500).json({
        error: 'Failed to save rating',
        details: supportErrorDetails(err)
      });
    }
  }
);

apiRouter.get(
  '/supporter/ratings',
  requireAuth,
  requireSupporter,
  async (req: AuthRequest, res: Response) => {
    try {
      const { data: ratings, error } = await supabase
        .from('support_ratings')
        .select('rating,feedback,created_at')
        .eq('supporter_id', req.user!.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      res.json({
        ratings: (ratings || []).map((r: any) => ({
          rating: r.rating,
          feedback: r.feedback,
          createdAt: r.created_at
        }))
      });
    } catch (err) {
      res.status(500).json({
        error: 'Failed to load supporter ratings',
        details: supportErrorDetails(err)
      });
    }
  }
);

// ==========================================
// 8. REMINDERS - SUPABASE
// ==========================================

apiRouter.get(
  '/reminders',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('id, message, enabled, scheduled_time, created_at')
        .eq('user_id', req.user!.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Failed to fetch reminders:', error);
        res.status(500).json({
          error: 'Failed to fetch reminders'
        });
        return;
      }

      res.json({
        reminders: (data || []).map((r: any) => ({
          id: r.id,
          message: r.message,
          enabled: Boolean(r.enabled),
          scheduledTime: r.scheduled_time
        }))
      });
    } catch (err) {
      console.error('Reminder fetch error:', err);
      res.status(500).json({
        error: 'Failed to fetch reminders'
      });
    }
  }
);

apiRouter.post(
  '/reminders',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        message,
        scheduled_time = '20:00'
      } = req.body;

      if (!message || !String(message).trim()) {
        res.status(400).json({
          error: 'Message required'
        });
        return;
      }

      const reminderId =
        'rem_' +
        Date.now() +
        '_' +
        Math.random().toString(36).slice(2, 8);

      const { data, error } = await supabase
        .from('reminders')
        .insert({
          id: reminderId,
          user_id: req.user!.id,
          message: String(message).trim(),
          enabled: true,
          scheduled_time: String(scheduled_time)
        })
        .select('id, message, enabled, scheduled_time')
        .single();

      if (error) {
        console.error('Failed to create reminder:', error);
        res.status(500).json({
          error: 'Failed to add reminder'
        });
        return;
      }

      res.status(201).json({
        message: 'Reminder added',
        reminder: {
          id: data.id,
          message: data.message,
          enabled: Boolean(data.enabled),
          scheduledTime: data.scheduled_time
        }
      });
    } catch (err) {
      console.error('Reminder creation error:', err);
      res.status(500).json({
        error: 'Failed to add reminder'
      });
    }
  }
);

apiRouter.put(
  '/reminders/:id',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        enabled,
        scheduled_time,
        message
      } = req.body;

      const updates: Record<string, any> = {};

      if (enabled !== undefined) {
        updates.enabled = Boolean(enabled);
      }

      if (scheduled_time !== undefined) {
        updates.scheduled_time = String(scheduled_time);
      }

      if (message !== undefined) {
        updates.message = String(message).trim();
      }

      if (Object.keys(updates).length === 0) {
        res.status(400).json({
          error: 'No reminder changes provided'
        });
        return;
      }

      const { error } = await supabase
        .from('reminders')
        .update(updates)
        .eq('id', req.params.id)
        .eq('user_id', req.user!.id);

      if (error) {
        console.error('Failed to update reminder:', error);
        res.status(500).json({
          error: 'Failed to update reminder'
        });
        return;
      }

      res.json({
        message: 'Reminder updated'
      });
    } catch (err) {
      console.error('Reminder update error:', err);
      res.status(500).json({
        error: 'Failed to update reminder'
      });
    }
  }
);

apiRouter.delete(
  '/reminders/:id',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const { error } = await supabase
        .from('reminders')
        .delete()
        .eq('id', req.params.id)
        .eq('user_id', req.user!.id);

      if (error) {
        console.error('Failed to delete reminder:', error);
        res.status(500).json({
          error: 'Failed to delete reminder'
        });
        return;
      }

      res.json({
        message: 'Reminder deleted'
      });
    } catch (err) {
      console.error('Reminder deletion error:', err);
      res.status(500).json({
        error: 'Failed to delete reminder'
      });
    }
  }
);
// ==========================================
// 9. PRIVACY & DATA EXPORT
// ==========================================

apiRouter.get(
  '/privacy/export',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = await getDb();

      const userRes =
        db.exec(
          `SELECT
             id,
             name,
             email,
             mobile,
             role,
             created_at
           FROM users
           WHERE id = ?`,
          [req.user!.id]
        );

      const journalsRes =
        db.exec(
          `SELECT
             j.*,
             a.mood,
             a.emotion,
             a.sentiment,
             a.contexts,
             a.keywords,
             a.triggers,
             a.explanation,
             a.ai_response,
             a.suggestions
           FROM journals j
           LEFT JOIN analyses a
             ON j.id =
                a.journal_id
           WHERE j.user_id = ?`,
          [req.user!.id]
        );

      const user =
        userRes.length > 0
          ? userRes[0].values[0]
          : null;

      const exportData = {
        exportTimestamp:
          new Date().toISOString(),

        disclaimer:
          'AI insights are for self-reflection and general wellness only. They are not a medical diagnosis or a replacement for professional support.',

        userProfile: user
          ? {
              id: user[0],
              name: user[1],
              email: user[2],
              mobile: user[3],
              registered:
                user[4]
            }
          : null,

        totalEntries:
          journalsRes.length > 0
            ? journalsRes[0].values
                .length
            : 0,

        journalEntries:
          journalsRes.length > 0
            ? journalsRes[0].values
            : []
      };

      res.setHeader(
        'Content-Type',
        'application/json'
      );

      res.setHeader(
        'Content-Disposition',
        'attachment; filename="mood_journal_export.json"'
      );

      res.json(
        exportData
      );
    } catch (err) {
      res.status(500).json({
        error: 'Export failed'
      });
    }
  }
);

apiRouter.delete(
  '/privacy/account',
  requireAuth,
  async (req: AuthRequest, res: Response) => {
    try {
      const db = await getDb();

      db.run(
        `DELETE FROM chat_messages
         WHERE user_id = ?`,
        [req.user!.id]
      );

      db.run(
        `DELETE FROM goals
         WHERE user_id = ?`,
        [req.user!.id]
      );

      db.run(
        `DELETE FROM reminders
         WHERE user_id = ?`,
        [req.user!.id]
      );

      db.run(
        `DELETE FROM support_ratings
         WHERE user_id = ?`,
        [req.user!.id]
      );

      db.run(
        `DELETE FROM support_messages
         WHERE sender_id = ?`,
        [req.user!.id]
      );

      db.run(
        `DELETE FROM support_sessions
         WHERE user_id = ?
            OR supporter_id = ?`,
        [
          req.user!.id,
          req.user!.id
        ]
      );

      db.run(
        `DELETE FROM support_requests
         WHERE user_id = ?
            OR supporter_id = ?`,
        [
          req.user!.id,
          req.user!.id
        ]
      );

      db.run(
        `DELETE FROM mood_history
         WHERE user_id = ?`,
        [req.user!.id]
      );

      db.run(
        `DELETE FROM analyses
         WHERE journal_id IN (
           SELECT id
           FROM journals
           WHERE user_id = ?
         )`,
        [req.user!.id]
      );

      db.run(
        `DELETE FROM journals
         WHERE user_id = ?`,
        [req.user!.id]
      );

      db.run(
        `DELETE FROM users
         WHERE id = ?`,
        [req.user!.id]
      );

      saveDb(db);

      res.json({
        message:
          'Account and all associated reflections permanently deleted'
      });
    } catch (err) {
      res.status(500).json({
        error:
          'Failed to delete account'
      });
    }
  }
);