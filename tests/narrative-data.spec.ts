import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {places} from '../src/content/places';
import {allRules, nextHint, spots, speakerNames, stories, zones} from '../src/narrative';
import {matchesCondition} from '../src/rules/ruleEngine';
import {createInitialState} from '../src/state/worldStore';
import {strings} from '../src/content/strings.en';
import {FACTS} from '../src/state/worldStore';
import type {Effect, Fact, SignalType, WorldState} from '../src/contracts/state';
import {createHarness} from './mvp-harness';

describe('narrative data', () => {
  it('has unique rule ids and spot ids', () => {
    expect(new Set(allRules.map(rule => rule.id)).size).toBe(allRules.length);
    expect(new Set(spots.map(spot => spot.id)).size).toBe(spots.length);
    expect(new Set(zones.map(zone => zone.id)).size).toBe(zones.length);
  });
  it('lists the slice spots and the two new zones (slice zones stay in the app) and texts', () => {
    const slice = spots.filter(spot => ['waystone', 'tree', 'desire', 'reflection', 'return'].includes(spot.id));
    expect(slice.map(spot => [spot.id, spot.text, spot.signal, spot.hold ?? false])).toEqual([
      ['waystone', strings.receive, 'waystone', false], ['tree', strings.look, 'look-within', true], ['desire', strings.desire, 'desire', false],
      ['reflection', strings.reflect, 'reflect', false], ['return', strings.return, 'return', true],
    ]);
    expect(zones.map(zone => zone.id).sort()).toEqual(['dark-district', 'exchange-street']);
  });
  it('places every spot at a real place in the right world', () => {
    for (const spot of spots) { const place = places[spot.place as keyof typeof places]; expect(place, spot.id).toBeDefined(); expect(place.world, spot.id).toBe(spot.world); expect(spot.radius).toBeGreaterThan(0); }
  });
  it('gives every data spot a rule, every zone a rule or a slice mirror, and uses known facts only', () => {
    for (const spot of spots) {
      const hit = allRules.filter(rule => rule.signal === spot.signal && (rule.signalId === undefined || rule.signalId === (spot.signalId ?? spot.id)));
      expect(hit.length, spot.id).toBeGreaterThan(0);
    }
    for (const id of ['dark-district', 'exchange-street']) expect(allRules.some(rule => rule.signal === 'zone-enter' && rule.signalId === id), id).toBe(true);
    const names = new Set<string>(FACTS);
    const walk = (condition: (typeof allRules)[number]['condition']): void => { if (condition.kind === 'fact') expect(names.has(condition.fact)).toBe(true); if (condition.kind === 'all' || condition.kind === 'any') condition.conditions.forEach(walk); };
    for (const rule of allRules) { walk(rule.condition); for (const effect of rule.effects) if (effect.kind === 'fact') expect(names.has(effect.fact)).toBe(true); }
    for (const spot of spots) walk(spot.when);
  });
  it('keeps story data consistent with the rules', () => {
    const effects = allRules.flatMap(rule => rule.effects);
    for (const effect of effects) if (effect.kind === 'story') expect(stories[effect.story]?.steps[effect.step], `${effect.story}/${effect.step}`).toBeDefined();
    const choiceIds = new Set(allRules.filter(rule => rule.signal === 'choice' && rule.signalId).map(rule => rule.signalId));
    const choices = Object.values(stories).flatMap(story => Object.values(story.steps).flatMap(step => step.choices.map(choice => choice.id)));
    for (const id of choices) expect(choiceIds.has(id), id).toBe(true);
    for (const id of choiceIds) expect(choices.includes(id!), String(id)).toBe(true);
    for (const story of Object.values(stories)) { expect(speakerNames[story.actor]).toBeTruthy(); for (const step of Object.values(story.steps)) expect(speakerNames[step.speaker]).toBeTruthy(); }
    // Every step is reachable by an effect.
    const opened = new Set(effects.filter(effect => effect.kind === 'story').map(effect => effect.kind === 'story' ? `${effect.story}/${effect.step}` : ''));
    for (const story of Object.values(stories)) for (const step of Object.keys(story.steps)) expect(opened.has(`${story.id}/${step}`), `${story.id}/${step}`).toBe(true);
  });
  it('has six micro stories plus beetle and finale, and every spec fact is set by a rule', () => {
    expect(Object.keys(stories).sort()).toEqual(['beetle', 'child', 'dark', 'finale', 'giver', 'guide', 'merchant', 'receiver']);
    const set = new Set(allRules.flatMap(rule => rule.effects).filter(effect => effect.kind === 'fact').map(effect => effect.kind === 'fact' ? effect.fact : ''));
    for (const fact of FACTS) expect(set.has(fact), fact).toBe(true);
  });
  it('sends counters and story effects as plain data, with short thought waves', () => {
    for (const effect of allRules.flatMap(rule => rule.effects)) {
      if (effect.kind === 'counter') expect(effect.delta).toBe(1);
      if (effect.kind === 'wave') { expect(effect.text.length).toBeLessThanOrEqual(64); if (effect.id !== 'attachment-desire') { expect(effect.actor).toBeDefined(); expect(effect.tone).toBeDefined(); } }
    }
  });
  it('ends the slice softly: R12 no longer says this is the end', () => {
    const r12 = allRules.find(rule => rule.id === 'R12-stop')!;
    expect(r12.effects).toContainEqual({kind: 'hint', text: strings.end}); expect(strings.end).not.toMatch(/this is the end/i); expect(strings.end).toMatch(/city/i);
  });
});

