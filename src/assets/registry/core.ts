import {entry} from './entry';
// Package and chain appear in both worlds.
export const core = {
  FinancePackage:entry('FinancePackage',{status:'temporary',file:'/assets/core/finance_package.glb',normalize:{width:.46,ground:false},rotation:[0,Math.PI/2,0],offset:[0,.188,0],nodes:{chain:['chainAnchor'],grip:['packageGrip']}}),
  ChainLink:entry('ChainLink',{status:'temporary',file:'/assets/core/package_chain.glb',scale:.24,rotation:[Math.PI/2,0,0],nodes:{start:['linkStart'],end:['linkEnd']},notes:['Temporary link has wrong axes and sockets. Runtime chain uses one merged code mesh.']}),
};
