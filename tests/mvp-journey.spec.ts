import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createHarness, desire, lookWithin, backOut, reflectMoney, releaseBeetle, sitAtWater, startCity, type Harness} from './mvp-harness';
import {selectors} from '../src/state/selectors';
import {nextHint} from '../src/narrative';

beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(10000); });
afterEach(() => { vi.useRealTimers(); });

/** An order is a list of named steps. Each step can run on a reloaded game. */
type Step = [string, (h: Harness) => void];
function run(steps: Step[], reloadEach = false): Harness {
  let h = createHarness();
  for (const [, step] of steps) {
    step(h);
    if (reloadEach) { const before = JSON.stringify(h.state()); h = h.reload(); expect(JSON.stringify(h.state())).toBe(before); }
  }
  return h;
}
const slice = (): Step[] => [
  ['start', startCity], ['look', lookWithin], ['reflect', h => reflectMoney(h, 'A way to exchange.')], ['back', backOut], ['desire', desire], ['look again', h => h.spot('tree')],
];
// Two mirrored stories: the beetle is seen in the inner world, so the player is inside after `slice`.
const toOuter: Step = ['out', backOut];
const merchantAccepted: Step[] = [['crate', h => { h.spot('crate'); h.choose('crate-lift'); }], ['drop', h => h.spot('crate-drop')], ['gift', h => { h.spot('merchant'); h.choose('gift-accept'); }]];
const childGive: Step[] = [['child', h => { h.spot('child'); h.choose('child-search'); }], ['coin', h => h.spot('coin')], ['return', h => { h.spot('child'); h.choose('child-return'); h.choose('child-give'); }]];
const giverAccepted: Step[] = [['giver', h => { h.spot('giver'); h.choose('giver-rest'); h.choose('giver-accept'); }]];
const receiverHelped: Step[] = [['receiver', h => { h.spot('receiver'); h.choose('receiver-respect'); h.spot('receiver'); h.choose('receiver-offer'); }]];
const darkListened: Step[] = [['dark zone', h => h.zone('dark-district')], ['dark', h => { h.spot('dark'); h.choose('dark-listen'); }]];
const guideTea: Step[] = [['door', h => h.spot('exchange-door')], ['guide', h => { h.spot('guide'); if (h.view.story?.step === 'meet') h.choose('guide-tea'); }]];
const beetle: Step[] = [['beetle', releaseBeetle]];
const finale: Step[] = [['water', h => { sitAtWater(h); h.choose('finale-write'); h.reflect('enough', 'Enough is what lets me rest.'); }]];

