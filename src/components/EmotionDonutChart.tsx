import React, { useState } from 'react';
import { EmotionCount } from '../types.js';
import { useLanguage } from '../context/LanguageContext.js';
import { PieChart, AlertCircle } from 'lucide-react';

interface EmotionDonutChartProps {
  data: EmotionCount[];
  totalEntries: number;
}

export const EmotionDonutChart: React.FC<EmotionDonutChartProps> = ({ data, totalEntries }) => {
  const { t } = useLanguage();
  const [hoveredEmotion, setHoveredEmotion] = useState<EmotionCount | null>(null);

  if (!data || data.length === 0 || totalEntries === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <span>🍩</span> {t.dashboard.emotionBreakdown}
        </h3>
        <div className="py-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl my-auto">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
            {t.dashboard.noEmotionData}
          </p>
        </div>
      </div>
    );
  }

  // Calculate SVG arc paths
  const size = 200;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-1 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-600">🍩</span>
            {t.dashboard.emotionBreakdown}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Distribution across {totalEntries} analyzed reflections
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut graphic */}
        <div className="relative w-48 h-48 shrink-0 flex items-center justify-center">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
            {data.map((item, idx) => {
              const strokeDashoffset = circumference - (item.percentage / 100) * circumference;
              const rotation = (cumulativePercent / 100) * 360;
              cumulativePercent += item.percentage;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${circumference} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  style={{
                    transformOrigin: '50% 50%',
                    transform: `rotate(${rotation}deg)`,
                    transition: 'all 0.3s ease',
                    opacity: hoveredEmotion && hoveredEmotion.name !== item.name ? 0.4 : 1,
                  }}
                  className="cursor-pointer hover:stroke-width-[36]"
                  onMouseEnter={() => setHoveredEmotion(item)}
                  onMouseLeave={() => setHoveredEmotion(null)}
                />
              );
            })}
          </svg>

          {/* Center text in donut */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
            {hoveredEmotion ? (
              <>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {hoveredEmotion.percentage}%
                </span>
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                  {hoveredEmotion.name}
                </span>
                <span className="text-[10px] text-slate-400">
                  {hoveredEmotion.count} {hoveredEmotion.count === 1 ? 'entry' : 'entries'}
                </span>
              </>
            ) : (
              <>
                <span className="text-2xl font-black text-slate-900 dark:text-white">{totalEntries}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Total Entries
                </span>
              </>
            )}
          </div>
        </div>

        {/* Legend */}
        <div className="w-full space-y-2 flex-1">
          {data.map((item) => (
            <div
              key={item.name}
              onMouseEnter={() => setHoveredEmotion(item)}
              onMouseLeave={() => setHoveredEmotion(null)}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer ${
                hoveredEmotion?.name === item.name
                  ? 'bg-slate-100 dark:bg-slate-800 ring-1 ring-slate-300 dark:ring-slate-700'
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-500 dark:text-slate-400">{item.count} {item.count === 1 ? 'entry' : 'entries'}</span>
                <span className="font-bold text-slate-900 dark:text-white min-w-[36px] text-right">
                  {item.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
