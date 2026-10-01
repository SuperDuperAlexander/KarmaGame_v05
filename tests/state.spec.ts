import {describe, expect, it} from 'vitest';
import {createInitialState, createWorldStore, validateWorldState} from '../src/state/worldStore';
import {selectors} from '../src/state/selectors';
import {createRuleEngine, matchesCondition} from '../src/rules/ruleEngine';
import type {Condition, Effect, Rule} from '../src/contracts/state';

describe('world state', () => {
  it('keeps lasting facts, IDs and immutable snapshots', () => {
    const store = createWorldStore();
    const initial = store.get();
    store.update(state => { state.facts.push('PACKAGE_RECEIVED', 'PACKAGE_RECEIVED'); state.firedRules.push('once'); state.waveIds.push('wave'); });
    store.update(state => { state.facts = []; state.firedRules = []; state.waveIds = []; });
    expect(store.get().facts).toEqual(['PACKAGE_RECEIVED']);
    expect(store.get().firedRules).toEqual(['once']);
    expect(store.get().waveIds).toEqual(['wave']);
    expect(initial.facts).toEqual([]);
    expect(Object.isFrozen(store.get().positions.inner)).toBe(true);
    store.reset(); expect(store.get()).toEqual(createInitialState());
  });
  it('clamps image traits and notifies only live listeners', () => {
    const store = createWorldStore(); let calls = 0;
    const off = store.subscribe(() => calls++);
    store.update(state => { state.traits.attachment = 3; state.traits.fear = -1; });
    expect(store.get().traits.attachment).toBe(1); expect(store.get().traits.fear).toBe(0);
    off(); store.reset(); expect(calls).toBe(1);
  });
  it('rejects invalid position and does not partially commit', () => {
    const store = createWorldStore();
    expect(() => store.update(state => { state.positions.inner.x = NaN; })).toThrow();
    expect(store.get().positions.inner.x).toBe(0);
  });
  it('reads lasting visual states from facts', () => {
    const store = createWorldStore(); expect(selectors.chainState(store.get())).toBe('hidden');
    store.update(s => { s.facts.push('PACKAGE_RECEIVED'); }); expect(selectors.chainState(store.get())).toBe('loose');
    store.update(s => { s.facts.push('ATTACHMENT_TRIGGERED'); }); expect(selectors.chainState(store.get())).toBe('tense'); expect(selectors.beetleState(store.get())).toBe('dormant');
    store.update(s => { s.facts.push('ATTACHMENT_SEEN'); }); expect(selectors.chainState(store.get())).toBe('attached'); expect(selectors.beetleState(store.get())).toBe('attached'); expect(selectors.sliceComplete(store.get())).toBe(true);
  });
  it.each([
    (s: ReturnType<typeof createInitialState>) => { s.schemaVersion = 2 as 1; },
    (s: ReturnType<typeof createInitialState>) => { s.traits.trust = Infinity; },
    (s: ReturnType<typeof createInitialState>) => { s.traits.fear = 1.1; },
    (s: ReturnType<typeof createInitialState>) => { s.positions.outer.z = 1001; },
    (s: ReturnType<typeof createInitialState>) => { s.counters.test = 0.5; },
    (s: ReturnType<typeof createInitialState>) => { s.counters.test = 1_000_001; },
    (s: ReturnType<typeof createInitialState>) => { s.reflections.money = 'x'.repeat(2001); },
    (s: ReturnType<typeof createInitialState>) => { s.firedRules = ['x'.repeat(81)]; },
    (s: ReturnType<typeof createInitialState>) => { s.waveIds = ['constructor']; },
    (s: ReturnType<typeof createInitialState>) => { s.reflections = JSON.parse('{"__proto__":"unsafe"}'); },
  ])('rejects unsafe saved data', change => {
    const state = createInitialState(); change(state); expect(() => validateWorldState(state)).toThrow();
  });
});

describe('conditions and rules', () => {
  const state = createInitialState(); state.facts.push('CITY_ENTERED'); state.traits.trust = .4; state.counters.visits = 2;
  const cases: [Condition, boolean][] = [
    [{kind: 'always'}, true], [{kind: 'fact', fact: 'CITY_ENTERED'}, true],
    [{kind: 'fact', fact: 'CITY_ENTERED', value: false}, false], [{kind: 'fact', fact: 'TREE_DISCOVERED', value: false}, true],
    [{kind: 'all', conditions: []}, true], [{kind: 'any', conditions: []}, false],
    [{kind: 'all', conditions: [{kind: 'always'}, {kind: 'fact', fact: 'TREE_DISCOVERED'}]}, false],
    [{kind: 'any', conditions: [{kind: 'fact', fact: 'TREE_DISCOVERED'}, {kind: 'fact', fact: 'CITY_ENTERED'}]}, true],
    [{kind: 'trait', trait: 'trust', min: .4, max: .4}, true], [{kind: 'trait', trait: 'trust', min: .5}, false],
    [{kind: 'trait', trait: 'trust', max: .3}, false], [{kind: 'counter', counter: 'visits', min: 2}, true],
    [{kind: 'counter', counter: 'missing', min: 1}, false], [{kind: 'counter', counter: 'missing', min: 0}, true],
  ];
  it.each(cases)('checks %j', (condition, expected) => { expect(matchesCondition(state, condition)).toBe(expected); });
  it('reserves once IDs and waves before save, with repeat-safe callbacks', () => {
    const store = createWorldStore(); const effects: Effect[] = [];
    const rule: Rule = {id: 'test', signal: 'desire', condition: {kind: 'always'}, once: true, effects: [{kind: 'fact', fact: 'ATTACHMENT_TRIGGERED'}, {kind: 'save'}, {kind: 'wave', id: 'want', text: 'test'}, {kind: 'wave', id: 'want', text: 'test'}]};
    const engine = createRuleEngine(store, [rule], effect => {
      expect(store.get().firedRules).toContain('test'); expect(store.get().waveIds).toContain('want');
      effects.push(effect); engine.dispatch({type: 'desire'});
    });
    engine.dispatch({type: 'desire'}); expect(effects.map(e => e.kind)).toEqual(['save', 'wave']);
    const loaded = createWorldStore(JSON.parse(JSON.stringify(store.get())));
    createRuleEngine(loaded, [rule], effect => effects.push(effect)).dispatch({type: 'desire'});
    expect(effects).toHaveLength(2);
  });
  it('deduplicates a wave even when its rule is not once-only', () => {
    const store = createWorldStore(); let count = 0;
    const rule: Rule = {id: 'repeat', signal: 'desire', condition: {kind: 'always'}, once: false, effects: [{kind: 'wave', id: 'wave', text: 'test'}]};
    const engine = createRuleEngine(store, [rule], () => count++);
    engine.dispatch({type: 'desire'}); engine.dispatch({type: 'desire'}); expect(count).toBe(1);
  });
});
