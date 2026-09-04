import { BookOpen } from "lucide-react";
import type { CraftedSpell, GameEngine, Spell, SpellStat } from "@/game/engine";
import type { HudState } from "@/game/engine";
import { MAX_SPELL_UP, spellDamage, upgradeCost } from "@/game/engine";
import { loadPlayerName, trySavePlayerName, cleanPlayerName, nameCooldownMs, formatWait } from "@/game/player-name";
import { loadGuestCreds, loginWithPassword } from "@/game/guest-account";
import { generateSpell } from "@/game/spell-prompt";
import { asset } from "@/game/paths";
import { useP2PRoom } from "@/lib/multiplayer/use-p2p-room";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Props = {
  engine: GameEngine | null;
  hud: HudState;
};

export function GameOverlay({ engine, hud }: Props) {
  const coarse =
    typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  const showSticks = coarse && hud.phase === "playing";

  return (
    <div
      className="pointer-events-none text-fg"
      style={{ position: "fixed", inset: 0, zIndex: 20, width: "100%", height: "100%" }}
    >
      {hud.phase === "playing" || hud.phase === "paused" || hud.phase === "book" || hud.phase === "wheel" ? (
        <Hud engine={engine} hud={hud} />
      ) : null}

      {hud.phase === "boot" || hud.loading ? <Boot /> : null}
      {hud.phase === "title" && !hud.loading ? (
        <Title engine={engine} bestNight={hud.bestNight} />
      ) : null}
      {hud.phase === "paused" ? <Pause engine={engine} /> : null}
      {hud.phase === "book" ? <Spellbook engine={engine} hud={hud} /> : null}
      {hud.phase === "wheel" ? <FortuneWheel engine={engine} hud={hud} /> : null}
      {hud.phase === "dead" ? <Dead engine={engine} hud={hud} /> : null}

      {showSticks ? <TouchSticks engine={engine} /> : null}
    </div>
  );
}

function Hud({ engine, hud }: { engine: GameEngine | null; hud: HudState }) {
  const pct = Math.max(0, hud.hp / hud.maxHp);
  return (
    <div
      className="pointer-events-none px-3"
      style={{ paddingTop: "max(3.25rem, calc(env(safe-area-inset-top, 0px) + 2.25rem))" }}
    >
      <div className="mx-auto flex max-w-sm items-stretch justify-center gap-2">
        <div className="flex-1 rounded-xl border-2 border-fg bg-bg/90 px-3 py-2 text-center">
          <p className="font-pixel text-[8px] tracking-wide text-muted">NIGHT</p>
          <p className="mt-1 font-pixel text-2xl tabular-nums leading-none text-fg">{hud.wave}</p>
        </div>
        <div className="flex-1 rounded-xl border-2 border-gold bg-bg/90 px-3 py-2 text-center">
          <p className="font-pixel text-[8px] tracking-wide text-gold">MAX NIGHTS</p>
          <p className="mt-1 font-pixel text-2xl tabular-nums leading-none text-gold">{hud.bestNight}</p>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="min-w-0 rounded-xl border border-border bg-bg/80 px-2.5 py-1.5">
          <p className="text-[9px] font-medium tracking-[0.16em] text-muted uppercase">Lantern</p>
          <div className="mt-1 h-1.5 w-20 overflow-hidden rounded-full bg-elevated sm:w-32">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-150"
              style={{ width: `${pct * 100}%` }}
            />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-bg/80 px-2.5 py-1.5 text-right">
          <p className="text-[9px] font-medium tracking-[0.16em] text-muted uppercase">Score</p>
          <p className="font-display text-lg font-medium tabular-nums leading-none">{hud.score}</p>
          <p className="font-pixel text-[8px] tabular-nums text-gold">{hud.gold}g</p>
        </div>
      </div>

      <div className="pointer-events-auto mx-auto mt-3 flex justify-center gap-2" data-ui>
        <button
          type="button"
          data-ui
          onClick={() => engine?.toggleBook()}
          className="flex h-11 min-w-[7.5rem] items-center justify-center gap-1.5 border-2 border-fg bg-bg px-4 font-pixel text-[10px] text-fg"
        >
          <BookOpen className="size-3.5" strokeWidth={2} />
          Book
          <span className="text-muted">
            {hud.spell === "frost"
              ? "Ice"
              : hud.spell === "bolt"
                ? "Bolt"
                : hud.spell === "void"
                  ? "Void"
                  : hud.spell === "vine"
                    ? "Vine"
                  : hud.spell === "craft"
                  ? (hud.crafted?.name ?? "Rune")
                  : "Ember"}
          </span>
        </button>
        <button
          type="button"
          data-ui
          onClick={() => engine?.openWheel()}
          className="flex h-11 min-w-[7.5rem] items-center justify-center gap-1.5 border-2 border-gold bg-bg px-4 font-pixel text-[10px] text-fg"
        >
          Wheel
          <span className="text-gold">100g</span>
        </button>
      </div>
    </div>
  );
}

