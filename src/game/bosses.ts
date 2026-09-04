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

export function drawBossPixels(
  ctx: CanvasRenderingContext2D,
  def: BossDef,
  x: number,
  y: number,
  r: number,
  flash: boolean,
) {
  const rows = def.sprite;
  const w = Math.max(...rows.map((row) => row.length));
  const h = rows.length;
  const s = Math.max(3, Math.round((r * 2) / Math.max(w, h)));
  const ox = Math.round(x - (w * s) / 2);
  const oy = Math.round(y - (h * s) * 0.78);
  ctx.imageSmoothingEnabled = false;
  for (let j = 0; j < h; j++) {
    const row = rows[j] ?? "";
    for (let i = 0; i < row.length; i++) {
      const ch = row[i]!;
      if (ch === " ") continue;
      let c = def.color;
      if (ch === ":") c = def.color2;
      else if (ch === "#") c = "#0c0d0c";
      else if (ch === "e") c = "#0c0d0c";
      else if (ch === "o") c = "#ecece8";
      else if (ch === "x") c = flash ? "#fff4c8" : mixHex(def.color, def.color2);
      else if (ch === ".") c = def.color;
      ctx.fillStyle = flash ? "#fff4c8" : c;
      if (ch === "e") ctx.fillStyle = "#0c0d0c";
      if (ch === ":" && flash) ctx.fillStyle = "#ffffff";
      ctx.fillRect(ox + i * s, oy + j * s, s, s);
    }
  }
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
