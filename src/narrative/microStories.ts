import type {MicroStory, StoryChoice, StoryStep} from '../contracts/story';
import type {ActorId} from '../contracts/state';
import {storyText as t} from '../content/strings.en';

const step = (speaker: ActorId, lines: readonly string[], choices: StoryChoice[] = []): StoryStep => ({speaker, lines: [...lines], choices});
const c = (id: string, label: string): StoryChoice => ({id, label});

/** Stories of the Finance MVP (spec 5.3). Facts and effects live in mvpRules.ts. Every step can be left. */
export const merchantStory: MicroStory = {id: 'merchant', actor: 'merchant', steps: {
  crate: step('merchant', t.merchant.crate.lines, [c('crate-lift', t.merchant.crate.crateLift), c('crate-no', t.merchant.crate.crateNo)]),
  gift: step('merchant', t.merchant.gift.lines, [c('gift-accept', t.merchant.gift.giftAccept), c('gift-decline', t.merchant.gift.giftDecline)]),
  thanks: step('merchant', t.merchant.thanks.lines),
  declined: step('merchant', t.merchant.declined.lines),
}};
const childOffer = (lines: readonly string[], x: typeof t.child.returned) => step('fearChild', lines, [c('child-give', x.childGive), c('child-keep', x.childKeep)]);
export const childStory: MicroStory = {id: 'child', actor: 'fearChild', steps: {
  meet: step('fearChild', t.child.meet.lines, [c('child-search', t.child.meet.childSearch), c('child-listen', t.child.meet.childListen), c('child-walk', t.child.meet.childWalk)]),
  found: step('fearChild', t.child.found.lines, [c('child-return', t.child.found.childReturn)]),
  returned: childOffer(t.child.returned.lines, t.child.returned),
  listen: childOffer(t.child.listen.lines, t.child.returned),
  again: childOffer(t.child.again.lines, t.child.returned),
  given: step('fearChild', t.child.given.lines),
}};
export const darkStory: MicroStory = {id: 'dark', actor: 'darkNpc', steps: {
  meet: step('darkNpc', t.dark.meet.lines, [c('dark-listen', t.dark.meet.darkListen), c('dark-leave', t.dark.meet.darkLeave)]),
  after: step('darkNpc', t.dark.after.lines),
}};
export const giverStory: MicroStory = {id: 'giver', actor: 'giver', steps: {
  meet: step('giver', t.giver.meet.lines, [c('giver-rest', t.giver.meet.giverRest), c('giver-silent', t.giver.meet.giverSilent)]),
  fruit: step('giver', t.giver.fruit.lines, [c('giver-accept', t.giver.fruit.giverAccept), c('giver-decline', t.giver.fruit.giverDecline)]),
  enjoy: step('giver', t.giver.enjoy.lines),
}};
export const receiverStory: MicroStory = {id: 'receiver', actor: 'receiver', steps: {
  meet: step('receiver', t.receiver.meet.lines, [c('receiver-offer', t.receiver.meet.receiverOffer), c('receiver-respect', t.receiver.meet.receiverRespect)]),
  accepted: step('receiver', t.receiver.accepted.lines),
}};
export const guideStory: MicroStory = {id: 'guide', actor: 'guide', steps: {
  meet: step('guide', t.guide.meet.lines, [c('guide-tea', t.guide.meet.guideTea), c('guide-decline', t.guide.meet.guideDecline)]),
  tea: step('guide', t.guide.tea.lines),
  teaOpen: step('guide', t.guide.teaOpen.lines),
  think: step('guide', t.guide.think.lines),
  open: step('guide', t.guide.open.lines),
}};
export const beetleStory: MicroStory = {id: 'beetle', actor: 'beetle', steps: {
  observe: step('player', t.beetle.observe.lines, [c('beetle-letgo', t.beetle.observe.beetleLetgo), c('beetle-stay', t.beetle.observe.beetleStay)]),
  released: step('player', t.beetle.released.lines),
}};
export const finaleStory: MicroStory = {id: 'finale', actor: 'player', steps: {
  end: step('player', t.finale.end.lines, [c('finale-write', t.finale.end.finaleWrite), c('finale-sit', t.finale.end.finaleSit)]),
}};

export const microStories: Readonly<Record<string, MicroStory>> = {
  merchant: merchantStory, child: childStory, dark: darkStory, giver: giverStory, receiver: receiverStory, guide: guideStory, beetle: beetleStory, finale: finaleStory,
};
