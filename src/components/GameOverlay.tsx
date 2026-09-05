import type { CraftedSpell, GameEngine, Spell, SpellStat } from "@/game/engine";
import type { HudState } from "@/game/engine";
import { MAX_SPELL_UP, spellDamage, upgradeCost } from "@/game/engine";
import { loadPlayerName, trySavePlayerName, cleanPlayerName, nameCooldownMs, formatWait } from "@/game/player-name";
import { loadGuestCreds, loginWithPassword } from "@/game/guest-account";
import { rarityTint, wheelChoices, pickLegendary, spellFlavor } from "@/game/spell-prompt";
import { glyphFor, coreGlyph, CORE_COLOR } from "@/game/craft-sprites";
import { BOSSES } from "@/game/bosses";
import { asset } from "@/game/paths";
import { useP2PRoom } from "@/lib/multiplayer/use-p2p-room";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  engine: GameEngine | null;
  hud: HudState;
};

export function GameOverlay({ engine, hud }: Props) {
  const [coarse, setCoarse] = useState(false);
  const [spawnOpen, setSpawnOpen] = useState(false);
  useEffect(() => {
    setCoarse(window.matchMedia("(pointer: coarse)").matches);
  }, []);
  useEffect(() => {
    if (hud.phase !== "playing" && hud.phase !== "paused") setSpawnOpen(false);
  }, [hud.phase]);
  const showSticks = coarse && hud.phase === "playing";

  return (
    <div
      className="pointer-events-none text-fg"
      style={{ position: "absolute", inset: 0, zIndex: 20, width: "100%", height: "100%" }}
    >
      {hud.phase === "playing" || hud.phase === "paused" ? (
        <Hud engine={engine} hud={hud} onSpawn={() => setSpawnOpen(true)} />
      ) : null}

      {hud.phase === "boot" || hud.loading ? <Boot /> : null}
      {hud.phase === "title" && !hud.loading ? (
        <Title engine={engine} bestNight={hud.bestNight} />
      ) : null}
      {hud.phase === "paused" ? <Pause engine={engine} hud={hud} /> : null}
      {hud.phase === "book" ? <Spellbook engine={engine} hud={hud} /> : null}
      {hud.phase === "wheel" ? <FortuneWheel engine={engine} hud={hud} /> : null}
      {hud.phase === "dead" ? <Dead engine={engine} hud={hud} /> : null}
      {spawnOpen && hud.sandbox && (hud.phase === "playing" || hud.phase === "paused") ? (
        <SpawnMenu engine={engine} onClose={() => setSpawnOpen(false)} />
      ) : null}

      {showSticks ? <TouchSticks engine={engine} /> : null}
    </div>
  );
}

function Hud({
  engine,
  hud,
  onSpawn,
}: {
  engine: GameEngine | null;
  hud: HudState;
  onSpawn?: () => void;
}) {
  const pct = Math.max(0, hud.hp / hud.maxHp);
  const spellLabel =
    hud.spell === "frost"
      ? "Ice"
      : hud.spell === "bolt"
        ? "Bolt"
        : hud.spell === "void"
          ? "Void"
          : hud.spell === "vine"
            ? "Vine"
            : hud.spell === "boom"
              ? "Boom"
            : hud.spell === "craft"
              ? (hud.crafted?.name ?? "Rune")
              : "Ember";

  return (
    <div
      className="pointer-events-none px-3"
      style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top, 0px))" }}
    >
      <div className="mx-auto flex max-w-sm items-stretch gap-1.5">
        <div className="border-2 border-fg bg-bg/95 px-2 py-1 text-center">
          <p className="font-pixel text-[7px] text-muted">NIGHT</p>
          <p className="font-pixel text-xl tabular-nums leading-none text-fg">{hud.wave}</p>
        </div>
        <div className="min-w-0 flex-1 border-2 border-border bg-bg/95 px-2 py-1">
          <p className="font-pixel text-[7px] text-muted">LANTERN</p>
          <div className="mt-1 h-2 overflow-hidden border border-border bg-elevated">
            <div className="h-full bg-accent" style={{ width: `${pct * 100}%` }} />
          </div>
        </div>
        <div className="border-2 border-gold bg-bg/95 px-2 py-1 text-center">
          <p className="font-pixel text-[7px] text-gold">MAX</p>
          <p className="font-pixel text-xl tabular-nums leading-none text-gold">{hud.bestNight}</p>
        </div>
      </div>
      <p className="mx-auto mt-1 max-w-sm text-right font-pixel text-[8px] tabular-nums text-gold">{hud.gold}g · {hud.score}</p>

      <div className="pointer-events-auto mx-auto mt-2 flex justify-center gap-2" data-ui>
        <button
          type="button"
          data-ui
          onClick={() => engine?.toggleBook()}
          className="flex h-10 min-w-[6rem] items-center justify-center gap-1.5 border-2 border-fg bg-bg px-3 font-pixel text-[9px] text-fg"
        >
          Book
          <span className="text-muted">{spellLabel}</span>
        </button>
        <button
          type="button"
          data-ui
          onClick={() => engine?.openWheel()}
          className="flex h-10 min-w-[6rem] items-center justify-center gap-1.5 border-2 border-gold bg-bg px-3 font-pixel text-[9px] text-fg"
        >
          Wheel
          <span className="text-gold">100g</span>
        </button>
        {hud.sandbox ? (
          <button
            type="button"
            data-ui
            onClick={() => onSpawn?.()}
            className="flex h-10 items-center justify-center border-2 border-accent bg-bg px-3 font-pixel text-[9px] text-fg"
          >
            Spawn
          </button>
        ) : null}
      </div>
    </div>
  );
}

