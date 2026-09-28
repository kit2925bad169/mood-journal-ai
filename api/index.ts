import { createApp } from "../server.js";

let appPromise: Promise<any> | null = null;

export default async function handler(req: any, res: any) {
  if (!appPromise) {
    appPromise = createApp();
  }

  const app = await appPromise;

  // Vercel may pass the request to this function
  // without the /api prefix. Normalize it so the
  // Express routes (/api/...) continue to work.
  if (typeof req.url === "string" && !req.url.startsWith("/api")) {
    req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
  }

  return app(req, res);
}