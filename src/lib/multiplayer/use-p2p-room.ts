import { useCallback, useEffect, useRef, useState } from "react";
import { P2PRoom, type PeerInfo } from "./p2p";
import { MeshRoom } from "./mesh-room";

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
};

let rtcOk: boolean | null = null;

async function probeRtc() {
  if (rtcOk != null) return rtcOk;
  try {
    const ctrl = new AbortController();
    const t = window.setTimeout(() => ctrl.abort(), 1200);
    const res = await fetch("/api/rtc?room=probe&peer=probe&name=&since=0", { signal: ctrl.signal });
    window.clearTimeout(t);
    rtcOk = res.ok;
  } catch {
    rtcOk = false;
  }
  return rtcOk;
}

export function useP2PRoom(options: UseP2PRoomOptions): P2PRoomHandle {
  const [selfId] = useState(() => `p-${Math.random().toString(36).slice(2, 10)}`);
  const [name] = useState(() => options.name ?? selfId);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [joined, setJoined] = useState(false);
  const roomRef = useRef<AnyRoom | null>(null);
  const listeners = useRef(
    new Set<(from: string, data: unknown, channel: "state" | "reliable") => void>(),
  );
  const onStartRef = useRef(options.onStart);
  onStartRef.current = options.onStart;
  const room = options.room;
  const liveName = options.name ?? name;

  useEffect(() => {
    setPeers([]);
    setJoined(false);
    if (!room) return;
    let closed = false;
    let inst: AnyRoom | null = null;
    const opts = {
      room,
      selfId,
      name: liveName,
      onPeersChanged: setPeers,
      onMessage: (from: string, data: unknown, channel: "state" | "reliable") => {
        for (const fn of listeners.current) fn(from, data, channel);
      },
      onConnected: () => {
        if (!closed) setJoined(true);
      },
      onRoomStarted: () => onStartRef.current?.(),
    };
    void (async () => {
      const useRtc = await probeRtc();
      if (closed) return;
      inst = useRtc ? new P2PRoom(opts) : new MeshRoom(opts);
      roomRef.current = inst;
      await inst.join();
    })();
    return () => {
      closed = true;
      roomRef.current = null;
      inst?.close();
    };
  }, [room, selfId, liveName]);

  const broadcast = useCallback((data: unknown) => roomRef.current?.broadcast(data), []);
  const send = useCallback(
    (data: unknown, peerId?: string) => roomRef.current?.send(data, peerId),
    [],
  );
  const startRoom = useCallback(() => roomRef.current?.startRoom(), []);
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
