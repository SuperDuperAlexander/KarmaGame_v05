import {execFileSync} from 'node:child_process';
import {expect, it} from 'vitest';

it('keeps the local rig repeatable and rejects broken file contracts', () => {
  const result = execFileSync('python', ['tools/rig/test_rig_v2.py'], {encoding: 'utf8', stdio: 'pipe'});
  expect(result).toBe('');
}, 20000);
