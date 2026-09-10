import { drawPixelGlyph } from "./craft-sprites";

export type FusionDef = {
  name: string;
  color: string;
  color2: string;
  blurb: string;
  damage: number;
  cooldown: number;
  glyph: string[];
};

const g = (rows: string[]) => rows;

export const FUSIONS: Record<string, FusionDef> = {
  "ember+frost": {
    name: "Steamwyrm",
    color: "#f0b8c8",
    color2: "#9ad8ea",
    blurb: "A steaming serpent that burns and chills",
    damage: 30,
    cooldown: 0.55,
    glyph: g([
      "....+....",
      "...o#o...",
      "..#o.o#..",
      ".#o.+.o#.",
      "#o..+..o#",
      ".#o...o#.",
      "..#o.o#..",
      "...o#o...",
      "....#....",
    ]),
  },
  "bolt+ember": {
    name: "Sunlance",
    color: "#ff9a3c",
    color2: "#ffe27a",
    blurb: "Dashes in scorching bolts of daylight",
    damage: 36,
    cooldown: 0.72,
    glyph: g([
      "....+....",
      "...#+#...",
      "..#o+o#..",
      ".##o+o##.",
      "#o++o++o#",
      ".##o+o##.",
      "..#o+o#..",
      "...#+#...",
      "....#....",
    ]),
  },
  "ember+void": {
    name: "Cinderhalo",
    color: "#a85a38",
    color2: "#7a48b8",
    blurb: "Ash motes ring you, then snap inward",
    damage: 20,
    cooldown: 1.15,
    glyph: g([
      "..o#+#o..",
      ".#o...o#.",
      "o#.....#o",
      "#...+...#",
      "+...o...+",
      "#...+...#",
      "o#.....#o",
      ".#o...o#.",
      "..o#+#o..",
    ]),
  },
  "ember+vine": {
    name: "Briarflare",
    color: "#c45a48",
    color2: "#6fbf6a",
    blurb: "A burning seed that lashes fire-vines",
    damage: 32,
    cooldown: 0.68,
    glyph: g([
      "....#....",
      "...#o#...",
      "..#o+o#..",
      ".#o#.#o#.",
      "#o#.+.#o#",
      ".#o#.#o#.",
      "..##o##..",
      "...#o#...",
      "....#....",
    ]),
  },
  "boom+ember": {
    name: "Starfall",
    color: "#ff5a2a",
    color2: "#f0d24a",
    blurb: "A sputtering star that bursts into eight",
    damage: 24,
    cooldown: 0.92,
    glyph: g([
      "+...#...+",
      ".#..o..#.",
      "..#o+o#..",
      "...o#o...",
      "#++#o#++#",
      "...o#o...",
      "..#o+o#..",
      ".#..o..#.",
      "+...#...+",
    ]),
  },
  "bolt+frost": {
    name: "Glassarc",
    color: "#eaf8fd",
    color2: "#f0d24a",
    blurb: "A crescent of frozen lightning",
    damage: 28,
    cooldown: 0.52,
    glyph: g([
      "..+++++..",
      ".#o+++o#.",
      "#o#...#o#",
      "+#.....#+",
      "+.......+",
      "#o.....o#",
      ".#o...o#.",
      "..#o.o#..",
      "...#+#...",
    ]),
  },
  "frost+void": {
    name: "Blackice",
    color: "#6a70c8",
    color2: "#c5eaf6",
    blurb: "A disk of rime that grows, then swallows",
    damage: 22,
    cooldown: 1.28,
    glyph: g([
      "...###...",
      "..#o+o#..",
      ".#o.#.o#.",
      "#o..+..o#",
      "#+.o#o.+#",
      "#o..+..o#",
      ".#o.#.o#.",
      "..#o+o#..",
      "...###...",
    ]),
  },
  "frost+vine": {
    name: "Rimecage",
    color: "#9ad8c8",
    color2: "#eaf8fd",
    blurb: "Locks a foe in a cage of ice roots",
    damage: 26,
    cooldown: 0.74,
    glyph: g([
      "#.+.#.+.#",
      ".#o#o#o#.",
      "+#o.+.o#+",
      ".#.....#.",
      "#+..+..+#",
      ".#.....#.",
      "+#o.+.o#+",
      ".#o#o#o#.",
      "#.+.#.+.#",
    ]),
  },
  "boom+frost": {
    name: "Glacier",
    color: "#d8f0f8",
    color2: "#8aa0b8",
    blurb: "Hurl a berg that shatters into a freeze cone",
    damage: 58,
    cooldown: 0.88,
    glyph: g([
      "....#....",
      "...#o#...",
      "..#o+o#..",
      ".#oo+oo#.",
      "#o+o#o+o#",
      ".##o#o##.",
      "..#####..",
      "...###...",
      "....#....",
    ]),
  },
  "bolt+void": {
    name: "Needlewell",
    color: "#c8a4ff",
    color2: "#f0d24a",
    blurb: "A hole blinks ahead, then spokes of lightning",
    damage: 18,
    cooldown: 1.02,
    glyph: g([
      "....+....",
      "...#+#...",
      "..#o.o#..",
      ".#o...o#.",
      "+#..o..#+",
      ".#o...o#.",
      "..#o.o#..",
      "...#+#...",
      "....+....",
    ]),
  },
  "bolt+vine": {
    name: "Livewire",
    color: "#b6e070",
    color2: "#ffe27a",
    blurb: "A crackling vine that leaps foe to foe",
    damage: 24,
    cooldown: 0.8,
    glyph: g([
      "....+....",
      "...#+#...",
      "#..#o#..#",
      ".#o#+#o#.",
      "..+o#o+..",
      ".#o#+#o#.",
      "#..#o#..#",
      "...#+#...",
      "....+....",
    ]),
  },
  "bolt+boom": {
    name: "Skyhammer",
    color: "#ffbf3a",
    color2: "#fff4c8",
    blurb: "Marks a spot, then the sky slams it",
    damage: 72,
    cooldown: 1.22,
    glyph: g([
      "....+....",
      "...#+#...",
      "..##+##..",
      ".#o#+#o#.",
      "#oo#+#oo#",
      "..#####..",
      "...#o#...",
      "...#o#...",
      "...###...",
    ]),
  },
  "vine+void": {
    name: "Hungerbloom",
    color: "#3d7a6a",
    color2: "#7a48b8",
    blurb: "A dark flower that lunges and swallows",
    damage: 50,
    cooldown: 1.05,
    glyph: g([
      "..o#+#o..",
      ".#o#+#o#.",
      "o#..+..#o",
      "#...o...#",
      "+++#o#+++",
      "#...o...#",
      "o#..+..#o",
      ".#o...o#.",
      "..o###o..",
    ]),
  },
  "boom+void": {
    name: "Eventide",
    color: "#4a2068",
    color2: "#c45a48",
    blurb: "A growing marble that implodes the grove",
    damage: 84,
    cooldown: 1.38,
    glyph: g([
      "....o....",
      "..o#+#o..",
      ".#o#.#o#.",
      ".#..+..#.",
      "o#++o++#o",
      ".#..+..#.",
      ".#o#.#o#.",
      "..o#+#o..",
      "....o....",
    ]),
  },
  "boom+vine": {
    name: "Podburst",
    color: "#8fd46a",
    color2: "#ff9a3c",
    blurb: "A hopping pod that blooms on every bounce",
    damage: 34,
    cooldown: 0.78,
    glyph: g([
      "....#....",
      "...#o#...",
      "..#o+o#..",
      ".#o#+#o#.",
      "#o##+##o#",
      ".#oo+oo#.",
      "..#o#o#..",
      "...o#o...",
      "....+....",
    ]),
  },
};

