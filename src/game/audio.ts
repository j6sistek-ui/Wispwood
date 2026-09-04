export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  private music: GainNode | null = null;
  private bedNodes: Array<AudioScheduledSourceNode> = [];
  private bedTimer = 0;
  private bedOn = false;
  private step = 0;
  private nextNote = 0;
  muted = false;

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.music = this.ctx.createGain();
      this.sfx.connect(this.master);
      this.music.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.master.gain.value = this.muted ? 0 : 0.7;
      this.sfx.gain.value = 0.85;
      this.music.gain.value = this.muted ? 0 : 1.15;
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

  startBed() {
    this.unlock();
    if (!this.ctx || !this.master || !this.music || this.bedOn) return;
    this.bedOn = true;
    this.music.gain.setTargetAtTime(this.muted ? 0 : 1.15, this.ctx.currentTime, 0.08);

    const drone = this.ctx.createOscillator();
    drone.type = "sawtooth";
    drone.frequency.value = 73.42;
    const droneB = this.ctx.createOscillator();
    droneB.type = "sine";
    droneB.frequency.value = 110.2;
    const eerie = this.ctx.createOscillator();
    eerie.type = "triangle";
    eerie.frequency.value = 77.8;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 240;
    lp.Q.value = 0.8;
    const dg = this.ctx.createGain();
    dg.gain.value = 0.42;
    drone.connect(lp);
    droneB.connect(lp);
    eerie.connect(lp);
    lp.connect(dg);
    dg.connect(this.music);

    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.07;
    const lfoG = this.ctx.createGain();
    lfoG.gain.value = 90;
    lfo.connect(lfoG);
    lfoG.connect(lp.frequency);

    const noiseBuf = this.ctx.createBuffer(1, this.ctx.sampleRate * 2, this.ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const wind = this.ctx.createBufferSource();
    wind.buffer = noiseBuf;
    wind.loop = true;
    const bp = this.ctx.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 720;
    bp.Q.value = 0.6;
    const wg = this.ctx.createGain();
    wg.gain.value = 0.09;
    wind.connect(bp);
    bp.connect(wg);
    wg.connect(this.music);

    drone.start();
    droneB.start();
    eerie.start();
    lfo.start();
    wind.start();
    this.bedNodes = [drone, droneB, eerie, lfo, wind];

    this.step = 0;
    this.nextNote = this.ctx.currentTime + 0.04;
    this.tickBed();
  }

  stopBed() {
    this.bedOn = false;
    if (this.bedTimer) {
      window.clearTimeout(this.bedTimer);
      this.bedTimer = 0;
    }
    for (const n of this.bedNodes) {
      try {
        n.stop();
      } catch {
        /* already stopped */
      }
      try {
        n.disconnect();
      } catch {
        /* already disconnected */
      }
    }
    this.bedNodes = [];
    if (this.music && this.ctx) this.music.gain.setTargetAtTime(0, this.ctx.currentTime, 0.06);
  }

  private tickBed() {
    if (!this.bedOn || !this.ctx) return;
    const stepDur = 60 / 118 / 2;
    while (this.nextNote < this.ctx.currentTime + 0.2) {
      this.scheduleStep(this.step, this.nextNote);
      this.step = (this.step + 1) % 16;
      this.nextNote += stepDur;
    }
    this.bedTimer = window.setTimeout(() => this.tickBed(), 40);
  }

  private scheduleStep(step: number, t: number) {
    const bass = [73.42, 73.42, 0, 110, 73.42, 87.31, 0, 98, 73.42, 73.42, 0, 110, 65.41, 87.31, 98, 110];
    const lead = [220, 0, 261.63, 293.66, 349.23, 0, 329.63, 261.63, 293.66, 0, 349.23, 392, 349.23, 329.63, 261.63, 220];
    const b = bass[step] ?? 0;
    const l = lead[step] ?? 0;
    if (b) this.musicTone(b, 0.22, "square", 0.13, -8, t);
    if (l) {
      this.musicTone(l, 0.16, "triangle", 0.11, 12, t);
      this.musicTone(l * 2, 0.12, "sine", 0.055, 18, t);
    }
    if (step % 4 === 0) this.musicTone(48, 0.1, "sine", 0.18, -12, t);
    if (step % 4 === 2) this.musicNoise(0.05, 0.08, t);
    if (step % 2 === 1) this.musicTone(880 + (step % 8) * 20, 0.04, "square", 0.035, -200, t);
    if (step === 7 || step === 15) this.musicTone(155.56, 0.28, "sawtooth", 0.09, 40, t);
  }

  private musicTone(
    freq: number,
    dur: number,
    type: OscillatorType,
    gain: number,
    slide: number,
    when: number,
  ) {
    if (!this.ctx || !this.music) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), when + dur);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    osc.connect(g);
    g.connect(this.music);
    osc.start(when);
    osc.stop(when + dur + 0.02);
    osc.onended = () => {
      osc.disconnect();
      g.disconnect();
    };
  }

  private musicNoise(dur: number, gain: number, when: number) {
    if (!this.ctx || !this.music) return;
    const n = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, Math.max(1, n), this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = 900;
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.music);
    src.start(when);
    src.stop(when + dur);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      g.disconnect();
    };
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
    this.stopBed();
    this.tone(220, 0.4, "triangle", 0.1, -160);
    this.noise(0.25, 0.06);
  }

  wave() {
    this.tone(392, 0.16, "sine", 0.06, 80);
    this.tone(523, 0.22, "sine", 0.04, 40);
  }

  jackpot() {
    this.unlock();
    if (this.ctx?.state === "suspended") void this.ctx.resume();
    if (!this.ctx || !this.sfx || this.muted) return;
    if (this.music) {
      this.music.gain.setTargetAtTime(0.22, this.ctx.currentTime, 0.04);
      window.setTimeout(() => {
        if (this.music && this.ctx && this.bedOn) {
          this.music.gain.setTargetAtTime(1.15, this.ctx.currentTime, 0.12);
        }
      }, 2300);
    }
    const fanfare = [196, 246.94, 293.66, 392, 493.88, 587.33, 784, 987.77];
    for (let i = 0; i < fanfare.length; i++) {
      const f = fanfare[i]!;
      const t = i * 0.11;
      this.tone(f, 0.36, "sawtooth", 0.22, 40, t);
      this.tone(f * 2, 0.3, "triangle", 0.14, 20, t);
      this.tone(f * 0.5, 0.45, "sine", 0.12, 0, t);
      this.musicTone(f, 0.36, "sawtooth", 0.18, 40, this.ctx.currentTime + t);
      this.musicTone(f * 2, 0.28, "triangle", 0.1, 20, this.ctx.currentTime + t);
    }
    this.tone(130.81, 1.8, "sawtooth", 0.16, 8, 0.05);
    this.tone(164.81, 1.8, "triangle", 0.14, 6, 0.05);
    this.tone(196, 2.0, "sine", 0.16, 10, 0.12);
    this.tone(261.63, 1.6, "triangle", 0.14, 12, 0.35);
    this.tone(329.63, 1.4, "sine", 0.13, 16, 0.55);
    this.tone(392, 1.5, "sawtooth", 0.15, 20, 0.75);
    this.tone(523.25, 1.2, "triangle", 0.16, 30, 0.95);
    this.noise(0.16, 0.2);
    this.tone(80, 0.18, "square", 0.18, -20, 0.18);
    this.tone(80, 0.16, "square", 0.2, -20, 0.42);
    this.tone(80, 0.22, "square", 0.22, -20, 0.88);
  }
}
