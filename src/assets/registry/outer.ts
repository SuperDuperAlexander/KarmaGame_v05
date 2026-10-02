import {entry} from './entry';
// Kit files hold many parts. Each `parts` list maps one logical part to GLB node names.
const KIT='Kit part. Needs a human look check. Parts are unscaled; the world sets the scale.';
export const outer = {
  MarketStallA:entry('MarketStallA',{status:'temporary',file:'/assets/market/market_stall_A.glb',normalize:{width:3.3,ground:true}}),
  MarketStallB:entry('MarketStallB',{status:'temporary',file:'/assets/market/market_stall_B.glb',normalize:{width:3.3,ground:true},notes:['Temporary stall. Long side is the depth.']}),
  MarketProps:entry('MarketProps',{status:'temporary',file:'/assets/market/market_props.glb',parts:{crate:['wooden_crate'],fruitCrate:['fruit_crate'],basketSmall:['small_basket'],basketLarge:['large_basket'],apple:['apple'],orange:['orange'],bread:['bread'],jug:['ceramic_jug'],cloth:['cloth_roll'],table:['small_table'],barrel:['wooden_barrel'],box:['wooden_box'],sign:['fallen_sign']},notes:[KIT]}),
  CentralTreeOuter:entry('CentralTreeOuter',{status:'temporary',file:'/assets/core/central_tree_outer.glb',normalize:{height:15,ground:true},nodes:{leaves:['leaves_left_01','leaves_left_02','leaves_right_01','leaves_right_02','leaves_center'],trunk:['trunk'],roots:['root_surface_left','root_surface_right','root_surface_center'],branches:['branches_left','branches_right','branches_center'],vines:['small_vines']},notes:['Temporary outer tree. Parts are separate meshes for later glow.']}),
  CityGate:entry('CityGate',{status:'temporary',file:'/assets/city/city_infrastructure.glb',parts:{gate:['city_gate'],arch:['stone_arch']},notes:[KIT]}),
  CityWall:entry('CityWall',{status:'temporary',file:'/assets/city/city_infrastructure.glb',parts:{straight:['wall_straight'],corner:['wall_corner'],bridge:['small_bridge'],stairs:['stone_stairs'],lamp:['street_lamp'],bench:['bench'],fence:['wooden_fence'],banner:['banner_pole'],fountain:['fountain_base']},notes:[KIT]}),
  CityBuilding:entry('CityBuilding',{status:'temporary',file:'/assets/city/city_building_kit.glb',parts:{small:['small_house'],medium:['medium_house'],corner:['corner_house'],tower:['tower'],wall:['wall_section'],window:['window_module'],door:['door_module'],roofSmall:['roof_small'],roofMedium:['roof_medium'],balcony:['balcony'],archway:['archway'],stairs:['stairs']},notes:[KIT]}),
  Vegetation:entry('Vegetation',{status:'temporary',file:'/assets/world/vegetation_kit.glb',parts:{grass:['grass_clump'],flowerSmall:['flower_small'],flowerCluster:['flower_cluster'],fern:['fern'],bushSmall:['bush_small'],bushMedium:['bush_medium'],vine:['vine_segment'],mushroomSmall:['mushroom_small'],mushroomCluster:['mushroom_cluster']},notes:[KIT]}),
  ExchangeHouse:entry('ExchangeHouse'),
};
