import type { CraftAbility } from "./engine";

const LIGHT: Record<string, string> = {
  "#c45a48": "#f0a090",
  "#e08a3c": "#f0c878",
  "#f0d24a": "#fff4c8",
  "#7db86a": "#c0e8a8",
  "#4aa88a": "#9ad8c0",
  "#9ad8ea": "#eaf8fd",
  "#6a8ec8": "#b8d0f0",
  "#9a7ab8": "#d0b8e8",
  "#d48aa8": "#f0c8d8",
  "#ecece8": "#ffffff",
  "#3a3c3a": "#8a8c88",
};

export const ABILITY_LINE: Record<CraftAbility, string> = {
  pierce: "cuts through foes",
  split: "splits on hit",
  bounce: "rebounds off bodies",
  chain: "leaps to the next",
  explode: "bursts on contact",
  orbit: "circles the keeper",
  rain: "falls from the canopy",
  pull: "drags foes inward",
  leech: "feeds the lantern",
  trail: "leaves a burning wake",
  grow: "swells as it flies",
  freeze: "locks them in rime",
  shock: "stuns on impact",
  ricochet: "kicks off the trees",
  spore: "sows a lingering patch",
  hook: "yanks one close",
  bloom: "detonates at the end",
  curse: "burns and chills",
  tide: "knocks them back",
  trap: "binds in vines",
  seek: "hunts the nearest",
  pulse: "throbs with harm",
  dash: "hurls you with it",
  magnet: "curves into packs",
  ignite: "sets a long burn",
  mist: "chills a whole ring",
  thorn: "wraps on contact",
  grav: "pulls the clearing",
  shatter: "breaks into shards",
  fork: "splits as it leaves",
  veil: "a brief ward",
  howl: "stuns the grove",
};

export function glyphFor(name: string): string[] {
  const h = [...name].reduce((a, c) => (a * 33 + c.charCodeAt(0)) | 0, 7);
  const g = Array.from({ length: 8 }, () => Array(8).fill("."));
  const put = (x: number, y: number, ch = "#") => {
    if (x >= 0 && x < 8 && y >= 0 && y < 8) g[y]![x] = ch;
  };
  const style = Math.abs(h) % 16;
  if (style === 0) {
    for (let i = 0; i < 7; i++) put(3, i);
    put(2, 1);
    put(4, 1);
    put(1, 2);
    put(5, 2);
    put(3, 0, "o");
  } else if (style === 1) {
    put(3, 0);
    put(2, 1);
    put(4, 1);
    put(1, 2);
    put(5, 2);
    put(1, 3);
    put(5, 3);
    put(2, 4);
    put(4, 4);
    put(3, 5, "o");
  } else if (style === 2) {
    for (let i = 1; i < 7; i++) put(i, 3);
    for (let i = 1; i < 7; i++) put(3, i);
    put(3, 3, "o");
  } else if (style === 3) {
    for (let i = 0; i < 8; i++) {
      put(i, i);
      put(7 - i, i);
    }
    put(3, 3, "o");
    put(4, 4, "o");
  } else if (style === 4) {
    for (let a = 0; a < 8; a++) {
      const ang = (a / 8) * Math.PI * 2;
      put(4 + Math.round(Math.cos(ang) * 3), 4 + Math.round(Math.sin(ang) * 3));
    }
    put(3, 3, "o");
  } else if (style === 5) {
    put(1, 2);
    put(2, 1);
    put(3, 1);
    put(4, 2);
    put(5, 3);
    put(5, 4);
    put(4, 5);
    put(2, 5);
    put(1, 4);
    put(3, 3, "o");
  } else if (style === 6) {
    put(3, 1);
    put(2, 2);
    put(4, 2);
    put(1, 3);
    put(5, 3);
    put(2, 4);
    put(4, 4);
    put(3, 5);
    put(0, 3);
    put(6, 3);
  } else if (style === 7) {
    put(1, 1);
    put(2, 2);
    put(3, 3);
    put(4, 2);
    put(5, 1);
    put(3, 4);
    put(3, 5);
    put(2, 6);
    put(4, 6);
    put(3, 3, "o");
  } else if (style === 8) {
    put(0, 3);
    put(1, 2);
    put(2, 1);
    put(3, 2);
    put(4, 3);
    put(5, 4);
    put(6, 5);
    put(4, 1);
    put(5, 2);
    put(6, 2, "o");
  } else if (style === 9) {
    put(2, 2);
    put(1, 3);
    put(2, 4);
    put(3, 3);
    put(4, 3);
    put(5, 2);
    put(6, 3);
    put(5, 4);
    put(3, 1, "o");
    put(4, 5);
  } else if (style === 10) {
    put(3, 0);
    put(3, 1);
    put(2, 2);
    put(4, 2);
    put(2, 3);
    put(4, 3);
    put(1, 4);
    put(5, 4);
    put(3, 5, "o");
  } else if (style === 11) {
    put(3, 1);
    put(2, 2);
    put(4, 2);
    put(1, 3);
    put(5, 3);
    put(2, 4);
    put(4, 4);
    put(3, 3, "+");
    put(3, 5);
  } else if (style === 12) {
    put(3, 0);
    put(3, 1);
    put(3, 2);
    put(1, 3);
    put(3, 3);
    put(5, 3);
    put(0, 4);
    put(3, 4);
    put(6, 4);
    put(3, 5, "o");
  } else if (style === 13) {
    put(6, 1, "o");
    put(5, 2);
    put(4, 3);
    put(3, 4);
    put(2, 5);
    put(5, 1);
    put(4, 2);
    put(1, 6);
    put(2, 6);
  } else if (style === 14) {
    put(2, 1);
    put(3, 1);
    put(4, 1);
    put(1, 2);
    put(5, 2);
    put(1, 3);
    put(5, 3);
    put(2, 4);
    put(4, 4);
    put(3, 5);
    put(3, 3, "o");
  } else {
    put(3, 3, "+");
    put(1, 1);
    put(5, 1);
    put(1, 5);
    put(5, 5);
    put(3, 0);
    put(3, 6);
    put(0, 3);
    put(6, 3);
  }
  for (let k = 0; k < 7; k++) {
    const x = Math.abs((h >> k) + name.length * k) % 8;
    const y = Math.abs((h >> (k + 2)) + k * 3) % 8;
    if (g[y]![x] === ".") put(x, y, k % 2 ? "o" : "#");
  }
  return g.map((r) => r.join(""));
}

