import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createInitialState, createWorldStore, validateWorldState, MAX_REFLECTION_LENGTH} from '../src/state/worldStore';
import {selectors} from '../src/state/selectors';
import {createRuleEngine} from '../src/rules/ruleEngine';
import {createSaveService, migrateSave, SAVE_KEY} from '../src/save/saveService';
import {deleteReflections, saveReflection, skipReflection} from '../src/reflection/reflectionStore';
import type {Effect, Fact, Rule, WorldState} from '../src/contracts/state';

const withFacts = (facts: Fact[], counters: Record<string, number> = {}): WorldState => ({...createInitialState(), facts, counters: {...createInitialState().counters, ...counters}});

describe('selectors for the Finance MVP', () => {
  it('reads the beetle states in order', () => {
    const ladder: [Fact[], string][] = [[[], 'hidden'], [['ATTACHMENT_TRIGGERED'], 'dormant'], [['ATTACHMENT_SEEN'], 'attached'], [['ATTACHMENT_SEEN', 'BEETLE_OBSERVED'], 'observed'],
      [['ATTACHMENT_SEEN', 'BEETLE_OBSERVED', 'BEETLE_RELEASED'], 'released'], [['ATTACHMENT_SEEN', 'BEETLE_OBSERVED', 'BEETLE_RELEASED', 'ATTACHMENT_TRANSFORMED'], 'transformed']];
    for (const [facts, expected] of ladder) expect(selectors.beetleState(withFacts(facts))).toBe(expected);
  });
  it('frees the chain after the transformation', () => {
    expect(selectors.chainState(withFacts(['PACKAGE_RECEIVED', 'ATTACHMENT_SEEN']))).toBe('attached');
    expect(selectors.chainState(withFacts(['PACKAGE_RECEIVED', 'ATTACHMENT_SEEN', 'ATTACHMENT_TRANSFORMED']))).toBe('free');
    expect(selectors.chainState(withFacts([]))).toBe('hidden');
  });
  it('shows the fear zone only after fear was seen', () => {
    expect(selectors.fearZoneVisible(withFacts(['FEAR_TRIGGERED']))).toBe(false); expect(selectors.fearZoneVisible(withFacts(['FEAR_TRIGGERED', 'FEAR_SEEN']))).toBe(true);
  });
  it('maps counters to basin flow and plants, within range', () => {
    const flow = (give: number, receive: number) => selectors.basinFlow(withFacts([], {giveCount: give, receiveCount: receive}));
    expect(flow(0, 0)).toBe(0); expect(flow(1, 0)).toBeGreaterThan(0); expect(flow(0, 1)).toBeGreaterThan(0);
    expect(flow(1, 1)).toBeGreaterThan(flow(2, 0)); expect(flow(2, 2)).toBeCloseTo(1); expect(flow(99, 99)).toBeLessThanOrEqual(1);
    const plants = (n: number) => selectors.servicePlants(withFacts([], {serviceActs: n}));
    expect([0, 1, 2, 3, 9].map(plants)).toEqual([0, 1, 2, 3, 3]);
  });
  it('knows when the finale is ready, seen and which stories are done', () => {
    const ready: Fact[] = ['TREE_DISCOVERED', 'MONEY_REFLECTION_SAVED', 'SERVICE_OFFERED', 'GIVE_COMPLETED', 'RECEIVE_COMPLETED', 'ATTACHMENT_TRANSFORMED'];
    expect(selectors.finaleReady(withFacts(ready))).toBe(true);
    for (const missing of ready) expect(selectors.finaleReady(withFacts(ready.filter(fact => fact !== missing))), missing).toBe(false);
    expect(selectors.finaleSeen(withFacts([]))).toBe(false); expect(selectors.finaleSeen(withFacts(['FINALE_SEEN']))).toBe(true);
    expect(selectors.storyDone(withFacts([]), 'merchant')).toBe(false); expect(selectors.storyDone(withFacts(['GIFT_DECLINED']), 'merchant')).toBe(true);
    expect(selectors.storyDone(withFacts(['CHILD_LISTENED']), 'child')).toBe(true); expect(selectors.storyDone(withFacts(['CHILD_MET']), 'child')).toBe(false);
    expect(selectors.storyDone(withFacts(['ATTACHMENT_TRANSFORMED']), 'beetle')).toBe(true); expect(selectors.storyDone(withFacts([]), 'unknown')).toBe(false);
  });
});