export function fusionGlyph(key: string): string[] {
  return FUSIONS[key]?.glyph ?? FUSIONS["ember+frost"]!.glyph;
}

export function drawFusionSigil(
  ctx: CanvasRenderingContext2D,
  key: string,
  x: number,
  y: number,
  ang: number,
  t: number,
  scale: number,
) {
  const def = FUSIONS[key] ?? FUSIONS["ember+frost"]!;
  const glyph = def.glyph;
  let rot = ang;
  let sx = scale;
  let sy = scale;
  let pixel = Math.max(2, 3.2 * scale);
  if (key === "ember+frost") {
    rot += Math.sin(t * 9) * 0.4;
    sx = sy = scale * (1.15 + Math.sin(t * 12) * 0.12);
  } else if (key === "bolt+ember") {
    sx = scale * (1.9 + Math.sin(t * 28) * 0.35);
    sy = scale * 0.7;
    rot = ang;
  } else if (key === "ember+void") {
    rot = t * 7;
    sx = sy = scale * (1.1 + Math.sin(t * 8) * 0.2);
  } else if (key === "ember+vine") {
    rot += Math.sin(t * 11) * 0.55;
    sy = scale * (1.2 + Math.sin(t * 6) * 0.15);
  } else if (key === "boom+ember") {
    const pulse = 1 + Math.abs(Math.sin(t * 10)) * 0.45;
    sx = sy = scale * pulse;
    rot += t * 4;
  } else if (key === "bolt+frost") {
    rot = ang + Math.sin(t * 14) * 0.2;
    sx = scale * 1.6;
    sy = scale * 0.85;
  } else if (key === "frost+void") {
    rot = t * 3;
    sx = sy = scale * (1.3 + Math.sin(t * 5) * 0.25);
  } else if (key === "frost+vine") {
    rot += t * 5;
    sx = sy = scale * 1.2;
  } else if (key === "boom+frost") {
    rot = ang + t * 6;
    sx = scale * 1.35;
    sy = scale * 1.1;
  } else if (key === "bolt+void") {
    rot = t * 12;
    sx = sy = scale * (0.9 + Math.abs(Math.sin(t * 16)) * 0.5);
  } else if (key === "bolt+vine") {
    rot = ang + Math.sin(t * 18) * 0.4;
    sx = scale * 1.5;
    sy = scale * 0.8;
  } else if (key === "bolt+boom") {
    sx = scale * (1.1 + Math.abs(Math.sin(t * 20)) * 0.6);
    sy = scale * 1.4;
    rot = 0;
  } else if (key === "vine+void") {
    rot = t * 4 + Math.sin(t * 7) * 0.3;
    sx = sy = scale * (1.25 + Math.sin(t * 9) * 0.18);
  } else if (key === "boom+void") {
    rot = -t * 5;
    sx = sy = scale * (1.4 + Math.sin(t * 6) * 0.3);
  } else if (key === "boom+vine") {
    rot = ang + Math.sin(t * 8) * 0.8;
    sy = scale * (1 + Math.abs(Math.sin(t * 14)) * 0.35);
  }
  drawPixelGlyph(ctx, glyph, def.color, x, y, rot, sx, sy, pixel);
  if (key === "ember+frost" || key === "frost+void" || key === "boom+void") {
    ctx.save();
    ctx.globalAlpha = 0.45;
    drawPixelGlyph(ctx, glyph, def.color2, x, y, rot + 0.5, sx * 0.7, sy * 0.7, Math.max(2, pixel * 0.7));
    ctx.restore();
  }
  if (key === "bolt+ember" || key === "bolt+boom" || key === "bolt+void") {
    ctx.save();
    ctx.strokeStyle = def.color2;
    ctx.globalAlpha = 0.7;
    ctx.lineWidth = Math.max(1, scale);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(ang) * 18 * scale, y + Math.sin(ang) * 18 * scale);
    ctx.stroke();
    ctx.restore();
  }
}
