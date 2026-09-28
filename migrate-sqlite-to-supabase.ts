import 'dotenv/config';
import fs from 'node:fs';
import initSqlJs from 'sql.js';
import { createClient } from '@supabase/supabase-js';

const SQLITE_FILE = './mood_journal_backup.sqlite';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) throw new Error('SUPABASE_URL is missing from .env');
if (!supabaseKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing from .env');
if (!fs.existsSync(SQLITE_FILE)) {
  throw new Error(`Backup database not found: ${SQLITE_FILE}`);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function parseJson(value: unknown, fallback: unknown) {
  if (value === null || value === undefined || value === '') return fallback;
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return fallback; }
}

function rows(db: any, table: string) {
  const result = db.exec(`SELECT * FROM ${table}`);
  if (!result.length) return [];
  const columns = result[0].columns as string[];
  return result[0].values.map((values: unknown[]) =>
    Object.fromEntries(columns.map((column, i) => [column, values[i]]))
  );
}

async function upsert(table: string, data: any[], onConflict = 'id') {
  if (!data.length) {
    console.log(`${table}: 0 rows`);
    return;
  }

  const { error } = await supabase
    .from(table)
    .upsert(data, { onConflict });

  if (error) throw new Error(`${table}: ${error.message}`);
  console.log(`${table}: restored ${data.length} rows`);
}

const SQL = await initSqlJs({
  locateFile: (file) => `node_modules/sql.js/dist/${file}`,
});

const db = new SQL.Database(fs.readFileSync(SQLITE_FILE));

try {
  const journalsRaw = rows(db, 'journals');
  const analysesRaw = rows(db, 'analyses');
  const historyRaw = rows(db, 'mood_history');
  const goalsRaw = rows(db, 'goals');
  const evidenceRaw = rows(db, 'goal_evidence');

  console.log('Backup contents:');
  console.log(`  journals: ${journalsRaw.length}`);
  console.log(`  analyses: ${analysesRaw.length}`);
  console.log(`  mood_history: ${historyRaw.length}`);
  console.log(`  goals: ${goalsRaw.length}`);
  console.log(`  goal_evidence: ${evidenceRaw.length}`);
  console.log('');

  const journals = journalsRaw.map((r: any) => ({
    id: String(r.id),
    user_id: String(r.user_id),
    text: String(r.text ?? ''),
    input_type: String(r.input_type ?? 'text'),
    language: String(r.language ?? 'en'),
    created_at: r.created_at ? new Date(String(r.created_at)).toISOString() : new Date().toISOString(),
  }));

  const journalIds = new Set(journals.map((j) => j.id));

  const analyses = analysesRaw
    .filter((r: any) => journalIds.has(String(r.journal_id)))
    .map((r: any) => ({
      id: String(r.id),
      journal_id: String(r.journal_id),
      mood: String(r.mood ?? 'Neutral'),
      emotion: String(r.emotion ?? 'Calm'),
      sentiment: String(r.sentiment ?? 'Neutral'),
      confidence: Number(r.confidence ?? 0),
      contexts: parseJson(r.contexts, []),
      keywords: parseJson(r.keywords, []),
      triggers: parseJson(r.triggers, []),
      explanation: parseJson(r.explanation, {}),
      ai_response: String(r.ai_response ?? ''),
      suggestions: parseJson(r.suggestions, []),
      created_at: r.created_at ? new Date(String(r.created_at)).toISOString() : new Date().toISOString(),
    }));

  const history = historyRaw
    .filter((r: any) => journalIds.has(String(r.journal_id)))
    .map((r: any) => ({
      id: String(r.id),
      user_id: String(r.user_id),
      journal_id: String(r.journal_id),
      mood: String(r.mood ?? 'Neutral'),
      emotion: String(r.emotion ?? 'Calm'),
      sentiment: String(r.sentiment ?? 'Neutral'),
      score: Number(r.score ?? 3),
      summary: r.summary == null ? null : String(r.summary),
      date: String(r.date ?? ''),
    }));

  const goals = goalsRaw.map((r: any) => ({
    id: String(r.id),
    user_id: String(r.user_id),
    title: String(r.title ?? ''),
    frequency: String(r.frequency ?? 'daily'),
    progress: Number(r.progress ?? 0),
    created_at: r.created_at ? new Date(String(r.created_at)).toISOString() : new Date().toISOString(),
  }));

  const goalIds = new Set(goals.map((g) => g.id));

  const evidence = evidenceRaw
    .filter((r: any) => goalIds.has(String(r.goal_id)) && journalIds.has(String(r.journal_id)))
    .map((r: any) => ({
      id: String(r.id),
      goal_id: String(r.goal_id),
      journal_id: String(r.journal_id),
      user_id: String(r.user_id),
      points: Number(r.points ?? 10),
      reason: String(r.reason ?? ''),
      verification_status: String(r.verification_status ?? 'verified'),
      created_at: r.created_at ? new Date(String(r.created_at)).toISOString() : new Date().toISOString(),
    }));

  // Parent records first so foreign keys are satisfied.
  await upsert('journals', journals);
  await upsert('analyses', analyses);
  await upsert('mood_history', history);
  await upsert('goals', goals);
  await upsert('goal_evidence', evidence);

  console.log('');
  console.log('Migration completed successfully.');
  console.log('Refresh the app and open Journal History.');
} finally {
  db.close();
}
