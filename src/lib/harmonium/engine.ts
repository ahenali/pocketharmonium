import { OCTAVE_MAP } from "./keys";

/**
 * Served as-is from /public/audio (no build-time processing needed for
 * static binary audio). Place reed.wav, reverb.wav, and tick.wav there.
 */
import {
  BAYAN_FILES,
  DAYAN_SAMPLES,
  SAMPLE_GAIN,
  TABLA_DETUNE_CENTS,
  isDayan,
  type Sample,
} from "./tabla";

const REED_URL = "/audio/reed.wav";
const REVERB_URL = "/audio/reverb.wav";
const TICK_URL = "/audio/tick.wav";
const TABLA_URL = "/audio/tabla/";

/** Sustain loop point matching the original recording. */
const LOOP_START = 0.5;

/**
 * The reed recording starts mid-wave (first sample is about -0.057, not 0), so playing from sample 0
 * makes a pop. Start at its first zero-crossing (~1.75 ms in) instead.
 */
const START_OFFSET = 0.00175;

/** Short ramp to zero on key release so the sound isn't cut mid-wave (which clicks). */
const RELEASE_TIME = 0.008;

type Voice = { src: AudioBufferSourceNode; gain: GainNode };

export type EngineSettings = {
  volume: number;
  reverb: number;
  transpose: number;
  octaveIndex: number;
  extraReeds: number;
};

/**
 * Sample-based harmonium: one recorded reed, pitch-shifted per key,
 * with a convolution reverb send and a media-stream tap for recording.
 */
export class HarmoniumEngine {
  ctx: AudioContext | null = null;
  private master!: GainNode;
  private dry!: GainNode;
  private wet!: GainNode;
  private convolver!: ConvolverNode;
  recordDest!: MediaStreamAudioDestinationNode;

  private reedBuffer: AudioBuffer | null = null;
  private tickBuffer: AudioBuffer | null = null;
  private tablaGain: GainNode | null = null;
  private tablaLevel = 0.8;
  private bayanBuffers = new Map<string, AudioBuffer>();
  private dayanSets = new Map<number, Map<string, AudioBuffer>>();
  private tablaLoads = new Map<string, Promise<void>>();
  private lastTablaIndex: number | null = null;

  private voices = new Map<string, Voice>();
  private stacks = new Map<string, Voice[]>();
  private loading: Promise<void> | null = null;

  settings: EngineSettings = {
    volume: 0.3,
    reverb: 0,
    transpose: 0,
    octaveIndex: 3,
    extraReeds: 0,
  };

  onActiveChange: (count: number) => void = () => {};

  get ready() {
    return this.reedBuffer !== null;
  }

  get activeCount() {
    return this.stacks.size;
  }

  async load(onProgress?: (pct: number) => void, onFile?: (file: "reed" | "reverb") => void) {
    if (this.loading) return this.loading;
    this.loading = this.loadInner(onProgress, onFile);
    return this.loading;
  }

  private async loadInner(
    onProgress?: (pct: number) => void,
    onFile?: (file: "reed" | "reverb") => void,
  ) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctor();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = this.settings.volume;
    this.dry = ctx.createGain();
    this.dry.gain.value = 1;
    this.wet = ctx.createGain();
    this.wet.gain.value = this.settings.reverb;
    this.convolver = ctx.createConvolver();
    this.convolver.normalize = true;

    this.dry.connect(this.master);
    this.wet.connect(this.convolver);
    this.convolver.connect(this.master);
    this.master.connect(ctx.destination);

    this.recordDest = ctx.createMediaStreamDestination();
    this.master.connect(this.recordDest);

    let done = 0;
    const fetchBuffer = async (url: string, file?: "reed" | "reverb") => {
      const res = await fetch(url);
      const bytes = await res.arrayBuffer();
      const buf = await ctx.decodeAudioData(bytes);
      done += 1;
      onProgress?.(Math.round((done / 3) * 100));
      if (file) onFile?.(file);
      return buf;
    };

    const [reed, reverb, tick] = await Promise.all([
      fetchBuffer(REED_URL, "reed"),
      fetchBuffer(REVERB_URL, "reverb"),
      fetchBuffer(TICK_URL),
    ]);