function Boot() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-bg">
      <p className="text-sm tracking-[0.22em] text-muted uppercase">Gathering dusk</p>
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
    <div className="absolute inset-0 flex min-h-0 flex-col items-center justify-center gap-3 overflow-y-auto px-4 py-[max(1.5rem,env(safe-area-inset-top))]">
      <div className="pointer-events-none shrink-0 text-center">
        <p className="font-pixel text-pixel-sm text-muted">Max night</p>
        <p className="mt-1 font-display text-2xl tabular-nums sm:text-3xl">{bestNight}</p>
      </div>
      <img
        src={titleSrc}
        alt={titleAlt}
        className="h-auto w-[min(88vw,20rem)] max-h-[12vh] shrink-0 object-contain"
      />

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
          <div className="pointer-events-auto flex w-full max-w-xs flex-col gap-2 rounded-2xl border-2 border-border bg-bg/80 p-3">
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
                <PixelButton onClick={() => setMenu("multiplayer")}>Join</PixelButton>
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

function Pause({ engine }: { engine: GameEngine | null }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-bg/60">
      <div className="pointer-events-auto flex w-[min(92vw,20rem)] flex-col gap-3 rounded-3xl border border-border bg-surface p-6">
        <p className="text-center font-display text-2xl">Paused</p>
        <button
          type="button"
          onClick={() => engine?.togglePause()}
          className="h-11 rounded-xl border border-border text-sm font-medium"
        >
          Resume
        </button>
        <button
          type="button"
          onClick={() => engine?.openBook()}
          className="h-11 rounded-xl border border-border text-sm font-medium"
        >
          Spellbook
        </button>
        <button
          type="button"
          onClick={() => engine?.leaveRun()}
          className="h-11 rounded-xl border border-border text-sm font-medium"
        >
          Leave
        </button>
        <button
          type="button"
          onClick={() => engine?.toggleMute()}
          className="h-11 rounded-xl border border-border text-sm font-medium"
        >
          Toggle sound
        </button>
      </div>
    </div>
  );
}

function spellName(spell: Spell, crafted?: CraftedSpell | null) {
  if (spell === "frost") return "Ice";
  if (spell === "bolt") return "Bolt";
  if (spell === "void") return "Void";
  if (spell === "vine") return "Vine";
  if (spell === "craft") return crafted?.name || "Rune";
  return "Ember";
}

