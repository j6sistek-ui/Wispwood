import type { CraftedSpell, CraftExtra, CraftShape } from "./engine";

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

const CATALOG: CraftedSpell[] = [
  { name: "Thornlash", color: "#7db86a", damage: 16, shape: "wave", extra: "burn", cooldown: 0.6 },
  { name: "Moonwell", color: "#9ad8ea", damage: 10, shape: "nova", extra: "slow", cooldown: 1.1 },
  { name: "Ashcomet", color: "#e08a3c", damage: 26, shape: "meteor", extra: "burn", cooldown: 1.2 },
  { name: "Gloam", color: "#3a1a58", damage: 18, shape: "orb", extra: "stun", cooldown: 0.9 },
  { name: "Riftbeam", color: "#9a7ab8", damage: 20, shape: "beam", extra: "none", cooldown: 0.65 },
  { name: "Hexfan", color: "#d48aa8", damage: 9, shape: "shard", extra: "slow", cooldown: 0.7 },
  { name: "Wraith", color: "#6a6d66", damage: 15, shape: "homing", extra: "none", cooldown: 0.5 },
  { name: "Bramble", color: "#4aa88a", damage: 12, shape: "triple", extra: "burn", cooldown: 0.55 },
  { name: "Starfall", color: "#f0d24a", damage: 22, shape: "meteor", extra: "stun", cooldown: 1.15 },
  { name: "Rimeorb", color: "#c5eaf6", damage: 19, shape: "orb", extra: "slow", cooldown: 0.85 },
  { name: "Nightfan", color: "#2a1038", damage: 8, shape: "shard", extra: "stun", cooldown: 0.75 },
  { name: "Cinder", color: "#c45a48", damage: 17, shape: "weave", extra: "burn", cooldown: 0.5 },
  { name: "Gale", color: "#ecece8", damage: 13, shape: "wave", extra: "none", cooldown: 0.45 },
  { name: "Howl", color: "#6a8ec8", damage: 11, shape: "nova", extra: "stun", cooldown: 1.05 },
  { name: "Vesper", color: "#9a7ab8", damage: 16, shape: "homing", extra: "slow", cooldown: 0.7 },
  { name: "Pyre", color: "#e08a3c", damage: 21, shape: "beam", extra: "burn", cooldown: 0.8 },
  { name: "Hollow", color: "#3a3c3a", damage: 14, shape: "single", extra: "stun", cooldown: 0.5 },
  { name: "Dewburst", color: "#4aa88a", damage: 9, shape: "nova", extra: "none", cooldown: 0.95 },
  { name: "Quill", color: "#c8ccd4", damage: 10, shape: "triple", extra: "none", cooldown: 0.4 },
  { name: "Sable", color: "#1a1018", damage: 18, shape: "orb", extra: "burn", cooldown: 0.9 },
  { name: "Aurora", color: "#9ad8ea", damage: 15, shape: "weave", extra: "slow", cooldown: 0.55 },
  { name: "Knell", color: "#7a48b8", damage: 24, shape: "meteor", extra: "none", cooldown: 1.25 },
  { name: "Moth", color: "#d48aa8", damage: 12, shape: "homing", extra: "burn", cooldown: 0.6 },
  { name: "Brine", color: "#4aa88a", damage: 14, shape: "wave", extra: "slow", cooldown: 0.65 },
  { name: "Foxfire", color: "#e08a3c", damage: 13, shape: "homing", extra: "burn", cooldown: 0.48 },
  { name: "Lichen", color: "#7db86a", damage: 11, shape: "nova", extra: "slow", cooldown: 1.0 },
  { name: "Needler", color: "#c8ccd4", damage: 8, shape: "shard", extra: "none", cooldown: 0.38 },
  { name: "Gravemark", color: "#3a3c3a", damage: 22, shape: "meteor", extra: "stun", cooldown: 1.3 },
  { name: "Sundew", color: "#d48aa8", damage: 10, shape: "triple", extra: "slow", cooldown: 0.5 },
  { name: "Lantern", color: "#f0d24a", damage: 18, shape: "beam", extra: "burn", cooldown: 0.72 },
  { name: "Prowl", color: "#2a1038", damage: 16, shape: "weave", extra: "none", cooldown: 0.46 },
  { name: "Hailshot", color: "#9ad8ea", damage: 9, shape: "shard", extra: "slow", cooldown: 0.62 },
  { name: "Heartwood", color: "#4aa88a", damage: 20, shape: "orb", extra: "none", cooldown: 0.88 },
  { name: "Duskfan", color: "#9a7ab8", damage: 8, shape: "wave", extra: "stun", cooldown: 0.7 },
  { name: "Embercap", color: "#c45a48", damage: 15, shape: "triple", extra: "burn", cooldown: 0.52 },
  { name: "Wispnet", color: "#ecece8", damage: 10, shape: "nova", extra: "slow", cooldown: 1.08 },
  { name: "Boglight", color: "#4aa88a", damage: 17, shape: "homing", extra: "stun", cooldown: 0.78 },
  { name: "Cindermaw", color: "#e08a3c", damage: 25, shape: "meteor", extra: "burn", cooldown: 1.22 },
  { name: "Silkshot", color: "#d48aa8", damage: 12, shape: "single", extra: "slow", cooldown: 0.42 },
  { name: "Ironroot", color: "#6a6d66", damage: 19, shape: "orb", extra: "stun", cooldown: 0.95 },
  { name: "Palebeam", color: "#c5eaf6", damage: 21, shape: "beam", extra: "slow", cooldown: 0.68 },
  { name: "Crowcall", color: "#3a1a58", damage: 14, shape: "homing", extra: "none", cooldown: 0.58 },
  { name: "Sparkfen", color: "#f0d24a", damage: 11, shape: "nova", extra: "burn", cooldown: 0.98 },
  { name: "Briar", color: "#7db86a", damage: 13, shape: "wave", extra: "none", cooldown: 0.5 },
  { name: "Frostgnat", color: "#9ad8ea", damage: 7, shape: "shard", extra: "slow", cooldown: 0.44 },
  { name: "Nettle", color: "#4aa88a", damage: 12, shape: "triple", extra: "burn", cooldown: 0.47 },
  { name: "Umbral", color: "#1a1018", damage: 23, shape: "beam", extra: "stun", cooldown: 0.9 },
  { name: "Petalfall", color: "#d48aa8", damage: 9, shape: "meteor", extra: "slow", cooldown: 1.05 },
  { name: "Hearth", color: "#e08a3c", damage: 16, shape: "orb", extra: "burn", cooldown: 0.82 },
  { name: "Mire", color: "#3a3c3a", damage: 14, shape: "wave", extra: "slow", cooldown: 0.66 },
  { name: "Gleam", color: "#ecece8", damage: 18, shape: "weave", extra: "none", cooldown: 0.54 },
  { name: "Owlsight", color: "#6a8ec8", damage: 15, shape: "homing", extra: "stun", cooldown: 0.73 },
  { name: "Redcap", color: "#c45a48", damage: 20, shape: "single", extra: "burn", cooldown: 0.56 },
  { name: "Thaw", color: "#c5eaf6", damage: 11, shape: "nova", extra: "none", cooldown: 0.92 },
  { name: "Spindle", color: "#9a7ab8", damage: 10, shape: "weave", extra: "stun", cooldown: 0.61 },
  { name: "Acorn", color: "#7db86a", damage: 22, shape: "meteor", extra: "none", cooldown: 1.18 },
  { name: "Widow", color: "#2a1038", damage: 13, shape: "triple", extra: "slow", cooldown: 0.57 },
  { name: "Kindling", color: "#f0d24a", damage: 12, shape: "shard", extra: "burn", cooldown: 0.49 },
  { name: "Deepwell", color: "#6a8ec8", damage: 19, shape: "orb", extra: "slow", cooldown: 0.91 },
  { name: "Shrike", color: "#c8ccd4", damage: 17, shape: "beam", extra: "none", cooldown: 0.63 },
  { name: "Fennel", color: "#4aa88a", damage: 8, shape: "wave", extra: "burn", cooldown: 0.43 },
  { name: "Lullaby", color: "#9a7ab8", damage: 10, shape: "nova", extra: "stun", cooldown: 1.12 },
  { name: "Tinder", color: "#e08a3c", damage: 14, shape: "single", extra: "burn", cooldown: 0.4 },
  { name: "Hoarfrost", color: "#9ad8ea", damage: 16, shape: "weave", extra: "slow", cooldown: 0.67 },
];

