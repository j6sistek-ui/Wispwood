import { Input, type Actions } from "./input";
import { GameAudio } from "./audio";
import { loadAssets, type GameAssets } from "./assets";
import { loadSave, writeSave } from "./save";
import { BOSSES, BOSS_ATTACK, drawBossPixels, type BossDef } from "./bosses";
import { drawCraftSigil } from "./craft-sprites";

export type Phase = "boot" | "title" | "playing" | "paused" | "book" | "wheel" | "dead";
export type Spell = "ember" | "frost" | "bolt" | "void" | "vine" | "boom" | "craft";
export type SpellStat = "speed" | "damage";
export type SpellUpgrades = { speed: number; damage: number };
export type CraftShape = "single" | "triple" | "weave" | "orb" | "beam" | "nova" | "wave" | "meteor" | "shard" | "homing";
export type CraftExtra = "none" | "burn" | "slow" | "stun";
export type CraftAbility =
  | "pierce"
  | "split"
  | "bounce"
  | "chain"
  | "explode"
  | "orbit"
  | "rain"
  | "pull"
  | "leech"
  | "trail"
  | "grow"
  | "freeze"
  | "shock"
  | "ricochet"
  | "spore"
  | "hook"
  | "bloom"
  | "curse"
  | "tide"
  | "trap"
  | "seek"
  | "pulse"
  | "dash"
  | "magnet"
  | "ignite"
  | "mist"
  | "thorn"
  | "grav"
  | "shatter"
  | "fork"
  | "veil"
  | "howl";
export type SpellRarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type CraftedSpell = {
  name: string;
  color: string;
  damage: number;
  shape: CraftShape;
  extra: CraftExtra;
  cooldown: number;
  rarity: SpellRarity;
  shots: number;
  ability: CraftAbility;
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
  if (spell === "boom") return 100 + damageUp * 4;
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
  vineUnlocked: boolean;
  boomUnlocked: boolean;
  crafted: CraftedSpell | null;
  sandbox: boolean;
};