describe('nextHint', () => {
  const stateWith = (facts: Fact[], world: 'outer' | 'inner' = 'outer'): WorldState => ({...createInitialState(), facts, world});
  const base: Fact[] = ['PACKAGE_RECEIVED', 'CITY_ENTERED', 'TREE_DISCOVERED', 'INNER_WORLD_ENTERED', 'MARKET_VISITED', 'ATTACHMENT_TRIGGERED', 'ATTACHMENT_SEEN'];
  it('keeps the slice hints before the beetle', () => {
    expect(nextHint(stateWith([]), 'outer')).toBe(strings.welcome);
    expect(nextHint(stateWith(['PACKAGE_RECEIVED']), 'outer')).toBe(strings.carrying);
    expect(nextHint(stateWith(['PACKAGE_RECEIVED', 'INNER_WORLD_ENTERED']), 'outer')).toBe(strings.nextMarket);
    expect(nextHint(stateWith(['PACKAGE_RECEIVED', 'INNER_WORLD_ENTERED', 'ATTACHMENT_TRIGGERED']), 'outer')).toBe(strings.nextInner);
    expect(nextHint(stateWith(['PACKAGE_RECEIVED'], 'inner'), 'inner')).toBe(strings.innerHelp);
  });
  it('guides softly after the beetle, in both worlds, with a text for any state', () => {
    expect(nextHint(stateWith(base), 'outer')).toBe(strings.hintService);
    expect(nextHint(stateWith([...base, 'SERVICE_OFFERED']), 'outer')).toBe(strings.hintGive);
    expect(nextHint(stateWith([...base, 'SERVICE_OFFERED', 'GIVE_COMPLETED']), 'outer')).toBe(strings.hintReceive);
    expect(nextHint(stateWith([...base, 'SERVICE_OFFERED', 'GIVE_COMPLETED', 'RECEIVE_COMPLETED']), 'outer')).toBe(strings.hintWithin);
    expect(nextHint(stateWith(base, 'inner'), 'inner')).toBe(strings.hintBeetle);
    const ready: Fact[] = [...base, 'SERVICE_OFFERED', 'GIVE_COMPLETED', 'RECEIVE_COMPLETED', 'ATTACHMENT_TRANSFORMED', 'MONEY_REFLECTION_SAVED'];
    expect(nextHint(stateWith(ready), 'outer')).toBe(strings.hintFinale); expect(nextHint(stateWith(ready, 'inner'), 'inner')).toBe(strings.hintFinaleInner);
    expect(nextHint(stateWith([...ready, 'FINALE_SEEN', 'FINANCE_MVP_COMPLETE']), 'outer')).toBe(strings.hintEnough);
    expect(nextHint(stateWith([...ready, 'FINALE_SEEN', 'FINANCE_MVP_COMPLETE', 'ENOUGH_REFLECTION_SAVED']), 'outer')).toBe(strings.hintDone);
    for (const facts of [[], base, ready, FACTS as Fact[]]) for (const world of ['outer', 'inner'] as const) expect(nextHint(stateWith(facts, world), world).length).toBeGreaterThan(5);
  });
});

describe('slice behaviour through all rules', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(10000); });
  afterEach(() => { vi.useRealTimers(); });
  it('keeps the slice prompts, one wave, the slice facts and the legacy signals', () => {
    const h = createHarness();
    const send = (...types: SignalType[]) => { for (const type of types) { h.tick(); h.engine.dispatch({type}); } };
    send('waystone', 'city-enter', 'tree-enter', 'market-enter'); send('look-within');
    expect(h.state().world).toBe('inner'); send('reflect'); expect(h.view.panel).toBe('money');
    h.reflect('money', 'x'); send('return', 'desire', 'look-within');
    expect(h.effects.filter((effect: Effect) => effect.kind === 'wave')).toHaveLength(1);
    expect([...h.state().facts].sort()).toEqual(['ATTACHMENT_SEEN', 'ATTACHMENT_TRIGGERED', 'CITY_ENTERED', 'INNER_WORLD_ENTERED', 'MARKET_VISITED', 'MONEY_REFLECTION_SAVED', 'PACKAGE_RECEIVED', 'TREE_DISCOVERED']);
    expect(h.effects.filter((effect: Effect) => effect.kind === 'hint').map(effect => effect.kind === 'hint' ? effect.text : '')).toEqual([strings.carrying, strings.end]);
    expect(h.state().traits.attachment).toBeCloseTo(.45);
    h.save.dispose();
  });
  it('answers the data-driven zone signal exactly like the legacy one', () => {
    const h = createHarness(); h.spot('waystone');
    h.tick(); h.engine.dispatch({type: 'zone-enter', id: 'city'}); h.engine.dispatch({type: 'zone-enter', id: 'tree'}); h.engine.dispatch({type: 'zone-enter', id: 'market'});
    expect(h.has('CITY_ENTERED', 'TREE_DISCOVERED', 'MARKET_VISITED')).toBe(true);
    h.tick(); h.engine.dispatch({type: 'city-enter'}); expect(h.state().facts.filter(fact => fact === 'CITY_ENTERED')).toHaveLength(1);
    h.save.dispose();
  });
  it('shows no story prompt before the city is entered', () => {
    const state = createInitialState();
    for (const spot of spots.filter(candidate => candidate.signal === 'spot')) expect(matchesCondition(state, spot.when), spot.id).toBe(false);
  });
});
