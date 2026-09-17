import { useRef, useState, type PointerEvent } from "react";

const EMBER: string[] = [
  "....11....",
  "...1221...",
  "..122221..",
  ".12233221.",
  ".12344321.",
  ".12233221.",
  "..123321..",
  "..12221...",
  "...121....",
  "....1.....",
];

const SHOT: string[] = [
  "....11....",
  "...1221...",
  "..12..21..",
  ".12....21.",
  ".1..33..1.",
  ".1..33..1.",
  ".12....21.",
  "..12..21..",
  "...1221...",
  "....11....",
];

const EMBER_PAL = { "1": "#5a1808", "2": "#c45a28", "3": "#e08a3c", "4": "#fff0a8" };
const SHOT_PAL = { "1": "#2a2c38", "2": "#8a90a8", "3": "#ecece8", "4": "#fff4c8" };

const RUNES = [
  { id: "ember", name: "Ember", rows: EMBER, pal: EMBER_PAL, home: { x: 18, y: 38 }, glow: "#e08a3c" },
  { id: "singleshot", name: "Singleshot", rows: SHOT, pal: SHOT_PAL, home: { x: 58, y: 38 }, glow: "#d8dce8" },
] as const;

type Drag = { id: string; x: number; y: number };

export function RelicTablet({ onClose }: { onClose: () => void }) {
  const slab = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<Drag | null>(null);

  const toPct = (e: PointerEvent, el: HTMLDivElement) => {
    const r = el.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    };
  };

  const grab = (id: string, e: PointerEvent<HTMLButtonElement>) => {
    const el = slab.current;
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toPct(e, el);
    setDrag({ id, x: p.x, y: p.y });
  };

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag || !slab.current) return;
    const p = toPct(e, slab.current);
    setDrag({ ...drag, x: Math.max(6, Math.min(94, p.x)), y: Math.max(10, Math.min(88, p.y)) });
  };

  const drop = () => setDrag(null);

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-[#080a06]/80 px-3 py-6 pointer-events-auto" data-ui>
      <div className="relative w-[min(94vw,22rem)]">
        <div className="absolute -inset-1 border-2 border-[#1a140c]" />
        <div
          ref={slab}
          onPointerMove={move}
          onPointerUp={drop}
          onPointerCancel={drop}
          className="relative overflow-hidden border-4 border-[#5a4a28] bg-[#1c1810] shadow-[6px_6px_0_0_#0c0a08]"
          style={{
            height: "min(62vh, 26rem)",
            backgroundImage:
              "linear-gradient(180deg, rgba(90,74,40,0.18), rgba(8,10,6,0.2)), repeating-linear-gradient(90deg, transparent 0 11px, rgba(0,0,0,0.12) 11px 12px)",
          }}
        >
          <div className="flex h-2">
            <span className="w-4 bg-[#8a6a28]" />
            <span className="flex-1 bg-gold" />
            <span className="w-4 bg-[#8a6a28]" />
          </div>
          <p className="pt-3 text-center font-pixel text-[11px] tracking-[0.22em] text-gold">RUNE TABLET</p>
          <p className="mt-1 text-center font-pixel text-[7px] text-[#8a7a58]">drag a rune · let go to recall</p>

          {RUNES.map((r) => (
            <div
              key={r.id + "-well"}
              className="pointer-events-none absolute grid place-items-center"
              style={{
                left: `${r.home.x}%`,
                top: `${r.home.y}%`,
                width: "28%",
                transform: "translate(-50%, -50%)",
              }}
            >
              <div
                className="h-24 w-24 rounded-full border-2 border-[#3d3424]"
                style={{ boxShadow: "inset 0 0 0 4px #14110c, inset 0 8px 0 #0c0a08, 0 0 18px rgba(0,0,0,0.45)" }}
              />
            </div>
          ))}

          {RUNES.map((r) => {
            const held = drag?.id === r.id;
            const x = held ? drag.x : r.home.x;
            const y = held ? drag.y : r.home.y;
            return (
              <button
                key={r.id}
                type="button"
                data-ui
                onPointerDown={(e) => grab(r.id, e)}
                className="absolute grid place-items-center rounded-full border-2 bg-[#14110c] p-2"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: "26%",
                  transform: "translate(-50%, -50%)",
                  borderColor: r.glow,
                  boxShadow: held ? `0 0 22px ${r.glow}` : `0 0 10px ${r.glow}88, 3px 3px 0 #0c0a08`,
                  zIndex: held ? 5 : 2,
                  transition: held ? "none" : "left 180ms ease-out, top 180ms ease-out",
                  cursor: "grab",
                  touchAction: "none",
                }}
              >
                <Glyph rows={r.rows} pal={r.pal} />
                <span className="mt-1 font-pixel text-[7px] leading-none" style={{ color: r.glow }}>
                  {r.name}
                </span>
              </button>
            );
          })}

          <p className="pointer-events-none absolute bottom-10 left-0 right-0 text-center font-pixel text-[7px] text-[#6a5a40]">
            They hum. They do nothing.
          </p>
          <div className="absolute bottom-0 left-0 right-0 p-2">
            <button
              type="button"
              data-ui
              onClick={onClose}
              className="h-11 w-full border-2 border-[#5a4a28] bg-[#10140c] font-pixel text-[9px] text-gold shadow-[3px_3px_0_0_#0c0a08]"
            >
              Close tablet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Glyph({ rows, pal }: { rows: string[]; pal: Record<string, string> }) {
  const px = 4;
  const w = rows[0]?.length ?? 1;
  return (
    <span className="inline-grid" style={{ gridTemplateColumns: `repeat(${w}, ${px}px)` }}>
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) => (
          <span key={`${x}-${y}`} style={{ width: px, height: px, background: pal[ch] ?? "transparent" }} />
        )),
      )}
    </span>
  );
}
