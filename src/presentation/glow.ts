import type {Scene} from '@babylonjs/core/scene';
import type {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';
import {GlowLayer} from '@babylonjs/core/Layers/glowLayer';
import '@babylonjs/core/Layers/effectLayerSceneComponent';
import type {GlowPreset} from './quality';

/** True for a mesh that asks for glow. The contract: `mesh.metadata.glow === true` (docs/wp/_COMMON_LOOK.md). */
export function wantsGlow(mesh:Pick<AbstractMesh,'metadata'>):boolean{return mesh.metadata?.glow===true;}

/**
 * A shader material has no emissive colour or texture, so the glow layer would draw it black. It would cost a draw call and show nothing.
 * Those meshes (SourceWater, waterfalls) are skipped.
 */
export function canGlow(mesh:AbstractMesh):boolean{
  const material=mesh.material as {getClassName?:()=>string;emissiveColor?:unknown;emissiveTexture?:unknown}|null;
  if(!material)return false;if(material.getClassName?.()==='ShaderMaterial')return false;
  return material.emissiveColor!==undefined||material.emissiveTexture!==undefined||material.getClassName?.()==='MultiMaterial';
}

/**
 * One glow layer for the whole scene. It includes only tagged meshes, so every other mesh costs nothing.
 * The layer exists only while the preset has a glow and at least one mesh is tagged.
 * An empty include list would mean "all meshes" in Babylon, so the layer never runs with an empty list.
 * Off on `low` and in `?safe`. Smaller texture and blur on phones (see quality.ts).
 */
export function createGlow(scene:Scene){
  let layer:GlowLayer|null=null;let applied:GlowPreset|null=null;let wanted:GlowPreset|null=null;
  const tagged=new Set<number>();let wait=0;
  function scan(){
    for(const m of scene.meshes){if(tagged.has(m.uniqueId)||!wantsGlow(m)||!canGlow(m))continue;tagged.add(m.uniqueId);layer?.addIncludedOnlyMesh(m as never);}
  }
  function build(){
    if(!wanted||!tagged.size){drop();return;}
    if(layer&&applied&&applied.ratio===wanted.ratio&&applied.kernel===wanted.kernel){layer.intensity=wanted.intensity;layer.isEnabled=true;return;}
    drop();
    layer=new GlowLayer('glow',scene,{mainTextureRatio:wanted.ratio,blurKernelSize:wanted.kernel});layer.intensity=wanted.intensity;applied=wanted;
    for(const m of scene.meshes)if(tagged.has(m.uniqueId))layer.addIncludedOnlyMesh(m as never);
  }
  function drop(){layer?.dispose();layer=null;applied=null;}
  return {
    /** Quality change. Null means off. */
    set(preset:GlowPreset|null){wanted=preset;build();},
    /** Look for newly tagged meshes. Cheap: one pass over the mesh list, at most once a second. */
    update(dt:number){
      wait-=dt;if(wait>0)return;wait=1;const before=tagged.size;scan();if(tagged.size!==before||(!layer&&wanted&&tagged.size))build();
    },
    /** Number of tagged meshes (for tests and reports). */
    count(){return tagged.size;},
    active(){return Boolean(layer)&&layer!.isEnabled;},
    dispose(){drop();}
  };
}
