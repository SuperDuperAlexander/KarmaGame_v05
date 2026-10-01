export interface UiCommands {saveReflection(text:string):void;skipReflection():void;deleteReflections():void;newGame():void;pause(paused:boolean):void}
export interface UiService {
  prompt(text:string|null,hold?:boolean):void;hold(progress:number):void;
  reflection(text:string):void;closeReflection():void;loading(visible:boolean,text?:string):void;
  hint(text:string):void;world(name:string):void;dispose():void;
}
