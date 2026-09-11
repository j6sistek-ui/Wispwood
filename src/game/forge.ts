export type ForgeKind = "ore" | "crystal" | "hammer";

export type ForgePiece = {
  id: string;
  kind: ForgeKind;
  name: string;
  color: string;
  blurb: string;
};

export const FORGE_ORES: ForgePiece[] = [
  { id: "emberite", kind: "ore", name: "Emberite", color: "#e08a3c", blurb: "Warm even in the bag" },
  { id: "coldiron", kind: "ore", name: "Coldiron", color: "#9ad8ea", blurb: "Bites the fingers" },
  { id: "stormore", kind: "ore", name: "Stormore", color: "#f0d24a", blurb: "Hums before rain" },
  { id: "voidslag", kind: "ore", name: "Voidslag", color: "#7a48b8", blurb: "Eats nearby light" },
  { id: "thornite", kind: "ore", name: "Thornite", color: "#6fbf6a", blurb: "Grows little barbs" },
  { id: "blastore", kind: "ore", name: "Blastore", color: "#d45a32", blurb: "Pops if struck wrong" },
  { id: "goldvein", kind: "ore", name: "Goldvein", color: "#f0d24a", blurb: "A lucky seam" },
  { id: "nightiron", kind: "ore", name: "Nightiron", color: "#4a4c48", blurb: "Forged after dusk" },
  { id: "mossore", kind: "ore", name: "Mossore", color: "#4aa88a", blurb: "Soft, still metal" },
  { id: "bloodstone", kind: "ore", name: "Bloodstone", color: "#c45a4a", blurb: "Never quite dry" },
  { id: "moonslag", kind: "ore", name: "Moonslag", color: "#d8c4f0", blurb: "Pale as moth dust" },
  { id: "ashvein", kind: "ore", name: "Ashvein", color: "#8aa0b8", blurb: "Tastes like cinders" },
  { id: "rimeore", kind: "ore", name: "Rimeore", color: "#c5eaf6", blurb: "Frost in the grain" },
  { id: "brambleiron", kind: "ore", name: "Brambleiron", color: "#3d7a45", blurb: "Twists as it cools" },
  { id: "starslag", kind: "ore", name: "Starslag", color: "#fff4c8", blurb: "Fell from a quiet sky" },
];

export const FORGE_CRYSTALS: ForgePiece[] = [
  { id: "cinder-crystal", kind: "crystal", name: "Cinder crystal", color: "#e08a3c", blurb: "A held ember" },
  { id: "frost-crystal", kind: "crystal", name: "Frost crystal", color: "#9ad8ea", blurb: "Never melts" },
  { id: "bolt-crystal", kind: "crystal", name: "Bolt crystal", color: "#f0d24a", blurb: "Snaps if pinched" },
  { id: "void-crystal", kind: "crystal", name: "Void crystal", color: "#7a48b8", blurb: "A hole you can hold" },
  { id: "vine-crystal", kind: "crystal", name: "Vine crystal", color: "#6fbf6a", blurb: "Roots in the palm" },
  { id: "boom-crystal", kind: "crystal", name: "Boom crystal", color: "#ff9a3c", blurb: "Warm, then louder" },
  { id: "dawn-crystal", kind: "crystal", name: "Dawn crystal", color: "#f0c878", blurb: "First-light glass" },
  { id: "dusk-crystal", kind: "crystal", name: "Dusk crystal", color: "#9a7ab8", blurb: "Last-light glass" },
  { id: "heart-crystal", kind: "crystal", name: "Heart crystal", color: "#c45a78", blurb: "Beats once, then still" },
  { id: "grave-crystal", kind: "crystal", name: "Grave crystal", color: "#3a3c3a", blurb: "Cold as a name" },
  { id: "tide-crystal", kind: "crystal", name: "Tide crystal", color: "#6a8ec8", blurb: "Wet from nowhere" },
  { id: "spark-crystal", kind: "crystal", name: "Spark crystal", color: "#ffe27a", blurb: "Itches the air" },
  { id: "bloom-crystal", kind: "crystal", name: "Bloom crystal", color: "#e8a0b8", blurb: "Opens at a touch" },
  { id: "shade-crystal", kind: "crystal", name: "Shade crystal", color: "#5a3a78", blurb: "Drinks the lantern" },
  { id: "lantern-crystal", kind: "crystal", name: "Lantern crystal", color: "#e8c070", blurb: "A wick of glass" },
];

