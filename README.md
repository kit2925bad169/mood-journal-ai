# Mood Journal AI

A Vite + React + TypeScript + Express + SQLite mood journaling application with AI insights, multilingual UI, AI chat, goals, journal history, and real human supporter sessions.

## Run locally

```powershell
npm install
npm run dev
```

Open: `http://localhost:3000`

## Gemini API

The Gemini integration is already wired into the backend using Google's current `@google/genai` JavaScript SDK. The API key stays on the server and is never sent to the browser.

1. Copy `.env.example` to `.env` if needed.
2. Put your real key in `GEMINI_API_KEY`.
3. Keep `AI_MODE=llm`.
4. Restart `npm run dev`.

If the key is missing or invalid, the app keeps a contextual fallback so the UI remains runnable, but real Gemini responses require a valid key.

## Human supporter demo

The server automatically seeds a working supporter account:

- **Supporter ID:** `HS001`
- **Email:** `supporter1@moodjournal.ai`
- **Password:** `Supporter123!`

The supporter login accepts either the Supporter ID or the email. The supporter profile, password hash, and profile record are self-healed on startup so an older local SQLite database does not leave the demo account unusable.

## Multilingual behavior

The selected language is stored in browser local storage and is reused after refresh. Supported languages include English, Tamil, Hindi, Malayalam, Telugu, Kannada, Urdu, and Tanglish. AI journal analysis and AI chat are instructed to answer in the selected language. The supporter login and supporter dashboard also follow the selected language.

## Human support flow

1. User chooses a specific supporter.
2. User sends a private support request.
3. Supporter accepts or declines it from the supporter dashboard.
4. Accepted requests create a private user/supporter session.
5. Messages are stored in SQLite.
6. Ending the session releases the supporter.
7. User can rate the completed session; supporter ratings and feedback appear on the supporter dashboard.
