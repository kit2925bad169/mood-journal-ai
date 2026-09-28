# Gemini API setup for Mood Journal AI

1. In the project root, create a file named `.env`.
2. Put your real key in `.env`:

```env
GEMINI_API_KEY=YOUR_REAL_KEY
GEMINI_MODEL=gemini-3.8-flash
PORT=3000
NODE_ENV=development
AI_MODE=llm
```

3. Do NOT put the real key in `.env.example`, source code, or Git.
4. Install dependencies:

```powershell
npm install
```

5. Start the app:

```powershell
npm run dev
```

6. Open:

```text
http://localhost:3000
```

The chatbot sends the recent saved conversation to Gemini on every turn, so follow-ups such as:
- "I feel lazy today"
- "because I didn't sleep well"

are treated as one conversation.

If Gemini is unavailable, the app uses a contextual fallback rather than the old generic response.

The Gemini API key is read only on the server from `process.env.GEMINI_API_KEY`.
