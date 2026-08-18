function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load ${src}`));
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

const DIRS = ["down", "left", "right", "up"] as const;
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

export async function loadAssets(): Promise<GameAssets> {
  const playerEntries = await Promise.all(
    DIRS.map(async (dir) => {
      const frames = await Promise.all(
        [1, 2, 3, 4].map((i) => loadImage(`/game/player/${dir}-${i}.png`)),
      );
      return [dir, frames] as const;
    }),
  );
  const [wisp, projectile, impact, pickup, ground, title, ...propImgs] = await Promise.all([
    Promise.all([1, 2, 3, 4].map((i) => loadImage(`/game/wisp/hover-${i}.png`))),
    Promise.all([1, 2, 3, 4].map((i) => loadImage(`/game/projectile/projectile-${i}.png`))),
    Promise.all([1, 2, 3, 4].map((i) => loadImage(`/game/impact/impact-${i}.png`))),
    Promise.all([1, 2, 3, 4].map((i) => loadImage(`/game/pickup/idle-${i}.png`))),
    loadImage("/game/ground.png"),
    loadImage("/game/title.jpg"),
    ...PROP_KEYS.map((k) => loadImage(`/game/props/${k}.png`)),
  ]);

  const props: Record<string, HTMLImageElement> = {};
  PROP_KEYS.forEach((k, i) => {
    props[k] = propImgs[i]!;
  });

  return {
    player: Object.fromEntries(playerEntries) as GameAssets["player"],
    wisp,
    projectile,
    impact,
    pickup,
    props,
    ground,
    title,
  };
}
