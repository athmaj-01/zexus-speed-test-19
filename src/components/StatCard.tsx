import { motion } from "framer-motion";
import { useRef, type ReactNode } from "react";

type Props = {
  label: string;
  value: string | number;
  unit?: string;
  icon?: ReactNode;
  accent?: string;
};

export function StatCard({ label, value, unit, icon, accent = "var(--neon-blue)" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateZ(0)`;
  };
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass rounded-2xl p-5 relative overflow-hidden transition-transform duration-200 will-change-transform"
    >
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-30 blur-2xl"
        style={{ background: accent }}
      />
      <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        <span style={{ color: accent }}>{icon}</span>
        {label}
      </div>
      <div className="mt-3 flex items-baseline gap-1">
        <span className="font-display text-3xl md:text-4xl font-bold text-foreground">{value}</span>
        {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
      </div>
    </motion.div>
  );
}
