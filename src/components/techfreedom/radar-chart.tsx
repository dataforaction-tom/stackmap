import { RISK_DIMENSIONS } from '@/lib/techfreedom/risk';
import type { RiskDimensionKey } from '@/lib/techfreedom/types';

export interface RadarChartProps {
  scores: Record<RiskDimensionKey, number>;
  size?: number;
}

const AXIS_COUNT = 5;
const MAX_SCORE = 5;
const GRID_LEVELS = [1, 2, 3, 4, 5];

function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleIndex: number,
): { x: number; y: number } {
  // Start from top (- PI/2) and go clockwise
  const angle = (2 * Math.PI * angleIndex) / AXIS_COUNT - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function polygonPoints(cx: number, cy: number, radius: number, values?: number[]): string {
  return Array.from({ length: AXIS_COUNT }, (_, i) => {
    const r = values ? (values[i] / MAX_SCORE) * radius : radius;
    const { x, y } = polarToCartesian(cx, cy, r, i);
    return `${x},${y}`;
  }).join(' ');
}

export function RadarChart({ scores, size = 300 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.35;
  const labelRadius = size * 0.46;

  const dimensionKeys: RiskDimensionKey[] = RISK_DIMENSIONS.map((d) => d.key);
  const values = dimensionKeys.map((k) => scores[k]);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label="Radar chart showing risk scores across 5 dimensions"
    >
      {/* Grid polygons */}
      {GRID_LEVELS.map((level) => (
        <polygon
          key={`grid-${level}`}
          points={polygonPoints(cx, cy, (level / MAX_SCORE) * radius)}
          fill="none"
          stroke="currentColor"
          strokeWidth={1}
          className="text-primary-200"
          opacity={0.6}
        />
      ))}

      {/* Axis lines */}
      {dimensionKeys.map((_, i) => {
        const { x, y } = polarToCartesian(cx, cy, radius, i);
        return (
          <line
            key={`axis-${i}`}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="currentColor"
            strokeWidth={1}
            className="text-primary-200"
            opacity={0.4}
          />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={polygonPoints(cx, cy, radius, values)}
        className="fill-primary-600 stroke-primary-700"
        fillOpacity={0.25}
        strokeWidth={2}
      />

      {/* Data points */}
      {dimensionKeys.map((_, i) => {
        const r = (values[i] / MAX_SCORE) * radius;
        const { x, y } = polarToCartesian(cx, cy, r, i);
        return (
          <circle
            key={`point-${i}`}
            cx={x}
            cy={y}
            r={3}
            className="fill-primary-600"
          />
        );
      })}

      {/* Axis labels */}
      {RISK_DIMENSIONS.map((dim, i) => {
        const { x, y } = polarToCartesian(cx, cy, labelRadius, i);
        return (
          <text
            key={`label-${dim.key}`}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-primary-800 text-xs font-body"
          >
            {dim.label}
          </text>
        );
      })}
    </svg>
  );
}
