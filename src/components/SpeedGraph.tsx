import { useMemo } from "react";

export function SpeedGraph({ samples }: { samples: number[] }) {
  const { path, area, max } = useMemo(() => {
    const w = 600;
    const h = 140;
    const max = Math.max(10, ...samples);
    if (samples.length < 2) return { path: "", area: "", max };
    const step = w / (samples.length - 1);
    const pts = samples.map((v, i) => [i * step, h - (v / max) * h] as const);
    const path = pts.map(([x, y], i) => (i ? `L${x},${y}` : `M${x},${y}`)).join(" ");
    const area = `${path} L${w},${h} L0,${h} Z`;
    return { path, area, max };
  }, [samples]);

  return (
    <svg viewBox="0 0 600 140" className="w-full h-32">
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="oklch(0.85 0.18 200)" />
          <stop offset="100%" stopColor="oklch(0.7 0.25 320)" />
        </linearGradient>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.7 0.22 260 / 0.5)" />
          <stop offset="100%" stopColor="oklch(0.7 0.22 260 / 0)" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#areaGrad)" />
      <path d={path} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <text x="8" y="14" fill="oklch(0.65 0.04 260)" fontSize="10" fontFamily="monospace">
        peak {max.toFixed(0)} Mbps
      </text>
    </svg>
  );
}
