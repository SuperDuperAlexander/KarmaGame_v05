import {execFileSync} from 'node:child_process';
import {expect, it} from 'vitest';

it('keeps all six shared-rig characters valid and the marks files in step with the GLBs', () => {
  const result = execFileSync('python', ['tools/rig/validate_shared.py'], {encoding: 'utf8', stdio: 'pipe'});
  expect(result).toContain('6 characters pass');
}, 60000);
