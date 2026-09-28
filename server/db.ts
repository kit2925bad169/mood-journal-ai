import initSqlJs, { Database } from 'sql.js';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';

const DB_FILE = path.resolve(process.cwd(), 'mood_journal.sqlite');
let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const wasmPath = path.resolve(process.cwd(), 'node_modules/sql.js/dist/sql-wasm.wasm');
  let SQL;
  if (fs.existsSync(wasmPath)) {
    const fileBuffer = fs.readFileSync(wasmPath);
    const wasmBinary = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
    SQL = await initSqlJs({ wasmBinary });
  } else {
    SQL = await initSqlJs();
  }

  if (fs.existsSync(DB_FILE)) {
    try {
      const buffer = fs.readFileSync(DB_FILE);
      dbInstance = new SQL.Database(buffer);
    } catch (err) {
      console.warn('Could not read existing sqlite file, creating fresh DB:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  initTables(dbInstance);
  migrateExistingDatabase(dbInstance);
  await seedInitialData(dbInstance);
  saveDb(dbInstance);

  return dbInstance;
}

export function saveDb(db: Database = dbInstance!): void {
  if (!db) return;
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE, buffer);
  } catch (err) {
    console.error('Error saving SQLite database to disk:', err);
  }
}

function initTables(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mobile TEXT,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'user',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS journals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      text TEXT NOT NULL,
      input_type TEXT DEFAULT 'text',
      language TEXT DEFAULT 'en',
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS analyses (
      id TEXT PRIMARY KEY,
      journal_id TEXT NOT NULL,
      mood TEXT NOT NULL,
      emotion TEXT NOT NULL,
      sentiment TEXT NOT NULL,
      confidence REAL NOT NULL,
      contexts TEXT NOT NULL,
      keywords TEXT NOT NULL,
      triggers TEXT NOT NULL,
      explanation TEXT NOT NULL,
      ai_response TEXT NOT NULL,
      suggestions TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS mood_history (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      journal_id TEXT NOT NULL,
      mood TEXT NOT NULL,
      emotion TEXT NOT NULL,
      sentiment TEXT NOT NULL,
      score INTEGER NOT NULL,
      summary TEXT,
      date TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS support_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      journal_id TEXT,
      supporter_name TEXT NOT NULL,
      status TEXT NOT NULL,
      notes TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS supporter_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      supporter_id TEXT UNIQUE NOT NULL,
      title TEXT NOT NULL,
      bio TEXT NOT NULL,
      availability TEXT NOT NULL DEFAULT 'Available',
      avatar_url TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS support_sessions (
      id TEXT PRIMARY KEY,
      request_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      supporter_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      started_at TEXT,
      ended_at TEXT,
      FOREIGN KEY (request_id) REFERENCES support_requests(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (supporter_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS support_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES support_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS support_ratings (
      id TEXT PRIMARY KEY,
      session_id TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      supporter_id TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
      feedback TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (session_id) REFERENCES support_sessions(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (supporter_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      frequency TEXT NOT NULL,
      progress INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS goal_evidence (
      id TEXT PRIMARY KEY,
      goal_id TEXT NOT NULL,
      journal_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      points INTEGER NOT NULL DEFAULT 10,
      reason TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(goal_id, journal_id),
      FOREIGN KEY (goal_id) REFERENCES goals(id) ON DELETE CASCADE,
      FOREIGN KEY (journal_id) REFERENCES journals(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      message TEXT NOT NULL,
      enabled INTEGER NOT NULL DEFAULT 1,
      scheduled_time TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      role TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
}


function addColumnIfMissing(db: Database, table: string, column: string, definition: string): void {
  try {
    const result = db.exec(`PRAGMA table_info(${table})`);
    const exists = result.length > 0 && result[0].values.some((row) => row[1] === column);
    if (!exists) {
      db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
    }
  } catch (err) {
    console.warn(`Could not migrate ${table}.${column}:`, err);
  }
}

function migrateExistingDatabase(db: Database): void {
  addColumnIfMissing(db, 'users', 'role', "TEXT NOT NULL DEFAULT 'user'");
  addColumnIfMissing(db, 'journals', 'language', "TEXT DEFAULT 'en'");
  addColumnIfMissing(db, 'support_requests', 'supporter_id', 'TEXT');
  addColumnIfMissing(db, 'support_requests', 'accepted_at', 'TEXT');
  addColumnIfMissing(db, 'support_requests', 'ended_at', 'TEXT');
  // Evidence created by older versions must be re-verified by Gemini.
  // New evidence is explicitly stored as 'verified' by the goal verifier.
  addColumnIfMissing(
    db,
    'goal_evidence',
    'verification_status',
    "TEXT NOT NULL DEFAULT 'pending'"
  );

  // Older versions used a single hard-coded supporter. Keep those rows readable,
  // while new requests use supporter accounts and the new session tables.
  db.run(`UPDATE users SET role = 'user' WHERE role IS NULL OR role = ''`);
}

async function seedInitialData(db: Database): Promise<void> {
  const userCheck = db.exec("SELECT COUNT(*) as count FROM users WHERE email = 'demo@moodjournal.ai'");
  const count = userCheck.length > 0 && userCheck[0].values.length > 0 ? (userCheck[0].values[0][0] as number) : 0;

  const supporterSeed = async () => {
    const supporterEmail = 'supporter1@moodjournal.ai';
    const supporterId = 'usr_supporter_001';
    const supporterPublicId = 'HS001';
    const passwordHash = await bcrypt.hash('Supporter123!', 10);
    const now = new Date().toISOString();

    const supporterCheck = db.exec(`SELECT id FROM users WHERE LOWER(email) = ?`, [supporterEmail]);
    if (supporterCheck.length === 0 || supporterCheck[0].values.length === 0) {
      db.run(
        `INSERT INTO users (id, name, email, mobile, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [supporterId, 'Ananya Support', supporterEmail, null, passwordHash, 'supporter', now]
      );
    } else {
      const existingId = supporterCheck[0].values[0][0] as string;
      db.run(
        `UPDATE users SET name = ?, password_hash = ?, role = 'supporter' WHERE id = ?`,
        ['Ananya Support', passwordHash, existingId]
      );
    }

    const userRow = db.exec(`SELECT id FROM users WHERE LOWER(email) = ?`, [supporterEmail]);
    const actualUserId = userRow[0].values[0][0] as string;

    const profileCheck = db.exec(`SELECT id FROM supporter_profiles WHERE user_id = ?`, [actualUserId]);
    if (profileCheck.length === 0 || profileCheck[0].values.length === 0) {
      db.run(
        `INSERT INTO supporter_profiles (id, user_id, supporter_id, title, bio, availability, avatar_url, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        ['profile_supporter_001', actualUserId, supporterPublicId, 'Human Wellness Supporter',
         'A trained human listener available for private one-to-one support conversations.', 'Available', null, now]
      );
    } else {
      db.run(
        `UPDATE supporter_profiles
         SET supporter_id = ?, title = ?, bio = ?, availability = CASE WHEN availability IS NULL OR availability = '' THEN 'Available' ELSE availability END
         WHERE user_id = ?`,
        [supporterPublicId, 'Human Wellness Supporter', 'A trained human listener available for private one-to-one support conversations.', actualUserId]
      );
    }
  };

  if (count > 0) {
    await supporterSeed();
    saveDb(db);
    return;
  }

  const demoUserId = 'usr_demo_101';
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const now = new Date();

  // Create demo user
  db.run(
    `INSERT INTO users (id, name, email, mobile, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [demoUserId, 'Alex Morgan', 'demo@moodjournal.ai', '+1 (555) 234-5678', passwordHash, 'user', now.toISOString()]
  );

  // Initial goals
  const initialGoals = [
    { id: 'goal_1', title: 'Sleep 7+ hours regularly', frequency: 'Daily', progress: 75 },
    { id: 'goal_2', title: 'Take 5-minute work micro-breaks', frequency: 'Daily', progress: 60 },
    { id: 'goal_3', title: 'Morning mindfulness or light walk', frequency: '5 days / week', progress: 80 },
    { id: 'goal_4', title: 'Plan deadlines in advance', frequency: 'Weekly', progress: 50 },
  ];

  for (const g of initialGoals) {
    db.run(
      `INSERT INTO goals (id, user_id, title, frequency, progress, created_at) VALUES (?, ?, ?, ?, ?, ?)`,
      [g.id, demoUserId, g.title, g.frequency, g.progress, now.toISOString()]
    );
  }

  // Initial reminders
  const initialReminders = [
    { id: 'rem_1', message: 'How are you feeling today? Take a moment to reflect.', enabled: 1, time: '20:00' },
    { id: 'rem_2', message: 'Have you completed your wellness goal today?', enabled: 1, time: '14:30' },
    { id: 'rem_3', message: 'Midday check-in: Pause, breathe, and stretch.', enabled: 1, time: '12:00' }
  ];

  for (const r of initialReminders) {
    db.run(
      `INSERT INTO reminders (id, user_id, message, enabled, scheduled_time) VALUES (?, ?, ?, ?, ?)`,
      [r.id, demoUserId, r.message, r.enabled, r.time]
    );
  }

  // Realistic 7-day entries matching prompt specifications
  const entries = [
    {
      offsetDays: 6,
      text: 'Today I had two deadlines. I worked late and felt very stressed because I could not finish everything.',
      inputType: 'text',
      mood: 'Stressed',
      emotion: 'Anxiety',
      sentiment: 'Negative',
      score: 2,
      contexts: ['Deadlines', 'Workload', 'Long working hours'],
      keywords: ['deadlines', 'worked late', 'stressed', 'finish'],
      triggers: ['Tight deadlines', 'Work overload'],
      explanation: {
        summary: 'Your journal indicates significant stress triggered by tight deadlines and extended working hours.',
        explicitMentions: ['Two deadlines', 'Worked late', 'Could not complete everything'],
        aiInferences: ['Elevated time pressure causing anxiety'],
        bulletPoints: ['Explicit mention of being "very stressed"', 'Late working hours contributing to fatigue', 'Multiple deadlines scheduled concurrently']
      },
      aiResponse: 'That sounds like a stressful day, especially with multiple deadlines requiring your sustained attention.',
      suggestions: [
        { title: 'Break tasks into smaller chunks', description: 'Break remaining tasks into 25-minute segments.', category: 'workload' },
        { title: 'Prioritize top urgent deliverable', description: 'Focus exclusively on the primary urgent task first.', category: 'workload' }
      ]
    },
    {
      offsetDays: 5,
      text: 'Went for a morning walk in the park and took a deep breath. Felt peaceful and centered during work today.',
      inputType: 'text',
      mood: 'Calm',
      emotion: 'Peace',
      sentiment: 'Positive',
      score: 4,
      contexts: ['Morning Routine', 'Outdoor Walk', 'Mindfulness'],
      keywords: ['morning walk', 'park', 'peaceful', 'centered'],
      triggers: ['Connection with nature', 'Slow morning routine'],
      explanation: {
        summary: 'Your journal reflects calm, tranquil sentiment cultivated by physical movement and fresh air.',
        explicitMentions: ['Morning walk in park', 'Felt peaceful and centered'],
        aiInferences: ['Physical activity acted as an emotional buffer'],
        bulletPoints: ['Proactive morning grounding routine', 'Peaceful emotional markers throughout workday']
      },
      aiResponse: 'Starting your day with open space and a walk in nature seems to bring a gentle balance to your mood.',
      suggestions: [
        { title: 'Maintain your morning outdoor walk', description: 'Even 10 minutes outdoors provides strong circadian grounding.', category: 'mindset' }
      ]
    },
    {
      offsetDays: 4,
      text: 'I completed my quarterly presentation successfully today! The team gave great feedback and I felt truly proud of myself.',
      inputType: 'voice',
      mood: 'Happy',
      emotion: 'Pride',
      sentiment: 'Positive',
      score: 5,
      contexts: ['Presentation', 'Team Feedback', 'Achievement'],
      keywords: ['presentation', 'successfully', 'feedback', 'proud'],
      triggers: ['Milestone completion', 'Positive peer recognition'],
      explanation: {
        summary: 'Your journal shows high joy and self-worth driven by personal competence and team appreciation.',
        explicitMentions: ['Completed presentation successfully', 'Felt proud of myself'],
        aiInferences: ['External validation matched internal preparation'],
        bulletPoints: ['High positivity vocabulary: "successfully", "proud"', 'Clear milestone achievement']
      },
      aiResponse: 'Congratulations on your presentation! Celebrating milestones like this anchors healthy self-confidence.',
      suggestions: [
        { title: 'Savor your achievement', description: 'Write down what made the preparation work so well.', category: 'positive' }
      ]
    },
    {
      offsetDays: 3,
      text: 'I could not complete my assignment and my project manager criticized me. I felt overwhelmed and frustrated.',
      inputType: 'text',
      mood: 'Stressed',
      emotion: 'Frustration',
      sentiment: 'Negative',
      score: 2,
      contexts: ['Assignment Deadline', 'Manager Feedback', 'Work Conflict'],
      keywords: ['assignment', 'criticized', 'overwhelmed', 'frustrated'],
      triggers: ['Negative feedback', 'Unfinished assignment'],
      explanation: {
        summary: 'Your entry indicates frustration and feeling overwhelmed following tough feedback on an incomplete deliverable.',
        explicitMentions: ['Manager criticized me', 'Felt overwhelmed and frustrated'],
        aiInferences: ['Feeling discouraged by critical assessment'],
        bulletPoints: ['Explicit mention of frustration and overload', 'Difficulty meeting external timeline expectations']
      },
      aiResponse: 'Receiving sharp feedback when you are already struggling with an assignment is difficult. It is okay to take a moment to decompress.',
      suggestions: [
        { title: 'Clarify expectations calmly', description: 'Schedule a brief alignment chat to understand core priorities.', category: 'workload' },
        { title: 'Separate feedback from self-worth', description: 'Remember that critique of a draft is not a measure of your worth.', category: 'mindset' }
      ]
    },
    {
      offsetDays: 2,
      text: 'Had a quiet afternoon catching up on reading and organizing my desk. Felt relaxed and untangled.',
      inputType: 'text',
      mood: 'Calm',
      emotion: 'Peace',
      sentiment: 'Positive',
      score: 4,
      contexts: ['Reading', 'Desk Organizing', 'Quiet Time'],
      keywords: ['quiet afternoon', 'reading', 'organizing', 'relaxed'],
      triggers: ['Decluttering environment', 'Unscheduled quiet time'],
      explanation: {
        summary: 'A tidy space and dedicated reading created a calm mental atmosphere.',
        explicitMentions: ['Quiet afternoon', 'Organizing desk', 'Felt relaxed'],
        aiInferences: ['Physical decluttering aided emotional decompression'],
        bulletPoints: ['Balanced, restful vocabulary', 'Low cognitive friction afternoon']
      },
      aiResponse: 'Decluttering your environment often gives your thoughts breathing room. Sounds like a restorative pause.',
      suggestions: [
        { title: 'Keep space uncluttered', description: 'A 5-minute tidy-up at the end of the day preserves mental clarity.', category: 'mindset' }
      ]
    },
    {
      offsetDays: 1,
      text: 'Met friends for brunch and had a good laugh. Spent the evening watching a movie. Really enjoyed the day.',
      inputType: 'text',
      mood: 'Happy',
      emotion: 'Joy',
      sentiment: 'Positive',
      score: 5,
      contexts: ['Friends', 'Social Connection', 'Leisure'],
      keywords: ['friends', 'brunch', 'laugh', 'movie', 'enjoyed'],
      triggers: ['Social bonding', 'Playful recreation'],
      explanation: {
        summary: 'Warm social connection and lighthearted entertainment boosted positive mood.',
        explicitMentions: ['Met friends', 'Good laugh', 'Enjoyed the day'],
        aiInferences: ['Social support replenished emotional reserve'],
        bulletPoints: ['High joy markers ("laugh", "enjoyed")', 'Strong social bonding context']
      },
      aiResponse: 'Shared laughter with good friends is one of the most natural mood-boosters.',
      suggestions: [
        { title: 'Nurture your friendships', description: 'Regular informal check-ins keep you feeling supported.', category: 'positive' }
      ]
    },
    {
      offsetDays: 0,
      text: 'Slept well for 8 hours and woke up feeling refreshed. Prepared a wholesome breakfast and organized my goals for the week ahead.',
      inputType: 'text',
      mood: 'Calm',
      emotion: 'Peace',
      sentiment: 'Positive',
      score: 4,
      contexts: ['Sleep Quality', 'Healthy Meal', 'Weekly Planning'],
      keywords: ['slept well', 'refreshed', 'breakfast', 'goals'],
      triggers: ['Good sleep hygiene', 'Proactive week organization'],
      explanation: {
        summary: 'Restorative sleep combined with intentional planning sets a calm, confident tone for the days ahead.',
        explicitMentions: ['Slept 8 hours', 'Woke up refreshed', 'Organized goals'],
        aiInferences: ['Circadian restoration reducing baseline tension'],
        bulletPoints: ['Explicit mention of 8 hours sleep', 'Healthy self-care routines mentioned']
      },
      aiResponse: 'Quality sleep makes a remarkable difference in resilience and clarity. You are setting a wonderful rhythm.',
      suggestions: [
        { title: 'Maintain sleep routine', description: 'Aim for a consistent bedtime to maintain this calm energy.', category: 'sleep' }
      ]
    }
  ];

  for (let i = 0; i < entries.length; i++) {
    const e = entries[i];
    const journalId = `jrn_demo_${i + 1}`;
    const analysisId = `ans_demo_${i + 1}`;
    const historyId = `hst_demo_${i + 1}`;

    const dateObj = new Date(Date.now() - e.offsetDays * 86400000);
    const dateStr = dateObj.toISOString();
    const shortDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    db.run(
      `INSERT INTO journals (id, user_id, text, input_type, created_at) VALUES (?, ?, ?, ?, ?)`,
      [journalId, demoUserId, e.text, e.inputType, dateStr]
    );

    db.run(
      `INSERT INTO analyses (id, journal_id, mood, emotion, sentiment, confidence, contexts, keywords, triggers, explanation, ai_response, suggestions, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        analysisId,
        journalId,
        e.mood,
        e.emotion,
        e.sentiment,
        0.88 + (i % 5) * 0.02,
        JSON.stringify(e.contexts),
        JSON.stringify(e.keywords),
        JSON.stringify(e.triggers),
        JSON.stringify(e.explanation),
        e.aiResponse,
        JSON.stringify(e.suggestions),
        dateStr
      ]
    );

    db.run(
      `INSERT INTO mood_history (id, user_id, journal_id, mood, emotion, sentiment, score, summary, date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [historyId, demoUserId, journalId, e.mood, e.emotion, e.sentiment, e.score, e.text.slice(0, 70) + '...', shortDate]
    );
  }
  // Seed a real supporter account for local/demo testing.
  const supporterEmail = 'supporter1@moodjournal.ai';
  const supporterCheck = db.exec(`SELECT id FROM users WHERE email = ?`, [supporterEmail]);
  if (supporterCheck.length === 0 || supporterCheck[0].values.length === 0) {
    const supporterId = 'usr_supporter_001';
    const supporterHash = await bcrypt.hash('Supporter123!', 10);
    const supporterNow = new Date().toISOString();
    db.run(
      `INSERT INTO users (id, name, email, mobile, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [supporterId, 'Ananya Support', supporterEmail, null, supporterHash, 'supporter', supporterNow]
    );
    db.run(
      `INSERT INTO supporter_profiles (id, user_id, supporter_id, title, bio, availability, avatar_url, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      ['profile_supporter_001', supporterId, 'HS001', 'Human Wellness Supporter',
       'A trained human listener available for one-to-one support conversations.', 'Available', null, supporterNow]
    );
  }

}
