import type {Scene} from '@babylonjs/core/scene';
import {DynamicTexture} from '@babylonjs/core/Materials/Textures/dynamicTexture';
import {Texture} from '@babylonjs/core/Materials/Textures/texture';
import {StandardMaterial} from '@babylonjs/core/Materials/standardMaterial';
import {Color3} from '@babylonjs/core/Maths/math.color';
import type {AbstractMesh} from '@babylonjs/core/Meshes/abstractMesh';

// Code-made painted textures. No files. Seeded, so every reload looks the same (AD-9).
export const canPaint=():boolean=>typeof document!=='undefined'&&typeof document.createElement==='function'&&!!document.createElement('canvas').getContext;
function rng(seed:number){return ()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
type Ctx=CanvasRenderingContext2D;
function make(scene:Scene,name:string,w:number,h:number,draw:(c:Ctx,w:number,h:number)=>void,alpha=false){
  const tex=new DynamicTexture(name,{width:w,height:h},scene,true);const c=tex.getContext() as Ctx;draw(c,w,h);tex.update(true);
  tex.hasAlpha=alpha;tex.anisotropicFilteringLevel=4;return tex;
}
function blob(c:Ctx,x:number,y:number,r:number,color:string,a:number){
  const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,color.replace(/[\d.]+\)$/,'0)'));
  c.globalAlpha=a;c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);c.globalAlpha=1;
}
/** Draw a blob again at the tile edges so the tile repeats without a seam. */
function wrapBlob(c:Ctx,w:number,h:number,x:number,y:number,r:number,color:string,a:number){
  for(const dx of [-w,0,w])for(const dy of [-h,0,h])if(x+dx>-r&&x+dx<w+r&&y+dy>-r&&y+dy<h+r)blob(c,x+dx,y+dy,r,color,a);
}
const rgba=(r:number,g:number,b:number)=>`rgba(${r|0},${g|0},${b|0},1)`;

