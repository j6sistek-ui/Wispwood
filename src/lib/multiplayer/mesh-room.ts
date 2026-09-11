import { joinRoom } from "trystero/nostr";
import { defaultIceServers, type PeerInfo, type P2PRoomOptions } from "./p2p";

type ActionSend = (data: unknown, peerId?: string) => void;
type Mesh = {
  leave: () => void;
  getPeers: () => Record<string, RTCPeerConnection>;
  onPeerJoin: (fn: (id: string) => void) => void;
  onPeerLeave: (fn: (id: string) => void) => void;
  makeAction: (ns: string) => [ActionSend, (fn: (data: unknown, peerId: string) => void) => void];
};

/**
 * Serverless rooms for GitHub Pages / shared links.
 * Same game messages as P2PRoom: ww-hello, ww-start, ww-state.
 */
export class MeshRoom {
  private readonly opts: P2PRoomOptions;
  private room: Mesh | null = null;
  private sendAction: ActionSend | null = null;
  private names = new Map<string, string>();
  private closed = false;
  private started = false;
  private tick: ReturnType<typeof setInterval> | null = null;
  private startTick: ReturnType<typeof setInterval> | null = null;

  constructor(opts: P2PRoomOptions) {
    this.opts = opts;
  }

  async join() {
    if (this.closed) return;
    const room = joinRoom(
      {
        appId: "wispwood-lantern",
        password: this.opts.room,
        rtcConfig: { iceServers: defaultIceServers() },
      },
      this.opts.room,
    ) as unknown as Mesh;
    if (this.closed) {
      try {
        room.leave();
      } catch {
        /* closed during join */
      }
      return;
    }
    this.room = room;
    const [send, listen] = room.makeAction("ww");
    this.sendAction = send;
    listen((data, peerId) => this.onData(peerId, data));
    room.onPeerJoin((id) => {
      if (this.closed) return;
      this.names.set(id, this.names.get(id) ?? "Ranger");
      this.greet(id);
      if (this.started) send({ type: "ww-start", name: this.opts.name ?? "Ranger" }, id);
      this.emitPeers();
    });
    room.onPeerLeave((id) => {
      this.names.delete(id);
      this.emitPeers();
    });
    this.opts.onConnected?.();
    this.greet();
    this.emitPeers();
    this.tick = setInterval(() => {
      this.greet();
      this.emitPeers();
    }, 800);
    if (this.started) this.blastStart();
  }

  close() {
    this.closed = true;
    if (this.tick) clearInterval(this.tick);
    if (this.startTick) clearInterval(this.startTick);
    try {
      this.room?.leave();
    } catch {
      /* already left */
    }
    this.room = null;
    this.sendAction = null;
    this.names.clear();
  }

  setName(name: string) {
    this.opts.name = name;
    this.greet();
  }

  startRoom() {
    this.started = true;
    this.opts.onRoomStarted?.();
    this.blastStart();
    if (this.startTick) clearInterval(this.startTick);
    this.startTick = setInterval(() => this.blastStart(), 280);
    window.setTimeout(() => {
      if (this.startTick) {
        clearInterval(this.startTick);
        this.startTick = null;
      }
    }, 5000);
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

  private greet(peerId?: string) {
    this.sendAction?.({ type: "ww-hello", name: this.opts.name ?? "Ranger", started: this.started }, peerId);
  }

  private blastStart() {
    this.sendAction?.({ type: "ww-start", name: this.opts.name ?? "Ranger" });
  }

  private list(): PeerInfo[] {
    const pcs = this.room?.getPeers() ?? {};
    const ids = new Set([...Object.keys(pcs), ...this.names.keys()]);
    return [...ids].map((id) => {
      const live = pcs[id]?.connectionState;
      const known = this.names.has(id);
      const connectionState: RTCPeerConnectionState =
        live === "connected" || known ? "connected" : live === "failed" || live === "disconnected" ? live : "connecting";
      return {
        id,
        name: this.names.get(id) || "Ranger",
        connectionState,
        candidateType: null,
        rttMs: null,
      };
    });
  }

  private emitPeers() {
    this.opts.onPeersChanged?.(this.list());
  }

  private onData(from: string, data: unknown) {
    if (!data || typeof data !== "object") return;
    const msg = data as { type?: string; name?: string; started?: boolean };
    if (typeof msg.name === "string" && msg.name) {
      this.names.set(from, msg.name);
      this.emitPeers();
    }
    if (msg.type === "ww-start" || msg.started) this.opts.onRoomStarted?.();
    this.opts.onMessage?.(from, data, "reliable");
  }
}
