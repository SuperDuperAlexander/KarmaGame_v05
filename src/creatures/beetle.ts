import type {TransformNode} from '@babylonjs/core/Meshes/transformNode';
import type {WorldState} from '../contracts/state';
export function beetleMotion(root:TransformNode){let t=0;return (state:Readonly<WorldState>,dt:number)=>{const seen=state.facts.includes('ATTACHMENT_SEEN');root.setEnabled(seen);root.metadata={...root.metadata,state:seen?'attached':'hidden'};if(seen){t+=dt;root.rotation.y=Math.sin(t*1.2)*.05;}};}