export function drawPixelGlyph(
  ctx: CanvasRenderingContext2D,
  rows: string[],
  color: string,
  x: number,
  y: number,
  ang: number,
  sx: number,
  sy: number,
  pixel = 3,
) {
  const hi = LIGHT[color] ?? "#ffffff";
  const dark = shade(color, 0.45);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ang);
  ctx.scale(sx, sy);
  ctx.imageSmoothingEnabled = false;
  const h = rows.length;
  const w = rows[0]!.length;
  const ox = -((w * pixel) / 2);
  const oy = -((h * pixel) / 2);
  for (let gy = 0; gy < h; gy++) {
    const row = rows[gy]!;
    for (let gx = 0; gx < w; gx++) {
      const ch = row[gx]!;
      if (ch === ".") continue;
      ctx.fillStyle = ch === "+" ? "#ffffff" : ch === "o" ? hi : ch === ":" ? dark : color;
      ctx.fillRect(ox + gx * pixel, oy + gy * pixel, pixel, pixel);
    }
  }
  ctx.restore();
}

export function drawCraftSigil(
  ctx: CanvasRenderingContext2D,
  name: string,
  color: string,
  x: number,
  y: number,
  ang: number,
  t: number,
  ability: CraftAbility,
) {
  let rot = ang;
  let sx = 1;
  let sy = 1;
  if (ability === "orbit") rot += t * 10;
  else if (ability === "seek" || ability === "magnet") sx = sy = 1 + Math.sin(t * 12) * 0.14;
  else if (ability === "pulse") sx = sy = 1 + Math.sin(t * 16) * 0.22;
  else if (ability === "grow") sx = sy = 1.1;
  else if (ability === "bounce") rot += Math.sin(t * 11) * 0.55;
  else if (ability === "rain") rot = 1.15 + Math.sin(t * 4) * 0.1;
  else if (ability === "bloom" || ability === "explode") sx = sy = 1 + Math.abs(Math.sin(t * 7)) * 0.4;
  else if (ability === "pierce") sx = 1.55;
  else if (ability === "shock" || ability === "howl") rot += t * 6;
  else if (ability === "trail" || ability === "ignite") sx = sy = 1 + Math.sin(t * 9) * 0.08;
  else if (ability === "fork" || ability === "split") rot += Math.sin(t * 8) * 0.25;
  else if (ability === "grav" || ability === "pull") rot -= t * 4;
  else if (ability === "veil") sx = sy = 1 + Math.sin(t * 5) * 0.2;
  else if (ability === "dash") sx = 1.4;
  drawPixelGlyph(ctx, glyphFor(name), color, x, y, rot, sx, sy, 3);
}

