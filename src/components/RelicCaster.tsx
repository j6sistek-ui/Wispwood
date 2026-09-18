import type { GameEngine, HudState } from "@/game/engine";

const MARKS = ["I", "II", "III", "IV"] as const;

export function RelicCaster({
  engine,
  hud,
  onClose,
}: {
  engine: GameEngine | null;
  hud: HudState;
  onClose: () => void;
}) {
  const wells = hud.relicCasts ?? [null, null, null, null];
  const filled = wells.filter(Boolean).length;
  const slot = hud.relicSlot ?? 0;
  const close = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    onClose();
  };
  return (
    <div className="absolute inset-0 z-50 overflow-y-auto bg-[#0c0a10]/90 px-3 py-3 pointer-events-auto" data-ui>
      <div className="mx-auto w-[min(94vw,22rem)]">
        <div className="border-4 border-[#3a3048] bg-[#141018] p-3 shadow-[6px_6px_0_0_#08060c]">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-pixel text-[12px] tracking-[0.22em] text-[#e8a0a8]">RELIQUARY</p>
            <button
              type="button"
              data-ui
              onPointerDown={close}
              onClick={close}
              className="h-8 border-2 border-[#3a3048] px-2 font-pixel text-[8px] text-[#e8d8a0]"
            >
              Close
            </button>
          </div>
          <p className="mb-3 text-center font-pixel text-[7px] text-[#8a7a90]">
            {filled ? `${filled} bound · tap to wield` : "four wells · bind at the altar"}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {MARKS.map((mark, i) => {
              const c = wells[i];
              const on = slot === i && !!c;
              return (
                <button
                  key={mark}
                  type="button"
                  data-ui
                  onClick={() => engine?.pickRelicSlot(i)}
                  className="relative flex aspect-[5/4] flex-col items-center justify-center border-2 bg-[#0c0c0c]/70"
                  style={{
                    borderColor: on ? (c?.color ?? "#e8a0a8") : c ? c.color : "#5a4a68",
                    boxShadow: on ? `0 0 18px ${c?.color ?? "#e8a0a8"}` : "3px 3px 0 #08060c",
                  }}
                >
                  <span className="font-pixel text-[16px] leading-none" style={{ color: c ? c.color : "#5a5a5a" }}>
                    {mark}
                  </span>
                  <span className="mt-2 px-1 text-center font-pixel text-[6px]" style={{ color: c ? "#ecece8" : "#6a6a6a" }}>
                    {c ? c.name : "empty"}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-3 text-center font-pixel text-[7px] text-[#6a5a70]">
            {wells[slot] ? `Wielding ${wells[slot]!.name}` : "No cast bound"}
          </p>
        </div>
        <button
          type="button"
          data-ui
          onPointerDown={close}
          onClick={close}
          className="mt-2 h-11 w-full border-2 border-[#3a3048] bg-[#141018] font-pixel text-[9px] text-[#e8d8a0] shadow-[3px_3px_0_0_#08060c]"
        >
          Close
        </button>
      </div>
    </div>
  );
}
