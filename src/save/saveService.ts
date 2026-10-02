import type {SaveService, WorldState, WorldStore} from '../contracts/state';
import {MAX_SAVE_LENGTH, validateWorldState} from '../state/worldStore';

export const SAVE_KEY = 'light-within-save-v1';
export const RECOVERY_KEY = 'light-within-save-recovery';
export type SaveStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

/** Version zero was the pre-release state shape without once/wave IDs. */
export function migrateSave(value: unknown): WorldState {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid save');
  const source = value as Record<string, unknown>;
  if (source.schemaVersion === 0) {
    return validateWorldState({...source, schemaVersion: 1, firedRules: source.firedRules ?? [], waveIds: source.waveIds ?? []});
  }
  return validateWorldState(source);
}

function defaultStorage(): SaveStorage | undefined {
  try { return globalThis.localStorage; } catch { return undefined; }
}

export function createSaveService(store: WorldStore, storage: SaveStorage | undefined = defaultStorage()): SaveService {
  let lastWrite = -Infinity;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending = false;
  let disposed = false;
  let lastSaved: string | undefined;
  const events = typeof window === 'undefined' ? undefined : window;

  function cancelTimer() { if (timer !== undefined) clearTimeout(timer); timer = undefined; }
  function schedule() {
    if (disposed || timer !== undefined || !pending) return;
    const delay = Math.max(0, 1000 - (Date.now() - lastWrite));
    timer = setTimeout(() => { timer = undefined; write(false); }, delay);
  }
  function write(force: boolean): boolean {
    if (disposed || !storage) return false;
    const state = JSON.stringify(store.get());
    if (state === lastSaved) { pending = false; cancelTimer(); return true; }
    if (!force && Date.now() - lastWrite < 1000) { pending = true; schedule(); return false; }
    try {
      storage.setItem(SAVE_KEY, state);
      lastWrite = Date.now(); lastSaved = state; pending = false; cancelTimer();
      return true;
    } catch {
      // Do not loop on a blocked or full store. A later request can retry.
      pending = true; cancelTimer(); return false;
    }
  }
  const pageHide = () => { if (pending) write(true); };
  const unsubscribe = store.subscribe(() => { pending = true; schedule(); });
  events?.addEventListener('pagehide', pageHide);

  return {
    load() {
      if (!storage || disposed) return null;
      let raw: string | null;
      try { raw = storage.getItem(SAVE_KEY); } catch { return null; }
      if (raw === null) return null;
      try {
        if (raw.length > MAX_SAVE_LENGTH) throw new Error('Save too large');
        return migrateSave(JSON.parse(raw) as unknown);
      } catch {
        // Keep the source for recovery. Do not execute or render its text.
        try { storage.setItem(RECOVERY_KEY, raw.slice(0, MAX_SAVE_LENGTH)); } catch { /* Storage can be blocked. */ }
        try { storage.removeItem(SAVE_KEY); } catch { /* The next load stays safe. */ }
        return null;
      }
    },
    request() { if (!disposed) { pending = true; schedule(); } },
    // A write inside the one-second limit is only delayed, not lost. Report false only when storage fails.
    flush() { pending = true; if (Date.now() - lastWrite < 1000) { schedule(); return true; } return write(false); },
    dispose() {
      if (disposed) return;
      if (pending) write(true);
      disposed = true; cancelTimer(); unsubscribe(); events?.removeEventListener('pagehide', pageHide);
    },
    clear() {
      cancelTimer(); pending = false; lastSaved = undefined;
      try { storage?.removeItem(SAVE_KEY); storage?.removeItem(RECOVERY_KEY); } catch { /* Keep the game usable without storage. */ }
    },
  };
}
