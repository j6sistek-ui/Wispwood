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
  const filled = hud.relicCasts.filter(Boolean).length;
  return (
    <div className="absolute inset-0 z-40 grid place-items-center bg-[#080a06]/80 px-3 py-4 pointer-events-auto" data-ui>
      <div className="relative w-[min(94vw,22rem)]">
        <div className="absolute -inset-1 border-2 border-[#1a140c]" />
        <div
          className="relative overflow-hidden border-4 border-[#5a4a28] bg-[#1c1810] shadow-[6px_6px_0_0_#0c0a08]"
          style={{
            backgroundImage:
              "linear-gradient(180deg, rgba(90,74,40,0.22), rgba(8,10,6,0.28)), repeating-linear-gradient(0deg, transparent 0 13px, rgba(0,0,0,0.14) 13px 14px)",
          }}
        >
          <div className="flex h-2">
            <span className="w-4 bg-[#8a6a28]" />
            <span className="flex-1 bg-gold" />
            <span className="w-4 bg-[#8a6a28]" />
          </div>
          <p className="pt-3 text-center font-pixel text-[12px] tracking-[0.28em] text-gold">CASTER</p>
          <p className="mt-1 text-center font-pixel text-[7px] text-[#8a7a58]">
            {filled ? `${filled} seated · tap to wield` : "four wells · cast from the tablet"}
          </p>

          <div className="relative mx-auto my-4 grid w-[88%] grid-cols-2 gap-3">
            <span className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_16px_#ffd86a]" />
            {MARKS.map((mark, i) => {
              const c = hud.relicCasts[i];
              const on = hud.relicSlot === i && !!c;
              return (
                <button
                  key={mark}
                  type="button"
                  data-ui
                  onClick={() => engine?.pickRelicSlot(i)}
                  className="relative flex aspect-square flex-col items-center justify-center border-2 bg-[#0c0c0c]/70"
                  style={{
                    borderColor: on ? (c?.color ?? "#ffd86a") : c ? c.color : "#7a7a7a",
                    boxShadow: on
                      ? `0 0 18px ${c?.color ?? "#ffd86a"}`
                      : "inset 0 0 0 3px #14110c, inset 0 8px 0 #0c0a08, 3px 3px 0 #0c0a08",
                  }}
                >
                  <span className="font-pixel text-[16px] leading-none" style={{ color: c ? c.color : "#5a5a5a" }}>
                    {mark}
                  </span>
                  <span className="mt-2 px-1 text-center font-pixel text-[6px] tracking-[0.08em]" style={{ color: c ? "#ecece8" : "#6a6a6a" }}>
                    {c ? c.name : "empty"}
                  </span>
                  <span className="absolute left-1 top-1 h-1.5 w-1.5 bg-[#8a6a28]" />
                  <span className="absolute right-1 top-1 h-1.5 w-1.5 bg-[#8a6a28]" />
                  <span className="absolute bottom-1 left-1 h-1.5 w-1.5 bg-[#8a6a28]" />
                  <span className="absolute bottom-1 right-1 h-1.5 w-1.5 bg-[#8a6a28]" />
                </button>
              );
            })}
          </div>

          <p className="pb-3 text-center font-pixel text-[7px] text-[#6a5a40]">
            {hud.relicCasts[hud.relicSlot] ? `Wielding ${hud.relicCasts[hud.relicSlot]!.name}` : "No cast seated"}
          </p>
        </div>
        <button
          type="button"
          data-ui
          onClick={onClose}
          className="mt-2 h-11 w-full border-2 border-[#5a4a28] bg-[#10140c] font-pixel text-[9px] text-gold shadow-[3px_3px_0_0_#0c0a08]"
        >
          Close caster
        </button>
      </div>
    </div>
  );
}
