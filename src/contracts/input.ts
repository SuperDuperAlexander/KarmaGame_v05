export interface InputFrame {x:number;z:number;run:boolean;pressed:boolean;held:boolean;lookX:number;lookY:number;zoom:number}
export interface InputService {read():InputFrame;lock(reason:string):()=>void;dispose():void;isTouch():boolean}