const SHAPES: CraftShape[] = ["single", "triple", "weave", "orb", "beam", "nova", "wave", "meteor", "shard", "homing"];
const EXTRAS: CraftExtra[] = ["none", "burn", "slow", "stun"];

export function generateSpell(prompt = ""): CraftedSpell {
  const hint = prompt.trim();
  if (hint) return remix(parseSpellPrompt(hint));
  const pick = CATALOG[Math.floor(Math.random() * CATALOG.length)]!;
  return remix(pick);
}

export function wheelChoices(count = 8): CraftedSpell[] {
  const bag = [...CATALOG];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = bag[i]!;
    bag[i] = bag[j]!;
    bag[j] = a;
  }
  return bag.slice(0, Math.min(count, bag.length)).map((s) => remix({ ...s }));
}

function remix(base: CraftedSpell): CraftedSpell {
  const twist = Math.random();
  let extra = base.extra;
  let shape = base.shape;
  if (twist > 0.82) extra = EXTRAS[Math.floor(Math.random() * EXTRAS.length)]!;
  if (twist > 0.9) shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]!;
  const dmgJitter = Math.floor(Math.random() * 5) - 1;
  return {
    ...base,
    shape,
    extra,
    damage: Math.max(6, Math.min(28, base.damage + dmgJitter)),
    name: base.name.slice(0, 10),
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
  else if (/\b(shard|crystal|spray|fan|spread|five)\b/.test(text)) shape = "shard";
  else if (/\b(home|homing|seek|chase|follow)\b/.test(text)) shape = "homing";
  else if (/\b(triple|three|volley)\b/.test(text)) shape = "triple";
  else if (/\b(weave|snake|wiggle|zigzag)\b/.test(text)) shape = "weave";
  else shape = SHAPES[Math.floor(Math.random() * SHAPES.length)]!;

  let extra: CraftExtra = "none";
  if (/\b(stun|shock|lightning|paralyze)\b/.test(text)) extra = "stun";
  else if (/\b(slow|freeze|frost|chill|ice)\b/.test(text) && shape !== "wave") extra = "slow";
  else if (/\b(burn|fire|ember|poison|dot|bleed)\b/.test(text)) extra = "burn";
  else extra = EXTRAS[Math.floor(Math.random() * EXTRAS.length)]!;

  let damage = 14;
  if (shape === "meteor") damage = 24;
  if (shape === "beam") damage = 18;
  if (shape === "orb") damage = 20;
  if (shape === "nova" || shape === "shard") damage = 8;
  if (/\b(weak|small|tiny)\b/.test(text)) damage = Math.max(4, damage - 6);
  else if (/\b(strong|heavy|great)\b/.test(text)) damage = Math.min(28, damage + 6);
  else if (/\b(huge|devastat|ultimate|massive)\b/.test(text)) damage = 28;

  let cooldown = 0.55;
  if (shape === "meteor" || shape === "nova") cooldown = 1.15;
  if (shape === "beam") cooldown = 0.7;
  if (shape === "orb") cooldown = 0.85;
  if (/\b(fast|quick|rapid)\b/.test(text)) cooldown = Math.max(0.3, cooldown - 0.25);

  return { name: nameFromPrompt(raw), color, damage, shape, extra, cooldown };
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