    this.reedBuffer = reed;
    this.tickBuffer = tick;
    this.convolver.buffer = reverb;
  }

  async resume() {
    if (this.ctx?.state === "suspended") await this.ctx.resume();
  }

  private startVoice(detuneCents: number): Voice {
    const ctx = this.ctx!;
    const src = ctx.createBufferSource();
    src.buffer = this.reedBuffer!;
    src.loop = true;
    src.loopStart = LOOP_START;
    src.loopEnd = this.reedBuffer!.duration;
    src.detune.value = detuneCents;

    const gain = ctx.createGain();
    gain.gain.value = 1;

    src.connect(gain);
    gain.connect(this.dry);
    gain.connect(this.wet);
    src.start(0, START_OFFSET);
    return { src, gain };
  }

  private stopVoice(voice: Voice) {
    try {
      const ctx = this.ctx;
      if (!ctx) {
        voice.src.stop(0);
        return;
      }
      const t = ctx.currentTime;
      const g = voice.gain.gain;
      g.cancelScheduledValues(t);
      g.setValueAtTime(g.value, t);
      g.linearRampToValueAtTime(0, t + RELEASE_TIME);
      voice.src.stop(t + RELEASE_TIME);
    } catch {
      /* already stopped */
    }
  }

  private semitones(note: number) {
    const { octaveIndex, transpose } = this.settings;
    return note - 62 + (OCTAVE_MAP[octaveIndex] ?? 0) + transpose;
  }

  noteOn(id: string, note: number) {
    if (!this.ready || this.stacks.has(id)) return;
    void this.resume();
    const base = this.semitones(note);
    const voices = [this.startVoice(base * 100)];
    for (let c = 1; c <= this.settings.extraReeds; c++) {
      voices.push(this.startVoice((base + 12 * c) * 100));
    }
    this.stacks.set(id, voices);
    this.onActiveChange(this.stacks.size);
  }

  noteOff(id: string) {
    const voices = this.stacks.get(id);
    if (!voices) return;
    voices.forEach((v) => this.stopVoice(v));
    this.stacks.delete(id);
    this.onActiveChange(this.stacks.size);
  }

  allNotesOff() {
    [...this.stacks.keys()].forEach((id) => this.noteOff(id));
  }

  setVolume(v: number) {
    this.settings.volume = v;
    if (this.ctx)
      this.master.gain.setTargetAtTime(v, this.ctx.currentTime, 0.02);
  }

  setReverb(v: number) {
    this.settings.reverb = v;
    if (this.ctx) this.wet.gain.setTargetAtTime(v, this.ctx.currentTime, 0.02);
  }

  /* --- tabla --- */

  private ensureTablaGain() {
    const ctx = this.ctx!;
    if (!this.tablaGain) {
      this.tablaGain = ctx.createGain();
      this.tablaGain.gain.value = this.tablaLevel;
      this.tablaGain.connect(ctx.destination);
      this.tablaGain.connect(this.recordDest);
    }
    return this.tablaGain;
  }

  setTablaLevel(v: number) {
    this.tablaLevel = v;
    if (this.ctx && this.tablaGain) {
      this.tablaGain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.02);
    }
  }

  private async fetchTabla(file: string) {
    const res = await fetch(`${TABLA_URL}${file}.wav`);
    if (!res.ok) throw new Error(`Couldn't load ${file}`);
    return this.ctx!.decodeAudioData(await res.arrayBuffer());
  }

  /** Load the bayan once, and the dayan recordings tuned to `index` (0-11). Safe to call repeatedly. */
  loadTabla(index: number): Promise<void> {
    if (!this.ctx) return Promise.reject(new Error("Audio isn't ready yet"));
    this.ensureTablaGain();
    const key = `set-${index}`;
    const existing = this.tablaLoads.get(key);
    if (existing) return existing;

    const job = (async () => {
      if (this.bayanBuffers.size === 0) {
        const files = await Promise.all(BAYAN_FILES.map((f) => this.fetchTabla(`${f}_0`)));
        BAYAN_FILES.forEach((f, i) => this.bayanBuffers.set(f, files[i]!));
      }
      if (!this.dayanSets.has(index)) {
        const files = await Promise.all(DAYAN_SAMPLES.map((n) => this.fetchTabla(`${n}_${index}`)));
        const set = new Map<string, AudioBuffer>();
        DAYAN_SAMPLES.forEach((n, i) => set.set(n, files[i]!));
        this.dayanSets.set(index, set);
      }
    })();
    job.catch(() => this.tablaLoads.delete(key));
    this.tablaLoads.set(key, job);
    return job;
  }

  hasTabla(index: number) {
    return this.bayanBuffers.size > 0 && this.dayanSets.has(index);
  }

  /**
   * Schedule one stroke (a single recording). Dayan strokes use the recordings tuned to the
   * harmonium's Sa; the bayan has one recording per sound and follows the tuning by up to half an
   * octave. The drum keeps ringing after the loop is stopped.
   */
  scheduleSample(time: number, sample: Sample, index: number, accent = false) {
    const ctx = this.ctx;
    const out = this.tablaGain;
    if (!ctx || !out) return;
    // keep using the last tuning that finished loading while a new one is fetched
    const useIndex = this.dayanSets.has(index) ? index : this.lastTablaIndex;
    if (useIndex === null || !this.dayanSets.has(useIndex)) return;
    this.lastTablaIndex = useIndex;

    let buffer: AudioBuffer | undefined;
    let cents = TABLA_DETUNE_CENTS;
    if (isDayan(sample)) {
      buffer = this.dayanSets.get(useIndex)!.get(sample);
    } else {
      buffer = this.bayanBuffers.get(`${sample}_0`) ?? this.bayanBuffers.get(sample);
      cents += (((useIndex + 6) % 12) - 6) * 100;
    }
    if (!buffer) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.detune.value = cents;
    const g = ctx.createGain();
    g.gain.value = (SAMPLE_GAIN[sample] ?? 1) * (accent ? 1.15 : 1);
    src.connect(g);
    g.connect(out);
    src.onended = () => {
      src.disconnect();
      g.disconnect();
    };
    src.start(time);
  }

  scheduleTick(time: number, accent: boolean) {
    const ctx = this.ctx;
    if (!ctx || !this.tickBuffer) return;
    const src = ctx.createBufferSource();
    src.buffer = this.tickBuffer;
    const g = ctx.createGain();
    g.gain.value = accent ? 1 : 0.6;
    src.connect(g);
    g.connect(ctx.destination);
    g.connect(this.recordDest);
    src.start(time);
  }

  get currentTime() {
    return this.ctx?.currentTime ?? 0;
  }

  dispose() {
    this.allNotesOff();
    void this.ctx?.close();
    this.ctx = null;
  }
}