function grassTile(scene:Scene){
  return make(scene,'paint-grass',512,512,(c,w,h)=>{
    const r=rng(11);c.fillStyle='#8aa35a';c.fillRect(0,0,w,h);
    for(let i=0;i<70;i++)wrapBlob(c,w,h,r()*w,r()*h,40+r()*80,rgba(110+r()*55,140+r()*45,65+r()*35),.35);
    for(let i=0;i<26;i++)wrapBlob(c,w,h,r()*w,r()*h,30+r()*60,rgba(150+r()*40,150+r()*30,70),.18);
    c.lineCap='round';
    for(let i=0;i<900;i++){const x=r()*w,y=r()*h,l=5+r()*9,a=(r()-.5)*.9;c.strokeStyle=r()<.5?'rgba(60,95,40,.35)':'rgba(170,190,95,.30)';c.lineWidth=1.2;
      for(const dx of [-w,0,w]){if(x+dx<-12||x+dx>w+12)continue;c.beginPath();c.moveTo(x+dx,y);c.lineTo(x+dx+Math.sin(a)*l,y-Math.cos(a)*l);c.stroke();}}
    for(let i=0;i<22;i++){const x=r()*w,y=r()*h;c.fillStyle=r()<.5?'rgba(255,236,170,.75)':'rgba(255,255,255,.65)';c.beginPath();c.arc(x,y,1.6+r()*1.2,0,6.3);c.fill();}
  });
}
/** Packed earth. The long edges fade out, so the path melts into the grass. */
function earthStrip(scene:Scene,across:'u'|'v'){
  const w=across==='u'?256:512,h=across==='u'?512:256;
  return make(scene,'paint-earth-'+across,w,h,(c,w,h)=>{
    const r=rng(23);const tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;const t=tmp.getContext('2d') as Ctx;
    t.fillStyle='#c9b184';t.fillRect(0,0,w,h);
    for(let i=0;i<60;i++)wrapBlob(t,w,h,r()*w,r()*h,25+r()*55,rgba(175+r()*45,150+r()*35,100+r()*30),.4);
    for(let i=0;i<14;i++)wrapBlob(t,w,h,r()*w,r()*h,20+r()*40,rgba(130,105,70),.14);
    for(let i=0;i<260;i++){const x=r()*w,y=r()*h;t.fillStyle=r()<.5?'rgba(120,98,70,.45)':'rgba(240,225,185,.5)';t.beginPath();t.ellipse(x,y,1.2+r()*2.4,.9+r()*1.4,r()*3,0,6.3);t.fill();}
    // Two faint wheel tracks along the path.
    t.globalAlpha=.07;t.fillStyle='#7c6244';
    if(across==='u'){t.fillRect(w*.32,0,w*.07,h);t.fillRect(w*.61,0,w*.07,h);}else{t.fillRect(0,h*.32,w,h*.07);t.fillRect(0,h*.61,w,h*.07);}
    t.globalAlpha=1;
    c.drawImage(tmp,0,0);
    // Feather the long edges. destination-in keeps the colour and cuts the alpha.
    const g=across==='u'?c.createLinearGradient(0,0,w,0):c.createLinearGradient(0,0,0,h);
    g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.07,'rgba(0,0,0,.9)');g.addColorStop(.14,'rgba(0,0,0,1)');g.addColorStop(.86,'rgba(0,0,0,1)');g.addColorStop(.93,'rgba(0,0,0,.9)');g.addColorStop(1,'rgba(0,0,0,0)');
    c.globalCompositeOperation='destination-in';c.fillStyle=g;c.fillRect(0,0,w,h);c.globalCompositeOperation='source-over';
  },true);
}
/** Paving for the square: stone rows, a ring and a fading rim. UV 0..1 covers the whole disk. */
function paving(scene:Scene){
  return make(scene,'paint-paving',1024,1024,(c,w,h)=>{
    const r=rng(37);const cx=w/2,cy=h/2,R=w/2;
    c.fillStyle='#b9a98a';c.fillRect(0,0,w,h);
    // Square stone rows, about 1.1 m (37 px at 34 px per m).
    const s=34;
    for(let row=0;row*s<h;row++){const off=(row%2)*s/2;
      for(let x=-s;x<w+s;x+=s){const px=x+off,py=row*s;const k=r();
        c.fillStyle=rgba(176+k*34,158+k*30,125+k*26);c.fillRect(px+1.5,py+1.5,s-3,s-3);
        if(r()<.3)blob(c,px+s/2,py+s/2,s*.7,rgba(120,105,80),.18);
      }}
    
    // Ring of darker stone around the tree and a warm light pool in the centre.
    c.lineWidth=14;c.strokeStyle='rgba(110,92,70,.5)';c.beginPath();c.arc(cx,cy,R*.34,0,6.3);c.stroke();
    c.lineWidth=7;c.strokeStyle='rgba(225,205,160,.45)';c.beginPath();c.arc(cx,cy,R*.62,0,6.3);c.stroke();
    blob(c,cx,cy,R*.5,'rgba(255,230,170,1)',.22);
    for(let i=0;i<50;i++)blob(c,r()*w,r()*h,25+r()*50,rgba(105,90,70),.12);
    // Moss between the stones near the rim, then the soft rim.
    for(let i=0;i<90;i++){const a=r()*6.3,d=R*(.72+r()*.25);blob(c,cx+Math.cos(a)*d,cy+Math.sin(a)*d,14+r()*26,rgba(110,140,70),.28);}
    const g=c.createRadialGradient(cx,cy,R*.7,cx,cy,R);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.7,'rgba(0,0,0,.85)');g.addColorStop(1,'rgba(0,0,0,0)');
    c.globalCompositeOperation='destination-in';c.fillStyle=g;c.fillRect(0,0,w,h);c.globalCompositeOperation='source-over';
  },true);
}
/** Carved inner stone with root seams. Returns the colour and the glow texture. UV 0..1 covers the platform. */
function carvedStone(scene:Scene){
  const draw=(glow:boolean)=>(c:Ctx,w:number,h:number)=>{
    const cx=w/2,cy=h/2,R=w/2;const rr=rng(53);
    if(glow){c.fillStyle='#000';c.fillRect(0,0,w,h);}else{
      c.fillStyle='#5d7683';c.fillRect(0,0,w,h);
      for(let i=0;i<150;i++)blob(c,rr()*w,rr()*h,30+rr()*70,rr()<.5?rgba(110,140,155):rgba(60,82,95),.3);
      // Slabs: rings and radial joints.
      c.strokeStyle='rgba(28,44,56,.7)';c.lineWidth=5;
      for(const k of [.22,.45,.68,.9]){c.beginPath();c.arc(cx,cy,R*k,0,6.3);c.stroke();}
      c.lineWidth=3.5;for(let i=0;i<20;i++){const a=i*Math.PI/10+(i%2)*.04;const from=i%2?.45:.22;c.beginPath();c.moveTo(cx+Math.cos(a)*R*from,cy+Math.sin(a)*R*from);c.lineTo(cx+Math.cos(a)*R*.95,cy+Math.sin(a)*R*.95);c.stroke();}
      for(let i=0;i<1400;i++){c.fillStyle=rr()<.5?'rgba(20,35,45,.22)':'rgba(190,225,235,.14)';c.fillRect(rr()*w,rr()*h,1+rr()*3,1+rr()*3);}
    }
    // Root seams: wandering, forking lines from the middle to the rim.
    const seed=rng(97);
    const root=(x:number,y:number,a:number,len:number,wd:number,depth:number)=>{
      const pts:{x:number;y:number}[]=[{x,y}];
      for(let i=0;i<len;i++){a+=(seed()-.5)*.5;x+=Math.cos(a)*9;y+=Math.sin(a)*9;pts.push({x,y});if(Math.hypot(x-cx,y-cy)>R*.97)break;}
      c.lineCap='round';c.lineJoin='round';
      if(glow){c.strokeStyle='rgba(60,190,255,.12)';c.lineWidth=wd*2.6;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();c.strokeStyle='rgba(130,245,255,1)';c.lineWidth=Math.max(3,wd*.75);}
      else{c.strokeStyle='rgba(36,52,64,.8)';c.lineWidth=wd;}
      c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();
      if(!glow){c.strokeStyle='rgba(140,170,120,.4)';c.lineWidth=Math.max(1,wd*.25);c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x-1,p.y-2):c.moveTo(p.x-1,p.y-2));c.stroke();}
      if(depth>0)for(let i=8;i<pts.length-6;i+=14+((seed()*10)|0))if(seed()<.75)root(pts[i].x,pts[i].y,a+(seed()<.5?-1:1)*(.6+seed()*.7),Math.floor(len*.5),wd*.6,depth-1);
    };
    for(let i=0;i<9;i++)root(cx+Math.cos(i*.7)*R*.1,cy+Math.sin(i*.7)*R*.1,i*Math.PI*2/9+.3,70,9,2);
    const fade=c.createRadialGradient(cx,cy,R*.55,cx,cy,R);
    if(glow){fade.addColorStop(0,'rgba(0,0,0,0)');fade.addColorStop(1,'rgba(0,0,0,.9)');c.fillStyle=fade;c.fillRect(0,0,w,h);}
  };
  return {color:make(scene,'paint-stone',1024,1024,draw(false),false),glow:make(scene,'paint-stone-glow',1024,1024,draw(true),false)};
}
export function dotTexture(scene:Scene,name='paint-dot'){
  return make(scene,name,64,64,c=>{const g=c.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(255,255,255,1)');g.addColorStop(.35,'rgba(255,255,255,.55)');g.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=g;c.fillRect(0,0,64,64);},true);
}
/** clamp names the axis that must not repeat (the feathered edge side). Box top: u runs along z, v along x. */
function textured(scene:Scene,name:string,tex:Texture,u:number,v:number,alpha:boolean,clamp:'u'|'v'|''=''){
  const m=new StandardMaterial(name,scene);m.diffuseTexture=tex;m.specularColor=Color3.Black();
  tex.wrapU=clamp==='u'?Texture.CLAMP_ADDRESSMODE:Texture.WRAP_ADDRESSMODE;tex.wrapV=clamp==='v'?Texture.CLAMP_ADDRESSMODE:Texture.WRAP_ADDRESSMODE;(tex as Texture).uScale=u;(tex as Texture).vScale=v;
  if(alpha){m.useAlphaFromDiffuseTexture=true;m.diffuseTexture.hasAlpha=true;m.backFaceCulling=true;}
  return m;
}
const pick=(scene:Scene,name:string)=>scene.getMeshByName(name) as AbstractMesh|null;
/** Replace the flat colours of the outer ground, path and square with painted textures. Shapes and colliders stay. */
export function paintOuterGround(scene:Scene){
  if(!canPaint())return;
  const ground=pick(scene,'outer-ground'),path=pick(scene,'arrival-path'),market=pick(scene,'market-path'),square=pick(scene,'central-square');
  if(ground){const m=textured(scene,'ground-grass',grassTile(scene),13,12,false);ground.material=m;ground.receiveShadows=true;}
  if(path){const t=earthStrip(scene,'v');const m=textured(scene,'ground-path',t,6,1,true,'v');m.zOffset=-1;path.material=m;path.receiveShadows=true;}
  if(market){const t=earthStrip(scene,'u');const m=textured(scene,'ground-market',t,1,5,true,'u');m.zOffset=-1;market.material=m;market.receiveShadows=true;}
  if(square){const m=textured(scene,'ground-paving',paving(scene),1,1,true,'u');m.zOffset=-2;square.material=m;square.receiveShadows=true;}
}
/** Carved stone with root seams on the inner platform. The seams glow softly. */
export function paintInnerGround(scene:Scene){
  if(!canPaint())return;
  const platform=pick(scene,'inner-platform');if(!platform)return;
  const {color,glow}=carvedStone(scene);
  const m=new StandardMaterial('ground-carved',scene);m.diffuseTexture=color;m.emissiveTexture=glow;glow.level=.85;m.useEmissiveAsIllumination=true;m.specularColor=new Color3(.08,.12,.14);m.specularPower=40;
  platform.material=m;platform.receiveShadows=true;
}
