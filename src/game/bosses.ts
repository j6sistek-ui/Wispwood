export type BossMove = "bounce" | "chase" | "swoop" | "charge" | "orbit" | "hop";

export type BossDef = {
  name: string;
  color: string;
  color2: string;
  hp: number;
  r: number;
  speed: number;
  move: BossMove;
  smash: boolean;
  goldMin: number;
  goldMax: number;
  hit: number;
  drop: string;
  sprite: string[];
};

const S = {
  SLIME: [
    "   :::::   ",
    "  ::.::::  ",
    " ::....... ",
    "::.ee.ee.::",
    ":.........:",
    ":.........:",
    " :.......: ",
    "  ::.:::   ",
  ],
  VAMPIRE: [
    "    ##    ",
    "   #::#   ",
    "  #:ee:#  ",
    "  #:..:#  ",
    " ##:xx:## ",
    "###....###",
    "##......##",
    "# ##..## #",
    "  ##  ##  ",
  ],
  GOO: [
    "    ::    ",
    "  ::..::  ",
    " :..ee..: ",
    ":........:",
    ":.:....:.:",
    " :......: ",
    " :.:  :.: ",
    "  :    :  ",
    "  :    :  ",
  ],
  MOTH: [
    "::     ::",
    ".::   ::.",
    "..:.#.:..",
    ".::#e#::.",
    ":::#:#:::",
    ".::.#.::.",
    "..:   :..",
    ".:     :.",
  ],
  SLUG: [
    "          ::",
    "  ::::::::::: ",
    " ::ee............",
    ":................:",
    " ::::::....::::  ",
    "   ::  ::  ::    ",
  ],
  WIGHT: [
    "   ::::   ",
    "  :....:  ",
    " :.ee..e: ",
    " :......: ",
    "  :....:  ",
    "   :##:   ",
    "  :....:  ",
    " :......: ",
    ":........:",
    " :  :  :  ",
  ],
  BEETLE: [
    "  x     x  ",
    " x ::::: x ",
    "x ::...:: x",
    " ::.eee.:: ",
    ":::....::::",
    " ::....::  ",
    " x :...: x ",
    "  x ::: x  ",
  ],
  CROWKING: [
    "     :     ",
    "  : :.: :  ",
    " ::..e..:: ",
    ":...xxx...:",
    " ::.....:  ",
    "  :.:.:.:  ",
    "   :   :   ",
    "  ::   ::  ",
  ],
  TOAD: [
    "  :      :  ",
    " ::::  :::: ",
    ":..ee::ee..:",
    ":..........:",
    " :........: ",
    "  :.:..:.:  ",
    "  ::    ::  ",
  ],
  HUSK: [
    "    xx    ",
    "   x..x   ",
    "  x.ee.x  ",
    "  x....x  ",
    " xx.##.xx ",
    "x..x..x..x",
    " x.x  x.x ",
    "  xx  xx  ",
  ],
  DROWNED: [
    "   :  :   ",
    "  :....:  ",
    " :.ee..:  ",
    " :......: ",
    ":.:.##.:.:",
    " :......: ",
    " :.:  :.: ",
    "  :    :  ",
    "  :    :  ",
  ],
  BRIAR: [
    "  x  :  x ",
    " x :.: x  ",
    "  :.e.:   ",
    " x:.:.:x  ",
    ":.:...:.: ",
    " x :.: x  ",
    "  x : x   ",
    " x  :  x  ",
  ],
  FANG: [
    " e      e ",
    "e.e ## e.e",
    " ..####.. ",
    " .:....:. ",
    " :.xxxx.: ",
    "  :....:  ",
    "  ##  ##  ",
  ],
  SPORE: [
    "   :::::  ",
    " :::::::: ",
    ":::::::::::",
    " :  :  :  ",
    "  :.ee.:  ",
    "  :....:  ",
    "   :..:   ",
    "    ##    ",
    "    ##    ",
  ],
  SILK: [
    "x   :   x",
    " x :.: x ",
    "  :eee:  ",
    " x:...:x ",
    "x  :.:  x",
    "    :    ",
    "   : :   ",
    "  :   :  ",
  ],
  EMBERKIN: [
    "  x  x  x ",
    " x :::: x ",
    "  :.ee.:  ",
    " ::xxxx:: ",
    ":........:",
    " :.xxxx.: ",
    "  :....:  ",
    "   x  x   ",
  ],
  HOLLOW: [
    "  ######  ",
    " #......# ",
    "#..ee....#",
    "#........#",
    "#..####..#",
    " #......# ",
    "  ##  ##  ",
    "  ##  ##  ",
  ],
  NIGHTGOAT: [
    "x        x",
    "xx  ::  xx",
    " x :ee: x ",
    "  :....:  ",
    "  :xxxx:  ",
    " :......: ",
    " :.:  :.: ",
    " ##    ## ",
  ],
  MOONJELLY: [
    "  ::::::: ",
    " :.......:",
    ":..ee.ee.:",
    " :.......:",
    "  :.:.:.: ",
    "  : : : : ",
    " :  :  :  ",
    ":   :   : ",
  ],
  LANTERN: [
    "    ##    ",
    "   #xx#   ",
    "  #.ee.#  ",
    "  #xxxx#  ",
    "   #xx#   ",
    "    ##    ",
    "   :..:   ",
    "  :....:  ",
    "  ######  ",
  ],
} as const;

