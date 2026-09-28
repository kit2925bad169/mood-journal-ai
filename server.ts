import 'dotenv/config';

import express, { type Express } from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

import { apiRouter } from './server/routes.js';
import { getDb } from './server/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let appPromise: Promise<Express> | null = null;

export async function createApp(): Promise<Express> {
  if (appPromise) {
    return appPromise;
  }

  appPromise = (async () => {
    const app = express();

    // Middleware
    app.use(cors());
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Initialize database
    await getDb();
    console.log('📦 Mood Journal database initialized');

    // Health check
    app.get('/api/health', (_req, res) => {
      res.json({
        status: 'ok',
        service: 'Mood Journal AI',
        disclaimer:
          'AI insights are for self-reflection and general wellness only. They are not a medical diagnosis or a replacement for professional support.',
        timestamp: new Date().toISOString(),
      });
    });

    // API routes
    app.use('/api', apiRouter);

    /*
     * When running locally:
     * use Vite development middleware.
     *
     * When running on Vercel:
     * Vercel serves the frontend separately, so we don't
     * start Vite here.
     */
    const isVercel = Boolean(process.env.VERCEL);

    if (!isVercel) {
      const distPath = path.resolve(__dirname, 'dist');

      const isProduction =
        process.env.NODE_ENV === 'production' &&
        fs.existsSync(distPath);

      if (!isProduction) {
        const { createServer: createViteServer } = await import('vite');

        const vite = await createViteServer({
          server: {
            middlewareMode: true,
            hmr: process.env.DISABLE_HMR !== 'true',
            watch:
              process.env.DISABLE_HMR === 'true'
                ? null
                : {},
          },
          appType: 'spa',
        });

        app.use(vite.middlewares);
      } else {
        app.use(express.static(distPath));

        app.get('*', (_req, res) => {
          res.sendFile(path.resolve(distPath, 'index.html'));
        });
      }
    }

    return app;
  })();

  return appPromise;
}

/*
 * Local development
 *
 * npm run dev
 */
if (!process.env.VERCEL) {
  const PORT = Number(process.env.PORT) || 3000;

  createApp()
    .then((app) => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(
          `🌿 Mood Journal AI listening on http://localhost:${PORT}`
        );
      });
    })
    .catch((err) => {
      console.error('Failed to start server:', err);
      process.exit(1);
    });
}