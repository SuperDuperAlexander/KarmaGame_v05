import {describe,expect,it} from 'vitest';
import {waveTones} from '../src/thought-waves/core';
describe('wave tones',()=>{
  it('has a colour for each tone: fear is cold, attachment is warm',()=>{
    expect(Object.keys(waveTones).sort()).toEqual(['attachment','calm','fear','service']);
    expect(waveTones.fear.rgb[2]).toBeGreaterThan(waveTones.fear.rgb[0]);
    expect(waveTones.attachment.rgb[0]).toBeGreaterThan(waveTones.attachment.rgb[2]);
    expect(waveTones.service.rgb[1]).toBeGreaterThan(waveTones.service.rgb[0]);
  });
});