function Boot() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-bg">
      <p className="font-pixel text-pixel-sm text-muted">Gathering dusk</p>
    </div>
  );
}

function makeRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]!;
  return code;
}

function Title({
  engine,
  bestNight,
}: {
  engine: GameEngine | null;
  bestNight: number;
}) {
  const [menu, setMenu] = useState<"home" | "multiplayer" | "join" | "room" | "name" | "account">("home");
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [playerName, setPlayerName] = useState("Ranger");
  const [nameDraft, setNameDraft] = useState("Ranger");
  const [nameWait, setNameWait] = useState(0);
  const [nameNote, setNameNote] = useState("");
  const [accountPass, setAccountPass] = useState("");
  const [accountNote, setAccountNote] = useState("");
  const [shownPass, setShownPass] = useState("");
  const [shareNote, setShareNote] = useState("");

  useEffect(() => {
    const n = loadPlayerName();
    setPlayerName(n);
    setNameDraft(n);
    setNameWait(nameCooldownMs());
    setShownPass(loadGuestCreds()?.password ?? "");
  }, []);

  useEffect(() => {
    if (menu !== "account") return;
    const tick = () => setShownPass(loadGuestCreds()?.password ?? "");
    tick();
    const id = window.setInterval(tick, 400);
    return () => window.clearInterval(id);
  }, [menu]);

  useEffect(() => {
    if (menu !== "name") return;
    const tick = () => setNameWait(nameCooldownMs());
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [menu]);

  const commitName = () => {
    const result = trySavePlayerName(nameDraft);
    if (!result.ok) {
      setNameWait(result.waitMs);
      setNameNote(`Wait ${formatWait(result.waitMs)}`);
      return;
    }
    setPlayerName(result.name);
    setNameDraft(result.name);
    setNameNote("");
    setMenu("home");
  };

  const submitAccountLogin = async () => {
    setAccountNote("Checking");
    const result = await loginWithPassword(accountPass);
    setAccountNote(result.ok ? "Logged in" : (result.message ?? "Wrong password"));
    if (result.ok) {
      setAccountPass("");
      setMenu("home");
    }
  };

  const createRoom = () => {
    const code = makeRoomCode();
    setRoomCode(code);
    setIsHost(true);
    setMenu("room");
  };

  const submitJoin = () => {
    const code = joinCode.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4);
    if (code.length !== 4) {
      setJoinError("Need 4 letters");
      return;
    }
    setJoinError("");
    setRoomCode(code);
    setIsHost(false);
    setMenu("room");
  };

  const shareGame = async () => {
    const url = typeof window !== "undefined" ? `${window.location.origin}/` : "";
    const text = `Play Wispwood with me: ${url}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Wispwood", text: "Hold the lantern. Outlast the night.", url });
        setShareNote("Sent");
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareNote("Link copied");
    } catch {
      setShareNote(url);
    }
  };

  const leaveRoom = () => {
    setRoomCode(null);
    setIsHost(false);
    setJoinCode("");
    setMenu("multiplayer");
  };

  const titleSrc =
    menu === "multiplayer" || menu === "join" || menu === "room"
      ? asset("game/logo-multiplayer.png")
      : asset("game/logo-wispwood.png");
  const titleAlt =
    menu === "multiplayer" || menu === "join" || menu === "room" ? "Multiplayer" : "Wispwood";

  return (
    <div className="absolute inset-0 flex min-h-0 flex-col items-center justify-center gap-3 overflow-y-auto px-4 py-[max(1.5rem,env(safe-area-inset-top))] pointer-events-auto">
      <img
        src={titleSrc}
        alt={titleAlt}
        className="pixelated h-auto w-[min(90vw,22rem)] max-h-[26vh] shrink-0 object-contain"
      />
      <div className="pointer-events-none shrink-0 text-center">
        <p className="font-pixel text-pixel-sm text-muted">Max night {bestNight}</p>
      </div>

      {menu === "room" && roomCode ? (
          <Lobby
            key={roomCode}
            code={roomCode}
            isHost={isHost}
            playerName={playerName}
            onStart={() => engine?.play()}
            onLeave={leaveRoom}
          />
        ) : menu === "account" ? (
          <div className="pointer-events-auto flex w-full max-w-xs flex-col items-center gap-4">
            <p className="text-center font-pixel text-pixel-sm leading-relaxed text-muted">
              Your lantern password
            </p>
            <div className="w-full border-2 border-muted bg-surface px-3 py-3 text-center">
              <p className="font-pixel text-base tracking-[0.2em] text-gold">
                {shownPass || "……"}
              </p>
            </div>
            <p className="text-center font-pixel text-pixel-sm leading-relaxed text-subtle">
              Type it to log in
            </p>
            <input
              autoFocus
              value={accountPass}
              maxLength={12}
              spellCheck={false}
              autoComplete="off"
              placeholder="PASSWORD"
              onChange={(e) =>
                setAccountPass(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") void submitAccountLogin();
              }}
              className="h-14 w-full border-2 border-muted bg-surface text-center font-pixel text-base tracking-[0.2em] text-fg outline-none placeholder:text-subtle"
            />
            {accountNote ? (
              <p className="font-pixel text-pixel-sm text-gold">{accountNote}</p>
            ) : null}
            <PixelButton primary onClick={() => void submitAccountLogin()}>
              Log in
            </PixelButton>
          </div>
        ) : menu === "name" ? (
          <div className="pointer-events-auto flex w-full max-w-xs flex-col items-center gap-4">
            <p className="text-center font-pixel text-pixel-sm leading-relaxed text-muted">
              Name others will see
            </p>
            <input
              autoFocus
              value={nameDraft}
              maxLength={12}
              spellCheck={false}
              autoComplete="off"
              placeholder="Ranger"
              onChange={(e) => setNameDraft(cleanPlayerName(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitName();
              }}
              className="h-14 w-full border-2 border-muted bg-surface text-center font-pixel text-base text-fg outline-none placeholder:text-subtle"
            />
            {nameWait > 0 ? (
              <p className="font-pixel text-pixel-sm text-gold">Wait {formatWait(nameWait)}</p>
            ) : nameNote ? (
              <p className="font-pixel text-pixel-sm text-muted">{nameNote}</p>
            ) : (
              <p className="font-pixel text-pixel-sm text-subtle">2 min between names</p>
            )}
            <PixelButton primary onClick={commitName}>
              {nameWait > 0 ? "On cooldown" : "Save name"}
            </PixelButton>
          </div>
        ) : menu === "join" ? (
          <div className="pointer-events-auto flex w-full max-w-xs flex-col items-center gap-4">
            <p className="text-center font-pixel text-pixel-sm leading-relaxed text-muted">
              Type your friend's room code
            </p>
            <input
              autoFocus
              value={joinCode}
              maxLength={4}
              spellCheck={false}
              autoCapitalize="characters"
              autoComplete="off"
              placeholder="ABCD"
              onChange={(e) => {
                setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4));
                setJoinError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitJoin();
              }}
              className="h-16 w-full border-2 border-muted bg-surface text-center font-pixel text-xl tracking-[0.4em] text-fg outline-none placeholder:text-subtle"
            />
            {joinError ? (
              <p className="font-pixel text-pixel-sm text-danger">{joinError}</p>
            ) : null}
            <PixelButton primary onClick={submitJoin}>
              Enter lobby
            </PixelButton>
          </div>
        ) : (
          <div className="pointer-events-auto flex w-full max-w-xs flex-col gap-2 border-2 border-fg bg-bg/80 p-3">
            {menu === "multiplayer" ? (
              <>
                <PixelButton primary onClick={createRoom}>
                  Create
                </PixelButton>
                <PixelButton onClick={() => setMenu("join")}>Join</PixelButton>
              </>
            ) : (
              <>
                <PixelButton primary onClick={() => engine?.play()}>
                  Enter the clearing
                </PixelButton>
                <PixelButton onClick={() => engine?.play(true)}>
                  Sand box clearing
                </PixelButton>
                <PixelButton onClick={() => setMenu("multiplayer")}>Multiplayer</PixelButton>
                <PixelButton onClick={() => setMenu("name")}>Name</PixelButton>
                <PixelButton onClick={() => setMenu("account")}>Account</PixelButton>
                <PixelButton onClick={() => void shareGame()}>{shareNote || "Share"}</PixelButton>
              </>
            )}
          </div>
        )}

      <div className="pointer-events-auto flex shrink-0 flex-col items-center gap-2">
        {menu !== "home" ? (
          <button
            type="button"
            onClick={() => {
              if (menu === "room") leaveRoom();
              else if (menu === "join") setMenu("multiplayer");
              else if (menu === "name" || menu === "account") setMenu("home");
              else setMenu("home");
            }}
            className="font-pixel text-pixel-sm text-muted"
          >
            Back
          </button>
        ) : (
          <>
            <p className="text-center font-pixel text-pixel-sm leading-relaxed text-subtle">
              Playing as {playerName}
            </p>
            <p className="text-center font-pixel text-pixel-sm leading-relaxed text-subtle">
              WASD move · tap shoot · B book
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Lobby({
  code,
  isHost,
  playerName,
  onStart,
  onLeave,
}: {
  code: string;
  isHost: boolean;
  playerName: string;
  onStart: () => void;
  onLeave: () => void;
}) {
  const started = useRef(false);
  const enter = () => {
    if (started.current) return;
    started.current = true;
    onStart();
  };
  const p2p = useP2PRoom({ room: `ww${code}`, name: playerName, onStart: enter });
  const others = p2p.peers.length;
  const status = !p2p.joined
    ? "Opening path"
    : others > 0
      ? `${others + 1} lanterns`
      : isHost
        ? "Give this code to a friend"
        : "Waiting for host to start";

  return (
    <div className="pointer-events-auto flex w-full max-w-xs flex-col items-center gap-4">
      <div className="w-full border-2 border-muted bg-surface px-4 py-4 text-center shadow-[4px_4px_0_0_var(--color-bg)]">
        <p className="font-pixel text-pixel-sm text-muted">Room</p>
        <p className="mt-3 font-pixel text-xl tracking-[0.35em] text-fg">{code}</p>
        <p className="mt-3 font-pixel text-pixel-sm leading-relaxed text-subtle">{status}</p>
        <div className="mt-3 flex flex-col gap-1">
          <p className="font-pixel text-pixel-sm text-fg">{playerName}{isHost ? " · host" : ""}</p>
          {p2p.peers.map((peer) => (
            <p key={peer.id} className="font-pixel text-pixel-sm text-muted">
              {peer.name || "Ranger"}
            </p>
          ))}
        </div>
      </div>
      {isHost ? (
        <PixelButton
          primary
          onClick={() => {
            p2p.startRoom();
            enter();
          }}
        >
          Start night
        </PixelButton>
      ) : (
        <p className="text-center font-pixel text-pixel-sm leading-relaxed text-subtle">
          Stay here. You enter when they start.
        </p>
      )}
      <PixelButton onClick={onLeave}>Leave</PixelButton>
    </div>
  );
}

function SpawnMenu({ engine, onClose }: { engine: GameEngine | null; onClose: () => void }) {
  const foes = [
    { kind: "wisp" as const, label: "Wisp" },
    { kind: "runner" as const, label: "Runner" },
    { kind: "brute" as const, label: "Brute" },
    { kind: "elite" as const, label: "Elite" },
  ];
  return (
    <div className="absolute inset-0 z-40 grid place-items-center overflow-y-auto bg-bg/75 px-3 py-6 pointer-events-auto">
      <div className="pointer-events-auto flex w-full max-w-sm flex-col items-center gap-3 border-2 border-fg bg-surface px-3 py-4">
        <p className="font-pixel text-pixel text-fg">Spawn</p>
        <p className="font-pixel text-pixel-sm text-muted">Sandbox is empty until you drop a foe</p>
        <div className="grid w-full grid-cols-2 gap-2">
          {foes.map((f) => (
            <button
              key={f.kind}
              type="button"
              data-ui
              onClick={() => engine?.spawnFoe(f.kind)}
              className="h-11 border-2 border-fg bg-bg font-pixel text-[10px] text-fg"
            >
              {f.label}
            </button>
          ))}
        </div>
        <p className="mt-1 font-pixel text-pixel-sm text-gold">Bosses</p>
        <div className="grid max-h-[42vh] w-full grid-cols-2 gap-2 overflow-y-auto overscroll-contain">
          {BOSSES.map((b, i) => (
            <button
              key={b.name}
              type="button"
              data-ui
              onClick={() => engine?.spawnBoss(i)}
              className="h-12 shrink-0 border-2 bg-bg px-1 font-pixel text-[9px] text-fg"
              style={{ borderColor: b.color2, color: b.color2 }}
            >
              {b.name}
            </button>
          ))}
        </div>
        <PixelButton onClick={() => engine?.lineupBosses()}>Line up bosses</PixelButton>
        <PixelButton onClick={() => engine?.clearFoes()}>Clear all</PixelButton>
        <PixelButton primary onClick={onClose}>
          Close
        </PixelButton>
      </div>
    </div>
  );
}

function CoreGlyph({ spell }: { spell: Spell }) {
  const rows = coreGlyph(spell === "craft" ? "ember" : spell);
  const color = CORE_COLOR[spell] ?? "#e08a3c";
  return (
    <span className="inline-grid" style={{ gridTemplateColumns: "repeat(9, 3px)" }}>
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) => (
          <span
            key={`${x}-${y}`}
            style={{
              width: 3,
              height: 3,
              background: ch === "." ? "transparent" : ch === "+" ? "#fff" : color,
            }}
          />
        )),
      )}
    </span>
  );
}

function SpellGlyph({ color, name }: { color: string; name: string }) {
  const rows = glyphFor(name);
  return (
    <span className="inline-grid" style={{ gridTemplateColumns: "repeat(8, 2px)" }}>
      {rows.flatMap((row, y) =>
        [...row].map((ch, x) => (
          <span
            key={`${x}-${y}`}
            style={{
              width: 2,
              height: 2,
              background: ch === "." ? "transparent" : ch === "+" ? "#fff" : color,
            }}
          />
        )),
      )}
    </span>
  );
}

function PixelButton({
  children,
  onClick,
  primary = false,
}: {
  children: ReactNode;
  onClick: () => void;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      data-ui
      onClick={onClick}
      className={
        "h-14 w-full rounded-none border-2 px-3 font-pixel text-pixel leading-tight shadow-[4px_4px_0_0_var(--color-bg)] transition-transform duration-150 active:translate-x-px active:translate-y-px " +
        (primary
          ? "border-fg bg-accent text-accent-fg"
          : "border-muted bg-surface text-fg")
      }
    >
      {children}
    </button>
  );
}

function Pause({ engine, hud }: { engine: GameEngine | null; hud: HudState }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-bg/70 pointer-events-auto">
      <div className="pointer-events-auto flex w-[min(92vw,20rem)] flex-col gap-2 border-2 border-fg bg-surface p-4">
        <p className="text-center font-pixel text-pixel text-fg">Paused</p>
        <PixelButton primary onClick={() => engine?.togglePause()}>
          Resume
        </PixelButton>
        <PixelButton onClick={() => engine?.openBook()}>Spellbook</PixelButton>
        <PixelButton onClick={() => engine?.toggleMute()}>
          {hud.muted ? "Sound off" : "Sound on"}
        </PixelButton>
        <PixelButton onClick={() => engine?.leaveRun()}>Leave</PixelButton>
      </div>
    </div>
  );
}

function spellName(spell: Spell, crafted?: CraftedSpell | null) {
  if (spell === "frost") return "Ice";
  if (spell === "bolt") return "Bolt";
  if (spell === "void") return "Void";
  if (spell === "vine") return "Vine";
  if (spell === "boom") return "Explosion";
  if (spell === "craft") return crafted?.name || "Rune";
  return "Ember";
}

function FortuneWheel({ engine, hud }: { engine: GameEngine | null; hud: HudState }) {
  const [spinning, setSpinning] = useState(false);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState<"idle" | "miss" | "craft" | "poor" | "pick" | "jackpot">("idle");
  const [made, setMade] = useState("");
  const [picks, setPicks] = useState<CraftedSpell[]>([]);
  const spinTimer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(spinTimer.current), []);

  const takeSpell = (spell: CraftedSpell) => {
    engine?.saveCrafted(spell);
    setMade(spell.name);
    setResult("craft");
    setPicks([]);
  };

  const takeJackpot = () => {
    if (!hud.sandbox || spinning) return;
    engine?.fanfare();
    setSpinning(true);
    setResult("idle");
    setMade("");
    const extra = 5 + Math.floor(Math.random() * 3);
    setAngle(360 * extra);
    window.clearTimeout(spinTimer.current);
    spinTimer.current = window.setTimeout(() => {
      setSpinning(false);
      const prize = engine?.grantJackpot(pickLegendary());
      setMade(prize?.name ?? "Rune");
      setResult("jackpot");
    }, 1400);
  };

  const spin = () => {
    if (spinning || result === "craft" || result === "pick" || result === "jackpot") return;
    const rolled = engine?.spinWheel();
    if (!rolled || rolled === "poor") {
      setResult("poor");
      return;
    }
    if (rolled === "jackpot") engine?.fanfare();
    setSpinning(true);
    setResult("idle");
    setMade("");
    const extra = 5 + Math.floor(Math.random() * 3);
    setAngle(
      rolled === "jackpot"
        ? 360 * extra
        : rolled === "craft"
          ? 360 * extra + 45
          : 360 * extra + 225,
    );
    window.clearTimeout(spinTimer.current);
    spinTimer.current = window.setTimeout(() => {
      setSpinning(false);
      if (rolled === "jackpot") {
        const prize = engine?.grantJackpot(pickLegendary());
        setMade(prize?.name ?? "Rune");
        setResult("jackpot");
        return;
      }
      if (rolled === "craft") {
        setPicks(wheelChoices(8));
        setResult("pick");
        return;
      }
      setResult(rolled);
    }, 1400);
  };

  return (
    <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-bg/75 px-4 py-6 pointer-events-auto">
      <div className="pointer-events-auto flex w-full max-w-sm flex-col items-center gap-3">
        {result === "jackpot" ? (
          <div className="flex w-full flex-col items-center gap-3 border-4 border-gold bg-surface px-4 py-5 text-center">
            <p className="font-pixel text-pixel text-gold">JACKPOT</p>
            <p className="font-pixel text-pixel-sm leading-relaxed text-fg">A legendary binds to the book</p>
            <p className="font-pixel text-base text-gold">{made || "Rune"}</p>
            <p className="font-pixel text-pixel-sm text-gold">+1000g</p>
            <p className="font-pixel text-pixel-sm tabular-nums text-muted">{hud.gold}g</p>
            {hud.sandbox ? (
              <PixelButton onClick={() => setResult("idle")}>Once more</PixelButton>
            ) : null}
          </div>
        ) : result === "craft" ? (
          <p className="font-pixel text-pixel-sm text-gold">Bound {made || "rune"} to the book</p>
        ) : result === "pick" ? (
          <>
            <p className="font-pixel text-pixel text-fg">A spell answers</p>
            <p className="font-pixel text-pixel-sm text-muted">Each one is unique. Pick one.</p>
            <div className="flex w-full flex-col gap-2">
              {picks.map((spell) => (
                <button
                  key={spell.name + spell.rarity}
                  type="button"
                  data-ui
                  onClick={() => takeSpell(spell)}
                  className="flex items-stretch gap-2 border-2 bg-surface text-left"
                  style={{ borderColor: rarityTint(spell.rarity) }}
                >
                  <span className="w-2 shrink-0" style={{ background: spell.color }} />
                  <span className="flex min-w-0 flex-1 flex-col gap-1 px-2 py-2">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-pixel text-[10px]" style={{ color: spell.color }}>
                        {spell.name}
                      </span>
                      <span className="font-pixel text-[7px]" style={{ color: rarityTint(spell.rarity) }}>
                        {spell.rarity}
                      </span>
                    </span>
                    <span className="font-pixel text-[8px] leading-relaxed text-fg">{spellFlavor(spell)}</span>
                    <span className="font-pixel text-[7px] text-muted">
                      {spell.damage} dmg · {spell.cooldown.toFixed(2)}s
                    </span>
                  </span>
                  <span className="flex w-10 shrink-0 items-center justify-center">
                    <SpellGlyph color={spell.color} name={spell.name} />
                  </span>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="font-pixel text-pixel text-fg">Wyrd wheel</p>
            <p className="font-pixel text-pixel-sm text-gold">100g to spin a custom spell</p>
            <div className="relative size-52">
              <div
                className="size-52 overflow-hidden rounded-full border-4 border-fg"
                style={{
                  transform: `rotate(${angle}deg)`,
                  transition: spinning ? "transform 1.35s cubic-bezier(0.12, 0.7, 0.2, 1)" : "none",
                  background:
                    "conic-gradient(#3d7a45 0deg 160deg, #f0d24a 160deg 180deg, #1c1e1b 180deg 340deg, #c45a48 340deg 360deg)",
                }}
              />
              <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 border-x-8 border-t-[14px] border-x-transparent border-t-gold" />
              <p className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 font-pixel text-[8px] text-fg">
                SPELL
              </p>
              <p className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 font-pixel text-[8px] text-muted">
                NONE
              </p>
            </div>
            {result === "miss" ? (
              <p className="font-pixel text-pixel-sm text-muted">The clearing stays quiet</p>
            ) : null}
            {result === "poor" ? (
              <p className="font-pixel text-pixel-sm text-gold">Need 100g</p>
            ) : null}
            <p className="font-pixel text-pixel-sm tabular-nums text-gold">{hud.gold}g</p>
            <PixelButton primary onClick={spin}>
              {spinning ? "Spinning" : "Spin"}
            </PixelButton>
            {hud.sandbox ? (
              <PixelButton onClick={takeJackpot}>{spinning ? "..." : "Jackpot"}</PixelButton>
            ) : null}
          </>
        )}
        <PixelButton onClick={() => engine?.closeWheel()}>Back</PixelButton>
      </div>
    </div>
  );
}

function Spellbook({ engine, hud }: { engine: GameEngine | null; hud: HudState }) {
  const pages: Spell[] = hud.crafted
    ? ["ember", "frost", "bolt", "void", "vine", "boom", "craft"]
    : ["ember", "frost", "bolt", "void", "vine", "boom"];
  const [page, setPage] = useState(() => {
    const i = pages.indexOf(hud.spell);
    return i < 0 ? 0 : i;
  });
  const [tuning, setTuning] = useState(false);
  const lastTap = useRef(0);
  const spell = pages[page] ?? "ember";
  const dmg = spellDamage(spell, hud.upgrades[spell].damage, hud.crafted);

  const flip = (dir: -1 | 1) => {
    const next = page + dir;
    if (next < 0 || next >= pages.length) return;
    setTuning(false);
    setPage(next);
  };

  const onPageClick = () => {
    if (spell === "bolt" && !hud.boltUnlocked) return;
    if (spell === "void" && !hud.voidUnlocked) return;
    if (spell === "vine" && !hud.vineUnlocked) return;
    if (spell === "boom" && !hud.boomUnlocked) return;
    const now = performance.now();
    if (now - lastTap.current < 380) {
      lastTap.current = 0;
      engine?.chooseSpell(spell);
      setTuning(true);
      return;
    }
    lastTap.current = now;
    engine?.chooseSpell(spell);
  };

  const lines =
    spell === "craft"
      ? [
          `${hud.crafted?.rarity ?? "common"}`,
          `${dmg} damage`,
          hud.crafted ? spellFlavor(hud.crafted) : "a bolt",
        ]
      : spell === "void" && !hud.voidUnlocked
        ? ["Locked", "300 gold", "This night"]
        : spell === "bolt" && !hud.boltUnlocked
        ? ["Locked", "100 gold", "This night"]
        : spell === "vine" && !hud.vineUnlocked
        ? ["Locked", "1777 gold", "This night"]
        : spell === "boom" && !hud.boomUnlocked
        ? ["Locked", "2500 gold", "This night"]
        : spell === "ember"
          ? [`${dmg} damage`, "Soft weave, pops on turns", "Pops deal little dmg"]
          : spell === "frost"
            ? [`${dmg} dmg x3`, "Slows what it hits", "Double-tap to tune"]
            : spell === "void"
              ? [`${dmg} damage`, "Orbits you 2s", "2.5s wait"]
              : spell === "vine"
                ? [`${dmg} damage`, "Auto-wraps if close", "Homing per wrap"]
              : spell === "boom"
                ? [`${dmg} damage`, "Pixel blast knockback", "0.20s wait"]
              : [`${dmg} damage`, "Yellow stun trail", "1.5s wait"];

  return (
    <div className="absolute inset-0 grid place-items-center overflow-y-auto bg-bg/80 px-3 py-2 pointer-events-auto">
      <div className="flex w-full max-w-lg max-h-full flex-col items-center gap-2">
        <div className="relative w-full max-h-[min(70%,22rem)]">
          <img
            src={asset("game/hud-spellbook.png")}
            alt="Spellbook"
            className="pixelated h-auto max-h-[min(70vh,22rem)] w-full select-none object-contain"
            draggable={false}
          />

          {tuning ? (
            <UpgradePanel
              spell={spell}
              hud={hud}
              onUpgrade={(stat) => engine?.upgradeSpell(spell, stat)}
              onBack={() => setTuning(false)}
            />
          ) : (
            <div className="absolute inset-x-[12%] inset-y-[18%] grid grid-cols-2 gap-[8%]">
              <div className="flex flex-col items-center justify-center px-1 text-center font-pixel text-bg">
                <p className="text-pixel-sm text-bg/70">
                  {page + 1} / {pages.length}
                </p>
                <span className="mt-2">
                  {spell === "craft" && hud.crafted ? (
                    <SpellGlyph color={hud.crafted.color} name={hud.crafted.name} />
                  ) : (
                    <CoreGlyph spell={spell} />
                  )}
                </span>
                <p className="mt-2 text-pixel">{spellName(spell, hud.crafted)}</p>
                {hud.spell === spell ? <p className="mt-2 text-pixel-sm">Prepared</p> : null}
              </div>
              <button
                type="button"
                data-ui
                onClick={onPageClick}
                className="flex flex-col items-center justify-center gap-1.5 px-1 text-center font-pixel text-bg"
              >
                {lines.map((line) => (
                  <span key={line} className="text-pixel-sm leading-relaxed">
                    {line}
                  </span>
                ))}
              </button>
            </div>
          )}
        </div>
        <p className="font-pixel text-pixel-sm tabular-nums text-gold">{hud.gold}g</p>
        <div className="flex w-full max-w-xs gap-2">
          <PixelButton onClick={() => flip(-1)}>Prev</PixelButton>
          <PixelButton onClick={() => flip(1)}>Next</PixelButton>
        </div>
        {spell === "bolt" && !hud.boltUnlocked ? (
          <div className="w-full max-w-xs">
            <PixelButton primary onClick={() => engine?.unlockBolt()}>
              {hud.gold < 100 ? "Need 100g" : "Buy Bolt 100g"}
            </PixelButton>
          </div>
        ) : null}
        {spell === "void" && !hud.voidUnlocked ? (
          <div className="w-full max-w-xs">
            <PixelButton primary onClick={() => engine?.unlockVoid()}>
              {hud.gold < 300 ? "Need 300g" : "Buy Void 300g"}
            </PixelButton>
          </div>
        ) : null}
        {spell === "vine" && !hud.vineUnlocked ? (
          <div className="w-full max-w-xs">
            <PixelButton primary onClick={() => engine?.unlockVine()}>
              {hud.gold < 1777 ? "Need 1777g" : "Buy Vine 1777g"}
            </PixelButton>
          </div>
        ) : null}
        {spell === "boom" && !hud.boomUnlocked ? (
          <div className="w-full max-w-xs">
            <PixelButton primary onClick={() => engine?.unlockBoom()}>
              {hud.gold < 2500 ? "Need 2500g" : "Buy Explosion 2500g"}
            </PixelButton>
          </div>
        ) : null}
        <div className="w-full max-w-xs">
          <PixelButton primary onClick={() => engine?.closeBook()}>
            Close book
          </PixelButton>
        </div>
      </div>
    </div>
  );
}

function UpgradePanel({
  spell,
  hud,
  onUpgrade,
  onBack,
}: {
  spell: Spell;
  hud: HudState;
  onUpgrade: (stat: SpellStat) => void;
  onBack: () => void;
}) {
  const ups = hud.upgrades[spell];
  const name = spellName(spell, hud.crafted);
  return (
    <div className="absolute inset-x-[12%] inset-y-[16%] flex flex-col items-center justify-between py-1">
      <p className="font-pixel text-pixel text-bg">{name}</p>
      <div className="grid w-full grid-cols-2 gap-[10%]">
        <UpgradeStat
          label="Speed"
          level={ups.speed}
          gold={hud.gold}
          onUpgrade={() => onUpgrade("speed")}
        />
        <UpgradeStat
          label="Damage"
          level={ups.damage}
          gold={hud.gold}
          onUpgrade={() => onUpgrade("damage")}
        />
      </div>
      <button type="button" data-ui onClick={onBack} className="font-pixel text-pixel-sm text-bg">
        Back
      </button>
    </div>
  );
}

function UpgradeStat({
  label,
  level,
  gold,
  onUpgrade,
}: {
  label: string;
  level: number;
  gold: number;
  onUpgrade: () => void;
}) {
  const maxed = level >= MAX_SPELL_UP;
  const cost = upgradeCost(level);
  const can = !maxed && gold >= cost;
  return (
    <div className="flex flex-col items-center text-center font-pixel text-bg">
      <p className="text-pixel-sm">{label}</p>
      <p className="mt-1 text-pixel-sm tabular-nums">
        {level}/{MAX_SPELL_UP}
      </p>
      <p className="mt-1 text-pixel-sm tabular-nums text-bg/80">{maxed ? "Max" : `${cost}g`}</p>
      <button
        type="button"
        data-ui
        disabled={!can}
        onClick={onUpgrade}
        className={
          "mt-2 border-2 border-bg px-2 py-1 text-pixel-sm " +
          (can ? "bg-bg/10 text-bg" : "opacity-40")
        }
      >
        Upgrade
      </button>
    </div>
  );
}

function Dead({ engine, hud }: { engine: GameEngine | null; hud: HudState }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-bg/75 pointer-events-auto">
      <div className="pointer-events-auto w-[min(92vw,22rem)] border-2 border-fg bg-surface p-5 text-center">
        <p className="font-pixel text-pixel-sm text-muted">The lantern fades</p>
        <p className="mt-3 font-pixel text-xl text-fg">Night {hud.wave}</p>
        <p className="mt-2 font-pixel text-pixel-sm text-gold">Max {hud.bestNight}</p>
        <p className="mt-3 font-pixel text-pixel-sm text-muted">Score {hud.score}</p>
        <div className="mt-5 flex flex-col gap-2">
          <PixelButton primary onClick={() => engine?.replay()}>
            Light it again
          </PixelButton>
          <PixelButton onClick={() => engine?.leaveRun()}>Leave</PixelButton>
        </div>
      </div>
    </div>
  );
}

function TouchSticks({ engine, compact = false }: { engine: GameEngine | null; compact?: boolean }) {
  return (
    <div
      className={
        compact
          ? "pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-6 pb-2"
          : "pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))]"
      }
    >
      <Stick
        compact={compact}
        onVec={(x, y) => engine?.setTouchMove(x, y)}
        onEnd={() => engine?.setTouchMove(0, 0)}
      />
      <Stick
        compact={compact}
        onVec={(x, y) => engine?.setTouchAim(x, y, true)}
        onEnd={() => engine?.setTouchAim(0, 0, false)}
      />
    </div>
  );
}

function Stick({
  onVec,
  onEnd,
  compact = false,
}: {
  onVec: (x: number, y: number) => void;
  onEnd: () => void;
  compact?: boolean;
}) {
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
        if (!active.current) return;
        point(e.clientX, e.clientY);
      }}
      onPointerUp={() => {
        active.current = false;
        onEnd();
      }}
      onPointerCancel={() => {
        active.current = false;
        onEnd();
      }}
      className={
        compact
          ? "pointer-events-auto size-16 rounded-full border-2 border-fg/70 bg-bg/50 touch-none"
          : "pointer-events-auto size-28 rounded-full border-2 border-fg/70 bg-bg/50 touch-none"
      }
    />
  );
}
