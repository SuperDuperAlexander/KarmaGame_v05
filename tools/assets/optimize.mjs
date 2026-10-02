import {NodeIO,Logger} from '@gltf-transform/core';
import {ALL_EXTENSIONS} from '@gltf-transform/extensions';
import {dedup,prune,weld,quantize,textureCompress} from '@gltf-transform/functions';
import sharp from 'sharp';
// Bump when the steps below change. It is part of the cache key.
export const SETTINGS_VERSION='5';
export const SMALL_TEXTURE_FILES=['package_chain.glb'];
export function maxTexture(name){return SMALL_TEXTURE_FILES.includes(name)?512:1024;}
export function settingsKey(name){return `v${SETTINGS_VERSION}:webp:${maxTexture(name)}`;}
const io=new NodeIO().registerExtensions(ALL_EXTENSIONS);io.setLogger(new Logger(Logger.Verbosity.WARN));
// Node names are the registry contract. No flatten, join or reparent. Empty named nodes stay.
export async function optimizeGlb(buffer,name){
  const doc=await io.readBinary(new Uint8Array(buffer));doc.setLogger(new Logger(Logger.Verbosity.WARN));
  const skinned=doc.getRoot().listSkins().length>0;
  await doc.transform(
    dedup(),
    prune({keepLeaves:true,keepAttributes:true,keepExtras:true}),
    weld(),
    ...(skinned?[]:[quantize({quantizePosition:14,quantizeNormal:8,quantizeTexcoord:12,quantizeColor:8,quantizeGeneric:12})]),
    textureCompress({encoder:sharp,targetFormat:'webp',resize:[maxTexture(name),maxTexture(name)],quality:85}),
  );
  return Buffer.from(await io.writeBinary(doc));
}