function FortuneWheel({ engine, hud }: { engine: GameEngine | null; hud: HudState }) {
  const [spinning, setSpinning] = useState(false);
  const [weaving, setWeaving] = useState(false);
  const [angle, setAngle] = useState(0);
  const [result, setResult] = useState<"idle" | "miss" | "craft" | "poor">("idle");
  const [prompt, setPrompt] = useState("");
  const [made, setMade] = useState("");

  const spin = () => {
    if (spinning || weaving || result === "craft") return;
    const rolled = engine?.spinWheel();
    if (!rolled || rolled === "poor") {
      setResult("poor");
      return;
    }
    setSpinning(true);
    setResult("idle");
    setMade("");
    const extra = 5 + Math.floor(Math.random() * 3);
    setAngle(rolled === "craft" ? 360 * extra + 45 : 360 * extra + 225);
    window.setTimeout(() => {
      setSpinning(false);
      if (rolled === "craft") {
        void weaveSpell();
        return;
      }
      setResult(rolled);
    }, 1400);
  };

  const weaveSpell = async () => {
    setWeaving(true);
    setResult("craft");
    try {
      const spell = generateSpell(prompt);
      engine?.saveCrafted(spell);
      setMade(spell.name);
    } catch {
      const spell = generateSpell(prompt);
      engine?.saveCrafted(spell);
      setMade(spell.name);
    } finally {
      setWeaving(false);
    }
  };

  return (
    <div className="absolute inset-0 grid place-items-center bg-bg/75 px-4">
      <div className="pointer-events-auto flex w-full max-w-sm flex-col items-center gap-4">
        {result === "craft" ? (
          <p className="font-pixel text-pixel-sm text-gold">Bound to the book</p>
        ) : (
          <>
            <p className="font-pixel text-pixel text-fg">Fortune wheel</p>
            <p className="font-pixel text-pixel-sm text-gold">100g to spin</p>
            <div className="relative size-52">
              <div
                className="size-52 overflow-hidden rounded-full border-4 border-fg"
                style={{
                  transform: `rotate(${angle}deg)`,
                  transition: spinning ? "transform 1.35s cubic-bezier(0.12, 0.7, 0.2, 1)" : "none",
                  background: "conic-gradient(#c8ccd4 0deg 180deg, #2a2c28 180deg 360deg)",
                }}
              />
              <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 border-x-8 border-t-[14px] border-x-transparent border-t-gold" />
              <p className="pointer-events-none absolute top-10 left-1/2 -translate-x-1/2 font-pixel text-pixel-sm text-accent-fg">
                SPELL
              </p>
              <p className="pointer-events-none absolute bottom-10 left-1/2 -translate-x-1/2 font-pixel text-pixel-sm text-muted">
                NONE
              </p>
            </div>
            {result === "miss" ? (
              <p className="font-pixel text-pixel-sm text-muted">The wheel is quiet</p>
            ) : null}
            {result === "poor" ? (
              <p className="font-pixel text-pixel-sm text-gold">Need 100g</p>
            ) : null}
            <p className="font-pixel text-pixel-sm tabular-nums text-gold">{hud.gold}g</p>
            <input
              value={prompt}
              maxLength={80}
              spellCheck={false}
              autoComplete="off"
              placeholder="hint: ice meteor"
              onChange={(e) => setPrompt(e.target.value)}
              className="h-12 w-full border-2 border-muted bg-surface px-3 text-center font-pixel text-base text-fg outline-none placeholder:text-subtle"
            />
            <PixelButton primary onClick={spin}>
              {spinning ? "Spinning" : "Spin"}
            </PixelButton>
          </>
        )}
        <PixelButton onClick={() => engine?.closeWheel()}>Back</PixelButton>
      </div>
    </div>
  );
}

