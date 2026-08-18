export type Actions = {
  moveX: number;
  moveY: number;
  aimX: number;
  aimY: number;
  fire: boolean;
  pausePressed: boolean;
};

const GAME_CODES = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "ArrowUp",
  "ArrowLeft",
  "ArrowDown",
  "ArrowRight",
  "Space",
  "Escape",
  "KeyP",
  "KeyM",
  "KeyQ",
  "KeyB",
  "Tab",
  "Digit1",
  "Digit2",
  "Numpad1",
  "Numpad2",
]);

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  return target.isContentEditable;
}

function radialDeadzone(x: number, y: number, dz = 0.18) {
  const m = Math.hypot(x, y);
  if (m < dz) return { x: 0, y: 0 };
  const scale = (m - dz) / (1 - dz) / m;
  return { x: x * scale, y: y * scale };
}

export class Input {
  keys = new Set<string>();
  pointer = { x: 0, y: 0, down: false, hasPoint: false };
  touchMove = { x: 0, y: 0 };
  touchAim = { x: 0, y: 0, active: false };
  private prevPause = false;
  private injected: string[] | null = null;
  private queuedShots = 0;

  attach() {
    const down = (e: KeyboardEvent) => {
      if (this.injected) return;
      if (isTypingTarget(e.target)) return;
      this.keys.add(e.code);
      if (GAME_CODES.has(e.code)) e.preventDefault();
    };
    const up = (e: KeyboardEvent) => {
      this.keys.delete(e.code);
    };
    const clear = () => this.keys.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", clear);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) this.keys.clear();
    });
    this._detach = () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", clear);
    };
  }

  private _detach: (() => void) | null = null;

  detach() {
    this._detach?.();
    this._detach = null;
  }

  queueShot() {
    this.queuedShots += 1;
  }

  setKeys(codes: string[]) {
    this.injected = codes;
  }

  clearInjected() {
    this.injected = null;
  }

  has(code: string) {
    if (this.injected) return this.injected.includes(code);
    return this.keys.has(code);
  }

  poll(): Actions {
    let mx = 0;
    let my = 0;
    if (this.has("KeyA") || this.has("ArrowLeft")) mx -= 1;
    if (this.has("KeyD") || this.has("ArrowRight")) mx += 1;
    if (this.has("KeyW") || this.has("ArrowUp")) my -= 1;
    if (this.has("KeyS") || this.has("ArrowDown")) my += 1;

    mx += this.touchMove.x;
    my += this.touchMove.y;

    const pads = typeof navigator !== "undefined" ? navigator.getGamepads?.() : [];
    if (pads) {
      for (const pad of pads) {
        if (!pad || pad.mapping !== "standard") continue;
        const ls = radialDeadzone(pad.axes[0] ?? 0, pad.axes[1] ?? 0);
        const rs = radialDeadzone(pad.axes[2] ?? 0, pad.axes[3] ?? 0);
        mx += ls.x;
        my += ls.y;
        if (Math.hypot(rs.x, rs.y) > 0.2) {
          this.touchAim.x = rs.x;
          this.touchAim.y = rs.y;
          this.touchAim.active = true;
        }
        if (pad.buttons[0]?.pressed || (pad.buttons[7]?.value ?? 0) > 0.4) {
          this.pointer.down = true;
        }
      }
    }

    const mag = Math.hypot(mx, my);
    if (mag > 1) {
      mx /= mag;
      my /= mag;
    }

    const pauseNow = this.has("Escape") || this.has("KeyP");
    const pausePressed = pauseNow && !this.prevPause;
    this.prevPause = pauseNow;

    const clicked = this.queuedShots > 0;
    if (clicked) this.queuedShots -= 1;

    const fire =
      clicked || this.pointer.down || this.touchAim.active || this.has("Space");

    let aimX = 0;
    let aimY = 0;
    if (this.touchAim.active) {
      aimX = this.touchAim.x;
      aimY = this.touchAim.y;
    }

    return { moveX: mx, moveY: my, aimX, aimY, fire, pausePressed };
  }
}
