import type { CraftedSpell, CraftExtra, CraftShape, SpellRarity } from "./engine";

const COLORS: Array<[RegExp, string]> = [
  [/\b(crimson|scarlet|blood|red)\b/, "#c45a48"],
  [/\b(ember|orange|amber|copper|flame)\b/, "#e08a3c"],
  [/\b(gold|yellow|sun|solar)\b/, "#f0d24a"],
  [/\b(lime|poison|venom|green)\b/, "#7db86a"],
  [/\b(teal|jade|moss)\b/, "#4aa88a"],
  [/\b(ice|frost|cyan|aqua|rime)\b/, "#9ad8ea"],
  [/\b(blue|azure|cobalt|tide)\b/, "#6a8ec8"],
  [/\b(violet|purple|arcane|hex)\b/, "#9a7ab8"],
  [/\b(pink|rose|petal)\b/, "#d48aa8"],
  [/\b(white|holy|light|pearl)\b/, "#ecece8"],
  [/\b(shadow|void|black|sable)\b/, "#3a3c3a"],
];

export const RARITY_ORDER: SpellRarity[] = ["common", "uncommon", "rare", "epic", "legendary"];

export function rarityTint(rarity: SpellRarity) {
  if (rarity === "legendary") return "#f0d24a";
  if (rarity === "epic") return "#9a7ab8";
  if (rarity === "rare") return "#6a8ec8";
  if (rarity === "uncommon") return "#7db86a";
  return "#9aa094";
}

