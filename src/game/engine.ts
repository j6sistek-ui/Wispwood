import { Input, type Actions } from "./input";
import { GameAudio } from "./audio";
import { loadAssets, type GameAssets } from "./assets";
import { loadSave, writeSave } from "./save";

export type Phase = "boot" | "title" | "playing" | "paused" | "book" | "wheel" | "dead";
export type Spell = "ember" | "frost" | "bolt" | "void" | "vine" | "craft";
export type SpellStat = "speed" | "damage";
export type SpellUpgrades = { speed: number; damage: number };
export type CraftShape = "single" | "triple" | "weave" | "orb" | "beam" | "nova" | "wave" | "meteor" | "shard" | "homing";
export type CraftExtra = "none" | "burn" | "slow" | "stun";
export type CraftedSpell = {
  name: string;
  color: string;
  damage: number;
  shape: CraftShape;
  extra: CraftExtra;
  cooldown: number;
};

export const MAX_SPELL_UP = 20;

export function upgradeCost(level: number) {
  return Math.floor(10 * Math.pow(1.38, level));
}

export function spellDamage(spell: Spell, damageUp: number, crafted?: CraftedSpell | null) {
  if (spell === "frost") return 8 + damageUp;
  if (spell === "bolt") return 35 + damageUp * 3;
  if (spell === "void") return 15 + damageUp * 2;
  if (spell === "vine") return 12 + damageUp * 2;
  if (spell === "craft") return (crafted?.damage ?? 10) + 5 + damageUp * 2;
  return 19 + damageUp * 2;
}

export type HudState = {
  phase: Phase;
  hp: number;
  maxHp: number;
  score: number;
  wave: number;
  best: number;
  bestNight: number;
  muted: boolean;
  loading: boolean;
  spell: Spell;
  gold: number;
  upgrades: Record<Spell, SpellUpgrades>;
  boltUnlocked: boolean;
  voidUnlocked: boolean;
  crafted: CraftedSpell | null;
};

type Dir = "down" | "left" | "right" | "up";
type EnemyKind = "wisp" | "runner" | "brute" | "elite";

type Bullet = {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
  r: number;
  spell: Spell;
  trail: number;
  ox: number;
  oy: number;
  dist: number;
  dirX: number;
  dirY: number;
  speed: number;
  form: CraftShape;
  color: string;
  ang: number;
  orbit: number;
};

type Enemy = {
  alive: boolean;
  x: number;
  y: number;
  hp: number;
  maxHp: number;
  r: number;
  speed: number;
  kind: EnemyKind;
  flash: number;
  frame: number;
  contact: number;
  freeze: number;
  stun: number;
  burn: number;
  dash: number;
  lunging: number;
  voidIcd: number;
  vineIcd: number;
  wrapped: number;
};

type Pickup = { alive: boolean; x: number; y: number; ttl: number; frame: number };
type Spark = {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
  max: number;
  size: number;
  color: string;
  kind: "dot" | "flake" | "coin";
};
type Floater = { alive: boolean; x: number; y: number; ttl: number; text: string; color: string };
type Burst = { alive: boolean; x: number; y: number; t: number; spell: Spell };
type Arc = { alive: boolean; x: number; y: number; r: number; ttl: number; max: number };
type Prop = { kind: string; x: number; y: number; r: number; drawW: number; drawH: number };

const ARENA = 2200;
const VIEW_ZOOM = 1.45;
const FIXED = 1 / 60;
const PLAYER_R = 16;
const PLAYER_SPEED = 268;
const PLAYER_ACCEL = 16;
const PLAYER_STOP = 18;
const BULLET_SPEED = 560;
const FIRE_CD = 0.5;
const BOLT_CD = 1.5;
const VOID_CD = 2.5;
const BOLT_SPEED = 1280;
const MAX_BULLETS = 80;
const MAX_ENEMIES = 48;
const MAX_PICKUPS = 16;
const MAX_SPARKS = 180;
const MAX_ARCS = 80;

const PROP_LAYOUT: Array<Omit<Prop, "drawW" | "drawH">> = [
  { kind: "stump", x: 480, y: 520, r: 34 },
  { kind: "lantern-post", x: 1100, y: 360, r: 16 },
  { kind: "fern", x: 1680, y: 540, r: 22 },
  { kind: "moss-stone", x: 380, y: 1180, r: 30 },
  { kind: "shrub", x: 720, y: 1640, r: 26 },
  { kind: "log", x: 1540, y: 1480, r: 28 },
  { kind: "mushrooms", x: 1860, y: 980, r: 20 },
  { kind: "root", x: 980, y: 1860, r: 26 },
  { kind: "pebbles", x: 560, y: 860, r: 18 },
  { kind: "stump", x: 1780, y: 1760, r: 32 },
  { kind: "lantern-post", x: 1640, y: 280, r: 16 },
  { kind: "fern", x: 260, y: 1680, r: 22 },
  { kind: "moss-stone", x: 1320, y: 760, r: 28 },
  { kind: "shrub", x: 240, y: 640, r: 24 },
  { kind: "log", x: 980, y: 420, r: 26 },
];

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function goldFor(kind: EnemyKind) {
  if (kind === "elite") return 35;
  if (kind === "brute") return 16;
  if (kind === "runner") return 7;
  return 3;
}

function coinCountFor(kind: EnemyKind) {
  if (kind === "elite") return 9;
  if (kind === "brute") return 5;
  if (kind === "runner") return 3;
  return 2;
}

function circleHit(ax: number, ay: number, ar: number, bx: number, by: number, br: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return dx * dx + dy * dy <= (ar + br) * (ar + br);
}

function resolveCircle(x: number, y: number, r: number, ox: number, oy: number, orad: number) {
  const dx = x - ox;
  const dy = y - oy;
  const d = Math.hypot(dx, dy) || 0.0001;
  const min = r + orad;
  if (d < min) {
    const push = (min - d) / d;
    return { x: x + dx * push, y: y + dy * push };
  }
  return { x, y };
}

function dirFromAim(x: number, y: number): Dir {
  if (Math.abs(x) > Math.abs(y)) return x < 0 ? "left" : "right";
  return y < 0 ? "up" : "down";
}

function emptyUpgrades(): Record<Spell, SpellUpgrades> {
  return {
    ember: { speed: 0, damage: 0 },
    frost: { speed: 0, damage: 0 },
    bolt: { speed: 0, damage: 0 },
    void: { speed: 0, damage: 0 },
    vine: { speed: 0, damage: 0 },
    craft: { speed: 0, damage: 0 },
  };
}

export class GameEngine {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  input = new Input();
  audio = new GameAudio();
  assets: GameAssets | null = null;
  phase: Phase = "boot";
  loading = true;

  private running = false;
  private raf = 0;
  private acc = 0;
  private last = 0;
  private hitstop = 0;
  private trauma = 0;
  private reduced = false;
  private listeners: Array<(h: HudState) => void> = [];
  private bookLatch = false;
  private pauseLatch = false;

  player = { x: ARENA / 2, y: ARENA / 2, hp: 100, maxHp: 100, invuln: 0, face: "down" as Dir, frame: 0, moving: false, vx: 0, vy: 0 };
  aim = { x: 1, y: 0 };
  cam = { x: 0, y: 0 };
  fireCd = 0;
  score = 0;
  gold = 0;
  wave = 0;
  best = 0;
  bestNight = 0;
  muted = false;
  spell: Spell = "ember";
  upgrades: Record<Spell, SpellUpgrades> = emptyUpgrades();
  boltUnlocked = false;
  voidUnlocked = false;
  richRun = false;
  crafted: CraftedSpell | null = null;
  private toSpawn = 0;
  private spawnT = 0;
  private waveGap = 0;
  private animT = 0;
  private burnAcc = 0;

