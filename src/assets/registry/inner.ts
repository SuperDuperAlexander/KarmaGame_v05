import {entry} from './entry';
// Inner world files. Measured 2026-10-02 (units are metres, Y up, no rig, one material each).
// Tree: 25 x 30 m, base on Y 0, attachment roots on +X, fear roots on -X, root_center on +Z.
// Beetle: body 0.88 x 0.66 x 1.0 m (X, Y, Z), ground on Y 0, long side on Z.
// Kits: parts sit in a row along X (each mesh has its own X offset). The world code resets that offset.
const kit=(names:string[])=>Object.fromEntries(names.map(n=>[n.replace(/^(platform|rock|crystal)_/,''),[n]]));
export const inner = {
  CentralTreeInner:entry('CentralTreeInner',{status:'temporary',file:'/assets/core/central_tree_inner.glb',
    nodes:{rootAttachment:['root_attachment_main','root_attachment_secondary'],rootFear:['root_fear_main','root_fear_secondary'],rootCenter:['root_center'],trunk:['trunk']},
    notes:['Temporary art. One material for all nodes: the world code clones it for attachment and fear roots.']}),
  AttachmentBeetle:entry('AttachmentBeetle',{status:'temporary',file:'/assets/creatures/attachment_beetle.glb',scale:1.2,
    collision:{radius:.6,height:.8},notes:['Temporary art. One mesh, no rig, no clips. Code drives glow, breath and tension (spec 18.8).']}),
  InnerPlatform:entry('InnerPlatform',{status:'temporary',file:'/assets/inner_world/inner_platform_kit.glb',parts:kit(['platform_small','platform_medium','platform_large','platform_long','platform_round','platform_bridge']),notes:['Temporary kit. Top face on Y 0, rock hangs below.']}),
  Rock:entry('Rock',{status:'temporary',file:'/assets/inner_world/inner_rock_kit.glb',parts:{...kit(['rock_small_A','rock_small_B','rock_medium_A','rock_medium_B','rock_large','rock_arch','stalagmite','cliff_wall'])},notes:['Temporary kit. Part keys: small_A, small_B, medium_A, medium_B, large, arch, stalagmite, cliff_wall.']}),
  Crystal:entry('Crystal',{status:'temporary',file:'/assets/inner_world/inner_crystal_kit.glb',parts:kit(['crystal_small','crystal_medium','crystal_cluster','crystal_tall']),notes:['Temporary kit. Heights 0.4, 1.0, 1.5 and 4.0 m.']}),
};
