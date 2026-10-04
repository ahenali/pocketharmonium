import type { ReactNode } from "react";
import { NOTE_NAMES } from "@/lib/harmonium/keys";
import { RAAGS } from "@/lib/harmonium/raags";

function Tile({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="control-tile">
      <span className="label-mono flex items-center gap-2 truncate">
        {label}
      </span>
      <div className="flex flex-1 flex-col justify-center gap-2">{children}</div>
    </div>
  );
}

function Stepper({
  value,
  unit,
  onDown,
  onUp,
  label,
}: {
  value: string | number;
  unit?: string;
  onDown: () => void;
  onUp: () => void;
  label: string;
}) {
  const btn =
    "flex size-6 shrink-0 items-center justify-center rounded-full border border-rule text-ink-soft transition active:scale-90 hover:border-brass hover:text-brass-deep";

  return (
    <div className="flex items-center gap-2">
      <button type="button" className={btn} onClick={onDown} aria-label={`Decrease ${label}`}>
        <svg className="size-2.5" viewBox="0 0 12 12">
          <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>
      <span className="min-w-7 text-center font-mono text-sm text-ink">{value}</span>
      <button type="button" className={btn} onClick={onUp} aria-label={`Increase ${label}`}>
        <svg className="size-2.5" viewBox="0 0 12 12">
          <line x1="6" y1="2" x2="6" y2="10" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </button>
      {unit ? <span className="label-mono">{unit}</span> : null}
    </div>
  );
}

function Slider({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        aria-label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        className="brass-slider"
        style={{
          background: `linear-gradient(90deg, var(--brass) ${value}%, var(--paper-deep) ${value}%)`,
        }}
      />
      <span className="w-8 shrink-0 text-right font-mono text-[11px] text-ink-soft">{value}</span>
    </div>
  );
}

const toggleBase =
  "mt-auto w-full rounded-md border px-2 py-1.5 font-mono text-[10px] uppercase tracking-wider transition";
const quietToggle = "border-rule bg-paper-deep text-ink-soft hover:border-brass hover:text-brass-deep";


type Props = {
  volume: number;
  setVolume: (v: number) => void;
  reverb: number;
  setReverb: (v: number) => void;
  transpose: number;
  setTranspose: (v: number) => void;
  octaveIndex: number;
  setOctaveIndex: (v: number) => void;
  extraReeds: number;
  setExtraReeds: (v: number) => void;
  bpm: number;
  setBpm: (v: number) => void;
  metronomeOn: boolean;
  toggleMetronome: () => void;
  beat: number;
  recording: boolean;
  recLabel: string;
  toggleRecording: () => void;
  midiStatus: string;
  midiConnected: boolean;
  onPanic: () => void;
  notation: "sargam" | "western";
  setNotation: (v: "sargam" | "western") => void;
  raagRoot: number;
  setRaagRoot: (v: number) => void;
  raagId: string;
  setRaagId: (v: string) => void;
};

