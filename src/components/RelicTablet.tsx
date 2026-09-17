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

type Kind = "element" | "function";
type SlotId = "funcN" | "elemW" | "trikeee" | "elemE" | "funcS";
type RuneId = "ember" | "singleshot";
type Seat = SlotId | "tray";

const RUNES: Record<RuneId, { name: string; rows: string[]; pal: Record<string, string>; glow: string; kind: Kind; tray: { x: number; y: number } }> = {
  ember: { name: "Ember", rows: EMBER, pal: EMBER_PAL, glow: "#e08a3c", kind: "element", tray: { x: 28, y: 86 } },
  singleshot: { name: "Singleshot", rows: SHOT, pal: SHOT_PAL, glow: "#d8dce8", kind: "function", tray: { x: 72, y: 86 } },
};

const SLOTS: Array<{ id: SlotId; x: number; y: number; kind: Kind | "trikeee"; label: string }> = [
  { id: "funcN", x: 50, y: 24, kind: "function", label: "function" },
  { id: "elemW", x: 22, y: 50, kind: "element", label: "element" },
  { id: "trikeee", x: 50, y: 50, kind: "trikeee", label: "trikeee" },
  { id: "elemE", x: 78, y: 50, kind: "element", label: "element" },
  { id: "funcS", x: 50, y: 76, kind: "function", label: "function" },
];

type Drag = { id: RuneId; x: number; y: number };

