import type {Scene} from '@babylonjs/core/scene';
import {ParticleSystem} from '@babylonjs/core/Particles/particleSystem';
import '@babylonjs/core/Particles/particleSystemComponent';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import {Color4} from '@babylonjs/core/Maths/math.color';
import type {Texture} from '@babylonjs/core/Materials/Textures/texture';
import {dotTexture} from './paint';

export interface Emitter {
  name:string;capacity:number;rate:number;life:[number,number];size:[number,number];
  color1:Color4;color2:Color4;gravity?:Vector3;speed?:[number,number];
  /** Writes a start position in world space. */
  place:(out:Vector3)=>void;
}
/** Billboard particles only. One system is one draw call. Rate scales with the quality preset (capacity stays, fewer are alive). */
export function createParticles(scene:Scene,list:Emitter[]){
  const texture:Texture=dotTexture(scene);const systems=new Map<string,{ps:ParticleSystem;base:number;level:number}>();let share=1;
  for(const e of list){
    const ps=new ParticleSystem('particles-'+e.name,e.capacity,scene);ps.particleTexture=texture;
    ps.emitter=Vector3.Zero();ps.blendMode=ParticleSystem.BLENDMODE_ADD;
    ps.startPositionFunction=(_m,pos)=>e.place(pos);
    ps.minLifeTime=e.life[0];ps.maxLifeTime=e.life[1];ps.minSize=e.size[0];ps.maxSize=e.size[1];
    ps.color1=e.color1;ps.color2=e.color2;ps.colorDead=new Color4(e.color2.r,e.color2.g,e.color2.b,0);
    ps.gravity=e.gravity??Vector3.Zero();ps.minEmitPower=e.speed?.[0]??.05;ps.maxEmitPower=e.speed?.[1]??.2;
    ps.direction1=new Vector3(-.2,.3,-.2);ps.direction2=new Vector3(.2,1,.2);
    ps.emitRate=e.rate;ps.updateSpeed=.016;ps.isLocal=false;ps.disposeOnStop=false;
    ps.start();systems.set(e.name,{ps,base:e.rate,level:1});
  }
  const apply=()=>{for(const s of systems.values())s.ps.emitRate=s.base*s.level*share;};
  return {
    /** Share of the particles that stay: 1 is all, .5 is half. Live switch. */
    scale(k:number){share=k;apply();},
    /** State level of one system, 0..1. */
    level(name:string,k:number){const s=systems.get(name);if(s){s.level=k;apply();}},
    burst(name:string,count:number){const s=systems.get(name);if(s)s.ps.manualEmitCount=Math.round(count*share);},
    capacity(){let n=0;for(const e of list)n+=e.capacity;return n;},
    dispose(){for(const s of systems.values())s.ps.dispose();texture.dispose();},
  };
}
