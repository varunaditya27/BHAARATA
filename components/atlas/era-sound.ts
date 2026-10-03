/**
 * Opt-in sound for the atlas, synthesised in the browser (no recordings,
 * so nothing to license): a soft drone for each era, crossfaded as the
 * year moves between eras, and a gong when playback crosses into a new
 * one. Quiet by design — it sits under the map, not over it.
 */

type EraVoice = { root: number; brightness: number };

// Roots a tone apart so each era is recognisably its own; later eras a
// little brighter.
const ERA_VOICE: Record<string, EraVoice> = {
  "Early medieval": { root: 110, brightness: 800 },
  "Late medieval": { root: 130.81, brightness: 1100 },
  "Early modern": { root: 146.83, brightness: 1400 },
};

const MASTER = 0.07;
const FADE_S = 2.5;

type Drone = { out: GainNode; stop: (at: number) => void };

export class EraSoundscape {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private drone: Drone | null = null;
  private era: string | null = null;

  /** Must be called from a user gesture (browser autoplay rules). */
  start(era: string) {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;
      this.master.connect(this.ctx.destination);
    }
    void this.ctx.resume();
    const now = this.ctx.currentTime;
    this.master!.gain.cancelScheduledValues(now);
    this.master!.gain.setTargetAtTime(MASTER, now, 0.6);
    this.era = null;
    this.setEra(era);
  }

  stop() {
    if (!this.ctx || !this.master) return;
    const now = this.ctx.currentTime;
    this.master.gain.setTargetAtTime(0, now, 0.4);
    this.drone?.stop(now + 2);
    this.drone = null;
    this.era = null;
  }

  get running() {
    return this.ctx?.state === "running" && this.drone !== null;
  }

  /** Crossfade to a new era's drone (no-op if it's already playing). */
  setEra(era: string) {
    if (!this.ctx || !this.master || era === this.era) return;
    this.era = era;
    const now = this.ctx.currentTime;
    const old = this.drone;
    if (old) {
      old.out.gain.setTargetAtTime(0, now, FADE_S / 3);
      old.stop(now + FADE_S * 2);
    }
    this.drone = this.makeDrone(ERA_VOICE[era] ?? ERA_VOICE["Early medieval"]);
    this.drone.out.gain.setTargetAtTime(1, now, FADE_S / 3);
  }

  /** A struck gong: inharmonic partials decaying at different rates. */
  gong() {
    if (!this.ctx || !this.master) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const base = 82;
    for (const [ratio, level, decay] of [
      [1, 0.9, 6],
      [2.76, 0.5, 4],
      [5.4, 0.3, 2.5],
      [8.93, 0.18, 1.5],
    ] as const) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.frequency.value = base * ratio;
      osc.frequency.setValueAtTime(base * ratio * 1.01, now);
      osc.frequency.exponentialRampToValueAtTime(base * ratio, now + 0.4);
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(level, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      osc.connect(g).connect(this.master);
      osc.start(now);
      osc.stop(now + decay + 0.1);
    }
    // The strike: a short burst of filtered noise.
    const noise = ctx.createBufferSource();
    const buf = ctx.createBuffer(1, ctx.sampleRate * 0.12, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    noise.buffer = buf;
    const bp = ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 600;
    const ng = ctx.createGain();
    ng.gain.value = 0.25;
    noise.connect(bp).connect(ng).connect(this.master);
    noise.start(now);
  }

  dispose() {
    void this.ctx?.close();
    this.ctx = null;
    this.master = null;
    this.drone = null;
  }

  /** Root, fifth and octave through a low-pass filter, with a slow swell. */
  private makeDrone({ root, brightness }: EraVoice): Drone {
    const ctx = this.ctx!;
    const out = ctx.createGain();
    out.gain.value = 0;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = brightness;
    filter.Q.value = 0.7;
    filter.connect(out).connect(this.master!);

    const swell = ctx.createOscillator();
    swell.frequency.value = 0.07;
    const swellDepth = ctx.createGain();
    swellDepth.gain.value = brightness * 0.25;
    swell.connect(swellDepth).connect(filter.frequency);

    const oscs = [
      { f: root, type: "sawtooth" as OscillatorType, level: 0.32 },
      { f: root * 1.5, type: "sawtooth" as OscillatorType, level: 0.18 },
      { f: root * 2, type: "triangle" as OscillatorType, level: 0.22 },
      { f: root * 1.003, type: "sawtooth" as OscillatorType, level: 0.2 }, // slight detune: the shimmer of a tanpura
    ].map(({ f, type, level }) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = f;
      const g = ctx.createGain();
      g.gain.value = level;
      osc.connect(g).connect(filter);
      return osc;
    });
    const now = ctx.currentTime;
    for (const o of [...oscs, swell]) o.start(now);
    return {
      out,
      stop: (at) => {
        for (const o of [...oscs, swell]) o.stop(at);
      },
    };
  }
}
