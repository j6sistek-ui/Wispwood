import { useCallback, useEffect, useRef, useState } from "react";
import { P2PRoom, type PeerInfo } from "./p2p";

export interface UseP2PRoomOptions {
  room: string;
  name?: string;
  onStart?: () => void;
}

export interface P2PRoomHandle {
  selfId: string;
  room: string;
  peers: PeerInfo[];
  joined: boolean;
  broadcast: (data: unknown) => void;
  send: (data: unknown, peerId?: string) => void;
  startRoom: () => void;
  onMessage: (
    fn: (from: string, data: unknown, channel: "state" | "reliable") => void,
  ) => () => void;
}

export function useP2PRoom(options: UseP2PRoomOptions): P2PRoomHandle {
  const [selfId] = useState(() => `p-${Math.random().toString(36).slice(2, 10)}`);
  const [room] = useState(() => options.room);
  const [name] = useState(() => options.name ?? selfId);
  const [peers, setPeers] = useState<PeerInfo[]>([]);
  const [joined, setJoined] = useState(false);
  const roomRef = useRef<P2PRoom | null>(null);
  const listeners = useRef(
    new Set<(from: string, data: unknown, channel: "state" | "reliable") => void>(),
  );
  const onStartRef = useRef(options.onStart);
  onStartRef.current = options.onStart;

  useEffect(() => {
    const p2p = new P2PRoom({
      room,
      selfId,
      name,
      onPeersChanged: setPeers,
      onMessage: (from, data, channel) => {
        for (const fn of listeners.current) fn(from, data, channel);
      },
      onConnected: () => setJoined(true),
      onRoomStarted: () => onStartRef.current?.(),
    });
    roomRef.current = p2p;
    void p2p.join();
    return () => {
      roomRef.current = null;
      p2p.close();
    };
  }, [room, selfId, name]);

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
