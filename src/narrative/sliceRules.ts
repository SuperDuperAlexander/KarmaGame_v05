import type {Condition, Fact, Rule} from '../contracts/state';
import {strings} from '../content/strings.en';

const fact = (name: Fact, value = true): Condition => ({kind: 'fact', fact: name, value});
const all = (...conditions: Condition[]): Condition => ({kind: 'all', conditions});

export const sliceRules: readonly Rule[] = [
  {id: 'R1-package', signal: 'waystone', condition: fact('PACKAGE_RECEIVED', false), once: true, effects: [{kind: 'fact', fact: 'PACKAGE_RECEIVED'}, {kind: 'trait', trait: 'attachment', delta: .10}, {kind: 'save'}]},
  {id: 'R2-city', signal: 'city-enter', condition: fact('PACKAGE_RECEIVED'), once: true, effects: [{kind: 'fact', fact: 'CITY_ENTERED'}, {kind: 'save'}]},
  {id: 'R3-tree', signal: 'tree-enter', condition: fact('CITY_ENTERED'), once: true, effects: [{kind: 'fact', fact: 'TREE_DISCOVERED'}, {kind: 'save'}]},
  {id: 'R4-look', signal: 'look-within', condition: fact('TREE_DISCOVERED'), once: false, effects: [{kind: 'transition', world: 'inner'}]},
  {id: 'R5-inner', signal: 'inner-active', condition: fact('TREE_DISCOVERED'), once: true, effects: [{kind: 'fact', fact: 'INNER_WORLD_ENTERED'}, {kind: 'save'}]},
  {id: 'R6-reflect', signal: 'reflect', condition: all(fact('INNER_WORLD_ENTERED'), fact('MONEY_REFLECTION_SAVED', false)), once: false, effects: [{kind: 'panel', panel: 'reflection'}]},
  {id: 'R7-reflection', signal: 'reflection-done', condition: all(fact('INNER_WORLD_ENTERED'), fact('MONEY_REFLECTION_SAVED', false)), once: true, effects: [{kind: 'fact', fact: 'MONEY_REFLECTION_SAVED'}, {kind: 'save'}]},
  {id: 'R8-return', signal: 'return', condition: {kind: 'always'}, once: false, effects: [{kind: 'transition', world: 'outer'}]},
  {id: 'R9-market', signal: 'market-enter', condition: fact('CITY_ENTERED'), once: true, effects: [{kind: 'fact', fact: 'MARKET_VISITED'}, {kind: 'save'}]},
  {id: 'R10-desire', signal: 'desire', condition: all(fact('MARKET_VISITED'), fact('ATTACHMENT_TRIGGERED', false)), once: true, effects: [{kind: 'fact', fact: 'ATTACHMENT_TRIGGERED'}, {kind: 'trait', trait: 'attachment', delta: .35}, {kind: 'save'}, {kind: 'wave', id: 'attachment-desire', text: strings.wave}]},
  {id: 'R11-beetle', signal: 'inner-active', condition: all(fact('INNER_WORLD_ENTERED'), fact('ATTACHMENT_TRIGGERED'), fact('ATTACHMENT_SEEN', false)), once: true, effects: [{kind: 'fact', fact: 'ATTACHMENT_SEEN'}, {kind: 'save'}]},
  {id: 'R12-stop', signal: 'inner-active', condition: fact('ATTACHMENT_SEEN'), once: true, effects: [{kind: 'save'}, {kind: 'hint', text: strings.end}]},
];
