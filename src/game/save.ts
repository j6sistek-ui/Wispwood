import { parseLoadout, parseOwned, type RelicId } from "./relics";
import { parseForgeBag } from "./forge";

const KEY = "wispwood-v1";

export type SaveData = {
  version: 2;
  best: number;
  bestNight: number;
  muted: boolean;
  trinkoo: number;
  ownedRelics: RelicId[];
  equipped: Array<RelicId | null>;
  forgeBag: Record<string, number>;
};

const defaults: SaveData = {
  version: 2,
  best: 0,
  bestNight: 0,
  muted: false,
  trinkoo: 0,
  ownedRelics: [],
  equipped: [null, null, null],
  forgeBag: {},
};

export function loadSave(): SaveData {
  if (typeof window === "undefined") return { ...defaults, ownedRelics: [], equipped: [null, null, null], forgeBag: {} };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...defaults, ownedRelics: [], equipped: [null, null, null], forgeBag: {} };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      version: 2,
      best: typeof parsed.best === "number" ? parsed.best : 0,
      bestNight: typeof parsed.bestNight === "number" ? parsed.bestNight : 0,
      muted: Boolean(parsed.muted),
      trinkoo: typeof parsed.trinkoo === "number" ? Math.max(0, Math.floor(parsed.trinkoo)) : 0,
      ownedRelics: parseOwned(parsed.ownedRelics),
      equipped: parseLoadout(parsed.equipped),
      forgeBag: parseForgeBag(parsed.forgeBag),
    };
  } catch {
    return { ...defaults, ownedRelics: [], equipped: [null, null, null], forgeBag: {} };
  }
}

export function writeSave(data: SaveData) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* ignore quota */
  }
}
