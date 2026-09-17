import { useEffect, useRef, useState } from "react";
import type { GameEngine, HudState } from "@/game/engine";
import { RelicTablet } from "@/components/RelicTablet";
import { RelicCaster } from "@/components/RelicCaster";

export function RelicOverlay({ engine, hud }: { engine: GameEngine | null; hud: HudState }) {
  const [tabletOpen, setTabletOpen] = useState(false);
  const [casterOpen, setCasterOpen] = useState(false);
  const [coarse, setCoarse] = useState(false);
  const menu = tabletOpen || casterOpen;

  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  useEffect(() => {
    engine?.holdSim(menu);
    return () => engine?.holdSim(false);
  }, [menu, engine]);
  useEffect(() => {
    if (hud.phase === "title") {
      setTabletOpen(false);
      setCasterOpen(false);
    }
  }, [hud.phase]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20 text-fg">
      {hud.phase === "boot" || hud.loading ? (
        <div className="absolute inset-0 z-30 grid place-items-center bg-bg">
          <p className="font-pixel text-[10px] text-muted">{hud.loadNote || "Gathering dusk"}</p>
        </div>
      ) : null}

      {hud.phase === "title" && !hud.loading ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 px-4 pointer-events-auto">
          <div className="w-[min(90vw,20rem)] border-4 border-[#3d3424] bg-[#10140c] px-3 py-4 shadow-[5px_5px_0_0_#1a1810]">
            <p className="whitespace-pre-line text-center font-pixel text-[11px] leading-5 tracking-[0.12em] text-gold">
              {"CAST THY\nHEARTS CONTENT"}
            </p>
          </div>
          <p className="font-pixel text-[8px] text-muted">An empty clearing</p>
          <button
            type="button"
            data-ui
            disabled={!hud.worldReady}
            onClick={() => engine?.play("relic")}
            className="h-12 w-full max-w-xs border-2 border-[#5a4a28] bg-accent font-pixel text-[10px] text-accent-fg shadow-[3px_3px_0_0_#1a1810] disabled:opacity-40"
          >
            {hud.worldReady ? "Enter the clearing" : "Loading…"}
          </button>
        </div>
      ) : null}

      {hud.phase === "playing" || hud.phase === "paused" ? (
        <div className="pointer-events-none px-3" style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}>
          <div className="mx-auto mt-2 grid max-w-xs grid-cols-3 gap-1.5">
            <HudBtn
              label="Leave"
              onClick={() => {
                setTabletOpen(false);
                setCasterOpen(false);
                engine?.leaveRun();
              }}
            />
            <HudBtn
              label="Tablet"
              color="text-gold border-gold"
              onClick={() => {
                setCasterOpen(false);
                setTabletOpen(true);
              }}
            />
            <HudBtn
              label="Caster"
              color="text-[#c8a4ff] border-[#c8a4ff]"
              onClick={() => {
                setTabletOpen(false);
                setCasterOpen(true);
              }}
            />
          </div>
        </div>
      ) : null}

      {tabletOpen && (hud.phase === "playing" || hud.phase === "paused") ? (
        <RelicTablet engine={engine} onClose={() => setTabletOpen(false)} />
      ) : null}
      {casterOpen && (hud.phase === "playing" || hud.phase === "paused") ? (
        <RelicCaster engine={engine} hud={hud} onClose={() => setCasterOpen(false)} />
      ) : null}

      {coarse && hud.phase === "playing" && !menu ? <RelicSticks engine={engine} /> : null}
    </div>
  );
}

function HudBtn({ label, onClick, color = "text-fg border-fg" }: { label: string; onClick: () => void; color?: string }) {
  return (
    <button
      type="button"
      data-ui
      onClick={onClick}
      className={`pointer-events-auto flex h-11 items-center justify-center border-2 bg-bg font-pixel text-[9px] shadow-[2px_2px_0_0_var(--color-border)] ${color}`}
    >
      {label}
    </button>
  );
}

function RelicSticks({ engine }: { engine: GameEngine | null }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]">
      <Stick onVec={(x, y) => engine?.setTouchMove(x, y)} onEnd={() => engine?.setTouchMove(0, 0)} />
      <Stick onVec={(x, y) => engine?.setTouchAim(x, y, true)} onEnd={() => engine?.setTouchAim(0, 0, false)} />
    </div>
  );
}

function Stick({ onVec, onEnd }: { onVec: (x: number, y: number) => void; onEnd: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const active = useRef(false);
  const point = (clientX: number, clientY: number) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (clientX - (r.left + r.width / 2)) / (r.width / 2);
    const y = (clientY - (r.top + r.height / 2)) / (r.height / 2);
    const m = Math.hypot(x, y) || 1;
    const s = Math.min(1, m);
    onVec((x / m) * s, (y / m) * s);
  };
  return (
    <div
      ref={ref}
      data-ui
      onPointerDown={(e) => {
        active.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        point(e.clientX, e.clientY);
      }}
      onPointerMove={(e) => {
        if (active.current) point(e.clientX, e.clientY);
      }}
      onPointerUp={() => {
        active.current = false;
        onEnd();
      }}
      onPointerCancel={() => {
        active.current = false;
        onEnd();
      }}
      className="pointer-events-auto size-24 rounded-full border-2 border-fg/70 bg-bg/50 touch-none"
    />
  );
}
