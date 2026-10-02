export const strings = {
  title:'Light Within', outer:'The City', inner:'Within',
  receive:'Receive package', look:'Hold to look within', reflect:'Reflect',
  return:'Hold to return', desire:'Look at the shining object',
  question:'What does money mean to you?', wave:'I want more...',
  end:'You have met the beetle. The city has more people to meet, when you wish.',
  welcome:'Follow the path. Take the package at the stone.',
  carrying:'The gate is open. Follow the path to the tree.',
  reflectionHelp:'Your words stay on this device. There is no right answer.',
  save:'Save', skip:'Skip', pause:'Pause', resume:'Resume', newGame:'New Game',
  delete:'Delete reflections', confirmNew:'Start a new game? This removes this saved game.',
  confirmDelete:'Delete your saved words? Your game progress stays.',
  controls:'W A S D: move · Shift: run · E: act or hold · Drag: look · Esc: pause',
  loading:'Loading the world...', bootError:'The world could not start. Reload to try again.',
  act:'Act', run:'Run', cancel:'Cancel', confirm:'Confirm', words:'Your words',
  touchMove:'Move', touchLook:'Drag the view to look', reflectionCount:'characters',
  nextMarket:'Return to the city. Visit the market to the right of the tree.',
  nextInner:'Return to the tree. Look within once more.',
  treeHelp:'Hold E at the light by the tree.',
  innerHelp:'Go to the package by the root. Press Reflect.',
  savedHelp:'Your words are saved. Hold at the light by the trunk to return.',
  skippedHelp:'You can return at the light by the trunk.',
  quality:'View detail', simple:'Simple', full:'Full', high:'High',
  storageNotice:'This device cannot save your game. Keep this tab open.',
  actionKey:'E',
  // Spot prompts (Finance MVP).
  talkMerchant:'Talk to the merchant', crateDrop:'Set the crate down', pickCoin:'Pick up the coin',
  talkChild:'Talk to the child', stayNear:'Stay near the stranger', talkCitizen:'Talk to the citizen',
  openDoor:'Open the door', greetGuide:'Greet the guide', observe:'Hold to observe',
  sitWater:'Hold to sit by the water', reflectEnough:'Reflect on enough',
  leave:'Leave',
  // Reflection prompt.
  enoughQuestion:'What is enough for you?',
  // Soft hints. Never a score, never wrong.
  hintCrate:'Carry the crate to the stall.', hintCoinSearch:'The coin may lie near the old wall in the south-west.',
  hintCoinFound:'Bring the coin back to the child.', hintGift:'The merchant has a small gift. You may take it or not.',
  hintExchangeOpen:'You have given and received. The guide may have more to say.',
  hintService:'Near the market, a merchant could use a hand.',
  hintGive:'In the west, someone sits alone. You may listen, if you wish.',
  hintReceive:'North of the tree, a guide offers tea.',
  hintWithin:'Within, the beetle waits. Look within when you wish.',
  hintReflect:'Within, the package by the root asks a quiet question.',
  hintBeetle:'Stand by the beetle and hold to observe.',
  hintFinale:'The Source Water by the tree is bright. Sit by it, if you wish.',
  hintFinaleInner:'Return to the city. The Source Water by the tree is bright.',
  hintEnough:'Ask yourself what is enough. You may write it down, or not.',
  hintDone:'The water is bright. Stay as long as you like.',
  hintStreet:'The Exchange House waits at the end of this street.',
  innerBack:'Hold at the light by the trunk to return.',
};

/** Names shown above story lines. */
export const speakerLabels = {
  player:'You', merchant:'Merchant', fearChild:'Child', darkNpc:'Stranger', giver:'Citizen', receiver:'Citizen', guide:'Exchange Guide', beetle:'Beetle',
} as const;

/** Thought waves of the Finance MVP (at most 64 characters each). */
export const waveText = {
  child:'What if it is all lost?', dark:'It always goes wrong.', beetle:'I can rest now.', merchant:'That was heavy. Thank you.',
} as const;

/** Story lines and choice labels. Short and kind. Every step can be left. */
export const storyText = {
  merchant:{
    crate:{lines:['This crate is too heavy for one person.','My back says no.'], crateLift:'Lift the other side', crateNo:'Not now'},
    gift:{lines:['Thank you for the help.','Please take a small gift from my stall.'], giftAccept:'Accept with thanks', giftDecline:'Decline kindly'},
    thanks:{lines:['Good. It has found a good home.']},
    declined:{lines:['Of course. No harm done.']},
  },
  child:{
    meet:{lines:['I lost my coin.','Now nothing feels safe.'], childSearch:'Help search', childListen:'Listen', childWalk:'Walk on'},
    found:{lines:['That is my coin! You found it.','May I have it back?'], childReturn:'Hand the coin back'},
    returned:{lines:['Thank you. I can breathe again.','You do not have to give anything.'], childGive:'Give a coin from your package', childKeep:'Keep it'},
    listen:{lines:['It was only a coin.','But it felt like the ground moved.','Thank you for staying.'], childGive:'Give a coin from your package', childKeep:'Keep it'},
    again:{lines:['I still feel a bit shaky.','It helps that you came back.'], childGive:'Give a coin from your package', childKeep:'Keep it'},
    given:{lines:['Thank you. This is kind of you.']},
  },
  dark:{
    meet:{lines:['He keeps his eyes down.','It always goes wrong, he mutters.'], darkListen:'Listen for a while', darkLeave:'Leave him be'},
    after:{lines:['He says little. You stay.','Nothing is fixed. That is fine.']},
  },
  giver:{
    meet:{lines:['Take it, take it. I have more.','I always have more... do I?'], giverRest:'Suggest a rest', giverSilent:'Say nothing'},
    fruit:{lines:['You are right. I will sit.','Giving is easier when I rest too.','Here, a fruit for you.'], giverAccept:'Accept', giverDecline:'Decline'},
    enjoy:{lines:['Sweet, is it not?','Thank you for the pause.']},
  },
  receiver:{
    meet:{lines:['No, thank you. I can manage.','I do not need help.'], receiverOffer:'Offer once more, gently', receiverRespect:'Respect the no'},
    accepted:{lines:['...All right. Thank you.','It is not easy for me to say yes.']},
  },
  guide:{
    meet:{lines:['Welcome. Sit, if you like.','Can both sides leave with dignity?'], guideTea:'Accept the tea', guideDecline:'Decline kindly'},
    tea:{lines:['Warm tea. A small exchange.','Both hands can give. Both can receive.']},
    teaOpen:{lines:['Warm tea. A small exchange.','You have given and received.','The way to the water is open.']},
    think:{lines:['Giving and receiving are two hands.','Take your time.']},
    open:{lines:['You gave. You received.','The water by the tree is bright, if you wish to sit.']},
  },
  beetle:{
    observe:{lines:['The beetle holds on tight.','It is not angry. It is holding.'], beetleLetgo:'Let it go', beetleStay:'Stay a while'},
    released:{lines:['The beetle softens. Its shell glows warm.','The chain hangs loose.']},
  },
  finale:{
    end:{lines:['The water runs clear. The tree glows warm.','The chain is gone. Light drifts upward.'], finaleWrite:'Write what is enough', finaleSit:'Sit a while'},
  },
} as const;
