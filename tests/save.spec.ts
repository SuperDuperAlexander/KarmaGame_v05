import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createInitialState, createWorldStore} from '../src/state/worldStore';
import {createSaveService, migrateSave, RECOVERY_KEY, SAVE_KEY} from '../src/save/saveService';
import type {SaveStorage} from '../src/save/saveService';
import {deleteReflections, saveReflection, skipReflection} from '../src/reflection/reflectionStore';

export function memoryStorage() {
  const values = new Map<string, string>();
  const storage: SaveStorage = {getItem: key => values.get(key) ?? null, setItem: (key, value) => { values.set(key, value); }, removeItem: key => { values.delete(key); }};
  return {storage, values};
}

describe('local save', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(10000); });
  afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); });
  it('loads all fields with fresh data', () => {
    const store = createWorldStore(); const {storage} = memoryStorage();
    store.update(s => { s.world = 'inner'; s.positions.outer = {x: 30, y: 0, z: -2}; s.facts.push('CITY_ENTERED'); s.firedRules.push('once'); s.waveIds.push('wave'); s.reflections.money = '<img src=x onerror=alert(1)>'; });
    const save = createSaveService(store, storage); expect(save.flush()).toBe(true); expect(save.load()).toEqual(store.get()); save.dispose();
  });
  it.each(['{broken', 'null', JSON.stringify({...createInitialState(), schemaVersion: 100}), JSON.stringify({...createInitialState(), positions: {outer: {x: 0, y: 0, z: 'bad'}, inner: {x: 0, y: 0, z: 0}}})])('keeps invalid save for recovery: %s', raw => {
    const {storage, values} = memoryStorage(); values.set(SAVE_KEY, raw);
    const save = createSaveService(createWorldStore(), storage); expect(save.load()).toBeNull(); expect(values.get(RECOVERY_KEY)).toBe(raw); expect(values.has(SAVE_KEY)).toBe(false); save.dispose();
  });
  it('migrates the known pre-release shape and rejects future versions', () => {
    const old = {...createInitialState(), schemaVersion: 0, firedRules: undefined, waveIds: undefined};
    expect(migrateSave(old)).toEqual(createInitialState()); expect(() => migrateSave({...old, schemaVersion: 2})).toThrow();
  });
  it('throttles requests and flush, while keeping the newest changes', () => {
    const {storage, values} = memoryStorage(); const write = vi.spyOn(storage, 'setItem'); const store = createWorldStore();
    const save = createSaveService(store, storage); save.request(); vi.advanceTimersByTime(0); expect(write).toHaveBeenCalledTimes(1);
    store.update(s => { s.positions.outer.x = 1; }); expect(save.flush()).toBe(true); expect(write).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(500); store.update(s => { s.positions.outer.x = 2; }); save.request();
    vi.advanceTimersByTime(499); expect(write).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(1); expect(write).toHaveBeenCalledTimes(2); expect(JSON.parse(values.get(SAVE_KEY)!).positions.outer.x).toBe(2);
    expect(save.flush()).toBe(true); expect(write).toHaveBeenCalledTimes(2); save.dispose();
  });
  it('forces the last pending state on pagehide and removes the listener', () => {
    const target = new EventTarget(); vi.stubGlobal('window', target);
    const {storage, values} = memoryStorage(); const store = createWorldStore(); const save = createSaveService(store, storage);
    save.flush(); store.update(s => { s.positions.inner.x = 4; });
    target.dispatchEvent(new Event('pagehide')); expect(JSON.parse(values.get(SAVE_KEY)!).positions.inner.x).toBe(4);
    save.dispose(); const written = values.get(SAVE_KEY); store.update(s => { s.positions.inner.x = 5; }); target.dispatchEvent(new Event('pagehide')); vi.runAllTimers(); expect(values.get(SAVE_KEY)).toBe(written);
  });
  it('handles blocked storage without throwing or retry loops', () => {
    const bad: SaveStorage = {getItem: () => { throw Error('blocked'); }, setItem: () => { throw Error('full'); }, removeItem: () => { throw Error('blocked'); }};
    const save = createSaveService(createWorldStore(), bad); expect(save.load()).toBeNull(); expect(save.flush()).toBe(false); save.request(); vi.runAllTimers(); save.clear(); save.dispose();
  });
  it('clears queued writes, saved words and recovery data', () => {
    const {storage, values} = memoryStorage(); const store = createWorldStore(); const save = createSaveService(store, storage);
    save.flush(); values.set(RECOVERY_KEY, 'bad'); store.update(s => { s.positions.outer.x = 1; }); save.clear(); vi.runAllTimers(); expect(values.size).toBe(0); save.dispose();
  });
});

describe('reflection privacy', () => {
  it('keeps literal text without changing traits', () => {
    const store = createWorldStore(); const traits = {...store.get().traits}; const text = '<script>steal()</script>\nMoney is hard.';
    saveReflection(store, text); expect(store.get().reflections.money).toBe(text); expect(store.get().traits).toEqual(traits);
    expect(() => saveReflection(store, 'x'.repeat(2001))).toThrow(); expect(store.get().reflections.money).toBe(text);
  });
  it('deletes only words and keeps game facts and once IDs', () => {
    const store = createWorldStore(); store.update(s => { s.facts.push('MONEY_REFLECTION_SAVED'); s.firedRules.push('R7-reflection'); });
    saveReflection(store, 'answer'); deleteReflections(store); expect(store.get().reflections).toEqual({}); expect(store.get().facts).toContain('MONEY_REFLECTION_SAVED'); expect(store.get().firedRules).toContain('R7-reflection');
    saveReflection(store, 'answer'); skipReflection(store); expect(store.get().reflections).toEqual({});
  });
});
