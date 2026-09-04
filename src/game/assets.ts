import { asset } from "./paths";

function placeholder(): HTMLImageElement {
  const c = document.createElement("canvas");
  c.width = 8;
  c.height = 8;
  const g = c.getContext("2d");
  if (g) {
    g.fillStyle = "#1c1e1b";
    g.fillRect(0, 0, 8, 8);
  }
  const img = new Image();
  img.src = c.toDataURL("image/png");
  return img;
}

function loadImage(src: string, ms = 2500): Promise<HTMLImageElement> {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;
    const finish = (value: HTMLImageElement) => {
      if (done) return;
      done = true;
      window.clearTimeout(timer);
      resolve(value);
    };
    const timer = window.setTimeout(() => finish(placeholder()), ms);
    img.crossOrigin = "anonymous";
    img.onload = () => finish(img);
    img.onerror = () => finish(placeholder());
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
  const playerJobs = DIRS.flatMap((dir) =>
    [1, 2, 3, 4].map((i) => loadImage(asset(`game/player/${dir}-${i}.png`)).then((img) => ({ dir, img }))),
  );
  const jobs = await Promise.all([
    Promise.all(playerJobs),
    Promise.all([1, 2, 3, 4].map((i) => loadImage(asset(`game/wisp/hover-${i}.png`)))),
    Promise.all([1, 2, 3, 4].map((i) => loadImage(asset(`game/projectile/projectile-${i}.png`)))),
    Promise.all([1, 2, 3, 4].map((i) => loadImage(asset(`game/impact/impact-${i}.png`)))),
    Promise.all([1, 2, 3, 4].map((i) => loadImage(asset(`game/pickup/idle-${i}.png`)))),
    loadImage(asset("game/ground.png")),
    loadImage(asset("game/title.jpg")),
    Promise.all(PROP_KEYS.map((k) => loadImage(asset(`game/props/${k}.png`)))),
  ]);
  const playerFrames = jobs[0];
  const player = {
    down: playerFrames.filter((f) => f.dir === "down").map((f) => f.img),
    left: playerFrames.filter((f) => f.dir === "left").map((f) => f.img),
    right: playerFrames.filter((f) => f.dir === "right").map((f) => f.img),
    up: playerFrames.filter((f) => f.dir === "up").map((f) => f.img),
  };
  const props: Record<string, HTMLImageElement> = {};
  PROP_KEYS.forEach((k, i) => {
    props[k] = jobs[7][i]!;
  });
  return {
    player,
    wisp: jobs[1],
    projectile: jobs[2],
    impact: jobs[3],
    pickup: jobs[4],
    props,
    ground: jobs[5],
    title: jobs[6],
  };
}