describe('Finance MVP in different orders', () => {
  it('order 1: slice first, then every story, then the water', () => {
    const h = run([...slice(), ...beetle, toOuter, ...guideTea, ...merchantAccepted, ...childGive, ...darkListened, ...giverAccepted, ...receiverHelped, ...finale]);
    expect(h.has('FINANCE_MVP_COMPLETE', 'FINALE_SEEN', 'ENOUGH_REFLECTION_SAVED', 'EXCHANGE_UNDERSTOOD')).toBe(true);
    expect(h.state().counters).toEqual({serviceActs: 2, giveCount: 2, receiveCount: 3});
    expect(h.state().reflections.enough).toBe('Enough is what lets me rest.'); expect(h.state().reflections.money).toBe('A way to exchange.');
    expect(selectors.chainState(h.state())).toBe('free'); expect(selectors.beetleState(h.state())).toBe('transformed'); expect(selectors.servicePlants(h.state())).toBe(2);
    expect(selectors.basinFlow(h.state())).toBeCloseTo(1); expect(selectors.fearZoneVisible(h.state())).toBe(false);
    expect(nextHint(h.state(), 'outer')).toBe('The water is bright. Stay as long as you like.');
    h.save.dispose();
  });
  it('order 2: stories first, the shortest route, reflection skipped', () => {
    const steps: Step[] = [['start', startCity], ...receiverHelped, ...darkListened, ...guideTea,
      ['tree', lookWithin], ['skip', h => reflectMoney(h, null)], ['back', backOut], ['desire', desire], ['look', h => h.spot('tree')], ...beetle, toOuter, ...finale];
    const h = run(steps);
    expect(h.has('FINANCE_MVP_COMPLETE', 'MONEY_REFLECTION_SAVED')).toBe(true); expect(h.state().reflections.money).toBeUndefined();
    expect(h.state().counters).toEqual({serviceActs: 1, giveCount: 1, receiveCount: 1});
    // Fear was lived outside, so the dark root zone shows once the inner world was visited again.
    expect(h.has('FEAR_TRIGGERED', 'FEAR_SEEN')).toBe(true); expect(selectors.fearZoneVisible(h.state())).toBe(true);
    h.save.dispose();
  });
  it('order 3: the water comes last, optional reflection skipped, merchant first', () => {
    const steps: Step[] = [['start', startCity], ['market', desire], ...merchantAccepted, ...guideTea, ['child', h => { h.spot('child'); h.choose('child-listen'); h.choose('child-give'); }],
      ['tree', lookWithin], ['reflect', h => reflectMoney(h, 'Enough to share.')], ['seen', h => { h.spot('return'); h.spot('tree'); }], ...beetle, toOuter,
      ['water', h => { sitAtWater(h); h.choose('finale-sit'); }]];
    const h = run(steps);
    expect(h.has('FINANCE_MVP_COMPLETE')).toBe(true); expect(h.has('ENOUGH_REFLECTION_SAVED')).toBe(false);
    // The optional reflection stays open to the end.
    expect(h.shown('finale-reflect')).toBe(true); h.spot('finale-reflect'); h.reflect('enough', null); expect(h.has('ENOUGH_REFLECTION_SAVED')).toBe(true); expect(h.shown('finale-reflect')).toBe(false);
    h.save.dispose();
  });
  it('declines every gift and still reaches the end (guide tea is the way to receive)', () => {
    const steps: Step[] = [...slice(), ...beetle, toOuter,
      ['crate', h => { h.spot('crate'); h.choose('crate-lift'); h.spot('crate-drop'); h.spot('merchant'); h.choose('gift-decline'); }],
      ['giver', h => { h.spot('giver'); h.choose('giver-rest'); h.choose('giver-decline'); }],
      ['child', h => { h.spot('child'); h.choose('child-walk'); }],
      ['dark', h => { h.spot('dark'); h.choose('dark-listen'); }],
      ['guide declined once', h => { h.spot('guide'); h.choose('guide-decline'); expect(h.has('RECEIVE_COMPLETED')).toBe(false); expect(h.shown('finale')).toBe(false); }],
      ['guide tea', h => { h.spot('guide'); h.choose('guide-tea'); }],
      ['water', h => sitAtWater(h)]];
    const h = run(steps);
    expect(h.has('FINANCE_MVP_COMPLETE', 'GIFT_DECLINED')).toBe(true); expect(h.has('GIFT_ACCEPTED', 'GIVER_GIFT_ACCEPTED')).toBe(false);
    expect(h.state().counters).toEqual({serviceActs: 1, giveCount: 1, receiveCount: 1});
    h.save.dispose();
  });
  it('walks away from the child and still reaches the end', () => {
    const steps: Step[] = [...slice(), ...beetle, toOuter, ...receiverHelped, ['child', h => { h.spot('child'); h.choose('child-walk'); }], ...darkListened, ...guideTea, ['water', h => sitAtWater(h)]];
    const h = run(steps);
    expect(h.has('FINANCE_MVP_COMPLETE')).toBe(true); expect(h.has('CHILD_GIVEN', 'CHILD_LISTENED')).toBe(false);
    h.save.dispose();
  });
  it('lives give through the child only (no dark district) and service through the crate', () => {
    const steps: Step[] = [...slice(), ...beetle, toOuter, ...merchantAccepted, ...childGive, ...guideTea, ['water', h => sitAtWater(h)]];
    const h = run(steps);
    expect(h.has('FINANCE_MVP_COMPLETE')).toBe(true); expect(h.has('DARK_MET')).toBe(false);
    h.save.dispose();
  });
  it('keeps the exact state through a reload after every step and does not repeat once-rules', () => {
    const steps: Step[] = [...slice(), ...beetle, toOuter, ...guideTea, ...merchantAccepted, ...childGive, ...darkListened, ...giverAccepted, ...receiverHelped, ...finale];
    const h = run(steps, true);
    expect(h.state().counters).toEqual({serviceActs: 2, giveCount: 2, receiveCount: 3});
    // Repeat everything on the finished game. No fact, counter or trait changes.
    const before = JSON.stringify(h.state());
    for (const id of ['crate', 'merchant', 'child', 'dark', 'giver', 'receiver', 'guide', 'exchange-door', 'finale', 'finale-reflect']) if (h.shown(id)) h.spot(id);
    expect(JSON.stringify(h.state())).toBe(before);
    h.save.dispose();
  });
  it('does not repeat a wave after reload', () => {
    const h = run([['start', startCity], ['child', h2 => h2.spot('child')]]);
    expect(h.effects.filter(effect => effect.kind === 'wave')).toHaveLength(1);
    const again = h.reload(); again.spot('child'); expect(again.effects.filter(effect => effect.kind === 'wave')).toHaveLength(0);
    again.save.dispose();
  });
  it('does not open the water before everything is lived, whatever the order', () => {
    const h = run([...slice(), ...beetle, toOuter, ...guideTea, ...darkListened]);
    expect(h.shown('finale')).toBe(false); expect(selectors.finaleReady(h.state())).toBe(false);
    h.save.dispose();
  });
});

describe('soft hints', () => {
  it('points to unseen stories after the beetle and never to the end text of the old slice', () => {
    const h = run([...slice(), ['inner', () => undefined]]);
    expect(nextHint(h.state(), 'inner')).toBe('Stand by the beetle and hold to observe.');
    expect(nextHint(h.state(), 'outer')).toMatch(/merchant/);
    h.save.dispose();
  });
});
