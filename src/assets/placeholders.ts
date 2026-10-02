import type {Scene} from '@babylonjs/core/scene';
import {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import {Mesh} from '@babylonjs/core/Meshes/mesh';
import {CreateBox} from '@babylonjs/core/Meshes/Builders/boxBuilder';
import {CreateSphere} from '@babylonjs/core/Meshes/Builders/sphereBuilder';
import {CreateCylinder} from '@babylonjs/core/Meshes/Builders/cylinderBuilder';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import type {AssetId,Visual} from '../contracts/visual';

const materialCache=new WeakMap<Scene,Map<string,StandardMaterial>>();
export function material(scene:Scene,color:string,emission=0):StandardMaterial {
  let cache=materialCache.get(scene);if(!cache){cache=new Map();materialCache.set(scene,cache);}
  const key=color+emission;let m=cache.get(key);
  if(!m){m=new StandardMaterial(key,scene);m.diffuseColor=Color3.FromHexString(color);m.specularColor=Color3.Black();m.emissiveColor=m.diffuseColor.scale(emission);cache.set(key,m);}return m;
}
export function placeholder(id:AssetId,scene:Scene,parent?:TransformNode):Visual {
  const root=new TransformNode(id+'-placeholder',scene);root.parent=parent??null;
  root.metadata={assetId:id,status:'placeholder'};
  const parts:Mesh[]=[];
  const box=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,c:string)=>{
    const m=CreateBox(name,{width:w,height:h,depth:d},scene);m.position.set(x,y,z);m.material=material(scene,c);parts.push(m);return m;
  };
  const ball=(name:string,x:number,y:number,z:number,w:number,h:number,d:number,c:string)=>{
    const m=CreateSphere(name,{diameter:1,segments:6},scene);m.scaling.set(w,h,d);m.position.set(x,y,z);m.material=material(scene,c);parts.push(m);return m;
  };
  const trunk=(name:string,x:number,y:number,z:number,h:number,diameter:number,c:string)=>{
    const m=CreateCylinder(name,{height:h,diameterTop:diameter*.7,diameterBottom:diameter,tessellation:7},scene);m.position.set(x,y,z);m.material=material(scene,c);parts.push(m);return m;
  };
  const sockets=new Map<string,TransformNode>();
  if(id==='Player'||id==='Merchant'||id==='Citizen'||id==='CitizenMale'||id==='FearChild'||id==='DarkNpc'||id==='ExchangeGuide'){
    box('tunic',0,.95,0,.5,.7,.3,id==='Merchant'?'#BD7556':'#E8DFC8');
    ball('head',0,1.5,0,.34,.39,.34,'#D7A27F');ball('hair',0,1.65,-.05,.36,.22,.32,'#4A3027');
    for(const s of [-1,1]){box('leg',s*.13,.36,0,.18,.68,.21,'#354F65');box('arm',s*.36,.94,0,.15,.62,.15,'#D7A27F');box('boot',s*.13,.08,.08,.21,.16,.34,'#60402F');}
    box('pack',0,1,-.26,.4,.5,.22,'#875B34');
    for(const [name,x] of [['handR',-.36],['handL',.36]] as const){const node=new TransformNode(name,scene);node.parent=root;node.position.set(x,.66,.05);sockets.set(name,node);}
  }else if(id==='CentralTreeOuter'||id==='CentralTreeInner'){
    const k=id==='CentralTreeInner'?1.5:1;trunk('trunk',0,4*k,0,8*k,1.9*k,'#805D3C');
    for(let i=0;i<7;i++){const a=i*Math.PI*2/7;const branch=trunk('branch',Math.cos(a)*2*k,6.8*k,Math.sin(a)*2*k,4*k,.65*k,'#805D3C');branch.rotation.z=Math.cos(a)*.7;branch.rotation.x=Math.sin(a)*.7;ball('crown',Math.cos(a)*3.4*k,9*k+(i%2)*k,Math.sin(a)*3.4*k,7*k,3.3*k,6*k,i%2?'#6E9249':'#9CA754');}
    for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const r=box('root',Math.cos(a)*2.3,.13,Math.sin(a)*2.3,4.5,.26,.6,'#805D3C');r.rotation.y=-a;}
  }else if(id==='FinancePackage'){
    box('packageBody',0,.02,0,.46,.38,.32,'#B7844F');box('straps',0,.02,-.17,.07,.4,.015,'#66472E');ball('symbol',0,.03,-.181,.11,.11,.035,'#F5CD73');
  }else if(id==='AttachmentBeetle'){
    ball('body',0,.46,0,1.5,.8,1.75,'#243D53');ball('head',0,.33,.88,.7,.53,.65,'#243D53');
    for(const s of [-1,1]){for(let i=0;i<3;i++){const leg=box('legs',s*.8,.22,-.55+i*.5,.8,.08,.08,'#CB9441');leg.rotation.z=s*.3;}ball('eye',s*.18,.44,1.13,.11,.11,.08,'#FFD582');}box('shellLine',0,.76,0,.05,.04,1.4,'#DCA44C');
  }else if(id==='MarketStallA'||id==='MarketStallB'){
    box('counter',0,.65,0,3,1.3,1,'#9F774F');box('canopy',0,2.35,0,3.7,.16,2.5,id==='MarketStallA'?'#CB776B':'#759DA2');for(const s of [-1,1]) box('post',s*1.55,1.2,0,.13,2.4,.13,'#634D38');
  }else if(id==='CityGate'){
    for(const s of [-1,1]){box('gateTower',s*3.6,3,0,3.2,6,3,'#B2A083');box('cap',s*3.6,6.2,0,3.5,.5,3.3,'#C5B693');}box('lintel',0,5.15,0,4,1.3,2.7,'#B2A083');
  }else if(id==='CityBuilding'||id==='ExchangeHouse'){
    box('house',0,2.5,0,5,5,4,'#D4B993');trunk('roof',0,5.5,0,1.2,6.5,'#A16B59');
  }else if(id==='CityWall'){box('wall',0,1.6,0,4,3.2,.6,'#B2A083');
  }else if(id==='Crystal'){trunk('crystal',0,.6,0,1.2,.6,'#78BAC0');
  }else if(id==='Vegetation'){ball('bush',0,.35,0,1,.7,1,'#6D8650');
  }else if(id==='InnerPlatform'){trunk('platform',0,-.45,0,.9,4,'#617986');
  }else if(id==='MarketProps'){box('crate',0,.25,0,.5,.5,.5,'#9F774F');
  }else if(id==='Rock'){ball('rock',0,.45,0,1.4,.9,1.1,'#657D86');
  }else {box('link',0,0,0,.1,.1,.25,'#BA9A63');}
  // Join each color into one mesh. Keep material count low on small devices.
  const groups=new Map<StandardMaterial,Mesh[]>();for(const p of parts){const mat=p.material as StandardMaterial;const list=groups.get(mat)??[];list.push(p);groups.set(mat,list);}
  for(const [mat,list]of groups){const merged=Mesh.MergeMeshes(list,true,true,undefined,false,false);if(merged){merged.parent=root;merged.material=mat;merged.isPickable=false;}}
  let phase=0;const baseY=root.position.y;
  return {root,animate(clip,speed){phase+=.016*Math.max(1,speed);root.position.y=baseY+(clip==='idle'?0:Math.abs(Math.sin(phase*7))*.025);},socket(name){return sockets.get(name.replace('socket.',''))??null;},dispose(){root.dispose();}};
}
