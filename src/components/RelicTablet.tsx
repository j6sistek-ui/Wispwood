import { useRef, useState, type PointerEvent } from "react";
import type { GameEngine } from "@/game/engine";
import type { RelicElement, RelicFunction } from "@/game/relic-cast";

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

type Kind = "element" | "function" | "trikeee";
type SlotId = "funcN" | "elemW" | "trikeee" | "elemE" | "funcS";
type RuneId = "ember" | "singleshot";
type Seat = SlotId | "tray";

const RUNES: Record<RuneId, { name: string; rows: string[]; pal: Record<string, string>; glow: string; kind: Exclude<Kind, "trikeee"> }> = {
  ember: { name: "Ember", rows: EMBER, pal: EMBER_PAL, glow: "#e08a3c", kind: "element" },
  singleshot: { name: "Singleshot", rows: SHOT, pal: SHOT_PAL, glow: "#d8dce8", kind: "function" },
};

const SLOTS: Array<{ id: SlotId; kind: Kind; label: string }> = [
  { id: "funcN", kind: "function", label: "function" },
  { id: "elemW", kind: "element", label: "element" },
  { id: "trikeee", kind: "trikeee", label: "trikeee" },
  { id: "elemE", kind: "element", label: "element" },
  { id: "funcS", kind: "function", label: "function" },
];

const GRID: Array<SlotId | null> = [null, "funcN", null, "elemW", "trikeee", "elemE", null, "funcS", null];

type Drag = { id: RuneId; x: number; y: number };

