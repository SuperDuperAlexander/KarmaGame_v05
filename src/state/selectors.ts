import type {Fact, WorldState} from '../contracts/state';

export const hasFact = (state: Readonly<WorldState>, fact: Fact): boolean => state.facts.includes(fact);
const count = (state: Readonly<WorldState>, name: string): number => state.counters[name] ?? 0;
const FINALE_FACTS: readonly Fact[] = ['TREE_DISCOVERED', 'MONEY_REFLECTION_SAVED', 'SERVICE_OFFERED', 'GIVE_COMPLETED', 'RECEIVE_COMPLETED', 'ATTACHMENT_TRANSFORMED'];
/** A story is done when it reached its natural end. Leaving early is not an end. Hints only; never a score. */
const STORY_DONE: Readonly<Record<string, readonly (readonly Fact[])[]>> = {
  merchant: [['GIFT_ACCEPTED'], ['GIFT_DECLINED']],
  child: [['CHILD_LISTENED'], ['CHILD_GIVEN']],
  dark: [['DARK_LISTENED']],
  giver: [['GIVER_GIFT_ACCEPTED']],
  receiver: [['RECEIVER_ACCEPTED']],
  guide: [['GUIDE_TEA_ACCEPTED'], ['EXCHANGE_UNDERSTOOD']],
  beetle: [['ATTACHMENT_TRANSFORMED']],
  finale: [['FINALE_SEEN']],
};

export const selectors = {
  packageReceived: (state: Readonly<WorldState>) => hasFact(state, 'PACKAGE_RECEIVED'),
  gateOpen: (state: Readonly<WorldState>) => hasFact(state, 'PACKAGE_RECEIVED'),
  lookWithinReady: (state: Readonly<WorldState>) => hasFact(state, 'TREE_DISCOVERED'),
  innerWorldVisited: (state: Readonly<WorldState>) => hasFact(state, 'INNER_WORLD_ENTERED'),
  reflectionDone: (state: Readonly<WorldState>) => hasFact(state, 'MONEY_REFLECTION_SAVED'),
  marketEventExperienced: (state: Readonly<WorldState>) => hasFact(state, 'ATTACHMENT_TRIGGERED'),
  attachmentDiscovered: (state: Readonly<WorldState>) => hasFact(state, 'ATTACHMENT_SEEN'),
  sliceComplete: (state: Readonly<WorldState>) => hasFact(state, 'ATTACHMENT_SEEN'),
  /** `free` after the transformation: the chain hangs loose and the beetle is calm. */
  chainState: (state: Readonly<WorldState>): 'hidden' | 'loose' | 'tense' | 'attached' | 'free' =>
    !hasFact(state, 'PACKAGE_RECEIVED') ? 'hidden' : hasFact(state, 'ATTACHMENT_TRANSFORMED') ? 'free' : hasFact(state, 'ATTACHMENT_SEEN') ? 'attached' : hasFact(state, 'ATTACHMENT_TRIGGERED') ? 'tense' : 'loose',
  beetleState: (state: Readonly<WorldState>): 'hidden' | 'dormant' | 'attached' | 'observed' | 'released' | 'transformed' =>
    hasFact(state, 'ATTACHMENT_TRANSFORMED') ? 'transformed' : hasFact(state, 'BEETLE_RELEASED') ? 'released' : hasFact(state, 'BEETLE_OBSERVED') ? 'observed'
      : hasFact(state, 'ATTACHMENT_SEEN') ? 'attached' : hasFact(state, 'ATTACHMENT_TRIGGERED') ? 'dormant' : 'hidden',
  /** The cold dark root zone shows in the inner world after fear was seen (spec 8.3). */
  fearZoneVisible: (state: Readonly<WorldState>) => hasFact(state, 'FEAR_SEEN'),
  /** Water between the two basins, 0..1. Each side adds a little. Both sides together add more. */
  basinFlow: (state: Readonly<WorldState>): number => {
    const give = Math.min(count(state, 'giveCount'), 2), receive = Math.min(count(state, 'receiveCount'), 2);
    return Math.min(1, give * .2 + receive * .2 + (give > 0 && receive > 0 ? .2 : 0));
  },
  /** Small plants that stand up in the inner world, 0..3. */
  servicePlants: (state: Readonly<WorldState>): number => Math.max(0, Math.min(3, Math.floor(count(state, 'serviceActs')))),
  /** Tree, money reflection (saved or skipped), service, give, receive and transformation are all lived. */
  finaleReady: (state: Readonly<WorldState>) => FINALE_FACTS.every(fact => hasFact(state, fact)),
  finaleSeen: (state: Readonly<WorldState>) => hasFact(state, 'FINALE_SEEN'),
  storyDone: (state: Readonly<WorldState>, storyId: string): boolean => (STORY_DONE[storyId] ?? []).some(all => all.every(fact => hasFact(state, fact))),
};
