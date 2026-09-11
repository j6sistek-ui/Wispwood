const PAL: Record<string, string> = {
  b: "#3a2010",
  d: "#8a3c18",
  ":": "#e08a3c",
  o: "#f0d24a",
  w: "#fff4c8",
  e: "#1a1010",
  c: "#e8c070",
  s: "#5a3020",
  n: "#8a5a32",
  x: "#7a48b8",
  i: "#9ad8ea",
  g: "#6fbf6a",
  r: "#c45a48",
  "+": "#fff4c8",
};

const BODY = [
  "      cc      ",
  "    ccwwcc    ",
  "   cddddddc   ",
  "  ddb::::bdd  ",
  " dbb::::::bbd ",
  " db::owwo::bd ",
  " db::oeeo::bd ",
  "  db:oooo:bd  ",
  "  dbb::::bbd  ",
  "   dbbbbbbd   ",
  "   dbnnnnbd   ",
  "   bnsxxsnb   ",
  "   bnsgxisnb  ",
  "    nssssn    ",
  "     bbbb     ",
];

const BLINK = [
  "      cc      ",
  "    ccwwcc    ",
  "   cddddddc   ",
  "  ddb::::bdd  ",
  " dbb::::::bbd ",
  " db::owwo::bd ",
  " db::oooo::bd ",
  "  db:oooo:bd  ",
  "  dbb::::bbd  ",
  "   dbbbbbbd   ",
  "   dbnnnnbd   ",
  "   bnsxxsnb   ",
  "   bnsgxisnb  ",
  "    nssssn    ",
  "     bbbb     ",
];

const LIFT = [
  "     +cc+     ",
  "    ccwwcc    ",
  "   cddddddc   ",
  "  ddb::::bdd  ",
  " dbb::::::bbd ",
  " db::wwww::bd ",
  " db::oeeo::bd ",
  "  db:oooo:bd  ",
  "  dbb::::bbd  ",
  "   dbbbbbbd   ",
  "   dbnnnnbd   ",
  "   bnsrrsnb   ",
  "   bnsixgsnb  ",
  "    nssssn    ",
  "     bbbb     ",
];

const SPARK = [
  "    + cc +    ",
  "    ccwwcc    ",
  "   cddddddc   ",
  "  ddb::::bdd  ",
  " dbb::::::bbd ",
  " db::owwo::bd ",
  " db::oeeo::bd ",
  "  db:oooo:bd  ",
  "  dbb::::bbd  ",
  "   dbbbbbbd   ",
  "   dbnnnnbd   ",
  "   bnsigsnb   ",
  "   bnsxrxsnb  ",
  "    nssssn    ",
  "     bbbb     ",
];

const FRAMES = [BODY, LIFT, BLINK, SPARK];

export function drawBuffWisp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  flash: boolean,
  t: number,
) {
  const rows = FRAMES[Math.floor(t) % FRAMES.length]!;
  const w = rows[0]!.length;
  const h = rows.length;
  const s = Math.max(3, Math.round((r * 2) / Math.max(w, h)));
  const bob = Math.round(Math.sin(t * 2.2) * s * 0.2);
  const ox0 = Math.round(x - (w * s) / 2);
  const oy0 = Math.round(y - (h * s) * 0.78 + bob);
  ctx.save();
  ctx.imageSmoothingEnabled = false;
  for (let j = 0; j < h; j++) {
    const row = rows[j]!;
    for (let i = 0; i < row.length; i++) {
      const ch = row[i]!;
      if (ch === " ") continue;
      ctx.fillStyle = flash ? "#fff4c8" : PAL[ch] ?? "#e08a3c";
      ctx.fillRect(ox0 + i * s, oy0 + j * s, s, s);
    }
  }
  ctx.restore();
}
