export const RELIC_COST = 10;
export const MAX_EQUIP = 3;

export type RelicId =
  | "emberheart"
  | "frostglass"
  | "stormquill"
  | "voidring"
  | "thornlace"
  | "blastcap"
  | "goldbeetle"
  | "ironbark"
  | "swiftroot"
  | "secondwind"
  | "luckytooth"
  | "bloodsap"
  | "nightlantern"
  | "echoflint"
  | "greedywick"
  | "moonmoth";

export type RelicDef = {
  id: RelicId;
  name: string;
  blurb: string;
  color: string;
  glyph: string;
};

export const RELICS: RelicDef[] = [
  { id: "emberheart", name: "Ember Heart", blurb: "Burns bite twice as hard", color: "#e08a3c", glyph: "EH" },
  { id: "frostglass", name: "Frost Glass", blurb: "Ice holds them longer", color: "#9ad7ea", glyph: "FG" },
  { id: "stormquill", name: "Storm Quill", blurb: "Bolt snaps back faster", color: "#f0d24a", glyph: "SQ" },
  { id: "voidring", name: "Void Ring", blurb: "Void hurls foes farther", color: "#7a48b8", glyph: "VR" },
  { id: "thornlace", name: "Thorn Lace", blurb: "Vines grab from farther", color: "#6fbf6a", glyph: "TL" },
  { id: "blastcap", name: "Blast Cap", blurb: "Explosion recocks sooner", color: "#d45a32", glyph: "BC" },
  { id: "goldbeetle", name: "Gold Beetle", blurb: "Enemies drop more gold", color: "#f0d24a", glyph: "GB" },
  { id: "ironbark", name: "Iron Bark", blurb: "Hits hurt less", color: "#8aa0b8", glyph: "IB" },
  { id: "swiftroot", name: "Swift Root", blurb: "You run quicker", color: "#6fbf6a", glyph: "SR" },
  { id: "secondwind", name: "Second Wind", blurb: "Once a run, cheat death", color: "#eaf8fd", glyph: "SW" },
  { id: "luckytooth", name: "Lucky Tooth", blurb: "Jackpot loves you more", color: "#f0d24a", glyph: "LT" },
  { id: "bloodsap", name: "Blood Sap", blurb: "Kills sip a little HP", color: "#c45a4a", glyph: "BS" },
  { id: "nightlantern", name: "Night Lantern", blurb: "Start with a bigger wick", color: "#e8c070", glyph: "NL" },
  { id: "echoflint", name: "Echo Flint", blurb: "Shots sometimes fire twice", color: "#c5eaf6", glyph: "EF" },
  { id: "greedywick", name: "Greedy Wick", blurb: "Enter with 80 gold", color: "#f0d24a", glyph: "GW" },
  { id: "moonmoth", name: "Moon Moth", blurb: "Pickups drift to you", color: "#d8c4f0", glyph: "MM" },
];

const IDS = new Set(RELICS.map((r) => r.id));

export function isRelicId(v: unknown): v is RelicId {
  return typeof v === "string" && IDS.has(v as RelicId);
}

export function relicById(id: RelicId): RelicDef {
  return RELICS.find((r) => r.id === id)!;
}

export function emptyLoadout(): Array<RelicId | null> {
  return [null, null, null];
}

export function parseLoadout(raw: unknown): Array<RelicId | null> {
  const out = emptyLoadout();
  if (!Array.isArray(raw)) return out;
  for (let i = 0; i < MAX_EQUIP; i++) {
    const v = raw[i];
    out[i] = isRelicId(v) ? v : null;
  }
  return out;
}

export function parseOwned(raw: unknown): RelicId[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<RelicId>();
  for (const v of raw) {
    if (isRelicId(v)) seen.add(v);
  }
  return [...seen];
}

export function rollFromPool(owned: RelicId[]): RelicId | null {
  const pool = RELICS.map((r) => r.id).filter((id) => !owned.includes(id));
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)]!;
}
