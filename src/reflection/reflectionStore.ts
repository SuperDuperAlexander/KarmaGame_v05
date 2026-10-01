import type {WorldStore} from '../contracts/state';
import {MAX_REFLECTION_LENGTH} from '../state/worldStore';

export const MONEY_REFLECTION_ID = 'money';

/** Keep user input literal. The UI must set textContent or textarea.value. */
export function saveReflection(store: WorldStore, text: string): void {
  if (typeof text !== 'string' || text.length > MAX_REFLECTION_LENGTH) throw new Error('Reflection exceeds limit');
  store.update(draft => { draft.reflections[MONEY_REFLECTION_ID] = text; });
}
export function skipReflection(store: WorldStore): void {
  store.update(draft => { delete draft.reflections[MONEY_REFLECTION_ID]; });
}
export function deleteReflections(store: WorldStore): void {
  store.update(draft => { draft.reflections = {}; });
}