const CATALOG: CraftedSpell[] = [
  { name: "Needler", color: "#c8ccd4", damage: 8, shape: "shard", extra: "none", cooldown: 0.38, rarity: "common", shots: 5 },
  { name: "Frostgnat", color: "#9ad8ea", damage: 7, shape: "homing", extra: "slow", cooldown: 0.44, rarity: "common", shots: 3 },
  { name: "Fennel", color: "#4aa88a", damage: 8, shape: "wave", extra: "burn", cooldown: 0.43, rarity: "common", shots: 3 },
  { name: "Quill", color: "#c8ccd4", damage: 10, shape: "triple", extra: "none", cooldown: 0.4, rarity: "common", shots: 3 },
  { name: "Dewburst", color: "#4aa88a", damage: 9, shape: "nova", extra: "none", cooldown: 0.95, rarity: "common", shots: 6 },
  { name: "Hailshot", color: "#9ad8ea", damage: 9, shape: "shard", extra: "slow", cooldown: 0.62, rarity: "common", shots: 5 },
  { name: "Hexfan", color: "#d48aa8", damage: 9, shape: "shard", extra: "slow", cooldown: 0.7, rarity: "common", shots: 10 },
  { name: "Nightfan", color: "#2a1038", damage: 8, shape: "wave", extra: "stun", cooldown: 0.75, rarity: "common", shots: 5 },
  { name: "Duskfan", color: "#9a7ab8", damage: 8, shape: "weave", extra: "stun", cooldown: 0.7, rarity: "common", shots: 3 },
  { name: "Sundew", color: "#d48aa8", damage: 10, shape: "triple", extra: "slow", cooldown: 0.5, rarity: "common", shots: 5 },
  { name: "Thaw", color: "#c5eaf6", damage: 11, shape: "nova", extra: "none", cooldown: 0.92, rarity: "common", shots: 8 },
  { name: "Spindle", color: "#9a7ab8", damage: 10, shape: "weave", extra: "stun", cooldown: 0.61, rarity: "common", shots: 1 },
  { name: "Moonwell", color: "#9ad8ea", damage: 10, shape: "nova", extra: "slow", cooldown: 1.1, rarity: "common", shots: 8 },
  { name: "Wispnet", color: "#ecece8", damage: 10, shape: "nova", extra: "slow", cooldown: 1.08, rarity: "common", shots: 10 },
  { name: "Lullaby", color: "#9a7ab8", damage: 10, shape: "nova", extra: "stun", cooldown: 1.12, rarity: "common", shots: 8 },
  { name: "Petalfall", color: "#d48aa8", damage: 9, shape: "meteor", extra: "slow", cooldown: 1.05, rarity: "common", shots: 3 },

  { name: "Gale", color: "#ecece8", damage: 13, shape: "wave", extra: "none", cooldown: 0.45, rarity: "uncommon", shots: 5 },
  { name: "Briar", color: "#7db86a", damage: 13, shape: "wave", extra: "none", cooldown: 0.5, rarity: "uncommon", shots: 8 },
  { name: "Tinder", color: "#e08a3c", damage: 14, shape: "weave", extra: "burn", cooldown: 0.4, rarity: "uncommon", shots: 1 },
  { name: "Foxfire", color: "#e08a3c", damage: 13, shape: "homing", extra: "burn", cooldown: 0.48, rarity: "uncommon", shots: 3 },
  { name: "Bramble", color: "#4aa88a", damage: 12, shape: "triple", extra: "burn", cooldown: 0.55, rarity: "uncommon", shots: 3 },
  { name: "Nettle", color: "#4aa88a", damage: 12, shape: "shard", extra: "burn", cooldown: 0.47, rarity: "uncommon", shots: 5 },
  { name: "Moth", color: "#d48aa8", damage: 12, shape: "homing", extra: "burn", cooldown: 0.6, rarity: "uncommon", shots: 1 },
  { name: "Silkshot", color: "#d48aa8", damage: 12, shape: "weave", extra: "slow", cooldown: 0.42, rarity: "uncommon", shots: 1 },
  { name: "Kindling", color: "#f0d24a", damage: 12, shape: "shard", extra: "burn", cooldown: 0.49, rarity: "uncommon", shots: 10 },
  { name: "Widow", color: "#2a1038", damage: 13, shape: "homing", extra: "slow", cooldown: 0.57, rarity: "uncommon", shots: 3 },
  { name: "Crowcall", color: "#3a1a58", damage: 14, shape: "homing", extra: "none", cooldown: 0.58, rarity: "uncommon", shots: 5 },
  { name: "Brine", color: "#4aa88a", damage: 14, shape: "wave", extra: "slow", cooldown: 0.65, rarity: "uncommon", shots: 5 },
  { name: "Mire", color: "#3a3c3a", damage: 14, shape: "wave", extra: "slow", cooldown: 0.66, rarity: "uncommon", shots: 10 },
  { name: "Howl", color: "#6a8ec8", damage: 11, shape: "nova", extra: "stun", cooldown: 1.05, rarity: "uncommon", shots: 10 },
  { name: "Lichen", color: "#7db86a", damage: 11, shape: "nova", extra: "slow", cooldown: 1.0, rarity: "uncommon", shots: 6 },
  { name: "Sparkfen", color: "#f0d24a", damage: 11, shape: "nova", extra: "burn", cooldown: 0.98, rarity: "uncommon", shots: 8 },

  { name: "Hollow", color: "#3a3c3a", damage: 19, shape: "single", extra: "stun", cooldown: 0.45, rarity: "rare", shots: 1 },
  { name: "Wraith", color: "#6a6d66", damage: 20, shape: "homing", extra: "none", cooldown: 0.45, rarity: "rare", shots: 1 },
  { name: "Aurora", color: "#9ad8ea", damage: 20, shape: "weave", extra: "slow", cooldown: 0.5, rarity: "rare", shots: 3 },
  { name: "Embercap", color: "#c45a48", damage: 20, shape: "triple", extra: "burn", cooldown: 0.47, rarity: "rare", shots: 5 },
  { name: "Owlsight", color: "#6a8ec8", damage: 20, shape: "homing", extra: "stun", cooldown: 0.68, rarity: "rare", shots: 3 },
  { name: "Thornlash", color: "#7db86a", damage: 21, shape: "wave", extra: "burn", cooldown: 0.55, rarity: "rare", shots: 5 },
  { name: "Prowl", color: "#2a1038", damage: 21, shape: "weave", extra: "none", cooldown: 0.41, rarity: "rare", shots: 1 },
  { name: "Vesper", color: "#9a7ab8", damage: 21, shape: "homing", extra: "slow", cooldown: 0.65, rarity: "rare", shots: 5 },
  { name: "Hoarfrost", color: "#9ad8ea", damage: 21, shape: "weave", extra: "slow", cooldown: 0.62, rarity: "rare", shots: 5 },
  { name: "Hearth", color: "#e08a3c", damage: 21, shape: "orb", extra: "burn", cooldown: 0.77, rarity: "rare", shots: 1 },
  { name: "Cinder", color: "#c45a48", damage: 22, shape: "weave", extra: "burn", cooldown: 0.45, rarity: "rare", shots: 3 },
  { name: "Shrike", color: "#c8ccd4", damage: 22, shape: "beam", extra: "none", cooldown: 0.58, rarity: "rare", shots: 1 },
  { name: "Boglight", color: "#4aa88a", damage: 22, shape: "homing", extra: "stun", cooldown: 0.73, rarity: "rare", shots: 5 },
  { name: "Gleam", color: "#ecece8", damage: 23, shape: "weave", extra: "none", cooldown: 0.49, rarity: "rare", shots: 5 },
  { name: "Lantern", color: "#f0d24a", damage: 23, shape: "beam", extra: "burn", cooldown: 0.67, rarity: "rare", shots: 3 },
  { name: "Sable", color: "#1a1018", damage: 23, shape: "orb", extra: "burn", cooldown: 0.85, rarity: "rare", shots: 3 },

  { name: "Gloam", color: "#3a1a58", damage: 28, shape: "orb", extra: "stun", cooldown: 0.8, rarity: "epic", shots: 1 },
  { name: "Rimeorb", color: "#c5eaf6", damage: 29, shape: "orb", extra: "slow", cooldown: 0.75, rarity: "epic", shots: 1 },
  { name: "Ironroot", color: "#6a6d66", damage: 29, shape: "orb", extra: "stun", cooldown: 0.85, rarity: "epic", shots: 3 },
  { name: "Deepwell", color: "#6a8ec8", damage: 29, shape: "orb", extra: "slow", cooldown: 0.81, rarity: "epic", shots: 5 },
  { name: "Heartwood", color: "#4aa88a", damage: 30, shape: "orb", extra: "none", cooldown: 0.78, rarity: "epic", shots: 1 },
  { name: "Riftbeam", color: "#9a7ab8", damage: 30, shape: "beam", extra: "none", cooldown: 0.55, rarity: "epic", shots: 3 },
  { name: "Redcap", color: "#c45a48", damage: 30, shape: "triple", extra: "burn", cooldown: 0.46, rarity: "epic", shots: 3 },
  { name: "Palebeam", color: "#c5eaf6", damage: 31, shape: "beam", extra: "slow", cooldown: 0.58, rarity: "epic", shots: 1 },
  { name: "Pyre", color: "#e08a3c", damage: 31, shape: "beam", extra: "burn", cooldown: 0.7, rarity: "epic", shots: 5 },
  { name: "Acorn", color: "#7db86a", damage: 32, shape: "meteor", extra: "none", cooldown: 1.08, rarity: "epic", shots: 1 },

  { name: "Starfall", color: "#f0d24a", damage: 42, shape: "meteor", extra: "stun", cooldown: 0.95, rarity: "legendary", shots: 3 },
  { name: "Gravemark", color: "#3a3c3a", damage: 42, shape: "meteor", extra: "stun", cooldown: 1.1, rarity: "legendary", shots: 5 },
  { name: "Umbral", color: "#1a1018", damage: 43, shape: "beam", extra: "stun", cooldown: 0.7, rarity: "legendary", shots: 1 },
  { name: "Knell", color: "#7a48b8", damage: 44, shape: "meteor", extra: "none", cooldown: 1.05, rarity: "legendary", shots: 8 },
  { name: "Cindermaw", color: "#e08a3c", damage: 45, shape: "meteor", extra: "burn", cooldown: 1.02, rarity: "legendary", shots: 3 },
  { name: "Ashcomet", color: "#e08a3c", damage: 46, shape: "meteor", extra: "burn", cooldown: 1.0, rarity: "legendary", shots: 5 },
];

