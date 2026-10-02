import {afterEach, beforeEach, describe, expect, it, vi} from 'vitest';
import {createHarness, desire, lookWithin, backOut, reflectMoney, startCity, type Harness} from './mvp-harness';

let h: Harness;
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(10000); h = createHarness(); startCity(h); });
afterEach(() => { h.save.dispose(); vi.useRealTimers(); });
const count = (name: string) => h.state().counters[name];

describe('merchant and the heavy crate', () => {
  it('opens the crate step and can be left at any time', () => {
    h.spot('crate'); expect(h.view.story).toEqual({story: 'merchant', step: 'crate'}); expect(h.has('MERCHANT_MET')).toBe(true);
    h.leaveAndReopen('crate'); h.choose('crate-no'); expect(h.view.story).toBeNull();
    expect(h.has('CRATE_CARRIED', 'SERVICE_OFFERED')).toBe(false); expect(count('serviceActs')).toBe(0);
  });
  it('help = carry together, then the merchant offers a gift to accept', () => {
    h.spot('crate'); h.choose('crate-lift');
    expect(h.has('SERVICE_OFFERED', 'CRATE_CARRIED')).toBe(true); expect(count('serviceActs')).toBe(1);
    expect(h.effects).toContainEqual({kind: 'act', actor: 'player', action: 'carry'});
    expect(h.effects.some(effect => effect.kind === 'act' && effect.action === 'help' && effect.actor === 'player')).toBe(false);
    expect(h.shown('crate')).toBe(false); expect(h.shown('merchant')).toBe(false);
    h.spot('crate-drop'); expect(h.has('GIFT_OFFERED')).toBe(true);
    h.spot('merchant'); expect(h.view.story).toEqual({story: 'merchant', step: 'gift'}); h.leaveAndReopen('merchant');
    h.choose('gift-accept'); expect(h.has('GIFT_ACCEPTED', 'RECEIVE_COMPLETED')).toBe(true); expect(count('receiveCount')).toBe(1);
    expect(h.shown('merchant')).toBe(false);
  });
  it('lets the gift be declined without penalty', () => {
    h.spot('crate'); h.choose('crate-lift'); h.spot('crate-drop'); h.spot('merchant'); h.choose('gift-decline');
    expect(h.has('GIFT_DECLINED')).toBe(true); expect(h.has('GIFT_ACCEPTED', 'RECEIVE_COMPLETED')).toBe(false); expect(count('receiveCount')).toBe(0);
    expect(h.state().traits).toEqual({attachment: .1, fear: 0, trust: 0, contentment: 0});
  });
});

describe('fear child and the missing coin', () => {
  it('walks on without any effect besides the first fear wave', () => {
    h.spot('child'); expect(h.view.story).toEqual({story: 'child', step: 'meet'}); expect(h.has('CHILD_MET', 'FEAR_TRIGGERED')).toBe(true); expect(h.state().traits.fear).toBeCloseTo(.2);
    h.leaveAndReopen('child'); h.choose('child-walk'); expect(h.view.story).toBeNull();
    h.spot('child'); expect(h.state().traits.fear).toBeCloseTo(.2); expect(h.effects.filter(effect => effect.kind === 'wave')).toHaveLength(1);
    expect(h.has('GIVE_COMPLETED')).toBe(false);
  });
  it('searches, finds the coin, hands it back and may give a coin or keep it', () => {
    h.spot('child'); h.choose('child-search'); expect(h.has('COIN_SEARCHED')).toBe(true); expect(h.shown('coin')).toBe(true);
    h.spot('coin'); expect(h.has('COIN_FOUND')).toBe(true); expect(h.shown('coin')).toBe(false);
    h.spot('child'); expect(h.view.story).toEqual({story: 'child', step: 'found'}); h.leaveAndReopen('child');
    h.choose('child-return'); expect(h.view.story).toEqual({story: 'child', step: 'returned'});
    h.choose('child-keep'); expect(h.has('CHILD_GIVEN', 'GIVE_COMPLETED')).toBe(false);
    h.spot('child'); expect(h.view.story).toEqual({story: 'child', step: 'again'});
    h.choose('child-give'); expect(h.has('CHILD_GIVEN', 'GIVE_COMPLETED')).toBe(true); expect(count('giveCount')).toBe(1);
    expect(h.shown('child')).toBe(false);
  });
  it('listens, then gives', () => {
    h.spot('child'); h.choose('child-listen'); expect(h.view.story).toEqual({story: 'child', step: 'listen'}); expect(h.has('CHILD_LISTENED')).toBe(true);
    h.leave(); h.spot('child'); expect(h.view.story).toEqual({story: 'child', step: 'again'});
    h.choose('child-give'); expect(count('giveCount')).toBe(1);
  });
});

