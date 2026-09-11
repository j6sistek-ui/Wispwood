const PAL: Record<string, string> = {
  "#": "#3a2010",
  b: "#8a3c18",
  ":": "#e08a3c",
  o: "#f0d24a",
  w: "#fff4c8",
  e: "#1a1010",
  c: "#e8c070",
  s: "#6a4030",
  x: "#7a48b8",
  i: "#9ad8ea",
  g: "#6fbf6a",
  r: "#c45a48",
  "+": "#fff4c8",
  ".": "#5a2810",
};

const FRAMES: string[][] = [
  [
    "      ++      ",
    "    +c  c+    ",
    "   cbbbbbbc   ",
    "  bb::::::bb  ",
    " bb::owwo::bb ",
    " bb:o.ee.o:bb ",
    "  bb:oooo:bb  ",
    "   bb::::bb   ",
    "    bbbbbb    ",
    "    bbssbb    ",
    "   bsxigxsb   ",
    "    sxxxxs    ",
    "     ssss     ",
    "      ..      ",
  ],
  [
    "     +  +     ",
    "    c+  +c    ",
    "   cbbbbbbc   ",
    "  bb::::::bb  ",
    " bb::owwo::bb ",
    " bb:o.ee.o:bb ",
    "  bb:oooo:bb  ",
    "   bb::::bb   ",
    "    bbbbbb    ",
    "    bbsbb     ",
    "   bsxigsb    ",
    "   sxxxxxs    ",
    "    sssss     ",
    "      ..      ",
  ],
  [
    "     ++++     ",
    "    c    c    ",
    "   cbbbbbbc   ",
    "  bb::::::bb  ",
    " bb::wwww::bb ",
    " bb:o ee o:bb ",
    "  bb:oooo:bb  ",
    "   bb::::bb   ",
    "    bbbbbb    ",
    "    bbssbb    ",
    "   bsrxgisb   ",
    "    sxxxxs    ",
    "     ssss     ",
    "      ..      ",
  ],
  [
    "    +    +    ",
    "   +c    c+   ",
    "   cbbbbbbc   ",
    "  bb::::::bb  ",
    " bb::owwo::bb ",
    " bb:o.ee.o:bb ",
    "  bb:oooo:bb  ",
    "   bb::::bb   ",
    "    bbbbbb    ",
    "     bbsbb    ",
    "    bsxigsb   ",
    "    sxxxxs    ",
    "     ssss     ",
    "      ..      ",
  ],
];

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
  const bob = Math.sin(t * 2.2) * s * 0.35;
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
  for (let k = 0; k < 6; k++) {
    const a = t * 2.4 + k * ((Math.PI * 2) / 6);
    const rad = r * 0.92 + Math.sin(t * 5 + k) * 4;
    const px = Math.round(x + Math.cos(a) * rad);
    const py = Math.round(y - r * 0.2 + Math.sin(a) * rad * 0.55);
    ctx.fillStyle = flash ? "#fff" : (k % 3 === 0 ? "#f0d24a" : k % 3 === 1 ? "#7a48b8" : "#9ad8ea");
    ctx.fillRect(px, py, s, s);
  }
  ctx.restore();
}
