export type RelicElement = "ember";
export type RelicFunction = "singleshot";
export type RelicTrikeee = string | null;

export type RelicCast = {
  id: string;
  name: string;
  element: RelicElement;
  fn: RelicFunction;
  trikeee: RelicTrikeee;
  color: string;
};

const ELEMENT_COLOR: Record<RelicElement, string> = {
  ember: "#e08a3c",
};

const ELEMENT_WORD: Record<RelicElement, string> = {
  ember: "Ember",
};

const FUNCTION_WORD: Record<RelicFunction, string> = {
  singleshot: "Single",
};

export function nameRelicCast(element: RelicElement, fn: RelicFunction) {
  return `${FUNCTION_WORD[fn]} ${ELEMENT_WORD[element]}`;
}

export function forgeRelicCast(element: RelicElement, fn: RelicFunction, trikeee: RelicTrikeee = null): RelicCast {
  return {
    id: `${element}-${fn}-${Math.random().toString(36).slice(2, 7)}`,
    name: nameRelicCast(element, fn),
    element,
    fn,
    trikeee,
    color: ELEMENT_COLOR[element],
  };
}

export const emptyRelicWells = (): Array<RelicCast | null> => [null, null, null, null];
