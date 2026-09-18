export type RelicElement = "ember" | "frost" | "storm" | "void" | "thorn" | "dawn";
export type RelicFunction = "singleshot" | "spread" | "weave" | "orbit" | "nova" | "seek";
export type RelicTrikeee = "burn" | "chill" | "shock" | "bind" | null;
export type RelicKind = "element" | "function" | "trikeee";
export type RelicRuneId = RelicElement | RelicFunction | Exclude<RelicTrikeee, null>;

export type RelicCast = {
  id: string;
  name: string;
  element: RelicElement;
  fn: RelicFunction;
  trikeee: RelicTrikeee;
  color: string;
};

export const RELIC_ELEMENTS: RelicElement[] = ["ember", "frost", "storm", "void", "thorn", "dawn"];
export const RELIC_FUNCTIONS: RelicFunction[] = ["singleshot", "spread", "weave", "orbit", "nova", "seek"];
export const RELIC_TRIKEEE: Exclude<RelicTrikeee, null>[] = ["burn", "chill", "shock", "bind"];

export const ELEMENT_COLOR: Record<RelicElement, string> = {
  ember: "#e08a3c",
  frost: "#9ad8ea",
  storm: "#f0d24a",
  void: "#c8a4ff",
  thorn: "#7db86a",
  dawn: "#fff0a8",
};

export const ELEMENT_WORD: Record<RelicElement, string> = {
  ember: "Ember",
  frost: "Frost",
  storm: "Storm",
  void: "Void",
  thorn: "Thorn",
  dawn: "Dawn",
};

export const FUNCTION_WORD: Record<RelicFunction, string> = {
  singleshot: "Single",
  spread: "Spread",
  weave: "Weave",
  orbit: "Orbit",
  nova: "Nova",
  seek: "Seek",
};

export const TRIKEEE_WORD: Record<Exclude<RelicTrikeee, null>, string> = {
  burn: "Burn",
  chill: "Chill",
  shock: "Shock",
  bind: "Bind",
};

export const RUNE_KIND: Record<RelicRuneId, RelicKind> = {
  ember: "element",
  frost: "element",
  storm: "element",
  void: "element",
  thorn: "element",
  dawn: "element",
  singleshot: "function",
  spread: "function",
  weave: "function",
  orbit: "function",
  nova: "function",
  seek: "function",
  burn: "trikeee",
  chill: "trikeee",
  shock: "trikeee",
  bind: "trikeee",
};

export const RUNE_LABEL: Record<RelicRuneId, string> = {
  ...ELEMENT_WORD,
  ...FUNCTION_WORD,
  ...TRIKEEE_WORD,
};

export const RUNE_GLOW: Record<RelicRuneId, string> = {
  ...ELEMENT_COLOR,
  singleshot: "#d8dce8",
  spread: "#ecece8",
  weave: "#c8b89a",
  orbit: "#b8a0d8",
  nova: "#ffe8a0",
  seek: "#a8d0c8",
  burn: "#e08a3c",
  chill: "#9ad8ea",
  shock: "#f0d24a",
  bind: "#7db86a",
};

export function nameRelicCast(element: RelicElement, fn: RelicFunction, trikeee: RelicTrikeee = null) {
  const extra = trikeee ? ` ${TRIKEEE_WORD[trikeee]}` : "";
  return `${FUNCTION_WORD[fn]} ${ELEMENT_WORD[element]}${extra}`;
}

export function forgeRelicCast(element: RelicElement, fn: RelicFunction, trikeee: RelicTrikeee = null): RelicCast {
  return {
    id: `${element}-${fn}-${trikeee ?? "x"}-${Math.random().toString(36).slice(2, 6)}`,
    name: nameRelicCast(element, fn, trikeee),
    element,
    fn,
    trikeee,
    color: ELEMENT_COLOR[element],
  };
}

export const emptyRelicWells = (): Array<RelicCast | null> => [null, null, null, null];

export function relicSpellOf(element: RelicElement): "ember" | "frost" | "bolt" | "void" | "vine" | "boom" {
  if (element === "frost") return "frost";
  if (element === "storm") return "bolt";
  if (element === "void") return "void";
  if (element === "thorn") return "vine";
  if (element === "dawn") return "boom";
  return "ember";
}

export function relicCooldown(fn: RelicFunction) {
  if (fn === "nova") return 0.9;
  if (fn === "orbit") return 1.15;
  if (fn === "spread") return 0.55;
  if (fn === "weave") return 0.42;
  if (fn === "seek") return 0.5;
  return 0.4;
}
