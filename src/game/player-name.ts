const KEY = "wispwood-player-name";
const STAMP_KEY = "wispwood-player-name-at";
const MAX = 12;
export const NAME_COOLDOWN_MS = 120_000;

export function loadPlayerName() {
  try {
    const cleaned = cleanPlayerName(window.localStorage.getItem(KEY) ?? "");
    if (cleaned) return cleaned;
  } catch {
    /* ignore */
  }
  return "Ranger";
}

export function nameCooldownMs() {
  try {
    const at = Number(window.localStorage.getItem(STAMP_KEY) ?? 0);
    if (!Number.isFinite(at) || at <= 0) return 0;
    return Math.max(0, at + NAME_COOLDOWN_MS - Date.now());
  } catch {
    return 0;
  }
}

export function trySavePlayerName(name: string): { ok: true; name: string } | { ok: false; waitMs: number } {
  const cleaned = cleanPlayerName(name) || "Ranger";
  const current = loadPlayerName();
  if (cleaned === current) return { ok: true, name: current };
  const waitMs = nameCooldownMs();
  if (waitMs > 0) return { ok: false, waitMs };
  try {
    window.localStorage.setItem(KEY, cleaned);
    window.localStorage.setItem(STAMP_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
  return { ok: true, name: cleaned };
}

export function cleanPlayerName(name: string) {
  return name.replace(/[^\w \-']/g, "").trim().slice(0, MAX);
}

export function formatWait(ms: number) {
  const s = Math.ceil(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m <= 0) return `${r}s`;
  return `${m}m ${r.toString().padStart(2, "0")}s`;
}
