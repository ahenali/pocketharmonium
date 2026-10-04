const SETTINGS_KEY = "surpeti.settings";

export type SavedSettings = {
  volume: number;
  reverb: number;
  transpose: number;
  octaveIndex: number;
  extraReeds: number;
  bpm: number;
  raagRoot: number;
  raagId: string;
};

const RANGES: Record<Exclude<keyof SavedSettings, "raagId">, [number, number]> = {
  volume: [0, 100],
  reverb: [0, 100],
  transpose: [-11, 11],
  octaveIndex: [0, 6],
  extraReeds: [0, 3],
  bpm: [30, 260],
  raagRoot: [0, 11],
};

/** Read saved settings, ignoring anything missing or out of range. */
export function readSettings(): Partial<SavedSettings> {
  try {
    const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? "{}") as Partial<
      Record<keyof SavedSettings, unknown>
    >;
    const out: Partial<SavedSettings> = {};
    for (const [key, [min, max]] of Object.entries(RANGES)) {
      const v = parsed[key as keyof SavedSettings];
      if (typeof v === "number" && Number.isFinite(v) && v >= min && v <= max) {
        (out as Record<string, number>)[key] = v;
      }
    }
    if (typeof parsed.raagId === "string") out.raagId = parsed.raagId;
    return out;
  } catch {
    return {};
  }
}

/** Merge a patch into the saved settings. */
export function writeSettings(patch: Partial<SavedSettings>) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...readSettings(), ...patch }));
  } catch {
    /* storage unavailable (private mode, quota) — settings just won't persist */
  }
}
