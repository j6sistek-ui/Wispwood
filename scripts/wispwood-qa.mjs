import { chromium } from "playwright";

const url = process.argv[2] || "http://127.0.0.1:8080/";
const shot = process.argv[3] || "/workspace/screenshots/gameplay.png";

const browser = await chromium.launch({
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.getByRole("button", { name: /enter the clearing/i }).click();
await page.waitForTimeout(600);
await page.screenshot({ path: shot, fullPage: false });

const before = await page.evaluate(() => {
  const t = window.__controlsTest;
  if (!t) return null;
  return { pos: t.getPos(), phase: t.getPhase() };
});

await page.evaluate(() => window.__controlsTest?.setKeys(["KeyW"]));
await page.waitForTimeout(400);
const afterW = await page.evaluate(() => window.__controlsTest?.getPos());

await page.evaluate(() => window.__controlsTest?.setKeys(["KeyA", "KeyW"]));
await page.waitForTimeout(500);
const afterA = await page.evaluate(() => window.__controlsTest?.getPos());

await page.evaluate(() => window.__controlsTest?.setKeys(["KeyD", "KeyW"]));
await page.waitForTimeout(500);
const afterD = await page.evaluate(() => window.__controlsTest?.getPos());

await page.evaluate(() => window.__controlsTest?.clearKeys());

const mobile = await browser.newPage({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
});
await mobile.goto(url, { waitUntil: "networkidle" });
await mobile.waitForTimeout(600);
await mobile.screenshot({ path: "/workspace/screenshots/mobile-title.png" });
await mobile.getByRole("button", { name: /enter the clearing/i }).click();
await mobile.waitForTimeout(500);
await mobile.screenshot({ path: "/workspace/screenshots/mobile-play.png" });
const overflow = await mobile.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  inner: window.innerWidth,
}));

console.log(
  JSON.stringify(
    {
      errors,
      before,
      afterW,
      afterA,
      afterD,
      overflow,
      aMovedLeft: afterA && afterW ? afterA.x < afterW.x - 4 : false,
      dMovedRight: afterD && afterA ? afterD.x > afterA.x + 4 : false,
      wMovedUp: afterW && before?.pos ? afterW.y < before.pos.y - 4 : false,
    },
    null,
    2,
  ),
);

await browser.close();
process.exit(errors.length ? 1 : 0);
