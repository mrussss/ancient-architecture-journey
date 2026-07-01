export interface ImageAsset {
  key: string;
  path: string;
}

export interface SpriteSheetAsset {
  key: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
}

export interface AudioAsset {
  key: string;
  path: string;
}

export const imageAssets: ImageAsset[] = [
  { key: 'bg_bridge', path: 'assets/images/backgrounds/level1_bridge.png' },
  { key: 'bg_huizhou', path: 'assets/images/backgrounds/level2_huizhou.png' },
  { key: 'bg_yamen', path: 'assets/images/backgrounds/level3_yamen.png' },
  { key: 'bg_taihe', path: 'assets/images/backgrounds/level4_taihe.png' },
  { key: 'bg_bridge_wide', path: 'assets/images/backgrounds/level1_bridge_wide.png' },
  { key: 'bg_huizhou_wide', path: 'assets/images/backgrounds/level2_huizhou_wide.png' },
  { key: 'bg_yamen_wide', path: 'assets/images/backgrounds/level3_yamen_wide.png' },
  { key: 'bg_taihe_wide', path: 'assets/images/backgrounds/level4_taihe_wide.png' },

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
  { key: 'ui_menu_panel', path: 'assets/images/ui/menu_panel.png' },
  { key: 'ui_button_primary', path: 'assets/images/ui/button_primary.png' },
  { key: 'ui_button_secondary', path: 'assets/images/ui/button_secondary.png' },
  { key: 'ui_level_card', path: 'assets/images/ui/level_card.png' },
  { key: 'ui_hud_panel', path: 'assets/images/ui/hud_panel.png' },
  { key: 'ui_result_panel', path: 'assets/images/ui/result_panel.png' },
  { key: 'ui_dialog_panel', path: 'assets/images/ui/dialog_panel.png' },
  { key: 'ui_achievement_badge', path: 'assets/images/ui/achievement_badge.png' },
  { key: 'ui_achievement_badge_locked', path: 'assets/images/ui/achievement_badge_locked.png' },
  { key: 'icon_heart_full', path: 'assets/images/icons/heart_full.png' },
  { key: 'icon_heart_empty', path: 'assets/images/icons/heart_empty.png' },
  { key: 'icon_page', path: 'assets/images/icons/page_icon.png' },
  { key: 'portal_idle', path: 'assets/images/portal/portal_idle.png' },
  { key: 'portal_active', path: 'assets/images/portal/portal_active.png' },

  { key: 'comic_opening_1', path: 'assets/images/cg/prologue_01.png' },
  { key: 'comic_opening_2', path: 'assets/images/cg/prologue_02.png' },
  { key: 'comic_level1_intro', path: 'assets/images/cg/level1_intro.png' },
  { key: 'comic_level2_intro', path: 'assets/images/cg/level2_intro.png' },
  { key: 'comic_level3_intro', path: 'assets/images/cg/level3_intro.png' },
  { key: 'comic_level4_intro', path: 'assets/images/cg/level4_intro.png' },
  { key: 'comic_level1_complete', path: 'assets/images/cg/level1_clear.png' },
  { key: 'comic_level2_complete', path: 'assets/images/cg/level2_clear.png' },
  { key: 'comic_level3_complete', path: 'assets/images/cg/level3_clear.png' },
  { key: 'comic_level4_complete', path: 'assets/images/cg/level4_clear.png' },
  { key: 'comic_final_1', path: 'assets/images/cg/final_ending_01.png' },
  { key: 'comic_final_2', path: 'assets/images/cg/final_ending_02.png' }
];

export const spriteSheetAssets: SpriteSheetAsset[] = [
  { key: 'xiaoyan_sheet', path: 'assets/images/player/xiaoyan_sheet.png', frameWidth: 72, frameHeight: 96 }
];

export const audioAssets: AudioAsset[] = [
  { key: 'bgm_pavilion', path: 'assets/audio/pavilion_at_sunset.mp3' }
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
