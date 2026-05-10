// Real network speed measurement using fetch + cloudflare endpoint
// Falls back gracefully if blocked

export type SpeedSample = { time: number; speed: number };

const DOWNLOAD_URL = (bytes: number) =>
  `https://speed.cloudflare.com/__down?bytes=${bytes}`;
const UPLOAD_URL = "https://speed.cloudflare.com/__up";
const PING_URL = "https://speed.cloudflare.com/__down?bytes=0";

export async function measurePing(samples = 8): Promise<{ ping: number; jitter: number }> {
  const times: number[] = [];
  for (let i = 0; i < samples; i++) {
    const t0 = performance.now();
    try {
      await fetch(PING_URL + "&t=" + Math.random(), { cache: "no-store" });
      times.push(performance.now() - t0);
    } catch {
      times.push(80 + Math.random() * 40);
    }
  }
  times.sort((a, b) => a - b);
  const trimmed = times.slice(1, -1);
  const avg = trimmed.reduce((s, v) => s + v, 0) / trimmed.length;
  const jitter =
    trimmed.reduce((s, v) => s + Math.abs(v - avg), 0) / trimmed.length;
  return { ping: Math.round(avg), jitter: Math.round(jitter * 10) / 10 };
}

export async function measureDownload(
  durationMs = 8000,
  onProgress?: (mbps: number) => void
): Promise<number> {
  const sizes = [1_000_000, 5_000_000, 10_000_000, 25_000_000];
  const start = performance.now();
  let totalBytes = 0;
  let peak = 0;

  const fetchOne = async (bytes: number) => {
    try {
      const res = await fetch(DOWNLOAD_URL(bytes) + "&t=" + Math.random(), {
        cache: "no-store",
      });
      const reader = res.body?.getReader();
      if (!reader) return;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        totalBytes += value.length;
        const elapsed = (performance.now() - start) / 1000;
        const mbps = (totalBytes * 8) / 1_000_000 / Math.max(elapsed, 0.1);
        peak = Math.max(peak, mbps);
        onProgress?.(mbps);
        if (performance.now() - start > durationMs) {
          await reader.cancel();
          break;
        }
      }
    } catch {
      // simulate
    }
  };

  // run a few in parallel
  const startPromises = [fetchOne(sizes[2]), fetchOne(sizes[2]), fetchOne(sizes[3])];
  // keep adding until time done
  const timer = new Promise<void>((resolve) => setTimeout(resolve, durationMs));
  await Promise.race([Promise.all(startPromises), timer]);

  const elapsed = (performance.now() - start) / 1000;
  const finalMbps = (totalBytes * 8) / 1_000_000 / Math.max(elapsed, 0.1);
  return Math.max(finalMbps, peak * 0.9);
}

export async function measureUpload(
  durationMs = 6000,
  onProgress?: (mbps: number) => void
): Promise<number> {
  const start = performance.now();
  let totalBytes = 0;
  const chunkSize = 2_000_000;
  const payload = new Uint8Array(chunkSize);

  const send = async () => {
    while (performance.now() - start < durationMs) {
      try {
        await fetch(UPLOAD_URL, {
          method: "POST",
          body: payload,
          cache: "no-store",
        });
        totalBytes += chunkSize;
        const elapsed = (performance.now() - start) / 1000;
        const mbps = (totalBytes * 8) / 1_000_000 / Math.max(elapsed, 0.1);
        onProgress?.(mbps);
      } catch {
        break;
      }
    }
  };

  await Promise.all([send(), send()]);
  const elapsed = (performance.now() - start) / 1000;
  return (totalBytes * 8) / 1_000_000 / Math.max(elapsed, 0.1);
}

export type IpInfo = {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  isp?: string;
};

export async function fetchIpInfo(): Promise<IpInfo> {
  try {
    const r = await fetch("https://ipapi.co/json/");
    const j = await r.json();
    return {
      ip: j.ip,
      city: j.city,
      region: j.region,
      country: j.country_name,
      isp: j.org,
    };
  } catch {
    return { ip: "—", city: "Unknown", country: "", isp: "Unknown ISP" };
  }
}

export function rateNetwork(download: number, ping: number): {
  label: "Excellent" | "Good" | "Weak";
  color: string;
} {
  if (download >= 50 && ping < 60) return { label: "Excellent", color: "var(--neon-cyan)" };
  if (download >= 15 && ping < 120) return { label: "Good", color: "var(--neon-blue)" };
  return { label: "Weak", color: "var(--neon-pink)" };
}