export function RelicTablet({ onClose }: { onClose: () => void }) {
  const slab = useRef<HTMLDivElement>(null);
  const dragRef = useRef<Drag | null>(null);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [seat, setSeat] = useState<Record<RuneId, Seat>>({ ember: "tray", singleshot: "tray" });

  const toPct = (e: PointerEvent, el: HTMLDivElement) => {
    const r = el.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * 100,
      y: ((e.clientY - r.top) / r.height) * 100,
    };
  };

  const posOf = (id: RuneId) => {
    const s = seat[id];
    if (s === "tray") return RUNES[id].tray;
    const slot = SLOTS.find((sl) => sl.id === s);
    return slot ? { x: slot.x, y: slot.y } : RUNES[id].tray;
  };

  const occupied = (slot: SlotId, except?: RuneId) =>
    (Object.entries(seat) as Array<[RuneId, Seat]>).some(([id, s]) => s === slot && id !== except);

  const grab = (id: RuneId, e: PointerEvent<HTMLButtonElement>) => {
    const el = slab.current;
    if (!el) return;
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const p = toPct(e, el);
    const next = { id, x: p.x, y: p.y };
    dragRef.current = next;
    setDrag(next);
  };

  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current || !slab.current) return;
    const p = toPct(e, slab.current);
    const next = { id: dragRef.current.id, x: Math.max(8, Math.min(92, p.x)), y: Math.max(12, Math.min(92, p.y)) };
    dragRef.current = next;
    setDrag(next);
  };

  const drop = () => {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!d) return;
    const rune = RUNES[d.id];
    let best: { id: SlotId; dist: number } | null = null;
    for (const sl of SLOTS) {
      const dist = Math.hypot(d.x - sl.x, d.y - sl.y);
      if (dist < 14 && (!best || dist < best.dist)) best = { id: sl.id, dist };
    }
    const hit = best ? SLOTS.find((s) => s.id === best!.id) : null;
    const ok = hit && hit.kind === rune.kind && !occupied(hit.id, d.id);
    setSeat((cur) => ({ ...cur, [d.id]: ok && hit ? hit.id : "tray" }));
  };

  const hover = drag
    ? SLOTS.find((sl) => Math.hypot(drag.x - sl.x, drag.y - sl.y) < 14)
    : null;

  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-[#080a06]/80 px-3 py-4 pointer-events-auto" data-ui>
      <div className="relative w-[min(94vw,22rem)]">
        <div className="absolute -inset-1 border-2 border-[#1a140c]" />
        <div
          ref={slab}
          onPointerMove={move}
          onPointerUp={drop}
          onPointerCancel={drop}
          className="relative overflow-hidden border-4 border-[#5a4a28] bg-[#1c1810] shadow-[6px_6px_0_0_#0c0a08]"
          style={{
            height: "min(68vh, 28rem)",
            backgroundImage:
              "linear-gradient(180deg, rgba(90,74,40,0.18), rgba(8,10,6,0.2)), repeating-linear-gradient(90deg, transparent 0 11px, rgba(0,0,0,0.12) 11px 12px)",
          }}
        >
          <div className="flex h-2">
            <span className="w-4 bg-[#8a6a28]" />
            <span className="flex-1 bg-gold" />
            <span className="w-4 bg-[#8a6a28]" />
          </div>
          <p className="pt-2 text-center font-pixel text-[11px] tracking-[0.22em] text-gold">RUNE TABLET</p>
          <p className="mt-1 text-center font-pixel text-[7px] text-[#8a7a58]">element + function · they do nothing</p>

          {SLOTS.map((sl) => {
            const lit = hover?.id === sl.id && drag && (sl.kind === RUNES[drag.id].kind);
            const deny = hover?.id === sl.id && drag && sl.kind !== RUNES[drag.id].kind;
            return (
              <div
                key={sl.id}
                className="pointer-events-none absolute grid place-items-center"
                style={{
                  left: `${sl.x}%`,
                  top: `${sl.y}%`,
                  width: "24%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <div
                  className="aspect-square w-full rounded-full"
                  style={{
                    border: `2px solid ${lit ? "#ecece8" : deny ? "#6a3030" : "#7a7a7a"}`,
                    background: "rgba(12,12,12,0.55)",
                    boxShadow: lit
                      ? "0 0 16px rgba(236,236,232,0.35), inset 0 0 0 3px #1a1810"
                      : "inset 0 0 0 3px #14110c, inset 0 6px 0 #0c0a08",
                  }}
                />
                <span
                  className="absolute -bottom-3 font-pixel text-[6px] tracking-[0.12em]"
                  style={{ color: sl.kind === "trikeee" ? "#c8a4ff" : "#8a8a8a" }}
                >
                  {sl.label}
                </span>
              </div>
            );
          })}

          {(Object.keys(RUNES) as RuneId[]).map((id) => {
            const r = RUNES[id];
            const held = drag?.id === id;
            const p = held && drag ? { x: drag.x, y: drag.y } : posOf(id);
            return (
              <button
                key={id}
                type="button"
                data-ui
                onPointerDown={(e) => grab(id, e)}
                className="absolute grid place-items-center rounded-full border-2 bg-[#14110c] p-1.5"
                style={{
                  left: `${p.x}%`,
                  top: `${p.y}%`,
                  width: "22%",
                  transform: "translate(-50%, -50%)",
                  borderColor: r.glow,
                  boxShadow: held ? `0 0 22px ${r.glow}` : `0 0 10px ${r.glow}88, 3px 3px 0 #0c0a08`,
                  zIndex: held ? 6 : 3,
                  transition: held ? "none" : "left 180ms ease-out, top 180ms ease-out",
                  cursor: "grab",
                  touchAction: "none",
                }}
              >
                <Glyph rows={r.rows} pal={r.pal} />
                <span className="mt-0.5 font-pixel text-[6px] leading-none" style={{ color: r.glow }}>
                  {r.name}
                </span>
              </button>
            );
          })}
        </div>
        <button
          type="button"
          data-ui
          onClick={onClose}
          className="mt-2 h-11 w-full border-2 border-[#5a4a28] bg-[#10140c] font-pixel text-[9px] text-gold shadow-[3px_3px_0_0_#0c0a08]"
        >
          Close tablet
        </button>
      </div>
    </div>
  );
}

function Glyph({ rows, pal }: { rows: string[]; pal: Record<string, string> }) {
  const px = 3;
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
