import { useEffect, useState } from "react";
import { useLoadStatus } from "@/lib/harmonium/loadStatus";

/** Shortest time the splash stays up, so a fast load doesn't flash. */
const MIN_VISIBLE_MS = 700;
const FADE_MS = 450;

// Once the first load has finished, later visits to the Play page skip the splash.
let splashFinished = false;

const css = `
@media (prefers-reduced-motion: no-preference) {
  @keyframes ph-splash-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.04); } }
  @keyframes ph-splash-wave { to { stroke-dashoffset: -64; } }
  .ph-splash-logo { animation: ph-splash-breathe 2.8s ease-in-out infinite; }
  .ph-splash-wave { animation: ph-splash-wave 2.4s linear infinite; }
}
`;

function Step({ label, done }: { label: string; done: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span
        className={[
          "flex size-3.5 items-center justify-center rounded-full border transition-colors duration-300",
          done ? "border-brass bg-brass text-card" : "border-rule text-transparent",
        ].join(" ")}
        aria-hidden
      >
        <svg
          viewBox="0 0 12 12"
          className="size-2"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M2.5 6.5l2.2 2.2L9.5 3.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className={done ? "text-ink" : "text-ink-soft"}>{label}</span>
    </li>
  );
}

export function Splash({ active }: { active: boolean }) {
  const status = useLoadStatus();
  const [phase, setPhase] = useState<"show" | "fade" | "gone">(
    active && !splashFinished ? "show" : "gone",
  );
  const [minElapsed, setMinElapsed] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMinElapsed(true), MIN_VISIBLE_MS);
    return () => window.clearTimeout(t);
  }, []);

  // done once the samples are decoded; on an error the Play page shows its own retry button
  const finished = status.state === "ready" || status.state === "error";

  useEffect(() => {
    if (phase === "show" && finished && minElapsed) setPhase("fade");
  }, [phase, finished, minElapsed]);

  useEffect(() => {
    if (phase !== "fade") return;
    const t = window.setTimeout(() => {
      splashFinished = true;
      setPhase("gone");
    }, FADE_MS);
    return () => window.clearTimeout(t);
  }, [phase]);

  const visible = active && phase !== "gone";

  useEffect(() => {
    if (!visible) return;
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = previous;
    };
  }, [visible]);

  if (!visible) return null;

  const pct = status.state === "ready" ? 100 : status.pct;
  const label =
    status.state === "error"
      ? "Couldn't load the sound"
      : finished
        ? "Ready"
        : "Warming the reeds…";

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-paper px-6 text-center transition-opacity ease-out"
      style={{ opacity: phase === "fade" ? 0 : 1, transitionDuration: `${FADE_MS}ms` }}
    >
      <style>{css}</style>

      <svg
        viewBox="0 0 512 512"
        className="ph-splash-logo size-24 rounded-[22%] shadow-[0_10px_24px_oklch(0_0_0/25%)]"
        aria-hidden
      >
        <defs>
          <linearGradient id="ph-splash-bg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#3b2717" />
            <stop offset="1" stopColor="#22160e" />
          </linearGradient>
        </defs>
        <rect width="512" height="512" rx="112" fill="url(#ph-splash-bg)" />
        <path
          d="M92 130 Q174 76 256 130 T420 130"
          fill="none"
          stroke="#c4903f"
          strokeWidth="24"
          strokeLinecap="round"
        />
        <g fill="#f8f1e3">
          {[76, 150, 224, 298, 372].map((x) => (
            <rect key={x} x={x} y="196" width="64" height="216" rx="10" />
          ))}
        </g>
        <g fill="#2b1c12">
          {[123, 197, 345].map((x) => (
            <rect key={x} x={x} y="196" width="44" height="132" rx="8" />
          ))}
        </g>
      </svg>

      <div>
        <h1 className="font-display text-4xl leading-none tracking-[-0.02em] text-ink">
          Pocket<span className="text-brass-deep">Harmonium</span>
        </h1>
        <svg viewBox="0 0 150 12" className="mx-auto mt-3 h-3 w-[150px]" aria-hidden>
          <path
            className="ph-splash-wave"
            d="M2 6 Q 40 -2 75 6 T 148 6"
            stroke="var(--brass)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="8 8"
          />
        </svg>
      </div>

      <div className="w-60">
        <div className="h-1 overflow-hidden rounded-full bg-paper-deep">
          <div
            className="h-full rounded-full bg-brass transition-[width] duration-300 ease-out"
            style={{ width: `${Math.max(pct, 6)}%` }}
          />
        </div>
        <p className="label-mono mt-3 !tracking-[0.18em]">{label}</p>
        <ul className="mx-auto mt-3 flex w-fit flex-col gap-1.5 text-left font-mono text-[11px]">
          <Step label="Reed tone" done={status.reedLoaded || status.state === "ready"} />
          <Step label="Room reverb" done={status.reverbLoaded || status.state === "ready"} />
        </ul>
      </div>
    </div>
  );
}
