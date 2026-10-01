import type {WorldId} from '../contracts/state';
export const transitionSteps=['lock','fade-out','save','prepare','switch','state','fade-in','unlock'] as const;
export function createTransition(actions:{lock():()=>void;veil(on:boolean):void;save():Promise<void>;prepare(id:WorldId):Promise<void>;switch(id:WorldId):void;activated(id:WorldId):void;reset():void}) {
  let busy=false;const logs:{world:WorldId;step:string;time:number}[]=[];
  return {logs,get busy(){return busy;},async go(id:WorldId) {
    if(busy)return;busy=true;const release=actions.lock();
    const log=(step:string)=>logs.push({world:id,step,time:performance.now()});
    try {
      log('lock');actions.reset();log('fade-out');actions.veil(true);
      log('save');await actions.save();log('prepare');await actions.prepare(id);
      log('switch');actions.switch(id);log('state');actions.activated(id);
      log('fade-in');actions.veil(false);
    } finally {log('unlock');release();busy=false;}
  }};
}
