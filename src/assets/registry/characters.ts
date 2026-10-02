import {entry} from './entry';
const SHARED_CLIPS={idle:{names:['Idle']},walk:{names:['Walk'],authoredSpeed:2.8},run:{names:['Run'],fallback:'walk',authoredSpeed:4.6}};
const SHARED_NODES={handR:['rightHandGrip','RightHand'],handL:['leftHandGrip','LeftHand']};
export const characters = {
  Player:entry('Player',{status:'temporary',file:'/assets/characters/player_rigged_v2.glb',normalize:{height:1.7,ground:true},rotation:[0,0,0],clips:{idle:{names:['Idle']},walk:{names:['Walk'],authoredSpeed:2.8},run:{names:['Run'],fallback:'walk',authoredSpeed:4.6}},nodes:{handR:['rightHandGrip','RightHand'],handL:['leftHandGrip','LeftHand']},collision:{radius:.32,height:1.65},notes:['Local 17-bone v2 rig with five clips and two grips. Fast steps need a human bend check. Geometry exceeds the final person target.']}),
  Merchant:entry('Merchant',{status:'temporary',file:'/assets/characters/merchant_rigged.glb',normalize:{height:1.75,ground:true},clips:SHARED_CLIPS,nodes:SHARED_NODES,notes:['Shared 17-bone rig and five clips from WP-34. Bends need a human check.']}),
  Citizen:entry('Citizen',{status:'temporary',file:'/assets/characters/citizen_female_rigged.glb',normalize:{height:1.68,ground:true},clips:SHARED_CLIPS,nodes:SHARED_NODES,notes:['Shared 17-bone rig and five clips from WP-34. Bends need a human check.']}),
  CitizenMale:entry('CitizenMale',{status:'temporary',file:'/assets/characters/citizen_male_rigged.glb',normalize:{height:1.78,ground:true},clips:SHARED_CLIPS,nodes:SHARED_NODES,notes:['Shared 17-bone rig and five clips from WP-34. Bends need a human check.']}),
  FearChild:entry('FearChild',{status:'temporary',file:'/assets/characters/fear_child_rigged.glb',normalize:{height:1.25,ground:true},clips:SHARED_CLIPS,nodes:SHARED_NODES,notes:['Shared 17-bone rig and five clips from WP-34. Bends need a human check.']}),
  DarkNpc:entry('DarkNpc',{status:'temporary',file:'/assets/characters/dark_npc_rigged.glb',normalize:{height:1.82,ground:true},clips:SHARED_CLIPS,nodes:SHARED_NODES,notes:['Shared 17-bone rig and five clips from WP-34. Bends need a human check.']}),
  ExchangeGuide:entry('ExchangeGuide',{status:'temporary',file:'/assets/characters/exchange_guide_rigged.glb',normalize:{height:1.76,ground:true},clips:SHARED_CLIPS,nodes:SHARED_NODES,notes:['Shared 17-bone rig and five clips from WP-34. Bends need a human check.']}),
};
