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
/** Paving for the square: irregular stones in warm colours, a worn centre, dirt and moss at the rim. UV 0..1 covers the whole disk. */
function paving(scene:Scene){
  return make(scene,'paint-paving',1024,1024,(c,w,h)=>{
    const r=rng(37);const cx=w/2,cy=h/2,R=w/2;
    c.fillStyle='#8f7c5c';c.fillRect(0,0,w,h);
    // Stones: rows of changing height, stones of changing width, each with its own warm or cool tone and a soft bevel.
    const tones:[number,number,number][]=[[214,192,152],[204,170,120],[210,166,138],[188,182,168],[222,200,160],[196,160,112]];
    let py=0;
    while(py<h){
      const rowH=26+r()*22;let px=-r()*40;
      while(px<w){
        const sw=30+r()*38;const t=tones[(r()*tones.length)|0];const k=.86+r()*.3;
        const x=px+1.3,y=py+1.3,ww=sw-2.6,hh=rowH-2.6;
        c.fillStyle=rgba(t[0]*k,t[1]*k,t[2]*k);c.fillRect(x,y,ww,hh);
        c.fillStyle='rgba(255,245,215,.22)';c.fillRect(x,y,ww,2);c.fillRect(x,y,2,hh);
        c.fillStyle='rgba(70,50,30,.2)';c.fillRect(x,y+hh-2.4,ww,2.4);c.fillRect(x+ww-2.4,y,2.4,hh);
        if(r()<.3)blob(c,x+ww/2,y+hh/2,Math.max(ww,hh)*.7,rgba(110,92,66),.2);
        if(r()<.08){c.strokeStyle='rgba(80,60,40,.35)';c.lineWidth=1;c.beginPath();c.moveTo(x+ww*r(),y);c.lineTo(x+ww*r(),y+hh);c.stroke();}
        px+=sw;
      }
      py+=rowH;
    }
    // Soft colour patches break the repeat of the stones.
    for(let i=0;i<34;i++){const a=r()*6.3,d=Math.sqrt(r())*R;const col=[rgba(214,128,80),rgba(235,190,90),rgba(120,150,170),rgba(150,120,90)][(r()*4)|0];blob(c,cx+Math.cos(a)*d,cy+Math.sin(a)*d,50+r()*110,col,.1+r()*.12);}
    // Rings around the tree and a warm, worn centre.
    c.lineWidth=14;c.strokeStyle='rgba(112,86,60,.55)';c.beginPath();c.arc(cx,cy,R*.34,0,6.3);c.stroke();
    c.lineWidth=7;c.strokeStyle='rgba(240,214,150,.5)';c.beginPath();c.arc(cx,cy,R*.62,0,6.3);c.stroke();
    blob(c,cx,cy,R*.55,'rgba(255,226,160,1)',.3);blob(c,cx,cy,R*.22,'rgba(255,240,200,1)',.25);
    // Walk lines from the gate (south, down in the texture) and to the market (east) are worn paler.
    for(const [dx,dy,len] of [[0,1,R],[1,0,R]] as const){
      const steps=26;for(let i=0;i<steps;i++){const d=(i/steps)*len;blob(c,cx+dx*d,cy+dy*d,46+r()*10,'rgba(236,214,164,1)',.2);}
    }
    // Dirt and moss near the rim.
    for(let i=0;i<130;i++){const a=r()*6.3,d=R*(.7+r()*.3);blob(c,cx+Math.cos(a)*d,cy+Math.sin(a)*d,18+r()*40,r()<.55?rgba(120,96,66):rgba(112,142,66),.22+r()*.2);}
    for(let i=0;i<40;i++)blob(c,r()*w,r()*h,25+r()*50,rgba(105,90,70),.1);
    const g=c.createRadialGradient(cx,cy,R*.72,cx,cy,R);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.7,'rgba(0,0,0,.85)');g.addColorStop(1,'rgba(0,0,0,0)');
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

// ---- WP-40 outer look: sky clouds, far backdrop, grass tufts, banner cloth ----
/** Soft clouds for the outer sky dome. 1024x256. The left edge matches the right edge. Canvas top = high in the sky. */
export function skyClouds(scene:Scene){
  const tex=make(scene,'paint-sky-clouds',1024,256,(c,w,h)=>{
    const r=rng(71);c.clearRect(0,0,w,h);
    const puff=(x:number,y:number,rx:number,ry:number,color:string,a:number)=>{
      for(const dx of [-w,0,w]){if(x+dx<-rx||x+dx>w+rx)continue;c.save();c.translate(x+dx,y);c.scale(rx/ry,1);blob(c,0,0,ry,color,a);c.restore();}
    };
    // y runs top (high) to bottom (horizon). Clouds sit in the lower two thirds and stretch along the horizon.
    for(let i=0;i<26;i++){
      const cx=r()*w,cy=h*(.3+r()*.62),size=34+r()*62,low=cy/h;
      for(let j=0;j<7;j++){
        const ox=(r()-.5)*size*3.2,oy=(r()-.5)*size*.35;
        puff(cx+ox,cy+oy+size*.22,size*1.8,size*.5,low>.6?'rgba(255,170,110,1)':'rgba(255,200,170,1)',.5);
        puff(cx+ox,cy+oy,size*1.5,size*.55,low>.6?'rgba(255,232,196,1)':'rgba(255,250,240,1)',.9);
        puff(cx+ox-size*.2,cy+oy-size*.2,size*.9,size*.32,'rgba(255,255,252,1)',.55);
      }
    }
  },true);
  tex.wrapU=Texture.WRAP_ADDRESSMODE;tex.wrapV=Texture.CLAMP_ADDRESSMODE;return tex;
}
/** Far hills, mountains and towers as one strip for a ring behind the city. 1024x256, repeats twice around. */
export function backdropStrip(scene:Scene){
  const tex=make(scene,'paint-backdrop',1024,256,(c,w,h)=>{
    const r=rng(83);c.clearRect(0,0,w,h);
    const ridge=(base:number,amp:number,seed:number,color:string,haze:string)=>{
      const q=rng(seed);const ph=[q()*6.3,q()*6.3,q()*6.3,q()*6.3];
      const y=(x:number)=>base-amp*(.5+.5*Math.sin(x/w*6.283*3+ph[0])*.5+.25*Math.sin(x/w*6.283*7+ph[1])+.15*Math.sin(x/w*6.283*17+ph[2])+.1*Math.sin(x/w*6.283*31+ph[3]));
      const g=c.createLinearGradient(0,base-amp*1.4,0,h);g.addColorStop(0,color);g.addColorStop(1,haze);
      c.fillStyle=g;c.beginPath();c.moveTo(0,h);for(let x=0;x<=w;x+=4)c.lineTo(x,y(x));c.lineTo(w,h);c.closePath();c.fill();
      return y;
    };
    // Far mountains are warm violet in the golden haze.
    ridge(h*.55,h*.34,3,'rgb(150,150,196)','rgb(222,200,180)');
    const mid=ridge(h*.66,h*.18,5,'rgb(128,140,150)','rgb(200,188,150)');
    // Towers and a castle on the middle hills. Each cluster is a silhouette with a few lit windows.
    const tower=(x:number,w0:number,hh:number,roof:number,col:string)=>{
      const base=mid(x);c.fillStyle=col;c.fillRect(x-w0/2,base-hh,w0,hh+6);
      c.beginPath();c.moveTo(x-w0/2-1.5,base-hh);c.lineTo(x,base-hh-roof);c.lineTo(x+w0/2+1.5,base-hh);c.closePath();c.fill();
      if(hh>16&&r()<.9){c.fillStyle='rgba(255,214,120,.95)';c.fillRect(x-1,base-hh*.6,2,3);}
    };
    for(const [cx,scale] of [[250,1],[760,.8]] as const){
      const col='rgb(112,112,128)';
      tower(cx,13*scale,46*scale,24*scale,col);tower(cx-20*scale,9*scale,30*scale,16*scale,col);tower(cx+20*scale,9*scale,34*scale,18*scale,col);
      tower(cx-36*scale,7*scale,20*scale,12*scale,col);tower(cx+38*scale,7*scale,24*scale,14*scale,col);
      const base=mid(cx);c.fillStyle=col;c.fillRect(cx-30*scale,base-14*scale,60*scale,20*scale);
      for(let i=-4;i<=4;i++)c.fillRect(cx+i*7*scale-2,base-18*scale,4,4);
    }
    // A far town: many small roofs along the hills.
    for(let x=470;x<640;x+=11+r()*7)tower(x,8+r()*5,8+r()*10,5+r()*5,'rgb(150,126,128)');
    for(let x=880;x<1000;x+=12+r()*8)tower(x,8+r()*4,7+r()*9,5+r()*4,'rgb(150,126,128)');
    ridge(h*.78,h*.12,9,'rgb(122,140,92)','rgb(186,176,112)');
    // Fade the top edge so peaks sit softly in the sky.
    const g=c.createLinearGradient(0,0,0,h*.2);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,1)');
    c.globalCompositeOperation='destination-in';c.fillStyle=g;c.fillRect(0,0,w,h);c.globalCompositeOperation='source-over';
  },true);
  tex.wrapU=Texture.WRAP_ADDRESSMODE;tex.wrapV=Texture.CLAMP_ADDRESSMODE;return tex;
}
/** Crossed-quad grass tuft. With flowers, a few blossoms sit on top. 128x128, transparent. */
export function tuftTexture(scene:Scene,flowers:boolean){
  return make(scene,flowers?'paint-tuft-flowers':'paint-tuft-grass',128,128,(c,w,h)=>{
    const r=rng(flowers?91:89);c.clearRect(0,0,w,h);c.lineCap='round';
    const blades=flowers?16:30;
    for(let i=0;i<blades;i++){
      const x=w*(.18+r()*.64),tip=h*(.1+r()*.45),lean=(r()-.5)*34,l=1.8+r()*2.2;
      const g=c.createLinearGradient(0,h,0,tip);g.addColorStop(0,rgba(46+r()*20,98+r()*30,30+r()*20));g.addColorStop(.7,rgba(110+r()*40,160+r()*30,50+r()*20));g.addColorStop(1,rgba(224,214,110));
      c.strokeStyle=g;c.lineWidth=l;c.beginPath();c.moveTo(x,h);c.quadraticCurveTo(x+lean*.2,h*.55,x+lean,tip);c.stroke();
    }
    if(flowers){
      const cols=['rgb(246,110,150)','rgb(255,206,70)','rgb(252,250,240)','rgb(170,120,230)','rgb(255,140,70)'];
      for(let i=0;i<7;i++){
        const x=w*(.2+r()*.6),y=h*(.12+r()*.4);c.strokeStyle='rgb(70,130,40)';c.lineWidth=1.6;c.beginPath();c.moveTo(x,h);c.lineTo(x,y);c.stroke();
        c.fillStyle=cols[(r()*cols.length)|0];for(let p=0;p<5;p++){const a=p*1.257;c.beginPath();c.arc(x+Math.cos(a)*3.4,y+Math.sin(a)*3.4,3,0,6.3);c.fill();}
        c.fillStyle='rgb(255,236,140)';c.beginPath();c.arc(x,y,2,0,6.3);c.fill();
      }
    }
  },true);
}
/** Cloth for banners and stall awnings: a strong colour, a gold border and a simple sign. 128x256. */
export function clothTexture(scene:Scene,name:string,main:string,trim:string,sign:'sun'|'tree'|'stripe'){
  return make(scene,name,128,256,(c,w,h)=>{
    c.fillStyle=main;c.fillRect(0,0,w,h);
    for(let i=0;i<w;i+=6){c.fillStyle='rgba(255,255,255,.05)';c.fillRect(i,0,3,h);}
    blob(c,w/2,h*.45,w*.7,'rgba(255,255,255,1)',.12);
    c.strokeStyle=trim;c.lineWidth=7;c.strokeRect(5,5,w-10,h-10);c.lineWidth=2;c.strokeRect(14,14,w-28,h-28);
    c.fillStyle=trim;
    if(sign==='sun'){c.beginPath();c.arc(w/2,h*.42,22,0,6.3);c.fill();for(let i=0;i<12;i++){const a=i*Math.PI/6;c.beginPath();c.moveTo(w/2+Math.cos(a-.1)*28,h*.42+Math.sin(a-.1)*28);c.lineTo(w/2+Math.cos(a)*42,h*.42+Math.sin(a)*42);c.lineTo(w/2+Math.cos(a+.1)*28,h*.42+Math.sin(a+.1)*28);c.fill();}}
    else if(sign==='tree'){c.fillRect(w/2-4,h*.5,8,h*.2);for(const [dx,dy,rr] of [[0,.34,26],[-18,.42,18],[18,.42,18]] as const){c.beginPath();c.arc(w/2+dx,h*dy,rr,0,6.3);c.fill();}}
    else for(let i=0;i<5;i++)c.fillRect(20,50+i*34,w-40,12);
    // Two swallow-tail points at the bottom are cut by alpha.
    c.globalCompositeOperation='destination-out';c.beginPath();c.moveTo(w/2-30,h);c.lineTo(w/2,h-34);c.lineTo(w/2+30,h);c.closePath();c.fill();c.globalCompositeOperation='source-over';
  },true);
}
