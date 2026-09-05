import { asset } from "./paths";

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
  private jackBuf: AudioBuffer | null = null;
  private jackLoading = false;
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

    const drone = this.ctx.createOscillator();
    drone.type = "triangle";
    drone.frequency.value = 130.81;
    const droneB = this.ctx.createOscillator();
    droneB.type = "square";
    droneB.frequency.value = 196;
    const eerie = this.ctx.createOscillator();
    eerie.type = "triangle";
    eerie.frequency.value = 329.63;
    const lp = this.ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1800;
    lp.Q.value = 0.7;
    const dg = this.ctx.createGain();
    dg.gain.value = 0.12;
    drone.connect(lp);
    droneB.connect(lp);
    eerie.connect(lp);
    lp.connect(dg);
    dg.connect(this.music);

    const lfo = this.ctx.createOscillator();
    lfo.type = "sine";
    lfo.frequency.value = 0.35;
    const lfoG = this.ctx.createGain();
    lfoG.gain.value = 60;
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
    bp.frequency.value = 3200;
    bp.Q.value = 0.5;
    const wg = this.ctx.createGain();
    wg.gain.value = 0.03;
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
    const stepDur = 60 / 176 / 2;
    while (this.nextNote < this.ctx.currentTime + 0.2) {
      this.scheduleStep(this.step, this.nextNote);
      this.step = (this.step + 1) % 16;
      this.nextNote += stepDur;
    }
    this.bedTimer = window.setTimeout(() => this.tickBed(), 40);
  }

  private scheduleStep(step: number, t: number) {
    const bass = [130.81, 0, 130.81, 0, 196, 0, 130.81, 164.81, 174.61, 0, 174.61, 0, 196, 0, 220, 261.63];
    const lead = [523.25, 659.25, 783.99, 659.25, 523.25, 0, 587.33, 659.25, 698.46, 783.99, 659.25, 523.25, 587.33, 523.25, 392, 523.25];
    const b = bass[step] ?? 0;
    const l = lead[step] ?? 0;
    if (b) this.musicTone(b, 0.14, "square", 0.26, 0, t);
    if (l) {
      this.musicTone(l, 0.12, "triangle", 0.2, 8, t);
      this.musicTone(l * 2, 0.08, "sine", 0.08, 10, t);
    }
    if (step % 4 === 0) this.musicTone(60, 0.08, "sine", 0.48, -10, t);
    if (step % 8 === 4) this.musicNoise(0.08, 0.2, t);
    if (step % 2 === 1) this.musicTone(3200, 0.025, "square", 0.05, -600, t);
    if (step === 0 || step === 8) {
      this.musicTone(261.63, 0.16, "triangle", 0.12, 0, t);
      this.musicTone(329.63, 0.16, "triangle", 0.1, 0, t);
      this.musicTone(392, 0.16, "triangle", 0.1, 0, t);
    }
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