describe('dark npc and closed exchange', () => {
  it('sets fear once on zone enter, then listening is giving time', () => {
    h.zone('dark-district'); expect(h.has('DARK_MET', 'FEAR_TRIGGERED')).toBe(true); expect(h.state().traits.fear).toBeCloseTo(.2);
    h.zone('dark-district'); expect(h.state().traits.fear).toBeCloseTo(.2);
    h.spot('dark'); expect(h.view.story).toEqual({story: 'dark', step: 'meet'}); expect(h.state().traits.fear).toBeCloseTo(.2);
    h.leaveAndReopen('dark'); h.choose('dark-leave'); expect(h.has('DARK_LISTENED', 'GIVE_COMPLETED')).toBe(false);
    h.spot('dark'); h.choose('dark-listen'); expect(h.has('DARK_LISTENED', 'GIVE_COMPLETED')).toBe(true); expect(count('giveCount')).toBe(1);
    expect(h.shown('dark')).toBe(false);
  });
  it('works without the zone', () => {
    h.spot('dark'); expect(h.has('DARK_MET', 'FEAR_TRIGGERED')).toBe(true); expect(h.view.story?.step).toBe('meet');
  });
});

describe('citizen who gives too much', () => {
  it('says nothing: no change', () => {
    h.spot('giver'); expect(h.has('GIVER_MET')).toBe(true); h.choose('giver-silent'); expect(h.has('GIVER_RESTED')).toBe(false);
    h.spot('giver'); expect(h.view.story).toEqual({story: 'giver', step: 'meet'});
  });
  it('suggests a rest, the fruit can be declined and accepted later', () => {
    h.spot('giver'); h.choose('giver-rest'); expect(h.has('GIVER_RESTED')).toBe(true); expect(h.view.story).toEqual({story: 'giver', step: 'fruit'});
    h.leaveAndReopen('giver'); h.choose('giver-decline'); expect(h.has('GIVER_GIFT_ACCEPTED')).toBe(false);
    h.spot('giver'); expect(h.view.story).toEqual({story: 'giver', step: 'fruit'});
    h.choose('giver-accept'); expect(h.has('GIVER_GIFT_ACCEPTED', 'RECEIVE_COMPLETED')).toBe(true); expect(count('receiveCount')).toBe(1);
  });
});

describe('citizen who cannot receive', () => {
  it('respects the no, then offers once more: service', () => {
    h.spot('receiver'); h.leaveAndReopen('receiver'); h.choose('receiver-respect'); expect(h.has('SERVICE_OFFERED')).toBe(false);
    h.spot('receiver'); h.choose('receiver-offer'); expect(h.has('RECEIVER_ACCEPTED', 'SERVICE_OFFERED')).toBe(true); expect(count('serviceActs')).toBe(1);
    expect(h.effects).toContainEqual({kind: 'act', actor: 'player', action: 'help'}); expect(h.shown('receiver')).toBe(false);
  });
});

