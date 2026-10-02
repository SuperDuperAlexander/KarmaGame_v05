import type {AssetId} from '../../contracts/visual';
import type {AssetEntry} from './entry';
import {characters} from './characters';
import {outer} from './outer';
import {inner} from './inner';
import {core} from './core';
export type {AssetEntry} from './entry';
// One file per owner keeps parallel work packages apart. `satisfies` fails the build if an id is missing.
export const registry:Record<AssetId,AssetEntry> = {...characters,...core,...outer,...inner} satisfies Record<AssetId,AssetEntry>;
