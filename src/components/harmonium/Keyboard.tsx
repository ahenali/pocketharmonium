import { useCallback, useEffect, useRef } from "react";
import { BLACK_KEYS, WHITE_KEYS, pitchClass } from "@/lib/harmonium/keys";

type Props = {
  held: Set<string>;
  raagNotes: Set<number> | null;
  notation: "sargam" | "western";
  onPress: (key: string) => void;
  onRelease: (key: string) => void;
  onReleaseAll: () => void;
};

export function Keyboard({
  held,
  raagNotes,
  notation,
  onPress,
  onRelease,
  onReleaseAll,
}: Props) {
  const downRef = useRef(false);
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    const up = () => {
      if (!downRef.current) return;
      downRef.current = false;
      lastRef.current = null;
      onReleaseAll();
    };
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
    };
  }, [onReleaseAll]);

  const keyAt = (e: React.PointerEvent) => {
    const el = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest<HTMLElement>("[data-note-key]");
    return el?.dataset["noteKey"] ?? null;
  };

  const handleDown = useCallback(
    (e: React.PointerEvent) => {
      const k = keyAt(e);
      if (!k) return;
      downRef.current = true;
      lastRef.current = k;
      onPress(k);
    },
    [onPress],
  );

  const handleMove = useCallback(
    (e: React.PointerEvent) => {
      if (!downRef.current) return;
      const k = keyAt(e);
      if (!k || k === lastRef.current) return;
      if (lastRef.current) onRelease(lastRef.current);
      lastRef.current = k;
      onPress(k);
    },
    [onPress, onRelease],
  );

  const inRaag = (note: number) => raagNotes?.has(pitchClass(note)) ?? false;

  return (
    <div className="flex justify-center overflow-x-auto px-1 py-2">
      <div
        className="relative flex touch-none rounded-lg bg-keybed p-[10px_8px_8px] shadow-[inset_0_2px_10px_oklch(0_0_0/45%)] select-none [--bw:24px] [--kw:38px] sm:[--bw:28px] sm:[--kw:46px]"
        onPointerDown={handleDown}
        onPointerMove={handleMove}
        onContextMenu={(e) => e.preventDefault()}
      >
        {WHITE_KEYS.map((k) => {
          const active = held.has(k.key);
          return (
            <div
              key={k.key}
              data-note-key={k.key}
              role="button"
              aria-label={`${k.sw} (${k.west})`}
              className={[
                "relative z-1 mx-px flex h-[128px] w-[var(--kw)] cursor-pointer flex-col items-center justify-end gap-1.5 rounded-b border pb-2.5 sm:h-[152px]",
                "transition-[background-color,transform,box-shadow] duration-100",
                active
                  ? "translate-y-[2px] border-brass bg-brass/35 shadow-[inset_0_0_0_1px_var(--brass)]"
                  : "border-key-white-edge bg-key-white shadow-[0_2px_0_oklch(0_0_0/8%)] hover:bg-brass/8",
              ].join(" ")}
            >
              <span className="font-mono text-[11px] font-medium tracking-tight text-ink">
                {notation === "western" ? k.west : k.sw}
              </span>
              <span
                className={[
                  "h-[4px] w-[4px] rounded-full transition-colors",
                  inRaag(k.note) ? "bg-brass" : "bg-transparent",
                ].join(" ")}
              />
              <span className="font-mono text-[8px] uppercase text-key-label">{k.key}</span>
            </div>
          );
        })}

        {BLACK_KEYS.map((k) => {
          const active = held.has(k.key);
          return (
            <div
              key={k.key}
              data-note-key={k.key}
              role="button"
              aria-label={`${k.sw} (${k.west})`}
              className={[
                "absolute top-[10px] z-2 flex h-[78px] w-[var(--bw)] cursor-pointer flex-col items-center justify-end gap-1 rounded-b border border-key-black-edge pb-[6px] sm:h-[92px]",
                "transition-[background-color,transform,box-shadow] duration-100",
                active
                  ? "translate-y-[2px] bg-brass shadow-[inset_0_0_0_1px_var(--brass-deep),inset_0_-3px_8px_oklch(0_0_0/25%)]"
                  : "bg-key-black shadow-[0_3px_6px_oklch(0_0_0/30%)]",
              ].join(" ")}
              style={{
                left: `calc(0.5rem + ${(k.after ?? 0) + 1} * (var(--kw) + 2px) - var(--bw) / 2)`,
              }}
            >
              <span className="font-mono text-[9px] font-medium text-key-white">
                {notation === "western" ? k.west : k.sw}
              </span>
              <span
                className={[
                  "h-[3px] w-[3px] rounded-full transition-colors",
                  inRaag(k.note) ? "bg-brass" : "bg-transparent",
                ].join(" ")}
              />
              <span className="font-mono text-[7px] text-key-label">{k.key}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