  private bullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private pickups: Pickup[] = [];
  private sparks: Spark[] = [];
  private floaters: Floater[] = [];
  private bursts: Burst[] = [];
  private arcs: Arc[] = [];
  private props: Prop[] = [];
  private view = { w: 800, h: 600 };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) throw new Error("Canvas unsupported");
    this.ctx = ctx;
    this.input.attach();
    const save = loadSave();
    this.best = save.best;
    this.bestNight = save.bestNight;
    this.muted = save.muted;
    this.audio.setMuted(save.muted);
    this.reduced =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    this.installControlsTest();
  }

  subscribe(fn: (h: HudState) => void) {
    this.listeners.push(fn);
    fn(this.hud());
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  hud(): HudState {
    return {
      phase: this.phase,
      hp: this.player.hp,
      maxHp: this.player.maxHp,
      score: this.score,
      wave: this.wave,
      best: this.best,
      bestNight: this.bestNight,
      muted: this.muted,
      loading: this.loading,
      spell: this.spell,
      gold: this.gold,
      upgrades: {
        ember: { ...this.upgrades.ember },
        frost: { ...this.upgrades.frost },
        bolt: { ...this.upgrades.bolt },
        void: { ...this.upgrades.void },
        vine: { ...this.upgrades.vine },
        craft: { ...this.upgrades.craft },
      },
      boltUnlocked: this.boltUnlocked,
      voidUnlocked: this.voidUnlocked,
      crafted: this.crafted ? { ...this.crafted } : null,
    };
  }

  private emit() {
    const h = this.hud();
    for (const fn of this.listeners) fn(h);
  }

  private persist() {
    writeSave({ version: 1, best: this.best, bestNight: this.bestNight, muted: this.muted });
  }

  async boot() {
    this.loading = true;
    this.emit();
    try {
      this.assets = await loadAssets();
      this.buildProps();
    } catch {
      this.assets = null;
    }
    this.loading = false;
    this.phase = "title";
    this.emit();
  }

  startLoop() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    const tick = (now: number) => {
      if (!this.running) return;
      const raw = Math.min(0.05, (now - this.last) / 1000);
      this.last = now;
      this.acc += raw;
      while (this.acc >= FIXED) {
        this.acc -= FIXED;
        this.fixed();
      }
      this.draw();
      this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.input.detach();
  }

  resize() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const parent = this.canvas.parentElement;
    const w = Math.max(
      1,
      Math.floor(parent?.clientWidth || window.innerWidth || this.canvas.clientWidth),
    );
    const h = Math.max(
      1,
      Math.floor(parent?.clientHeight || window.innerHeight || this.canvas.clientHeight),
    );
    const bw = Math.floor(w * dpr);
    const bh = Math.floor(h * dpr);
    if (w === this.view.w && h === this.view.h && this.canvas.width === bw) return;
    this.canvas.width = bw;
    this.canvas.height = bh;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.view.w = w;
    this.view.h = h;
  }

  play(rich = false) {
    this.audio.unlock();
    this.richRun = rich;
    this.resetRun();
    if (rich) this.gold = 99999;
    this.phase = "playing";
    this.beginWave();
    this.emit();
  }

  replay() {
    this.play(this.richRun);
  }

  togglePause() {
    if (this.phase === "book") {
      this.closeBook();
      return;
    }
    if (this.phase === "wheel") {
      this.closeWheel();
      return;
    }
    if (this.phase === "playing") {
      this.phase = "paused";
      this.emit();
    } else if (this.phase === "paused") {
      this.phase = "playing";
      this.emit();
    }
  }

  openBook() {
    if (this.phase !== "playing" && this.phase !== "paused") return;
    this.phase = "book";
    this.emit();
  }

  closeBook() {
    if (this.phase !== "book") return;
    this.phase = "playing";
    this.emit();
  }

  toggleBook() {
    if (this.phase === "book") this.closeBook();
    else this.openBook();
  }

  chooseSpell(spell: Spell) {
    if (spell === "bolt" && !this.boltUnlocked) return;
    if (spell === "void" && !this.voidUnlocked) return;
    if (spell === "craft" && !this.crafted) return;
    this.setSpell(spell);
  }

  setSpell(spell: Spell) {
    if (spell === "bolt" && !this.boltUnlocked) return;
    if (spell === "void" && !this.voidUnlocked) return;
    if (spell === "craft" && !this.crafted) return;
    if (this.spell === spell) return;
    this.spell = spell;
    this.emit();
  }

  openWheel() {
    if (this.phase !== "playing" && this.phase !== "paused" && this.phase !== "book") return;
    this.phase = "wheel";
    this.emit();
  }

  closeWheel() {
    if (this.phase !== "wheel") return;
    this.phase = "playing";
    this.emit();
  }

  spinWheel(): "poor" | "miss" | "craft" {
    if (this.gold < 100) return "poor";
    this.gold -= 100;
    const won = Math.random() < 0.5;
    this.audio.pickup();
    this.emit();
    return won ? "craft" : "miss";
  }

  saveCrafted(spell: CraftedSpell) {
    this.crafted = {
      name: spell.name.trim().slice(0, 10) || "Rune",
      color: spell.color || "#ecece8",
      damage: clamp(Math.round(spell.damage), 4, 28),
      shape: spell.shape,
      extra: spell.extra,
      cooldown: clamp(spell.cooldown, 0.28, 2.2),
    };
    this.upgrades.craft = { speed: 0, damage: 0 };
    this.spell = "craft";
    this.phase = "playing";
    this.audio.wave();
    this.emit();
  }

  unlockBolt(): boolean {
    if (this.boltUnlocked) return true;
    if (this.gold < 100) return false;
    this.gold -= 100;
    this.boltUnlocked = true;
    this.spell = "bolt";
    this.audio.pickup();
    this.emit();
    return true;
  }

  unlockVoid(): boolean {
    if (this.voidUnlocked) return true;
    if (this.gold < 300) return false;
    this.gold -= 300;
    this.voidUnlocked = true;
    this.spell = "void";
    this.audio.pickup();
    this.emit();
    return true;
  }

  upgradeSpell(spell: Spell, stat: SpellStat): boolean {
    if (spell === "bolt" && !this.boltUnlocked) return false;
    if (spell === "void" && !this.voidUnlocked) return false;
    const cur = this.upgrades[spell][stat];
    if (cur >= MAX_SPELL_UP) return false;
    const cost = upgradeCost(cur);
    if (this.gold < cost) return false;
    this.gold -= cost;
    this.upgrades[spell][stat] = cur + 1;
    this.audio.pickup();
    this.emit();
    return true;
  }

  leaveRun() {
    this.resetRun();
    this.phase = "title";
    this.emit();
  }

  toggleMute() {
    this.muted = !this.muted;
    this.audio.setMuted(this.muted);
    this.persist();
    this.emit();
  }

  setTouchMove(x: number, y: number) {
    this.input.touchMove.x = x;
    this.input.touchMove.y = y;
  }

  setTouchAim(x: number, y: number, active: boolean) {
    this.input.touchAim.x = x;
    this.input.touchAim.y = y;
    this.input.touchAim.active = active;
  }

  pointAt(clientX: number, clientY: number, down: boolean, queued: boolean) {
    const rect = this.canvas.getBoundingClientRect();
    this.input.pointer.x = clientX - rect.left;
    this.input.pointer.y = clientY - rect.top;
    this.input.pointer.down = down;
    this.input.pointer.hasPoint = true;
    if (queued && down) this.input.queueShot();
  }

  private resetRun() {
    this.player = {
      x: ARENA / 2,
      y: ARENA / 2,
      hp: 100,
      maxHp: 100,
      invuln: 0,
      face: "down",
      frame: 0,
      moving: false,
      vx: 0,
      vy: 0,
    };
    this.aim = { x: 0, y: 1 };
    this.score = 0;
    this.gold = 0;
    this.upgrades = emptyUpgrades();
    this.boltUnlocked = false;
    this.voidUnlocked = false;
    this.crafted = null;
    this.spell = "ember";
    this.wave = 0;
    this.toSpawn = 0;
    this.spawnT = 0;
    this.waveGap = 0.4;
    this.fireCd = 0;
    this.hitstop = 0;
    this.trauma = 0;
    this.animT = 0;
    this.burnAcc = 0;
    this.bullets = [];
    this.enemies = [];
    this.pickups = [];
    this.sparks = [];
    this.floaters = [];
    this.bursts = [];
    this.arcs = [];
    this.cam.x = this.player.x - this.view.w / 2;
    this.cam.y = this.player.y - this.view.h / 2;
  }

  private beginWave() {
    this.wave += 1;
    if (this.wave > this.bestNight) {
      this.bestNight = this.wave;
      this.persist();
    }
    this.toSpawn = 5 + this.wave * 3;
    this.spawnT = 0.2;
    this.waveGap = 0;
    this.audio.wave();
    this.floatAt(this.player.x, this.player.y - 40, `Night ${this.wave}`);
    this.emit();
  }

  private buildProps() {
    this.props = PROP_LAYOUT.map((p) => ({
      ...p,
      drawW: p.kind === "log" ? 96 : p.kind === "lantern-post" ? 36 : 72,
      drawH: p.kind === "lantern-post" ? 110 : p.kind === "log" ? 42 : 68,
    }));
  }

  private fixed() {
    this.pollChrome();
    if (this.phase !== "playing") return;
    if (this.hitstop > 0) {
      this.hitstop -= FIXED;
      return;
    }
    const dt = FIXED;
    this.animT += dt;
    this.fireCd = Math.max(0, this.fireCd - dt);
    this.player.invuln = Math.max(0, this.player.invuln - dt);
    this.trauma = Math.max(0, this.trauma - dt * 1.8);
    const actions = this.input.poll();
    this.aimFrom(actions);
    this.movePlayer(actions, dt);
    if (actions.fire && this.fireCd <= 0) this.shoot();
    this.updateBullets(dt);
    this.updateEnemies(dt);
    this.updatePickups(dt);
    this.updateBurns(dt);
    this.updateFx(dt);
    this.spawnFlow(dt);
    this.followCam(dt);
    if (this.player.hp <= 0) this.die();
  }

  private pollChrome() {
    const bookNow = this.input.has("KeyB") || this.input.has("KeyQ");
    if (bookNow && !this.bookLatch) {
      if (this.phase === "book") this.closeBook();
      else if (this.phase === "playing" || this.phase === "paused") this.openBook();
    }
    this.bookLatch = bookNow;

    const pauseNow = this.input.has("Escape") || this.input.has("KeyP");
    if (pauseNow && !this.pauseLatch) {
      if (this.phase === "book") this.closeBook();
      else if (this.phase === "playing" || this.phase === "paused") this.togglePause();
    }
    this.pauseLatch = pauseNow;

    if (this.input.has("Digit1") || this.input.has("Numpad1")) this.chooseSpell("ember");
    if (this.input.has("Digit2") || this.input.has("Numpad2")) this.chooseSpell("frost");
    if (this.input.has("Digit3") || this.input.has("Numpad3")) this.chooseSpell("bolt");
    if (this.input.has("Digit4") || this.input.has("Numpad4")) this.chooseSpell("void");
    if (this.input.has("Digit5") || this.input.has("Numpad5")) this.chooseSpell("vine");
  }

  private aimFrom(actions: Actions) {
    if (actions.aimX || actions.aimY) {
      this.aim.x = actions.aimX;
      this.aim.y = actions.aimY;
    } else if (this.input.pointer.hasPoint) {
      const wx = this.cam.x + this.input.pointer.x * VIEW_ZOOM;
      const wy = this.cam.y + this.input.pointer.y * VIEW_ZOOM;
      this.aim.x = wx - this.player.x;
      this.aim.y = wy - this.player.y;
    }
    const m = Math.hypot(this.aim.x, this.aim.y) || 1;
    this.aim.x /= m;
    this.aim.y /= m;
    this.player.face = this.player.moving && !this.input.pointer.down
      ? dirFromAim(this.player.vx, this.player.vy)
      : dirFromAim(this.aim.x, this.aim.y);
  }

  private movePlayer(actions: Actions, dt: number) {
    const want = Math.hypot(actions.moveX, actions.moveY);
    const rate = want > 0.12 ? PLAYER_ACCEL : PLAYER_STOP;
    const k = 1 - Math.exp(-rate * dt);
    const tx = actions.moveX * PLAYER_SPEED;
    const ty = actions.moveY * PLAYER_SPEED;
    this.player.vx += (tx - this.player.vx) * k;
    this.player.vy += (ty - this.player.vy) * k;
    if (Math.hypot(this.player.vx, this.player.vy) < 6 && want < 0.08) {
      this.player.vx = 0;
      this.player.vy = 0;
    }
    let nx = this.player.x + this.player.vx * dt;
    let ny = this.player.y + this.player.vy * dt;
    this.player.moving = Math.hypot(this.player.vx, this.player.vy) > 18;
    if (this.player.moving) this.player.frame += dt * (6 + Math.hypot(this.player.vx, this.player.vy) * 0.018);
    nx = clamp(nx, 48, ARENA - 48);
    ny = clamp(ny, 48, ARENA - 48);
    for (const p of this.props) {
      const r = resolveCircle(nx, ny, PLAYER_R, p.x, p.y, p.r);
      if (r.x !== nx || r.y !== ny) {
        if (Math.abs(r.x - nx) > 0.01) this.player.vx *= 0.35;
        if (Math.abs(r.y - ny) > 0.01) this.player.vy *= 0.35;
      }
      nx = r.x;
      ny = r.y;
    }
    this.player.x = nx;
    this.player.y = ny;
  }

  private shoot() {
    if (this.spell === "bolt" && !this.boltUnlocked) return;
    if (this.spell === "void" && !this.voidUnlocked) return;
    if (this.spell === "craft" && !this.crafted) return;
    const speedUp = this.upgrades[this.spell].speed;
    const baseCd =
      this.spell === "craft" && this.crafted
        ? this.crafted.cooldown
        : this.spell === "bolt"
          ? BOLT_CD
          : this.spell === "void"
            ? VOID_CD
            : FIRE_CD;
    this.fireCd = baseCd * (1 - speedUp * 0.025);
    if (this.spell === "void") {
      this.spawnVoid();
    } else if (this.spell === "craft" && this.crafted) {
      this.shootCraft(this.crafted);
    } else if (this.spell === "frost") {
      this.spawnShot(this.spell, -16);
      this.spawnShot(this.spell, 0);
      this.spawnShot(this.spell, 16);
      this.audio.ice();
    } else if (this.spell === "bolt") {
      this.spawnShot(this.spell, 0);
      this.audio.bolt();
    } else if (this.spell === "vine") {
      this.spawnShot(this.spell, 0);
      this.audio.ice();
    } else {
      this.spawnShot(this.spell, 0);
      this.audio.fire();
    }
    this.player.vx -= this.aim.x * 36;
    this.player.vy -= this.aim.y * 36;
    this.trauma = Math.min(1, this.trauma + 0.08);
  }

  private shootCraft(craft: CraftedSpell) {
    const form = craft.shape;
    if (form === "nova") {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        this.spawnCraftShot(craft, Math.cos(a), Math.sin(a), 0);
      }
      this.audio.wave();
      return;
    }
    if (form === "shard" || form === "triple") {
      const n = form === "shard" ? 5 : 3;
      const spread = form === "shard" ? 0.42 : 0.22;
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1) - 0.5;
        const ang = Math.atan2(this.aim.y, this.aim.x) + t * spread * 2;
        this.spawnCraftShot(craft, Math.cos(ang), Math.sin(ang), 0);
      }
      this.audio.ice();
      return;
    }
    if (form === "wave") {
      for (const side of [-28, -14, 0, 14, 28]) this.spawnCraftShot(craft, this.aim.x, this.aim.y, side);
      this.audio.ice();
      return;
    }
    this.spawnCraftShot(craft, this.aim.x, this.aim.y, 0);
    if (form === "beam") this.audio.bolt();
    else this.audio.fire();
  }

  private spawnCraftShot(craft: CraftedSpell, dirX: number, dirY: number, side: number) {
    const m = Math.hypot(dirX, dirY) || 1;
    dirX /= m;
    dirY /= m;
    const px = -dirY;
    const py = dirX;
    const form = craft.shape;
    const base =
      form === "beam" ? 1500 : form === "meteor" ? 280 : form === "orb" ? 320 : form === "wave" ? 480 : BULLET_SPEED;
    const speed = base * (1 + this.upgrades.craft.speed * 0.04);
    const b = this.allocBullet();
    b.alive = true;
    b.x = this.player.x + dirX * 22 + px * side;
    b.y = this.player.y + dirY * 18 + py * side;
    b.vx = dirX * speed;
    b.vy = dirY * speed;
    b.ttl = form === "beam" ? 0.28 : form === "meteor" ? 1.4 : form === "orb" ? 1.6 : form === "nova" ? 0.7 : 0.95;
    b.r = form === "orb" ? 18 : form === "meteor" ? 22 : form === "beam" ? 10 : form === "wave" ? 14 : form === "shard" ? 7 : 9;
    b.spell = "craft";
    b.trail = 0;
    b.ox = b.x;
    b.oy = b.y;
    b.dist = 0;
    b.dirX = dirX;
    b.dirY = dirY;
    b.speed = speed;
    b.form = form;
    b.color = craft.color;
    this.burstSparks(b.x, b.y, form === "meteor" || form === "orb" ? 8 : 3, craft.color);
  }

  private spawnVoid() {
    const b = this.allocBullet();
    b.alive = true;
    b.spell = "void";
    b.ttl = 2;
    b.r = 58;
    b.ang = Math.atan2(this.aim.y, this.aim.x);
    b.orbit = 110;
    b.speed = 16 + this.upgrades.void.speed * 0.45;
    b.x = this.player.x + Math.cos(b.ang) * b.orbit;
    b.y = this.player.y + Math.sin(b.ang) * b.orbit;
    b.vx = 0;
    b.vy = 0;
    b.trail = 0;
    b.ox = this.player.x;
    b.oy = this.player.y;
    b.dist = 0;
    b.dirX = Math.cos(b.ang);
    b.dirY = Math.sin(b.ang);
    b.form = "orb";
    b.color = "#6b3aa8";
    this.audio.bolt();
    this.burstSparks(b.x, b.y, 8, "#4a2068");
  }

  private spawnShot(spell: Spell, side: number) {
    const px = -this.aim.y;
    const py = this.aim.x;
    const base = spell === "bolt" ? BOLT_SPEED : BULLET_SPEED;
    const speed = base * (1 + this.upgrades[spell].speed * 0.04);
    const b = this.allocBullet();
    b.alive = true;
    b.x = this.player.x + this.aim.x * 22 + px * side;
    b.y = this.player.y + this.aim.y * 18 + py * side;
    b.vx = this.aim.x * speed;
    b.vy = this.aim.y * speed;
    b.ttl = spell === "ember" ? 1.05 : spell === "vine" ? 0.95 : 0.85;
    b.r = spell === "ember" ? 22 : spell === "vine" ? 11 : 6;
    b.spell = spell;
    b.trail = 0;
    b.ox = b.x;
    b.oy = b.y;
    b.dist = 0;
    b.dirX = this.aim.x;
    b.dirY = this.aim.y;
    b.speed = speed;
    this.burstSparks(b.x, b.y, 3, spell === "frost" ? "#c5eaf6" : spell === "bolt" ? "#f0d24a" : spell === "vine" ? "#6fbf6a" : "#e8c070");
    if (spell === "frost") this.spawnFlake(b.x, b.y, true);
    if (spell === "vine") this.burstSparks(b.x, b.y, 2, "#3d7a45");
    if (spell === "bolt") {
      this.spawnArc(b.x, b.y);
      this.burstSparks(b.x, b.y, 6, "#ffe27a");
    }
  }

  private allocBullet(): Bullet {
    const dead = this.bullets.find((b) => !b.alive);
    if (dead) return dead;
    if (this.bullets.length >= MAX_BULLETS) return this.bullets[0]!;
    const b: Bullet = {
      alive: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      ttl: 0,
      r: 6,
      spell: "ember",
      trail: 0,
      ox: 0,
      oy: 0,
      dist: 0,
      dirX: 1,
      dirY: 0,
      speed: BULLET_SPEED,
      form: "single",
      color: "#e8c070",
      ang: 0,
      orbit: 0,
    };
    this.bullets.push(b);
    return b;
  }

  private nearestEnemy(x: number, y: number) {
    let best: Enemy | null = null;
    let bestD = 999999;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const d = (e.x - x) * (e.x - x) + (e.y - y) * (e.y - y);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  private updateBullets(dt: number) {
    for (const b of this.bullets) {
      if (!b.alive) continue;
      if (b.spell === "void") {
        b.ang += b.speed * dt;
        b.x = this.player.x + Math.cos(b.ang) * b.orbit;
        b.y = this.player.y + Math.sin(b.ang) * b.orbit;
        b.dirX = Math.cos(b.ang);
        b.dirY = Math.sin(b.ang);
        b.trail += dt;
        if (b.trail >= 0.03) {
          b.trail = 0;
          this.burstSparks(b.x, b.y, 1, Math.random() > 0.5 ? "#3a1a58" : "#7a48b8");
        }
        b.ttl -= dt;
        if (b.ttl <= 0) b.alive = false;
        for (const e of this.enemies) {
          if (!e.alive || e.voidIcd > 0) continue;
          if (circleHit(b.x, b.y, b.r, e.x, e.y, e.r)) {
            this.hurtEnemy(e, spellDamage("void", this.upgrades.void.damage), b.dirX, b.dirY, "void");
            e.voidIcd = 0.22;
          }
        }
        continue;
      }
      if (b.spell === "ember" || (b.spell === "craft" && b.form === "weave")) {
        b.dist += b.speed * dt;
        const wave = Math.sin(b.dist * 0.038) * 30;
        b.x = b.ox + b.dirX * b.dist + -b.dirY * wave;
        b.y = b.oy + b.dirY * b.dist + b.dirX * wave;
        b.trail += dt;
        if (b.trail >= 0.028) {
          b.trail = 0;
          this.burstSparks(b.x, b.y, 1, b.spell === "craft" ? b.color : "#e8c070");
        }
      } else {
        if (b.spell === "craft" && b.form === "homing") {
          const t = this.nearestEnemy(b.x, b.y);
          if (t) {
            const dx = t.x - b.x;
            const dy = t.y - b.y;
            const dm = Math.hypot(dx, dy) || 1;
            b.dirX += (dx / dm) * 4 * dt;
            b.dirY += (dy / dm) * 4 * dt;
            const nm = Math.hypot(b.dirX, b.dirY) || 1;
            b.dirX /= nm;
            b.dirY /= nm;
            b.vx = b.dirX * b.speed;
            b.vy = b.dirY * b.speed;
          }
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.spell === "craft") {
          b.trail += dt;
          if (b.trail >= 0.02) {
            b.trail = 0;
            this.burstSparks(b.x, b.y, 1, b.color);
          }
        } else if (b.spell === "bolt") {
          b.trail += dt;
          if (b.trail >= 0.012) {
            b.trail = 0;
            this.spawnArc(b.x, b.y);
            this.burstSparks(b.x, b.y, 1, "#f0d24a");
          }
        }
      }
      b.ttl -= dt;
      if (b.spell === "frost") {
        b.trail += dt;
        if (b.trail >= 0.018) {
          b.trail = 0;
          this.spawnFlake(b.x, b.y, false);
        }
      }
      if (b.ttl <= 0 || b.x < 0 || b.y < 0 || b.x > ARENA || b.y > ARENA) {
        b.alive = false;
        continue;
      }
      let blocked = false;
      for (const p of this.props) {
        if (circleHit(b.x, b.y, b.r, p.x, p.y, p.r * 0.85)) {
          blocked = true;
          break;
        }
      }
      if (blocked) {
        b.alive = false;
        this.spawnBurst(b.x, b.y, b.spell);
        continue;
      }
      for (const e of this.enemies) {
        if (!e.alive) continue;
        if (circleHit(b.x, b.y, b.r, e.x, e.y, e.r)) {
          b.alive = false;
          this.hurtEnemy(e, spellDamage(b.spell, this.upgrades[b.spell].damage, this.crafted), b.vx, b.vy, b.spell);
          break;
        }
      }
    }
  }

  private hurtEnemy(e: Enemy, dmg: number, vx: number, vy: number, spell: Spell) {
    e.hp -= dmg;
    e.flash = 0.08;
    if (spell === "ember") e.burn = 3;
    if (spell === "craft" && this.crafted?.extra === "burn") e.burn = 3;
    if (spell === "frost" || (spell === "craft" && this.crafted?.extra === "slow")) {
      const resist = e.kind === "elite" ? 1.1 : e.kind === "brute" ? 1.8 : 3;
      e.freeze = resist;
      this.floatAt(e.x, e.y - 22, "slow");
    }
    if (spell === "bolt" || (spell === "craft" && this.crafted?.extra === "stun")) {
      e.stun = 1.25;
      this.floatAt(e.x, e.y - 22, "stun", spell === "craft" ? (this.crafted?.color ?? "#f0d24a") : "#f0d24a");
    }
    if (spell === "vine") this.wrapEnemy(e);
    const m = Math.hypot(vx, vy) || 1;
    const knock = spell === "void" ? 180 : 10;
    e.x = clamp(e.x + (vx / m) * knock, 40, ARENA - 40);
    e.y = clamp(e.y + (vy / m) * knock, 40, ARENA - 40);
    if (spell === "void") e.stun = Math.max(e.stun, 0.35);
    this.hitstop = 0.035;
    this.trauma = Math.min(1, this.trauma + 0.18);
    this.audio.hit();
    this.spawnBurst(e.x, e.y, spell);
    if (e.hp <= 0) this.killEnemy(e);
  }

  private wrapEnemy(e: Enemy) {
    if (e.vineIcd > 0) return;
    e.stun = 5;
    e.wrapped = 5;
    e.vineIcd = 8;
    this.floatAt(e.x, e.y - 22, "wrap", "#6fbf6a");
    this.burstSparks(e.x, e.y, 8, "#6fbf6a");
    this.audio.ice();
  }

  private killEnemy(e: Enemy) {
    e.alive = false;
    const pts = e.kind === "elite" ? 80 : e.kind === "brute" ? 40 : e.kind === "runner" ? 18 : 12;
    this.score += pts;
    if (this.score > this.best) {
      this.best = this.score;
      this.persist();
    }
    const gold = goldFor(e.kind);
    this.gold += gold;
    this.floatAt(e.x, e.y - 18, `+${gold}`, "#f0d24a");
    this.spawnCoins(e.x, e.y, coinCountFor(e.kind));
    this.burstSparks(e.x, e.y, 14, e.kind === "brute" ? "#8aa0b8" : "#6a7a9a");
    if (Math.random() < 0.28) this.spawnPickup(e.x, e.y);
    this.emit();
  }

  private updateBurns(dt: number) {
    this.burnAcc += dt;
    if (this.burnAcc < 1) return;
    this.burnAcc -= 1;
    for (const e of this.enemies) {
      if (!e.alive || e.burn <= 0) continue;
      e.burn -= 1;
      e.hp -= 1;
      e.flash = 0.06;
      this.floatAt(e.x, e.y - 16, "1", "#e8a050");
      if (e.hp <= 0) this.killEnemy(e);
    }
  }

  private spawnFlow(dt: number) {
    if (this.toSpawn <= 0) {
      const live = this.enemies.some((e) => e.alive);
      if (!live) {
        this.waveGap += dt;
        if (this.waveGap > 1.6) {
          this.score += this.wave * 40;
          this.beginWave();
        }
      }
      return;
    }
    this.spawnT -= dt;
    if (this.spawnT <= 0) {
      this.spawnEnemy();
      this.toSpawn -= 1;
      this.spawnT = Math.max(0.22, 0.72 - this.wave * 0.045);
    }
  }

  private spawnEnemy() {
    const e = this.allocEnemy();
    const edge = Math.floor(Math.random() * 4);
    const t = Math.random();
    e.alive = true;
    if (edge === 0) {
      e.x = t * ARENA;
      e.y = 40;
    } else if (edge === 1) {
      e.x = ARENA - 40;
      e.y = t * ARENA;
    } else if (edge === 2) {
      e.x = t * ARENA;
      e.y = ARENA - 40;
    } else {
      e.x = 40;
      e.y = t * ARENA;
    }
    e.kind = this.pickEnemyKind();
    e.flash = 0;
    e.frame = Math.random() * 4;
    e.contact = 0;
    e.freeze = 0;
    e.stun = 0;
    e.burn = 0;
    e.dash = 0.4 + Math.random() * 0.8;
    e.lunging = 0;
    e.voidIcd = 0;
    if (e.kind === "elite") {
      e.r = 26;
      e.speed = 90 + this.wave * 3;
      e.maxHp = 72 + this.wave * 14;
    } else if (e.kind === "brute") {
      e.r = 24;
      e.speed = 54 + this.wave * 2;
      e.maxHp = 46 + this.wave * 9;
    } else if (e.kind === "runner") {
      e.r = 14;
      e.speed = 136 + this.wave * 7;
      e.maxHp = 10 + this.wave * 2;
    } else {
      e.r = 18;
      e.speed = 82 + this.wave * 5;
      e.maxHp = 18 + this.wave * 5;
    }
    e.hp = e.maxHp;
    if (e.kind === "elite") this.floatAt(e.x, e.y - 28, "Nightbound");
  }

  private pickEnemyKind(): EnemyKind {
    const w = this.wave;
    const roll = Math.random();
    if (w >= 4 && roll < 0.12 + Math.min(0.12, (w - 4) * 0.02)) return "elite";
    if (w >= 2 && roll < 0.28 + Math.min(0.12, w * 0.015)) return "brute";
    if (w >= 2 && roll < 0.52) return "runner";
    return "wisp";
  }

  private allocEnemy(): Enemy {
    const dead = this.enemies.find((e) => !e.alive);
    if (dead) return dead;
    if (this.enemies.length >= MAX_ENEMIES) return this.enemies[0]!;
    const e: Enemy = {
      alive: false,
      x: 0,
      y: 0,
      hp: 1,
      maxHp: 1,
      r: 18,
      speed: 80,
      kind: "wisp",
      flash: 0,
      frame: 0,
      contact: 0,
      freeze: 0,
      stun: 0,
      burn: 0,
      dash: 0,
      lunging: 0,
      voidIcd: 0,
      vineIcd: 0,
      wrapped: 0,
    };
    this.enemies.push(e);
    return e;
  }

  private updateEnemies(dt: number) {
    const px = this.player.x;
    const py = this.player.y;
    for (let i = 0; i < this.enemies.length; i++) {
      const e = this.enemies[i]!;
      if (!e.alive) continue;
      e.frame += dt * (e.freeze > 0 ? 2.2 : 6);
      e.flash = Math.max(0, e.flash - dt);
      e.contact = Math.max(0, e.contact - dt);
      e.freeze = Math.max(0, e.freeze - dt);
      e.stun = Math.max(0, e.stun - dt);
      e.voidIcd = Math.max(0, e.voidIcd - dt);
      e.vineIcd = Math.max(0, e.vineIcd - dt);
      e.wrapped = Math.max(0, e.wrapped - dt);
      if (this.spell === "vine" && e.vineIcd <= 0) {
        const reach = 118 + e.r;
        if (Math.hypot(e.x - px, e.y - py) < reach) this.wrapEnemy(e);
      }
      if (e.stun <= 0) {
        for (const a of this.arcs) {
          if (!a.alive) continue;
          if (circleHit(e.x, e.y, e.r, a.x, a.y, a.r)) {
            e.stun = 1.25;
            this.floatAt(e.x, e.y - 22, "stun", "#f0d24a");
            break;
          }
        }
      }
      let sx = 0;
      let sy = 0;
      for (let j = 0; j < this.enemies.length; j++) {
        if (i === j) continue;
        const o = this.enemies[j]!;
        if (!o.alive) continue;
        const dx = e.x - o.x;
        const dy = e.y - o.y;
        const d2 = dx * dx + dy * dy;
        if (d2 > 0 && d2 < 70 * 70) {
          const d = Math.sqrt(d2);
          sx += dx / d;
          sy += dy / d;
        }
      }
      const tx = px - e.x;
      const ty = py - e.y;
      e.dash = Math.max(0, e.dash - dt);
      e.lunging = Math.max(0, e.lunging - dt);
      const td = Math.hypot(tx, ty) || 1;
      if (e.freeze <= 0 && e.stun <= 0 && e.dash <= 0 && (e.kind === "runner" || e.kind === "elite") && td < (e.kind === "elite" ? 250 : 190)) {
        e.lunging = e.kind === "elite" ? 0.38 : 0.28;
        e.dash = e.kind === "elite" ? 2.2 : 1.45;
      }
      let vx = (tx / td) * 0.85 + sx * 0.35;
      let vy = (ty / td) * 0.85 + sy * 0.35;
      const vm = Math.hypot(vx, vy) || 1;
      const lunge = e.lunging > 0 ? (e.kind === "elite" ? 2.6 : 2.2) : 1;
      const frozen = e.freeze > 0 ? (e.kind === "elite" ? 0.55 : 0.28) : 1;
      const stunned = e.stun > 0 ? 0 : 1;
      vx = (vx / vm) * e.speed * lunge * frozen * stunned;
      vy = (vy / vm) * e.speed * lunge * frozen * stunned;
      e.x = clamp(e.x + vx * dt, 40, ARENA - 40);
      e.y = clamp(e.y + vy * dt, 40, ARENA - 40);
      for (const p of this.props) {
        const r = resolveCircle(e.x, e.y, e.r, p.x, p.y, p.r);
        e.x = r.x;
        e.y = r.y;
      }
      if (e.stun <= 0 && this.player.invuln <= 0 && circleHit(e.x, e.y, e.r, px, py, PLAYER_R)) {
        const hit = e.kind === "elite" ? 22 : e.kind === "brute" ? 18 : e.kind === "runner" ? 10 : 8;
        this.player.hp -= hit;
        this.player.invuln = 0.85;
        const kd = Math.hypot(px - e.x, py - e.y) || 1;
        this.player.vx += ((px - e.x) / kd) * 220;
        this.player.vy += ((py - e.y) / kd) * 220;
        this.trauma = Math.min(1, this.trauma + 0.45);
        this.audio.hurt();
        this.emit();
      }
    }
  }

  private spawnPickup(x: number, y: number) {
    const dead = this.pickups.find((p) => !p.alive);
    const p =
      dead ??
      (this.pickups.length < MAX_PICKUPS
        ? (() => {
            const n: Pickup = { alive: false, x: 0, y: 0, ttl: 0, frame: 0 };
            this.pickups.push(n);
            return n;
          })()
        : null);
    if (!p) return;
    p.alive = true;
    p.x = x;
    p.y = y;
    p.ttl = 8;
    p.frame = 0;
  }

  private updatePickups(dt: number) {
    for (const p of this.pickups) {
      if (!p.alive) continue;
      p.ttl -= dt;
      p.frame += dt * 6;
      if (p.ttl <= 0) {
        p.alive = false;
        continue;
      }
      if (circleHit(p.x, p.y, 16, this.player.x, this.player.y, PLAYER_R + 8)) {
        p.alive = false;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + 18);
        this.audio.pickup();
        this.floatAt(p.x, p.y - 16, "+hp");
        this.emit();
      }
    }
  }

  private die() {
    this.phase = "dead";
    this.audio.death();
    if (this.score > this.best) {
      this.best = this.score;
      this.persist();
    }
    this.emit();
  }

  private spawnBurst(x: number, y: number, spell: Spell = "ember") {
    const dead = this.bursts.find((b) => !b.alive);
    if (dead) {
      dead.alive = true;
      dead.x = x;
      dead.y = y;
      dead.t = 0;
      dead.spell = spell;
      return;
    }
    this.bursts.push({ alive: true, x, y, t: 0, spell });
  }

  private burstSparks(x: number, y: number, n: number, color: string) {
    for (let i = 0; i < n; i++) {
      const s = this.allocSpark();
      if (!s) return;
      const a = Math.random() * Math.PI * 2;
      const sp = 40 + Math.random() * 90;
      s.alive = true;
      s.x = x;
      s.y = y;
      s.vx = Math.cos(a) * sp;
      s.vy = Math.sin(a) * sp;
      s.ttl = 0.28 + Math.random() * 0.2;
      s.max = s.ttl;
      s.size = 2 + Math.random() * 3;
      s.color = color;
      s.kind = "dot";
    }
  }

  private spawnFlake(x: number, y: number, burst: boolean) {
    const s = this.allocSpark();
    if (!s) return;
    const a = Math.random() * Math.PI * 2;
    const sp = burst ? 50 + Math.random() * 40 : 8 + Math.random() * 16;
    s.alive = true;
    s.x = x;
    s.y = y;
    s.vx = Math.cos(a) * sp;
    s.vy = Math.sin(a) * sp - 10;
    s.ttl = burst ? 0.35 : 0.22;
    s.max = s.ttl;
    s.size = burst ? 5 + Math.random() * 3 : 3.5 + Math.random() * 3;
    s.color = Math.random() > 0.5 ? "#eaf8fd" : "#b9e6f4";
    s.kind = "flake";
  }

  private allocSpark(): Spark | null {
    const dead = this.sparks.find((s) => !s.alive);
    if (dead) return dead;
    if (this.sparks.length >= MAX_SPARKS) return null;
    const s: Spark = {
      alive: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      ttl: 0,
      max: 0,
      size: 3,
      color: "#fff",
      kind: "dot",
    };
    this.sparks.push(s);
    return s;
  }

  private floatAt(x: number, y: number, text: string, color = "#ecece8") {
    const dead = this.floaters.find((f) => !f.alive);
    if (dead) {
      dead.alive = true;
      dead.x = x;
      dead.y = y;
      dead.ttl = 0.85;
      dead.text = text;
      dead.color = color;
      return;
    }
    this.floaters.push({ alive: true, x, y, ttl: 0.85, text, color });
  }

  private spawnArc(x: number, y: number) {
    const dead = this.arcs.find((a) => !a.alive);
    if (dead) {
      dead.alive = true;
      dead.x = x;
      dead.y = y;
      dead.r = 16;
      dead.ttl = 1.45;
      dead.max = 1.45;
      return;
    }
    if (this.arcs.length >= MAX_ARCS) {
      const oldest = this.arcs[0]!;
      oldest.alive = true;
      oldest.x = x;
      oldest.y = y;
      oldest.r = 16;
      oldest.ttl = 1.45;
      oldest.max = 1.45;
      return;
    }
    this.arcs.push({ alive: true, x, y, r: 16, ttl: 1.45, max: 1.45 });
  }

  private spawnCoins(x: number, y: number, n: number) {
    for (let i = 0; i < n; i++) {
      const s = this.allocSpark();
      if (!s) return;
      const a = -Math.PI / 2 + (Math.random() - 0.5) * 1.8;
      const sp = 70 + Math.random() * 110;
      s.alive = true;
      s.x = x;
      s.y = y;
      s.vx = Math.cos(a) * sp;
      s.vy = Math.sin(a) * sp;
      s.ttl = 0.55 + Math.random() * 0.25;
      s.max = s.ttl;
      s.size = 4 + Math.random() * 2.5;
      s.color = Math.random() > 0.35 ? "#f0d24a" : "#ffe27a";
      s.kind = "coin";
    }
  }

  private updateFx(dt: number) {
    for (const s of this.sparks) {
      if (!s.alive) continue;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 40 * dt;
      s.ttl -= dt;
      if (s.ttl <= 0) s.alive = false;
    }
    for (const f of this.floaters) {
      if (!f.alive) continue;
      f.y -= 28 * dt;
      f.ttl -= dt;
      if (f.ttl <= 0) f.alive = false;
    }
    for (const b of this.bursts) {
      if (!b.alive) continue;
      b.t += dt;
      if (b.t > 0.28) b.alive = false;
    }
    for (const a of this.arcs) {
      if (!a.alive) continue;
      a.ttl -= dt;
      if (a.ttl <= 0) a.alive = false;
    }
  }

  private followCam(dt: number) {
    const look = 58;
    const vw = this.view.w * VIEW_ZOOM;
    const vh = this.view.h * VIEW_ZOOM;
    const tx = this.player.x + this.aim.x * look + this.player.vx * 0.14 - vw / 2;
    const ty = this.player.y + this.aim.y * look + this.player.vy * 0.14 - vh / 2 - 70;
    const k = 1 - Math.exp(-5.2 * dt);
    this.cam.x += (tx - this.cam.x) * k;
    this.cam.y += (ty - this.cam.y) * k;
    this.cam.x = clamp(this.cam.x, 0, Math.max(0, ARENA - vw));
    this.cam.y = clamp(this.cam.y, 0, Math.max(0, ARENA - vh));
  }

  private draw() {
    const ctx = this.ctx;
    const shake = this.reduced ? 0 : this.trauma * 6;
    const ox = (Math.random() - 0.5) * shake;
    const oy = (Math.random() - 0.5) * shake;
    ctx.fillStyle = "#0c0d0c";
    ctx.fillRect(0, 0, this.view.w, this.view.h);
    if ((this.phase === "title" || this.phase === "boot") && this.assets) {
      this.drawTitleCover();
      return;
    }
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(1 / VIEW_ZOOM, 1 / VIEW_ZOOM);
    ctx.translate(-this.cam.x, -this.cam.y);

    if (this.assets) {
      this.drawGround();
      const drawables: Array<{ y: number; draw: () => void }> = [];
      for (const p of this.props) drawables.push({ y: p.y, draw: () => this.drawProp(p) });
      for (const pk of this.pickups) {
        if (pk.alive) drawables.push({ y: pk.y, draw: () => this.drawPickup(pk) });
      }
      for (const e of this.enemies) {
        if (e.alive) drawables.push({ y: e.y, draw: () => this.drawEnemy(e) });
      }
      if (this.phase === "playing" || this.phase === "paused" || this.phase === "book" || this.phase === "wheel") {
        drawables.push({ y: this.player.y, draw: () => this.drawPlayer() });
      }
      drawables.sort((a, b) => a.y - b.y);
      for (const d of drawables) d.draw();
      this.drawBullets();
      this.drawFx();
      if (this.phase === "playing" || this.phase === "paused" || this.phase === "book" || this.phase === "wheel") this.drawLight();
    }
    ctx.restore();
  }

  private drawTitleCover() {
    const img = this.assets!.title;
    const vw = this.view.w;
    const vh = this.view.h;
    const scale = Math.max(vw / img.width, vh / img.height);
    const dw = img.width * scale;
    const dh = img.height * scale;
    this.ctx.drawImage(img, (vw - dw) / 2, (vh - dh) / 2, dw, dh);
  }

  private drawGround() {
    const img = this.assets!.ground;
    const tile = 704;
    const ctx = this.ctx;
    for (let y = 0; y < ARENA; y += tile) {
      for (let x = 0; x < ARENA; x += tile) {
        ctx.drawImage(img, x, y, tile, tile);
      }
    }
  }

  private drawProp(p: Prop) {
    const img = this.assets!.props[p.kind];
    if (!img) return;
    this.ctx.drawImage(img, p.x - p.drawW / 2, p.y - p.drawH * 0.82, p.drawW, p.drawH);
  }

  private drawPlayer() {
    const frames = this.assets!.player[this.player.face];
    const i = this.player.moving ? Math.floor(this.player.frame) % 4 : 0;
    const img = frames[i]!;
    const s = 64;
    const blink = this.player.invuln > 0 && Math.floor(this.animT * 16) % 2 === 0;
    if (blink) this.ctx.globalAlpha = 0.45;
    this.ctx.drawImage(img, this.player.x - s / 2, this.player.y - s * 0.78, s, s);
    this.ctx.globalAlpha = 1;
    if (this.spell === "vine") this.drawVineAura(this.player.x, this.player.y);
  }

  private drawEnemy(e: Enemy) {
    const img = this.assets!.wisp[Math.floor(e.frame) % 4]!;
    const s = e.kind === "elite" ? 92 : e.kind === "brute" ? 78 : e.kind === "runner" ? 44 : 56;
    if (e.flash > 0) this.ctx.filter = "brightness(2.4)";
    else if (e.wrapped > 0) this.ctx.filter = "hue-rotate(70deg) saturate(1.4) brightness(0.95)";
    else if (e.stun > 0) this.ctx.filter = "sepia(1) saturate(3) hue-rotate(5deg) brightness(1.25)";
    else if (e.freeze > 0) this.ctx.filter = "hue-rotate(160deg) saturate(0.85) brightness(1.15)";
    else if (e.burn > 0) this.ctx.filter = "sepia(0.6) saturate(2.2) hue-rotate(-10deg)";
    this.ctx.drawImage(img, e.x - s / 2, e.y - s * 0.72, s, s);
    this.ctx.filter = "none";
    if (e.wrapped > 0) this.drawVineWrap(e.x, e.y, s * 0.42);
    const barW = s * 0.7;
    this.ctx.fillStyle = "rgba(12,13,12,0.55)";
    this.ctx.fillRect(e.x - barW / 2, e.y - s * 0.78, barW, 3);
    this.ctx.fillStyle = "#ecece8";
    this.ctx.fillRect(e.x - barW / 2, e.y - s * 0.78, barW * clamp(e.hp / e.maxHp, 0, 1), 3);
  }

  private drawPickup(p: Pickup) {
    const img = this.assets!.pickup[Math.floor(p.frame) % 4]!;
    const bob = Math.sin(this.animT * 4 + p.x) * 3;
    this.ctx.drawImage(img, p.x - 16, p.y - 20 + bob, 32, 32);
  }

  private drawBullets() {
    const ctx = this.ctx;
    for (const b of this.bullets) {
      if (!b.alive) continue;
      const ang = Math.atan2(b.vy, b.vx);
      if (b.spell === "frost") {
        this.drawIceBolt(b.x, b.y, ang);
        continue;
      }
      if (b.spell === "bolt") {
        this.drawLightning(b.x, b.y, b.dirX, b.dirY);
        continue;
      }
      if (b.spell === "craft") {
        this.drawCraftBolt(b);
        continue;
      }
      if (b.spell === "void") {
        this.drawVoidOrb(b);
        continue;
      }
      if (b.spell === "vine") {
        this.drawVineBolt(b.x, b.y, ang);
        continue;
      }
      if (b.spell === "ember") {
        this.drawEmberOrb(b);
        continue;
      }
      const img = this.assets!.projectile[Math.floor(this.animT * 12) % 4]!;
      const pw = b.spell === "ember" ? 92 : 32;
      const ph = b.spell === "ember" ? 58 : 20;
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(ang);
      ctx.drawImage(img, -pw / 2, -ph / 2, pw, ph);
      ctx.restore();
    }
  }

  private drawVoidOrb(b: Bullet) {
    const ctx = this.ctx;
    const spin = b.ang * 2.4;
    const r = 62 + Math.sin(this.animT * 14) * 4;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(spin);
    const g = ctx.createRadialGradient(0, 0, 3, 0, 0, r);
    g.addColorStop(0, "#d8c4f0");
    g.addColorStop(0.18, "#7a48b8");
    g.addColorStop(0.45, "#2a1038");
    g.addColorStop(0.78, "#0a060e");
    g.addColorStop(1, "rgba(10,6,14,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(160, 90, 220, 0.7)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.85, r * 0.28, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.28, r * 0.85, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawEmberOrb(b: Bullet) {
    const ctx = this.ctx;
    const pulse = 26 + Math.sin(this.animT * 14 + b.dist * 0.05) * 3;
    ctx.save();
    ctx.translate(b.x, b.y);
    const g = ctx.createRadialGradient(0, 0, 3, 0, 0, pulse);
    g.addColorStop(0, "#fff4d2");
    g.addColorStop(0.22, "#ffe27a");
    g.addColorStop(0.55, "#e08a3c");
    g.addColorStop(0.82, "#c45a48");
    g.addColorStop(1, "rgba(196,90,72,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, pulse, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawCraftBolt(b: Bullet) {
    const ctx = this.ctx;
    const ang = Math.atan2(b.dirY, b.dirX);
    const c = b.color;
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(ang);
    if (b.form === "orb") {
      const g = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.35, c);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();
    } else if (b.form === "meteor") {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(-4, -4, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(-28, -8);
      ctx.lineTo(-22, 0);
      ctx.lineTo(-28, 8);
      ctx.closePath();
      ctx.fill();
    } else if (b.form === "beam") {
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.95;
      ctx.fillRect(-36, -5, 72, 10);
      ctx.globalAlpha = 0.35;
      ctx.fillRect(-40, -10, 80, 20);
      ctx.globalAlpha = 1;
    } else if (b.form === "wave") {
      ctx.strokeStyle = c;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.arc(-4, 0, 18, -1.1, 1.1);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(2, 0, 12, -1, 1);
      ctx.stroke();
    } else if (b.form === "shard" || b.form === "nova") {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(16, 0);
      ctx.lineTo(0, -8);
      ctx.lineTo(-10, 0);
      ctx.lineTo(0, 8);
      ctx.closePath();
      ctx.fill();
    } else {
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, 16);
      g.addColorStop(0, "#ffffff");
      g.addColorStop(0.4, c);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(18, 0);
      ctx.lineTo(-10, -7);
      ctx.lineTo(-4, 0);
      ctx.lineTo(-10, 7);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  private drawLightning(x: number, y: number, dx: number, dy: number) {
    const ctx = this.ctx;
    const ang = Math.atan2(dy, dx);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.strokeStyle = "rgba(255, 226, 122, 0.98)";
    ctx.lineWidth = 2.6;
    ctx.lineJoin = "miter";
    ctx.beginPath();
    ctx.moveTo(-22, 0);
    ctx.lineTo(-10, -5);
    ctx.lineTo(-4, 3);
    ctx.lineTo(8, -4);
    ctx.lineTo(14, 2);
    ctx.lineTo(24, 0);
    ctx.stroke();
    ctx.strokeStyle = "rgba(240, 210, 74, 0.85)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  private drawBoltBurst(x: number, y: number, radius: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = "rgba(240, 210, 74, 0.95)";
    ctx.lineWidth = 1.6;
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4 + this.animT * 8;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 2, Math.sin(a) * 2);
      ctx.lineTo(Math.cos(a) * radius, Math.sin(a) * radius * (i % 2 === 0 ? 1 : 0.55));
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawVineBolt(x: number, y: number, ang: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.strokeStyle = "#3d7a45";
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    for (let i = -10; i <= 12; i++) {
      const t = i / 12;
      const px = i * 1.6;
      const py = Math.sin(i * 0.7 + this.animT * 10) * 4.5;
      if (i === -10) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
      void t;
    }
    ctx.stroke();
    ctx.strokeStyle = "#8ed48a";
    ctx.lineWidth = 1.4;
    ctx.stroke();
    ctx.fillStyle = "#6fbf6a";
    ctx.beginPath();
    ctx.arc(12, 0, 4.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawVineWrap(x: number, y: number, r: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(this.animT * 1.4);
    ctx.strokeStyle = "#4a8f52";
    ctx.lineWidth = 2.4;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.ellipse(0, 0, r + i * 3, r * 0.62 + i, (i * Math.PI) / 3, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawVineAura(x: number, y: number) {
    const ctx = this.ctx;
    const pulse = 118 + Math.sin(this.animT * 3) * 6;
    ctx.save();
    ctx.strokeStyle = "rgba(111,191,106,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + 8, pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawIceBolt(x: number, y: number, ang: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    const glow = ctx.createRadialGradient(0, 0, 1, 0, 0, 16);
    glow.addColorStop(0, "rgba(234, 248, 253, 0.95)");
    glow.addColorStop(0.45, "rgba(168, 222, 240, 0.55)");
    glow.addColorStop(1, "rgba(126, 200, 232, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#eaf8fd";
    ctx.beginPath();
    ctx.moveTo(12, 0);
    ctx.lineTo(-8, -5);
    ctx.lineTo(-5, 0);
    ctx.lineTo(-8, 5);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(186, 230, 244, 0.95)";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.restore();
  }

  private drawFx() {
    const ctx = this.ctx;
    for (const a of this.arcs) {
      if (!a.alive) continue;
      const k = clamp(a.ttl / a.max, 0, 1);
      ctx.globalAlpha = 0.25 + k * 0.55;
      ctx.fillStyle = "rgba(240, 210, 74, 0.35)";
      ctx.beginPath();
      ctx.arc(a.x, a.y, a.r * (0.7 + k * 0.3), 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#f0d24a";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    for (const s of this.sparks) {
      if (!s.alive) continue;
      ctx.globalAlpha = clamp(s.ttl / s.max, 0, 1);
      if (s.kind === "flake") this.drawSnowflake(s.x, s.y, s.size, s.ttl * 8, s.color);
      else if (s.kind === "coin") this.drawCoin(s.x, s.y, s.size, s.color);
      else {
        ctx.fillStyle = s.color;
        ctx.fillRect(s.x, s.y, s.size, s.size);
      }
      ctx.globalAlpha = 1;
    }
    for (const b of this.bursts) {
      if (!b.alive) continue;
      ctx.globalAlpha = 1 - b.t / 0.28;
      if (b.spell === "frost") this.drawIceBurst(b.x, b.y, 20 + b.t * 70);
      else if (b.spell === "bolt") this.drawBoltBurst(b.x, b.y, 18 + b.t * 90);
      else {
        const img = this.assets!.impact[Math.min(3, Math.floor(b.t * 14))]!;
        const s = 36 + b.t * 40;
        ctx.drawImage(img, b.x - s / 2, b.y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    }
    ctx.font = "700 15px Figtree, sans-serif";
    ctx.textAlign = "center";
    for (const f of this.floaters) {
      if (!f.alive) continue;
      ctx.globalAlpha = clamp(f.ttl / 0.85, 0, 1);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y - (0.85 - f.ttl) * 22);
      ctx.globalAlpha = 1;
    }
    ctx.textAlign = "left";
  }

  private drawCoin(x: number, y: number, size: number, color: string) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#c9a227";
    ctx.lineWidth = 1.2;
    ctx.stroke();
    ctx.beginPath();
    ctx.fillStyle = "rgba(255, 245, 180, 0.7)";
    ctx.arc(x - size * 0.25, y - size * 0.25, size * 0.28, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawSnowflake(x: number, y: number, size: number, rot: number, color: string) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, size * 0.18);
    ctx.lineCap = "round";
    const arm = size;
    for (let i = 0; i < 6; i++) {
      ctx.rotate(Math.PI / 3);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(arm, 0);
      ctx.moveTo(arm * 0.55, 0);
      ctx.lineTo(arm * 0.55 + arm * 0.22, arm * 0.18);
      ctx.moveTo(arm * 0.55, 0);
      ctx.lineTo(arm * 0.55 + arm * 0.22, -arm * 0.18);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawIceBurst(x: number, y: number, radius: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    const g = ctx.createRadialGradient(0, 0, 2, 0, 0, radius);
    g.addColorStop(0, "rgba(234, 248, 253, 0.9)");
    g.addColorStop(0.4, "rgba(168, 222, 240, 0.35)");
    g.addColorStop(1, "rgba(126, 200, 232, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "rgba(214, 242, 250, 0.85)";
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * 3, Math.sin(a) * 3);
      ctx.lineTo(Math.cos(a) * radius * 0.7, Math.sin(a) * radius * 0.7);
      ctx.stroke();
    }
    ctx.restore();
  }

  private drawLight() {
    const ctx = this.ctx;
    const px = this.player.x;
    const py = this.player.y;
    const g = ctx.createRadialGradient(px, py - 8, 30, px, py - 8, 380);
    g.addColorStop(0, "rgba(0,0,0,0)");
    g.addColorStop(0.42, "rgba(8,10,9,0.18)");
    g.addColorStop(1, "rgba(8,10,9,0.72)");
    ctx.fillStyle = g;
    ctx.fillRect(this.cam.x - 40, this.cam.y - 40, this.view.w * VIEW_ZOOM + 80, this.view.h * VIEW_ZOOM + 80);
    const glow = ctx.createRadialGradient(px, py - 6, 4, px, py - 6, 120);
    glow.addColorStop(0, "rgba(232, 196, 120, 0.2)");
    glow.addColorStop(1, "rgba(232, 196, 120, 0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(px, py - 6, 120, 0, Math.PI * 2);
    ctx.fill();
  }

  private installControlsTest() {
    window.__controlsTest = {
      getYaw: () => Math.atan2(this.aim.y, this.aim.x),
      getSpeed: () => {
        const a = this.input.poll();
        return Math.hypot(this.player.vx, this.player.vy);
      },
      getPos: () => ({ x: this.player.x, y: this.player.y }),
      setKeys: (codes: string[]) => this.input.setKeys(codes),
      clearKeys: () => this.input.clearInjected(),
      getPhase: () => this.phase,
    };
  }
}

declare global {
  interface Window {
    __controlsTest?: {
      getYaw: () => number;
      getSpeed: () => number;
      getPos: () => { x: number; y: number };
      setKeys: (codes: string[]) => void;
      clearKeys: () => void;
      getPhase: () => Phase;
    };
  }
}
