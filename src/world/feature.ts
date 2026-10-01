import type {WorldFactory} from '../contracts/visual';
import {createOuterWorld} from './outer/feature';
import {createInnerWorld} from './inner/feature';
export function createWorldFactory():WorldFactory{return {create:(world,scene,assets)=>world==='outer'?createOuterWorld(scene,assets):createInnerWorld(scene,assets)};}