type Dir = "down" | "left" | "right" | "up";
type EnemyKind = "wisp" | "runner" | "brute" | "elite" | "boss";

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
  home: Enemy | null;
  ability: CraftAbility;
  hits: number;
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
  knockT: number;
  knockX: number;
  knockY: number;
  kvx: number;
  kvy: number;
  bossId: number;
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
  kind: "dot" | "flake" | "coin" | "shard";
};
type Floater = { alive: boolean; x: number; y: number; ttl: number; text: string; color: string };
type Burst = { alive: boolean; x: number; y: number; t: number; spell: Spell };
type Blast = {
  alive: boolean;
  x: number;
  y: number;
  dirX: number;
  dirY: number;
  t: number;
  life: number;
};
type Arc = { alive: boolean; x: number; y: number; r: number; ttl: number; max: number };
type Hazard = {
  alive: boolean;
  x: number;
  y: number;
  r: number;
  ttl: number;
  max: number;
  kind: "goo" | "acid" | "web" | "dust" | "spore";
  color: string;
};
type BossShot = {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
  r: number;
  dmg: number;
  color: string;
  kind: string;
};
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
const BOOM_CD = 0.5;
const BOLT_SPEED = 1280;
const MAX_BULLETS = 140;
const MAX_ENEMIES = 48;
const MAX_PICKUPS = 16;
const MAX_SPARKS = 320;
const MAX_ARCS = 80;
const MAX_HAZARDS = 64;
const MAX_BOSS_SHOTS = 48;

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
    boom: { speed: 0, damage: 0 },
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

  player = { x: ARENA / 2, y: ARENA / 2, hp: 100, maxHp: 100, invuln: 0, face: "down" as Dir, frame: 0, moving: false, vx: 0, vy: 0, knockT: 0, knockX: 0, knockY: 1 };
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
  vineUnlocked = false;
  boomUnlocked = false;
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
  private blasts: Blast[] = [];
  private arcs: Arc[] = [];
  private hazards: Hazard[] = [];
  private bossShots: BossShot[] = [];
  private playerSlow = 0;
  private playerStun = 0;
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
        boom: { ...this.upgrades.boom },
        craft: { ...this.upgrades.craft },
      },
      boltUnlocked: this.boltUnlocked,
      voidUnlocked: this.voidUnlocked,
      vineUnlocked: this.vineUnlocked,
      boomUnlocked: this.boomUnlocked,
      crafted: this.crafted ? { ...this.crafted } : null,
      sandbox: this.richRun,
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
    this.audio.stopBed();
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
    this.audio.startBed();
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
    if (spell === "vine" && !this.vineUnlocked) return;
    if (spell === "boom" && !this.boomUnlocked) return;
    if (spell === "craft" && !this.crafted) return;
    this.setSpell(spell);
  }

  setSpell(spell: Spell) {
    if (spell === "bolt" && !this.boltUnlocked) return;
    if (spell === "void" && !this.voidUnlocked) return;
    if (spell === "vine" && !this.vineUnlocked) return;
    if (spell === "boom" && !this.boomUnlocked) return;
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

  spinWheel(): "poor" | "miss" | "craft" | "jackpot" {
    if (this.gold < 100) return "poor";
    this.gold -= 100;
    this.audio.pickup();
    this.emit();
    if (Math.random() < 0.01) return "jackpot";
    return Math.random() < 0.5 ? "craft" : "miss";
  }

  fanfare() {
    this.audio.unlock();
    this.audio.jackpot();
  }

  grantJackpot(spell: CraftedSpell): CraftedSpell {
    this.gold += 1000;
    this.crafted = {
      name: spell.name.trim().slice(0, 10) || "Rune",
      color: spell.color || "#f0d24a",
      damage: clamp(Math.round(spell.damage), 4, 60),
      shape: spell.shape,
      extra: spell.extra,
      cooldown: clamp(spell.cooldown, 0.28, 2.2),
      rarity: "legendary",
      shots: clamp(Math.round(spell.shots || 1), 1, 10),
      ability: spell.ability ?? "seek",
    };
    this.upgrades.craft = { speed: 0, damage: 0 };
    this.spell = "craft";
    this.emit();
    return this.crafted;
  }

  saveCrafted(spell: CraftedSpell) {
    this.crafted = {
      name: spell.name.trim().slice(0, 10) || "Rune",
      color: spell.color || "#ecece8",
      damage: clamp(Math.round(spell.damage), 4, 60),
      shape: spell.shape,
      extra: spell.extra,
      cooldown: clamp(spell.cooldown, 0.28, 2.2),
      rarity: spell.rarity ?? "common",
      shots: clamp(Math.round(spell.shots || 1), 1, 10),
      ability: spell.ability ?? "seek",
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

  unlockVine(): boolean {
    if (this.vineUnlocked) return true;
    if (this.gold < 1777) return false;
    this.gold -= 1777;
    this.vineUnlocked = true;
    this.spell = "vine";
    this.audio.pickup();
    this.emit();
    return true;
  }

  unlockBoom(): boolean {
    if (this.boomUnlocked) return true;
    if (this.gold < 2500) return false;
    this.gold -= 2500;
    this.boomUnlocked = true;
    this.spell = "boom";
    this.audio.pickup();
    this.emit();
    return true;
  }

  upgradeSpell(spell: Spell, stat: SpellStat): boolean {
    if (spell === "bolt" && !this.boltUnlocked) return false;
    if (spell === "void" && !this.voidUnlocked) return false;
    if (spell === "vine" && !this.vineUnlocked) return false;
    if (spell === "boom" && !this.boomUnlocked) return false;
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
    this.audio.stopBed();
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
      knockT: 0,
      knockX: 0,
      knockY: 1,
    };
    this.aim = { x: 0, y: 1 };
    this.score = 0;
    this.gold = 0;
    this.upgrades = emptyUpgrades();
    this.boltUnlocked = false;
    this.voidUnlocked = false;
    this.vineUnlocked = false;
    this.boomUnlocked = false;
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
    this.blasts = [];
    this.arcs = [];
    this.hazards = [];
    this.bossShots = [];
    this.playerSlow = 0;
    this.playerStun = 0;
    this.cam.x = this.player.x - this.view.w / 2;
    this.cam.y = this.player.y - this.view.h / 2;
  }

  spawnFoe(kind: "wisp" | "runner" | "brute" | "elite") {
    if (this.phase !== "playing" && this.phase !== "paused") return;
    this.spawnEnemy(kind);
  }

  spawnBoss(id: number) {
    if (this.phase !== "playing" && this.phase !== "paused") return;
    this.placeBoss(id);
  }

  lineupBosses() {
    if (this.phase !== "playing" && this.phase !== "paused") return;
    this.clearFoes();
    this.player.x = 700;
    this.player.y = 1040;
    const cols = 5;
    for (let i = 0; i < BOSSES.length; i++) {
      const e = this.placeBoss(i);
      const col = i % cols;
      const row = Math.floor(i / cols);
      e.x = 420 + col * 140;
      e.y = 380 + row * 150;
      e.kvx = 0;
      e.kvy = 0;
      e.speed = 0;
      e.voidIcd = 999;
    }
  }

  clearFoes() {
    for (const e of this.enemies) e.alive = false;
    this.emit();
  }

  private beginWave() {
    this.wave += 1;
    if (this.wave > this.bestNight) {
      this.bestNight = this.wave;
      this.persist();
    }
    this.toSpawn = this.richRun ? 0 : 5 + this.wave * 3;
    this.spawnT = 0.2;
    this.waveGap = 0;
    this.audio.wave();
    this.floatAt(this.player.x, this.player.y - 40, this.richRun ? "Sandbox" : `Night ${this.wave}`);
    if (!this.richRun && this.wave > 0 && this.wave % 5 === 0) {
      const id = (Math.floor(this.wave / 5) - 1) % BOSSES.length;
      this.placeBoss(id);
      this.toSpawn = 8;
      this.floatAt(this.player.x, this.player.y - 72, `BOSS ${BOSSES[id]!.name}`, BOSSES[id]!.color2);
    }
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
    this.player.knockT = Math.max(0, this.player.knockT - dt);
    this.playerSlow = Math.max(0, this.playerSlow - dt);
    this.playerStun = Math.max(0, this.playerStun - dt);
    this.trauma = Math.max(0, this.trauma - dt * 1.8);
    const actions = this.input.poll();
    this.aimFrom(actions);
    this.movePlayer(actions, dt);
    if (actions.fire && this.fireCd <= 0) this.shoot();
    this.updateBullets(dt);
    this.updateEnemies(dt);
    this.updateBossShots(dt);
    this.updateHazards(dt);
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
    if (this.input.has("Digit6") || this.input.has("Numpad6")) this.chooseSpell("boom");
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
    const sliding = this.player.knockT > 0.04;
    const rate = sliding ? 3.2 : want > 0.12 ? PLAYER_ACCEL : PLAYER_STOP;
    const k = 1 - Math.exp(-rate * dt);
    const stunned = this.playerStun > 0;
    const tx = sliding || stunned ? 0 : actions.moveX * PLAYER_SPEED * (this.playerSlow > 0 ? 0.42 : 1);
    const ty = sliding || stunned ? 0 : actions.moveY * PLAYER_SPEED * (this.playerSlow > 0 ? 0.42 : 1);
    this.player.vx += (tx - this.player.vx) * k;
    this.player.vy += (ty - this.player.vy) * k;
    if (!sliding && Math.hypot(this.player.vx, this.player.vy) < 6 && want < 0.08) {
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
    if (this.spell === "vine" && !this.vineUnlocked) return;
    if (this.spell === "boom" && !this.boomUnlocked) return;
    if (this.spell === "craft" && !this.crafted) return;
    const speedUp = this.upgrades[this.spell].speed;
    const baseCd =
      this.spell === "craft" && this.crafted
        ? this.crafted.cooldown
        : this.spell === "bolt"
          ? BOLT_CD
          : this.spell === "void"
            ? VOID_CD
            : this.spell === "boom"
              ? BOOM_CD
            : FIRE_CD;
    this.fireCd = baseCd * (1 - speedUp * 0.025);
    if (this.spell === "void") {
      this.spawnVoid();
    } else if (this.spell === "boom") {
      this.shootBoom();
    } else if (this.spell === "craft" && this.crafted) {
      this.shootCraft(this.crafted);
      if (this.crafted.ability === "dash") {
        this.player.vx += this.aim.x * 280;
        this.player.vy += this.aim.y * 280;
        this.markPlayerKnock(this.aim.x, this.aim.y, 0.18);
      }
      if (this.crafted.ability === "veil") this.player.invuln = Math.max(this.player.invuln, 0.35);
    } else if (this.spell === "frost") {
      this.spawnShot(this.spell, -16);
      this.spawnShot(this.spell, 0);
      this.spawnShot(this.spell, 16);
      this.audio.ice();
    } else if (this.spell === "bolt") {
      this.spawnShot(this.spell, 0);
      this.audio.bolt();
    } else if (this.spell === "vine") {
      this.shootVine();
      this.audio.ice();
    } else {
      this.spawnShot(this.spell, 0);
      this.audio.fire();
    }
    this.player.vx -= this.aim.x * (this.spell === "boom" ? 420 : 36);
    this.player.vy -= this.aim.y * (this.spell === "boom" ? 420 : 36);
    if (this.spell === "boom") this.markPlayerKnock(-this.aim.x, -this.aim.y, 0.28);
    this.trauma = Math.min(1, this.trauma + (this.spell === "boom" ? 0.42 : 0.08));
  }

  private shootBoom() {
    const ox = this.player.x + this.aim.x * 38;
    const oy = this.player.y + this.aim.y * 38;
    const blast = this.blasts.find((b) => !b.alive);
    const slot =
      blast ??
      (() => {
        const n: Blast = { alive: false, x: 0, y: 0, dirX: 1, dirY: 0, t: 0, life: 0.42 };
        this.blasts.push(n);
        return n;
      })();
    slot.alive = true;
    slot.x = ox;
    slot.y = oy;
    slot.dirX = this.aim.x;
    slot.dirY = this.aim.y;
    slot.t = 0;
    slot.life = 0.55;
    const reach = 168;
    const dmg = spellDamage("boom", this.upgrades.boom.damage);
    for (const e of this.enemies) {
      if (!e.alive) continue;
      const dx = e.x - this.player.x;
      const dy = e.y - this.player.y;
      const dist = Math.hypot(dx, dy) || 1;
      if (dist > reach + e.r) continue;
      const dot = (dx * this.aim.x + dy * this.aim.y) / dist;
      if (dot < 0.28) continue;
      this.hurtEnemy(e, dmg, this.aim.x, this.aim.y, "boom");
    }
    const colors = ["#ffffff", "#fff4c8", "#ffe27a", "#f0d24a", "#ff9a3c", "#ff5a2a"];
    for (let i = 0; i < 72; i++) {
      const s = this.allocSpark();
      if (!s) break;
      const spread = (Math.random() - 0.5) * 1.35;
      const ang = Math.atan2(this.aim.y, this.aim.x) + spread;
      const sp = 140 + Math.random() * 420;
      s.alive = true;
      s.x = ox + (Math.random() - 0.5) * 8;
      s.y = oy + (Math.random() - 0.5) * 8;
      s.vx = Math.cos(ang) * sp;
      s.vy = Math.sin(ang) * sp;
      s.ttl = 0.18 + Math.random() * 0.28;
      s.max = s.ttl;
      s.size = 2 + Math.floor(Math.random() * 5);
      s.color = colors[Math.floor(Math.random() * colors.length)]!;
      s.kind = "shard";
    }
    this.spawnBurst(ox, oy, "boom");
    this.audio.hit();
    this.audio.fire();
  }

  private shootCraft(craft: CraftedSpell) {
    const form = craft.shape;
    const n = clamp(Math.round(craft.shots || 1), 1, 10);
    if (craft.ability === "orbit") {
      const count = Math.max(1, n);
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2;
        this.spawnCraftShot(craft, Math.cos(a), Math.sin(a), 0, { orbit: true, ang: a });
      }
      this.audio.wave();
      this.forkCraft(craft);
      return;
    }
    if (craft.ability === "rain") {
      const count = Math.max(1, n);
      for (let i = 0; i < count; i++) {
        const ox = this.player.x + this.aim.x * (40 + i * 18) + (i - (count - 1) / 2) * 22;
        const oy = this.player.y + this.aim.y * 20 - 160 - i * 12;
        this.spawnCraftShot(craft, 0.12, 1, 0, { x: ox, y: oy });
      }
      this.audio.ice();
      this.forkCraft(craft);
      return;
    }
    if (form === "nova") {
      const count = n <= 1 ? 8 : n;
      for (let i = 0; i < count; i++) {
        const a = (i / count) * Math.PI * 2 + this.animT;
        this.spawnCraftShot(craft, Math.cos(a), Math.sin(a), 0);
      }
      this.audio.wave();
      this.forkCraft(craft);
      return;
    }
    if (form === "wave") {
      const count = n <= 1 ? 5 : n;
      const half = (count - 1) / 2;
      for (let i = 0; i < count; i++) this.spawnCraftShot(craft, this.aim.x, this.aim.y, (i - half) * 12);
      this.audio.ice();
      this.forkCraft(craft);
      return;
    }
    if (n <= 1) {
      this.spawnCraftShot(craft, this.aim.x, this.aim.y, 0);
      if (form === "beam") this.audio.bolt();
      else this.audio.fire();
      this.forkCraft(craft);
      return;
    }
    const spread = n >= 8 ? 0.72 : n >= 5 ? 0.48 : 0.26;
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1) - 0.5;
      const ang = Math.atan2(this.aim.y, this.aim.x) + t * spread * 2;
      this.spawnCraftShot(craft, Math.cos(ang), Math.sin(ang), 0);
    }
    this.audio.ice();
    this.forkCraft(craft);
  }

  private forkCraft(craft: CraftedSpell) {
    if (craft.ability !== "fork") return;
    this.spawnCraftShot(craft, this.aim.x, this.aim.y, -16, { ability: "pierce", ttl: 0.55 });
    this.spawnCraftShot(craft, this.aim.x, this.aim.y, 16, { ability: "pierce", ttl: 0.55 });
  }

  private spawnCraftShot(
    craft: CraftedSpell,
    dirX: number,
    dirY: number,
    side: number,
    opts?: { orbit?: boolean; ang?: number; x?: number; y?: number; ability?: CraftAbility; ttl?: number },
  ) {
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
    b.x = opts?.x ?? this.player.x + dirX * 22 + px * side;
    b.y = opts?.y ?? this.player.y + dirY * 18 + py * side;
    b.vx = dirX * speed;
    b.vy = dirY * speed;
    b.ttl = opts?.ttl ?? (form === "beam" ? 0.28 : form === "meteor" ? 1.4 : form === "orb" ? 1.6 : form === "nova" ? 0.7 : 0.95);
    if (opts?.orbit) b.ttl = 2.1;
    if (craft.ability === "rain") b.ttl = 1.35;
    if (craft.ability === "bloom") b.ttl = Math.max(b.ttl, 0.85);
    b.r = form === "orb" ? 18 : form === "meteor" ? 22 : form === "beam" ? 10 : form === "wave" ? 14 : form === "shard" ? 7 : 9;
    b.spell = "craft";
    b.trail = 0;
    b.ox = b.x;
    b.oy = b.y;
    b.dist = 0;
    b.dirX = dirX;
    b.dirY = dirY;
    b.speed = opts?.orbit ? 9 + this.upgrades.craft.speed * 0.3 : speed;
    b.form = form;
    b.color = craft.color;
    b.ability = opts?.ability ?? craft.ability;
    b.hits = 0;
    b.ang = opts?.ang ?? Math.atan2(dirY, dirX);
    b.orbit = opts?.orbit ? 70 + (craft.shots > 3 ? 18 : 0) : 0;
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
    b.ability = "seek";
    b.hits = 0;
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
    b.home = null;
    b.ability = "seek";
    b.hits = 0;
    b.form = "single";
    this.burstSparks(b.x, b.y, 3, spell === "frost" ? "#c5eaf6" : spell === "bolt" ? "#f0d24a" : spell === "vine" ? "#6fbf6a" : "#e8c070");
    if (spell === "frost") this.spawnFlake(b.x, b.y, true);
    if (spell === "vine") this.burstSparks(b.x, b.y, 2, "#3d7a45");
    if (spell === "bolt") {
      this.spawnArc(b.x, b.y);
      this.burstSparks(b.x, b.y, 6, "#ffe27a");
    }
  }

  private shootVine() {
    const wrapped = this.enemies.filter((e) => e.alive && e.wrapped > 0);
    if (wrapped.length === 0) {
      this.spawnShot("vine", 0);
      return;
    }
    const n = Math.min(wrapped.length, 16);
    for (let i = 0; i < n; i++) this.spawnVineHoming(wrapped[i]!, i, n);
  }

  private spawnVineHoming(target: Enemy, i: number, n: number) {
    const speed = BULLET_SPEED * (0.92 + this.upgrades.vine.speed * 0.04);
    const spread = n === 1 ? 0 : (i / (n - 1) - 0.5) * 0.7;
    const base = Math.atan2(target.y - this.player.y, target.x - this.player.x);
    const ang = base + spread;
    const dirX = Math.cos(ang);
    const dirY = Math.sin(ang);
    const b = this.allocBullet();
    b.alive = true;
    b.x = this.player.x + dirX * 22;
    b.y = this.player.y + dirY * 18;
    b.vx = dirX * speed;
    b.vy = dirY * speed;
    b.ttl = 1.45;
    b.r = 11;
    b.spell = "vine";
    b.trail = 0;
    b.ox = b.x;
    b.oy = b.y;
    b.dist = 0;
    b.dirX = dirX;
    b.dirY = dirY;
    b.speed = speed;
    b.home = target;
    this.burstSparks(b.x, b.y, 2, "#6fbf6a");
  }

  private allocBullet(): Bullet {
    const dead = this.bullets.find((b) => !b.alive);
    if (dead) {
      dead.ability = "seek";
      dead.hits = 0;
      dead.home = null;
      dead.orbit = 0;
      dead.form = "single";
      return dead;
    }
    if (this.bullets.length >= MAX_BULLETS) {
      const oldest = this.bullets.reduce((a, b) => (a.ttl < b.ttl ? a : b));
      oldest.alive = false;
      oldest.ability = "seek";
      oldest.hits = 0;
      oldest.home = null;
      oldest.orbit = 0;
      return oldest;
    }
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
      home: null,
      ability: "seek",
      hits: 0,
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

  private nearestWrapped(x: number, y: number) {
    let best: Enemy | null = null;
    let bestD = 999999;
    for (const e of this.enemies) {
      if (!e.alive || e.wrapped <= 0) continue;
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
      if (b.spell === "ember" || (b.spell === "craft" && (b.form === "weave" || b.ability === "trail"))) {
        b.dist += b.speed * dt;
        const wave = Math.sin(b.dist * 0.038) * (b.ability === "trail" ? 18 : 30);
        b.x = b.ox + b.dirX * b.dist + -b.dirY * wave;
        b.y = b.oy + b.dirY * b.dist + b.dirX * wave;
        b.trail += dt;
        if (b.trail >= 0.028) {
          b.trail = 0;
          this.burstSparks(b.x, b.y, 1, b.spell === "craft" ? b.color : "#e8c070");
        }
      } else if (b.spell === "craft" && b.ability === "orbit") {
        b.ang += b.speed * dt;
        b.x = this.player.x + Math.cos(b.ang) * (b.orbit || 80);
        b.y = this.player.y + Math.sin(b.ang) * (b.orbit || 80);
        b.dirX = Math.cos(b.ang);
        b.dirY = Math.sin(b.ang);
        b.trail += dt;
        if (b.trail >= 0.03) {
          b.trail = 0;
          this.burstSparks(b.x, b.y, 1, b.color);
        }
      } else {
        if (b.spell === "craft" && (b.form === "homing" || b.ability === "seek" || b.ability === "magnet" || b.ability === "hook")) {
          const t = this.nearestEnemy(b.x, b.y);
          if (t) {
            const dx = t.x - b.x;
            const dy = t.y - b.y;
            const dm = Math.hypot(dx, dy) || 1;
            const turn = b.ability === "magnet" ? 7 : b.ability === "hook" ? 9 : 4;
            b.dirX += (dx / dm) * turn * dt;
            b.dirY += (dy / dm) * turn * dt;
            const nm = Math.hypot(b.dirX, b.dirY) || 1;
            b.dirX /= nm;
            b.dirY /= nm;
            b.vx = b.dirX * b.speed;
            b.vy = b.dirY * b.speed;
          }
        }
        if (b.spell === "vine") {
          const t = b.home?.alive ? b.home : this.nearestWrapped(b.x, b.y) ?? this.nearestEnemy(b.x, b.y);
          if (t) {
            const dx = t.x - b.x;
            const dy = t.y - b.y;
            const dm = Math.hypot(dx, dy) || 1;
            b.dirX += (dx / dm) * 7 * dt;
            b.dirY += (dy / dm) * 7 * dt;
            const nm = Math.hypot(b.dirX, b.dirY) || 1;
            b.dirX /= nm;
            b.dirY /= nm;
            b.vx = b.dirX * b.speed;
            b.vy = b.dirY * b.speed;
          }
          b.trail += dt;
          if (b.trail >= 0.024) {
            b.trail = 0;
            this.burstSparks(b.x, b.y, 1, "#6fbf6a");
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
          if (b.ability === "grow") b.r = Math.min(28, b.r + 12 * dt);
          if (b.ability === "pulse") {
            b.orbit += dt;
            if (b.orbit >= 0.22) {
              b.orbit = 0;
              this.pulseCraft(b, 48);
            }
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
        if (b.spell === "craft" && b.ability === "bloom") this.detonateCraft(b);
        if (b.spell === "craft" && b.ability === "ricochet" && b.hits < 4 && (b.x < 0 || b.x > ARENA || b.y < 0 || b.y > ARENA)) {
          if (b.x < 0 || b.x > ARENA) b.vx *= -1;
          if (b.y < 0 || b.y > ARENA) b.vy *= -1;
          b.dirX = b.vx;
          b.dirY = b.vy;
          const nm = Math.hypot(b.dirX, b.dirY) || 1;
          b.dirX /= nm;
          b.dirY /= nm;
          b.x = clamp(b.x, 8, ARENA - 8);
          b.y = clamp(b.y, 8, ARENA - 8);
          b.hits += 1;
          b.ttl = Math.max(b.ttl, 0.35);
        } else {
          b.alive = false;
        }
        if (!b.alive) continue;
      }
      let blocked = false;
      for (const p of this.props) {
        if (circleHit(b.x, b.y, b.r, p.x, p.y, p.r * 0.85)) {
          blocked = true;
          break;
        }
      }
      if (blocked) {
        if (b.spell === "craft" && (b.ability === "ricochet" || b.ability === "bounce") && b.hits < 3) {
          b.vx *= -1;
          b.vy *= -1;
          b.dirX = b.vx;
          b.dirY = b.vy;
          b.hits += 1;
        } else {
          if (b.spell === "craft" && b.ability === "bloom") this.detonateCraft(b);
          b.alive = false;
          this.spawnBurst(b.x, b.y, b.spell);
          continue;
        }
      }
      for (const e of this.enemies) {
        if (!e.alive) continue;
        if (circleHit(b.x, b.y, b.r, e.x, e.y, e.r)) {
          if (b.spell === "craft") {
            this.onCraftHit(b, e);
            if (!b.alive) break;
          } else {
            b.alive = false;
            this.hurtEnemy(e, spellDamage(b.spell, this.upgrades[b.spell].damage, this.crafted), b.vx, b.vy, b.spell);
            break;
          }
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
    const m = Math.hypot(vx, vy) || 1;
    const nx = vx / m;
    const ny = vy / m;
    const knock = spell === "void" ? 180 : spell === "boom" ? 280 : e.kind === "boss" ? 18 : 10;
    e.kvx = nx * (knock / 0.22);
    e.kvy = ny * (knock / 0.22);
    e.knockX = nx;
    e.knockY = ny;
    e.knockT = spell === "boom" || spell === "void" ? 0.4 : 0.18;
    this.spawnKnockDust(e.x, e.y, nx, ny, spell === "boom" ? 14 : 6);
    if (spell === "void") e.stun = Math.max(e.stun, 0.35);
    this.hitstop = 0.035;
    this.trauma = Math.min(1, this.trauma + 0.18);
    this.audio.hit();
    this.spawnBurst(e.x, e.y, spell);
    if (e.hp <= 0) this.killEnemy(e);
  }

  private onCraftHit(b: Bullet, e: Enemy) {
    if (b.ability === "orbit" && e.voidIcd > 0) return;
    const craft = this.crafted;
    const dmg = spellDamage("craft", this.upgrades.craft.damage, craft);
    this.hurtEnemy(e, dmg, b.vx, b.vy, "craft");
    const a = b.ability;
    if (a === "leech") this.player.hp = Math.min(this.player.maxHp, this.player.hp + 4);
    if (a === "ignite") e.burn = Math.max(e.burn, 5);
    if (a === "curse") {
      e.burn = Math.max(e.burn, 3);
      e.freeze = Math.max(e.freeze, 1.4);
    }
    if (a === "freeze") e.freeze = Math.max(e.freeze, 2);
    if (a === "shock") e.stun = Math.max(e.stun, 1.4);
    if (a === "trap" || a === "thorn") this.wrapEnemy(e);
    if (a === "tide") {
      e.kvx = b.dirX * 900;
      e.kvy = b.dirY * 900;
      e.knockT = 0.32;
    }
    if (a === "pull" || a === "hook" || a === "grav") {
      const dx = this.player.x - e.x;
      const dy = this.player.y - e.y;
      const dm = Math.hypot(dx, dy) || 1;
      e.kvx = (dx / dm) * 700;
      e.kvy = (dy / dm) * 700;
      e.knockT = 0.28;
    }
    if (a === "explode" || a === "shatter" || a === "bloom") this.detonateCraft(b);
    if (a === "mist" || a === "howl") this.ringCraft(b.x, b.y, a === "howl" ? 110 : 70, a);
    if (a === "spore") this.dropHazard(b.x, b.y, "dust", b.color, 36);
    if (a === "split" && b.hits < 1 && craft) {
      const ang = Math.atan2(b.dirY, b.dirX);
      this.spawnCraftShot(craft, Math.cos(ang + 0.7), Math.sin(ang + 0.7), 0, { ability: "pierce", ttl: 0.4 });
      this.spawnCraftShot(craft, Math.cos(ang - 0.7), Math.sin(ang - 0.7), 0, { ability: "pierce", ttl: 0.4 });
    }
    if (a === "pierce" && b.hits < 3) {
      b.hits += 1;
      return;
    }
    if (a === "bounce" && b.hits < 2) {
      b.vx *= -1;
      b.vy *= -1;
      b.dirX = b.vx;
      b.dirY = b.vy;
      b.hits += 1;
      return;
    }
    if (a === "chain" && b.hits < 3) {
      const next = this.nearestEnemyExcept(b.x, b.y, e);
      if (next) {
        const dx = next.x - b.x;
        const dy = next.y - b.y;
        const dm = Math.hypot(dx, dy) || 1;
        b.dirX = dx / dm;
        b.dirY = dy / dm;
        b.vx = b.dirX * b.speed;
        b.vy = b.dirY * b.speed;
        b.hits += 1;
        b.ttl = Math.max(b.ttl, 0.4);
        return;
      }
    }
    if (a === "orbit") {
      e.voidIcd = 0.22;
      return;
    }
    b.alive = false;
  }

  private nearestEnemyExcept(x: number, y: number, skip: Enemy) {
    let best: Enemy | null = null;
    let bestD = 999999;
    for (const e of this.enemies) {
      if (!e.alive || e === skip) continue;
      const d = (e.x - x) * (e.x - x) + (e.y - y) * (e.y - y);
      if (d < bestD) {
        bestD = d;
        best = e;
      }
    }
    return best;
  }

  private detonateCraft(b: Bullet) {
    if (b.hits >= 90) return;
    b.hits = 90;
    const r = b.ability === "shatter" ? 70 : 56;
    const dmg = Math.max(6, Math.round(spellDamage("craft", this.upgrades.craft.damage, this.crafted) * 0.55));
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (Math.hypot(e.x - b.x, e.y - b.y) <= r + e.r) this.hurtEnemy(e, dmg, e.x - b.x, e.y - b.y, "craft");
    }
    this.spawnBurst(b.x, b.y, "craft");
    this.burstSparks(b.x, b.y, 10, b.color);
    if (b.ability === "shatter" && this.crafted) {
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        this.spawnCraftShot(this.crafted, Math.cos(a), Math.sin(a), 0, { ability: "pierce", ttl: 0.28 });
      }
    }
  }

  private pulseCraft(b: Bullet, r: number) {
    const dmg = 4;
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (Math.hypot(e.x - b.x, e.y - b.y) <= r + e.r) {
        e.hp -= dmg;
        e.flash = 0.06;
        if (e.hp <= 0) this.killEnemy(e);
      }
    }
    this.burstSparks(b.x, b.y, 4, b.color);
  }

  private ringCraft(x: number, y: number, r: number, a: CraftAbility) {
    for (const e of this.enemies) {
      if (!e.alive) continue;
      if (Math.hypot(e.x - x, e.y - y) > r + e.r) continue;
      if (a === "howl") e.stun = Math.max(e.stun, 1.1);
      if (a === "mist") e.freeze = Math.max(e.freeze, 1.4);
      if (a === "grav") {
        const dx = x - e.x;
        const dy = y - e.y;
        const dm = Math.hypot(dx, dy) || 1;
        e.kvx = (dx / dm) * 500;
        e.kvy = (dy / dm) * 500;
        e.knockT = 0.24;
      }
    }
    this.burstSparks(x, y, 8, "#ecece8");
  }

  private wrapEnemy(e: Enemy) {
    if (e.vineIcd > 0) return;
    e.stun = 5;
    e.wrapped = 5;
    e.vineIcd = e.kind === "boss" ? 6 : 8;
    e.kvx = 0;
    e.kvy = 0;
    this.floatAt(e.x, e.y - 22, "wrap", "#6fbf6a");
    this.burstSparks(e.x, e.y, 8, "#6fbf6a");
    this.audio.ice();
  }

  private killEnemy(e: Enemy) {
    e.alive = false;
    const pts = e.kind === "boss" ? 400 : e.kind === "elite" ? 80 : e.kind === "brute" ? 40 : e.kind === "runner" ? 18 : 12;
    this.score += pts;
    if (this.score > this.best) {
      this.best = this.score;
      this.persist();
    }
    let gold = goldFor(e.kind);
    let coins = coinCountFor(e.kind);
    let sparkColor = e.kind === "brute" ? "#8aa0b8" : "#6a7a9a";
    let sparkN = 14;
    if (e.kind === "boss") {
      const def = BOSSES[e.bossId] ?? BOSSES[0]!;
      gold = def.goldMin + Math.floor(Math.random() * (def.goldMax - def.goldMin + 1));
      if (Math.random() < 0.5) gold += 40 + Math.floor(Math.random() * 120);
      coins = 14 + Math.floor(Math.random() * 10);
      sparkColor = def.color2;
      sparkN = 36;
      this.floatAt(e.x, e.y - 36, def.drop, def.color2);
      if (Math.random() < 0.4) this.spawnPickup(e.x + 18, e.y);
    }
    this.gold += gold;
    this.floatAt(e.x, e.y - 18, `+${gold}`, "#f0d24a");
    this.spawnCoins(e.x, e.y, coins);
    this.burstSparks(e.x, e.y, sparkN, sparkColor);
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
    if (this.richRun) return;
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

  private spawnEnemy(kind?: "wisp" | "runner" | "brute" | "elite") {
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
    e.kind = kind ?? this.pickEnemyKind();
    e.flash = 0;
    e.frame = Math.random() * 4;
    e.contact = 0;
    e.freeze = 0;
    e.stun = 0;
    e.burn = 0;
    e.dash = 0.4 + Math.random() * 0.8;
    e.lunging = 0;
    e.voidIcd = 0;
    e.vineIcd = 0;
    e.wrapped = 0;
    e.knockT = 0;
    e.knockX = 0;
    e.knockY = 1;
    e.kvx = 0;
    e.kvy = 0;
    e.bossId = -1;
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

  private placeBoss(id: number) {
    const def = BOSSES[id] ?? BOSSES[0]!;
    const e = this.allocEnemy();
    e.alive = true;
    e.kind = "boss";
    e.bossId = BOSSES.indexOf(def);
    const spread = 300 + Math.random() * 40;
    const ang = Math.random() * Math.PI * 2;
    e.x = clamp(this.player.x + Math.cos(ang) * spread, 90, ARENA - 90);
    e.y = clamp(this.player.y + Math.sin(ang) * spread, 90, ARENA - 90);
    e.r = def.r;
    e.speed = def.speed;
    e.maxHp = def.hp + Math.max(0, this.wave - 5) * 40;
    e.hp = e.maxHp;
    e.flash = 0;
    e.frame = 0;
    e.contact = 0;
    e.freeze = 0;
    e.stun = 0;
    e.burn = 0;
    e.dash = 0.4;
    e.lunging = 0;
    e.voidIcd = 0;
    e.vineIcd = 0;
    e.wrapped = 0;
    e.knockT = 0;
    e.knockX = 0;
    e.knockY = 1;
    e.kvx = Math.cos(ang) * def.speed;
    e.kvy = Math.sin(ang) * def.speed;
    this.floatAt(this.player.x, this.player.y - 64, def.name, def.color2);
    this.audio.wave();
    return e;
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
      knockT: 0,
      knockX: 0,
      knockY: 1,
      kvx: 0,
      kvy: 0,
      bossId: -1,
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
      if (this.spell === "vine" && e.vineIcd <= 0 && e.wrapped <= 0) {
        const reach = 72 + e.r;
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
      e.dash = Math.max(0, e.dash - dt);
      e.lunging = Math.max(0, e.lunging - dt);
      if (e.kind === "boss") {
        this.updateBoss(e, dt, px, py, i);
        continue;
      }
      const tx = px - e.x;
      const ty = py - e.y;
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
      if (e.knockT > 0) {
        e.knockT = Math.max(0, e.knockT - dt);
        e.x = clamp(e.x + e.kvx * dt, 40, ARENA - 40);
        e.y = clamp(e.y + e.kvy * dt, 40, ARENA - 40);
        e.kvx *= Math.exp(-7 * dt);
        e.kvy *= Math.exp(-7 * dt);
        if (Math.random() < 0.45) this.spawnKnockDust(e.x, e.y, e.knockX, e.knockY, 1);
      } else {
        vx = (vx / vm) * e.speed * lunge * frozen * stunned;
        vy = (vy / vm) * e.speed * lunge * frozen * stunned;
        e.x = clamp(e.x + vx * dt, 40, ARENA - 40);
        e.y = clamp(e.y + vy * dt, 40, ARENA - 40);
      }
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
        this.markPlayerKnock((px - e.x) / kd, (py - e.y) / kd, 0.32);
        this.trauma = Math.min(1, this.trauma + 0.45);
        this.audio.hurt();
        this.emit();
      }
    }
  }

  private updateBoss(e: Enemy, dt: number, px: number, py: number, index: number) {
    const def: BossDef = BOSSES[e.bossId] ?? BOSSES[0]!;
    const pad = e.r + 8;
    if (e.wrapped > 0 || e.stun > 0) {
      e.kvx *= Math.exp(-10 * dt);
      e.kvy *= Math.exp(-10 * dt);
      e.x = clamp(e.x + e.kvx * dt, pad, ARENA - pad);
      e.y = clamp(e.y + e.kvy * dt, pad, ARENA - pad);
      return;
    }
    const slow = e.freeze > 0 ? 0.7 : 1;
    if (def.move === "bounce") {
      e.x += e.kvx * dt * slow;
      e.y += e.kvy * dt * slow;
    } else if (def.move === "chase") {
      const dx = px - e.x;
      const dy = py - e.y;
      const d = Math.hypot(dx, dy) || 1;
      e.kvx += (dx / d) * def.speed * 2.4 * dt;
      e.kvy += (dy / d) * def.speed * 2.4 * dt;
      const sp = Math.hypot(e.kvx, e.kvy) || 1;
      const cap = def.speed * slow;
      if (sp > cap) {
        e.kvx = (e.kvx / sp) * cap;
        e.kvy = (e.kvy / sp) * cap;
      }
      e.x += e.kvx * dt;
      e.y += e.kvy * dt;
    } else if (def.move === "swoop") {
      const dx = px - e.x;
      const dy = py - e.y;
      const d = Math.hypot(dx, dy) || 1;
      const side = Math.sin(e.frame * 1.7) * 180;
      e.kvx = (dx / d) * def.speed + (-dy / d) * side * 0.35;
      e.kvy = (dy / d) * def.speed + (dx / d) * side * 0.35;
      e.x += e.kvx * dt * slow;
      e.y += e.kvy * dt * slow;
    } else if (def.move === "charge") {
      e.dash -= dt;
      if (e.dash <= 0) {
        const dx = px - e.x;
        const dy = py - e.y;
        const d = Math.hypot(dx, dy) || 1;
        e.kvx = (dx / d) * def.speed * 1.6;
        e.kvy = (dy / d) * def.speed * 1.6;
        e.dash = 1.35;
        e.lunging = 0.2;
      }
      e.x += e.kvx * dt * slow;
      e.y += e.kvy * dt * slow;
    } else if (def.move === "orbit") {
      const dx = e.x - px;
      const dy = e.y - py;
      const d = Math.hypot(dx, dy) || 1;
      const want = 160;
      const tx = px + (-dy / d) * want * 1.1 + (dx / d) * (d > want ? -20 : 40);
      const ty = py + (dx / d) * want * 1.1 + (dy / d) * (d > want ? -20 : 40);
      e.kvx = tx - e.x;
      e.kvy = ty - e.y;
      const sp = Math.hypot(e.kvx, e.kvy) || 1;
      e.x += (e.kvx / sp) * def.speed * dt * slow;
      e.y += (e.kvy / sp) * def.speed * dt * slow;
    } else {
      e.dash -= dt;
      if (e.dash <= 0) {
        const dx = px - e.x;
        const dy = py - e.y;
        const d = Math.hypot(dx, dy) || 1;
        e.kvx = (dx / d) * def.speed * 1.8;
        e.kvy = (dy / d) * def.speed * 1.8;
        e.dash = 0.85;
        e.lunging = 0.22;
      } else {
        e.kvx *= Math.exp(-2.2 * dt);
        e.kvy *= Math.exp(-2.2 * dt);
      }
      e.x += e.kvx * dt * slow;
      e.y += e.kvy * dt * slow;
    }
    if (e.x < pad) {
      e.x = pad;
      e.kvx = Math.abs(e.kvx);
      e.lunging = 0.16;
    } else if (e.x > ARENA - pad) {
      e.x = ARENA - pad;
      e.kvx = -Math.abs(e.kvx);
      e.lunging = 0.16;
    }
    if (e.y < pad) {
      e.y = pad;
      e.kvy = Math.abs(e.kvy);
      e.lunging = 0.16;
    } else if (e.y > ARENA - pad) {
      e.y = ARENA - pad;
      e.kvy = -Math.abs(e.kvy);
      e.lunging = 0.16;
    }
    for (const p of this.props) {
      if (!circleHit(e.x, e.y, e.r, p.x, p.y, p.r)) continue;
      const dx = e.x - p.x;
      const dy = e.y - p.y;
      const d = Math.hypot(dx, dy) || 1;
      e.x = p.x + (dx / d) * (e.r + p.r + 2);
      e.y = p.y + (dy / d) * (e.r + p.r + 2);
      const vn = e.kvx * (dx / d) + e.kvy * (dy / d);
      if (vn < 0) {
        e.kvx -= 2 * vn * (dx / d);
        e.kvy -= 2 * vn * (dy / d);
        e.lunging = 0.16;
      }
    }
    const atk = BOSS_ATTACK[def.name] ?? "slam";
    if (e.speed <= 0) return;
    if ((atk === "drip" || atk === "acid" || atk === "dust") && e.contact <= 0) {
      this.dropHazard(e.x, e.y, atk === "acid" ? "acid" : atk === "dust" ? "dust" : "goo", def.color2, atk === "dust" ? 46 : 28);
      e.contact = atk === "dust" ? 0.45 : 0.28;
    }
    if (e.voidIcd <= 0) {
      this.bossCast(e, def, atk, px, py);
      e.voidIcd = atk === "blink" ? 2.2 : atk === "curl" || atk === "ram" ? 1.8 : 1.45;
      e.lunging = 0.38;
    }
    if (def.smash) {
      for (let j = 0; j < this.enemies.length; j++) {
        if (j === index) continue;
        const o = this.enemies[j]!;
        if (!o.alive || o.kind === "boss") continue;
        if (!circleHit(e.x, e.y, e.r, o.x, o.y, o.r)) continue;
        o.alive = false;
        this.burstSparks(o.x, o.y, 14, def.color2);
        this.floatAt(o.x, o.y - 16, "splat", def.color2);
        this.trauma = Math.min(1, this.trauma + 0.1);
      }
    }
    if (this.player.invuln <= 0 && circleHit(e.x, e.y, e.r * (atk === "bite" && e.lunging > 0 ? 1.35 : 1), px, py, PLAYER_R)) {
      this.hurtLantern(def.hit + (atk === "bite" && e.lunging > 0 ? 12 : 0), px - e.x, py - e.y, 300);
      if (def.name === "VAMPIRE") e.hp = Math.min(e.maxHp, e.hp + 48);
    }
  }

  private bossCast(e: Enemy, def: BossDef, atk: string, px: number, py: number) {
    const dx = px - e.x;
    const dy = py - e.y;
    const d = Math.hypot(dx, dy) || 1;
    const ux = dx / d;
    const uy = dy / d;
    if (atk === "lunge") {
      e.kvx = ux * def.speed * 2.2;
      e.kvy = uy * def.speed * 2.2;
      this.spawnBossShot(e.x, e.y, -uy * 90, ux * 90, def.color2, 10, "bat");
      this.spawnBossShot(e.x, e.y, uy * 90, -ux * 90, def.color2, 10, "bat");
    } else if (atk === "blink") {
      e.x = clamp(px - ux * 70, 80, ARENA - 80);
      e.y = clamp(py - uy * 70, 80, ARENA - 80);
      this.burstSparks(e.x, e.y, 18, def.color2);
    } else if (atk === "curl" || atk === "dive" || atk === "ram" || atk === "bite") {
      e.kvx = ux * def.speed * (atk === "dive" ? 2.6 : 2.3);
      e.kvy = uy * def.speed * (atk === "dive" ? 2.6 : 2.3);
    } else if (atk === "slam") {
      this.radialHurt(e.x, e.y, 88, Math.floor(def.hit * 0.7));
    } else if (atk === "tongue") {
      if (d < 130) this.hurtLantern(def.hit + 6, ux, uy, 240);
    } else if (atk === "stomp") {
      this.radialHurt(e.x, e.y, 110, def.hit);
      this.trauma = Math.min(1, this.trauma + 0.35);
    } else if (atk === "wave") {
      this.radialHurt(e.x, e.y, 96, Math.floor(def.hit * 0.8));
      this.dropHazard(e.x, e.y, "goo", def.color2, 40);
    } else if (atk === "thorns") {
      for (let i = -2; i <= 2; i++) {
        const a = Math.atan2(uy, ux) + i * 0.28;
        this.spawnBossShot(e.x, e.y, Math.cos(a) * 260, Math.sin(a) * 260, def.color2, 12, "thorn");
      }
    } else if (atk === "spores") {
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2 + this.animT;
        this.spawnBossShot(e.x, e.y, Math.cos(a) * 90, Math.sin(a) * 90, def.color2, 14, "spore");
      }
    } else if (atk === "web") {
      this.dropHazard(px, py, "web", def.color2, 42);
    } else if (atk === "nova" || atk === "pulse") {
      this.radialHurt(e.x, e.y, atk === "pulse" ? 130 : 120, Math.floor(def.hit * 0.9));
    } else if (atk === "scream") {
      if (d < 150) {
        this.playerStun = 0.85;
        this.hurtLantern(Math.floor(def.hit * 0.6), ux, uy, 160);
      }
    } else if (atk === "beam") {
      const reach = 220;
      const closest = (px - e.x) * ux + (py - e.y) * uy;
      const cx = e.x + ux * clamp(closest, 0, reach);
      const cy = e.y + uy * clamp(closest, 0, reach);
      if (Math.hypot(px - cx, py - cy) < 22) this.hurtLantern(def.hit + 8, ux, uy, 200);
    } else if (atk === "dust") {
      this.dropHazard(e.x + ux * 30, e.y + uy * 30, "dust", def.color2, 50);
    }
    this.audio.hit();
  }

  private hurtLantern(amount: number, kx: number, ky: number, knock: number) {
    if (this.player.invuln > 0) return;
    const m = Math.hypot(kx, ky) || 1;
    this.player.hp -= amount;
    this.player.invuln = 0.7;
    this.player.vx += (kx / m) * knock;
    this.player.vy += (ky / m) * knock;
    this.markPlayerKnock(kx / m, ky / m, 0.3);
    this.trauma = Math.min(1, this.trauma + 0.4);
    this.audio.hurt();
    this.emit();
  }

  private radialHurt(x: number, y: number, r: number, dmg: number) {
    if (Math.hypot(this.player.x - x, this.player.y - y) < r + PLAYER_R) {
      this.hurtLantern(dmg, this.player.x - x, this.player.y - y, 260);
    }
  }

  private spawnBossShot(x: number, y: number, vx: number, vy: number, color: string, dmg: number, kind: string) {
    const dead = this.bossShots.find((s) => !s.alive);
    const s =
      dead ??
      (this.bossShots.length < MAX_BOSS_SHOTS
        ? (() => {
            const n: BossShot = { alive: false, x: 0, y: 0, vx: 0, vy: 0, ttl: 0, r: 6, dmg: 0, color: "#fff", kind: "thorn" };
            this.bossShots.push(n);
            return n;
          })()
        : null);
    if (!s) return;
    s.alive = true;
    s.x = x;
    s.y = y;
    s.vx = vx;
    s.vy = vy;
    s.ttl = 1.6;
    s.r = kind === "spore" ? 9 : 6;
    s.dmg = dmg;
    s.color = color;
    s.kind = kind;
  }

  private dropHazard(x: number, y: number, kind: Hazard["kind"], color: string, r: number) {
    const dead = this.hazards.find((h) => !h.alive);
    const h =
      dead ??
      (this.hazards.length < MAX_HAZARDS
        ? (() => {
            const n: Hazard = { alive: false, x: 0, y: 0, r: 20, ttl: 0, max: 1, kind: "goo", color: "#fff" };
            this.hazards.push(n);
            return n;
          })()
        : null);
    if (!h) return;
    h.alive = true;
    h.x = x;
    h.y = y;
    h.r = r;
    h.ttl = kind === "web" ? 2.4 : kind === "dust" ? 1.6 : 2.8;
    h.max = h.ttl;
    h.kind = kind;
    h.color = color;
  }

  private updateBossShots(dt: number) {
    for (const s of this.bossShots) {
      if (!s.alive) continue;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.ttl -= dt;
      if (s.kind === "spore") {
        s.vx *= Math.exp(-0.6 * dt);
        s.vy *= Math.exp(-0.6 * dt);
      }
      if (s.ttl <= 0) {
        if (s.kind === "spore") this.dropHazard(s.x, s.y, "spore", s.color, 36);
        s.alive = false;
        continue;
      }
      if (this.player.invuln <= 0 && circleHit(s.x, s.y, s.r, this.player.x, this.player.y, PLAYER_R)) {
        this.hurtLantern(s.dmg, s.vx, s.vy, 180);
        s.alive = false;
      }
    }
  }

  private updateHazards(dt: number) {
    for (const h of this.hazards) {
      if (!h.alive) continue;
      h.ttl -= dt;
      if (h.ttl <= 0) {
        h.alive = false;
        continue;
      }
      if (!circleHit(h.x, h.y, h.r, this.player.x, this.player.y, PLAYER_R)) continue;
      if (h.kind === "goo" || h.kind === "dust") this.playerSlow = Math.max(this.playerSlow, 0.55);
      if (h.kind === "web") this.playerStun = Math.max(this.playerStun, 0.7);
      if ((h.kind === "acid" || h.kind === "spore") && this.player.invuln <= 0) {
        this.hurtLantern(h.kind === "acid" ? 10 : 12, this.player.x - h.x, this.player.y - h.y, 80);
      }
    }
  }

  private drawBossShots() {
    const ctx = this.ctx;
    for (const s of this.bossShots) {
      if (!s.alive) continue;
      ctx.fillStyle = s.color;
      ctx.fillRect(Math.round(s.x) - s.r, Math.round(s.y) - s.r, s.r * 2, s.r * 2);
    }
  }

  private drawHazards() {
    const ctx = this.ctx;
    for (const h of this.hazards) {
      if (!h.alive) continue;
      ctx.globalAlpha = 0.25 + (h.ttl / h.max) * 0.35;
      ctx.fillStyle = h.color;
      ctx.fillRect(Math.round(h.x - h.r), Math.round(h.y - h.r * 0.5), Math.round(h.r * 2), Math.round(h.r));
      ctx.globalAlpha = 1;
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

  private markPlayerKnock(dx: number, dy: number, dur: number) {
    const m = Math.hypot(dx, dy) || 1;
    this.player.knockX = dx / m;
    this.player.knockY = dy / m;
    this.player.knockT = Math.max(this.player.knockT, dur);
    this.spawnKnockDust(this.player.x, this.player.y, this.player.knockX, this.player.knockY, 10);
  }

  private spawnKnockDust(x: number, y: number, dirX: number, dirY: number, n: number) {
    const colors = ["#ecece8", "#c8ccd4", "#6a6d66", "#2a2c28", "#f0d24a"];
    for (let i = 0; i < n; i++) {
      const s = this.allocSpark();
      if (!s) return;
      const spread = (Math.random() - 0.5) * 1.4;
      const ang = Math.atan2(dirY, dirX) + Math.PI + spread;
      const sp = 50 + Math.random() * 160;
      s.alive = true;
      s.x = x + (Math.random() - 0.5) * 12;
      s.y = y + 8 + (Math.random() - 0.5) * 8;
      s.vx = Math.cos(ang) * sp;
      s.vy = Math.sin(ang) * sp;
      s.ttl = 0.18 + Math.random() * 0.22;
      s.max = s.ttl;
      s.size = 2 + Math.floor(Math.random() * 4);
      s.color = colors[Math.floor(Math.random() * colors.length)]!;
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
      if (s.kind !== "shard") s.vy += 40 * dt;
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
    for (const b of this.blasts) {
      if (!b.alive) continue;
      b.t += dt;
      b.x += b.dirX * 90 * dt;
      b.y += b.dirY * 90 * dt;
      if (b.t >= b.life) b.alive = false;
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
    ctx.imageSmoothingEnabled = false;
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
      this.drawHazards();
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
      this.drawBlasts();
      this.drawBossShots();
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
    this.drawKnockSprite(img, this.player.x, this.player.y, s, 0.78, this.player.knockX, this.player.knockY, this.player.knockT, 0.28);
    this.ctx.globalAlpha = 1;
    if (this.spell === "vine") this.drawVineAura(this.player.x, this.player.y);
  }

  private drawEnemy(e: Enemy) {
    if (e.kind === "boss") {
      this.drawBoss(e);
      return;
    }
    const img = this.assets!.wisp[Math.floor(e.frame) % 4]!;
    const s = e.kind === "elite" ? 92 : e.kind === "brute" ? 78 : e.kind === "runner" ? 44 : 56;
    if (e.flash > 0) this.ctx.filter = "brightness(2.4)";
    else if (e.wrapped > 0) this.ctx.filter = "hue-rotate(70deg) saturate(1.4) brightness(0.95)";
    else if (e.stun > 0) this.ctx.filter = "sepia(1) saturate(3) hue-rotate(5deg) brightness(1.25)";
    else if (e.freeze > 0) this.ctx.filter = "hue-rotate(160deg) saturate(0.85) brightness(1.15)";
    else if (e.burn > 0) this.ctx.filter = "sepia(0.6) saturate(2.2) hue-rotate(-10deg)";
    this.drawKnockSprite(img, e.x, e.y, s, 0.72, e.knockX, e.knockY, e.knockT, 0.4);
    this.ctx.filter = "none";
    if (e.wrapped > 0) this.drawVineWrap(e.x, e.y, s * 0.42);
    const barW = s * 0.7;
    this.ctx.fillStyle = "rgba(12,13,12,0.55)";
    this.ctx.fillRect(e.x - barW / 2, e.y - s * 0.78, barW, 3);
    this.ctx.fillStyle = "#ecece8";
    this.ctx.fillRect(e.x - barW / 2, e.y - s * 0.78, barW * clamp(e.hp / e.maxHp, 0, 1), 3);
  }

  private drawBoss(e: Enemy) {
    const def = BOSSES[e.bossId] ?? BOSSES[0]!;
    const ctx = this.ctx;
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    drawBossPixels(ctx, def, e.x, e.y, e.r, e.flash > 0, e.frame, e.lunging);
    if (BOSS_ATTACK[def.name] === "tongue" && e.lunging > 0) {
      const ang = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      ctx.strokeStyle = "#8ed48a";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.x + Math.cos(ang) * 120, e.y + Math.sin(ang) * 120);
      ctx.stroke();
      ctx.strokeStyle = "#d8f5c8";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    if (BOSS_ATTACK[def.name] === "beam" && e.lunging > 0) {
      const ang = Math.atan2(this.player.y - e.y, this.player.x - e.x);
      ctx.strokeStyle = "#f0d24a";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(e.x, e.y);
      ctx.lineTo(e.x + Math.cos(ang) * 220, e.y + Math.sin(ang) * 220);
      ctx.stroke();
    }
    if ((BOSS_ATTACK[def.name] === "nova" || BOSS_ATTACK[def.name] === "pulse" || BOSS_ATTACK[def.name] === "stomp" || BOSS_ATTACK[def.name] === "scream") && e.lunging > 0) {
      ctx.strokeStyle = def.color2;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(e.x, e.y, 40 + (0.4 - e.lunging) * 180, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    if (e.wrapped > 0) this.drawVineWrap(e.x, e.y, e.r * 0.85);
    const barW = e.r * 1.6;
    ctx.fillStyle = "rgba(12,13,12,0.7)";
    ctx.fillRect(Math.round(e.x - barW / 2), Math.round(e.y - e.r - 18), Math.round(barW), 4);
    ctx.fillStyle = def.color2;
    ctx.fillRect(Math.round(e.x - barW / 2), Math.round(e.y - e.r - 18), Math.round(barW * clamp(e.hp / e.maxHp, 0, 1)), 4);
    ctx.fillStyle = def.color2;
    ctx.font = "8px \"Press Start 2P\", monospace";
    ctx.textAlign = "center";
    ctx.fillText(def.name, Math.round(e.x), Math.round(e.y - e.r - 24));
  }

  private drawKnockSprite(
    img: HTMLImageElement,
    x: number,
    y: number,
    s: number,
    anchor: number,
    kx: number,
    ky: number,
    knockT: number,
    maxT: number,
  ) {
    const ctx = this.ctx;
    const k = this.reduced ? 0 : clamp(knockT / maxT, 0, 1);
    const ang = Math.atan2(ky, kx);
    if (k > 0.04) {
      ctx.save();
      ctx.strokeStyle = "rgba(236,236,232,0.35)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        const back = 18 + i * 11 + k * 10;
        const side = (i - 2) * 7;
        const px = -ky * side;
        const py = kx * side;
        ctx.globalAlpha = 0.18 + i * 0.04;
        ctx.beginPath();
        ctx.moveTo(x - kx * back + px, y - ky * back + py);
        ctx.lineTo(x - kx * (back + 16 + k * 12) + px, y - ky * (back + 16 + k * 12) + py);
        ctx.stroke();
      }
      ctx.restore();
      for (let g = 3; g >= 1; g--) {
        const gt = g / 3;
        ctx.save();
        ctx.globalAlpha = 0.12 * k * gt;
        ctx.translate(x - kx * g * 16, y - ky * g * 16);
        ctx.rotate(ang);
        ctx.scale(1 + 0.45 * k, 1 - 0.28 * k);
        ctx.rotate(-ang);
        ctx.drawImage(img, -s / 2, -s * anchor, s, s);
        ctx.restore();
      }
    }
    ctx.save();
    ctx.translate(x, y);
    if (k > 0.04) {
      ctx.rotate(ang);
      ctx.scale(1 + 0.55 * k, 1 - 0.32 * k);
      ctx.rotate(-ang);
    }
    ctx.drawImage(img, -s / 2, -s * anchor, s, s);
    ctx.restore();
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
      this.drawTinted(this.projFrame(), b.x, b.y, 32, 20, ang);
    }
  }

  private projFrame() {
    return this.assets!.projectile[Math.floor(this.animT * 14) % 4]!;
  }

  private impactFrame(t: number) {
    return this.assets!.impact[Math.min(3, Math.max(0, Math.floor(t * 4)))]!;
  }

  private coinFrame() {
    return this.assets!.pickup[Math.floor(this.animT * 8) % 4]!;
  }

  private tintFilter(hex: string) {
    const n = parseInt(hex.slice(1), 16);
    if (!Number.isFinite(n)) return "none";
    const r = ((n >> 16) & 255) / 255;
    const g = ((n >> 8) & 255) / 255;
    const b = (n & 255) / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;
    const d = max - min;
    let h = 48;
    let s = 0;
    if (d > 0.001) {
      s = d / (1 - Math.abs(2 * l - 1) || 1);
      if (max === r) h = 60 * (((g - b) / d) % 6);
      else if (max === g) h = 60 * ((b - r) / d + 2);
      else h = 60 * ((r - g) / d + 4);
      if (h < 0) h += 360;
    }
    const sat = Math.max(0.45, Math.min(2.1, 0.55 + s * 1.3));
    const bri = Math.max(0.5, Math.min(1.4, 0.5 + l * 1.15));
    return `hue-rotate(${Math.round(h - 48)}deg) saturate(${sat}) brightness(${bri})`;
  }

  private drawTinted(img: HTMLImageElement, x: number, y: number, w: number, h: number, ang = 0, color?: string) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.imageSmoothingEnabled = false;
    if (color) ctx.filter = this.tintFilter(color);
    ctx.drawImage(img, -w / 2, -h / 2, w, h);
    ctx.restore();
  }

  private drawGlow(x: number, y: number, r: number, color: string) {
    const ctx = this.ctx;
    ctx.save();
    const g = ctx.createRadialGradient(x, y, r * 0.12, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(0.45, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawVoidOrb(b: Bullet) {
    const spin = b.ang * 2.4;
    const r = 70 + Math.sin(this.animT * 14) * 5;
    this.drawGlow(b.x, b.y, r, "#4a2068");
    this.drawTinted(this.impactFrame(this.animT), b.x, b.y, r * 1.1, r * 1.1, spin, "#7a48b8");
    this.drawTinted(this.projFrame(), b.x, b.y, 48, 28, spin + 0.6, "#d8c4f0");
  }

  private drawEmberOrb(b: Bullet) {
    const ang = Math.atan2(b.vy, b.vx);
    this.drawGlow(b.x, b.y, 28, "#e08a3c");
    this.drawTinted(this.impactFrame(this.animT), b.x, b.y, 34, 34, ang, "#c45a48");
    this.drawTinted(this.projFrame(), b.x, b.y, 40, 24, ang, "#f0d24a");
  }

  private drawCraftBolt(b: Bullet) {
    const ang = Math.atan2(b.dirY || b.vy, b.dirX || b.vx);
    const name = this.crafted?.name ?? "Rune";
    this.drawGlow(b.x, b.y, Math.max(12, b.r), b.color);
    drawCraftSigil(this.ctx, name, b.color, b.x, b.y, ang, this.animT + b.dist * 0.01, b.ability);
  }

  private drawLightning(x: number, y: number, dx: number, dy: number) {
    const ang = Math.atan2(dy, dx);
    this.drawTinted(this.projFrame(), x, y, 64, 24, ang, "#f0d24a");
    this.drawTinted(this.impactFrame(this.animT), x, y, 22, 22, ang + this.animT, "#ffe27a");
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

  private drawBlasts() {
    for (const b of this.blasts) {
      if (!b.alive) continue;
      this.drawBoomBurst(b.x, b.y, 48 + (b.t / b.life) * 170, b.dirX, b.dirY, b.t / b.life);
    }
  }

  private drawBoomBurst(x: number, y: number, radius: number, dirX = 1, dirY = 0, k = 0.5) {
    const ctx = this.ctx;
    const ang = Math.atan2(dirY, dirX);
    const fade = 1 - k;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(ang);
    ctx.globalAlpha = fade;
    const boom = this.assets!.impact[Math.min(3, Math.floor(k * 4))]!;
    const s = radius * 1.15;
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(boom, -s / 2, -s / 2, s, s);
    ctx.drawImage(this.projFrame(), -s * 0.2, -10, s * 0.7, 20);
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  private drawVineBolt(x: number, y: number, ang: number) {
    this.drawTinted(this.projFrame(), x, y, 36, 20, ang, "#6fbf6a");
    this.drawTinted(this.impactFrame(this.animT), x, y, 18, 18, ang, "#3d7a45");
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
    const pulse = 72 + Math.sin(this.animT * 3) * 4;
    ctx.save();
    ctx.strokeStyle = "rgba(111,191,106,0.35)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y + 8, pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  private drawIceBolt(x: number, y: number, ang: number) {
    this.drawGlow(x, y, 14, "#9ad8ea");
    this.drawTinted(this.projFrame(), x, y, 36, 18, ang, "#9ad8ea");
  }

  private drawFx() {
    const ctx = this.ctx;
    for (const a of this.arcs) {
      if (!a.alive) continue;
      const k = clamp(a.ttl / a.max, 0, 1);
      this.ctx.globalAlpha = 0.35 + k * 0.5;
      this.drawTinted(this.impactFrame(1 - k), a.x, a.y, a.r * 2, a.r * 2, this.animT, "#f0d24a");
      this.ctx.globalAlpha = 1;
    }
    for (const s of this.sparks) {
      if (!s.alive) continue;
      ctx.globalAlpha = clamp(s.ttl / s.max, 0, 1);
      if (s.kind === "flake") this.drawSnowflake(s.x, s.y, s.size, s.ttl * 8, s.color);
      else if (s.kind === "coin") this.drawCoin(s.x, s.y, s.size, s.color);
      else if (s.kind === "shard") {
        this.drawTinted(this.projFrame(), s.x, s.y, s.size * 4, s.size * 1.6, Math.atan2(s.vy, s.vx), s.color);
      } else {
        this.drawTinted(this.impactFrame(this.animT), s.x, s.y, s.size * 2.4, s.size * 2.4, 0, s.color);
      }
      ctx.globalAlpha = 1;
    }
    for (const b of this.bursts) {
      if (!b.alive) continue;
      ctx.globalAlpha = 1 - b.t / 0.28;
      const hit = 42 + b.t * 70;
      const tint =
        b.spell === "frost" ? "#9ad8ea" : b.spell === "bolt" ? "#f0d24a" : b.spell === "vine" ? "#6fbf6a" : b.spell === "void" ? "#9a7ab8" : undefined;
      this.drawTinted(this.impactFrame(b.t * 8), b.x, b.y, hit, hit, b.t * 6, tint);
      if (b.spell === "boom") this.drawBoomBurst(b.x, b.y, 28 + b.t * 140);
      ctx.globalAlpha = 1;
    }
    ctx.font = "8px \"Press Start 2P\", monospace";
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
    this.drawTinted(this.coinFrame(), x, y, Math.max(12, size * 3.2), Math.max(12, size * 3.2), 0, color);
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
      getSpeed: () => Math.hypot(this.player.vx, this.player.vy),
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
