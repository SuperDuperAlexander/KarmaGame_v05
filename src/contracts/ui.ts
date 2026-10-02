export interface UiCommands {saveReflection(text:string):void;skipReflection():void;deleteReflections():void;newGame():void;pause(paused:boolean):void;
  /** A story choice button was pressed. */
  choose(choiceId:string):void;
  /** The player left the story panel. Leaving is always allowed and never punished. */
  leaveStory():void}
/** Plain text only. The UI sets textContent. */
export interface StoryView {speaker:string;lines:string[];choices:{id:string;label:string}[];leave:string}
export interface UiService {
  prompt(text:string|null,hold?:boolean):void;hold(progress:number):void;
  reflection(text:string,question?:string):void;closeReflection():void;loading(visible:boolean,text?:string):void;
  story(view:StoryView|null):void;
  hint(text:string):void;world(name:string):void;dispose():void;
}
