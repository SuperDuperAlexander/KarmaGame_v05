import type {ReflectionPrompt, WorldStore} from '../contracts/state';
import {MAX_REFLECTION_LENGTH} from '../state/worldStore';

export const MONEY_REFLECTION_ID = 'money';
export const ENOUGH_REFLECTION_ID = 'enough';
const ids: Readonly<Record<ReflectionPrompt, string>> = {money: MONEY_REFLECTION_ID, enough: ENOUGH_REFLECTION_ID};
const idFor = (prompt: ReflectionPrompt): string => {
  const id = ids[prompt];
  if (id === undefined) throw new Error('Unknown reflection prompt');
  return id;
};

/** Keep user input literal. The UI must set textContent or textarea.value. Never scored, never sent anywhere. */
export function saveReflection(store: WorldStore, text: string, prompt: ReflectionPrompt = 'money'): void {
  if (typeof text !== 'string' || text.length > MAX_REFLECTION_LENGTH) throw new Error('Reflection exceeds limit');
  const id = idFor(prompt);
  store.update(draft => { draft.reflections[id] = text; });
}
export function skipReflection(store: WorldStore, prompt: ReflectionPrompt = 'money'): void {
  const id = idFor(prompt);
  store.update(draft => { delete draft.reflections[id]; });
}
export function deleteReflections(store: WorldStore): void {
  store.update(draft => { draft.reflections = {}; });
}
