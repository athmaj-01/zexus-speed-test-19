import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

type Props = {
  value: number; // current mbps
  max?: number;
  label?: string;
  unit?: string;
  status?: string;
};

export function Speedometer({ value, max = 300, label = "Mbps", unit = "Mbps", status }: Props) {
  const clamped = Math.min(value, max);
  const pct = clamped / max;
  // arc from -135deg to +135deg (270° sweep)
  const angle = -135 + pct * 270;

  const spring = useSpring(0, { stiffness: 60, damping: 20 });
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);
  const display = useTransform(spring, (v) => v.toFixed(v < 10 ? 1 : 0));

  const size = 360;
  const stroke = 14;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const arcLen = c * (270 / 360);
  const dashOffset = arcLen * (1 - pct);

  return (
    <div className="relative" style={{ width: size, height: size, maxWidth: "100%" }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-[135deg]">
        <defs>
          <linearGradient id="speedGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="oklch(0.85 0.18 200)" />
            <stop offset="50%" stopColor="oklch(0.7 0.22 260)" />
            <stop offset="100%" stopColor="oklch(0.7 0.25 320)" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="oklch(1 0 0 / 0.06)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLen} ${c}`}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#speedGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${arcLen} ${c}`}
          strokeDashoffset={dashOffset}
          filter="url(#glow)"
          initial={false}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        />
      </svg>

      {/* tick marks */}
      <div className="absolute inset-0">
        {Array.from({ length: 28 }).map((_, i) => {
          const a = -135 + (i / 27) * 270;
          return (
            <div
              key={i}
              className="absolute left-1/2 top-1/2 origin-bottom"
              style={{
                width: 2,
                height: i % 4 === 0 ? 18 : 10,
                marginLeft: -1,
                marginTop: -(size / 2 - 30),
                background: i / 27 < pct ? "oklch(0.85 0.18 240)" : "oklch(1 0 0 / 0.15)",
                transform: `rotate(${a}deg)`,
                boxShadow: i / 27 < pct ? "0 0 8px oklch(0.85 0.18 240)" : "none",
              }}
            />
          );
        })}
      </div>

      {/* needle */}
      <motion.div
        className="absolute left-1/2 top-1/2 origin-bottom"
        style={{
          width: 4,
          height: size / 2 - 50,
          marginLeft: -2,
          marginTop: -(size / 2 - 50),
          background: "linear-gradient(to top, transparent, var(--neon-cyan))",
          boxShadow: "0 0 12px var(--neon-cyan)",
          borderRadius: 4,
        }}
        animate={{ rotate: angle }}
        transition={{ type: "spring", stiffness: 50, damping: 15 }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: 22,
          height: 22,
          background: "var(--gradient-neon)",
          boxShadow: "0 0 24px var(--neon-purple)",
        }}
      />

      {/* center readout */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="mt-16 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {status || label}
        </div>
        <motion.div className="font-display text-6xl md:text-7xl font-bold text-gradient leading-none mt-1">
          {display}
        </motion.div>
        <div className="text-sm text-muted-foreground mt-1">{unit}</div>
      </div>
    </div>
  );
}
