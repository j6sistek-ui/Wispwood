export type RelicMatter =
  | "ink"
  | "salt"
  | "pollen"
  | "marrow"
  | "silt"
  | "gleam"
  | "tar"
  | "moss"
  | "glass"
  | "rust"
  | "brine"
  | "wool";
export type RelicGesture =
  | "needle"
  | "choir"
  | "spiral"
  | "bloom"
  | "latch"
  | "wake"
  | "arc"
  | "rain"
  | "shear"
  | "pulse"
  | "drill"
  | "fold";
export type RelicHeart = "hush" | "keen" | "drift" | "knot" | "wane" | "tide" | "scar" | "veil" | null;
export type RelicKind = "matter" | "gesture" | "heart";
export type RelicRuneId = RelicMatter | RelicGesture | Exclude<RelicHeart, null>;

export type RelicCast = {
  id: string;
  name: string;
  element: RelicMatter;
  fn: RelicGesture;
  trikeee: RelicHeart;
  color: string;
};

export type RelicBolt = {
  alive: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ttl: number;
  max: number;
  r: number;
  dmg: number;
  color: string;
  hi: string;
  matter: RelicMatter;
  gesture: RelicGesture;
  heart: RelicHeart;
  ang: number;
  phase: number;
  hits: number;
  bloomed: boolean;
  latchId: number;
  wake: boolean;
};

export const RELIC_ELEMENTS: RelicMatter[] = [
  "ink",
  "salt",
  "pollen",
  "marrow",
  "silt",
  "gleam",
  "tar",
  "moss",
  "glass",
  "rust",
  "brine",
  "wool",
];
export const RELIC_FUNCTIONS: RelicGesture[] = [
  "needle",
  "choir",
  "spiral",
  "bloom",
  "latch",
  "wake",
  "arc",
  "rain",
  "shear",
  "pulse",
  "drill",
  "fold",
];
export const RELIC_TRIKEEE: Exclude<RelicHeart, null>[] = ["hush", "keen", "drift", "knot", "wane", "tide", "scar", "veil"];

export const ELEMENT_COLOR: Record<RelicMatter, string> = {
  ink: "#5a4a78",
  salt: "#e8e0d0",
  pollen: "#c8d46a",
  marrow: "#d8c4b0",
  silt: "#6a5a40",
  gleam: "#f4f0dc",
  tar: "#2a2418",
  moss: "#4a6a3a",
  glass: "#b8d8e0",
  rust: "#a05838",
  brine: "#6a8aa0",
  wool: "#d8d0c4",
};

export const ELEMENT_HI: Record<RelicMatter, string> = {
  ink: "#c8b4e8",
  salt: "#ffffff",
  pollen: "#f0f4a8",
  marrow: "#fff4e8",
  silt: "#b8a070",
  gleam: "#fffce8",
  tar: "#6a5a40",
  moss: "#b8d890",
  glass: "#ffffff",
  rust: "#e8a070",
  brine: "#d0e8f0",
  wool: "#ffffff",
};

export const ELEMENT_WORD: Record<RelicMatter, string> = {
  ink: "Ink",
  salt: "Salt",
  pollen: "Pollen",
  marrow: "Marrow",
  silt: "Silt",
  gleam: "Gleam",
  tar: "Tar",
  moss: "Moss",
  glass: "Glass",
  rust: "Rust",
  brine: "Brine",
  wool: "Wool",
};

export const FUNCTION_WORD: Record<RelicGesture, string> = {
  needle: "Needle",
  choir: "Choir",
  spiral: "Spiral",
  bloom: "Bloom",
  latch: "Latch",
  wake: "Wake",
  arc: "Arc",
  rain: "Rain",
  shear: "Shear",
  pulse: "Pulse",
  drill: "Drill",
  fold: "Fold",
};

export const TRIKEEE_WORD: Record<Exclude<RelicHeart, null>, string> = {
  hush: "Hush",
  keen: "Keen",
  drift: "Drift",
  knot: "Knot",
  wane: "Wane",
  tide: "Tide",
  scar: "Scar",
  veil: "Veil",
};

