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
};

export const BOSSES: BossDef[] = [
  { name: "SLIME", color: "#3d7a45", color2: "#d8f5c8", hp: 1000, r: 64, speed: 250, move: "bounce", smash: true, goldMin: 280, goldMax: 340, hit: 36, drop: "jelly core" },
  { name: "VAMPIRE", color: "#4a1018", color2: "#c45a48", hp: 920, r: 48, speed: 175, move: "chase", smash: false, goldMin: 240, goldMax: 420, hit: 28, drop: "crimson fang" },
  { name: "GOO", color: "#2f5a38", color2: "#8ed48a", hp: 1100, r: 70, speed: 160, move: "bounce", smash: true, goldMin: 200, goldMax: 380, hit: 30, drop: "sticky glob" },
  { name: "MOTH", color: "#3a2a18", color2: "#e8c07a", hp: 780, r: 52, speed: 210, move: "swoop", smash: false, goldMin: 180, goldMax: 360, hit: 22, drop: "moon dust" },
  { name: "SLUG", color: "#4a3a28", color2: "#c4a070", hp: 1400, r: 72, speed: 70, move: "hop", smash: true, goldMin: 260, goldMax: 400, hit: 40, drop: "acid trail" },
  { name: "WIGHT", color: "#c8ccd4", color2: "#ecece8", hp: 860, r: 46, speed: 150, move: "chase", smash: false, goldMin: 200, goldMax: 390, hit: 26, drop: "pale cloth" },
  { name: "BEETLE", color: "#1e2a18", color2: "#6a8a48", hp: 1200, r: 58, speed: 200, move: "bounce", smash: true, goldMin: 220, goldMax: 370, hit: 32, drop: "shell plate" },
  { name: "CROWKING", color: "#161418", color2: "#6a6d66", hp: 840, r: 50, speed: 230, move: "swoop", smash: false, goldMin: 210, goldMax: 410, hit: 24, drop: "black feather" },
  { name: "TOAD", color: "#2a4a28", color2: "#7db86a", hp: 980, r: 66, speed: 190, move: "hop", smash: true, goldMin: 190, goldMax: 350, hit: 34, drop: "bog pearl" },
  { name: "HUSK", color: "#5a4630", color2: "#c4a070", hp: 1300, r: 60, speed: 90, move: "chase", smash: true, goldMin: 250, goldMax: 430, hit: 38, drop: "dry heart" },
  { name: "DROWNED", color: "#1a3040", color2: "#7ec8e8", hp: 960, r: 56, speed: 140, move: "bounce", smash: true, goldMin: 200, goldMax: 380, hit: 30, drop: "wet coin" },
  { name: "BRIAR", color: "#2a1810", color2: "#6fbf6a", hp: 1050, r: 54, speed: 120, move: "chase", smash: true, goldMin: 230, goldMax: 400, hit: 33, drop: "thorn knot" },
  { name: "FANG", color: "#3a2010", color2: "#e08a3c", hp: 880, r: 50, speed: 260, move: "charge", smash: true, goldMin: 240, goldMax: 440, hit: 42, drop: "split tooth" },
  { name: "SPORE", color: "#3a3040", color2: "#c5a0d8", hp: 900, r: 58, speed: 170, move: "bounce", smash: false, goldMin: 180, goldMax: 360, hit: 20, drop: "puff cap" },
  { name: "SILK", color: "#ecece8", color2: "#c8ccd4", hp: 820, r: 48, speed: 160, move: "orbit", smash: false, goldMin: 210, goldMax: 390, hit: 18, drop: "white thread" },
  { name: "EMBERKIN", color: "#5a2010", color2: "#e08a3c", hp: 940, r: 52, speed: 180, move: "chase", smash: true, goldMin: 220, goldMax: 410, hit: 35, drop: "live coal" },
  { name: "HOLLOW", color: "#2a2c28", color2: "#6a6d66", hp: 1000, r: 62, speed: 130, move: "orbit", smash: true, goldMin: 200, goldMax: 370, hit: 28, drop: "empty mask" },
  { name: "NIGHTGOAT", color: "#1a1410", color2: "#c4a070", hp: 1080, r: 56, speed: 240, move: "charge", smash: true, goldMin: 260, goldMax: 450, hit: 40, drop: "curled horn" },
  { name: "MOONJELLY", color: "#1a2838", color2: "#c5eaf6", hp: 860, r: 68, speed: 150, move: "swoop", smash: false, goldMin: 190, goldMax: 360, hit: 22, drop: "glass bell" },
  { name: "LANTERN", color: "#3a2a10", color2: "#f0d24a", hp: 1120, r: 54, speed: 165, move: "chase", smash: false, goldMin: 300, goldMax: 500, hit: 26, drop: "stolen light" },
];

export function bossForNight(wave: number): BossDef {
  const i = Math.max(0, Math.floor(wave / 5) - 1);
  return BOSSES[i % BOSSES.length]!;
}
