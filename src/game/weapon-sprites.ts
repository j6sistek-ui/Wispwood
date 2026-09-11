export const WEAPON_GLYPHS: Record<string, string[]> = {
  "ember-mallet": [
    "................",
    "..........bbb...",
    ".........bbbbb..",
    "hhHHh...bbccbb..",
    "hhHHh...bbbbbb..",
    ".........bbbbb..",
    "..........bbb...",
    "................",
  ],
  "ice-peen": [
    "................",
    ".............c..",
    "...........bbc..",
    "hhHHhhhhhbbbbb..",
    "hhHHhhhhhbbbb...",
    "...........bb...",
    "................",
    "................",
  ],
  "storm-hammer": [
    "................",
    ".........bbbbbb.",
    "........bbccbbb.",
    "hhHHhhh.bbbbbbb.",
    "hhHHhhh.bbbbbb..",
    ".........bbbb...",
    "................",
    "................",
  ],
  "void-maul": [
    "................",
    ".......bbbbbbbb.",
    "......bbbcccbbb.",
    "hhHHh.bbbbbbbbb.",
    "hhHHh.bbbbbbbb..",
    "......bbbbbbb...",
    ".......bbbbb....",
    "................",
  ],
  "thorn-hammer": [
    "................",
    "....b......b.c..",
    "...b.b....b.bb..",
    "hhHHhhhhhbbbbb..",
    "hhHHhhhhhbbbb...",
    "...b.b....bbb...",
    "....b......b....",
    "................",
  ],
  "blast-sledge": [
    "................",
    "......bbbbbbbbb.",
    ".....bbbcccbbbb.",
    "hhHH.bbbbbbbbbb.",
    "hhHH.bbbbbbbbb..",
    ".....bbbbbbbb...",
    "......bbbbbb....",
    "................",
  ],
  "gold-hammer": [
    "................",
    "........cbbbbbc.",
    ".......bbbbbbbb.",
    "hhHHhh.bbcccbb..",
    "hhHHhh.bbbbbbb..",
    ".......bbbbbb...",
    "........bbbb....",
    "................",
  ],
  "night-maul": [
    "................",
    "......bb....bb..",
    ".....bbbbccbbb..",
    "hhHHhbbbbbbbbb..",
    "hhHHhbbbbbbbb...",
    ".....bbbbbbb....",
    "......bbbbb.....",
    "................",
  ],
  "root-mallet": [
    "................",
    ".........bb.b...",
    "........bbbbbb..",
    "hHhHh..bbccbbb..",
    "hHhHh..bbbbbb...",
    "........bbb.b...",
    ".........bb.....",
    "................",
  ],
  "bone-hammer": [
    "................",
    "............c...",
    "...........bb...",
    "hHhHhHhHhHbbb...",
    "hHhHhHhHhHbbb...",
    "...........bb...",
    "............c...",
    "................",
  ],
  "moon-peen": [
    "................",
    "..............c.",
    "............bbc.",
    "hhHHhhhhhhhbbb..",
    "hhHHhhhhhhhbb...",
    "............b...",
    "................",
    "................",
  ],
  "ash-sledge": [
    "................",
    ".....bbbbbbbbbb.",
    "....bbb.c.bbbbb.",
    "hhHHbbbbbbbbbbb.",
    "hhHHbbbbbbbbbb..",
    "....bbbbbbbbb...",
    ".....bbbbbbb....",
    "................",
  ],
  "rime-hammer": [
    "................",
    "........cbbbbc..",
    ".......bbcccbb..",
    "hhHHhh.bbbbbbb..",
    "hhHHhh.bbbbbb...",
    ".......cbbbb....",
    "................",
    "................",
  ],
  "bramble-maul": [
    "................",
    "....b..bbbb..b..",
    "...b..bbccbb.b..",
    "hhHHh.bbbbbbb...",
    "hhHHh.bbbbbb....",
    "...b...bbbb.b...",
    "....b...bb.b....",
    "................",
  ],
  "star-hammer": [
    "................",
    "..............c.",
    "..........b..bc.",
    "hhHHhhhhhhbbbb..",
    "hhHHhhhhhhbbb...",
    "..........b..b..",
    "................",
    "................",
  ],
};

export function weaponGlyph(hammerId: string): string[] {
  return WEAPON_GLYPHS[hammerId] ?? WEAPON_GLYPHS["ember-mallet"]!;
}

export function drawWeaponGlyph(
  ctx: CanvasRenderingContext2D,
  hammerId: string,
  x: number,
  y: number,
  ang: number,
  px: number,
  ore: string,
  crystal: string,
  flash = false,
) {
  const rows = weaponGlyph(hammerId);
  const h = rows.length;
  const w = rows[0]?.length ?? 1;
  const pal: Record<string, string> = {
    h: "#2a1c14",
    H: "#6a4a30",
    b: flash ? "#fff4c8" : ore,
    c: flash ? "#ffffff" : crystal,
  };
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  ctx.translate(x, y);
  ctx.rotate(ang);
  const ox = 2;
  const oy = -Math.floor(h / 2);
  for (let j = 0; j < h; j++) {
    const row = rows[j]!;
    for (let i = 0; i < w; i++) {
      const ch = row[i]!;
      if (ch === ".") continue;
      ctx.fillStyle = pal[ch] ?? ore;
      ctx.fillRect((ox + i) * px, (oy + j) * px, px, px);
    }
  }
  ctx.restore();
}
