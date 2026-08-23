import { useEffect, useState } from "react";
import { PADDLE_PRICE_LIFETIME, PADDLE_PRICE_MONTHLY } from "@/lib/premium";

type Props = {
  open: boolean;
  onClose: () => void;
  checkoutConfigured: boolean;
  onCheckout: (priceId: string) => void;
  onRedeem?: (code: string) => boolean;
};

export function PricingModal({ open, onClose, checkoutConfigured, onCheckout, onRedeem }: Props) {
  const [code, setCode] = useState("");
  const [status, setStatus] = useState<"idle" | "bad" | "ok">("idle");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const card =
    "flex flex-col items-center gap-1 rounded-lg border border-rule bg-paper-deep/40 px-4 py-5";
  const cta =
    "mt-2 w-full rounded-md bg-brass px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-card transition hover:brightness-110 disabled:opacity-60";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Go premium"
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
        <h2 className="text-2xl italic text-ink">Go Premium</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Remove the ad rail and unlock the Raag Guide across all ten raags.
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className={card}>
            <div className="font-display text-2xl text-ink">
              $5<span className="font-mono text-[11px] text-ink-soft">/mo</span>
            </div>
            <div className="label-mono">Monthly</div>
            <button
              type="button"
              className={cta}
              disabled={!checkoutConfigured}
              onClick={() => onCheckout(PADDLE_PRICE_MONTHLY)}
            >
              Subscribe
            </button>
          </div>
          <div className={`${card} border-brass bg-brass/10`}>
            <div className="font-display text-2xl text-ink">
              $15<span className="font-mono text-[11px] text-ink-soft"> once</span>
            </div>
            <div className="label-mono">Lifetime</div>
            <button
              type="button"
              className={cta}
              disabled={!checkoutConfigured}
              onClick={() => onCheckout(PADDLE_PRICE_LIFETIME)}
            >
              Buy once
            </button>
          </div>
        </div>

        {onRedeem && (
          <form
            className="mt-5 border-t border-rule pt-4"
            onSubmit={(e) => {
              e.preventDefault();
              const ok = onRedeem(code);
              setStatus(ok ? "ok" : "bad");
              if (ok) window.setTimeout(onClose, 700);
            }}
          >
            <label className="label-mono" htmlFor="unlock-code">
              Have an unlock code?
            </label>
            <div className="mt-2 flex gap-2">
              <input
                id="unlock-code"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setStatus("idle");
                }}
                placeholder="SURPETI-…"
                className="min-w-0 flex-1 rounded-md border border-rule bg-paper-deep/40 px-3 py-2 font-mono text-[11px] uppercase tracking-wider text-ink outline-none focus:border-brass"
              />
              <button
                type="submit"
                className="rounded-md border border-brass px-3 py-2 font-mono text-[10px] uppercase tracking-wider text-ink transition hover:bg-brass/10"
              >
                Unlock
              </button>
            </div>
            {status === "bad" && (
              <p className="mt-2 font-mono text-[10px] text-maroon">That code isn't valid.</p>
            )}
            {status === "ok" && (
              <p className="mt-2 font-mono text-[10px] text-brass">Premium unlocked. Enjoy.</p>
            )}
          </form>
        )}

        <p className="mt-4 text-center font-mono text-[10px] text-ink-soft">
          {checkoutConfigured
            ? "Payments processed securely by Paddle."
            : "Checkout isn't connected yet — add your Paddle token and price IDs in src/lib/premium.ts."}
        </p>

      </div>
    </div>
  );
}
