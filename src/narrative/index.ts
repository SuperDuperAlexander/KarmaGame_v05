import type {Fact, Rule, WorldId, WorldState} from '../contracts/state';
import type {MicroStory, SpotData, ZoneData} from '../contracts/story';
import {speakerLabels, strings} from '../content/strings.en';
import {sliceRules} from './sliceRules';
import {mvpRules} from './mvpRules';
import {microStories} from './microStories';
import {spots as spotData} from './spots';
import {zones as zoneData} from './zones';
import {selectors} from '../state/selectors';
export {sliceRules, mvpRules};

/** Public narrative surface for the app (WP-B2 wires it). Keep the names stable. */
export const allRules: readonly Rule[] = [...sliceRules, ...mvpRules];
export const stories: Readonly<Record<string, MicroStory>> = microStories;
export const spots: readonly SpotData[] = spotData;
export const zones: readonly ZoneData[] = zoneData;
/** Speaker names shown in the story panel. */
export const speakerNames: Readonly<Record<string, string>> = speakerLabels;

/** Soft guidance for any state, in both worlds. Never a score, never "wrong". */
export function nextHint(state: Readonly<WorldState>, world: WorldId): string {
  const has = (fact: Fact) => state.facts.includes(fact);
  if (selectors.finaleSeen(state)) return has('ENOUGH_REFLECTION_SAVED') ? strings.hintDone : strings.hintEnough;
  if (selectors.finaleReady(state)) return world === 'outer' ? strings.hintFinale : strings.hintFinaleInner;
  if (has('ATTACHMENT_SEEN')) {
    if (world === 'inner') return !has('ATTACHMENT_TRANSFORMED') ? strings.hintBeetle : !has('MONEY_REFLECTION_SAVED') ? strings.innerHelp : strings.innerBack;
    if (!has('SERVICE_OFFERED')) return strings.hintService;
    if (!has('GIVE_COMPLETED')) return strings.hintGive;
    if (!has('RECEIVE_COMPLETED')) return strings.hintReceive;
    if (!has('ATTACHMENT_TRANSFORMED')) return strings.hintWithin;
    if (!has('MONEY_REFLECTION_SAVED')) return strings.hintReflect;
    return strings.end;
  }
  if (world === 'inner') return strings.innerHelp;
  if (has('INNER_WORLD_ENTERED')) return has('ATTACHMENT_TRIGGERED') ? strings.nextInner : strings.nextMarket;
  return has('PACKAGE_RECEIVED') ? strings.carrying : strings.welcome;
}
