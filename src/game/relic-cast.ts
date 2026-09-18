export type RelicMatter = "ink" | "salt" | "pollen" | "marrow" | "silt" | "gleam";
export type RelicGesture = "needle" | "choir" | "spiral" | "bloom" | "latch" | "wake";
export type RelicHeart = "hush" | "keen" | "drift" | "knot" | null;
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

export const RELIC_ELEMENTS: RelicMatter[] = ["ink", "salt", "pollen", "marrow", "silt", "gleam"];
export const RELIC_FUNCTIONS: RelicGesture[] = ["needle", "choir", "spiral", "bloom", "latch", "wake"];
export const RELIC_TRIKEEE: Exclude<RelicHeart, null>[] = ["hush", "keen", "drift", "knot"];

export const ELEMENT_COLOR: Record<RelicMatter, string> = {
  ink: "#5a4a78",
  salt: "#e8e0d0",
  pollen: "#c8d46a",
  marrow: "#d8c4b0",
  silt: "#6a5a40",
  gleam: "#f4f0dc",
};

export const ELEMENT_HI: Record<RelicMatter, string> = {
  ink: "#c8b4e8",
  salt: "#ffffff",
  pollen: "#f0f4a8",
  marrow: "#fff4e8",
  silt: "#b8a070",
  gleam: "#fffce8",
};

export const ELEMENT_WORD: Record<RelicMatter, string> = {
  ink: "Ink",
  salt: "Salt",
  pollen: "Pollen",
  marrow: "Marrow",
  silt: "Silt",
  gleam: "Gleam",
};

export const FUNCTION_WORD: Record<RelicGesture, string> = {
  needle: "Needle",
  choir: "Choir",
  spiral: "Spiral",
  bloom: "Bloom",
  latch: "Latch",
  wake: "Wake",
};

export const TRIKEEE_WORD: Record<Exclude<RelicHeart, null>, string> = {
  hush: "Hush",
  keen: "Keen",
  drift: "Drift",
  knot: "Knot",
};

export const RUNE_KIND: Record<RelicRuneId, RelicKind> = {
  ink: "matter",
  salt: "matter",
  pollen: "matter",
  marrow: "matter",
  silt: "matter",
  gleam: "matter",
  needle: "gesture",
  choir: "gesture",
  spiral: "gesture",
  bloom: "gesture",
  latch: "gesture",
  wake: "gesture",
  hush: "heart",
  keen: "heart",
  drift: "heart",
  knot: "heart",
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
  hush: "#8aa0b8",
  keen: "#e8c070",
  drift: "#c0b8d0",
  knot: "#8a7060",
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
  if (fn === "bloom") return 0.72;
  if (fn === "spiral") return 0.85;
  if (fn === "choir") return 0.58;
  if (fn === "latch") return 0.64;
  if (fn === "wake") return 0.5;
  return 0.36;
}

function matterDmg(m: RelicMatter, heart: RelicHeart) {
  const base = m === "marrow" ? 16 : m === "salt" ? 12 : m === "silt" ? 11 : m === "ink" ? 9 : m === "gleam" ? 8 : 7;
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
  const g = cast.fn;
  if (g === "choir") {
    for (const a of [-0.38, -0.18, 0, 0.18, 0.38]) {
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      const x = dx * ca - dy * sa;
      const y = dx * sa + dy * ca;
      out.push(bolt(ox, oy, x, y, 520, 0.7, 5, cast));
    }
  } else if (g === "spiral") {
    for (let i = 0; i < 3; i++) {
      const a = t * 2 + (i / 3) * Math.PI * 2;
      out.push(
        bolt(px, py, Math.cos(a), Math.sin(a), 40, 1.6, 7, cast, {
          ang: a,
          phase: -0.45,
        }),
      );
    }
  } else if (g === "bloom") {
    out.push(bolt(ox, oy, dx, dy, 280, 0.85, 10, cast));
  } else if (g === "latch") {
    out.push(bolt(ox, oy, dx, dy, 340, 1.4, 8, cast));
  } else if (g === "wake") {
    out.push(bolt(ox, oy, dx, dy, 480, 0.7, 6, cast, { wake: true }));
  } else {
    out.push(bolt(ox, oy, dx, dy, 640, 0.72, 4, cast));
  }
  return out;
}

export function bloomShards(b: RelicBolt): RelicBolt[] {
  const shards: RelicBolt[] = [];
  const dummy: RelicCast = {
    id: "b",
    name: "",
    element: b.matter,
    fn: "needle",
    trikeee: b.heart,
    color: b.color,
  };
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + b.ang;
    shards.push(bolt(b.x, b.y, Math.cos(a), Math.sin(a), 420, 0.38, 4, dummy));
  }
  return shards;
}