export const BOSSES: BossDef[] = [
  { name: "SLIME", color: "#3d7a45", color2: "#d8f5c8", hp: 1000, r: 64, speed: 250, move: "bounce", smash: true, goldMin: 280, goldMax: 340, hit: 36, drop: "jelly core", sprite: [...S.SLIME] },
  { name: "VAMPIRE", color: "#4a1018", color2: "#c45a48", hp: 920, r: 48, speed: 175, move: "chase", smash: false, goldMin: 240, goldMax: 420, hit: 28, drop: "crimson fang", sprite: [...S.VAMPIRE] },
  { name: "GOO", color: "#2f5a38", color2: "#8ed48a", hp: 1100, r: 70, speed: 160, move: "bounce", smash: true, goldMin: 200, goldMax: 380, hit: 30, drop: "sticky glob", sprite: [...S.GOO] },
  { name: "MOTH", color: "#3a2a18", color2: "#e8c07a", hp: 780, r: 52, speed: 210, move: "swoop", smash: false, goldMin: 180, goldMax: 360, hit: 22, drop: "moon dust", sprite: [...S.MOTH] },
  { name: "SLUG", color: "#4a3a28", color2: "#c4a070", hp: 1400, r: 72, speed: 70, move: "hop", smash: true, goldMin: 260, goldMax: 400, hit: 40, drop: "acid trail", sprite: [...S.SLUG] },
  { name: "WIGHT", color: "#c8ccd4", color2: "#ecece8", hp: 860, r: 46, speed: 150, move: "chase", smash: false, goldMin: 200, goldMax: 390, hit: 26, drop: "pale cloth", sprite: [...S.WIGHT] },
  { name: "BEETLE", color: "#1e2a18", color2: "#6a8a48", hp: 1200, r: 58, speed: 200, move: "bounce", smash: true, goldMin: 220, goldMax: 370, hit: 32, drop: "shell plate", sprite: [...S.BEETLE] },
  { name: "CROWKING", color: "#161418", color2: "#6a6d66", hp: 840, r: 50, speed: 230, move: "swoop", smash: false, goldMin: 210, goldMax: 410, hit: 24, drop: "black feather", sprite: [...S.CROWKING] },
  { name: "TOAD", color: "#2a4a28", color2: "#7db86a", hp: 980, r: 66, speed: 190, move: "hop", smash: true, goldMin: 190, goldMax: 350, hit: 34, drop: "bog pearl", sprite: [...S.TOAD] },
  { name: "HUSK", color: "#5a4630", color2: "#c4a070", hp: 1300, r: 60, speed: 90, move: "chase", smash: true, goldMin: 250, goldMax: 430, hit: 38, drop: "dry heart", sprite: [...S.HUSK] },
  { name: "DROWNED", color: "#1a3040", color2: "#7ec8e8", hp: 960, r: 56, speed: 140, move: "bounce", smash: true, goldMin: 200, goldMax: 380, hit: 30, drop: "wet coin", sprite: [...S.DROWNED] },
  { name: "BRIAR", color: "#2a1810", color2: "#6fbf6a", hp: 1050, r: 54, speed: 120, move: "chase", smash: true, goldMin: 230, goldMax: 400, hit: 33, drop: "thorn knot", sprite: [...S.BRIAR] },
  { name: "FANG", color: "#3a2010", color2: "#e08a3c", hp: 880, r: 50, speed: 260, move: "charge", smash: true, goldMin: 240, goldMax: 440, hit: 42, drop: "split tooth", sprite: [...S.FANG] },
  { name: "SPORE", color: "#3a3040", color2: "#c5a0d8", hp: 900, r: 58, speed: 170, move: "bounce", smash: false, goldMin: 180, goldMax: 360, hit: 20, drop: "puff cap", sprite: [...S.SPORE] },
  { name: "SILK", color: "#ecece8", color2: "#c8ccd4", hp: 820, r: 48, speed: 160, move: "orbit", smash: false, goldMin: 210, goldMax: 390, hit: 18, drop: "white thread", sprite: [...S.SILK] },
  { name: "EMBERKIN", color: "#5a2010", color2: "#e08a3c", hp: 940, r: 52, speed: 180, move: "chase", smash: true, goldMin: 220, goldMax: 410, hit: 35, drop: "live coal", sprite: [...S.EMBERKIN] },
  { name: "HOLLOW", color: "#2a2c28", color2: "#6a6d66", hp: 1000, r: 62, speed: 130, move: "orbit", smash: true, goldMin: 200, goldMax: 370, hit: 28, drop: "empty mask", sprite: [...S.HOLLOW] },
  { name: "NIGHTGOAT", color: "#1a1410", color2: "#c4a070", hp: 1080, r: 56, speed: 240, move: "charge", smash: true, goldMin: 260, goldMax: 450, hit: 40, drop: "curled horn", sprite: [...S.NIGHTGOAT] },
  { name: "MOONJELLY", color: "#1a2838", color2: "#c5eaf6", hp: 860, r: 68, speed: 150, move: "swoop", smash: false, goldMin: 190, goldMax: 360, hit: 22, drop: "glass bell", sprite: [...S.MOONJELLY] },
  { name: "LANTERN", color: "#3a2a10", color2: "#f0d24a", hp: 1120, r: 54, speed: 165, move: "chase", smash: false, goldMin: 300, goldMax: 500, hit: 26, drop: "stolen light", sprite: [...S.LANTERN] },
];