const SHAPES: CraftShape[] = ["single", "triple", "weave", "orb", "beam", "nova", "wave", "meteor", "shard", "homing"];
const EXTRAS: CraftExtra[] = ["none", "burn", "slow", "stun"];

export function generateSpell(prompt = ""): CraftedSpell {
  const hint = prompt.trim();
  if (hint) return remix(parseSpellPrompt(hint));
  const pick = CATALOG[Math.floor(Math.random() * CATALOG.length)]!;
  return remix(pick);
}

export function pickLegendary(): CraftedSpell {
  const pool = CATALOG.filter((s) => s.rarity === "legendary");
  return { ...(pool[Math.floor(Math.random() * pool.length)] ?? CATALOG[CATALOG.length - 1]!) };
}

export function wheelChoices(count = 8): CraftedSpell[] {
  const used = new Set<string>();
  const out: CraftedSpell[] = [];
  const pull = (rarity: SpellRarity, n: number) => {
    const pool = CATALOG.filter((s) => s.rarity === rarity && !used.has(s.name));
    shuffle(pool);
    for (const s of pool.slice(0, n)) {
      used.add(s.name);
      out.push({ ...s });
    }
  };
  pull("common", 3);
  pull("uncommon", 2);
  pull("rare", 2);
  pull(Math.random() < 0.28 ? "legendary" : "epic", 1);
  if (out.length < count) {
    const rest = CATALOG.filter((s) => !used.has(s.name));
    shuffle(rest);
    for (const s of rest) {
      if (out.length >= count) break;
      used.add(s.name);
      out.push({ ...s });
    }
  }
  out.sort((a, b) => RARITY_ORDER.indexOf(a.rarity) - RARITY_ORDER.indexOf(b.rarity));
  return out;
}

