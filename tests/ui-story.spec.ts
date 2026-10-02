import {describe,it,expect,vi,beforeEach,afterEach} from 'vitest';
import {uiStyles} from '../src/ui/styles';
/** A very small DOM. It is enough for the panel code. innerHTML is forbidden on purpose. */
class El {
  children:El[]=[];parentElement:El|null=null;tag:string;dataset:Record<string,string>={};attrs:Record<string,string>={};
  hidden=false;inert=false;className='';id='';type='';maxLength=0;value='';style={setProperty:()=>undefined,cssText:''};
  private text='';private listeners:Record<string,(e:unknown)=>void>={};
  private classes=new Set<string>();
  classList={toggle:(n:string,on:boolean)=>{if(on)this.classes.add(n);else this.classes.delete(n);},remove:(n:string)=>{this.classes.delete(n);},has:(n:string)=>this.classes.has(n)};
  constructor(tag:string){this.tag=tag;}
  set innerHTML(_:string){throw new Error('innerHTML is not allowed');}
  set textContent(v:string){this.text=v;this.children=[];}
  get textContent():string{return this.text+this.children.map(c=>c.textContent).join('');}
  setAttribute(n:string,v:string){this.attrs[n]=v;}hasAttribute(n:string){return n in this.attrs;}
  addEventListener(n:string,f:(e:unknown)=>void){this.listeners[n]=f;}click(){this.listeners.click?.({});}
  append(...n:El[]){for(const c of n){c.parentElement=this;this.children.push(c);}}
  prepend(...n:El[]){for(const c of n)c.parentElement=this;this.children.unshift(...n);}
  replaceChildren(...n:El[]){this.children=[];this.append(...n);}
  contains(e:El):boolean{return e===this||this.all().includes(e);}remove(){}focus(){doc.activeElement=this;}
  all():El[]{return this.children.flatMap(c=>[c,...c.all()]);}
  querySelectorAll(sel:string){const parts=sel.split(',').map(s=>s.trim());return this.all().filter(e=>parts.some(p=>p.startsWith('[data-')?p.slice(6,-1) in e.dataset:p.startsWith('[')?false:p===e.tag));}
  querySelector(sel:string){return this.querySelectorAll(sel)[0]??null;}
}
const doc={activeElement:null as El|null,createElement:(t:string)=>new El(t),body:new El('body')};
let keydown:(e:Record<string,unknown>)=>void=()=>undefined;
beforeEach(()=>{
  vi.stubGlobal('HTMLElement',El);vi.stubGlobal('document',doc);
  vi.stubGlobal('window',{addEventListener:(n:string,f:typeof keydown)=>{if(n==='keydown')keydown=f;}});
});
afterEach(()=>vi.unstubAllGlobals());
async function make(touch=false) {
  const {createUiService}=await import('../src/ui');
  const root=new El('div');doc.body.append(root);
  const commands={saveReflection:vi.fn(),skipReflection:vi.fn(),deleteReflections:vi.fn(),newGame:vi.fn(),pause:vi.fn(),choose:vi.fn(),leaveStory:vi.fn()};
  const release=vi.fn();const lock=vi.fn(()=>release);
  const ui=createUiService(root as unknown as HTMLElement,commands,{lock,isTouch:()=>touch} as never);
  const panel=()=>root.all().find(e=>e.className==='lw-panel')!;
  const backdrop=()=>root.all().find(e=>e.className==='lw-modal-backdrop')!;
  return {ui,commands,lock,release,panel,backdrop};
}
const view={speaker:'Merchant',lines:['<b>Help</b>','Two','Three','Four'],choices:[{id:'help',label:'Lift <i>it</i>'},{id:'no',label:'Not now'}],leave:'Leave'};
const key=(k:string,extra:Record<string,unknown>={})=>({key:k,code:k==='e'?'KeyE':k==='Escape'?'Escape':`Digit${k}`,repeat:false,preventDefault:()=>undefined,...extra});
describe('story panel',()=>{
  it('shows plain text, at most 3 lines, and locks input',async()=>{
    const t=await make();t.ui.story(view);
    const lines=t.panel().all().filter(e=>e.className==='lw-story-line');
    expect(lines.map(l=>l.textContent)).toEqual(['<b>Help</b>','Two','Three']);
    expect(lines[0].children).toHaveLength(0);
    expect(t.panel().all().find(e=>e.tag==='h1')!.textContent).toBe('Merchant');
    expect(t.panel().attrs.role).toBe('dialog');
    expect(t.lock).toHaveBeenCalledWith('ui-modal');
    expect(t.backdrop().hidden).toBe(false);
    const buttons=t.panel().all().filter(e=>e.tag==='button');
    expect(buttons.map(b=>b.dataset.choice??'leave')).toEqual(['help','no','leave']);
    expect(buttons[0].textContent).toContain('Lift <i>it</i>');
  });
  it('keeps every button at 48 by 48 css pixels',()=>{
    expect(uiStyles).toMatch(/\.lw-ui button\{min-height:48px;min-width:48px/);
  });
  it('chooses with keys 1 to 3 and E, and not on touch buttons without keys',async()=>{
    const t=await make();t.ui.story(view);
    keydown(key('2'));expect(t.commands.choose).toHaveBeenLastCalledWith('no');
    keydown(key('e'));expect(t.commands.choose).toHaveBeenLastCalledWith('help');
    keydown(key('3'));expect(t.commands.choose).toHaveBeenCalledTimes(2);
    t.panel().all().find(e=>e.dataset.choice==='no')!.click();
    expect(t.commands.choose).toHaveBeenLastCalledWith('no');
  });
  it('leaves with Esc and with the button, and releases the lock',async()=>{
    const t=await make();t.ui.story(view);
    keydown(key('Escape'));
    expect(t.commands.leaveStory).toHaveBeenCalledTimes(1);expect(t.backdrop().hidden).toBe(true);expect(t.release).toHaveBeenCalledTimes(1);
    expect(t.commands.pause).not.toHaveBeenCalled();
    t.ui.story(view);t.panel().all().find(e=>e.dataset.leave)!.click();
    expect(t.commands.leaveStory).toHaveBeenCalledTimes(2);
  });
  it('replaces a step in place and closes on null',async()=>{
    const t=await make();t.ui.story(view);t.ui.story({...view,speaker:'Next',lines:['Again'],choices:[]});
    expect(t.panel().all().find(e=>e.tag==='h1')!.textContent).toBe('Next');
    expect(t.lock).toHaveBeenCalledTimes(1);
    t.ui.story(null);expect(t.backdrop().hidden).toBe(true);expect(t.commands.leaveStory).not.toHaveBeenCalled();
    keydown(key('1'));expect(t.commands.choose).not.toHaveBeenCalled();
  });
  it('uses the reflection question when given',async()=>{
    const t=await make();t.ui.reflection('', 'What is enough for you?');
    expect(t.panel().all().find(e=>e.tag==='h1')!.textContent).toBe('What is enough for you?');
  });
});
