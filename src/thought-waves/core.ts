export const WAVE_SECONDS = 4;

export function clampLabel(x: number, y: number, width: number, height: number, labelWidth: number, labelHeight: number): { x: number; y: number } {
  const half = Math.min(labelWidth / 2 + 16, width / 2);
  const top = Math.min(145 + labelHeight / 2, height / 2);
  const bottom = Math.max(top, height - 180 - labelHeight / 2);
  return { x: Math.max(half, Math.min(width - half, x)), y: Math.max(top, Math.min(bottom, y)) };
}

export class WaveLedger {
  readonly seen = new Set<string>();
  private active = new Set<string>();
  accept(id: string, text: string): boolean {
    if (!id || !text.trim() || [...text].length > 64 || this.seen.has(id) || this.active.size >= 2) return false;
    this.seen.add(id);
    this.active.add(id);
    return true;
  }
  finish(id: string): void { this.active.delete(id); }
  count(): number { return this.active.size; }
}

export function waveOpacity(age: number): number {
  return Math.max(0, Math.min(1, age / 0.4, (WAVE_SECONDS - age) / 0.8));
}

/** Spec 10.2: attachment warm gold, fear cold blue-violet, service soft green, calm warm white. */
export type WaveTone = 'attachment' | 'fear' | 'service' | 'calm';
export const waveTones: Record<WaveTone, { rgb: [number, number, number]; border: string }> = {
  attachment: { rgb: [0.94, 0.76, 0.42], border: '#f1d49570' },
  fear: { rgb: [0.5, 0.48, 0.93], border: '#a9a6f270' },
  service: { rgb: [0.55, 0.84, 0.6], border: '#a8e0ae70' },
  calm: { rgb: [1, 0.95, 0.84], border: '#fff1d670' },
};