function shuffle<T>(arr: T[]) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = t;
  }
}

function remix(base: CraftedSpell): CraftedSpell {
  return {
    ...base,
    damage: Math.max(6, Math.min(60, base.damage)),
    name: base.name.slice(0, 10),
    shots: Math.max(1, Math.min(10, base.shots || 1)),
  };
}

export function parseSpellPrompt(raw: string): CraftedSpell {
  const text = raw.trim().toLowerCase() || "rune";
  const named = CATALOG.find((s) => text.includes(s.name.toLowerCase()));
  if (named && raw.trim().split(/\s+/).length <= 2) return remix(named);

  let color = "#ecece8";
  for (const [re, hex] of COLORS) {
    if (re.test(text)) {
      color = hex;
      break;
    }
  }

  let shape: CraftShape = "single";
  if (/\b(nova|ring|burst|explode|around|circle)\b/.test(text)) shape = "nova";
  else if (/\b(beam|laser|ray|lance)\b/.test(text)) shape = "beam";
  else if (/\b(meteor|comet|boulder|rock|cannon)\b/.test(text)) shape = "meteor";
  else if (/\b(orb|ball|sphere|bubble|glob)\b/.test(text)) shape = "orb";
  else if (/\b(wave|crescent|slash|arc)\b/.test(text)) shape = "wave";
  else if (/\b(shard|crystal|spray|fan|spread)\b/.test(text)) shape = "shard";
  else if (/\b(home|homing|seek|chase|follow)\b/.test(text)) shape = "homing";
  else if (/\b(triple|volley)\b/.test(text)) shape = "triple";
  else if (/\b(weave|snake|wiggle|zigzag)\b/.test(text)) shape = "weave";
  else shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]!;

  let extra: CraftExtra = "none";
  if (/\b(stun|shock|lightning|paralyze)\b/.test(text)) extra = "stun";
  else if (/\b(slow|freeze|frost|chill|ice)\b/.test(text) && shape !== "wave") extra = "slow";
  else if (/\b(burn|fire|ember|poison|dot|bleed)\b/.test(text)) extra = "burn";

  let shots = 1;
  if (/\b(ten|10)\b/.test(text)) shots = 10;
  else if (/\b(eight|8)\b/.test(text)) shots = 8;
  else if (/\b(five|5)\b/.test(text)) shots = 5;
  else if (/\b(three|3)\b/.test(text)) shots = 3;
  else if (shape === "nova") shots = 8;
  else if (shape === "shard") shots = 5;
  else if (shape === "triple" || shape === "wave") shots = 3;

  let damage = 14;
  if (shape === "meteor") damage = 24;
  if (shape === "beam") damage = 18;
  if (shape === "orb") damage = 20;
  if (shape === "nova" || shape === "shard") damage = 8;

  let cooldown = 0.55;
  if (shape === "meteor" || shape === "nova") cooldown = 1.15;
  if (shape === "beam") cooldown = 0.7;
  if (shape === "orb") cooldown = 0.85;

  const rarity: SpellRarity =
    damage >= 24 ? "legendary" : damage >= 20 ? "epic" : damage >= 16 ? "rare" : damage >= 12 ? "uncommon" : "common";

  return { name: nameFromPrompt(raw), color, damage, shape, extra, cooldown, rarity, shots };
}

function nameFromPrompt(raw: string) {
  const words = raw
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const skip = new Set(["a", "an", "the", "make", "spell", "that", "with", "and", "of", "my"]);
  const pick = words.filter((w) => !skip.has(w.toLowerCase()));
  const name = (pick[0] || words[0] || "Rune").slice(0, 10);
  return name.charAt(0).toUpperCase() + name.slice(1);
}
