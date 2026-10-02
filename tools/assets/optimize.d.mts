export const SETTINGS_VERSION:string;
export function maxTexture(name:string):number;
export function settingsKey(name:string):string;
export function optimizeGlb(buffer:Uint8Array,name:string):Promise<Buffer>;
