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
      this.master.gain.value = this.muted ? 0 : 1;
      this.sfx.gain.value = 1;
      this.music.gain.value = this.muted ? 0 : 1.7;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
    }
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

    const drone = this.ctx.createOscillator();
    drone.type = "sawtooth";
    drone.frequency.value = 73.42;
    const droneB = this.ctx.createOscillator();
    droneB.type = "square";
    droneB.frequency.value = 146.83;
    const eerie = this.ctx.createOscillator();
    eerie.type = "sawtooth";
    eerie.frequency.value = 220.5;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 920;
    lp.Q.value = 1.4;
    const dg = this.ctx.createGain();
    dg.gain.value = 0.28;
    drone.connect(lp);
    droneB.connect(lp);
    eerie.connect(lp);
    lp.connect(dg);
    dg.connect(this.music);

    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.18;
    const lfoG = this.ctx.createGain();
    lfoG.gain.value = 180;
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
    bp.frequency.value = 1800;
    bp.Q.value = 0.9;
    const wg = this.ctx.createGain();
    wg.gain.value = 0.05;
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
    const stepDur = 60 / 152 / 2;
    while (this.nextNote < this.ctx.currentTime + 0.2) {
      this.scheduleStep(this.step, this.nextNote);
      this.step = (this.step + 1) % 16;
      this.nextNote += stepDur;
    }
    this.bedTimer = window.setTimeout(() => this.tickBed(), 40);
  }

  private scheduleStep(step: number, t: number) {
    const bass = [73.42, 0, 73.42, 110, 73.42, 0, 87.31, 98, 73.42, 0, 73.42, 110, 65.41, 87.31, 98, 146.83];
    const lead = [440, 0, 523.25, 587.33, 698.46, 0, 659.25, 523.25, 587.33, 0, 698.46, 783.99, 698.46, 659.25, 523.25, 880];
    const b = bass[step] ?? 0;
    const l = lead[step] ?? 0;
    if (b) this.musicTone(b, 0.18, "square", 0.28, -6, t);
    if (l) {
      this.musicTone(l, 0.14, "sawtooth", 0.2, 18, t);
      this.musicTone(l * 2, 0.1, "square", 0.08, 24, t);
    }
    if (step % 2 === 0) this.musicTone(55, 0.09, "sine", 0.42, -18, t);
    if (step % 4 === 2) this.musicNoise(0.07, 0.22, t);
    this.musicTone(2400 + (step % 8) * 80, 0.03, "square", 0.06, -400, t);
    if (step === 7 || step === 15) this.musicTone(196, 0.22, "sawtooth", 0.2, 80, t);
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
      this.music.gain.setTargetAtTime(0.1, this.ctx.currentTime, 0.04);
      window.setTimeout(() => {
        if (this.music && this.ctx && this.bedOn) {
          this.music.gain.setTargetAtTime(1.7, this.ctx.currentTime, 0.2);
        }
      }, 4800);
    }
    for (let i = 0; i < 14; i++) {
      const t = i * 0.038;
      this.tone(920 + (i % 3) * 180, 0.04, "square", 0.1, 0, t);
      this.tone(180, 0.03, "square", 0.08, 0, t);
    }
    this.noise(0.12, 0.22);
    this.tone(80, 0.2, "sine", 0.28, -10, 0.52);
    const bells = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568, 2093];
    for (let i = 0; i < bells.length; i++) {
      const t = 0.55 + i * 0.07;
      this.tone(bells[i]!, 0.22, "triangle", 0.2, 12, t);
      this.tone(bells[i]! * 2, 0.16, "sine", 0.1, 8, t);
    }
    const hit = [523.25, 659.25, 783.99, 1046.5];
    for (let k = 0; k < 6; k++) {
      const t = 1.05 + k * 0.22;
      for (let i = 0; i < hit.length; i++) {
        this.tone(hit[i]!, 0.18, "square", 0.16, 0, t + i * 0.04);
        this.tone(hit[i]! * 2, 0.12, "triangle", 0.08, 0, t + i * 0.04);
      }
      this.tone(1046.5, 0.12, "sine", 0.14, 40, t + 0.16);
    }
    this.yellJackpot();
    this.holdVoice(980, 820, 1480, 0.55, 0.7, 0.28);
    this.holdVoice(740, 420, 980, 2.4, 1.2, 0.32);
    for (let i = 0; i < 18; i++) {
      this.tone(1400 + (i % 4) * 220, 0.06, "sine", 0.09, 80, 1.3 + i * 0.08);
    }
    this.tone(80, 0.18, "square", 0.24, -8, 1.05);
    this.tone(80, 0.16, "square", 0.22, -8, 2.15);
    this.tone(80, 0.22, "square", 0.26, -8, 3.4);
  }

  private yellJackpot() {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance("JACKPOT");
      u.pitch = 1.9;
      u.rate = 0.85;
      u.volume = 1;
      u.lang = "en-US";
      const voices = window.speechSynthesis.getVoices();
      const high = voices.find((v) => /female|child|zira|samantha|google us|kyoko/i.test(v.name));
      if (high) u.voice = high;
      window.setTimeout(() => window.speechSynthesis.speak(u), 620);
    } catch {
      /* speech optional */
    }
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
