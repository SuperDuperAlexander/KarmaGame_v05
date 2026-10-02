import {entry} from './entry';
// Package and chain appear in both worlds.
// Chain link (measured 2026-10-02): flat oval ring, long side on Y (0.64 m), width on X (0.44 m), thin on Z (0.12 m), centred on 0.
// linkStart/linkEnd sit on Z -0.06/+0.06 (the ring faces), so they are not the chain ends. The world code uses the long Y axis.
export const core = {
  FinancePackage:entry('FinancePackage',{status:'temporary',file:'/assets/core/finance_package.glb',normalize:{width:.46,ground:false},rotation:[0,Math.PI/2,0],offset:[0,.188,0],nodes:{chain:['chainAnchor'],grip:['packageGrip']}}),
  ChainLink:entry('ChainLink',{status:'temporary',file:'/assets/core/package_chain.glb',scale:.55,nodes:{start:['linkStart'],end:['linkEnd']},notes:['One link, 1,500 triangles. Long axis is Y. The inner chain places links as instances, turned 90 degrees on every second link.']}),
};