export function ControlDeck(p: Props) {
  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

  return (
    <div className="grid grid-cols-1 gap-3 border-b border-rule pb-5 sm:grid-cols-2 lg:grid-cols-5">
      <Tile label="Volume">
        <Slider value={p.volume} onChange={p.setVolume} label="Volume" />
      </Tile>

      <Tile label="Reverb — hall">
        <Slider value={p.reverb} onChange={p.setReverb} label="Reverb" />
      </Tile>

      <Tile label={`Transpose — ${NOTE_NAMES[((p.transpose % 12) + 12) % 12]}`}>
        <Stepper
          label="transpose"
          value={p.transpose}
          onDown={() => p.setTranspose(clamp(p.transpose - 1, -11, 11))}
          onUp={() => p.setTranspose(clamp(p.transpose + 1, -11, 11))}
        />
      </Tile>

      <Tile label="Octave">
        <Stepper
          label="octave"
          value={p.octaveIndex}
          onDown={() => p.setOctaveIndex(clamp(p.octaveIndex - 1, 0, 6))}
          onUp={() => p.setOctaveIndex(clamp(p.octaveIndex + 1, 0, 6))}
        />
      </Tile>

      <Tile label="Additional reeds">
        <Stepper
          label="reeds"
          value={p.extraReeds}
          onDown={() => p.setExtraReeds(clamp(p.extraReeds - 1, 0, 3))}
          onUp={() => p.setExtraReeds(clamp(p.extraReeds + 1, 0, 3))}
        />
      </Tile>

      <Tile label="Metronome">
        <Stepper
          label="tempo"
          value={p.bpm}
          unit="bpm"
          onDown={() => p.setBpm(clamp(p.bpm - 2, 30, 260))}
          onUp={() => p.setBpm(clamp(p.bpm + 2, 30, 260))}
        />
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className={[
                "size-[7px] rounded-full transition-all duration-75",
                p.beat === i
                  ? i === 0
                    ? "bg-brass shadow-[0_0_8px_var(--brass)]"
                    : "bg-brass-deep"
                  : "bg-key-white-edge",
              ].join(" ")}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={p.toggleMetronome}
          className={[
            toggleBase,
            p.metronomeOn
              ? "border-brass bg-brass text-card"
              : quietToggle,
          ].join(" ")}
        >
          {p.metronomeOn ? "Stop" : "Start"}
        </button>
      </Tile>

      <Tile label="Recording">
        <div className="flex items-center gap-2 font-mono text-[11px] text-ink-soft">
          <span
            className={[
              "size-[7px] rounded-full",
              p.recording ? "animate-pulse bg-danger shadow-[0_0_8px_var(--danger)]" : "bg-key-white-edge",
            ].join(" ")}
          />
          {p.recLabel}
        </div>
        <button
          type="button"
          onClick={p.toggleRecording}
          className={[
            toggleBase,
            p.recording
              ? "border-danger bg-danger text-card"
              : quietToggle,
          ].join(" ")}
        >
          {p.recording ? "■ Stop & save" : "● Record"}
        </button>
      </Tile>

      <Tile label="MIDI keyboard">
        <div className="flex items-center gap-2 truncate font-mono text-[11px] text-ink-soft">
          <span
            className={[
              "size-[7px] shrink-0 rounded-full",
              p.midiConnected ? "bg-signal shadow-[0_0_7px_var(--signal)]" : "bg-key-white-edge",
            ].join(" ")}
          />
          <span className="truncate">{p.midiStatus}</span>
        </div>
        <button
          type="button"
          onClick={p.onPanic}
          className={[toggleBase, quietToggle].join(" ")}
        >
          Stop reeds
        </button>
      </Tile>

      <Tile label="Notation">
        <div className="flex overflow-hidden rounded-md border border-rule">
          {(["sargam", "western"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => p.setNotation(mode)}
              className={[
                "flex-1 px-1 py-2 font-mono text-[10px] uppercase transition",
                p.notation === mode ? "bg-brass text-card" : "bg-paper-deep text-ink-soft hover:text-brass-deep",
              ].join(" ")}
            >
              {mode}
            </button>
          ))}
        </div>
      </Tile>

      <Tile label="Raag guide">
        <select
          className="w-full rounded-md border border-rule bg-paper-deep px-1.5 py-1 font-mono text-[10px] text-ink"
          value={p.raagRoot}
          aria-label="Raag root note"
          onChange={(e) => p.setRaagRoot(Number(e.target.value))}
        >
          {NOTE_NAMES.map((n, i) => (
            <option key={n} value={i}>
              {n}
            </option>
          ))}
        </select>
        <select
          className="w-full rounded-md border border-rule bg-paper-deep px-1.5 py-1 font-mono text-[10px] text-ink"
          value={p.raagId}
          aria-label="Raag"
          onChange={(e) => p.setRaagId(e.target.value)}
        >
          <option value="">— Off —</option>
          {RAAGS.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </Tile>
    </div>
  );
}
