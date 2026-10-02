import type {ActAction,ActorId,Effect} from '../contracts/state';
import type {MicroStory} from '../contracts/story';
import type {StoryView,UiService} from '../contracts/ui';
import type {WorldView} from '../contracts/visual';
import type {Vector3} from '@babylonjs/core/Maths/math.vector';

/** Build the panel view for one story step. Null for an unknown step. Max 3 lines. */
export function buildStoryView(stories:Readonly<Record<string,MicroStory>>,names:Readonly<Record<string,string>>,id:string,step:string,leave:string):StoryView|null {
  const data=stories[id]?.steps[step];
  if(!data)return null;
  return {speaker:names[data.speaker]??data.speaker,lines:data.lines.slice(0,3),choices:data.choices.slice(0,3).map(choice=>({id:choice.id,label:choice.label})),leave};
}
/** Where a thought wave starts: the actor if this world has it, else the player. */
export function wavePosition(world:Pick<WorldView,'actorPosition'>,actor:ActorId|undefined,player:Vector3):Vector3 {
  return (actor?world.actorPosition?.(actor):null)??player;
}
export interface StoryEffectContext {ui:Pick<UiService,'story'|'prompt'|'hold'>;world:Pick<WorldView,'act'>;stories:Readonly<Record<string,MicroStory>>;names:Readonly<Record<string,string>>;leave:string;
  /** Called with the open story id, or null when the panel closes. */
  opened(id:string|null):void}
/** Runs the story, story-end and act effects. Returns true when the effect was one of them. */
export function runStoryEffect(effect:Effect,context:StoryEffectContext):boolean {
  if(effect.kind==='story') {
    const view=buildStoryView(context.stories,context.names,effect.story,effect.step,context.leave);
    if(!view){console.warn('Unknown story step',effect.story,effect.step);return true;}
    context.opened(effect.story);context.ui.prompt(null);context.ui.hold(0);context.ui.story(view);return true;
  }
  if(effect.kind==='story-end') {context.opened(null);context.ui.story(null);return true;}
  if(effect.kind==='act') {context.world.act?.(effect.actor as ActorId,effect.action as ActAction);return true;}
  return false;
}