export const CORE_GLYPHS: Record<string, string[]> = {
  ember: [
    "..oo.....",
    ".#o#o....",
    "#o+o#o...",
    ".#o+o##..",
    "..#o#o#..",
    "...#o#...",
    "....#o...",
    ".....#...",
  ],
  frost: [
    "...+.....",
    "..#o#....",
    ".#.+.#...",
    "#o#+#o#..",
    ".#.+.#...",
    "..#o#....",
    ".#...#...",
    "+.....+..",
  ],
  bolt: [
    "....o#...",
    "...o#....",
    "..#o+....",
    ".#o#.....",
    "..o#o....",
    "...#o#...",
    "....o#...",
    ".....#...",
  ],
  void: [
    "..####...",
    ".#::::#..",
    "#:.oo.:#.",
    "#:o++o:#.",
    "#:.oo.:#.",
    ".#::::#..",
    "..####...",
    ".........",
  ],
  vine: [
    "...#o....",
    "..#o#o...",
    ".#..#....",
    "..#o#....",
    "...#o#...",
    ".#o..#...",
    "#o#......",
    ".##......",
  ],
  boom: [
    "#..+..#..",
    ".#o+o#...",
    "#o#+#+o#.",
    ".+#+#+...",
    "#o#+#+o#.",
    ".#o+o#...",
    "#..+..#..",
    ".........",
  ],
};

export const CORE_COLOR: Record<string, string> = {
  ember: "#e08a3c",
  frost: "#9ad8ea",
  bolt: "#f0d24a",
  void: "#7a48b8",
  vine: "#6fbf6a",
  boom: "#ff9a3c",
};

export function coreGlyph(spell: string): string[] {
  return CORE_GLYPHS[spell] ?? CORE_GLYPHS.ember!;
}

export function drawCoreSigil(
  ctx: CanvasRenderingContext2D,
  spell: string,
  x: number,
  y: number,
  ang: number,
  t: number,
) {
  const rows = coreGlyph(spell);
  const color = CORE_COLOR[spell] ?? "#e08a3c";
  let rot = ang;
  let sx = 1;
  let sy = 1;
  let pixel = 4;
  if (spell === "ember") {
    sx = sy = 1.15 + Math.sin(t * 14) * 0.12;
    rot += Math.sin(t * 9) * 0.15;
  } else if (spell === "frost") {
    rot += t * 4;
    sx = sy = 1.05;
  } else if (spell === "bolt") {
    sx = 1.8;
    sy = 0.85;
    pixel = 3;
  } else if (spell === "void") {
    rot += t * 8;
    sx = sy = 2.2 + Math.sin(t * 10) * 0.12;
    pixel = 5;
  } else if (spell === "vine") {
    rot += Math.sin(t * 10) * 0.45;
    sx = 1.25;
  } else if (spell === "boom") {
    sx = sy = 1.4 + Math.abs(Math.sin(t * 8)) * 0.35;
  }
  drawPixelGlyph(ctx, rows, color, x, y, rot, sx, sy, pixel);
}

function shade(hex: string, k: number) {
  const n = parseInt(hex.slice(1), 16);
  if (!Number.isFinite(n)) return hex;
  const r = Math.round(((n >> 16) & 255) * k);
  const g = Math.round(((n >> 8) & 255) * k);
  const b = Math.round((n & 255) * k);
  return `rgb(${r},${g},${b})`;
}
