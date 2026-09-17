const SLOTS = [
  { id: 1, mark: "I", hint: "empty" },
  { id: 2, mark: "II", hint: "empty" },
  { id: 3, mark: "III", hint: "empty" },
  { id: 4, mark: "IV", hint: "empty" },
] as const;

export function RelicCaster({ onClose }: { onClose: () => void }) {
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
          <p className="mt-1 text-center font-pixel text-[7px] text-[#8a7a58]">four wells · no spell seated</p>

          <div className="relative mx-auto my-4 grid w-[88%] grid-cols-2 gap-3">
            <span className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold shadow-[0_0_16px_#ffd86a]" />
            {SLOTS.map((s) => (
              <div
                key={s.id}
                className="relative flex aspect-square flex-col items-center justify-center border-2 border-[#7a7a7a] bg-[#0c0c0c]/70"
                style={{ boxShadow: "inset 0 0 0 3px #14110c, inset 0 8px 0 #0c0a08, 3px 3px 0 #0c0a08" }}
              >
                <span className="font-pixel text-[16px] leading-none text-[#5a5a5a]">{s.mark}</span>
                <span className="mt-2 font-pixel text-[6px] tracking-[0.18em] text-[#6a6a6a]">{s.hint}</span>
                <span className="absolute left-1 top-1 h-1.5 w-1.5 bg-[#8a6a28]" />
                <span className="absolute right-1 top-1 h-1.5 w-1.5 bg-[#8a6a28]" />
                <span className="absolute bottom-1 left-1 h-1.5 w-1.5 bg-[#8a6a28]" />
                <span className="absolute bottom-1 right-1 h-1.5 w-1.5 bg-[#8a6a28]" />
              </div>
            ))}
          </div>

          <p className="pb-3 text-center font-pixel text-[7px] text-[#6a5a40]">Seat a made spell here later</p>
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
