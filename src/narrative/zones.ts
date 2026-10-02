import type {Condition, Fact} from '../contracts/state';
import type {ZoneData} from '../contracts/story';

const has = (fact: Fact): Condition => ({kind: 'fact', fact, value: true});

/**
 * New areas of the outer world (metres). Entering sends {type:'zone-enter', id}.
 * The slice zones city, tree and market stay in the app (they send city-enter, tree-enter, market-enter), so they are not listed here.
 */
export const zones: readonly ZoneData[] = [
  {id: 'dark-district', world: 'outer', area: {kind: 'rect', minX: -32, maxX: -18, minZ: -4, maxZ: 12}, when: has('CITY_ENTERED')},
  {id: 'exchange-street', world: 'outer', area: {kind: 'rect', minX: -8, maxX: 8, minZ: 20, maxZ: 40}, when: has('CITY_ENTERED')},
];
