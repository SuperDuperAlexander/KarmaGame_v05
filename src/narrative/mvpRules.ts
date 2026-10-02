import type {ActAction, ActorId, Condition, Effect, Fact, Rule, SignalType, Trait} from '../contracts/state';
import {strings, waveText} from '../content/strings.en';

// Small builders keep the rule table short. Rules are data (spec 7.2).
const has = (name: Fact): Condition => ({kind: 'fact', fact: name, value: true});
const not = (name: Fact): Condition => ({kind: 'fact', fact: name, value: false});
const all = (...conditions: Condition[]): Condition => ({kind: 'all', conditions});
const fact = (name: Fact): Effect => ({kind: 'fact', fact: name});
const trait = (name: Trait, delta: number): Effect => ({kind: 'trait', trait: name, delta});
const counter = (name: 'serviceActs' | 'giveCount' | 'receiveCount'): Effect => ({kind: 'counter', counter: name, delta: 1});
const story = (id: string, step: string): Effect => ({kind: 'story', story: id, step});
const act = (actor: ActorId, action: ActAction): Effect => ({kind: 'act', actor, action});
const wave = (id: string, text: string, actor: ActorId, tone: 'attachment' | 'fear' | 'service' | 'calm'): Effect => ({kind: 'wave', id, text, actor, tone});
const hint = (text: string): Effect => ({kind: 'hint', text});
const save: Effect = {kind: 'save'};
const end: Effect = {kind: 'story-end'};

// Rule IDs are `M-<signalId>` plus a letter for the 2nd, 3rd, ... rule of the same signal ID. IDs of once-rules go into saves.
const used = new Map<string, number>();
function uniqueId(base: string): string {
  const n = used.get(base) ?? 0; used.set(base, n + 1);
  return n === 0 ? base : `${base}-${String.fromCharCode(97 + n)}`;
}
function build(signal: SignalType, signalId: string | undefined, when: Condition, effects: Effect[], once: boolean, id = `M-${signalId ?? signal}`): Rule {
  return {id: uniqueId(id), signal, ...(signalId === undefined ? {} : {signalId}), condition: when, once, effects};
}
const spot = (id: string, when: Condition, effects: Effect[], once = false): Rule => build('spot', id, when, effects, once);
const choice = (id: string, when: Condition, effects: Effect[], once = false): Rule => build('choice', id, when, effects, once);
const zone = (id: string, when: Condition, effects: Effect[], once = true): Rule => build('zone-enter', id, when, effects, once, `Z-${id}`);

/** Facts that make the Source Water ready for the finale. No order. */
export const FINALE_FACTS: readonly Fact[] = ['TREE_DISCOVERED', 'MONEY_REFLECTION_SAVED', 'SERVICE_OFFERED', 'GIVE_COMPLETED', 'RECEIVE_COMPLETED', 'ATTACHMENT_TRANSFORMED'];
export const finaleReadyCondition: Condition = all(...FINALE_FACTS.map(has));

const city = has('CITY_ENTERED');
const exchangeCheck = all(has('GIVE_COMPLETED'), has('RECEIVE_COMPLETED'), not('EXCHANGE_UNDERSTOOD'));
const giftOpen = all(has('GIFT_OFFERED'), not('GIFT_ACCEPTED'), not('GIFT_DECLINED'));
const darkEffects = (): Effect[] => [fact('DARK_MET'), fact('FEAR_TRIGGERED'), trait('fear', .2), save, wave('dark-wave', waveText.dark, 'darkNpc', 'fear')];

/**
 * Rule order matters inside one signal. A "setter" rule (sets a fact once) comes before its "presenter" rule (opens a story step).
 * Presenter conditions exclude each other, so one press opens exactly one step.
 */
