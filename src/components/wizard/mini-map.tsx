'use client';

import { useArchitecture } from '@/hooks/useArchitecture';
import type { Architecture, OrgFunction, System, Integration } from '@/lib/types';

// ─── Colour mapping (matches function-picker tints) ───

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

// ─── Layout constants ───

const FUNC_WIDTH = 120;
const FUNC_HEIGHT = 40;
const FUNC_GAP = 12;
const FUNC_Y = 20;
const FUNC_RX = 8;

const SYS_RADIUS = 14;
const SYS_GAP_X = 40;
const SYS_START_Y = FUNC_Y + FUNC_HEIGHT + 40;
const SYS_ROW_HEIGHT = 44;
const SYS_PER_ROW = 2;

// ─── Helpers ───

interface NodePosition {
  x: number;
  y: number;
}

const FUNC_COLS = 3;

function computeFuncX(index: number): number {
  const col = index % FUNC_COLS;
  return 20 + col * (FUNC_WIDTH + FUNC_GAP);
}

function computeFuncY(index: number): number {
  const row = Math.floor(index / FUNC_COLS);
  return FUNC_Y + row * (FUNC_HEIGHT + FUNC_GAP);
}

function computeSystemPositions(
  functions: OrgFunction[],
  systems: System[],
): Map<string, NodePosition> {
  const positions = new Map<string, NodePosition>();

  const funcBottomY = functions.length > 0
    ? computeFuncY(functions.length - 1) + FUNC_HEIGHT
    : FUNC_Y + FUNC_HEIGHT;
  const systemStartY = funcBottomY + 40;

  functions.forEach((fn, fnIndex) => {
    const fnCenterX = computeFuncX(fnIndex) + FUNC_WIDTH / 2;
    const fnSystems = systems.filter((s) => s.functionIds.includes(fn.id));

    fnSystems.forEach((sys, sysIndex) => {
      const row = Math.floor(sysIndex / SYS_PER_ROW);
      const col = sysIndex % SYS_PER_ROW;
      const offsetX = (col - Math.min(fnSystems.length - 1, SYS_PER_ROW - 1) / 2) * SYS_GAP_X;
      positions.set(sys.id, {
        x: fnCenterX + offsetX,
        y: systemStartY + row * SYS_ROW_HEIGHT,
      });
    });
  });

  // Systems not assigned to any function — place at end
  const unassigned = systems.filter((s) => !positions.has(s.id));
  const startX = functions.length > 0
    ? computeFuncX(functions.length - 1) + FUNC_WIDTH + FUNC_GAP
    : 16;

  unassigned.forEach((sys, i) => {
    const col = i % SYS_PER_ROW;
    const row = Math.floor(i / SYS_PER_ROW);
    positions.set(sys.id, {
      x: startX + col * SYS_GAP_X,
      y: systemStartY + row * SYS_ROW_HEIGHT,
    });
  });

  return positions;
}

function computeViewBox(
  functions: OrgFunction[],
  systemPositions: Map<string, NodePosition>,
): string {
  let maxX = 420;
  let maxY = 180;

  if (functions.length > 0) {
    maxX = Math.max(maxX, computeFuncX(functions.length - 1) + FUNC_WIDTH + 16);
    maxY = Math.max(maxY, computeFuncY(functions.length - 1) + FUNC_HEIGHT + 40);
  }

  systemPositions.forEach((pos) => {
    maxX = Math.max(maxX, pos.x + SYS_RADIUS + 16);
    maxY = Math.max(maxY, pos.y + SYS_RADIUS + 16);
  });

  return `0 0 ${maxX} ${maxY}`;
}

// ─── Component ───

