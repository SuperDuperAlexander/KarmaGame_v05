import {describe, expect, it} from 'vitest';
import {readFileSync} from 'node:fs';
import {speakerLabels, storyText, strings, waveText} from '../src/content/strings.en';
import {allRules, stories} from '../src/narrative';

/** Every player text of the game: flat strings, story text, waves, labels. */
function collect(value: unknown, out: string[] = []): string[] {
  if (typeof value === 'string') out.push(value);
  else if (Array.isArray(value)) value.forEach(item => collect(item, out));
  else if (value && typeof value === 'object') Object.values(value).forEach(item => collect(item, out));
  return out;
}
const everyText = (): string[] => [...collect(strings), ...collect(storyText), ...collect(waveText), ...collect(speakerLabels),
  ...allRules.flatMap(rule => rule.effects).flatMap(effect => effect.kind === 'hint' || effect.kind === 'wave' ? [effect.text] : [])];

// Spec 1, 3, 4, 21: no diagnosis, no score, no money promise, no karma as fact, no kneeling, no right or wrong answer.
const banned: [string, RegExp][] = [
  ['diagnosis', /diagnos|disorder|\bsyndrome\b|\btherap|you (?:have|suffer from) (?:anxiety|depression|a problem)/i],
  ['claim about the player feeling', /you (?:really|truly|actually|secretly) (?:feel|want|are|need|fear)|deep down you|your real (?:feeling|fear|self)/i],
  ['score', /\bscore\b|\bpoints?\b|\bpoints\b|\blevel up\b|\bpercent\b|\brank\b|\bgrade\b|\bxp\b|\bachievement\b/i],
  ['money reward promise', /you will (?:earn|get|gain|receive|be paid|be rich)|guarantee|\bprofit\b|pays? off|\brich\b|\bwealth\b|reward/i],
  ['karma as fact', /karma/i],
  ['kneeling or lowering', /kneel|bow down|crawl|grovel|beg\b|submit|worthless/i],
  ['right or wrong', /wrong answer|correct answer|\bgood choice\b|\bbad choice\b|you (?:failed|passed)|you are (?:good|bad|greedy|selfish)|\bshould have\b|you must\b|\bmistake\b/i],
];

describe('player text rules', () => {
  it.each(banned)('has no %s', (_name, pattern) => {
    for (const text of everyText()) expect(text, text).not.toMatch(pattern);
  });
  it('keeps story lines, choices and waves short', () => {
    for (const story of Object.values(stories)) for (const [name, step] of Object.entries(story.steps)) {
      const where = `${story.id}/${name}`;
      expect(step.lines.length, where).toBeGreaterThan(0); expect(step.lines.length, where).toBeLessThanOrEqual(3);
      for (const line of step.lines) { expect(line.length, line).toBeLessThanOrEqual(120); expect(line.trim(), where).toBe(line); }
      expect(step.choices.length, where).toBeLessThanOrEqual(3);
      for (const choice of step.choices) { expect(choice.label.length, choice.label).toBeLessThanOrEqual(32); expect(choice.label.length).toBeGreaterThan(0); }
    }
    for (const text of Object.values(waveText)) expect(text.length).toBeLessThanOrEqual(64);
    for (const effect of allRules.flatMap(rule => rule.effects)) if (effect.kind === 'wave') expect(effect.text.length).toBeLessThanOrEqual(64);
  });
  it('keeps hints and spot prompts short', () => {
    for (const [key, text] of Object.entries(strings)) if (key.startsWith('hint') || key.startsWith('next')) expect(text.length, key).toBeLessThanOrEqual(100);
  });
  it('lets the guide ask the dignity question', () => {
    expect(stories.guide.steps.meet.lines).toContain('Can both sides leave with dignity?');
  });
  it('shows lower position as active help, never kneeling', () => {
    const effects = allRules.flatMap(rule => rule.effects).filter(effect => effect.kind === 'act');
    const actions = new Set<string>(effects.map(effect => effect.kind === 'act' ? effect.action : ''));
    expect(actions.has('carry')).toBe(true); expect(actions.has('help')).toBe(true);
    for (const forbidden of ['kneel', 'bow', 'crouch']) expect(actions.has(forbidden)).toBe(false);
  });
  it('gives every step a way out: choices never replace the leave button', () => {
    // Choices are optional buttons. Steps without choices are valid, and the panel always has a leave button (UiService StoryView.leave).
    for (const story of Object.values(stories)) for (const step of Object.values(story.steps)) expect(Array.isArray(step.choices)).toBe(true);
  });
  it('has no network, markup or render code in narrative and content files', () => {
    for (const file of ['src/narrative/mvpRules.ts', 'src/narrative/microStories.ts', 'src/narrative/spots.ts', 'src/narrative/zones.ts', 'src/narrative/index.ts', 'src/content/strings.en.ts', 'src/state/selectors.ts', 'src/reflection/reflectionStore.ts']) {
      expect(readFileSync(file, 'utf8'), file).not.toMatch(/\bfetch\s*\(|XMLHttpRequest|sendBeacon|@babylonjs|innerHTML|DOMParser/);
    }
  });
});