export const mvpRules: readonly Rule[] = [
  // Zones. The three city zones also work through the data-driven signal.
  zone('city', all(has('PACKAGE_RECEIVED'), not('CITY_ENTERED')), [fact('CITY_ENTERED'), save]),
  zone('tree', all(city, not('TREE_DISCOVERED')), [fact('TREE_DISCOVERED'), save]),
  zone('market', all(city, not('MARKET_VISITED')), [fact('MARKET_VISITED'), save]),
  zone('exchange-street', city, [hint(strings.hintStreet)]),
  zone('dark-district', all(city, not('DARK_MET')), darkEffects()),

  // Inner mirror of fear (spec 8.3).
  build('inner-active', undefined, all(has('INNER_WORLD_ENTERED'), has('FEAR_TRIGGERED'), not('FEAR_SEEN')), [fact('FEAR_SEEN'), save], true, 'M-fear-seen'),

  // 1. Merchant and the heavy crate.
  spot('crate', all(city, not('CRATE_CARRIED'), not('MERCHANT_MET')), [fact('MERCHANT_MET'), save], true),
  spot('crate', all(city, not('CRATE_CARRIED')), [story('merchant', 'crate')]),
  choice('crate-lift', all(has('MERCHANT_MET'), not('CRATE_CARRIED')), [fact('CRATE_CARRIED'), fact('SERVICE_OFFERED'), counter('serviceActs'), act('player', 'carry'), act('merchant', 'carry'), save, end, hint(strings.hintCrate)], true),
  choice('crate-no', has('MERCHANT_MET'), [end]),
  spot('crate-drop', all(has('CRATE_CARRIED'), not('GIFT_OFFERED')), [fact('GIFT_OFFERED'), act('merchant', 'relief'), save, wave('crate-thanks', waveText.merchant, 'merchant', 'service'), hint(strings.hintGift)], true),
  spot('merchant', giftOpen, [story('merchant', 'gift')]),
  choice('gift-accept', giftOpen, [fact('GIFT_ACCEPTED'), fact('RECEIVE_COMPLETED'), counter('receiveCount'), act('merchant', 'give'), act('player', 'receive'), save, story('merchant', 'thanks')], true),
  choice('gift-decline', giftOpen, [fact('GIFT_DECLINED'), save, story('merchant', 'declined')], true),

  // 2. Fear Child and the missing coin.
  spot('child', all(city, not('CHILD_MET')), [fact('CHILD_MET'), fact('FEAR_TRIGGERED'), trait('fear', .2), save, wave('child-fear', waveText.child, 'fearChild', 'fear')], true),
  spot('child', all(has('CHILD_MET'), not('COIN_FOUND'), not('CHILD_LISTENED'), not('CHILD_GIVEN')), [story('child', 'meet')]),
  spot('child', all(has('CHILD_MET'), has('COIN_FOUND'), not('CHILD_LISTENED'), not('CHILD_GIVEN')), [story('child', 'found')]),
  spot('child', all(has('CHILD_LISTENED'), not('CHILD_GIVEN')), [story('child', 'again')]),
  choice('child-search', all(has('CHILD_MET'), not('COIN_SEARCHED')), [fact('COIN_SEARCHED'), save], true),
  choice('child-search', has('CHILD_MET'), [act('player', 'search'), end, hint(strings.hintCoinSearch)]),
  spot('coin', all(has('COIN_SEARCHED'), not('COIN_FOUND')), [fact('COIN_FOUND'), act('player', 'search'), save, hint(strings.hintCoinFound)], true),
  choice('child-listen', all(has('CHILD_MET'), not('CHILD_LISTENED')), [fact('CHILD_LISTENED'), save], true),
  choice('child-listen', all(has('CHILD_MET'), not('CHILD_GIVEN')), [act('player', 'listen'), story('child', 'listen')]),
  choice('child-walk', has('CHILD_MET'), [end]),
  choice('child-return', all(has('COIN_FOUND'), not('CHILD_LISTENED')), [fact('CHILD_LISTENED'), save], true),
  choice('child-return', all(has('COIN_FOUND'), not('CHILD_GIVEN')), [act('player', 'give'), act('fearChild', 'relief'), story('child', 'returned')]),
  choice('child-give', all(has('CHILD_MET'), not('CHILD_GIVEN')), [fact('CHILD_GIVEN'), fact('GIVE_COMPLETED'), counter('giveCount'), act('player', 'give'), act('fearChild', 'relief'), save, story('child', 'given')], true),
  choice('child-keep', has('CHILD_MET'), [end]),

  // 3. Dark NPC and the closed exchange. He is not healed.
  spot('dark', all(city, not('DARK_MET')), darkEffects(), true),
  spot('dark', all(has('DARK_MET'), not('DARK_LISTENED')), [story('dark', 'meet')]),
  choice('dark-listen', all(has('DARK_MET'), not('DARK_LISTENED')), [fact('DARK_LISTENED'), fact('GIVE_COMPLETED'), counter('giveCount'), act('player', 'listen'), act('darkNpc', 'talk'), save, story('dark', 'after')], true),
  choice('dark-leave', has('DARK_MET'), [end]),

  // 4. Citizen who gives too much. Giving needs limits.
  spot('giver', all(city, not('GIVER_MET')), [fact('GIVER_MET'), save], true),
  spot('giver', all(has('GIVER_MET'), not('GIVER_RESTED'), not('GIVER_GIFT_ACCEPTED')), [story('giver', 'meet')]),
  spot('giver', all(has('GIVER_RESTED'), not('GIVER_GIFT_ACCEPTED')), [story('giver', 'fruit')]),
  choice('giver-rest', all(has('GIVER_MET'), not('GIVER_RESTED')), [fact('GIVER_RESTED'), act('player', 'talk'), save], true),
  choice('giver-rest', all(has('GIVER_RESTED'), not('GIVER_GIFT_ACCEPTED')), [story('giver', 'fruit')]),
  choice('giver-silent', has('GIVER_MET'), [end]),
  choice('giver-accept', all(has('GIVER_RESTED'), not('GIVER_GIFT_ACCEPTED')), [fact('GIVER_GIFT_ACCEPTED'), fact('RECEIVE_COMPLETED'), counter('receiveCount'), act('giver', 'give'), act('player', 'receive'), save, story('giver', 'enjoy')], true),
  choice('giver-decline', has('GIVER_MET'), [end]),

  // 5. Citizen who cannot receive. Receiving is an active skill.
  spot('receiver', all(city, not('RECEIVER_MET')), [fact('RECEIVER_MET'), save], true),
  spot('receiver', all(has('RECEIVER_MET'), not('RECEIVER_ACCEPTED')), [story('receiver', 'meet')]),
  choice('receiver-offer', all(has('RECEIVER_MET'), not('RECEIVER_ACCEPTED')), [fact('RECEIVER_ACCEPTED'), fact('SERVICE_OFFERED'), counter('serviceActs'), act('player', 'help'), act('receiver', 'receive'), save, story('receiver', 'accepted')], true),
  choice('receiver-respect', has('RECEIVER_MET'), [end]),

  // 6. Exchange Guide. The guide always offers tea, so receive is always reachable.
  spot('exchange-door', all(city, not('EXCHANGE_HOUSE_ENTERED')), [fact('EXCHANGE_HOUSE_ENTERED'), save, hint(strings.hintStreet)], true),
  spot('guide', all(city, not('GUIDE_MET')), [fact('GUIDE_MET'), save], true),
  spot('guide', all(has('GUIDE_MET'), has('EXCHANGE_UNDERSTOOD')), [act('guide', 'welcome'), story('guide', 'open')]),
  spot('guide', all(has('GUIDE_MET'), not('GUIDE_TEA_ACCEPTED'), not('EXCHANGE_UNDERSTOOD')), [story('guide', 'meet')]),
  spot('guide', all(has('GUIDE_TEA_ACCEPTED'), not('EXCHANGE_UNDERSTOOD')), [story('guide', 'think')]),
  choice('guide-tea', all(has('GUIDE_MET'), not('GUIDE_TEA_ACCEPTED')), [fact('GUIDE_TEA_ACCEPTED'), fact('RECEIVE_COMPLETED'), counter('receiveCount'), act('guide', 'give'), act('player', 'receive'), save], true),
  choice('guide-tea', all(has('GUIDE_TEA_ACCEPTED'), has('GIVE_COMPLETED')), [story('guide', 'teaOpen')]),
  choice('guide-tea', all(has('GUIDE_TEA_ACCEPTED'), not('GIVE_COMPLETED')), [story('guide', 'tea')]),
  choice('guide-decline', has('GUIDE_MET'), [end]),

  // Beetle transformation (inner). The beetle is never killed.
  spot('beetle-observe', all(has('ATTACHMENT_SEEN'), not('BEETLE_OBSERVED')), [fact('BEETLE_OBSERVED'), act('player', 'observe'), save], true),
  spot('beetle-observe', all(has('BEETLE_OBSERVED'), not('ATTACHMENT_TRANSFORMED')), [story('beetle', 'observe')]),
  choice('beetle-letgo', all(has('BEETLE_OBSERVED'), not('ATTACHMENT_TRANSFORMED')), [fact('BEETLE_RELEASED'), fact('ATTACHMENT_TRANSFORMED'), trait('attachment', -.3), act('player', 'release'), act('beetle', 'relief'), save, wave('beetle-soft', waveText.beetle, 'beetle', 'calm'), story('beetle', 'released')], true),
  choice('beetle-stay', has('BEETLE_OBSERVED'), [end]),

  // Finale (outer). Sitting by the water ends the first journey. Reflection is optional.
  spot('finale', all(finaleReadyCondition, not('FINALE_SEEN')), [fact('FINANCE_MVP_COMPLETE'), fact('FINALE_SEEN'), act('player', 'relief'), save, hint(strings.hintDone), story('finale', 'end')], true),
  choice('finale-write', has('FINALE_SEEN'), [end, {kind: 'panel', panel: 'reflection', prompt: 'enough'}]),
  choice('finale-sit', has('FINALE_SEEN'), [end]),
  spot('finale-reflect', all(has('FINALE_SEEN'), not('ENOUGH_REFLECTION_SAVED')), [{kind: 'panel', panel: 'reflection', prompt: 'enough'}]),
  build('reflection-done', 'enough', all(has('FINALE_SEEN'), not('ENOUGH_REFLECTION_SAVED')), [fact('ENOUGH_REFLECTION_SAVED'), save], true, 'M-enough'),

  // Understanding the exchange. Any order. Checked on every signal that can follow a give or receive.
  ...(['choice', 'spot', 'zone-enter', 'story-closed', 'reflection-done'] as const).map(signal => build(signal, undefined, exchangeCheck, [fact('EXCHANGE_UNDERSTOOD'), save, hint(strings.hintExchangeOpen)], true, `M-exchange-${signal}`)),
];
