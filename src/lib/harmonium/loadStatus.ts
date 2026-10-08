import { useSyncExternalStore } from "react";

export type LoadStatus = {
  state: "idle" | "loading" | "ready" | "error";
  pct: number;
  reedLoaded: boolean;
  reverbLoaded: boolean;
};

const IDLE: LoadStatus = { state: "idle", pct: 0, reedLoaded: false, reverbLoaded: false };

let status = IDLE;
const listeners = new Set<() => void>();

/** Shared so the splash screen (outside the Play page) can follow the sample loading. */
export function setLoadStatus(patch: Partial<LoadStatus>) {
  status = { ...status, ...patch };
  listeners.forEach((l) => l());
}

export function resetLoadStatus() {
  status = IDLE;
  listeners.forEach((l) => l());
}

export function useLoadStatus(): LoadStatus {
  return useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    () => status,
    () => IDLE,
  );
}