export const FORGE_HAMMERS: ForgePiece[] = [
  { id: "ember-mallet", kind: "hammer", name: "Ember mallet", color: "#e08a3c", blurb: "Head never cools" },
  { id: "ice-peen", kind: "hammer", name: "Ice peen", color: "#9ad8ea", blurb: "Rings like a bell" },
  { id: "storm-hammer", kind: "hammer", name: "Storm hammer", color: "#f0d24a", blurb: "Sparks on the anvil" },
  { id: "void-maul", kind: "hammer", name: "Void maul", color: "#7a48b8", blurb: "Hits, then pulls" },
  { id: "thorn-hammer", kind: "hammer", name: "Thorn hammer", color: "#6fbf6a", blurb: "Handle grows barbs" },
  { id: "blast-sledge", kind: "hammer", name: "Blast sledge", color: "#d45a32", blurb: "One blow, two sounds" },
  { id: "gold-hammer", kind: "hammer", name: "Gold hammer", color: "#f0d24a", blurb: "Too pretty to swing" },
  { id: "night-maul", kind: "hammer", name: "Night maul", color: "#4a4c48", blurb: "Works best after dusk" },
  { id: "root-mallet", kind: "hammer", name: "Root mallet", color: "#8a6a38", blurb: "Grown, not made" },
  { id: "bone-hammer", kind: "hammer", name: "Bone hammer", color: "#ecece8", blurb: "Light, and mean" },
  { id: "moon-peen", kind: "hammer", name: "Moon peen", color: "#d8c4f0", blurb: "Leaves a pale mark" },
  { id: "ash-sledge", kind: "hammer", name: "Ash sledge", color: "#8aa0b8", blurb: "Dust on every strike" },
  { id: "rime-hammer", kind: "hammer", name: "Rime hammer", color: "#c5eaf6", blurb: "Freezes the spark" },
  { id: "bramble-maul", kind: "hammer", name: "Bramble maul", color: "#3d7a45", blurb: "Catches what it hits" },
  { id: "star-hammer", kind: "hammer", name: "Star hammer", color: "#fff4c8", blurb: "A nail of sky" },
];

export const FORGE_CATALOG: Record<ForgeKind, ForgePiece[]> = {
  ore: FORGE_ORES,
  crystal: FORGE_CRYSTALS,
  hammer: FORGE_HAMMERS,
};

export const FORGE_TABS: Array<{ kind: ForgeKind; label: string }> = [
  { kind: "ore", label: "Ore" },
  { kind: "crystal", label: "Magic crystal" },
  { kind: "hammer", label: "Hammer" },
];

export const FORGE_PIECES: ForgePiece[] = [...FORGE_ORES, ...FORGE_CRYSTALS, ...FORGE_HAMMERS];

const PIECE_IDS = new Set(FORGE_PIECES.map((p) => p.id));

export function pieceById(id: string): ForgePiece | undefined {
  return FORGE_PIECES.find((p) => p.id === id);
}

export function parseForgeBag(raw: unknown): Record<string, number> {
  const out: Record<string, number> = {};
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return out;
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!PIECE_IDS.has(k)) continue;
    const n = typeof v === "number" ? Math.floor(v) : 0;
    if (n > 0) out[k] = n;
  }
  return out;
}

export function rollForgePiece(): ForgePiece {
  return FORGE_PIECES[Math.floor(Math.random() * FORGE_PIECES.length)]!;
}

export type WeaponExtra = "burn" | "slow" | "stun" | "knock" | "wrap" | "leech" | "none";
export type WeaponAbility =
  | "nova"
  | "dash"
  | "pull"
  | "wrap"
  | "burst"
  | "heal"
  | "veil"
  | "leech"
  | "stunring"
  | "wave"
  | "chain"
  | "bloom"
  | "mist"
  | "spark"
  | "freeze";
export type WeaponStance = "blade" | "spear" | "hammer" | "maul" | "whip";

export type ForgedWeapon = {
  ore: string;
  crystal: string;
  hammer: string;
  name: string;
  color: string;
  color2: string;
  damage: number;
  reach: number;
  arc: number;
  cooldown: number;
  ability: WeaponAbility;
  abilityCd: number;
  extra: WeaponExtra;
  stance: WeaponStance;
};

const ORE_EXTRA: Record<string, WeaponExtra> = {
  emberite: "burn",
  coldiron: "slow",
  stormore: "stun",
  voidslag: "knock",
  thornite: "wrap",
  blastore: "knock",
  goldvein: "none",
  nightiron: "none",
  mossore: "slow",
  bloodstone: "leech",
  moonslag: "slow",
  ashvein: "burn",
  rimeore: "slow",
  brambleiron: "wrap",
  starslag: "stun",
};

const CRYSTAL_ABILITY: Record<string, { ability: WeaponAbility; cd: number }> = {
  "cinder-crystal": { ability: "nova", cd: 3.2 },
  "frost-crystal": { ability: "freeze", cd: 3.4 },
  "bolt-crystal": { ability: "spark", cd: 2.6 },
  "void-crystal": { ability: "pull", cd: 3.6 },
  "vine-crystal": { ability: "wrap", cd: 3.1 },
  "boom-crystal": { ability: "burst", cd: 3.8 },
  "dawn-crystal": { ability: "heal", cd: 4.2 },
  "dusk-crystal": { ability: "veil", cd: 4.5 },
  "heart-crystal": { ability: "leech", cd: 3.3 },
  "grave-crystal": { ability: "stunring", cd: 3.7 },
  "tide-crystal": { ability: "wave", cd: 3.2 },
  "spark-crystal": { ability: "chain", cd: 2.8 },
  "bloom-crystal": { ability: "bloom", cd: 3.5 },
  "shade-crystal": { ability: "mist", cd: 3.4 },
  "lantern-crystal": { ability: "nova", cd: 3 },
};

