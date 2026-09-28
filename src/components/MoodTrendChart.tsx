import React, { useState } from 'react';
import { MoodTrendPoint } from '../types.js';
import { useLanguage } from '../context/LanguageContext.js';
import { AlertCircle } from 'lucide-react';

interface MoodTrendChartProps {
  data: MoodTrendPoint[];
  selectedRange: string;
  onRangeChange: (range: string) => void;
  selectedMetric: string;
  onMetricChange: (metric: string) => void;
  isLoading?: boolean;
}

const MOOD_LEVELS = [
  { score: 5, label: 'Very Good' },
  { score: 4, label: 'Good' },
  { score: 3, label: 'Neutral' },
  { score: 2, label: 'Low' },
  { score: 1, label: 'Very Low' }
];

export const MoodTrendChart: React.FC<MoodTrendChartProps> = ({
  data,
  selectedRange,
  onRangeChange,
  selectedMetric,
  onMetricChange,
  isLoading
}) => {
  const { t } = useLanguage();

  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const ranges = [
    { key: '7d', label: t.filters.days7 },
    { key: '30d', label: t.filters.days30 },
    { key: '3m', label: t.filters.months3 },
    { key: '6m', label: t.filters.months6 },
    { key: '1y', label: t.filters.year1 }
  ];

  const metrics = [
    { key: 'mood', label: t.filters.mood },
    { key: 'emotion', label: t.filters.emotion },
    { key: 'sentiment', label: t.filters.sentiment }
  ];

  /*
   * ---------------------------------------------------------
   * NO DATA STATE
   * ---------------------------------------------------------
   */

  if (!isLoading && (!data || data.length < 2)) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>📈</span>
              {t.dashboard.moodTrend}
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reflective progression over time
              (Scale: 1 = Very Low to 5 = Very Good)
            </p>
          </div>
        </div>

        <div className="py-14 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto mb-2" />

          <p className="text-slate-700 dark:text-slate-200 font-semibold mb-1">
            {t.dashboard.notEnoughData}
          </p>

          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {t.dashboard.continueJournaling}
          </p>
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * CHART DIMENSIONS
   * ---------------------------------------------------------
   */

  const chartHeight = 220;
  const chartWidth = 600;

  const paddingX = 45;
  const paddingY = 25;

  const innerWidth = chartWidth - paddingX * 2;
  const innerHeight = chartHeight - paddingY * 2;

  /*
   * ---------------------------------------------------------
   * CONVERT METRIC TO 1-5 SCORE
   * ---------------------------------------------------------
   */

  const metricScore = (point: MoodTrendPoint): number => {
    if (selectedMetric === 'sentiment') {
      if (point.sentiment === 'Positive') {
        return 5;
      }

      if (point.sentiment === 'Negative') {
        return 2;
      }

      if (point.sentiment === 'Mixed') {
        return 3;
      }

      return 3;
    }

    if (selectedMetric === 'emotion') {
      const positive = [
        'Joy',
        'Pride',
        'Peace',
        'Calm',
        'Happiness'
      ];

      const negative = [
        'Anxiety',
        'Stress',
        'Sadness',
        'Frustration'
      ];

      const emotion =
        point.emotion?.toLowerCase() || '';

      if (
        positive.some((item) =>
          emotion.includes(item.toLowerCase())
        )
      ) {
        return 5;
      }

      if (
        negative.some((item) =>
          emotion.includes(item.toLowerCase())
        )
      ) {
        return 2;
      }

      return point.score || 3;
    }

    return point.score || 3;
  };

  /*
   * ---------------------------------------------------------
   * CALCULATE GRAPH POINTS
   * ---------------------------------------------------------
   */

  const points = data.map((point, index) => {
    const x =
      paddingX +
      (index / Math.max(1, data.length - 1)) *
        innerWidth;

    const score = Math.max(
      1,
      Math.min(5, metricScore(point))
    );

    const y =
      paddingY +
      innerHeight -
      ((score - 1) / 4) * innerHeight;

    return {
      ...point,
      x,
      y,
      chartScore: score
    };
  });

  /*
   * ---------------------------------------------------------
   * LINE PATH
   * ---------------------------------------------------------
   */

  const pathString = points.reduce(
    (path, point, index) => {
      if (index === 0) {
        return `M ${point.x} ${point.y}`;
      }

      return `${path} L ${point.x} ${point.y}`;
    },
    ''
  );

  /*
   * ---------------------------------------------------------
   * AREA PATH
   * ---------------------------------------------------------
   */

  const areaPath =
    points.length > 0
      ? `${pathString}
         L ${points[points.length - 1].x} ${
          paddingY + innerHeight
        }
         L ${points[0].x} ${
          paddingY + innerHeight
        }
         Z`
      : '';

  /*
   * ---------------------------------------------------------
   * CURRENT HOVERED POINT
   * ---------------------------------------------------------
   */

  const hoveredPoint =
    hoveredIndex !== null
      ? points[hoveredIndex]
      : null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm relative">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">

        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600">
              📈
            </span>

            {t.dashboard.moodTrend}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Consistent 1-5 scale: 5 (Very Good) down to
            1 (Very Low)
          </p>
        </div>

        {/* =================================================
            FILTERS
        ================================================== */}

        <div className="flex flex-wrap items-center gap-2">

          {/* TIME RANGE */}

          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">

            {ranges.map((range) => (
              <button
                key={range.key}
                type="button"
                onClick={() =>
                  onRangeChange(range.key)
                }
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  selectedRange === range.key
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}

          </div>

          {/* METRIC */}

          <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">

            {metrics.map((metric) => (
              <button
                key={metric.key}
                type="button"
                onClick={() =>
                  onMetricChange(metric.key)
                }
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  selectedMetric === metric.key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {metric.label}
              </button>
            ))}

          </div>
        </div>
      </div>

      {/* =====================================================
          CHART
      ====================================================== */}

      <div className="relative w-full overflow-visible">

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >

          {/* =================================================
              GRADIENT
          ================================================== */}

          <defs>
            <linearGradient
              id="moodTrendGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#10b981"
                stopOpacity="0.22"
              />

              <stop
                offset="100%"
                stopColor="#3b82f6"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          {/* =================================================
              Y AXIS
          ================================================== */}

          {MOOD_LEVELS.map((level) => {
            const y =
              paddingY +
              innerHeight -
              ((level.score - 1) / 4) *
                innerHeight;

            return (
              <g key={level.score}>

                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="3 3"
                  className="text-slate-200 dark:text-slate-800"
                />

                <text
                  x={paddingX - 8}
                  y={y + 3.5}
                  textAnchor="end"
                  className="text-[10px] fill-slate-400 dark:fill-slate-500 font-medium"
                >
                  {level.label}
                </text>

              </g>
            );
          })}

          {/* =================================================
              AREA
          ================================================== */}

          {areaPath && (
            <path
              d={areaPath}
              fill="url(#moodTrendGradient)"
              pointerEvents="none"
            />
          )}

          {/* =================================================
              LINE
          ================================================== */}

          {pathString && (
            <path
              d={pathString}
              fill="none"
              stroke="#10b981"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="none"
            />
          )}

          {/* =================================================
              POINTS
          ================================================== */}

          {points.map((point, index) => {

            const isHovered =
              hoveredIndex === index;

            return (
              <g
                key={`${point.date}-${index}`}
              >

                {/* Invisible larger hit area.
                    This stays the same size and therefore
                    does NOT cause hover flickering. */}

                <circle
                  cx={point.x}
                  cy={point.y}
                  r="14"
                  fill="transparent"
                  pointerEvents="all"
                  onMouseEnter={() =>
                    setHoveredIndex(index)
                  }
                />

                {/* Visible point */}

                <circle
                  cx={point.x}
                  cy={point.y}
                  r={isHovered ? 8 : 6}
                  fill="#ffffff"
                  stroke="#10b981"
                  strokeWidth="3"
                  pointerEvents="none"
                />

                {/* DATE */}

                <text
                  x={point.x}
                  y={chartHeight - 4}
                  textAnchor="middle"
                  className="text-[10px] fill-slate-500 dark:fill-slate-400 font-medium"
                  pointerEvents="none"
                >
                  {point.date}
                </text>

              </g>
            );
          })}
        </svg>

        {/* ===================================================
            TOOLTIP
        ==================================================== */}

        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none p-3 rounded-xl bg-slate-900/95 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xl border border-slate-700 dark:border-slate-300 text-xs w-52"
            style={{
              left: `${Math.min(
                75,
                Math.max(
                  8,
                  (hoveredPoint.x / chartWidth) *
                    100
                )
              )}%`,

              top: `${Math.max(
                5,
                (hoveredPoint.y /
                  chartHeight) *
                  100 -
                  35
              )}%`
            }}
          >

            <div className="flex items-center justify-between border-b border-slate-700/80 dark:border-slate-300/80 pb-1 mb-1.5 font-bold">

              <span>
                {hoveredPoint.date}
              </span>

              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 dark:text-emerald-700 font-semibold">
                Score: {hoveredPoint.chartScore}/5
              </span>

            </div>

            <div className="space-y-1">

              <div>
                <strong className="opacity-75">
                  Mood:
                </strong>{" "}
                {hoveredPoint.mood}
              </div>

              <div>
                <strong className="opacity-75">
                  Emotion:
                </strong>{" "}
                {hoveredPoint.emotion}
              </div>

              <div>
                <strong className="opacity-75">
                  Context:
                </strong>{" "}
                {hoveredPoint.context}
              </div>

              <p className="text-[11px] opacity-80 italic mt-1 pt-1 border-t border-slate-800 dark:border-slate-200">
                "{hoveredPoint.summary}"
              </p>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};