describe('rule engine counters and traits', () => {
  const rules: Rule[] = [{id: 'c', signal: 'spot', signalId: 'x', condition: {kind: 'always'}, once: false, effects: [{kind: 'counter', counter: 'serviceActs', delta: 1}, {kind: 'trait', trait: 'fear', delta: 2}, {kind: 'fact', fact: 'SERVICE_OFFERED'}, {kind: 'hint', text: 'h'}]}];
  it('changes counters, facts and traits in one store update and does not pass counters on', () => {
    const store = createWorldStore(); const seen: Effect[] = []; let updates = 0; store.subscribe(() => { updates++; });
    const engine = createRuleEngine(store, rules, effect => seen.push(effect));
    engine.dispatch({type: 'spot', id: 'x'}); engine.dispatch({type: 'spot', id: 'other'});
    expect(updates).toBe(1); expect(store.get().counters.serviceActs).toBe(1); expect(store.get().facts).toEqual(['SERVICE_OFFERED']); expect(store.get().traits.fear).toBe(1);
    expect(seen).toEqual([{kind: 'hint', text: 'h'}]);
    engine.dispatch({type: 'spot', id: 'x'}); expect(store.get().counters.serviceActs).toBe(2);
  });
  it('clamps traits to 0..1 on both sides', () => {
    const store = createWorldStore(); const down: Rule = {...rules[0], id: 'd', effects: [{kind: 'trait', trait: 'attachment', delta: -.3}]};
    createRuleEngine(store, [down], () => undefined).dispatch({type: 'spot', id: 'x'}); expect(store.get().traits.attachment).toBe(0);
  });
});

describe('old saves', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(10000); });
  afterEach(() => { vi.useRealTimers(); });
  it('loads a schemaVersion 1 slice save without the new counters', () => {
    const old = {...createInitialState(), facts: ['PACKAGE_RECEIVED', 'CITY_ENTERED', 'ATTACHMENT_SEEN'], counters: {}};
    const state = migrateSave(JSON.parse(JSON.stringify(old)));
    expect(state.counters).toEqual({serviceActs: 0, giveCount: 0, receiveCount: 0}); expect(selectors.basinFlow(state)).toBe(0); expect(selectors.servicePlants(state)).toBe(0);
    expect(selectors.beetleState(state)).toBe('attached');
  });
  it('loads the new facts from the save and rejects an unknown fact', () => {
    const state = validateWorldState({...createInitialState(), facts: ['GIFT_DECLINED', 'FINALE_SEEN', 'ENOUGH_REFLECTION_SAVED']});
    expect(state.facts).toEqual(['GIFT_DECLINED', 'FINALE_SEEN', 'ENOUGH_REFLECTION_SAVED']);
    expect(() => validateWorldState({...createInitialState(), facts: ['NOT_A_FACT']})).toThrow();
  });
  it('writes and loads counters, facts and both reflections', () => {
    const values = new Map<string, string>(); const store = createWorldStore();
    const save = createSaveService(store, {getItem: key => values.get(key) ?? null, setItem: (key, text) => { values.set(key, text); }, removeItem: key => { values.delete(key); }});
    store.update(s => { s.facts.push('FINALE_SEEN'); s.counters.giveCount = 2; });
    saveReflection(store, 'one'); saveReflection(store, 'two', 'enough');
    expect(save.flush()).toBe(true); expect(values.has(SAVE_KEY)).toBe(true);
    const loaded = save.load()!; expect(loaded).toEqual(store.get()); expect(loaded.reflections).toEqual({money: 'one', enough: 'two'}); expect(loaded.counters.giveCount).toBe(2);
    save.dispose();
  });
});

describe('reflection prompts', () => {
  it('keeps the money behaviour and adds enough, both plain text with the same limit', () => {
    const store = createWorldStore();
    saveReflection(store, '<b>x</b>'); expect(store.get().reflections).toEqual({money: '<b>x</b>'});
    saveReflection(store, 'Enough is "a lot" & <i>quiet</i>', 'enough'); expect(store.get().reflections.enough).toBe('Enough is "a lot" & <i>quiet</i>');
    saveReflection(store, 'A'.repeat(MAX_REFLECTION_LENGTH), 'enough'); expect(store.get().reflections.enough).toHaveLength(MAX_REFLECTION_LENGTH);
    expect(() => saveReflection(store, 'A'.repeat(MAX_REFLECTION_LENGTH + 1), 'enough')).toThrow(); expect(() => saveReflection(store, 'A'.repeat(MAX_REFLECTION_LENGTH + 1))).toThrow();
    skipReflection(store, 'enough'); expect(store.get().reflections).toEqual({money: '<b>x</b>'});
    skipReflection(store); expect(store.get().reflections).toEqual({});
    saveReflection(store, 'a'); saveReflection(store, 'b', 'enough'); deleteReflections(store); expect(store.get().reflections).toEqual({});
  });
  it('never changes traits or facts', () => {
    const store = createWorldStore(); const before = JSON.stringify({f: store.get().facts, t: store.get().traits});
    saveReflection(store, 'text', 'enough'); skipReflection(store); expect(JSON.stringify({f: store.get().facts, t: store.get().traits})).toBe(before);
  });
});
