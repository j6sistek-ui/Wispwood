import { asset } from "./paths";

function loadImage(src: string, timeoutMs = 8000): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const t = window.setTimeout(() => {
      img.src = "";
      reject(new Error(`Timed out ${src}`));
    }, timeoutMs);
    img.onload = () => {
      window.clearTimeout(t);
      resolve(img);
    };
    img.onerror = () => {
      window.clearTimeout(t);
      reject(new Error(`Failed to load ${src}`));
    };
    img.src = src;
  });
}

export type GameAssets = {
  player: Record<"down" | "left" | "right" | "up", HTMLImageElement[]>;
  wisp: HTMLImageElement[];
  projectile: HTMLImageElement[];
  impact: HTMLImageElement[];
  pickup: HTMLImageElement[];
  props: Record<string, HTMLImageElement>;
  ground: HTMLImageElement;
  title: HTMLImageElement;
};

const PROP_KEYS = [
  "moss-stone",
  "pebbles",
  "stump",
  "fern",
  "mushrooms",
  "shrub",
  "log",
  "lantern-post",
  "root",
] as const;

export async function loadTitle(): Promise<HTMLImageElement> {
  return loadImage(asset("game/title.jpg"), 6000);
}

export async function loadAssets(title?: HTMLImageElement): Promise<GameAssets> {
  const [
    down,
    left,
    right,
    up,
    wisp,
    projectile,
    impact,
    pickup,
    ground,
    cover,
    propImgs,
  ] = await Promise.all([
    Promise.all([1, 2, 3, 4].map((i) => loadImage(asset(`game/player/down-${i}.png`)))),
    Promise.all([1, 2, 3, 4].map((i) => loadImage(asset(`game/player/left-${i}.png`)))),
    Promise.all([1, 2, 3, 4].map((i) => loadImage(asset(`game/player/right-${i}.png`)))),
    Promise.all([1, 2, 3, 4].map((i) => loadImage(asset(`game/player/up-${i}.png`)))),
    Promise.all([1, 2, 3, 4].map((i) => loadImage(asset(`game/wisp/hover-${i}.png`)))),
    Promise.all([1, 2, 3, 4].map((i) => loadImage(asset(`game/projectile/projectile-${i}.png`)))),
    Promise.all([1, 2, 3, 4].map((i) => loadImage(asset(`game/impact/impact-${i}.png`)))),
    Promise.all([1, 2, 3, 4].map((i) => loadImage(asset(`game/pickup/idle-${i}.png`)))),
    loadImage(asset("game/ground.jpg")),
    title ? Promise.resolve(title) : loadImage(asset("game/title.jpg")),
    Promise.all(PROP_KEYS.map((k) => loadImage(asset(`game/props/${k}.png`)))),
  ]);

  const props: Record<string, HTMLImageElement> = {};
  PROP_KEYS.forEach((k, i) => {
    props[k] = propImgs[i]!;
  });

  return {
    player: { down, left, right, up },
    wisp,
    projectile,
    impact,
    pickup,
    props,
    ground,
    title: cover,
  };
}
