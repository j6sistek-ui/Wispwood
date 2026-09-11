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
