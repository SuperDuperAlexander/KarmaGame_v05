import type {Condition, Fact} from '../contracts/state';
import type {SpotData} from '../contracts/story';
import {strings} from '../content/strings.en';
import {finaleReadyCondition} from './mvpRules';

const has = (fact: Fact): Condition => ({kind: 'fact', fact, value: true});
const not = (fact: Fact): Condition => ({kind: 'fact', fact, value: false});
const all = (...conditions: Condition[]): Condition => ({kind: 'all', conditions});
const city = has('CITY_ENTERED');

/**
 * Press and hold spots. Every `when` matches at least one rule in mvpRules.ts, so a visible prompt always does something.
 * Slice spots keep their ids, texts, radii and conditions. `place` is a key of src/content/places.ts.
 * The slice spot "reflection" sends `reflect` (legacy signal).
 */
export const spots: readonly SpotData[] = [
  // Slice.
  {id: 'waystone', world: 'outer', place: 'waystone', radius: 2.2, text: strings.receive, signal: 'waystone', when: not('PACKAGE_RECEIVED')},
  {id: 'tree', world: 'outer', place: 'lookWithin', radius: 1.9, text: strings.look, signal: 'look-within', hold: true, when: has('TREE_DISCOVERED')},
  {id: 'desire', world: 'outer', place: 'desire', radius: 2.4, text: strings.desire, signal: 'desire', when: all(has('MARKET_VISITED'), not('ATTACHMENT_TRIGGERED'))},
  // Inner world. The beetle spot is first, so it wins where it overlaps the reflection spot.
  {id: 'beetle-observe', world: 'inner', place: 'beetleObserve', radius: 1.3, text: strings.observe, signal: 'spot', signalId: 'beetle-observe', hold: true, when: all(has('ATTACHMENT_SEEN'), not('ATTACHMENT_TRANSFORMED'))},
  {id: 'reflection', world: 'inner', place: 'reflect', radius: 1.8, text: strings.reflect, signal: 'reflect', when: not('MONEY_REFLECTION_SAVED')},
  {id: 'return', world: 'inner', place: 'innerReturn', radius: 1.4, text: strings.return, signal: 'return', hold: true, when: {kind: 'always'}},
  // Merchant and the heavy crate.
  {id: 'crate', world: 'outer', place: 'serviceCrate', radius: 2.2, text: strings.talkMerchant, signal: 'spot', signalId: 'crate', when: all(city, not('CRATE_CARRIED'))},
  {id: 'crate-drop', world: 'outer', place: 'serviceCrateDrop', radius: 2.2, text: strings.crateDrop, signal: 'spot', signalId: 'crate-drop', when: all(has('CRATE_CARRIED'), not('GIFT_OFFERED'))},
  {id: 'merchant', world: 'outer', place: 'merchant', radius: 1.6, text: strings.talkMerchant, signal: 'spot', signalId: 'merchant', when: all(has('GIFT_OFFERED'), not('GIFT_ACCEPTED'), not('GIFT_DECLINED'))},
  // Fear Child and the missing coin.
  {id: 'child', world: 'outer', place: 'fearChild', radius: 2.2, text: strings.talkChild, signal: 'spot', signalId: 'child', when: all(city, not('CHILD_GIVEN'))},
  {id: 'coin', world: 'outer', place: 'lostCoin', radius: 2, text: strings.pickCoin, signal: 'spot', signalId: 'coin', when: all(has('COIN_SEARCHED'), not('COIN_FOUND'))},
  // Dark NPC.
  {id: 'dark', world: 'outer', place: 'darkNpc', radius: 2.2, text: strings.stayNear, signal: 'spot', signalId: 'dark', when: all(city, not('DARK_LISTENED'))},
  // Citizens.
  {id: 'giver', world: 'outer', place: 'giver', radius: 2.2, text: strings.talkCitizen, signal: 'spot', signalId: 'giver', when: all(city, not('GIVER_GIFT_ACCEPTED'))},
  {id: 'receiver', world: 'outer', place: 'receiver', radius: 2.2, text: strings.talkCitizen, signal: 'spot', signalId: 'receiver', when: all(city, not('RECEIVER_ACCEPTED'))},
  // Exchange Guide.
  {id: 'exchange-door', world: 'outer', place: 'exchangeDoor', radius: 1.8, text: strings.openDoor, signal: 'spot', signalId: 'exchange-door', when: all(city, not('EXCHANGE_HOUSE_ENTERED'))},
  {id: 'guide', world: 'outer', place: 'guide', radius: 2.2, text: strings.greetGuide, signal: 'spot', signalId: 'guide', when: city},
  // Finale at the Source Water.
  {id: 'finale', world: 'outer', place: 'finale', radius: 1.8, text: strings.sitWater, signal: 'spot', signalId: 'finale', hold: true, when: all(finaleReadyCondition, not('FINALE_SEEN'))},
  {id: 'finale-reflect', world: 'outer', place: 'finale', radius: 1.8, text: strings.reflectEnough, signal: 'spot', signalId: 'finale-reflect', when: all(has('FINALE_SEEN'), not('ENOUGH_REFLECTION_SAVED'))},
];
