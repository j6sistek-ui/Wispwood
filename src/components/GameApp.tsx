import { useEffect, useRef, useState } from "react";
import { GameEngine, type HudState } from "@/game/engine";
import { GameOverlay } from "@/components/GameOverlay";
import { ensureGuestAccount } from "@/game/guest-account";

const idleHud: HudState = {
  phase: "boot",
  hp: 100,
  maxHp: 100,
  score: 0,
  wave: 0,
  best: 0,
  bestNight: 0,
  muted: false,
  loading: true,
  spell: "ember",
  gold: 0,
  upgrades: {
    ember: { speed: 0, damage: 0 },
    frost: { speed: 0, damage: 0 },
    bolt: { speed: 0, damage: 0 },
    void: { speed: 0, damage: 0 },
    vine: { speed: 0, damage: 0 },
    boom: { speed: 0, damage: 0 },
    craft: { speed: 0, damage: 0 },
  },
  boltUnlocked: false,
  voidUnlocked: false,
  vineUnlocked: false,
  boomUnlocked: false,
  crafted: null,
  sandbox: false,
};

function isChromeTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("button, a, input, textarea, [data-ui]"));
}

function lockViewport() {
  const vv = window.visualViewport;
  const w = Math.max(1, Math.round(vv?.width ?? window.innerWidth));
  const h = Math.max(1, Math.round(vv?.height ?? window.innerHeight));
  const top = Math.max(0, Math.round(vv?.offsetTop ?? 0));
  const left = Math.max(0, Math.round(vv?.offsetLeft ?? 0));
  const root = document.documentElement;
  root.style.setProperty("--app-w", `${w}px`);
  root.style.setProperty("--app-h", `${h}px`);
  root.style.setProperty("--app-top", `${top}px`);
  root.style.setProperty("--app-left", `${left}px`);
  return { w, h, top, left };
}

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [hud, setHud] = useState<HudState>(idleHud);
  const [crash, setCrash] = useState<string | null>(null);

  useEffect(() => {
    void ensureGuestAccount();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    lockViewport();
    let game: GameEngine;
    try {
      game = new GameEngine(canvas);
    } catch (err) {
      setCrash(err instanceof Error ? err.message : "Could not start");
      return;
    }
    engineRef.current = game;
    setEngine(game);
    const unsub = game.subscribe(setHud);
    const onResize = () => {
      lockViewport();
      game.resize();
    };
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    window.visualViewport?.addEventListener("scroll", onResize);
    const ro = new ResizeObserver(() => {
      lockViewport();
      game.resize();
    });
    ro.observe(canvas.parentElement ?? canvas);
    const onVis = () => {
      if (document.visibilityState === "visible") game.audio.resume();
    };
    document.addEventListener("visibilitychange", onVis);

    const playing = () => game.phase === "playing";

    const onDown = (e: PointerEvent) => {
      if (!playing() || isChromeTarget(e.target)) return;
      e.preventDefault();
      game.pointAt(e.clientX, e.clientY, true, true);
    };
    const onMove = (e: PointerEvent) => {
      if (!playing() || isChromeTarget(e.target)) return;
      const held = e.buttons > 0;
      game.pointAt(e.clientX, e.clientY, held, false);
    };
    const onUp = (e: PointerEvent) => {
      if (!playing()) return;
      game.pointAt(e.clientX, e.clientY, false, false);
    };

    window.addEventListener("pointerdown", onDown, { passive: false });
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    void game
      .boot()
      .then(() => {
        lockViewport();
        game.resize();
        game.startLoop();
      })
      .catch(() => {
        lockViewport();
        game.resize();
        game.startLoop();
      });

    return () => {
      unsub();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
      window.visualViewport?.removeEventListener("scroll", onResize);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      game.stop();
    };
  }, []);

  return (
    <main
      className="overflow-hidden bg-bg text-fg"
      style={{
        position: "fixed",
        top: "var(--app-top, 0px)",
        left: "var(--app-left, 0px)",
        width: "var(--app-w, 100%)",
        height: "var(--app-h, 100%)",
      }}
    >
      <canvas
        ref={canvasRef}
        className="touch-none select-none"
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          width: "100%",
          height: "100%",
          touchAction: "none",
          imageRendering: "pixelated",
        }}
      />
      <GameOverlay engine={engine} hud={hud} />
      {crash ? (
        <div className="absolute inset-0 z-50 grid place-items-center bg-bg px-6 text-center">
          <p className="font-pixel text-pixel text-fg">Could not load</p>
          <p className="mt-3 font-pixel text-pixel-sm leading-relaxed text-muted">{crash}</p>
        </div>
      ) : null}
    </main>
  );
}
