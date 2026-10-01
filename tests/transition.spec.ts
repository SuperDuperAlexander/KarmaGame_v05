import {it,expect} from 'vitest';
import {createTransition,transitionSteps} from '../src/transition/transition';
it('locks and saves before switching and rejects a second hold',async()=>{
  const calls:string[]=[];
  const transition=createTransition({lock:()=>()=>calls.push('release'),veil:()=>{},save:async()=>{calls.push('save');},prepare:async()=>{calls.push('prepare');},switch:()=>{calls.push('switch');},activated:()=>{},reset:()=>{}});
  const first=transition.go('inner');await transition.go('inner');await first;
  expect(transition.logs.map(l=>l.step)).toEqual(transitionSteps);
  expect(calls).toEqual(['save','prepare','switch','release']);
});
