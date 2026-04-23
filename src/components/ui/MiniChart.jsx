/**
 * Lightweight pure-SVG line + bar chart. Designed for daily-series data
 * (orders/day, revenue/day). No external chart library.
 *
 * Props:
 *   data: [{ label: string, value: number, raw?: any }, ...]
 *   height: number (default 200)
 *   color: string (stroke/fill)
 *   formatValue: (v) => string (for hover tooltip label)
 *   variant: 'line' | 'bar'
 */
import { useState } from 'react';

export default function MiniChart({
  data = [],
  height = 200,
  color = '#e94560',
  formatValue = (v) => String(v),
  variant = 'line',
}) {
  const [hovered, setHovered] = useState(null);

  if (!data.length) {
    return (
      <div className="h-48 flex items-center justify-center text-white/30 text-sm">
        No data yet
      </div>
    );
  }

  const width = 800;
  const padding = { top: 16, right: 16, bottom: 28, left: 44 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const maxVal = Math.max(1, ...data.map((d) => d.value));
  const stepX = data.length > 1 ? chartW / (data.length - 1) : chartW;

  // Scale helpers
  const x = (i) => padding.left + i * stepX;
  const y = (v) => padding.top + chartH - (v / maxVal) * chartH;

  // Y-axis tick marks (0, 25%, 50%, 75%, 100%)
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((p) => ({
    y: padding.top + chartH - p * chartH,
    label: Math.round(maxVal * p),
  }));

  // Line path
  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(d.value)}`).join(' ');
  const areaPath = `${linePath} L${x(data.length - 1)},${padding.top + chartH} L${padding.left},${padding.top + chartH} Z`;

  const barWidth = Math.max(4, Math.min(28, (chartW / data.length) * 0.7));

  // x-axis label thinning so labels don't overlap
  const everyN = Math.max(1, Math.ceil(data.length / 8));

  return (
    <div className="w-full overflow-visible">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto select-none"
        preserveAspectRatio="none"
      >
        {/* Grid */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line
              x1={padding.left} x2={width - padding.right}
              y1={t.y} y2={t.y}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="3 4"
            />
            <text
              x={padding.left - 8} y={t.y + 3}
              textAnchor="end"
              fill="rgba(255,255,255,0.4)"
              fontSize="10"
            >
              {t.label}
            </text>
          </g>
        ))}

        {variant === 'line' ? (
          <>
            <defs>
              <linearGradient id="miniChartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d={areaPath} fill="url(#miniChartFill)" />
            <path d={linePath} fill="none" stroke={color} strokeWidth="2" />
            {data.map((d, i) => (
              <circle
                key={i}
                cx={x(i)} cy={y(d.value)}
                r={hovered === i ? 5 : 3}
                fill={color}
                stroke="rgba(12,14,35,1)"
                strokeWidth="2"
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'pointer', transition: 'r 120ms' }}
              />
            ))}
          </>
        ) : (
          data.map((d, i) => (
            <rect
              key={i}
              x={x(i) - barWidth / 2}
              y={y(d.value)}
              width={barWidth}
              height={padding.top + chartH - y(d.value)}
              fill={color}
              opacity={hovered === i ? 1 : 0.75}
              rx="3"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: 'pointer', transition: 'opacity 120ms' }}
            />
          ))
        )}

        {/* X labels */}
        {data.map((d, i) => {
          if (i % everyN !== 0 && i !== data.length - 1) return null;
          return (
            <text
              key={i}
              x={x(i)} y={height - 8}
              textAnchor="middle"
              fill="rgba(255,255,255,0.4)"
              fontSize="10"
            >
              {d.label}
            </text>
          );
        })}

        {/* Hover tooltip */}
        {hovered !== null && (
          <g pointerEvents="none">
            <line
              x1={x(hovered)} x2={x(hovered)}
              y1={padding.top} y2={padding.top + chartH}
              stroke="rgba(255,255,255,0.15)"
              strokeDasharray="3 3"
            />
            <g transform={`translate(${Math.min(x(hovered) + 10, width - 140)}, ${Math.max(padding.top + 4, y(data[hovered].value) - 32)})`}>
              <rect width="130" height="42" rx="8" fill="rgba(12,14,35,0.95)" stroke="rgba(255,255,255,0.1)" />
              <text x="10" y="16" fill="rgba(255,255,255,0.5)" fontSize="10">{data[hovered].label}</text>
              <text x="10" y="32" fill="#fff" fontSize="13" fontWeight="600">
                {formatValue(data[hovered].value)}
              </text>
            </g>
          </g>
        )}
      </svg>
    </div>
  );
}
