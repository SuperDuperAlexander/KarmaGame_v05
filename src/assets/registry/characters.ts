import {entry} from './entry';
export const characters = {
  Player:entry('Player',{status:'temporary',file:'/assets/characters/player_rigged_v2.glb',normalize:{height:1.7,ground:true},rotation:[0,0,0],clips:{idle:{names:['Idle']},walk:{names:['Walk'],authoredSpeed:2.8},run:{names:['Run'],fallback:'walk',authoredSpeed:4.6}},nodes:{handR:['rightHandGrip','RightHand'],handL:['leftHandGrip','LeftHand']},collision:{radius:.32,height:1.65},notes:['Local 17-bone v2 rig with five clips and two grips. Fast steps need a human bend check. Geometry exceeds the final person target.']}),
  Merchant:entry('Merchant',{status:'temporary',file:'/assets/characters/merchant.glb',normalize:{height:1.7,ground:true},rotation:[0,Math.PI,0],notes:['Static temporary mesh. Code idle sway. No claimed action clips.']}),
  Citizen:entry('Citizen',{status:'temporary',file:'/assets/characters/citizen_female.glb',normalize:{height:1.65,ground:true},rotation:[0,Math.PI,0],notes:['Static temporary mesh. Code idle sway. Rig comes later.']}),
  CitizenMale:entry('CitizenMale',{status:'temporary',file:'/assets/characters/citizen_male.glb',normalize:{height:1.75,ground:true},rotation:[0,Math.PI,0],notes:['Static temporary mesh. Code idle sway. Rig comes later.']}),
  FearChild:entry('FearChild'),DarkNpc:entry('DarkNpc'),ExchangeGuide:entry('ExchangeGuide'),
};
