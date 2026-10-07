import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { HarmoniumEngine } from "./engine";
import { NOTE_OF } from "./keys";
import { readSettings, writeSettings } from "./settings";

export type LoadState = "idle" | "loading" | "ready" | "error";

export function useHarmonium() {
  const engineRef = useRef<HarmoniumEngine | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [loadPct, setLoadPct] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeCount, setActiveCount] = useState(0);
  const [held, setHeld] = useState<Set<string>>(new Set());

  const [volume, setVolume] = useState(30);
  const [reverb, setReverb] = useState(0);
  const [transpose, setTranspose] = useState(0);
  const [octaveIndex, setOctaveIndex] = useState(3);
  const [extraReeds, setExtraReeds] = useState(0);

  const [bpm, setBpm] = useState(80);
  const [metronomeOn, setMetronomeOn] = useState(false);
  const [beat, setBeat] = useState(-1);

  const [recording, setRecording] = useState(false);
  const [recMs, setRecMs] = useState(0);

  const [midiStatus, setMidiStatus] = useState("Checking…");
  const [midiConnected, setMidiConnected] = useState(false);

  /* --- remember settings between visits --- */
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    const saved = readSettings();
    if (saved.volume !== undefined) setVolume(saved.volume);
    if (saved.reverb !== undefined) setReverb(saved.reverb);
    if (saved.transpose !== undefined) setTranspose(saved.transpose);
    if (saved.octaveIndex !== undefined) setOctaveIndex(saved.octaveIndex);
    if (saved.extraReeds !== undefined) setExtraReeds(saved.extraReeds);
    if (saved.bpm !== undefined) setBpm(saved.bpm);
    setRestored(true);
  }, []);
  useEffect(() => {
    if (!restored) return;
    writeSettings({ volume, reverb, transpose, octaveIndex, extraReeds, bpm });
  }, [restored, volume, reverb, transpose, octaveIndex, extraReeds, bpm]);

  const getEngine = useCallback(() => {
    if (!engineRef.current) {
      const e = new HarmoniumEngine();
      e.onActiveChange = setActiveCount;
      engineRef.current = e;
    }
    return engineRef.current;
  }, []);

  const load = useCallback(async () => {
    const engine = getEngine();
    if (engine.ready) return;
    setLoadState("loading");
    setLoadError(null);
    try {
      await engine.load(setLoadPct);
      await engine.resume();
      setLoadState("ready");
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "Unknown error");
      setLoadState("error");
    }
  }, [getEngine]);

  /* --- auto-load samples once the page is idle --- */
  useEffect(() => {
    let cancelled = false;
    const start = () => {
      if (!cancelled) void load();
    };
    const w = window as unknown as {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
    };
    const id = w.requestIdleCallback
      ? w.requestIdleCallback(start, { timeout: 1200 })
      : window.setTimeout(start, 300);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [load]);

  /* --- settings sync --- */
  useEffect(() => {
    getEngine().setVolume(volume / 100);
  }, [volume, getEngine]);
  useEffect(() => {
    getEngine().setReverb(reverb / 100);
  }, [reverb, getEngine]);
  useEffect(() => {
    getEngine().settings.transpose = transpose;
  }, [transpose, getEngine]);
  useEffect(() => {
    getEngine().settings.octaveIndex = octaveIndex;
  }, [octaveIndex, getEngine]);
  useEffect(() => {
    getEngine().settings.extraReeds = extraReeds;
  }, [extraReeds, getEngine]);

  const press = useCallback(
    (char: string) => {
      const note = NOTE_OF[char];
      if (note === undefined) return;
      getEngine().noteOn("kb-" + char, note);
      setHeld((prev) => {
        if (prev.has(char)) return prev;
        const next = new Set(prev);
        next.add(char);
        return next;
      });
    },
    [getEngine],
  );

  const release = useCallback(
    (char: string) => {
      if (NOTE_OF[char] === undefined) return;
      getEngine().noteOff("kb-" + char);
      setHeld((prev) => {
        if (!prev.has(char)) return prev;
        const next = new Set(prev);
        next.delete(char);
        return next;
      });
    },
    [getEngine],
  );

  const releaseAll = useCallback(() => {
    getEngine().allNotesOff();
    setHeld(new Set());
  }, [getEngine]);

  /* --- computer keyboard --- */
  useEffect(() => {
    if (loadState !== "ready") return;
    const down = (e: KeyboardEvent) => {
      const char = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (NOTE_OF[char] === undefined || e.repeat) return;
      const target = e.target as HTMLElement | null;
      const isRangeInput = target instanceof HTMLInputElement && target.type === "range";
      if (target && !isRangeInput && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      e.preventDefault();
      press(char);
    };
    const up = (e: KeyboardEvent) => {
      const char = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      release(char);
    };
    const blur = () => releaseAll();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [loadState, press, release, releaseAll]);

  /* --- MIDI --- */
  useEffect(() => {
    if (loadState !== "ready") return;
    type MidiInput = {
      name?: string | null;
      onmidimessage: ((e: { data: Uint8Array | null }) => void) | null;
    };
    type MidiAccess = {
      inputs: { values(): IterableIterator<MidiInput> };
      onstatechange: unknown;
    };
    const nav = navigator as unknown as {
      requestMIDIAccess?: () => Promise<MidiAccess>;
    };
    if (!nav.requestMIDIAccess) {
      setMidiStatus("Not supported here");
      return;
    }
    let cancelled = false;
    const onMessage = (e: { data: Uint8Array | null }) => {
      const [status, midiNote, vel] = Array.from(e.data ?? []);
      if (status === undefined || midiNote === undefined) return;
      const cmd = status & 0xf0;
      const note = midiNote - 60 + 62;
      if (cmd === 0x90 && (vel ?? 0) > 0) getEngine().noteOn("midi-" + midiNote, note);
      else if (cmd === 0x80 || (cmd === 0x90 && vel === 0)) getEngine().noteOff("midi-" + midiNote);
    };
    const wire = (access: MidiAccess) => {
      if (cancelled) return;
      const inputs = [...access.inputs.values()];
      if (inputs.length === 0) {
        setMidiStatus("No device found");
        setMidiConnected(false);
        return;
      }
      inputs.forEach((i) => {
        i.onmidimessage = onMessage;
      });
      setMidiStatus(inputs[0]?.name || "Connected");
      setMidiConnected(true);
      access.onstatechange = () => wire(access);
    };
    nav
      .requestMIDIAccess()
      .then(wire)
      .catch(() => setMidiStatus("Access denied"));
    return () => {
      cancelled = true;
    };
  }, [loadState, getEngine]);

  /* --- metronome --- */
  const bpmRef = useRef(bpm);
  bpmRef.current = bpm;
  useEffect(() => {
    if (!metronomeOn) {
      setBeat(-1);
      return;
    }
    const engine = getEngine();
    void engine.resume();
    let next = engine.currentTime + 0.05;
    let count = 0;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const id = setInterval(() => {
      while (next < engine.currentTime + 0.1) {
        const accentIndex = count % 4;
        engine.scheduleTick(next, accentIndex === 0);
        const delay = Math.max(0, (next - engine.currentTime) * 1000);
        timeouts.push(setTimeout(() => setBeat(accentIndex), delay));
        next += 60 / bpmRef.current;
        count++;
      }
    }, 25);
    return () => {
      clearInterval(id);
      timeouts.forEach(clearTimeout);
    };
  }, [metronomeOn, getEngine]);

  /* --- recording --- */
  const recorderRef = useRef<MediaRecorder | null>(null);
  const startRecording = useCallback(() => {
    const engine = getEngine();
    if (!engine.ready || typeof MediaRecorder === "undefined") return;
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/ogg",
    ];
    const mimeType = candidates.find((t) => MediaRecorder.isTypeSupported(t));
    const chunks: Blob[] = [];
    const rec = mimeType
      ? new MediaRecorder(engine.recordDest.stream, { mimeType })
      : new MediaRecorder(engine.recordDest.stream);
    rec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    rec.onstop = () => {
      const blob = new Blob(chunks, { type: rec.mimeType || "audio/webm" });
      const ext = blob.type.includes("ogg") ? "ogg" : "webm";
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `harmonium-${new Date().toISOString().replace(/[:.]/g, "-")}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    };
    rec.start();
    recorderRef.current = rec;
    setRecording(true);
    setRecMs(0);
  }, [getEngine]);

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
  }, []);

  useEffect(() => {
    if (!recording) return;
    const start = Date.now();
    const id = setInterval(() => setRecMs(Date.now() - start), 250);
    return () => clearInterval(id);
  }, [recording]);

  useEffect(() => () => engineRef.current?.dispose(), []);

  const recLabel = useMemo(() => {
    const s = Math.floor(recMs / 1000);
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  }, [recMs]);

  return {
    loadState,
    loadPct,
    loadError,
    load,
    activeCount,
    held,
    press,
    release,
    releaseAll,
    volume,
    setVolume,
    reverb,
    setReverb,
    transpose,
    setTranspose,
    octaveIndex,
    setOctaveIndex,
    extraReeds,
    setExtraReeds,
    bpm,
    setBpm,
    metronomeOn,
    setMetronomeOn,
    beat,
    recording,
    recLabel,
    startRecording,
    stopRecording,
    midiStatus,
    midiConnected,
  };
}
