import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Sparkles, X } from "lucide-react";

export function AIOrb({ insight }: { insight?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="glass-strong rounded-2xl p-5 mb-3 w-72 text-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-gradient font-display font-bold">Zexus AI</span>
              <button onClick={() => setOpen(false)}><X className="w-4 h-4 text-muted-foreground" /></button>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              {insight ||
                "Run a test and I'll analyze your connection — latency, throughput, and what your speed actually means for streaming, gaming, and calls."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        className="animate-orb relative w-16 h-16 rounded-full flex items-center justify-center"
        style={{
          background: "var(--gradient-neon)",
          boxShadow: "0 0 30px var(--neon-purple), 0 0 60px var(--neon-blue)",
        }}
      >
        <Sparkles className="w-7 h-7 text-white drop-shadow" />
        <span className="absolute inset-0 rounded-full animate-ping opacity-30" style={{ background: "var(--neon-purple)" }} />
      </motion.button>
    </div>
  );
}