describe('exchange guide', () => {
  it('always offers tea; declining changes nothing; tea is receive', () => {
    h.spot('exchange-door'); expect(h.has('EXCHANGE_HOUSE_ENTERED')).toBe(true);
    h.spot('guide'); expect(h.view.story).toEqual({story: 'guide', step: 'meet'}); expect(h.has('GUIDE_MET')).toBe(true); h.leaveAndReopen('guide');
    h.choose('guide-decline'); expect(h.has('RECEIVE_COMPLETED')).toBe(false);
    h.spot('guide'); h.choose('guide-tea'); expect(h.has('GUIDE_TEA_ACCEPTED', 'RECEIVE_COMPLETED')).toBe(true); expect(count('receiveCount')).toBe(1);
    expect(h.view.story).toEqual({story: 'guide', step: 'tea'}); expect(h.has('EXCHANGE_UNDERSTOOD')).toBe(false);
    h.spot('guide'); expect(h.view.story).toEqual({story: 'guide', step: 'think'});
  });
  it('understands the exchange when give and receive are both lived, in either order', () => {
    h.spot('dark'); h.choose('dark-listen'); expect(h.has('EXCHANGE_UNDERSTOOD')).toBe(false);
    h.spot('guide'); h.choose('guide-tea'); expect(h.has('EXCHANGE_UNDERSTOOD')).toBe(true); expect(h.view.story).toEqual({story: 'guide', step: 'teaOpen'});
    h.spot('guide'); expect(h.view.story).toEqual({story: 'guide', step: 'open'});
  });
  it('understands the exchange when receive came first', () => {
    h.spot('guide'); h.choose('guide-tea'); expect(h.has('EXCHANGE_UNDERSTOOD')).toBe(false);
    h.spot('dark'); h.choose('dark-listen'); expect(h.has('EXCHANGE_UNDERSTOOD')).toBe(true);
    h.spot('guide'); expect(h.view.story).toEqual({story: 'guide', step: 'open'});
  });
  it('sets the event fact only once', () => {
    h.spot('dark'); h.choose('dark-listen'); h.spot('guide'); h.choose('guide-tea');
    h.zone('exchange-street'); h.spot('giver'); h.choose('giver-rest'); h.choose('giver-accept');
    expect(h.state().facts.filter(fact => fact === 'EXCHANGE_UNDERSTOOD')).toHaveLength(1); expect(h.state().firedRules.filter(id => id.startsWith('M-exchange'))).toHaveLength(1);
  });
});

describe('beetle transformation', () => {
  function toBeetle() { lookWithin(h); h.spot('return'); desire(h); h.spot('tree'); }
  it('needs the attachment to be seen first', () => {
    lookWithin(h); expect(h.shown('beetle-observe')).toBe(false);
  });
  it('observes, may stay, then lets go; the beetle is calmed and never killed', () => {
    toBeetle(); expect(h.has('ATTACHMENT_SEEN')).toBe(true); expect(h.shown('beetle-observe')).toBe(true);
    const attachment = h.state().traits.attachment;
    h.spot('beetle-observe'); expect(h.has('BEETLE_OBSERVED')).toBe(true); expect(h.view.story).toEqual({story: 'beetle', step: 'observe'}); h.leaveAndReopen('beetle-observe');
    h.choose('beetle-stay'); expect(h.has('ATTACHMENT_TRANSFORMED')).toBe(false);
    h.spot('beetle-observe'); h.choose('beetle-letgo');
    expect(h.has('BEETLE_RELEASED', 'ATTACHMENT_TRANSFORMED')).toBe(true); expect(h.state().traits.attachment).toBeCloseTo(attachment - .3);
    expect(h.view.story).toEqual({story: 'beetle', step: 'released'}); expect(h.shown('beetle-observe')).toBe(false);
    expect(h.effects).toContainEqual({kind: 'act', actor: 'beetle', action: 'relief'});
  });
});

describe('free choices never lock content', () => {
  it('keeps every story reachable after leaving it', () => {
    for (const id of ['crate', 'child', 'dark', 'giver', 'receiver', 'guide']) { h.spot(id); h.leave(); }
    for (const id of ['crate', 'child', 'dark', 'giver', 'receiver', 'guide']) expect(h.shown(id)).toBe(true);
    expect(h.state().counters).toEqual({serviceActs: 0, giveCount: 0, receiveCount: 0});
  });
  it('keeps slice flow untouched by the first story spots', () => {
    reflectMoneyLater();
    function reflectMoneyLater() { lookWithin(h); reflectMoney(h, 'A means of exchange.'); backOut(h); }
    expect(h.has('MONEY_REFLECTION_SAVED')).toBe(true);
  });
});
