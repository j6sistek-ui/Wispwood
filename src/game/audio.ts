export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  muted = false;

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.sfx.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.master.gain.value = this.muted ? 0 : 0.7;
      this.sfx.gain.value = 0.85;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.7, this.ctx.currentTime, 0.03);
    }
  }

  resume() {
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  private tone(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain = 0.12,
    slide = 0,
    delay = 0,
  ) {
    if (!this.ctx || !this.sfx || this.muted) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(g);
    g.connect(this.sfx);
    osc.start(t);
    osc.stop(t + dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  private noise(dur: number, gain = 0.08) {
    if (!this.ctx || !this.sfx || this.muted) return;
    const n = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    const t = this.ctx.currentTime;
    g.gain.setValueAtTime(gain, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 600;
    src.connect(filter);
    filter.connect(g);
    g.connect(this.sfx);
    src.start(t);
    src.stop(t + dur);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      g.disconnect();
    };
  }

  fire() {
    this.tone(520 + Math.random() * 40, 0.07, "triangle", 0.07, -220);
    this.noise(0.04, 0.035);
  }

  bolt() {
    this.tone(980 + Math.random() * 80, 0.05, "square", 0.07, -400);
    this.noise(0.05, 0.05);
    this.tone(240, 0.08, "sawtooth", 0.04, -90);
  }

  ice() {
    this.tone(740 + Math.random() * 40, 0.08, "sine", 0.07, 180);
    this.tone(980, 0.1, "triangle", 0.04, 80);
  }

  hit() {
    this.tone(180 + Math.random() * 30, 0.09, "square", 0.06, -80);
  }

  hurt() {
    this.tone(140, 0.22, "sawtooth", 0.08, -90);
  }

  pickup() {
    this.tone(660, 0.1, "sine", 0.08, 220);
    this.tone(880, 0.14, "sine", 0.05, 80);
  }

  death() {
    this.tone(220, 0.4, "triangle", 0.1, -160);
    this.noise(0.25, 0.06);
  }

  wave() {
    this.tone(392, 0.16, "sine", 0.06, 80);
    this.tone(523, 0.22, "sine", 0.04, 40);
  }

  jackpot() {
    const fanfare = [196, 246.94, 293.66, 392, 493.88, 587.33, 784, 987.77];
    for (let i = 0; i < fanfare.length; i++) {
      const f = fanfare[i]!;
      const t = i * 0.11;
      this.tone(f, 0.32, "sawtooth", 0.07, 40, t);
      this.tone(f * 2, 0.26, "triangle", 0.045, 20, t);
      this.tone(f * 0.5, 0.4, "sine", 0.04, 0, t);
    }
    this.tone(130.81, 1.8, "sawtooth", 0.055, 8, 0.05);
    this.tone(164.81, 1.8, "triangle", 0.05, 6, 0.05);
    this.tone(196, 2.0, "sine", 0.06, 10, 0.12);
    this.tone(261.63, 1.6, "triangle", 0.05, 12, 0.35);
    this.tone(329.63, 1.4, "sine", 0.045, 16, 0.55);
    this.tone(392, 1.5, "sawtooth", 0.05, 20, 0.75);
    this.tone(523.25, 1.2, "triangle", 0.06, 30, 0.95);
    this.noise(0.14, 0.09);
    this.tone(80, 0.18, "square", 0.06, -20, 0.18);
    this.tone(80, 0.16, "square", 0.07, -20, 0.42);
    this.tone(80, 0.22, "square", 0.08, -20, 0.88);
  }
}
