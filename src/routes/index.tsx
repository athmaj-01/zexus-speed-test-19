import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ArrowDown, ArrowUp, Gauge, Globe, Wifi, Zap, Tv, Gamepad2, Video, History } from "lucide-react";
import { Background3D } from "@/components/Background3D";
import { Particles } from "@/components/Particles";
import { Speedometer } from "@/components/Speedometer";
import { StatCard } from "@/components/StatCard";
import { SpeedGraph } from "@/components/SpeedGraph";
import { AIOrb } from "@/components/AIOrb";
import {
  measurePing, measureDownload, measureUpload, fetchIpInfo, rateNetwork,
  type IpInfo,
} from "@/lib/speedtest";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zexus Speed — Premium Internet Speed Test" },
      { name: "description", content: "Cinematic, AI-powered internet speed test. Measure download, upload, ping & jitter with stunning visuals." },
      { property: "og:title", content: "Zexus Speed" },
      { property: "og:description", content: "Premium futuristic speed test." },
    ],
  }),
  component: Index,
});

type Stage = "idle" | "ping" | "download" | "upload" | "done";
type Result = {
  download: number; upload: number; ping: number; jitter: number;
  rating: ReturnType<typeof rateNetwork>;
  at: number;
};

function Index() {
  const [stage, setStage] = useState<Stage>("idle");
  const [live, setLive] = useState(0);
  const [samples, setSamples] = useState<number[]>([]);
  const [result, setResult] = useState<Partial<Result>>({});
  const [history, setHistory] = useState<Result[]>([]);
  const [ipInfo, setIpInfo] = useState<IpInfo | null>(null);

  useEffect(() => {
    fetchIpInfo().then(setIpInfo);
    const saved = localStorage.getItem("zexus-history");
    if (saved) try { setHistory(JSON.parse(saved)); } catch {}
  }, []);

  const runTest = async () => {
    setStage("ping");
    setLive(0);
    setSamples([]);
    setResult({});

    const { ping, jitter } = await measurePing();
    setResult((r) => ({ ...r, ping, jitter }));

    setStage("download");
    const dlSamples: number[] = [];
    const dl = await measureDownload(8000, (m) => {
      setLive(m);
      dlSamples.push(m);
      setSamples([...dlSamples]);
    });
    setResult((r) => ({ ...r, download: dl }));

    setStage("upload");
    setLive(0);
    const ulSamples: number[] = [];
    const ul = await measureUpload(6000, (m) => {
      setLive(m);
      ulSamples.push(m);
      setSamples((s) => [...s, m]);
    });

    const rating = rateNetwork(dl, ping);
    const final: Result = { download: dl, upload: ul, ping, jitter, rating, at: Date.now() };
    setResult(final);
    setStage("done");

    const next = [final, ...history].slice(0, 5);
    setHistory(next);
    localStorage.setItem("zexus-history", JSON.stringify(next));
  };

  const stageLabel = {
    idle: "Ready",
    ping: "Pinging…",
    download: "Download",
    upload: "Upload",
    done: "Complete",
  }[stage];

  const meterValue = stage === "done" ? (result.download || 0) : live;
  const aiInsight = result.download
    ? `Your ${result.download.toFixed(0)} Mbps down / ${result.upload?.toFixed(0)} up with ${result.ping}ms ping is ${result.rating?.label.toLowerCase()}. ${result.download! > 25 ? "Great for 4K streaming." : "Consider HD instead of 4K."} ${result.ping! < 50 ? "Latency is gaming-friendly." : "Latency may affect competitive gaming."}`
    : undefined;

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <Background3D />
      <Particles />

      {/* Nav */}
      <header className="relative z-10 px-6 md:px-12 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center neon-glow"
               style={{ background: "var(--gradient-neon)" }}>
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-display text-xl font-bold tracking-wider">
            ZEXUS<span className="text-gradient">SPEED</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-2 glass rounded-full px-4 py-2 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-muted-foreground">
            {ipInfo ? `${ipInfo.ip} · ${ipInfo.city}, ${ipInfo.country}` : "Detecting…"}
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 px-6 md:px-12 pt-8 md:pt-16 pb-24">
        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs uppercase tracking-widest mb-6"
          >
            <Activity className="w-3.5 h-3.5 text-gradient" />
            <span className="text-muted-foreground">AI-Powered Network Diagnostics</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold leading-[1.05] mb-4"
          >
            Measure your internet<br />
            <span className="text-gradient">at the speed of light.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-xl mx-auto mb-12"
          >
            Cinematic, real-time speed analysis with AI insights. Download, upload, ping, jitter — all in one premium dashboard.
          </motion.p>

          {/* Speedometer */}
          <div className="flex justify-center mb-10">
            <Speedometer value={meterValue} status={stageLabel} />
          </div>

          {/* CTA */}
          <motion.button
            onClick={runTest}
            disabled={stage !== "idle" && stage !== "done"}
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            className="relative inline-flex items-center gap-3 px-10 py-4 rounded-full font-display font-bold text-lg uppercase tracking-widest text-white disabled:opacity-60 disabled:cursor-not-allowed animate-pulse-glow"
            style={{ background: "var(--gradient-neon)" }}
          >
            <Gauge className="w-5 h-5" />
            {stage === "idle" ? "Start Test" : stage === "done" ? "Test Again" : "Testing…"}
          </motion.button>
        </div>
      </section>

      {/* Live Graph + Results */}
      <section className="relative z-10 px-6 md:px-12 pb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6 mb-8">
          <div className="glass rounded-2xl p-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Live Throughput</span>
              <span className="font-mono text-xs text-gradient-cyber">{live.toFixed(1)} Mbps</span>
            </div>
            <SpeedGraph samples={samples} />
          </div>
          <div className="glass rounded-2xl p-6 flex flex-col justify-between">
            <div>
              <span className="text-xs uppercase tracking-widest text-muted-foreground">Network Quality</span>
              <div className="font-display text-4xl font-bold mt-2"
                   style={{ color: result.rating?.color || "var(--neon-blue)" }}>
                {result.rating?.label || "—"}
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-3">
              <Globe className="w-4 h-4 inline mr-1.5" />
              ISP: <span className="text-foreground">{ipInfo?.isp || "Detecting…"}</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Download" value={result.download?.toFixed(1) || "—"} unit="Mbps"
                    icon={<ArrowDown className="w-4 h-4" />} accent="var(--neon-cyan)" />
          <StatCard label="Upload" value={result.upload?.toFixed(1) || "—"} unit="Mbps"
                    icon={<ArrowUp className="w-4 h-4" />} accent="var(--neon-purple)" />
          <StatCard label="Ping" value={result.ping ?? "—"} unit="ms"
                    icon={<Activity className="w-4 h-4" />} accent="var(--neon-blue)" />
          <StatCard label="Jitter" value={result.jitter ?? "—"} unit="ms"
                    icon={<Wifi className="w-4 h-4" />} accent="var(--neon-pink)" />
        </div>
      </section>

      {/* Why slow + Compare */}
      <section className="relative z-10 px-6 md:px-12 pb-24">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
          <div className="glass rounded-2xl p-7 relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full blur-3xl opacity-20"
                 style={{ background: "var(--neon-purple)" }} />
            <h3 className="font-display text-2xl font-bold mb-2 text-gradient">
              Why your internet feels slow
            </h3>
            <p className="text-sm text-muted-foreground mb-5">AI-driven analysis of common bottlenecks.</p>
            <ul className="space-y-3 text-sm">
              {[
                ["High ping", "Causes lag in video calls and online games."],
                ["Low upload", "Slows cloud backups and screen sharing."],
                ["Jitter", "Inconsistent latency disrupts streaming."],
                ["WiFi distance", "Signal degrades sharply past 10m."],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ background: "var(--neon-cyan)", boxShadow: "0 0 8px var(--neon-cyan)" }} />
                  <div><span className="font-medium">{t}.</span>{" "}<span className="text-muted-foreground">{d}</span></div>
                </li>
              ))}
            </ul>
          </div>

          <div className="glass rounded-2xl p-7">
            <h3 className="font-display text-2xl font-bold mb-2 text-gradient-cyber">
              Compare to real-world needs
            </h3>
            <p className="text-sm text-muted-foreground mb-5">How your speed stacks up.</p>
            <div className="space-y-4">
              {[
                { icon: Video, label: "Zoom HD calls", needed: 3 },
                { icon: Tv, label: "Netflix 4K", needed: 25 },
                { icon: Gamepad2, label: "Cloud Gaming", needed: 35 },
                { icon: Tv, label: "8K Streaming", needed: 80 },
              ].map(({ icon: Icon, label, needed }) => {
                const have = result.download || 0;
                const ok = have >= needed;
                const pct = Math.min(100, (have / (needed * 1.5)) * 100);
                return (
                  <div key={label}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="flex items-center gap-2"><Icon className="w-3.5 h-3.5" />{label}</span>
                      <span className={ok ? "text-emerald-400" : "text-muted-foreground"}>
                        {needed} Mbps {ok ? "✓" : ""}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                      <motion.div className="h-full rounded-full"
                                  initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                                  transition={{ duration: 0.8 }}
                                  style={{ background: "var(--gradient-neon)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* History */}
      <AnimatePresence>
        {history.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className="relative z-10 px-6 md:px-12 pb-24"
          >
            <div className="max-w-6xl mx-auto">
              <h3 className="font-display text-xl font-bold mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-gradient" /> Recent Tests
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {history.map((h) => (
                  <div key={h.at} className="glass rounded-xl p-4">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">
                      {new Date(h.at).toLocaleTimeString()}
                    </div>
                    <div className="font-display text-2xl font-bold text-gradient">{h.download.toFixed(0)}</div>
                    <div className="text-xs text-muted-foreground">Mbps · {h.ping}ms</div>
                    <div className="text-xs mt-2" style={{ color: h.rating.color }}>{h.rating.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      <footer className="relative z-10 px-6 md:px-12 py-10 text-center text-xs text-muted-foreground border-t border-white/5">
        <span className="font-display">ZEXUS SPEED</span> · Built for the future of the web
      </footer>

      <AIOrb insight={aiInsight} />
    </div>
  );
}
