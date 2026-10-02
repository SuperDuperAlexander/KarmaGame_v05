import type {WorldId} from '../contracts/state';
/**
 * One source for story places (metres; tree trunk = 0,0 in both worlds; +Z north, +X east).
 * Narrative spots and world visuals both read this table. Lead-owned: helpers propose changes in their report.
 */
export interface PlacePoint {world:WorldId;x:number;z:number}
export const places = {
  // Slice places (unchanged).
  waystone:{world:'outer',x:1.2,z:-43.5},
  lookWithin:{world:'outer',x:0,z:-2.8},
  desire:{world:'outer',x:26,z:0},
  merchant:{world:'outer',x:27.5,z:2},
  innerArrival:{world:'inner',x:0,z:-7},
  innerReturn:{world:'inner',x:0,z:-3.4},
  reflect:{world:'inner',x:4,z:-2},
  beetle:{world:'inner',x:7.5,z:-0.5},
  // Finance MVP places.
  serviceCrate:{world:'outer',x:17,z:-9},
  serviceCrateDrop:{world:'outer',x:24,z:-4},
  fearChild:{world:'outer',x:-9,z:-7},
  lostCoin:{world:'outer',x:-13,z:-12},
  darkDistrict:{world:'outer',x:-24,z:4},
  darkNpc:{world:'outer',x:-27,z:4},
  giver:{world:'outer',x:7,z:9},
  receiver:{world:'outer',x:-6,z:10},
  exchangeDoor:{world:'outer',x:0,z:27},
  guide:{world:'outer',x:0,z:31},
  exchangeHouse:{world:'outer',x:0,z:36},
  finale:{world:'outer',x:-3,z:3.5},
  innerFearZone:{world:'inner',x:-7,z:2},
  beetleObserve:{world:'inner',x:6.2,z:-1.6},
  basinLeft:{world:'inner',x:-3,z:6},
  basinRight:{world:'inner',x:3,z:6},
  servicePlants:{world:'inner',x:-4,z:-5},
} as const satisfies Record<string,PlacePoint>;
export type PlaceId = keyof typeof places;
