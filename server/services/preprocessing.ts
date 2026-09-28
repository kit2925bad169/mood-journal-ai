/**
 * Journal Text Preprocessing Service
 * Cleans, normalizes, extracts sentences and meaningful keywords without altering the raw text stored in the DB.
 */

export interface PreprocessedJournal {
  cleanedText: string;
  sentences: string[];
  keywords: string[];
  wordCount: number;
}

const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren\'t', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'can\'t', 'cannot',
  'could', 'couldn\'t', 'did', 'didn\'t', 'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each',
  'few', 'for', 'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 'he', 'he\'d',
  'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'how\'s', 'i',
  'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s',
  'me', 'more', 'most', 'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or',
  'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 'she', 'she\'d', 'she\'ll',
  'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 'than', 'that', 'that\'s', 'the', 'their', 'theirs',
  'them', 'themselves', 'then', 'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve',
  'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn\'t', 'we', 'we\'d',
  'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 'what\'s', 'when', 'when\'s', 'where', 'where\'s',
  'which', 'while', 'who', 'who\'s', 'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you',
  'you\'d', 'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]);

export function preprocessJournal(rawText: string): PreprocessedJournal {
  if (!rawText || typeof rawText !== 'string') {
    return { cleanedText: '', sentences: [], keywords: [], wordCount: 0 };
  }

  // 1. Normalize spaces, line breaks, special control characters
  const normalized = rawText
    .replace(/[\r\t\f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // 2. Extract sentences
  const sentenceMatches = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [normalized];
  const sentences = sentenceMatches.map((s) => s.trim()).filter((s) => s.length > 0);

  // 3. Clean text for analysis
  const cleanedText = normalized;

  // 4. Tokenize and extract significant keywords
  // Supports Latin and Unicode characters (Tamil, Devanagari, Telugu, Malayalam, Kannada)
  const tokens = cleanedText
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 2);

  const keywords: string[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    if (!STOPWORDS.has(token) && !seen.has(token)) {
      seen.add(token);
      keywords.push(token);
    }
  }

  return {
    cleanedText,
    sentences,
    keywords: keywords.slice(0, 15),
    wordCount: tokens.length,
  };
}