const HAMMER_STANCE: Record<string, { stance: WeaponStance; reach: number; arc: number; cooldown: number; dmg: number }> = {
  "ember-mallet": { stance: "hammer", reach: 58, arc: 1.4, cooldown: 0.42, dmg: 22 },
  "ice-peen": { stance: "blade", reach: 64, arc: 1.1, cooldown: 0.34, dmg: 20 },
  "storm-hammer": { stance: "hammer", reach: 62, arc: 1.3, cooldown: 0.4, dmg: 24 },
  "void-maul": { stance: "maul", reach: 70, arc: 1.6, cooldown: 0.62, dmg: 34 },
  "thorn-hammer": { stance: "whip", reach: 78, arc: 1.8, cooldown: 0.48, dmg: 18 },
  "blast-sledge": { stance: "maul", reach: 74, arc: 1.5, cooldown: 0.7, dmg: 38 },
  "gold-hammer": { stance: "hammer", reach: 60, arc: 1.2, cooldown: 0.38, dmg: 21 },
  "night-maul": { stance: "maul", reach: 72, arc: 1.45, cooldown: 0.58, dmg: 32 },
  "root-mallet": { stance: "hammer", reach: 56, arc: 1.35, cooldown: 0.44, dmg: 23 },
  "bone-hammer": { stance: "blade", reach: 54, arc: 0.95, cooldown: 0.28, dmg: 17 },
  "moon-peen": { stance: "spear", reach: 82, arc: 0.7, cooldown: 0.36, dmg: 26 },
  "ash-sledge": { stance: "maul", reach: 76, arc: 1.55, cooldown: 0.66, dmg: 36 },
  "rime-hammer": { stance: "hammer", reach: 60, arc: 1.25, cooldown: 0.4, dmg: 22 },
  "bramble-maul": { stance: "whip", reach: 80, arc: 1.7, cooldown: 0.52, dmg: 19 },
  "star-hammer": { stance: "spear", reach: 88, arc: 0.55, cooldown: 0.4, dmg: 30 },
};

export function weaponKey(ore: string, crystal: string, hammer: string) {
  return `${ore}|${crystal}|${hammer}`;
}

export function makeWeapon(oreId: string, crystalId: string, hammerId: string): ForgedWeapon | null {
  const ore = pieceById(oreId);
  const crystal = pieceById(crystalId);
  const hammer = pieceById(hammerId);
  if (!ore || ore.kind !== "ore" || !crystal || crystal.kind !== "crystal" || !hammer || hammer.kind !== "hammer") return null;
  const ham = HAMMER_STANCE[hammerId] ?? { stance: "hammer" as const, reach: 60, arc: 1.2, cooldown: 0.4, dmg: 22 };
  const cry = CRYSTAL_ABILITY[crystalId] ?? { ability: "nova" as const, cd: 3.2 };
  const oreWord = ore.name.split(" ")[0]!;
  const cryWord = crystal.name.split(" ")[0]!;
  const hamWord = hammer.name.split(" ").slice(-1)[0]!;
  return {
    ore: oreId,
    crystal: crystalId,
    hammer: hammerId,
    name: `${cryWord} ${oreWord} ${hamWord}`.slice(0, 18),
    color: ore.color,
    color2: crystal.color,
    damage: ham.dmg + (oreId === "starslag" || oreId === "nightiron" ? 6 : oreId === "goldvein" ? 2 : 0),
    reach: ham.reach,
    arc: ham.arc,
    cooldown: ham.cooldown,
    ability: cry.ability,
    abilityCd: cry.cd,
    extra: ORE_EXTRA[oreId] ?? "none",
    stance: ham.stance,
  };
}

export function parseWeapons(raw: unknown): ForgedWeapon[] {
  if (!Array.isArray(raw)) return [];
  const out: ForgedWeapon[] = [];
  const seen = new Set<string>();
  for (const v of raw) {
    if (!v || typeof v !== "object") continue;
    const rec = v as { ore?: string; crystal?: string; hammer?: string };
    const w = makeWeapon(rec.ore ?? "", rec.crystal ?? "", rec.hammer ?? "");
    if (!w) continue;
    const k = weaponKey(w.ore, w.crystal, w.hammer);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(w);
  }
  return out;
}

export const ABILITY_LABEL: Record<WeaponAbility, string> = {
  nova: "Nova",
  dash: "Dash",
  pull: "Pull",
  wrap: "Bind",
  burst: "Burst",
  heal: "Mend",
  veil: "Veil",
  leech: "Sip",
  stunring: "Howl",
  wave: "Tide",
  chain: "Arc",
  bloom: "Bloom",
  mist: "Mist",
  spark: "Spark",
  freeze: "Rime",
};