export function RelicTablet({ engine, onClose }: { engine: GameEngine | null; onClose: () => void }) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hover, setHover] = useState<SlotId | null>(null);
  const [seat, setSeat] = useState<Record<RuneId, Seat>>({ ember: "tray", singleshot: "tray" });
  const [note, setNote] = useState("element + function to cast");
  const dragRef = useRef<Drag | null>(null);

  const occupant = (slot: SlotId) =>
    (Object.keys(RUNES) as RuneId[]).find((id) => seat[id] === slot);

  const grab = (id: RuneId, e: PointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const next = { id, x: e.clientX, y: e.clientY };
    dragRef.current = next;
    setDrag(next);
  };

  const move = (e: PointerEvent) => {
    if (!dragRef.current) return;
    const next = { id: dragRef.current.id, x: e.clientX, y: e.clientY };
    dragRef.current = next;
    setDrag(next);
    const hit = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-slot]");
    setHover((hit?.getAttribute("data-slot") as SlotId | null) ?? null);
  };

  const drop = (e: PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    setHover(null);
    if (!d) return;
    const node = document.elementFromPoint(e.clientX, e.clientY)?.closest("[data-slot]");
    const slot = (node?.getAttribute("data-slot") as SlotId | null) ?? null;
    const def = slot ? SLOTS.find((s) => s.id === slot) : null;
    const rune = RUNES[d.id];
    const taken = slot ? occupant(slot) : null;
    const ok = def && def.kind === rune.kind && (!taken || taken === d.id);
    setSeat((cur) => ({ ...cur, [d.id]: ok && slot ? slot : "tray" }));
  };

  return (
    <div
      className="absolute inset-0 z-40 grid place-items-center bg-[#080a06]/85 px-3 py-4 pointer-events-auto"
      data-ui
      onPointerMove={move}
      onPointerUp={drop}
      onPointerCancel={drop}
    >
      <div className="relative w-[min(94vw,22rem)]">
        <div className="border-4 border-[#5a4a28] bg-[#1c1810] p-3 shadow-[6px_6px_0_0_#0c0a08]">
          <p className="text-center font-pixel text-[11px] tracking-[0.22em] text-gold">RUNE TABLET</p>
          <p className="mt-1 mb-3 text-center font-pixel text-[7px] text-[#8a7a58]">{note}</p>

          <div className="mx-auto grid w-[92%] grid-cols-3 gap-2">
            {GRID.map((id, i) => {
              if (!id) return <div key={i} />;
              const sl = SLOTS.find((s) => s.id === id)!;
              const held = occupant(id);
              const lit = hover === id && drag && RUNES[drag.id].kind === sl.kind;
              const deny = hover === id && drag && RUNES[drag.id].kind !== sl.kind;
              return (
                <div key={id} className="flex flex-col items-center gap-1">
                  <div
                    data-slot={id}
                    className="relative grid aspect-square w-full place-items-center rounded-full"
                    style={{
                      border: `2px solid ${lit ? "#ecece8" : deny ? "#6a3030" : "#7a7a7a"}`,
                      background: "rgba(12,12,12,0.55)",
                      boxShadow: lit ? "0 0 14px rgba(236,236,232,0.35)" : "inset 0 0 0 3px #14110c",
                    }}
                  >
                    {held && drag?.id !== held ? (
                      <button
                        type="button"
                        data-ui
                        onPointerDown={(e) => grab(held, e)}
                        className="grid h-full w-full place-items-center rounded-full"
                        style={{ touchAction: "none" }}
                      >
                        <RuneFace id={held} />
                      </button>
                    ) : null}
                  </div>
                  <span className="font-pixel text-[6px] tracking-[0.1em]" style={{ color: sl.kind === "trikeee" ? "#c8a4ff" : "#8a8a8a" }}>
                    {sl.label}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="mt-3 mb-1 text-center font-pixel text-[6px] text-[#6a5a40]">runes</p>
          <div className="flex justify-center gap-4">
            {(Object.keys(RUNES) as RuneId[]).map((id) =>
              seat[id] === "tray" && drag?.id !== id ? (
                <button
                  key={id}
                  type="button"
                  data-ui
                  onPointerDown={(e) => grab(id, e)}
                  className="grid w-[30%] place-items-center rounded-full border-2 bg-[#14110c] py-2"
                  style={{ borderColor: RUNES[id].glow, touchAction: "none" }}
                >
                  <RuneFace id={id} />
                </button>
              ) : (
                <div key={id} className="h-16 w-[30%]" />
              ),
            )}
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            data-ui
            onClick={() => {
              const elem = (Object.keys(RUNES) as RuneId[]).find((id) => seat[id] !== "tray" && RUNES[id].kind === "element");
              const fn = (Object.keys(RUNES) as RuneId[]).find((id) => seat[id] !== "tray" && RUNES[id].kind === "function");
              if (!elem) {
                setNote("Need an element");
                return;
              }
              if (!fn) {
                setNote("Need a function");
                return;
              }
              const msg = engine?.makeRelicCast(elem as RelicElement, fn as RelicFunction) ?? "Need the lantern";
              setNote(msg);
              if (msg.startsWith("Cast")) setSeat({ ember: "tray", singleshot: "tray" });
            }}
            className="h-11 border-2 border-gold bg-[#10140c] font-pixel text-[9px] text-gold shadow-[3px_3px_0_0_#0c0a08]"
          >
            Cast
          </button>
          <button
            type="button"
            data-ui
            onClick={onClose}
            className="h-11 border-2 border-[#5a4a28] bg-[#10140c] font-pixel text-[9px] text-gold shadow-[3px_3px_0_0_#0c0a08]"
          >
            Close
          </button>
        </div>
      </div>

      {drag ? (
        <div
          className="pointer-events-none fixed z-50 grid w-20 place-items-center rounded-full border-2 bg-[#14110c] p-2"
          style={{
            left: drag.x,
            top: drag.y,
            transform: "translate(-50%, -50%)",
            borderColor: RUNES[drag.id].glow,
            boxShadow: `0 0 18px ${RUNES[drag.id].glow}`,
          }}
        >
          <RuneFace id={drag.id} />
        </div>
      ) : null}
    </div>
  );
}

function RuneFace({ id }: { id: RuneId }) {
  const r = RUNES[id];
  return (
    <>
      <Glyph rows={r.rows} pal={r.pal} />
      <span className="mt-1 font-pixel text-[6px] leading-none" style={{ color: r.glow }}>
        {r.name}
      </span>
    </>
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
