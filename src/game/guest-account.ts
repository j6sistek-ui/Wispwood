import { authClient, authEnabled } from "@/lib/auth/client";
import { loadPlayerName } from "@/game/player-name";

const CREDS_KEY = "wispwood-guest-creds";
const PASS_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export type GuestCreds = { email: string; password: string };

export function loadGuestCreds(): GuestCreds | null {
  try {
    const raw = window.localStorage.getItem(CREDS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GuestCreds;
    if (parsed?.email && parsed?.password) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

function saveCreds(creds: GuestCreds) {
  try {
    window.localStorage.setItem(CREDS_KEY, JSON.stringify(creds));
  } catch {
    /* ignore */
  }
}

function mintPassword() {
  let out = "";
  const buf = new Uint8Array(8);
  crypto.getRandomValues(buf);
  for (const n of buf) out += PASS_CHARS[n! % PASS_CHARS.length];
  return out;
}

function mintCreds(): GuestCreds {
  const id = crypto.randomUUID().replace(/-/g, "").slice(0, 10);
  return { email: `guest.${id}@wispwood.app`, password: mintPassword() };
}

export async function ensureGuestAccount() {
  if (!authEnabled || typeof window === "undefined") return;
  try {
    await Promise.race([
      provision(),
      new Promise((resolve) => window.setTimeout(resolve, 4000)),
    ]);
  } catch {
    /* play without a session */
  }
}

async function provision() {
  try {
    const session = await authClient.getSession();
    if (session.data?.user && loadGuestCreds()) return;
  } catch {
    /* continue */
  }

  const existing = loadGuestCreds();
  if (existing) {
    const signed = await authClient.signIn.email({
      email: existing.email,
      password: existing.password,
    });
    if (!signed.error) return;
  }

  const creds = existing ?? mintCreds();
  const name = loadPlayerName();
  const created = await authClient.signUp.email({
    email: creds.email,
    password: creds.password,
    name,
  });
  if (!created.error) {
    saveCreds(creds);
    return;
  }

  const retry = await authClient.signIn.email({
    email: creds.email,
    password: creds.password,
  });
  if (!retry.error) saveCreds(creds);
}

export async function loginWithPassword(password: string, email?: string) {
  const typed = password.trim().toUpperCase();
  const stored = loadGuestCreds();
  const mail = (email?.trim() || stored?.email || "").toLowerCase();
  if (!mail || !typed) return { ok: false, message: "Need a password" };
  const result = await authClient.signIn.email({
    email: mail,
    password: stored && typed === stored.password.toUpperCase() ? stored.password : password.trim(),
  });
  if (result.error) return { ok: false, message: "Wrong password" };
  return { ok: true };
}
