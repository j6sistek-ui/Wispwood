import { useRef, useState, type MouseEvent, type PointerEvent } from "react";
import type { GameEngine } from "@/game/engine";
import {
  RELIC_ELEMENTS,
  RELIC_FUNCTIONS,
  RELIC_TRIKEEE,
  RUNE_GLOW,
  RUNE_KIND,
  RUNE_LABEL,
  type RelicElement,
  type RelicFunction,
  type RelicRuneId,
  type RelicTrikeee,
} from "@/game/relic-cast";

type SlotId = "funcN" | "elemW" | "trikeee" | "elemE" | "funcS";
type Seat = SlotId | "tray";
type Drag = { id: RelicRuneId; x: number; y: number };

const ALL: RelicRuneId[] = [...RELIC_ELEMENTS, ...RELIC_FUNCTIONS, ...RELIC_TRIKEEE];
const SLOTS: Array<{ id: SlotId; kind: "element" | "function" | "trikeee"; label: string }> = [
  { id: "funcN", kind: "function", label: "function" },
  { id: "elemW", kind: "element", label: "element" },
  { id: "trikeee", kind: "trikeee", label: "trikeee" },
  { id: "elemE", kind: "element", label: "element" },
  { id: "funcS", kind: "function", label: "function" },
];
const GRID: Array<SlotId | null> = [null, "funcN", null, "elemW", "trikeee", "elemE", null, "funcS", null];

const emptySeat = (): Record<RelicRuneId, Seat> => {
  const o = {} as Record<RelicRuneId, Seat>;
  for (const id of ALL) o[id] = "tray";
  return o;
};

export function RelicTablet({ engine, onClose }: { engine: GameEngine | null; onClose: () => void }) {
  const [drag, setDrag] = useState<Drag | null>(null);
  const [hover, setHover] = useState<SlotId | null>(null);
  const [seat, setSeat] = useState<Record<RelicRuneId, Seat>>(emptySeat);
  const [note, setNote] = useState("element + function · trikeee optional");
  const dragRef = useRef<Drag | null>(null);

  const occupant = (slot: SlotId) => ALL.find((id) => seat[id] === slot);

  const grab = (id: RelicRuneId, e: PointerEvent<HTMLButtonElement>) => {
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
    const taken = slot ? occupant(slot) : null;
    const ok = def && def.kind === RUNE_KIND[d.id] && (!taken || taken === d.id);
    setSeat((cur) => ({ ...cur, [d.id]: ok && slot ? slot : "tray" }));
  };

  const close = (e: PointerEvent | MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div
      className="absolute inset-0 z-50 overflow-y-auto bg-[#080a06]/88 px-3 py-3 pointer-events-auto"
      data-ui
      onPointerMove={move}
      onPointerUp={drop}
      onPointerCancel={drop}
    >
      <div className="mx-auto w-[min(94vw,22rem)] pb-4">
        <div className="border-4 border-[#5a4a28] bg-[#1c1810] p-3 shadow-[6px_6px_0_0_#0c0a08]">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-pixel text-[11px] tracking-[0.18em] text-gold">RUNE TABLET</p>
            <button
              type="button"
              data-ui
              onPointerDown={close}
              onClick={close}
              className="h-8 border-2 border-[#5a4a28] px-2 font-pixel text-[8px] text-gold"
            >
              Close
            </button>
          </div>
          <p className="mb-3 text-center font-pixel text-[7px] text-[#8a7a58]">{note}</p>
          <div className="mx-auto grid w-[92%] grid-cols-3 gap-2">
            {GRID.map((id, i) => {
              if (!id) return <div key={i} />;
              const sl = SLOTS.find((s) => s.id === id)!;
              const held = occupant(id);
              const lit = hover === id && drag && RUNE_KIND[drag.id] === sl.kind;
              const deny = hover === id && drag && RUNE_KIND[drag.id] !== sl.kind;
              return (
                <div key={id} className="flex flex-col items-center gap-1">
                  <div
                    data-slot={id}
                    className="relative grid aspect-square w-full place-items-center rounded-full"
                    style={{
                      border: `2px solid ${lit ? "#ecece8" : deny ? "#6a3030" : "#7a7a7a"}`,
                      background: "rgba(12,12,12,0.55)",
                    }}
                  >
                    {held && drag?.id !== held ? (
                      <button type="button" data-ui onPointerDown={(e) => grab(held, e)} className="h-full w-full" style={{ touchAction: "none" }}>
                        <RuneChip id={held} />
                      </button>
                    ) : null}
                  </div>
                  <span className="font-pixel text-[6px]" style={{ color: sl.kind === "trikeee" ? "#c8a4ff" : "#8a8a8a" }}>
                    {sl.label}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="mt-3 mb-1 text-center font-pixel text-[6px] text-[#6a5a40]">runes</p>
          <div className="grid grid-cols-4 gap-1.5">
            {ALL.map((id) =>
              seat[id] === "tray" && drag?.id !== id ? (
                <button
                  key={id}
                  type="button"
                  data-ui
                  onPointerDown={(e) => grab(id, e)}
                  className="grid place-items-center rounded-full border-2 bg-[#14110c] py-1.5"
                  style={{ borderColor: RUNE_GLOW[id], touchAction: "none" }}
                >
                  <RuneChip id={id} />
                </button>
              ) : (
                <div key={id} className="h-10" />
              ),
            )}
          </div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5">
          <button
            type="button"
            data-ui
            onClick={() => {
              const elem = RELIC_ELEMENTS.find((id) => seat[id] !== "tray");
              const fn = RELIC_FUNCTIONS.find((id) => seat[id] !== "tray");
              const tri = RELIC_TRIKEEE.find((id) => seat[id] !== "tray") ?? null;
              if (!elem) {
                setNote("Need an element");
                return;
              }
              if (!fn) {
                setNote("Need a function");
                return;
              }
              const msg = engine?.makeRelicCast(elem as RelicElement, fn as RelicFunction, tri as RelicTrikeee) ?? "Need the lantern";
              setNote(msg);
              if (msg.startsWith("Cast")) setSeat(emptySeat());
            }}
            className="h-11 border-2 border-gold bg-[#10140c] font-pixel text-[9px] text-gold shadow-[3px_3px_0_0_#0c0a08]"
          >
            Cast
          </button>
          <button
            type="button"
            data-ui
            onPointerDown={close}
            onClick={close}
            className="h-11 border-2 border-[#5a4a28] bg-[#10140c] font-pixel text-[9px] text-gold shadow-[3px_3px_0_0_#0c0a08]"
          >
            Close
          </button>
        </div>
      </div>
      {drag ? (
        <div
          className="pointer-events-none fixed z-50 grid w-16 place-items-center rounded-full border-2 bg-[#14110c] p-1"
          style={{ left: drag.x, top: drag.y, transform: "translate(-50%, -50%)", borderColor: RUNE_GLOW[drag.id] }}
        >
          <RuneChip id={drag.id} />
        </div>
      ) : null}
    </div>
  );
}

function RuneChip({ id }: { id: RelicRuneId }) {
  return (
    <span className="block px-0.5 text-center font-pixel text-[6px] leading-tight" style={{ color: RUNE_GLOW[id] }}>
      {RUNE_LABEL[id]}
    </span>
  );
}
