import {access} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
export async function sourceRoot(){let root=resolve(process.cwd());for(let i=0;i<5;i++){try{await access(join(root,'3D Models','assets'));return root;}catch{const next=dirname(root);if(next===root)break;root=next;}}throw Error('No in-project asset drop zone found.');}
