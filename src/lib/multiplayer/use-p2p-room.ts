import { useCallback, useEffect, useRef, useState } from "react";
import type { PeerInfo } from "./p2p";

export interface UseP2PRoomOptions {
  room: string | null;
  name?: string;
  onStart?: () => void;
}

export interface P2PRoomHandle {
  selfId: string;
  room: string | null;
  peers: PeerInfo[];
  joined: boolean;
  broadcast: (data: unknown) => void;
  send: (data: unknown, peerId?: string) => void;
  startRoom: () => void;
  onMessage: (
    fn: (from: string, data: unknown, channel: "state" | "reliable") => void,
  ) => () => void;
}

type AnyRoom = {
  join: () => Promise<void>;
  close: () => void;
  startRoom: () => void;
  broadcast: (data: unknown) => void;
  send: (data: unknown, peerId?: string) => void;
  setName?: (name: string) => void;
};

async function rtcAvailable() {
  try {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => ctrl.abort(), 700);
    const res = await fetch("/api/rtc?room=probe&peer=probe&name=&since=0", { signal: ctrl.signal });
    window.clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

export function useP2PRoom(options: UseP2PRoomOptions): P2PRoomHandle {
  const [selfId] = useState(() => `p-${Math.random().toString(36).slice(2, 10)}`);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [joined, setJoined] = useState(false);
  const roomRef = useRef<AnyRoom | null>(null);
  const listeners = useRef(
    new Set<(from: string, data: unknown, channel: "state" | "reliable") => void>(),
  );
  const onStartRef = useRef(options.onStart);
  onStartRef.current = options.onStart;
  const nameRef = useRef(options.name ?? "Ranger");
  nameRef.current = options.name ?? "Ranger";
  const wantStart = useRef(false);
  const started = useRef(false);
  const room = options.room;

  useEffect(() => {
    setPeers([]);
    setJoined(false);
    wantStart.current = false;
    started.current = false;
    if (!room) return;
    let closed = false;
    let inst: AnyRoom | null = null;
    const fireStart = () => {
      if (started.current) return;
      started.current = true;
      onStartRef.current?.();
    };
    const opts = {
      room,
      selfId,
      name: nameRef.current,
      onPeersChanged: setPeers,
      onMessage: (from: string, data: unknown, channel: "state" | "reliable") => {
        for (const fn of listeners.current) fn(from, data, channel);
      },
      onConnected: () => {
        if (!closed) setJoined(true);
      },
      onRoomStarted: fireStart,
    };
    void (async () => {
      const { MeshRoom } = await import("./mesh-room");
      const mesh = new MeshRoom(opts);
      inst = mesh;
      roomRef.current = mesh;
      try {
        await mesh.join();
      } catch {
        if (closed) return;
        if (!(await rtcAvailable())) return;
        mesh.close();
        const { P2PRoom } = await import("./p2p");
        const rtc = new P2PRoom(opts);
        inst = rtc;
        roomRef.current = rtc;
        await rtc.join();
      }
      if (closed) {
        inst?.close();
        return;
      }
      if (wantStart.current) inst.startRoom();
    })();
    return () => {
      closed = true;
      roomRef.current = null;
      inst?.close();
    };
  }, [room, selfId]);

  useEffect(() => {
    roomRef.current?.setName?.(nameRef.current);
  }, [options.name]);

  const broadcast = useCallback((data: unknown) => roomRef.current?.broadcast(data), []);
  const send = useCallback(
    (data: unknown, peerId?: string) => roomRef.current?.send(data, peerId),
    [],
  );
  const startRoom = useCallback(() => {
    wantStart.current = true;
    if (roomRef.current) roomRef.current.startRoom();
  }, []);
  const onMessage = useCallback(
    (fn: (from: string, data: unknown, channel: "state" | "reliable") => void) => {
      listeners.current.add(fn);
      return () => {
        listeners.current.delete(fn);
      };
    },
    [],
  );

  return { selfId, room, peers, joined, broadcast, send, startRoom, onMessage };
}