export const RUNE_KIND: Record<RelicRuneId, RelicKind> = {
  ink: "matter",
  salt: "matter",
  pollen: "matter",
  marrow: "matter",
  silt: "matter",
  gleam: "matter",
  tar: "matter",
  moss: "matter",
  glass: "matter",
  rust: "matter",
  brine: "matter",
  wool: "matter",
  needle: "gesture",
  choir: "gesture",
  spiral: "gesture",
  bloom: "gesture",
  latch: "gesture",
  wake: "gesture",
  arc: "gesture",
  rain: "gesture",
  shear: "gesture",
  pulse: "gesture",
  drill: "gesture",
  fold: "gesture",
  hush: "heart",
  keen: "heart",
  drift: "heart",
  knot: "heart",
  wane: "heart",
  tide: "heart",
  scar: "heart",
  veil: "heart",
};

export const RUNE_LABEL: Record<RelicRuneId, string> = {
  ...ELEMENT_WORD,
  ...FUNCTION_WORD,
  ...TRIKEEE_WORD,
};

export const RUNE_GLOW: Record<RelicRuneId, string> = {
  ...ELEMENT_COLOR,
  needle: "#d8d4c8",
  choir: "#ece6d8",
  spiral: "#b8a8c8",
  bloom: "#e8d8a0",
  latch: "#a8c0b8",
  wake: "#c8b8a0",
  arc: "#c8b8d8",
  rain: "#a8c8d8",
  shear: "#d8c8b0",
  pulse: "#e8c8c8",
  drill: "#c8c0a8",
  fold: "#a8a0c0",
  hush: "#8aa0b8",
  keen: "#e8c070",
  drift: "#c0b8d0",
  knot: "#8a7060",
  wane: "#b8a8a0",
  tide: "#6a90a8",
  scar: "#a04840",
  veil: "#d8d0e0",
};

export function nameRelicCast(element: RelicMatter, fn: RelicGesture, heart: RelicHeart = null) {
  const extra = heart ? ` ${TRIKEEE_WORD[heart]}` : "";
  return `${FUNCTION_WORD[fn]} ${ELEMENT_WORD[element]}${extra}`;
}

export function forgeRelicCast(element: RelicMatter, fn: RelicGesture, trikeee: RelicHeart = null): RelicCast {
  return {
    id: `${element}-${fn}-${trikeee ?? "x"}-${Math.random().toString(36).slice(2, 6)}`,
    name: nameRelicCast(element, fn, trikeee),
    element,
    fn,
    trikeee,
    color: ELEMENT_COLOR[element],
  };
}

export const emptyRelicWells = (): Array<RelicCast | null> => [null, null, null, null];

export function relicCooldown(fn: RelicGesture) {
  if (fn === "pulse") return 0.95;
  if (fn === "fold") return 0.82;
  if (fn === "bloom" || fn === "spiral") return 0.78;
  if (fn === "rain") return 0.7;
  if (fn === "latch") return 0.64;
  if (fn === "choir") return 0.58;
  if (fn === "drill") return 0.52;
  if (fn === "shear" || fn === "wake") return 0.48;
  if (fn === "arc") return 0.4;
  return 0.36;
}

function matterDmg(m: RelicMatter, heart: RelicHeart) {
  const base =
    m === "marrow"
      ? 16
      : m === "tar"
        ? 14
        : m === "glass"
          ? 13
          : m === "salt"
            ? 12
            : m === "rust"
              ? 12
              : m === "silt"
                ? 11
                : m === "brine"
                  ? 10
                  : m === "ink"
                    ? 9
                    : m === "gleam"
                      ? 8
                      : m === "moss"
                        ? 8
                        : 6;
  return heart === "keen" ? Math.round(base * 1.45) : base;
}

