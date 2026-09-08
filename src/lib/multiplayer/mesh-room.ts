import { joinRoom } from "trystero";
import type { PeerInfo, P2PRoomOptions } from "./p2p";

type Mesh = {
  leave: () => void;
  getPeers: () => Record<string, RTCPeerConnection>;
  onPeerJoin: (fn: (id: string) => void) => void;
  onPeerLeave: (fn: (id: string) => void) => void;
  makeAction: (ns: string) => [(data: unknown, peerId?: string) => void, (fn: (data: unknown, peerId: string) => void) => void];
};

/**
 * Static-host fallback (GitHub Pages has no /api/rtc).
 * Same game messages as P2PRoom: ww-hello, ww-start, ww-state.
 */
export class MeshRoom {
  private readonly opts: P2PRoomOptions;
  private room: Mesh | null = null;
  private sendAction: ((data: unknown, peerId?: string) => void) | null = null;
  private names = new Map<string, string>();
  private closed = false;
  private started = false;
  private tick: ReturnType<typeof setInterval> | null = null;

  constructor(opts: P2PRoomOptions) {
    this.opts = opts;
  }

  async join() {
    if (this.closed) return;
    const room = joinRoom({ appId: "wispwood-lantern" }, this.opts.room) as unknown as Mesh;
    this.room = room;
    const [send, listen] = room.makeAction("ww");
    this.sendAction = send;
    listen((data, peerId) => this.onData(peerId, data));
    room.onPeerJoin((id) => {
      if (this.closed) return;
      this.names.set(id, this.names.get(id) ?? "Ranger");
      send({ type: "ww-hello", name: this.opts.name ?? "Ranger" }, id);
      if (this.started) send({ type: "ww-start" }, id);
      this.emitPeers();
    });
    room.onPeerLeave((id) => {
      this.names.delete(id);
      this.emitPeers();
    });
    this.opts.onConnected?.();
    send({ type: "ww-hello", name: this.opts.name ?? "Ranger" });
    this.emitPeers();
    this.tick = setInterval(() => this.emitPeers(), 500);
  }

  close() {
    this.closed = true;
    if (this.tick) clearInterval(this.tick);
    try {
      this.room?.leave();
    } catch {
      /* already left */
    }
    this.room = null;
    this.sendAction = null;
    this.names.clear();
  }

  startRoom() {
    this.started = true;
    this.opts.onRoomStarted?.();
    this.sendAction?.({ type: "ww-start" });
  }

  broadcast(data: unknown) {
    this.sendAction?.(data);
  }

  send(data: unknown, peerId?: string) {
    this.sendAction?.(data, peerId);
  }

  peerList(): PeerInfo[] {
    return this.list();
  }

  private list(): PeerInfo[] {
    const peers = this.room?.getPeers() ?? {};
    return Object.entries(peers).map(([id, pc]) => ({
      id,
      name: this.names.get(id) || "Ranger",
      connectionState: pc.connectionState,
      candidateType: null,
      rttMs: null,
    }));
  }

  private emitPeers() {
    this.opts.onPeersChanged?.(this.list());
  }

  private onData(from: string, data: unknown) {
    if (!data || typeof data !== "object") return;
    const msg = data as { type?: string; name?: string };
    if (msg.type === "ww-hello" && typeof msg.name === "string" && msg.name) {
      this.names.set(from, msg.name);
      this.emitPeers();
    }
    if (msg.type === "ww-start") this.opts.onRoomStarted?.();
    this.opts.onMessage?.(from, data, "reliable");
  }
}
