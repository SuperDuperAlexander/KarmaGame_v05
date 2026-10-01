import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import type {Effect, SignalType, WorldState} from '../src/contracts/state';
import {createWorldStore} from '../src/state/worldStore';
import {createRuleEngine} from '../src/rules/ruleEngine';
import {sliceRules} from '../src/narrative/sliceRules';
import {createSaveService, SAVE_KEY} from '../src/save/saveService';
import {saveReflection, skipReflection} from '../src/reflection/reflectionStore';
import {selectors} from '../src/state/selectors';

function journey(initial?: WorldState, values = new Map<string, string>()) {
  const store = createWorldStore(initial);
  const save = createSaveService(store, {getItem: key => values.get(key) ?? null, setItem: (key, text) => { values.set(key, text); }, removeItem: key => { values.delete(key); }});
  const effects: Effect[] = [];
  const engine = createRuleEngine(store, sliceRules, effect => {
    if (effect.kind === 'save') {
      if (!save.flush()) { vi.advanceTimersByTime(1000); expect(save.flush()).toBe(true); }
    }
    if (effect.kind === 'transition') store.update(s => { s.world = effect.world; });
    if (effect.kind === 'wave') {
      const saved = JSON.parse(values.get(SAVE_KEY)!) as WorldState;
      expect(saved.facts).toContain('ATTACHMENT_TRIGGERED'); expect(saved.waveIds).toContain(effect.id); expect(saved.firedRules).toContain('R10-desire');
    }
    effects.push(effect);
  });
  const send = (...signals: SignalType[]) => { for (const type of signals) { vi.advanceTimersByTime(1000); engine.dispatch({type}); } };
  return {store, save, effects, send, values};
}

describe('open slice journeys', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(10000); });
  afterEach(() => { vi.useRealTimers(); });
  it.each(['tree-first', 'market-first'] as const)('finishes %s with one wave through reload', order => {
    const first = journey();
    first.send('city-enter', 'tree-enter', 'market-enter', 'desire', 'reflect'); expect(first.store.get().facts).toEqual([]);
    first.send('waystone', 'waystone', 'city-enter');
    if (order === 'tree-first') {
      first.send('tree-enter', 'look-within', 'inner-active');
      expect(first.effects.some(effect => effect.kind === 'panel')).toBe(false);
      first.send('reflect'); expect(first.effects.filter(effect => effect.kind === 'panel')).toHaveLength(1);
      const traits = {...first.store.get().traits}; saveReflection(first.store, 'A means of exchange.'); first.send('reflection-done'); expect(first.store.get().traits).toEqual(traits);
      first.send('return', 'market-enter', 'desire');
    } else {
      first.send('market-enter', 'desire');
    }
    expect(first.effects.filter(effect => effect.kind === 'wave')).toHaveLength(1);
    const restored = first.save.load()!; first.save.dispose();
    const second = journey(restored, first.values);
    second.send('market-enter', 'desire', 'waystone'); expect(second.effects.filter(effect => effect.kind === 'wave')).toHaveLength(0);
    second.send('tree-enter', 'look-within', 'inner-active', 'inner-active');
    if (order === 'market-first') { second.send('reflect'); skipReflection(second.store); second.send('reflection-done'); }
    expect(second.store.get().facts).toEqual(expect.arrayContaining(['PACKAGE_RECEIVED', 'CITY_ENTERED', 'TREE_DISCOVERED', 'INNER_WORLD_ENTERED', 'MONEY_REFLECTION_SAVED', 'MARKET_VISITED', 'ATTACHMENT_TRIGGERED', 'ATTACHMENT_SEEN']));
    expect(selectors.beetleState(second.store.get())).toBe('attached'); expect(selectors.sliceComplete(second.store.get())).toBe(true);
    expect(second.store.get().traits.attachment).toBeCloseTo(.45);
    expect(second.effects.filter(effect => effect.kind === 'hint')).toHaveLength(1);
    second.send('inner-active', 'desire'); expect(second.effects.filter(effect => effect.kind === 'hint')).toHaveLength(1);
    second.save.dispose();
  });
  it('keeps answers and the inner world after reload', () => {
    const first = journey(); first.send('waystone', 'city-enter', 'tree-enter', 'look-within', 'inner-active');
    saveReflection(first.store, '<b>Keep me as plain text</b>'); first.send('reflection-done');
    const loaded = first.save.load()!; expect(loaded.world).toBe('inner'); expect(loaded.reflections.money).toBe('<b>Keep me as plain text</b>');
    first.save.dispose();
  });
});
