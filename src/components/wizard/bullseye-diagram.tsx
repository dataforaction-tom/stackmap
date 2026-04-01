'use client';

import type { System, OrgFunction } from '@/lib/types';
import { getImportanceTier } from '@/lib/importance';

const FUNCTION_COLORS: Record<string, string> = {
  finance: '#34d399',
  governance: '#60a5fa',
  people: '#a78bfa',
  fundraising: '#fbbf24',
  communications: '#fb7185',
  service_delivery: '#38bdf8',
  operations: '#a8a29e',
  data_reporting: '#2dd4bf',
  custom: '#63a576',
};

const RING_FILLS = ['#dcfce7', '#fef3c7', '#f3f4f6']; // core, important, peripheral
const RING_STROKES = ['#22c55e', '#f59e0b', '#9ca3af'];
const RING_LABELS = ['Core', 'Important', 'Peripheral'];

interface BullseyeDiagramProps {
  systems: System[];
  functions: OrgFunction[];
}

export function BullseyeDiagram({ systems, functions }: BullseyeDiagramProps) {
  const funcMap = new Map(functions.map(f => [f.id, f]));

  // Separate scored vs unscored shadow systems
  const scored = systems.filter(s => s.importance !== undefined);
  const unscoredShadow = systems.filter(s => s.isShadow && s.importance === undefined);

  // Dynamic sizing
  const baseRingWidth = 50;
  const systemsPerRing = [
    scored.filter(s => (s.importance ?? 0) >= 8).length,
    scored.filter(s => (s.importance ?? 0) >= 4 && (s.importance ?? 0) < 8).length,
    scored.filter(s => (s.importance ?? 0) < 4).length,
  ];
  const maxPerRing = Math.max(...systemsPerRing, 1);
  const ringScale = maxPerRing > 6 ? 1 + (maxPerRing - 6) * 0.15 : 1;
  const ringWidth = baseRingWidth * ringScale;
  const outerRadius = ringWidth * 3;
  const shadowRadius = outerRadius + ringWidth * 0.8;
  const totalRadius = unscoredShadow.length > 0 ? shadowRadius + 30 : outerRadius + 30;
  const size = Math.max(300, totalRadius * 2 + 60);
  const cx = size / 2;
  const cy = size / 2;

  // Map score to distance from centre
  function scoreToRadius(score: number): number {
    if (score >= 8) {
      const t = (10 - score) / 2;
      return t * ringWidth;
    }
    if (score >= 4) {
      const t = (7 - score) / 3;
      return ringWidth + t * ringWidth;
    }
    const t = (3 - score) / 2;
    return ringWidth * 2 + t * ringWidth;
  }

  // Get function color for a system
  function getColor(system: System): string {
    const funcId = system.functionIds[0];
    if (!funcId) return '#63a576';
    const func = funcMap.get(funcId);
    if (!func) return '#63a576';
    return FUNCTION_COLORS[func.type] ?? '#63a576';
  }

  // Distribute systems angularly
  function distributeAngles(items: { id: string }[]): Map<string, number> {
    const angles = new Map<string, number>();
    if (items.length === 0) return angles;
    const step = (2 * Math.PI) / items.length;
    const offset = -Math.PI / 2;
    items.forEach((item, i) => {
      angles.set(item.id, offset + i * step);
    });
    return angles;
  }

  const scoredAngles = distributeAngles(scored);
  const shadowAngles = distributeAngles(unscoredShadow);

  const DOT_R = 6;

  return (
    <div>
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width="100%"
        height="100%"
        role="img"
        aria-label="Importance bullseye diagram"
        className="max-w-full"
      >
        {/* Rings — draw outermost first */}
        {[2, 1, 0].map(i => {
          const r = ringWidth * (i + 1);
          return (
            <circle
              key={`ring-${i}`}
              cx={cx}
              cy={cy}
              r={r}
              fill={RING_FILLS[i]}
              stroke={RING_STROKES[i]}
              strokeWidth={1.5}
            />
          );
        })}

        {/* Scored systems */}
        {scored.map(system => {
          const angle = scoredAngles.get(system.id) ?? 0;
          const r = scoreToRadius(system.importance!);
          const x = cx + r * Math.cos(angle);
          const y = cy + r * Math.sin(angle);
          const color = getColor(system);
          const isDashed = system.isShadow;

          return (
            <g key={system.id}>
              <circle
                cx={x}
                cy={y}
                r={DOT_R}
                fill={color}
                stroke={color}
                strokeWidth={isDashed ? 2 : 1}
                strokeDasharray={isDashed ? '4 2' : undefined}
                opacity={0.9}
              />
              <text
                x={x + DOT_R + 3}
                y={y + 3}
                fontSize={9}
                fill="#1c3b27"
              >
                {system.name}
              </text>
              <title>{`${system.name}: ${system.importance}/10 (${getImportanceTier(system.importance)?.label ?? 'Unscored'})`}</title>
            </g>
          );
        })}

        {/* Unscored shadow systems — outside the rings */}
        {unscoredShadow.map(system => {
          const angle = shadowAngles.get(system.id) ?? 0;
          const x = cx + shadowRadius * Math.cos(angle);
          const y = cy + shadowRadius * Math.sin(angle);
          const color = getColor(system);

          return (
            <g key={system.id}>
              <circle
                cx={x}
                cy={y}
                r={DOT_R}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeDasharray="4 2"
                opacity={0.7}
              />
              <text
                x={x + DOT_R + 3}
                y={y + 3}
                fontSize={9}
                fill="#788866"
                fontStyle="italic"
              >
                {system.name}
              </text>
              <title>{`${system.name}: Shadow tool (unscored)`}</title>
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-3 text-xs">
        {RING_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full border"
              style={{ backgroundColor: RING_FILLS[i], borderColor: RING_STROKES[i] }}
            />
            <span style={{ color: RING_STROKES[i] }} className="font-medium">{label}</span>
          </div>
        ))}
        {unscoredShadow.length > 0 && (
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full border border-dashed"
              style={{ borderColor: '#788866' }}
            />
            <span className="font-medium text-[#788866]">Shadow</span>
          </div>
        )}
      </div>
    </div>
  );
}
