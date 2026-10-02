import type {Scene} from '@babylonjs/core/scene';
import type {AssetContainer} from '@babylonjs/core/assetContainer';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Vector3} from '@babylonjs/core/Maths/math.vector';
import type {AnimationGroup} from '@babylonjs/core/Animations/animationGroup';
import type {AssetId,AssetService,Visual} from '../contracts/visual';
import {registry} from './registry';
import {placeholder} from './placeholders';
export function createAssetService(forcePlaceholder=false):AssetService {
  const cache=new WeakMap<Scene,Map<string,Promise<AssetContainer>>>();const failed=new Set<AssetId>();
  return {status:()=>Object.entries(registry).map(([id,e])=>({id:id as AssetId,status:failed.has(id as AssetId)?'placeholder':forcePlaceholder?'placeholder':e.status,file:e.file})),
    async create(id,scene,parent,part){
      const e=registry[id];if(forcePlaceholder||!e.file||failed.has(id))return placeholder(id,scene,parent);
      try{
        let files=cache.get(scene);if(!files){files=new Map();cache.set(scene,files);scene.onDisposeObservable.add(()=>{files!.forEach(async p=>(await p.catch(()=>null))?.dispose());});}
        let pending=files.get(e.file);if(!pending){pending=(async()=>{await import('@babylonjs/loaders/glTF/2.0/glTFLoader');(await import('@babylonjs/loaders/glTF/2.0/Extensions/dynamic')).registerBuiltInGLTFExtensions();const {LoadAssetContainerAsync}=await import('@babylonjs/core/Loading/sceneLoader');return LoadAssetContainerAsync(e.file!,scene);})();files.set(e.file,pending);}
        const container=await pending;
        const instance=container.instantiateModelsToScene(n=>id+'-'+n,false,{doNotInstantiate:container.skeletons.length>0});
        const root=new TransformNode(id+'-visual',scene);root.metadata={assetId:id,status:e.status,missingClips:[],missingNodes:[]};
        const adjust=new TransformNode(id+'-axis',scene);adjust.parent=root;adjust.rotation.set(...e.rotation);adjust.scaling.setAll(e.scale);
        for(const node of instance.rootNodes)node.parent=adjust;
        if(part){const names=e.parts?.[part]??[];const keep=adjust.getDescendants(false).find(n=>names.some(name=>n.name===id+'-'+name));
          if(!keep)root.metadata.missingNodes.push('part.'+part);
          // Keep one kit part. Hide mesh ancestors; dispose every other branch.
          else for(const m of adjust.getChildMeshes(false)){if(m===keep||m.isDescendantOf(keep))continue;if(keep.isDescendantOf(m)){m.isVisible=false;continue;}if(!m.isDisposed())m.dispose();}
        }
        adjust.computeWorldMatrix(true);
        const visible=(m:{isVisible:boolean})=>m.isVisible;const bounds=adjust.getHierarchyBoundingVectors(true,visible);const size=bounds.max.subtract(bounds.min);
        if(e.normalize){const s=e.normalize.height?e.normalize.height/size.y:e.normalize.width?e.normalize.width/size.x:1;adjust.scaling.scaleInPlace(s);adjust.computeWorldMatrix(true);const b=adjust.getHierarchyBoundingVectors(true,visible);adjust.position.set(-(b.min.x+b.max.x)/2,e.normalize.ground?-b.min.y:-(b.min.y+b.max.y)/2,-(b.min.z+b.max.z)/2);}
        adjust.position.addInPlace(Vector3.FromArray(e.offset));root.parent=parent??null;
        const sockets=new Map<string,TransformNode>();
        for(const [logical,names]of Object.entries(e.nodes)){
          const found=adjust.getDescendants().find(n=>names.some(name=>n.name===id+'-'+name));
          if(found instanceof TransformNode){sockets.set(logical,found);continue;}
          const bone=instance.skeletons.flatMap(s=>s.bones).find(b=>names.includes(b.name.replace(id+'-','')));
          if(bone){const socket=new TransformNode(logical,scene);const linked=bone.getTransformNode();if(linked)socket.parent=linked;else{const mesh=adjust.getChildMeshes().find(m=>m.skeleton);if(mesh)socket.attachToBone(bone,mesh);}sockets.set(logical,socket);}
          else root.metadata.missingNodes.push(logical);
        }
        for(const node of adjust.getDescendants()){if(e.hideNodes.some(n=>node.name===id+'-'+n)&&node instanceof TransformNode)node.setEnabled(false);}
        const groups=new Map<string,AnimationGroup>();
        for(const [logical,clip]of Object.entries(e.clips)){const group=instance.animationGroups.find(g=>clip.names.some(n=>g.name===id+'-'+n||g.name===n));if(group){group.enableBlending=true;group.blendingSpeed=.15;group.start(true,1);group.setWeightForAllAnimatables(0);groups.set(logical,group);}else root.metadata.missingClips.push(logical);}
        const weights=new Map<AnimationGroup,number>();let started=false;
        const visual:Visual={root,socket:name=>sockets.get(name.replace('socket.',''))??null,animate(clip,speed){const map=e.clips[clip];const actual=groups.has(clip)?clip:map?.fallback??'';const current=groups.get(actual);if(!current)return;current.speedRatio=clip==='idle'?1:Math.max(.1,speed/(e.clips[actual]?.authoredSpeed??1.3));for(const group of new Set(groups.values())){const target=group===current?1:0;const old=weights.get(group)??0;const weight=started?old+(target-old)*.2:target;weights.set(group,weight);group.setWeightForAllAnimatables(weight);}started=true;},dispose(){instance.dispose();root.dispose();}};visual.animate('idle',0);return visual;
      }catch(error){if(!failed.has(id)){console.warn(`Asset ${id} is unavailable. Use placeholder.`,error);failed.add(id);}return placeholder(id,scene,parent);}
    },
  };
}
