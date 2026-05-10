export function ProgressRing({ progress, label }: { progress: number; label: string }) {
  const r = 28, c = 2 * Math.PI * r;
  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={r} fill="none" stroke="oklch(1 0 0 / 0.08)" strokeWidth="4" />
        <circle
          cx="32" cy="32" r={r} fill="none"
          stroke="url(#ringGrad)" strokeWidth="4" strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          style={{ transition: "stroke-dashoffset 0.4s" }}
        />
        <defs>
          <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.85 0.18 200)" />
            <stop offset="100%" stopColor="oklch(0.7 0.25 320)" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
    </div>
  );
}
