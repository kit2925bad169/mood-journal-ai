import React from 'react';
import { AlertTriangle, Phone, HeartHandshake, ExternalLink } from 'lucide-react';
import { SafetyCheck } from '../types.js';

export const SafetyAlert: React.FC<{ safety: SafetyCheck }> = ({ safety }) => {
  if (!safety.isCrisisDetected) return null;

  return (
    <div className="mb-6 p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/60 shadow-md">
      <div className="flex items-start gap-4">
        <div className="p-2.5 bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 rounded-xl">
          <HeartHandshake className="w-7 h-7" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="text-lg font-bold text-amber-900 dark:text-amber-100">
              You are not alone. Caring support is available.
            </h4>
          </div>
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-3 leading-relaxed">
            {safety.calmMessage ||
              'It sounds like you may be going through something very difficult. AI insights are for self-reflection only, not medical care. Please consider reaching out to someone you trust or a qualified professional.'}
          </p>

          <div className="bg-white/80 dark:bg-slate-900/80 rounded-xl p-3 border border-amber-200 dark:border-amber-800/60 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" /> Free & Confidential 24/7 Helplines:
            </div>
            <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-1.5 list-disc list-inside">
              <li>
                <strong className="text-slate-900 dark:text-white">United States & Canada:</strong> Call or text{' '}
                <span className="font-bold text-amber-700 dark:text-amber-400">988</span> (Suicide & Crisis Lifeline)
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">India:</strong> Kiran Helpline{' '}
                <span className="font-bold text-amber-700 dark:text-amber-400">1800-599-0019</span> or Vandrevala Foundation (
                <span className="font-bold text-amber-700 dark:text-amber-400">+91 9999 666 555</span>)
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">United Kingdom:</strong> Call{' '}
                <span className="font-bold text-amber-700 dark:text-amber-400">111</span> (NHS) or text SHOUT to 85258
              </li>
              <li>
                <strong className="text-slate-900 dark:text-white">Worldwide:</strong> Find emergency care at{' '}
                <a
                  href="https://findahelpline.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-indigo-600 dark:text-indigo-400 inline-flex items-center gap-0.5"
                >
                  findahelpline.com <ExternalLink className="w-3 h-3 inline" />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
