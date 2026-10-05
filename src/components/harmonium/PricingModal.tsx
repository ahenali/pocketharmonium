import { useEffect, useState } from "react";
import { REPO_URL, type StarCheck } from "@/lib/premium";

type Props = {
  open: boolean;
  onClose: () => void;
  premium: boolean;
  onVerify: (username: string) => Promise<StarCheck>;
};

type Status = "idle" | "checking" | StarCheck;

const MESSAGES: Record<Exclude<Status, "idle" | "checking" | "starred">, string> = {
  "not-starred":
    "We couldn't find that username in the stargazers. Star the repo first, wait a minute, then try again.",
  "rate-limited": "GitHub is rate-limiting checks from your network right now. Try again later.",
  error: "Couldn't reach GitHub. Check your connection and try again.",
};

export function PricingModal({ open, onClose, premium, onVerify }: Props) {
  const [username, setUsername] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const unlocked = premium || status === "starred";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Unlock the Raag Guide"
    >
      <div className="panel relative w-full max-w-md p-7">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-2 font-display text-2xl leading-none text-ink-soft hover:text-ink"
        >
          ×
        </button>
        <h2 className="text-2xl italic text-ink">Unlock the Raag Guide</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Star Pocket Harmonium on GitHub to light up the notes of all ten raags. It's free.
        </p>

        {unlocked ? (
          <p className="mt-5 rounded-md border border-brass bg-brass/10 px-4 py-3 font-mono text-[11px] text-brass-deep">
            Raag Guide unlocked ✓ Thank you for the star.
          </p>
        ) : (
          <div className="mt-5 space-y-4">
            <div>
              <p className="label-mono">1. Star the repo</p>
              <a
                href={REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block w-full rounded-md bg-brass px-3 py-2 text-center font-mono text-[10px] uppercase tracking-wider text-card transition hover:brightness-110"
              >
                ★ Open on GitHub
              </a>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!username.trim()) return;
                setStatus("checking");
                const result = await onVerify(username);
                setStatus(result);
                if (result === "starred") window.setTimeout(onClose, 1200);
              }}
            >
              <label className="label-mono" htmlFor="github-username">
                2. Enter your GitHub username
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="github-username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setStatus("idle");
                  }}
                  placeholder="your-username"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  className="min-w-0 flex-1 rounded-md border border-rule bg-paper-deep/40 px-3 py-2 font-mono text-[11px] tracking-wider text-ink outline-none focus:border-brass"
                />
                <button
                  type="submit"
                  disabled={status === "checking"}
                  className="rounded-md border border-brass px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-ink transition hover:bg-brass/10 disabled:opacity-60"
                >
                  {status === "checking" ? "Checking…" : "Unlock"}
                </button>
              </div>
              {status !== "idle" && status !== "checking" && (
                <p className="mt-2 font-mono text-[10px] text-maroon">{MESSAGES[status]}</p>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
