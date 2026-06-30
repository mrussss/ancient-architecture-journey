export interface ImageAsset {
  key: string;
  path: string;
}

export const imageAssets: ImageAsset[] = [
  { key: 'bg_bridge', path: 'assets/images/backgrounds/level1_bridge.png' },
  { key: 'bg_huizhou', path: 'assets/images/backgrounds/level2_huizhou.png' },
  { key: 'bg_yamen', path: 'assets/images/backgrounds/level3_yamen.png' },
  { key: 'bg_taihe', path: 'assets/images/backgrounds/level4_taihe.png' },

  { key: 'player_idle', path: 'assets/images/player/xiaoyan_idle.png' },
  { key: 'player_walk', path: 'assets/images/player/xiaoyan_walk.png' },
  { key: 'player_walk_1', path: 'assets/images/player/xiaoyan_walk_1.png' },
  { key: 'player_walk_2', path: 'assets/images/player/xiaoyan_walk_2.png' },
  { key: 'player_walk_3', path: 'assets/images/player/xiaoyan_walk_3.png' },
  { key: 'player_walk_4', path: 'assets/images/player/xiaoyan_walk_4.png' },
  { key: 'player_jump', path: 'assets/images/player/xiaoyan_jump.png' },
  { key: 'player_attack', path: 'assets/images/player/xiaoyan_attack.png' },

  { key: 'enemy_stone_beast', path: 'assets/images/enemies/stone_beast.png' },
  { key: 'enemy_wooden_puppet', path: 'assets/images/enemies/wooden_puppet.png' },
  { key: 'enemy_yamen_guard', path: 'assets/images/enemies/yamen_guard.png' },
  { key: 'enemy_palace_lion', path: 'assets/images/enemies/palace_lion.png' },

  { key: 'trap_water', path: 'assets/images/traps/water.png' },
  { key: 'trap_spike', path: 'assets/images/traps/spike.png' },
  { key: 'trap_fire', path: 'assets/images/traps/fire.png' },
  { key: 'trap_falling_stone', path: 'assets/images/traps/falling_stone.png' },

  { key: 'tile_stone', path: 'assets/images/tiles/stone_tile.png' },
  { key: 'tile_wood', path: 'assets/images/tiles/wood_tile.png' },
  { key: 'tile_brick', path: 'assets/images/tiles/brick_tile.png' },
  { key: 'tile_palace', path: 'assets/images/tiles/palace_tile.png' },
  { key: 'tileset_bridge', path: 'assets/images/tilesets/bridge_tile.png' },
  { key: 'tileset_huizhou', path: 'assets/images/tilesets/huizhou_tile.png' },
  { key: 'tileset_yamen', path: 'assets/images/tilesets/yamen_tile.png' },
  { key: 'tileset_taihe', path: 'assets/images/tilesets/taihe_tile.png' },

  { key: 'item_page', path: 'assets/images/items/page.png' },
  { key: 'ui_heart', path: 'assets/images/ui/heart.png' },
  { key: 'ui_portal', path: 'assets/images/ui/portal.png' },
  { key: 'ui_button', path: 'assets/images/ui/button.png' },
  { key: 'ui_button_selected', path: 'assets/images/ui/button_selected.png' },
  { key: 'ui_panel', path: 'assets/images/ui/panel.png' },

  { key: 'comic_opening_1', path: 'assets/images/comics/opening_1.png' },
  { key: 'comic_opening_2', path: 'assets/images/comics/opening_2.png' },
  { key: 'comic_level1_complete', path: 'assets/images/comics/level1_complete.png' },
  { key: 'comic_level2_complete', path: 'assets/images/comics/level2_complete.png' },
  { key: 'comic_level3_complete', path: 'assets/images/comics/level3_complete.png' },
  { key: 'comic_level4_complete', path: 'assets/images/comics/level4_complete.png' },
  { key: 'comic_final_1', path: 'assets/images/comics/final_1.png' },
  { key: 'comic_final_2', path: 'assets/images/comics/final_2.png' }
];

export const enemyTextureByType = {
  stoneBeast: 'enemy_stone_beast',
  woodenPuppet: 'enemy_wooden_puppet',
  yamenGuard: 'enemy_yamen_guard',
  palaceLion: 'enemy_palace_lion'
} as const;

export const trapTextureByType = {
  water: 'trap_water',
  spike: 'trap_spike',
  fire: 'trap_fire',
  fallingStone: 'trap_falling_stone'
} as const;
