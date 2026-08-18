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
    craft: { speed: 0, damage: 0 },
  },
  boltUnlocked: false,
  voidUnlocked: false,
  crafted: null,
};

function isChromeTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  return Boolean(target.closest("button, a, input, textarea, [data-ui]"));
}

export function GameApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [hud, setHud] = useState<HudState>(idleHud);

  useEffect(() => {
    void ensureGuestAccount();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const game = new GameEngine(canvas);
    engineRef.current = game;
    setEngine(game);
    const unsub = game.subscribe(setHud);
    const onResize = () => game.resize();
    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    window.visualViewport?.addEventListener("resize", onResize);
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);
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

    void game.boot().then(() => {
      game.resize();
      game.startLoop();
    }).catch(() => {
      game.resize();
      game.startLoop();
    });

    return () => {
      unsub();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      window.visualViewport?.removeEventListener("resize", onResize);
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
    <main className="fixed inset-0 overflow-hidden bg-bg text-fg">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block h-full w-full touch-none select-none"
        style={{ touchAction: "none" }}
      />
      <GameOverlay engine={engine} hud={hud} />
    </main>
  );
}
