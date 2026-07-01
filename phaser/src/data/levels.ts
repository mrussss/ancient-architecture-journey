export type TrapType = 'water' | 'spike' | 'fire' | 'fallingStone';
export type EnemyType = 'stoneBeast' | 'woodenPuppet' | 'yamenGuard' | 'palaceLion';
export type PlatformKind = 'ground' | 'solidBlock' | 'oneWay';

export interface RectData {
  x: number;
  y: number;
  w: number;
  h: number;
  textureKey?: string;
  kind?: PlatformKind;
}

export interface TrapData extends RectData {
  type: TrapType;
}

export interface EnemyData extends RectData {
  type: EnemyType;
  leftLimit: number;
  rightLimit: number;
}

export interface PointData {
  x: number;
  y: number;
}

export interface LevelData {
  id: number;
  title: string;
  subtitle: string;
  backgroundKey: string;
  wideBackgroundKey?: string;
  tileKey: string;
  worldWidth: number;
  worldHeight: number;
  spawn: PointData;
  platforms: RectData[];
  traps: TrapData[];
  enemies: EnemyData[];
  pages: PointData[];
  goal: RectData;
}

const groundY = 476;
const groundHeight = 64;
const groundSegment = 64;

function addGroundRange(platforms: RectData[], tileKey: string, x: number, w: number): void {
  for (let tileX = x; tileX < x + w; tileX += groundSegment) {
    platforms.push({
      x: tileX,
      y: groundY,
      w: Math.min(groundSegment, x + w - tileX),
      h: groundHeight,
      textureKey: tileKey,
      kind: 'ground'
    });
  }
}

const platform = (tileKey: string, x: number, y: number, w: number, h: number, kind: PlatformKind = 'oneWay'): RectData => ({
  x,
  y,
  w,
  h,
  textureKey: tileKey,
  kind
});

const trap = (type: TrapType, x: number, y: number, w: number, h: number): TrapData => ({ type, x, y, w, h });

const enemy = (
  type: EnemyType,
  x: number,
  y: number,
  w: number,
  h: number,
  leftLimit: number,
  rightLimit: number
): EnemyData => ({ type, x, y, w, h, leftLimit, rightLimit });

const page = (x: number, y: number): PointData => ({ x, y });
const goal = (x: number, y: number): RectData => ({ x, y, w: 56, h: 96, textureKey: 'ui_portal' });

function level1(): LevelData {
  const tileKey = 'tile_stone';
  const platforms: RectData[] = [];

  addGroundRange(platforms, tileKey, 0, 640);
  addGroundRange(platforms, tileKey, 760, 560);
  addGroundRange(platforms, tileKey, 1440, 1240);

  platforms.push(
    platform(tileKey, 360, 400, 180, 24, 'solidBlock'),
    platform(tileKey, 620, 350, 240, 24, 'oneWay'),
    platform(tileKey, 930, 350, 240, 24, 'oneWay'),
    platform(tileKey, 1180, 400, 140, 24, 'solidBlock'),
    platform(tileKey, 1900, 360, 260, 24, 'oneWay')
  );

  return {
    id: 1,
    title: '第一章 古桥：水上千年通途',
    subtitle: '石拱临水，桥影连岸',
    backgroundKey: 'bg_bridge',
    wideBackgroundKey: 'bg_bridge_wide',
    tileKey,
    worldWidth: 2680,
    worldHeight: 540,
    spawn: { x: 80, y: groundY - 56 },
    platforms,
    traps: [
      trap('water', 640, 492, 120, 42),
      trap('water', 1320, 492, 120, 42),
      trap('spike', 1540, 452, 80, 24)
    ],
    enemies: [
      enemy('stoneBeast', 920, groundY - 42, 44, 42, 820, 1160),
      enemy('stoneBeast', 1760, groundY - 42, 44, 42, 1640, 1980)
    ],
    pages: [
      page(420, 355),
      page(700, 305),
      page(1000, 305),
      page(1230, 355),
      page(1510, 430),
      page(1950, 315),
      page(2200, 430),
      page(2470, 430)
    ],
    goal: goal(2540, 380)
  };
}

function level2(): LevelData {
  const tileKey = 'tile_wood';
  const platforms: RectData[] = [];

  addGroundRange(platforms, tileKey, 0, 680);
  addGroundRange(platforms, tileKey, 800, 580);
  addGroundRange(platforms, tileKey, 1500, 520);
  addGroundRange(platforms, tileKey, 2140, 780);

  platforms.push(
    platform(tileKey, 330, 400, 170, 24, 'solidBlock'),
    platform(tileKey, 560, 360, 210, 24, 'oneWay'),
    platform(tileKey, 830, 325, 260, 24, 'solidBlock'),
    platform(tileKey, 1140, 325, 250, 24, 'oneWay'),
    platform(tileKey, 1510, 385, 220, 24, 'solidBlock'),
    platform(tileKey, 1720, 350, 240, 24, 'oneWay'),
    platform(tileKey, 2020, 325, 250, 24, 'solidBlock'),
    platform(tileKey, 2350, 385, 240, 24, 'solidBlock')
  );

  return {
    id: 2,
    title: '第二章 徽居：白墙黑瓦之间',
    subtitle: '院落递进，屋檐成路',
    backgroundKey: 'bg_huizhou',
    wideBackgroundKey: 'bg_huizhou_wide',
    tileKey,
    worldWidth: 2920,
    worldHeight: 540,
    spawn: { x: 80, y: groundY - 56 },
    platforms,
    traps: [
      trap('spike', 680, 492, 120, 42),
      trap('fallingStone', 1380, 492, 120, 42),
      trap('spike', 2020, 492, 120, 42)
    ],
    enemies: [
      enemy('woodenPuppet', 420, groundY - 42, 42, 42, 260, 560),
      enemy('woodenPuppet', 950, 325 - 42, 42, 42, 870, 1040),
      enemy('woodenPuppet', 1660, groundY - 42, 42, 42, 1540, 1880),
      enemy('woodenPuppet', 2140, 325 - 42, 42, 42, 2070, 2220)
    ],
    pages: [
      page(390, 355),
      page(650, 315),
      page(930, 280),
      page(1220, 280),
      page(1560, 430),
      page(1830, 305),
      page(2140, 280),
      page(2480, 340)
    ],
    goal: goal(2760, 380)
  };
}

