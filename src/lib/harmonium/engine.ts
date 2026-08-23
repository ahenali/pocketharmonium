import { OCTAVE_MAP } from "./keys";

/**
 * Served as-is from /public/audio (no build-time processing needed for
 * static binary audio). Place reed.wav, reverb.wav, and tick.wav there.
 */
const REED_URL = "/audio/reed.wav";
const REVERB_URL = "/audio/reverb.wav";
const TICK_URL = "/audio/tick.wav";

/** Sustain loop point matching the original recording. */
const LOOP_START = 0.5;

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

  async load(onProgress?: (pct: number) => void) {
    if (this.loading) return this.loading;
    this.loading = this.loadInner(onProgress);
    return this.loading;
  }

  private async loadInner(onProgress?: (pct: number) => void) {
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
    const fetchBuffer = async (url: string) => {
      const res = await fetch(url);
      const bytes = await res.arrayBuffer();
      const buf = await ctx.decodeAudioData(bytes);
      done += 1;
      onProgress?.(Math.round((done / 3) * 100));
      return buf;
    };

    const [reed, reverb, tick] = await Promise.all([
      fetchBuffer(REED_URL),
      fetchBuffer(REVERB_URL),
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
    src.start(0);
    return { src, gain };
  }

  private stopVoice(voice: Voice) {
    try {
      voice.src.stop(0);
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
