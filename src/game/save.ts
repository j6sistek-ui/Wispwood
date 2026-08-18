const KEY = "wispwood-v1";

export type SaveData = {
  version: 1;
  best: number;
  bestNight: number;
  muted: boolean;
};

const defaults: SaveData = { version: 1, best: 0, bestNight: 0, muted: false };

export function loadSave(): SaveData {
  if (typeof window === "undefined") return { ...defaults };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    const parsed = JSON.parse(raw) as Partial<SaveData>;
    return {
      version: 1,
      best: typeof parsed.best === "number" ? parsed.best : 0,
      bestNight: typeof parsed.bestNight === "number" ? parsed.bestNight : 0,
      muted: Boolean(parsed.muted),
    };
  } catch {
    return { ...defaults };
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
