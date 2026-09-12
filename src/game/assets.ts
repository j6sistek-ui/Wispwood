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

async function loadQuiet(src: string): Promise<HTMLImageElement | null> {
  try {
    return await loadImage(src);
  } catch {
    return null;
  }
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

export type LoadProgress = (done: number, total: number, label: string) => void;

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

const CORE_TOTAL = 16 + 4 + 4 + 4 + 4 + 1;
const PROP_TOTAL = PROP_KEYS.length;

function frames(kind: string, n: number) {
  return Array.from({ length: n }, (_, i) => asset(`game/${kind}-${i + 1}.png`));
}

export async function loadTitle(): Promise<HTMLImageElement> {
  return loadImage(asset("game/title.jpg"), 6000);
}

export async function loadCore(title: HTMLImageElement | undefined, onProgress?: LoadProgress): Promise<GameAssets> {
  let done = 0;
  const total = CORE_TOTAL + (title ? 0 : 1);
  const tick = (label: string) => {
    done += 1;
    onProgress?.(done, total, label);
  };

  const pack = async (urls: string[], label: string) => {
    const imgs = await Promise.all(
      urls.map(async (src) => {
        const img = await loadQuiet(src);
        tick(label);
        return img;
      }),
    );
    return imgs.filter((img): img is HTMLImageElement => Boolean(img));
  };

  const [down, left, right, up, wisp, projectile, impact, pickup, ground, cover] = await Promise.all([
    pack(frames("player/down", 4), "Keeper"),
    pack(frames("player/left", 4), "Keeper"),
    pack(frames("player/right", 4), "Keeper"),
    pack(frames("player/up", 4), "Keeper"),
    pack(frames("wisp/hover", 4), "Wisps"),
    pack(frames("projectile/projectile", 4), "Sparks"),
    pack(frames("impact/impact", 4), "Hits"),
    pack(frames("pickup/idle", 4), "Hearts"),
    loadQuiet(asset("game/ground.jpg")).then((img) => {
      tick("Clearing");
      return img;
    }),
    title
      ? Promise.resolve(title)
      : loadQuiet(asset("game/title.jpg")).then((img) => {
          tick("Cover");
          return img;
        }),
  ]);

  if (!down[0] || !wisp[0] || !projectile[0] || !ground || !cover) {
    throw new Error("Core art missing");
  }

  const four = (imgs: HTMLImageElement[], fallback: HTMLImageElement[]) => {
    const src = imgs.length ? imgs : fallback;
    const out = src.slice(0, 4);
    while (out.length < 4) out.push(out[out.length - 1]!);
    return out;
  };

  return {
    player: {
      down: four(down, [cover]),
      left: four(left, down),
      right: four(right, down),
      up: four(up, down),
    },
    wisp: four(wisp, down),
    projectile: four(projectile, down),
    impact: four(impact, projectile.length ? projectile : down),
    pickup: four(pickup, projectile.length ? projectile : down),
    props: {},
    ground,
    title: cover,
  };
}

export async function loadProps(onProgress?: LoadProgress): Promise<Record<string, HTMLImageElement>> {
  const props: Record<string, HTMLImageElement> = {};
  let done = 0;
  await Promise.all(
    PROP_KEYS.map(async (k) => {
      const img = await loadQuiet(asset(`game/props/${k}.png`));
      done += 1;
      onProgress?.(done, PROP_TOTAL, "Woods");
      if (img) props[k] = img;
    }),
  );
  return props;
}

export async function loadAssets(title?: HTMLImageElement): Promise<GameAssets> {
  const core = await loadCore(title);
  core.props = await loadProps();
  return core;
}
