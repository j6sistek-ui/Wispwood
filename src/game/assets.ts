import { asset } from "./paths";

export type Gfx = HTMLCanvasElement | HTMLImageElement;

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
    img.decoding = "async";
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
  player: Record<"down" | "left" | "right" | "up", Gfx[]>;
  wisp: Gfx[];
  projectile: Gfx[];
  impact: Gfx[];
  pickup: Gfx[];
  props: Record<string, Gfx>;
  ground: Gfx;
  title: Gfx;
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

function swatch(color: string, w = 64, h = 64): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  return c;
}

function sliceGrid(img: HTMLImageElement, fw: number, fh: number): HTMLCanvasElement[] {
  const cols = Math.max(1, Math.floor(img.width / fw));
  const rows = Math.max(1, Math.floor(img.height / fh));
  const out: HTMLCanvasElement[] = [];
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const c = document.createElement("canvas");
      c.width = fw;
      c.height = fh;
      const ctx = c.getContext("2d")!;
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(img, x * fw, y * fh, fw, fh, 0, 0, fw, fh);
      out.push(c);
    }
  }
  return out.length ? out : [swatch("#ecece8", fw, fh)];
}

function four(imgs: Gfx[], fallback: Gfx[]): Gfx[] {
  const src = imgs.length ? imgs : fallback;
  const out = src.slice(0, 4);
  while (out.length < 4) out.push(out[out.length - 1]!);
  return out;
}

export async function loadTitle(): Promise<HTMLImageElement> {
  return loadImage(asset("game/title.jpg"), 5000);
}

export async function loadCore(_title: HTMLImageElement | undefined, onProgress?: LoadProgress): Promise<GameAssets> {
  const total = 3;
  let done = 0;
  const tick = (label: string) => {
    done += 1;
    onProgress?.(done, total, label);
  };

  const [playerSheet, wispSheet, projSheet] = await Promise.all([
    loadQuiet(asset("game/player/sheet.png")).then((img) => {
      tick("Keeper");
      return img;
    }),
    loadQuiet(asset("game/wisp/sheet.png")).then((img) => {
      tick("Wisps");
      return img;
    }),
    loadQuiet(asset("game/projectile/sheet.png")).then((img) => {
      tick("Sparks");
      return img;
    }),
  ]);

  if (!playerSheet || !wispSheet || !projSheet) throw new Error("Core art missing");

  const playerFrames = sliceGrid(playerSheet, 96, 96);
  const down = four(playerFrames.slice(0, 4), playerFrames);
  const left = four(playerFrames.slice(4, 8), down);
  const right = four(playerFrames.slice(8, 12), down);
  const up = four(playerFrames.slice(12, 16), down);
  const wisp = four(sliceGrid(wispSheet, 128, 128), down);
  const projectile = four(sliceGrid(projSheet, 128, 128), wisp);

  return {
    player: { down, left, right, up },
    wisp,
    projectile,
    impact: projectile,
    pickup: projectile,
    props: {},
    ground: swatch("#1c1e14", 64, 64),
    title: swatch("#0c0d0c", 16, 16),
  };
}

export async function loadExtras(assets: GameAssets, onProgress?: LoadProgress): Promise<void> {
  const jobs: Array<Promise<void>> = [];
  const total = 3 + PROP_KEYS.length;
  let done = 0;
  const tick = (label: string) => {
    done += 1;
    onProgress?.(done, total, label);
  };

  jobs.push(
    loadQuiet(asset("game/title.jpg")).then((img) => {
      if (img) assets.title = img;
      tick("Cover");
    }),
  );
  jobs.push(
    loadQuiet(asset("game/ground.jpg")).then((img) => {
      if (img) assets.ground = img;
      tick("Clearing");
    }),
  );
  jobs.push(
    loadQuiet(asset("game/impact/sheet.png")).then((img) => {
      if (img) assets.impact = four(sliceGrid(img, 128, 128), assets.projectile);
      tick("Hits");
    }),
  );
  jobs.push(
    loadQuiet(asset("game/pickup/sheet.png")).then((img) => {
      if (img) assets.pickup = four(sliceGrid(img, 128, 128), assets.projectile);
      tick("Hearts");
    }),
  );
  for (const k of PROP_KEYS) {
    jobs.push(
      loadQuiet(asset(`game/props/${k}.png`)).then((img) => {
        if (img) assets.props[k] = img;
        tick("Woods");
      }),
    );
  }
  await Promise.all(jobs);
}

export async function loadProps(onProgress?: LoadProgress): Promise<Record<string, Gfx>> {
  const props: Record<string, Gfx> = {};
  let done = 0;
  await Promise.all(
    PROP_KEYS.map(async (k) => {
      const img = await loadQuiet(asset(`game/props/${k}.png`));
      done += 1;
      onProgress?.(done, PROP_KEYS.length, "Woods");
      if (img) props[k] = img;
    }),
  );
  return props;
}

export async function loadAssets(title?: HTMLImageElement): Promise<GameAssets> {
  const core = await loadCore(title);
  await loadExtras(core);
  return core;
}
