import { asset } from "./paths";

export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private sfx: GainNode | null = null;
  private music: GainNode | null = null;
  private makeup: GainNode | null = null;
  private bedNodes: Array<AudioScheduledSourceNode> = [];
  private bedTimer = 0;
  private bedOn = false;
  private step = 0;
  private nextNote = 0;
  private jackBuf: AudioBuffer | null = null;
  private jackLoading = false;
  private noiseBuf: AudioBuffer | null = null;
  muted = false;

  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new Ctx({ latencyHint: "interactive" });
      this.master = this.ctx.createGain();
      this.sfx = this.ctx.createGain();
      this.music = this.ctx.createGain();
      this.makeup = this.ctx.createGain();
      const glue = this.makeComp(-24, 8, 5.5, 0.01, 0.14);
      const grit = this.ctx.createWaveShaper();
      grit.curve = this.satCurve(1.8);
      grit.oversample = "2x";
      const limit = this.makeComp(-3.5, 0.4, 18, 0.003, 0.06);
      this.sfx.connect(this.master);
      this.music.connect(glue);
      glue.connect(grit);
      grit.connect(limit);
      limit.connect(this.makeup);
      this.makeup.connect(this.master);
      this.master.connect(this.ctx.destination);
      this.master.gain.value = this.muted ? 0 : 1;
      this.sfx.gain.value = 1.15;
      this.music.gain.value = this.muted ? 0 : 1.7;
      this.makeup.gain.value = 2.6;
      this.makeNoiseBuf();
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    this.loadJackpot();
  }

  setMuted(muted: boolean) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 1, this.ctx.currentTime, 0.03);
    }
  }

  resume() {
    if (this.ctx?.state === "suspended") void this.ctx.resume();
  }

  startBed() {
    this.unlock();
    if (!this.ctx || !this.master || !this.music || this.bedOn) return;
    this.bedOn = true;
    this.music.gain.setTargetAtTime(this.muted ? 0 : 1.7, this.ctx.currentTime, 0.08);
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
    const stepDur = 60 / 162 / 2;
    while (this.nextNote < this.ctx.currentTime + 0.18) {
      this.scheduleStep(this.step, this.nextNote, stepDur);
      this.step = (this.step + 1) % 64;
      this.nextNote += stepDur;
    }
    if (this.bedNodes.length > 220) {
      const drop = this.bedNodes.splice(0, this.bedNodes.length - 80);
      for (const n of drop) {
        try {
          n.stop();
        } catch {
          /* already stopped */
        }
      }
    }
    this.bedTimer = window.setTimeout(() => this.tickBed(), 50);
  }

  private scheduleStep(step: number, t: number, stepDur: number) {
    const motif = [1046.5, 155.56, 830.61, 98.0];
    const phase =
      step < 8 ? "hook" : step < 16 ? "groove" : step < 24 ? "build" : step < 28 ? "cut" : step < 32 ? "rise" : "drop";

    if (phase === "hook" || phase === "groove") {
      if (step % 2 === 0) {
        const f = motif[(step / 2) % 4]!;
        this.smash(f, 0.46, t, phase === "groove" ? 1.15 : 1);
      }
      if (phase === "groove") {
        if (step % 2 === 0) this.kick(t, 0.36);
        if (step % 8 === 4) this.snare(t, 0.32);
        if (step % 2 === 1) this.kick(t, 0.16);
        this.playNoise(0.018, 0.06, 7000, t);
        this.growl(65.41, 0.22, 0.18, t);
      } else if (step === 0) this.growl(49.0, 0.5, 0.2, t);
    }

    if (phase === "build") {
      const climb = [130.81, 155.56, 196.0, 207.65, 261.63, 311.13, 392.0, 415.3];
      const f = climb[step - 16]!;
      this.smash(f, 0.18, t, 0.9);
      this.smash(f * 2, 0.14, t, 0.7);
      this.growl(f * 0.5, 0.2, 0.16, t);
      this.playNoise(0.04, 0.06 + (step - 16) * 0.02, 2800, t);
      this.kick(t, 0.28);
      this.snare(t, 0.12 + (step - 16) * 0.03);
    }

    if (phase === "cut") {
      this.playNoise(0.014, 0.07, 8000, t);
      if (step === 24) this.growl(32.7, 0.8, 0.22, t);
      if (step === 27) this.musicTone(28, 0.5, "sine", 0.32, 120, t);
    }

    if (phase === "rise") {
      const run = [65.41, 98.0, 130.81, 196.0, 261.63, 392.0, 523.25, 830.61];
      const i = step - 28;
      this.smash(run[i]!, 0.14, t, 1.1);
      this.smash(run[i]! * 2, 0.12, t, 0.85);
      this.growl(run[i]! * 0.5, 0.2, 0.2, t);
      this.violinTone(run[Math.min(7, i + 2)]! * 2, 0.22, 0.14, t);
      this.playNoise(0.06, 0.1 + i * 0.05, 900 + i * 700, t);
      this.kick(t, 0.3);
    }

    if (phase === "drop") {
      const d = step - 32;
      const f = motif[d % 4]!;
      const flip = [155.56, 1046.5, 98.0, 830.61][d % 4]!;
      this.smash(f, 0.2, t, 1.25);
      this.violinTone(flip, 0.16, 0.18, t);
      const bassJump = [41.2, 65.41, 49.0, 77.78, 43.65, 87.31, 38.89, 98.0];
      this.growl(bassJump[d % 8]!, 0.2, 0.24, t);
      this.kick(t, 0.4);
      const clave = d % 8;
      if (clave === 0 || clave === 3 || clave === 6 || clave === 2) this.snare(t, 0.34);
      this.playNoise(0.02, 0.08, 6500, t);
      if (d % 8 === 0) {
        this.playNoise(0.22, 0.28, 400, t);
        this.smash(523.25, 0.35, t, 1.1);
        this.smash(830.61, 0.3, t, 0.9);
        this.violinTone(1244.5, 0.28, 0.16, t);
        this.growl(32.7, 0.4, 0.26, t);
      }
      if (d % 8 === 7) {
        this.pianoTone(1244.5, 0.09, 0.18, t, true);
        this.pianoTone(932.33, 0.09, 0.16, t + stepDur * 0.33, true);
        this.pianoTone(622.25, 0.09, 0.16, t + stepDur * 0.66, true);
        this.musicTone(1100, 0.22, "sawtooth", 0.08, -700, t);
        this.growl(55, 0.25, 0.2, t);
      }
      if (d === 0) {
        this.violinTone(1568, 0.55, 0.18, t);
        this.smash(1046.5, 0.55, t, 1.3);
        this.growl(41.2, 0.6, 0.28, t);
      }
    }

    if (step === 0) {
      this.playNoise(0.28, 0.24, 350, t);
      this.violinTone(830.61, 0.8, 0.14, t);
      this.growl(32.7, 0.7, 0.22, t);
    }
  }

  private smash(freq: number, dur: number, when: number, amt = 1) {
    this.pianoTone(freq, dur, 0.22 * amt, when, true);
    this.pianoTone(Math.max(48, freq * 0.5), dur, 0.16 * amt, when, true);
    this.pianoTone(freq * 1.4983, dur * 0.75, 0.08 * amt, when, false);
    this.musicTone(freq, dur * 0.55, "sawtooth", 0.045 * amt, 0, when);
  }

  private growl(freq: number, dur: number, gain: number, when: number) {
    if (!this.ctx || !this.music) return;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(380, when);
    lp.Q.value = 2.4;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    lp.connect(g);
    g.connect(this.music);
    for (const detune of [-11, 0, 10]) {
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(Math.max(32, freq), when);
      osc.detune.setValueAtTime(detune, when);
      osc.connect(lp);
      osc.start(when);
      osc.stop(when + dur + 0.03);
      osc.onended = () => {
        osc.disconnect();
      };
      this.bedNodes.push(osc);
    }
    this.musicTone(Math.max(28, freq * 0.5), dur, "sine", gain * 1.15, -6, when);
  }

  private kick(when: number, gain: number) {
    this.musicTone(52, 0.14, "sine", gain, -28, when);
    this.musicTone(30, 0.2, "sine", gain * 0.85, -6, when);
    this.playNoise(0.018, gain * 0.25, 900, when);
  }

  private snare(when: number, gain: number) {
    this.playNoise(0.09, gain, 1400, when);
    this.playNoise(0.05, gain * 0.5, 3200, when);
    this.musicTone(180, 0.07, "triangle", gain * 0.4, -60, when);
    this.musicTone(90, 0.08, "sine", gain * 0.22, -30, when);
  }

  private makeComp(threshold: number, knee: number, ratio: number, attack: number, release: number) {
    const c = this.ctx!.createDynamicsCompressor();
    c.threshold.value = threshold;
    c.knee.value = knee;
    c.ratio.value = ratio;
    c.attack.value = attack;
    c.release.value = release;
    return c;
  }

  private satCurve(drive: number) {
    const n = 256;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i / (n - 1)) * 2 - 1;
      curve[i] = Math.tanh(x * drive);
    }
    return curve;
  }

  private makeNoiseBuf() {
    if (!this.ctx || this.noiseBuf) return;
    const n = Math.floor(this.ctx.sampleRate * 0.25);
    const buf = this.ctx.createBuffer(1, Math.max(1, n), this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    this.noiseBuf = buf;
  }

  private playNoise(dur: number, gain: number, hp: number, when: number) {
    if (!this.ctx || !this.music) return;
    if (!this.noiseBuf) this.makeNoiseBuf();
    if (!this.noiseBuf) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;
    const g = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.value = hp;
    g.gain.setValueAtTime(gain, when);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(this.music);
    src.start(when);
    src.stop(when + dur + 0.02);
    src.onended = () => {
      src.disconnect();
      filter.disconnect();
      g.disconnect();
    };
  }

  private pianoTone(freq: number, dur: number, gain: number, when: number, grand = false) {
    if (!this.ctx || !this.music) return;
    const partials: Array<[number, number]> = grand
      ? [
          [1, 1],
          [2, 0.52],
          [3, 0.26],
          [4, 0.13],
          [5, 0.07],
        ]
      : [
          [1, 1],
          [2, 0.3],
        ];
    for (const [n, amp] of partials) {
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq * n * (1 + 0.0004 * n * n), when);
      const a = Math.max(0.0002, gain * amp);
      g.gain.setValueAtTime(0.0001, when);
      g.gain.exponentialRampToValueAtTime(a, when + (grand ? 0.004 : 0.008));
      g.gain.exponentialRampToValueAtTime(a * (grand ? 0.42 : 0.3), when + dur * 0.18);
      g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
      osc.connect(g);
      g.connect(this.music);
      osc.start(when);
      osc.stop(when + dur + 0.05);
      osc.onended = () => {
        osc.disconnect();
        g.disconnect();
      };
      this.bedNodes.push(osc);
    }
    if (grand) this.playNoise(0.012, gain * 0.04, 1200, when);
  }

  private violinTone(freq: number, dur: number, gain: number, when: number) {
    if (!this.ctx || !this.music) return;
    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(Math.min(2800, freq * 2.6), when);
    filter.Q.value = 1.4;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.1);
    g.gain.setValueAtTime(gain * 0.92, when + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    filter.connect(g);
    g.connect(this.music);
    for (const detune of [-6, 7]) {
      const osc = this.ctx.createOscillator();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, when);
      osc.detune.setValueAtTime(detune, when);
      for (let i = 1; i <= 7; i++) {
        osc.detune.linearRampToValueAtTime(detune + Math.sin(i * 1.2) * 10, when + i * (dur / 8));
      }
      osc.connect(filter);
      osc.start(when);
      osc.stop(when + dur + 0.04);
      osc.onended = () => {
        osc.disconnect();
      };
      this.bedNodes.push(osc);
    }
  }



  private chipTone(freq: number, dur: number, type: OscillatorType, gain: number, when: number) {
    if (!this.ctx || !this.music) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    g.gain.setValueAtTime(0.0001, when);
    g.gain.exponentialRampToValueAtTime(gain, when + 0.006);
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
    g.gain.exponentialRampToValueAtTime(gain, when + 0.02);
    g.gain.setValueAtTime(gain, when + Math.max(0.04, dur * 0.72));
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

  private noise(dur: number, gain = 0.08, delay = 0) {
    if (!this.ctx || !this.sfx || this.muted) return;
    const n = this.ctx.sampleRate * dur;
    const buf = this.ctx.createBuffer(1, n, this.ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const g = this.ctx.createGain();
    const t = this.ctx.currentTime + delay;
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

  relicTick() {
    this.tone(520 + Math.random() * 400, 0.05, "square", 0.06, 80);
  }

  relicReveal() {
    this.tone(392, 0.12, "triangle", 0.1, 40);
    this.tone(523, 0.16, "triangle", 0.1, 60, 0.08);
    this.tone(784, 0.28, "sine", 0.12, 40, 0.16);
    this.tone(1046, 0.4, "sine", 0.1, 20, 0.28);
    this.noise(0.12, 0.08);
  }

  jackpot() {
    this.unlock();
    if (this.ctx?.state === "suspended") void this.ctx.resume();
    if (!this.ctx || !this.sfx || this.muted) return;
    if (this.music) {
      this.music.gain.setTargetAtTime(0.08, this.ctx.currentTime, 0.04);
      window.setTimeout(() => {
        if (this.music && this.ctx && this.bedOn) {
          this.music.gain.setTargetAtTime(1.7, this.ctx.currentTime, 0.2);
        }
      }, 6200);
    }
    this.tone(90, 0.12, "square", 0.22, -20, 0);
    this.noise(0.08, 0.16, 0);
    for (let i = 0; i < 28; i++) {
      const t = 0.05 + i * (0.018 + i * 0.0012);
      this.tone(780 + (i % 5) * 140, 0.03, "square", 0.1, 0, t);
      this.tone(160 + (i % 3) * 40, 0.025, "square", 0.07, 0, t);
    }
    for (let r = 0; r < 3; r++) {
      const t = 0.62 + r * 0.16;
      this.tone(140, 0.08, "square", 0.2, -30, t);
      this.tone(980, 0.05, "triangle", 0.14, 0, t);
      this.noise(0.04, 0.12, t);
    }
    for (let i = 0; i < 70; i++) {
      const t = 0.7 + Math.random() * 3.8;
      this.tone(2400 + Math.random() * 1800, 0.025, "sine", 0.07 + Math.random() * 0.05, 80, t);
      if (i % 3 === 0) this.noise(0.03, 0.06, t);
    }
    for (let i = 0; i < 48; i++) {
      const t = 1.0 + i * 0.055 + Math.random() * 0.03;
      this.tone(1200 + Math.random() * 900, 0.05, "triangle", 0.09, -40, t);
      this.tone(700 + Math.random() * 200, 0.04, "square", 0.05, 0, t);
    }
    const dings = [1046.5, 1318.5, 1568, 2093, 1568, 1318.5, 2093, 2637];
    for (let k = 0; k < 10; k++) {
      const t = 0.95 + k * 0.28;
      const f = dings[k % dings.length]!;
      this.tone(f, 0.22, "sine", 0.16, 20, t);
      this.tone(f * 2, 0.14, "triangle", 0.08, 10, t);
    }
    for (let i = 0; i < 16; i++) {
      this.tone(880 + (i % 4) * 110, 0.07, "square", 0.1, 0, 1.1 + i * 0.09);
    }
    for (let i = 0; i < 8; i++) {
      this.tone(1480, 0.08, "square", 0.12, 0, 2.2 + i * 0.18);
      this.tone(1960, 0.08, "square", 0.1, 0, 2.28 + i * 0.18);
    }
    this.playJackVoice();
    this.tone(80, 0.2, "sine", 0.26, -8, 0.7);
    this.tone(80, 0.18, "square", 0.22, -8, 2.4);
    this.tone(80, 0.24, "square", 0.26, -8, 4.2);
    this.noise(0.2, 0.14, 0.7);
    this.noise(0.18, 0.12, 2.1);
  }

  private loadJackpot() {
    if (this.jackBuf || this.jackLoading || !this.ctx) return;
    this.jackLoading = true;
    fetch(asset("game/sfx/jackpot.mp3"))
      .then((r) => r.arrayBuffer())
      .then((b) => this.ctx!.decodeAudioData(b))
      .then((buf) => {
        this.jackBuf = buf;
      })
      .catch(() => {
        this.jackLoading = false;
      });
  }

  private playJackVoice() {
    if (!this.ctx || !this.sfx || this.muted) return;
    if (!this.jackBuf) {
      this.loadJackpot();
      this.yellJackpot();
      return;
    }
    const play = (delay: number, rate: number, gain: number) => {
      const src = this.ctx!.createBufferSource();
      src.buffer = this.jackBuf;
      src.playbackRate.value = rate;
      const g = this.ctx!.createGain();
      g.gain.value = gain;
      src.connect(g);
      g.connect(this.sfx!);
      src.start(this.ctx!.currentTime + delay);
      src.onended = () => {
        src.disconnect();
        g.disconnect();
      };
    };
    play(0.55, 1, 1.35);
    play(1.85, 1.04, 1.15);
  }

  private yellJackpot() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const voice = this.pickVoice();
      const say = (text: string, delay: number, pitch: number, rate: number) => {
        window.setTimeout(() => {
          const u = new SpeechSynthesisUtterance(text);
          u.lang = "en-US";
          u.volume = 1;
          u.pitch = pitch;
          u.rate = rate;
          if (voice) u.voice = voice;
          window.speechSynthesis.speak(u);
        }, delay);
      };
      say("Yeah!", 520, 1.28, 1.22);
      say("Jackpot!", 820, 1.42, 1.08);
      say("Jackpot! Let's go!", 1580, 1.38, 1.18);
    } catch {
      /* speech optional */
    }
  }

  private pickVoice() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    const prefer = /samantha|alex|aria|guy|davis|jenny|google us english|daniel|moira|karen|fred/i;
    return (
      voices.find((v) => prefer.test(v.name) && /^en/i.test(v.lang)) ||
      voices.find((v) => /^en-US/i.test(v.lang) && !/compact|novelty|whisper|bad news|good news|bells/i.test(v.name)) ||
      voices.find((v) => /^en/i.test(v.lang)) ||
      null
    );
  }

  private humanShout(delay: number) {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime + delay;
    const pulse = this.ctx.createOscillator();
    pulse.type = "sawtooth";
    pulse.frequency.setValueAtTime(240, t);
    pulse.frequency.linearRampToValueAtTime(310, t + 0.12);
    pulse.frequency.linearRampToValueAtTime(270, t + 0.55);
    const vib = this.ctx.createOscillator();
    vib.frequency.value = 5.4;
    const vibG = this.ctx.createGain();
    vibG.gain.value = 8;
    vib.connect(vibG);
    vibG.connect(pulse.frequency);
    const f1 = this.ctx.createBiquadFilter();
    f1.type = "bandpass";
    f1.Q.value = 5;
    f1.frequency.setValueAtTime(520, t);
    f1.frequency.linearRampToValueAtTime(740, t + 0.18);
    const f2 = this.ctx.createBiquadFilter();
    f2.type = "bandpass";
    f2.Q.value = 4;
    f2.frequency.setValueAtTime(1180, t);
    f2.frequency.linearRampToValueAtTime(980, t + 0.4);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.22, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.16, t + 0.28);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
    pulse.connect(f1);
    pulse.connect(f2);
    f1.connect(g);
    f2.connect(g);
    g.connect(this.sfx);
    pulse.start(t);
    vib.start(t);
    pulse.stop(t + 0.74);
    vib.stop(t + 0.74);
  }

  private holdVoice(f0: number, f1: number, f2: number, dur: number, delay: number, gain: number) {
    if (!this.ctx || !this.sfx) return;
    const t = this.ctx.currentTime + delay;
    const pulse = this.ctx.createOscillator();
    pulse.type = "sawtooth";
    pulse.frequency.setValueAtTime(f0, t);
    pulse.frequency.linearRampToValueAtTime(f0 * 0.96, t + dur);
    const bp1 = this.ctx.createBiquadFilter();
    bp1.type = "bandpass";
    bp1.frequency.value = f1;
    bp1.Q.value = 8;
    const bp2 = this.ctx.createBiquadFilter();
    bp2.type = "bandpass";
    bp2.frequency.value = f2;
    bp2.Q.value = 7;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.08);
    g.gain.setValueAtTime(gain, t + dur - 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    pulse.connect(bp1);
    pulse.connect(bp2);
    bp1.connect(g);
    bp2.connect(g);
    g.connect(this.sfx);
    pulse.start(t);
    pulse.stop(t + dur + 0.04);
    pulse.onended = () => {
      pulse.disconnect();
      bp1.disconnect();
      bp2.disconnect();
      g.disconnect();
    };
  }
}
