import type {Rule, WorldId, WorldState} from '../contracts/state';
import type {MicroStory, SpotData, ZoneData} from '../contracts/story';
import {strings} from '../content/strings.en';
import {sliceRules} from './sliceRules';
export {sliceRules};
/**
 * Public narrative surface for the app (WP-B0 stub). WP-B1 fills stories, spots, zones and MVP rules.
 * WP-B2 wires the app and interaction to these names. Keep the names stable.
 */
export const allRules: readonly Rule[] = sliceRules;
export const stories: Readonly<Record<string, MicroStory>> = {};
export const spots: readonly SpotData[] = [];
export const zones: readonly ZoneData[] = [];
/** Speaker names shown in the story panel. */
export const speakerNames: Readonly<Record<string, string>> = {};
/** Soft guidance. Never a score, never "wrong". */
export function nextHint(state: Readonly<WorldState>, world: WorldId): string {
  const facts = state.facts;
  if (facts.includes('ATTACHMENT_SEEN')) return strings.end;
  if (world === 'inner') return strings.innerHelp;
  if (facts.includes('INNER_WORLD_ENTERED')) return facts.includes('ATTACHMENT_TRIGGERED') ? strings.nextInner : strings.nextMarket;
  return facts.includes('PACKAGE_RECEIVED') ? strings.carrying : strings.welcome;
}
