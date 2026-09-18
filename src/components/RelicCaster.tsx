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
    <div className="absolute inset-0 z-50 overflow-y-auto bg-[#080a06]/88 px-3 py-3 pointer-events-auto" data-ui>
      <div className="mx-auto w-[min(94vw,22rem)]">
        <div className="border-4 border-[#5a4a28] bg-[#1c1810] p-3 shadow-[6px_6px_0_0_#0c0a08]">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-pixel text-[12px] tracking-[0.22em] text-gold">CASTER</p>
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
          <p className="mb-3 text-center font-pixel text-[7px] text-[#8a7a58]">
            {filled ? `${filled} seated · tap to wield` : "four wells · cast from the tablet"}
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
                    borderColor: on ? (c?.color ?? "#ffd86a") : c ? c.color : "#7a7a7a",
                    boxShadow: on ? `0 0 18px ${c?.color ?? "#ffd86a"}` : "3px 3px 0 #0c0a08",
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
          <p className="mt-3 text-center font-pixel text-[7px] text-[#6a5a40]">
            {wells[slot] ? `Wielding ${wells[slot]!.name}` : "No cast seated"}
          </p>
        </div>
        <button
          type="button"
          data-ui
          onPointerDown={close}
          onClick={close}
          className="mt-2 h-11 w-full border-2 border-[#5a4a28] bg-[#10140c] font-pixel text-[9px] text-gold shadow-[3px_3px_0_0_#0c0a08]"
        >
          Close caster
        </button>
      </div>
    </div>
  );
}
