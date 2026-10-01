import { describe, expect, it } from 'vitest';
import { WaveLedger, clampLabel, waveOpacity } from '../src/thought-waves/core';

describe('thought waves', () => {
  it('limits waves to two and deduplicates finished IDs', () => {
    const ledger = new WaveLedger();
    expect(ledger.accept('a', 'One')).toBe(true);
    expect(ledger.accept('b', 'Two')).toBe(true);
    expect(ledger.accept('c', 'Three')).toBe(false);
    ledger.finish('a');
    expect(ledger.accept('a', 'Again')).toBe(false);
    expect(ledger.accept('c', 'Three')).toBe(true);
    expect(ledger.count()).toBe(2);
  });
  it('rejects empty text and more than 64 characters', () => {
    const ledger = new WaveLedger();
    expect(ledger.accept('empty', '  ')).toBe(false);
    expect(ledger.accept('long', 'x'.repeat(65))).toBe(false);
    expect(ledger.accept('okay', 'x'.repeat(64))).toBe(true);
  });
  it('keeps labels within the view and above touch controls at 390 by 844', () => {
    const upper = clampLabel(-100, -100, 390, 844, 200, 50);
    expect(upper).toEqual({ x: 116, y: 170 });
    const lower = clampLabel(1000, 1000, 390, 844, 200, 50);
    expect(lower).toEqual({ x: 274, y: 639 });
    const small = clampLabel(-100, 500, 200, 200, 250, 80);
    expect(small).toEqual({ x: 100, y: 100 });
  });
  it('fades for four seconds and never uses an invalid opacity', () => {
    expect(waveOpacity(0)).toBe(0);
    expect(waveOpacity(1)).toBe(1);
    expect(waveOpacity(3.6)).toBeCloseTo(0.5);
    expect(waveOpacity(4)).toBe(0);
    expect(waveOpacity(5)).toBe(0);
  });
});