export function MiniMap() {
  const { architecture } = useArchitecture();
  if (!architecture) return null;

  const { functions, systems, integrations } = architecture;
  const hasEntities = functions.length > 0 || systems.length > 0;

  const systemPositions = computeSystemPositions(functions, systems);
  const viewBox = hasEntities ? computeViewBox(functions, systemPositions) : '0 0 420 180';

  const entitySummary = hasEntities
    ? `Architecture map with ${functions.length} function${functions.length !== 1 ? 's' : ''} and ${systems.length} system${systems.length !== 1 ? 's' : ''}`
    : 'Empty architecture map';

  return (
    <svg
      role="img"
      aria-label={entitySummary}
      viewBox={viewBox}
      className="w-full h-auto"
    >
      {!hasEntities && (
        <text
          x="210"
          y="90"
          textAnchor="middle"
          dominantBaseline="middle"
          className="fill-stone-400"
          fontSize="14"
        >
          Your map will appear here
        </text>
      )}

      {/* Integration lines (render first so they sit behind nodes) */}
      {integrations.map((intg) => {
        const source = systemPositions.get(intg.sourceSystemId);
        const target = systemPositions.get(intg.targetSystemId);
        if (!source || !target) return null;

        const midX = (source.x + target.x) / 2;
        const midY = Math.min(source.y, target.y) - 12;

        return (
          <path
            key={intg.id}
            data-integration-id={intg.id}
            d={`M ${source.x} ${source.y} Q ${midX} ${midY} ${target.x} ${target.y}`}
            fill="none"
            stroke="#d1d5db"
            strokeWidth="1"
            className="motion-safe:transition-opacity motion-safe:duration-300"
          />
        );
      })}

      {/* Function blocks */}
      {functions.map((fn, i) => {
        const x = computeFuncX(i);
        const y = computeFuncY(i);
        const color = FUNCTION_COLORS[fn.type] ?? FUNCTION_COLORS.custom;

        return (
          <g
            key={fn.id}
            className="motion-safe:transition-all motion-safe:duration-300"
          >
            <rect
              data-function-id={fn.id}
              x={x}
              y={y}
              width={FUNC_WIDTH}
              height={FUNC_HEIGHT}
              rx={FUNC_RX}
              fill={color}
              opacity={0.85}
            />
            <text
              x={x + FUNC_WIDTH / 2}
              y={y + FUNC_HEIGHT / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize="12"
              fontWeight="600"
              fill="#1f2937"
              className="pointer-events-none"
            >
              {fn.name.length > 12 ? `${fn.name.slice(0, 11)}…` : fn.name}
            </text>
          </g>
        );
      })}

      {/* Connector lines from function to its systems */}
      {functions.map((fn, fnIndex) => {
        const fnCenterX = computeFuncX(fnIndex) + FUNC_WIDTH / 2;
        const fnBottomY = computeFuncY(fnIndex) + FUNC_HEIGHT;
        const fnSystems = systems.filter((s) => s.functionIds.includes(fn.id));

        return fnSystems.map((sys) => {
          const pos = systemPositions.get(sys.id);
          if (!pos) return null;
          return (
            <line
              key={`${fn.id}-${sys.id}`}
              x1={fnCenterX}
              y1={fnBottomY}
              x2={pos.x}
              y2={pos.y - SYS_RADIUS}
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          );
        });
      })}

      {/* System nodes */}
      {systems.map((sys) => {
        const pos = systemPositions.get(sys.id);
        if (!pos) return null;

        return (
          <g
            key={sys.id}
            className="motion-safe:transition-all motion-safe:duration-300"
          >
            <circle
              data-system-id={sys.id}
              cx={pos.x}
              cy={pos.y}
              r={SYS_RADIUS}
              fill="#f3f4f6"
              stroke="#9ca3af"
              strokeWidth="1"
            />
            <text
              x={pos.x}
              y={pos.y + SYS_RADIUS + 14}
              textAnchor="middle"
              fontSize="10"
              fill="#6b7280"
              className="pointer-events-none"
            >
              {sys.name.length > 12 ? `${sys.name.slice(0, 11)}…` : sys.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
