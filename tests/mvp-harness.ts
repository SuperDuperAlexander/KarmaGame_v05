import {expect, vi} from 'vitest';
import type {Effect, ReflectionPrompt, WorldState} from '../src/contracts/state';
import {createWorldStore} from '../src/state/worldStore';
import {createRuleEngine, matchesCondition} from '../src/rules/ruleEngine';
import {createSaveService, SAVE_KEY} from '../src/save/saveService';
import {saveReflection, skipReflection} from '../src/reflection/reflectionStore';
import {allRules, spots, stories, zones} from '../src/narrative';

/** Headless game: the real store, rules, save and narrative data. It acts like the app wiring does. No browser. */
export function createHarness(initial?: WorldState, values = new Map<string, string>()) {
  const store = createWorldStore(initial);
  const save = createSaveService(store, {getItem: key => values.get(key) ?? null, setItem: (key, text) => { values.set(key, text); }, removeItem: key => { values.delete(key); }});
  const effects: Effect[] = [];
  const view = {story: null as null | {story: string; step: string}, panel: null as null | ReflectionPrompt, hint: ''};
  const engine = createRuleEngine(store, allRules, effect => {
    if (effect.kind === 'save') { vi.advanceTimersByTime(1000); expect(save.flush()).toBe(true); }
    if (effect.kind === 'transition') { store.update(s => { s.world = effect.world; }); engine.dispatch({type: 'inner-active'}); }
    if (effect.kind === 'story') view.story = {story: effect.story, step: effect.step};
    if (effect.kind === 'story-end') view.story = null;
    if (effect.kind === 'panel') view.panel = effect.prompt ?? 'money';
    if (effect.kind === 'hint') view.hint = effect.text;
    effects.push(effect);
  });
  // The first load of a saved inner world sends inner-active, like the app does.
  if (store.get().world === 'inner') engine.dispatch({type: 'inner-active'});
  const api = {
    store, save, effects, view, values, engine,
    state: () => store.get(),
    has: (...facts: WorldState['facts']) => facts.every(fact => store.get().facts.includes(fact)),
    tick: () => { vi.advanceTimersByTime(1000); },
    /** Press or hold a spot. Fails when the prompt would not show (wrong world or condition). */
    spot(id: string) {
      const data = spots.find(candidate => candidate.id === id);
      if (!data) throw new Error(`No spot ${id}`);
      if (data.world !== store.get().world) throw new Error(`Spot ${id} is in the other world`);
      if (!matchesCondition(store.get(), data.when)) throw new Error(`Spot ${id} is not shown`);
      api.tick(); engine.dispatch({type: data.signal, ...(data.signalId === undefined ? {} : {id: data.signalId})});
    },
    shown: (id: string) => { const data = spots.find(candidate => candidate.id === id); return !!data && data.world === store.get().world && matchesCondition(store.get(), data.when); },
    zone(id: string) {
      // The app keeps the slice zones and sends the legacy signals for them.
      if (id === 'city' || id === 'tree' || id === 'market') { api.tick(); engine.dispatch({type: `${id}-enter` as const}); return; }
      const data = zones.find(candidate => candidate.id === id);
      if (!data) throw new Error(`No zone ${id}`);
      if (!matchesCondition(store.get(), data.when)) throw new Error(`Zone ${id} is not active`);
      api.tick(); engine.dispatch({type: 'zone-enter', id});
    },
    /** Press a choice button of the open step. */
    choose(id: string) {
      if (!view.story) throw new Error(`No open story for choice ${id}`);
      const step = stories[view.story.story].steps[view.story.step];
      if (!step.choices.some(choice => choice.id === id)) throw new Error(`Step ${view.story.story}/${view.story.step} has no choice ${id}`);
      api.tick(); engine.dispatch({type: 'choice', id});
    },
    /** The leave button. Always allowed. */
    leave() {
      if (!view.story) throw new Error('No open story');
      const {story} = view.story; view.story = null; api.tick(); engine.dispatch({type: 'story-closed', id: story});
    },
    reflect(prompt: ReflectionPrompt, text: string | null) {
      expect(view.panel).toBe(prompt); view.panel = null;
      if (text === null) skipReflection(store, prompt); else saveReflection(store, text, prompt);
      api.tick(); engine.dispatch({type: 'reflection-done', id: prompt});
    },
    /** Save, restart from the saved data and keep the same storage. Open panels are lost, like a real reload. */
    reload() {
      expect(save.flush()).toBe(true); const loaded = save.load()!; save.dispose();
      return createHarness(loaded, values);
    },
    savedState: () => JSON.parse(values.get(SAVE_KEY)!) as WorldState,
    /** Open the step, leave it, open it again: the same step must come back and no new fact may appear. */
    leaveAndReopen(id: string) {
      const before = view.story; const facts = [...store.get().facts];
      api.leave(); api.spot(id);
      expect(view.story).toEqual(before); expect([...store.get().facts]).toEqual(facts);
    },
  };
  return api;
}
export type Harness = ReturnType<typeof createHarness>;

// Route pieces.
export function startCity(h: Harness) { h.spot('waystone'); h.zone('city'); }
export function lookWithin(h: Harness) { h.zone('tree'); h.spot('tree'); expect(h.state().world).toBe('inner'); }
export function backOut(h: Harness) { h.spot('return'); expect(h.state().world).toBe('outer'); }
export function reflectMoney(h: Harness, text: string | null) { h.spot('reflection'); h.reflect('money', text); }
export function desire(h: Harness) { h.zone('market'); h.spot('desire'); }
/** Inner world: observe the beetle and let it go. Needs the beetle seen. */
export function releaseBeetle(h: Harness) { h.spot('beetle-observe'); h.choose('beetle-letgo'); }
export function sitAtWater(h: Harness) { h.spot('finale'); }
