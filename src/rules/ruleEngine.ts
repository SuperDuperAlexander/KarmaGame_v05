import type {Condition, Effect, Rule, RuleEngine, Signal, WorldState, WorldStore} from '../contracts/state';
import {hasFact} from '../state/selectors';

export function matchesCondition(state: Readonly<WorldState>, condition: Condition): boolean {
  switch (condition.kind) {
    case 'always': return true;
    case 'fact': return hasFact(state, condition.fact) === (condition.value ?? true);
    case 'all': return condition.conditions.every(child => matchesCondition(state, child));
    case 'any': return condition.conditions.some(child => matchesCondition(state, child));
    case 'trait': {
      const value = state.traits[condition.trait];
      return (condition.min === undefined || value >= condition.min) && (condition.max === undefined || value <= condition.max);
    }
    case 'counter': return (state.counters[condition.counter] ?? 0) >= condition.min;
  }
}

export function createRuleEngine(store: WorldStore, rules: readonly Rule[], onEffect: (effect: Effect) => void): RuleEngine {
  const queue: Signal[] = [];
  let running = false;
  function process(signal: Signal) {
    for (const rule of rules) {
      const state = store.get();
      if (rule.signal !== signal.type || (rule.signalId !== undefined && rule.signalId !== signal.id) || (rule.once && state.firedRules.includes(rule.id)) || !matchesCondition(state, rule.condition)) continue;
      const freshWaves = new Set(rule.effects.filter(effect => effect.kind === 'wave' && !state.waveIds.includes(effect.id)).map(effect => effect.kind === 'wave' ? effect.id : ''));
      store.update(draft => {
        if (rule.once) draft.firedRules.push(rule.id);
        for (const effect of rule.effects) {
          if (effect.kind === 'fact') draft.facts.push(effect.fact);
          if (effect.kind === 'trait') draft.traits[effect.trait] += effect.delta;
        }
        // Reserve IDs before save effects. Reload cannot repeat an emitted wave.
        draft.waveIds.push(...freshWaves);
      });
      for (const effect of rule.effects) {
        if (effect.kind === 'fact' || effect.kind === 'trait') continue;
        if (effect.kind === 'wave') {
          if (!freshWaves.delete(effect.id)) continue;
        }
        onEffect(effect);
      }
    }
  }
  return {
    dispatch(signal) {
      queue.push(signal);
      if (running) return;
      running = true;
      try { while (queue.length) process(queue.shift()!); }
      finally { running = false; queue.length = 0; }
    },
  };
}
