import type {Fact, Position, Trait, WorldState, WorldStore} from '../contracts/state';

export const FACTS: readonly Fact[] = ['PACKAGE_RECEIVED', 'CITY_ENTERED', 'TREE_DISCOVERED', 'INNER_WORLD_ENTERED', 'MONEY_REFLECTION_SAVED', 'MARKET_VISITED', 'ATTACHMENT_TRIGGERED', 'ATTACHMENT_SEEN'];
export const TRAITS: readonly Trait[] = ['attachment', 'fear', 'trust', 'contentment'];
export const MAX_REFLECTION_LENGTH = 2000;
export const MAX_SAVE_LENGTH = 131072;
const safeKey = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{0,79}$/;

export function createInitialState(): WorldState {
  return {
    schemaVersion: 1, facts: [], firedRules: [],
    traits: {attachment: 0, fear: 0, trust: 0, contentment: 0}, counters: {},
    world: 'outer', positions: {outer: {x: 0, y: 0, z: -47}, inner: {x: 0, y: 0, z: -7}},
    reflections: {}, waveIds: [],
  };
}

function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid state object');
  return value as Record<string, unknown>;
}
function finite(value: unknown, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) throw new Error('Invalid state number');
  return value;
}
function ids(value: unknown): string[] {
  if (!Array.isArray(value) || value.length > 256 || value.some(id => typeof id !== 'string' || !validKey(id))) throw new Error('Invalid state IDs');
  return [...new Set(value as string[])];
}
function validKey(key: string): boolean {
  return safeKey.test(key) && !['__proto__', 'prototype', 'constructor'].includes(key);
}
function position(value: unknown): Position {
  const point = record(value);
  return {x: finite(point.x, -1000, 1000), y: finite(point.y, -100, 100), z: finite(point.z, -1000, 1000)};
}

/** Reject invalid data before it can enter the game. Return fresh plain data. */
export function validateWorldState(value: unknown): WorldState {
  const source = record(value);
  if (source.schemaVersion !== 1) throw new Error('Unsupported save version');
  if (source.world !== 'outer' && source.world !== 'inner') throw new Error('Invalid world');
  if (!Array.isArray(source.facts) || source.facts.length > 256 || source.facts.some(fact => !FACTS.includes(fact as Fact))) throw new Error('Invalid facts');
  const traits = record(source.traits);
  const positions = record(source.positions);
  const counters = record(source.counters);
  const reflections = record(source.reflections);
  if (Object.keys(counters).length > 64 || Object.keys(reflections).length > 32) throw new Error('Too many state entries');
  const result = createInitialState();
  result.world = source.world;
  result.facts = [...new Set(source.facts as Fact[])];
  result.firedRules = ids(source.firedRules);
  result.waveIds = ids(source.waveIds);
  for (const trait of TRAITS) result.traits[trait] = finite(traits[trait], 0, 1);
  result.positions = {outer: position(positions.outer), inner: position(positions.inner)};
  for (const [key, count] of Object.entries(counters)) {
    if (!validKey(key)) throw new Error('Invalid counter name');
    const number = finite(count, 0, 1_000_000);
    if (!Number.isInteger(number)) throw new Error('Invalid counter');
    result.counters[key] = number;
  }
  for (const [key, text] of Object.entries(reflections)) {
    if (!validKey(key) || typeof text !== 'string' || text.length > MAX_REFLECTION_LENGTH) throw new Error('Invalid reflection');
    result.reflections[key] = text;
  }
  return result;
}

function freeze(state: WorldState): WorldState {
  Object.freeze(state.facts); Object.freeze(state.firedRules); Object.freeze(state.waveIds);
  Object.freeze(state.traits); Object.freeze(state.counters); Object.freeze(state.reflections);
  Object.freeze(state.positions.outer); Object.freeze(state.positions.inner); Object.freeze(state.positions);
  return Object.freeze(state);
}

export function createWorldStore(initial: WorldState = createInitialState()): WorldStore {
  let state = freeze(validateWorldState(initial));
  const listeners = new Set<(state: Readonly<WorldState>) => void>();
  const notify = () => { for (const listener of [...listeners]) listener(state); };
  return {
    get: () => state,
    update(change) {
      const draft = structuredClone(state);
      change(draft);
      // Facts and once IDs are lasting records. Only New Game removes them.
      draft.facts = [...new Set([...state.facts, ...draft.facts])];
      draft.firedRules = [...new Set([...state.firedRules, ...draft.firedRules])];
      draft.waveIds = [...new Set([...state.waveIds, ...draft.waveIds])];
      for (const trait of TRAITS) draft.traits[trait] = Math.max(0, Math.min(1, draft.traits[trait]));
      state = freeze(validateWorldState(draft));
      notify();
    },
    subscribe(listener) { listeners.add(listener); return () => { listeners.delete(listener); }; },
    reset() { state = freeze(createInitialState()); notify(); },
  };
}