function level3(): LevelData {
  const tileKey = 'tile_brick';
  const platforms: RectData[] = [];

  addGroundRange(platforms, tileKey, 0, 720);
  addGroundRange(platforms, tileKey, 840, 660);
  addGroundRange(platforms, tileKey, 1620, 540);
  addGroundRange(platforms, tileKey, 2280, 780);

  platforms.push(
    platform(tileKey, 300, 405, 160, 24, 'solidBlock'),
    platform(tileKey, 520, 365, 180, 24, 'solidBlock'),
    platform(tileKey, 760, 330, 240, 24, 'solidBlock'),
    platform(tileKey, 1060, 330, 260, 24, 'oneWay'),
    platform(tileKey, 1360, 380, 120, 24, 'solidBlock'),
    platform(tileKey, 1680, 345, 250, 24, 'oneWay'),
    platform(tileKey, 1980, 320, 250, 24, 'oneWay'),
    platform(tileKey, 2380, 360, 280, 24, 'solidBlock')
  );

  return {
    id: 3,
    title: '第三章 县署：礼法秩序之门',
    subtitle: '台阶分序，鼓声入院',
    backgroundKey: 'bg_yamen',
    wideBackgroundKey: 'bg_yamen_wide',
    tileKey,
    worldWidth: 3060,
    worldHeight: 540,
    spawn: { x: 80, y: groundY - 56 },
    platforms,
    traps: [
      trap('spike', 720, 492, 120, 42),
      trap('spike', 1500, 492, 120, 42),
      trap('fallingStone', 2160, 492, 120, 42)
    ],
    enemies: [
      enemy('yamenGuard', 480, groundY - 42, 42, 42, 300, 650),
      enemy('yamenGuard', 900, 330 - 42, 42, 42, 810, 970),
      enemy('yamenGuard', 1780, groundY - 42, 42, 42, 1680, 2040),
      enemy('yamenGuard', 2500, 360 - 42, 42, 42, 2420, 2620)
    ],
    pages: [
      page(350, 365),
      page(600, 325),
      page(850, 285),
      page(1160, 285),
      page(1420, 335),
      page(1760, 300),
      page(2080, 275),
      page(2520, 315)
    ],
    goal: goal(2905, 380)
  };
}

function level4(): LevelData {
  const tileKey = 'tile_palace';
  const platforms: RectData[] = [];

  addGroundRange(platforms, tileKey, 0, 650);
  addGroundRange(platforms, tileKey, 780, 540);
  addGroundRange(platforms, tileKey, 1450, 450);
  addGroundRange(platforms, tileKey, 2030, 420);
  addGroundRange(platforms, tileKey, 2580, 660);

  platforms.push(
    platform(tileKey, 320, 405, 180, 24, 'solidBlock'),
    platform(tileKey, 560, 365, 190, 24, 'solidBlock'),
    platform(tileKey, 820, 330, 230, 24, 'solidBlock'),
    platform(tileKey, 1100, 330, 230, 24, 'oneWay'),
    platform(tileKey, 1460, 375, 220, 24, 'solidBlock'),
    platform(tileKey, 1700, 340, 240, 24, 'oneWay'),
    platform(tileKey, 2000, 315, 240, 24, 'solidBlock'),
    platform(tileKey, 2300, 360, 140, 24, 'solidBlock'),
    platform(tileKey, 2640, 330, 260, 24, 'solidBlock'),
    platform(tileKey, 2940, 330, 220, 24, 'oneWay')
  );

  return {
    id: 4,
    title: '第四章 太和：中轴之巅',
    subtitle: '重台高起，金瓦映天',
    backgroundKey: 'bg_taihe',
    wideBackgroundKey: 'bg_taihe_wide',
    tileKey,
    worldWidth: 3240,
    worldHeight: 540,
    spawn: { x: 80, y: groundY - 56 },
    platforms,
    traps: [
      trap('fire', 650, 492, 130, 42),
      trap('spike', 1320, 492, 130, 42),
      trap('fire', 1900, 492, 130, 42),
      trap('spike', 2450, 492, 130, 42)
    ],
    enemies: [
      enemy('palaceLion', 470, groundY - 42, 46, 42, 340, 620),
      enemy('palaceLion', 930, 330 - 42, 46, 42, 860, 1010),
      enemy('palaceLion', 1600, groundY - 42, 46, 42, 1500, 1840),
      enemy('palaceLion', 2140, 315 - 42, 46, 42, 2050, 2210),
      enemy('palaceLion', 2780, 330 - 42, 46, 42, 2680, 2860)
    ],
    pages: [
      page(390, 365),
      page(640, 325),
      page(910, 285),
      page(1180, 285),
      page(1510, 335),
      page(1810, 300),
      page(2120, 270),
      page(2780, 285)
    ],
    goal: goal(3095, 380)
  };
}

export const levels = [level1(), level2(), level3(), level4()];

export function getLevel(levelId: number): LevelData {
  return levels[Math.max(0, Math.min(levels.length - 1, levelId - 1))];
}