function bolt(
  x: number,
  y: number,
  dx: number,
  dy: number,
  speed: number,
  ttl: number,
  r: number,
  cast: RelicCast,
  extra: Partial<RelicBolt> = {},
): RelicBolt {
  const m = Math.hypot(dx, dy) || 1;
  dx /= m;
  dy /= m;
  if (cast.trikeee === "drift") {
    ttl *= 1.45;
    speed *= 0.88;
  }
  if (cast.trikeee === "wane") {
    r = Math.max(2, r * 0.55);
    speed *= 1.35;
    ttl *= 0.85;
  }
  if (cast.trikeee === "veil") {
    r *= 1.7;
    ttl *= 1.2;
    speed *= 0.82;
  }
  return {
    alive: true,
    x,
    y,
    vx: dx * speed,
    vy: dy * speed,
    ttl,
    max: ttl,
    r,
    dmg: matterDmg(cast.element, cast.trikeee),
    color: ELEMENT_COLOR[cast.element],
    hi: ELEMENT_HI[cast.element],
    matter: cast.element,
    gesture: cast.fn,
    heart: cast.trikeee,
    ang: Math.atan2(dy, dx),
    phase: 0,
    hits: 0,
    bloomed: false,
    latchId: -1,
    wake: false,
    ...extra,
  };
}

export function spawnRelicBolts(
  px: number,
  py: number,
  aimX: number,
  aimY: number,
  cast: RelicCast,
  t: number,
): RelicBolt[] {
  const out: RelicBolt[] = [];
  const m = Math.hypot(aimX, aimY) || 1;
  const dx = aimX / m;
  const dy = aimY / m;
  const ox = px + dx * 22;
  const oy = py + dy * 18;
  const pxn = -dy;
  const pyn = dx;
  const g = cast.fn;
  if (g === "choir") {
    for (const a of [-0.38, -0.18, 0, 0.18, 0.38]) {
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      out.push(bolt(ox, oy, dx * ca - dy * sa, dx * sa + dy * ca, 520, 0.7, 5, cast));
    }
  } else if (g === "spiral") {
    for (let i = 0; i < 3; i++) {
      const a = t * 2 + (i / 3) * Math.PI * 2;
      out.push(bolt(px, py, Math.cos(a), Math.sin(a), 40, 1.6, 7, cast, { ang: a, phase: -0.45 }));
    }
  } else if (g === "bloom") {
    out.push(bolt(ox, oy, dx, dy, 280, 0.85, 10, cast));
  } else if (g === "latch") {
    out.push(bolt(ox, oy, dx, dy, 340, 1.4, 8, cast));
  } else if (g === "wake") {
    out.push(bolt(ox, oy, dx, dy, 480, 0.7, 6, cast, { wake: true }));
  } else if (g === "arc") {
    out.push(bolt(ox, oy, dx, dy, 500, 0.85, 5, cast, { ang: 5.2 }));
  } else if (g === "rain") {
    for (let i = -2; i <= 2; i++) {
      const sx = px + dx * 160 + pxn * i * 18;
      const sy = py + dy * 160 + pyn * i * 18 - 90;
      out.push(bolt(sx, sy, 0.05, 1, 420, 0.9, 5, cast));
    }
  } else if (g === "shear") {
    out.push(bolt(ox + pxn * 12, oy + pyn * 12, dx, dy, 600, 0.62, 4, cast));
    out.push(bolt(ox - pxn * 12, oy - pyn * 12, dx, dy, 600, 0.62, 4, cast));
  } else if (g === "pulse") {
    out.push(bolt(ox, oy, 0, 0, 0, 0.55, 8, cast));
  } else if (g === "drill") {
    out.push(bolt(ox, oy, dx, dy, 280, 0.8, 6, cast));
  } else if (g === "fold") {
    out.push(bolt(ox, oy, dx, dy, 200, 0.9, 7, cast));
  } else {
    out.push(bolt(ox, oy, dx, dy, 640, 0.72, 4, cast));
  }
  return out;
}

export function bloomShards(b: RelicBolt): RelicBolt[] {
  const dummy: RelicCast = {
    id: "b",
    name: "",
    element: b.matter,
    fn: "needle",
    trikeee: b.heart,
    color: b.color,
  };
  const shards: RelicBolt[] = [];
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + b.ang;
    shards.push(bolt(b.x, b.y, Math.cos(a), Math.sin(a), 420, 0.38, 4, dummy));
  }
  return shards;
}
