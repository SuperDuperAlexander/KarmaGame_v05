import type {Fact, WorldState} from '../contracts/state';

export const hasFact = (state: Readonly<WorldState>, fact: Fact): boolean => state.facts.includes(fact);
export const selectors = {
  packageReceived: (state: Readonly<WorldState>) => hasFact(state, 'PACKAGE_RECEIVED'),
  gateOpen: (state: Readonly<WorldState>) => hasFact(state, 'PACKAGE_RECEIVED'),
  lookWithinReady: (state: Readonly<WorldState>) => hasFact(state, 'TREE_DISCOVERED'),
  innerWorldVisited: (state: Readonly<WorldState>) => hasFact(state, 'INNER_WORLD_ENTERED'),
  reflectionDone: (state: Readonly<WorldState>) => hasFact(state, 'MONEY_REFLECTION_SAVED'),
  marketEventExperienced: (state: Readonly<WorldState>) => hasFact(state, 'ATTACHMENT_TRIGGERED'),
  attachmentDiscovered: (state: Readonly<WorldState>) => hasFact(state, 'ATTACHMENT_SEEN'),
  sliceComplete: (state: Readonly<WorldState>) => hasFact(state, 'ATTACHMENT_SEEN'),
  chainState: (state: Readonly<WorldState>): 'hidden' | 'loose' | 'tense' | 'attached' =>
    !hasFact(state, 'PACKAGE_RECEIVED') ? 'hidden' : hasFact(state, 'ATTACHMENT_SEEN') ? 'attached' : hasFact(state, 'ATTACHMENT_TRIGGERED') ? 'tense' : 'loose',
  beetleState: (state: Readonly<WorldState>): 'hidden' | 'dormant' | 'attached' =>
    hasFact(state, 'ATTACHMENT_SEEN') ? 'attached' : hasFact(state, 'ATTACHMENT_TRIGGERED') ? 'dormant' : 'hidden',
};