export function bossForNight(wave: number): BossDef {
  const i = Math.max(0, Math.floor(wave / 5) - 1);
  return BOSSES[i % BOSSES.length]!;
}

export type BossAttack =
  | "slam"
  | "lunge"
  | "drip"
  | "dust"
  | "acid"
  | "blink"
  | "curl"
  | "dive"
  | "tongue"
  | "stomp"
  | "wave"
  | "thorns"
  | "bite"
  | "spores"
  | "web"
  | "nova"
  | "scream"
  | "ram"
  | "pulse"
  | "beam";

export const BOSS_ATTACK: Record<string, BossAttack> = {
  SLIME: "slam",
  VAMPIRE: "lunge",
  GOO: "drip",
  MOTH: "dust",
  SLUG: "acid",
  WIGHT: "blink",
  BEETLE: "curl",
  CROWKING: "dive",
  TOAD: "tongue",
  HUSK: "stomp",
  DROWNED: "wave",
  BRIAR: "thorns",
  FANG: "bite",
  SPORE: "spores",
  SILK: "web",
  EMBERKIN: "nova",
  HOLLOW: "scream",
  NIGHTGOAT: "ram",
  MOONJELLY: "pulse",
  LANTERN: "beam",
};

export function drawBossPixels(
  ctx: CanvasRenderingContext2D,
  def: BossDef,
  x: number,
  y: number,
  r: number,
  flash: boolean,
  t = 0,
  pose = 0,
) {
  const rows = def.sprite;
  const w = Math.max(...rows.map((row) => row.length));
  const h = rows.length;
  const s = Math.max(3, Math.round((r * 2) / Math.max(w, h)));
  const beat = Math.sin(t * 7);
  let sx = 1;
  let sy = 1;
  if (def.name === "SLIME" || def.name === "GOO" || def.name === "TOAD") {
    sx = 1 + beat * 0.14;
    sy = 1 - beat * 0.12;
  } else if (def.name === "MOONJELLY" || def.name === "SPORE") {
    sx = sy = 1 + Math.sin(t * 5) * 0.1;
  } else if (def.name === "EMBERKIN") {
    sx = 1 + Math.abs(beat) * 0.08;
  } else if (def.name === "HUSK") {
    x += Math.sin(t * 14) * 2;
  } else if (def.name === "HOLLOW") {
    x += Math.sin(t * 22) * (0.6 + pose * 4);
  }
  if (pose > 0.04) {
    sx *= 1.18;
    sy *= 0.82;
  }
  const ox0 = Math.round(x - (w * s) / 2);
  const oy0 = Math.round(y - (h * s) * 0.78);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  if (def.name === "WIGHT") ctx.globalAlpha = 0.45 + Math.abs(Math.sin(t * 3)) * 0.55;
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  ctx.translate(-x, -y);
  const flap = (def.name === "MOTH" || def.name === "CROWKING" ? Math.sin(t * 14) : 0) * s;
  const crawl = def.name === "SLUG" ? Math.sin(t * 6) : 0;
  for (let j = 0; j < h; j++) {
    const row = rows[j] ?? "";
    const wave = def.name === "SLUG" ? Math.round(Math.sin(j * 0.8 + t * 8) * s * 0.4) : 0;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i]!;
      if (ch === " ") continue;
      let c = def.color;
      if (ch === ":") c = def.color2;
      else if (ch === "#") c = "#0c0d0c";
      else if (ch === "e") c = "#0c0d0c";
      else if (ch === "x") c = flash ? "#fff4c8" : mixHex(def.color, def.color2);
      else if (ch === ".") c = def.color;
      ctx.fillStyle = flash && ch !== "e" && ch !== "#" ? "#fff4c8" : c;
      if (ch === "e") ctx.fillStyle = "#0c0d0c";
      let px = ox0 + i * s + wave;
      if (flap) px += i < w / 2 ? -flap : flap;
      if (crawl) px += Math.round(crawl * s * 0.2);
      ctx.fillRect(px, oy0 + j * s, s, s);
    }
  }
  if (def.name === "VAMPIRE") {
    ctx.fillStyle = "#1a080c";
    const sway = Math.round(Math.sin(t * 5) * s);
    ctx.fillRect(ox0 - s + sway, oy0 + h * s - s, s * 3, s * 2);
    ctx.fillRect(ox0 + w * s - s * 2 - sway, oy0 + h * s - s, s * 3, s * 2);
  }
  if (def.name === "GOO" || def.name === "DROWNED" || def.name === "SLUG") {
    ctx.fillStyle = def.color2;
    const drip = Math.round((t * 40) % (s * 6));
    ctx.fillRect(Math.round(x) - s, oy0 + h * s + drip, s, s);
    ctx.fillRect(Math.round(x) + s * 2, oy0 + h * s + ((drip + 8) % (s * 6)), s, s);
  }
  if (def.name === "LANTERN") {
    ctx.globalAlpha = 0.35 + Math.abs(Math.sin(t * 6)) * 0.4;
    ctx.fillStyle = "#f0d24a";
    ctx.fillRect(Math.round(x) - s * 3, oy0 - s, s * 6, s);
    ctx.fillRect(Math.round(x) - s, oy0 - s * 2, s * 2, s);
  }
  if (def.name === "EMBERKIN") {
    ctx.fillStyle = "#ffe27a";
    for (let k = 0; k < 4; k++) {
      const a = t * 6 + k * 1.7;
      ctx.fillRect(Math.round(x + Math.cos(a) * r * 0.7) - 2, Math.round(y + Math.sin(a) * r * 0.5) - 2, s, s);
    }
  }
  if (def.name === "SILK") {
    ctx.strokeStyle = def.color2;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x, oy0);
    ctx.lineTo(x + Math.sin(t * 4) * 10, oy0 - s * 4);
    ctx.stroke();
  }
  if (def.name === "FANG" && pose > 0.05) {
    ctx.fillStyle = "#ecece8";
    ctx.fillRect(Math.round(x) - s, oy0 + h * s, s, s * 2);
    ctx.fillRect(Math.round(x) + s, oy0 + h * s, s, s * 2);
  }
  if (def.name === "NIGHTGOAT" && pose > 0.05) {
    ctx.fillStyle = def.color2;
    ctx.fillRect(ox0 - s, oy0 + s * 2, s * 2, s);
    ctx.fillRect(ox0 + w * s - s, oy0 + s * 2, s * 2, s);
  }
  ctx.restore();
}

function mixHex(a: string, b: string) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const m = (x: number, y: number) => ((x + y) >> 1) & 255;
  const r = m((pa >> 16) & 255, (pb >> 16) & 255);
  const g = m((pa >> 8) & 255, (pb >> 8) & 255);
  const bl = m(pa & 255, pb & 255);
  return `#${((r << 16) | (g << 8) | bl).toString(16).padStart(6, "0")}`;
}
