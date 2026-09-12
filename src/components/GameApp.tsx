import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { GameEngine, HudState } from "@/game/engine";
import { ensureGuestAccount } from "@/game/guest-account";

const GameOverlay = lazy(() =>
  import("./GameOverlay").then((m) => ({ default: m.GameOverlay })),
);

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
  loadPct: 0,
  loadNote: "Gathering dusk",
  worldReady: false,
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
    fuse: { speed: 0, damage: 0 },
  },
  boltUnlocked: false,
  voidUnlocked: false,
  vineUnlocked: false,
  boomUnlocked: false,
  crafted: null,
  fused: null,
  sandbox: false,
  max: false,
  trinkoo: 0,
  runTrinkoo: 0,
  ownedRelics: [],
  equipped: [null, null, null],
  forgeBag: {},
  hands: "spell",
  weapon: null,
  weapons: [],
  abilityReady: true,
  abilityWait: 0,
  sandboxPlaying: false,
  sandboxEdit: 0,
  sandboxDeck: [{ count: 0, label: "Wave 1 empty" }],
  bodySize: 1,
  bodySpeed: 1,
  omen: "calm",
  tunes: {
    ember: { move: 1, reload: 1, size: 1, dmg: 1 },
    frost: { move: 1, reload: 1, size: 1, dmg: 1 },
    bolt: { move: 1, reload: 1, size: 1, dmg: 1 },
    void: { move: 1, reload: 1, size: 1, dmg: 1 },
    vine: { move: 1, reload: 1, size: 1, dmg: 1 },
    boom: { move: 1, reload: 1, size: 1, dmg: 1 },
    craft: { move: 1, reload: 1, size: 1, dmg: 1 },
    fuse: { move: 1, reload: 1, size: 1, dmg: 1 },
  },
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
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(() => {
        void ensureGuestAccount();
      });
      return () => window.cancelIdleCallback(id);
    }
    const t = window.setTimeout(() => {
      void ensureGuestAccount();
    }, 400);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    lockViewport();
    let cancelled = false;
    let cleanup = () => {};

    void import("@/game/engine").then(({ GameEngine }) => {
      if (cancelled || !canvasRef.current) return;
      let game: GameEngine;
      try {
        game = new GameEngine(canvasRef.current);
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

      const unlockAudio = () => game.audio.unlock();
      window.addEventListener("pointerdown", unlockAudio);
      window.addEventListener("keydown", unlockAudio);

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

      void game.boot().catch(() => {});
      lockViewport();
      game.resize();
      game.startLoop();

      cleanup = () => {
        unsub();
        window.removeEventListener("resize", onResize);
        window.removeEventListener("orientationchange", onResize);
        window.visualViewport?.removeEventListener("resize", onResize);
        window.visualViewport?.removeEventListener("scroll", onResize);
        ro.disconnect();
        document.removeEventListener("visibilitychange", onVis);
        window.removeEventListener("pointerdown", unlockAudio);
        window.removeEventListener("keydown", unlockAudio);
        window.removeEventListener("pointerdown", onDown);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
        game.stop();
      };
    });

    return () => {
      cancelled = true;
      cleanup();
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
      <Suspense
        fallback={
          <div className="absolute inset-0 z-20 grid place-items-center bg-bg">
            <p className="font-pixel text-pixel-sm text-muted">Gathering dusk</p>
          </div>
        }
      >
        <GameOverlay engine={engine} hud={hud} />
      </Suspense>
      {crash ? (
        <div className="absolute inset-0 z-50 grid place-items-center bg-bg px-6 text-center">
          <p className="font-pixel text-pixel text-fg">Could not load</p>
          <p className="mt-3 font-pixel text-pixel-sm leading-relaxed text-muted">{crash}</p>
        </div>
      ) : null}
    </main>
  );
}
