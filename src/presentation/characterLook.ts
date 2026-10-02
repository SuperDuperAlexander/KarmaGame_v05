import type {Scene} from '@babylonjs/core/scene';
import type {Mesh} from '@babylonjs/core/Meshes/mesh';
import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import type {Material} from '@babylonjs/core/Materials/material';
import {MaterialPluginBase} from '@babylonjs/core/Materials/materialPluginBase';
import {PBRBaseMaterial} from '@babylonjs/core/Materials/PBR/pbrBaseMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';

/** Nodes that get the character look: player, merchant and the two citizens. */
const NODES=['player.entity','merchant','citizen-a','citizen-b'];

/**
 * A soft rim light and a small brightness lift in the fragment shader, after tone mapping. No outline, no extra mesh, no extra draw call.
 * The rim follows the view angle (a fresnel term), so a dark coat still shows a lit edge against the ground.
 * It is a plain PBR add-on, so it works with the skinned meshes of the rigged files.
 */
export class RimPlugin extends MaterialPluginBase{
  readonly color=new Color3(1,.8,.55);strength=.4;lift=.13;
  constructor(material:Material){super(material,'LwRim',210,{LW_RIM:false});this._enable(true);}
  override getClassName(){return 'LwRimPlugin';}
  override prepareDefines(defines:Record<string,unknown>){defines.LW_RIM=true;}
  override getUniforms(){return {ubo:[{name:'lwRim',size:4,type:'vec4'},{name:'lwLift',size:1,type:'float'}],fragment:'uniform vec4 lwRim;\nuniform float lwLift;'};}
  override bindForSubMesh(buffer:{updateFloat4(n:string,x:number,y:number,z:number,w:number):void;updateFloat(n:string,x:number):void}){
    buffer.updateFloat4('lwRim',this.color.r,this.color.g,this.color.b,this.strength);buffer.updateFloat('lwLift',this.lift);
  }
  override getCustomCode(shaderType:string){
    if(shaderType!=='fragment')return null;
    return {CUSTOM_FRAGMENT_BEFORE_FRAGCOLOR:`
#ifdef LW_RIM
{float lwFres=pow(1.0-clamp(dot(normalize(normalW),normalize(viewDirectionW)),0.0,1.0),2.6);
finalColor.rgb=finalColor.rgb*(1.0+lwLift)+lwRim.rgb*lwRim.a*lwFres+vec3(lwLift*0.06);}
#endif
`};
  }
}

/**
 * Finds the characters when they exist (they load late) and adds the rim plugin to their materials once.
 * `tone` sets the rim colour: warm gold outside, cool cyan inside.
 */
export function characterLook(scene:Scene,tone:Color3,strength=.55){
  const done=new WeakSet<Material>();const plugins:RimPlugin[]=[];const found=new Set<string>();let wait=0;
  function scan(){
    for(const name of NODES){
      if(found.has(name))continue;const node=scene.getTransformNodeByName(name) as TransformNode|null;if(!node)continue;
      const meshes=node.getChildMeshes(false);if(!meshes.length)continue;found.add(name);
      for(const mesh of meshes){
        const material=(mesh as Mesh).material;
        if(!material||done.has(material)||!(material instanceof PBRBaseMaterial))continue;
        done.add(material);const plugin=new RimPlugin(material);plugin.color.copyFrom(tone);plugin.strength=strength;plugins.push(plugin);
      }
    }
  }
  return {
    /** Looks for the characters until all four exist. */
    update(dt:number){if(found.size>=NODES.length)return;wait-=dt;if(wait>0)return;wait=.5;scan();},
    count:()=>plugins.length,
    plugins
  };
}