function Spellbook({ engine, hud }: { engine: GameEngine | null; hud: HudState }) {
  const pages: Spell[] = hud.crafted
    ? ["ember", "frost", "bolt", "void", "vine", "craft"]
    : ["ember", "frost", "bolt", "void", "vine"];
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
    if (spell === "bolt" && !hud.boltUnlocked) {
      engine?.unlockBolt();
      return;
    }
    if (spell === "void" && !hud.voidUnlocked) {
      engine?.unlockVoid();
      return;
    }
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
          `${dmg} damage`,
          hud.crafted?.shape ?? "single",
          hud.crafted?.extra === "none" ? "No extra" : (hud.crafted?.extra ?? ""),
        ]
      : spell === "void" && !hud.voidUnlocked
        ? ["Locked", "300 gold", "This night"]
        : spell === "bolt" && !hud.boltUnlocked
        ? ["Locked", "100 gold", "This night"]
        : spell === "ember"
          ? [`${dmg} damage`, "Weaves as it flies", "Double-tap to tune"]
          : spell === "frost"
            ? [`${dmg} dmg x3`, "Slows what it hits", "Double-tap to tune"]
            : spell === "void"
              ? [`${dmg} damage`, "Orbits you 2s", "2.5s wait"]
              : spell === "vine"
                ? [`${dmg} damage`, "Auto-wraps if close", "Homing per wrap"]
              : [`${dmg} damage`, "Yellow stun trail", "1.5s wait"];

  return (
    <div className="absolute inset-0 grid place-items-center bg-bg/75 px-3">
      <div className="pointer-events-auto flex w-full max-w-3xl flex-col items-center gap-4">
        <div className="relative w-full">
          <img
            src={asset("game/hud-spellbook.png")}
            alt="Spellbook"
            className="pixelated h-auto w-full select-none"
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
            <div className="absolute inset-x-[11%] inset-y-[16%] grid grid-cols-2 gap-[10%]">
              <div className="flex flex-col items-center justify-center px-2 text-center font-pixel text-bg">
                <p className="text-pixel-sm text-bg/70">
                  {page + 1} / {pages.length}
                </p>
                <p className="mt-3 text-pixel">{spellName(spell, hud.crafted)}</p>
                {hud.spell === spell ? <p className="mt-3 text-pixel-sm">Prepared</p> : null}
              </div>
              <button
                type="button"
                data-ui
                onClick={onPageClick}
                className="flex flex-col items-center justify-center gap-2 px-2 text-center font-pixel text-bg"
              >
                {lines.map((line) => (
                  <span key={line} className="text-pixel-sm leading-relaxed">
                    {line}
                  </span>
                ))}
              </button>
            </div>
          )}

          <button
            type="button"
            data-ui
            disabled={page <= 0}
            onClick={() => flip(-1)}
            className="absolute top-1/2 left-1 -translate-y-1/2 border-2 border-bg bg-surface/80 px-2 py-3 font-pixel text-pixel text-fg disabled:opacity-30"
          >
            {"<"}
          </button>
          <button
            type="button"
            data-ui
            disabled={page >= pages.length - 1}
            onClick={() => flip(1)}
            className="absolute top-1/2 right-1 -translate-y-1/2 border-2 border-bg bg-surface/80 px-2 py-3 font-pixel text-pixel text-fg disabled:opacity-30"
          >
            {">"}
          </button>
        </div>
        <p className="font-pixel text-pixel-sm tabular-nums text-gold">{hud.gold}g</p>
        {spell === "void" && !hud.voidUnlocked ? (
          <div className="w-full max-w-xs">
            <PixelButton primary onClick={() => engine?.unlockVoid()}>
              {hud.gold < 300 ? "Need 300g" : "Buy Void 300g"}
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
    <div className="absolute inset-0 grid place-items-center bg-bg/70">
      <div className="pointer-events-auto w-[min(92vw,22rem)] rounded-3xl border border-border bg-surface p-7 text-center">
        <p className="text-[11px] font-medium tracking-[0.22em] text-muted uppercase">The lantern fades</p>
        <h2 className="mt-2 font-display text-4xl font-medium">Night {hud.wave}</h2>
        <p className="mt-1 font-pixel text-pixel-sm text-muted">Max night {hud.bestNight}</p>
        <p className="mt-4 text-sm text-muted">Score {hud.score}</p>
        <div className="mt-6">
          <PixelButton primary onClick={() => engine?.replay()}>
            Light it again
          </PixelButton>
        </div>
      </div>
    </div>
  );
}

function TouchSticks({ engine }: { engine: GameEngine | null }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-between px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
      <Stick onVec={(x, y) => engine?.setTouchMove(x, y)} onEnd={() => engine?.setTouchMove(0, 0)} />
      <Stick
        onVec={(x, y) => engine?.setTouchAim(x, y, true)}
        onEnd={() => engine?.setTouchAim(0, 0, false)}
      />
    </div>
  );
}

function Stick({
  onVec,
  onEnd,
}: {
  onVec: (x: number, y: number) => void;
  onEnd: () => void;
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
      className="pointer-events-auto size-28 rounded-full border-2 border-fg/70 bg-bg/50 touch-none"
    />
  );
}
