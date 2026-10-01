import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {strings} from '../src/content/strings.en';
import {sliceRules} from '../src/narrative/sliceRules';

describe('slice content boundaries', () => {
  it('keeps wave and end text in the text source', () => {
    const waves = sliceRules.flatMap(rule => rule.effects).filter(effect => effect.kind === 'wave');
    expect(waves).toHaveLength(1); expect(waves[0].text).toBe(strings.wave); expect(waves[0].text.length).toBeLessThanOrEqual(64);
    expect(sliceRules.flatMap(rule => rule.effects).filter(effect => effect.kind === 'hint').map(effect => effect.text)).toEqual([strings.end]);
  });
  it('does not change traits from saved or skipped answers', () => {
    const rules = sliceRules.filter(rule => ['reflect', 'reflection-done'].includes(rule.signal));
    expect(rules).toHaveLength(2); expect(rules.flatMap(rule => rule.effects).some(effect => effect.kind === 'trait')).toBe(false);
  });
  it('has no later story facts or moral result', () => {
    const content = Object.values(strings).join('\n');
    expect(content).not.toMatch(/you (?:have|suffer from) (?:anxiety|depression)|karma (?:score|points|removed|earned)|guaranteed (?:money|profit|return)|you are (?:good|bad|greedy)/i);
    expect(sliceRules.flatMap(rule => rule.effects).filter(effect => effect.kind === 'fact').map(effect => effect.fact)).toEqual(['PACKAGE_RECEIVED', 'CITY_ENTERED', 'TREE_DISCOVERED', 'INNER_WORLD_ENTERED', 'MONEY_REFLECTION_SAVED', 'MARKET_VISITED', 'ATTACHMENT_TRIGGERED', 'ATTACHMENT_SEEN']);
  });
  it('keeps save and reflection modules local and free of render code', () => {
    for (const file of ['src/reflection/reflectionStore.ts', 'src/save/saveService.ts', 'src/state/worldStore.ts', 'src/rules/ruleEngine.ts', 'src/narrative/sliceRules.ts']) {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toMatch(/\bfetch\s*\(|XMLHttpRequest|sendBeacon|@babylonjs|innerHTML|DOMParser/);
    }
  });
});
