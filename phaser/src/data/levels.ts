export type TrapType = 'water' | 'spike' | 'fire' | 'fallingStone';
export type EnemyType = 'stoneBeast' | 'woodenPuppet' | 'yamenGuard' | 'palaceLion';
export type PlatformKind = 'solid' | 'oneWay';

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
      kind: 'solid'
    });
  }
}

const platform = (tileKey: string, x: number, y: number, w: number, h: number): RectData => ({
  x,
  y,
  w,
  h,
  textureKey: tileKey,
  kind: 'oneWay'
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
  addGroundRange(platforms, tileKey, 0, 672);
  addGroundRange(platforms, tileKey, 776, 734);
  addGroundRange(platforms, tileKey, 1622, 1058);
  platforms.push(
    platform(tileKey, 360, 420, 180, 24),
    platform(tileKey, 840, 388, 280, 24),
    platform(tileKey, 1210, 400, 260, 24),
    platform(tileKey, 1685, 384, 320, 24),
    platform(tileKey, 2150, 395, 220, 24)
  );
  return {
    id: 1,
    title: 'Level 1: Ancient Bridge',
    subtitle: '桥梁之智：水上千年通途',
    backgroundKey: 'bg_bridge',
    tileKey,
    worldWidth: 2680,
    worldHeight: 540,
    spawn: { x: 80, y: groundY - 56 },
    platforms,
    traps: [
      trap('water', 672, 492, 104, 42),
      trap('water', 1510, 492, 112, 42),
      trap('spike', 1312, 452, 76, 24)
    ],
    enemies: [
      enemy('stoneBeast', 960, groundY - 42, 44, 42, 880, 1240),
      enemy('stoneBeast', 1780, groundY - 42, 44, 42, 1700, 2020)
    ],
    pages: [page(405, 380), page(705, 430), page(960, 348), page(1265, 360), page(2195, 355)],
    goal: goal(2540, 380)
  };
}

function level2(): LevelData {
  const tileKey = 'tile_wood';
  const platforms: RectData[] = [];
  addGroundRange(platforms, tileKey, 0, 704);
  addGroundRange(platforms, tileKey, 808, 612);
  addGroundRange(platforms, tileKey, 1500, 590);
  addGroundRange(platforms, tileKey, 2190, 730);
  platforms.push(
    platform(tileKey, 390, 392, 170, 24),
    platform(tileKey, 610, 350, 190, 24),
    platform(tileKey, 850, 305, 250, 24),
    platform(tileKey, 1160, 315, 190, 24),
    platform(tileKey, 1410, 380, 140, 24),
    platform(tileKey, 1600, 396, 230, 24),
    platform(tileKey, 1865, 372, 150, 24),
    platform(tileKey, 2070, 350, 210, 24),
    platform(tileKey, 2350, 410, 240, 24)
  );
  return {
    id: 2,
    title: 'Level 2: Huizhou Residence',
    subtitle: '民居之美：白墙黑瓦马头墙',
    backgroundKey: 'bg_huizhou',
    tileKey,
    worldWidth: 2920,
    worldHeight: 540,
    spawn: { x: 80, y: groundY - 56 },
    platforms,
    traps: [
      trap('spike', 704, 492, 104, 42),
      trap('fallingStone', 1320, 452, 72, 24),
      trap('fallingStone', 1940, 452, 72, 24),
      trap('spike', 2090, 492, 100, 42)
    ],
    enemies: [
      enemy('woodenPuppet', 1035, groundY - 42, 42, 42, 910, 1290),
      enemy('woodenPuppet', 980, 263, 42, 42, 890, 1070)
    ],
    pages: [page(430, 350), page(675, 310), page(1000, 265), page(1690, 356), page(2415, 370)],
    goal: goal(2760, 380)
  };
}

function level3(): LevelData {
  const tileKey = 'tile_brick';
  const platforms: RectData[] = [];
  addGroundRange(platforms, tileKey, 0, 760);
  addGroundRange(platforms, tileKey, 900, 650);
  addGroundRange(platforms, tileKey, 1660, 500);
  addGroundRange(platforms, tileKey, 2280, 780);
  platforms.push(
    platform(tileKey, 360, 428, 160, 24),
    platform(tileKey, 560, 392, 160, 24),
    platform(tileKey, 920, 392, 220, 24),
    platform(tileKey, 1180, 404, 220, 24),
    platform(tileKey, 1430, 360, 190, 24),
    platform(tileKey, 1740, 330, 220, 24),
    platform(tileKey, 2030, 390, 190, 24),
    platform(tileKey, 2420, 392, 260, 24)
  );
  return {
    id: 3,
    title: 'Level 3: County Yamen',
    subtitle: '官府之制：礼法秩序与空间',
    backgroundKey: 'bg_yamen',
    tileKey,
    worldWidth: 3060,
    worldHeight: 540,
    spawn: { x: 80, y: groundY - 56 },
    platforms,
    traps: [
      trap('spike', 778, 492, 104, 42),
      trap('fallingStone', 1285, 452, 80, 24),
      trap('spike', 1572, 492, 72, 42),
      trap('fallingStone', 2168, 492, 96, 42)
    ],
    enemies: [
      enemy('yamenGuard', 1030, groundY - 42, 42, 42, 930, 1270),
      enemy('yamenGuard', 2500, groundY - 42, 42, 42, 2330, 2700)
    ],
    pages: [page(405, 388), page(610, 352), page(1480, 320), page(1805, 290), page(2515, 352)],
    goal: goal(2905, 380)
  };
}

function level4(): LevelData {
  const tileKey = 'tile_palace';
  const platforms: RectData[] = [];
  addGroundRange(platforms, tileKey, 0, 680);
  addGroundRange(platforms, tileKey, 812, 540);
  addGroundRange(platforms, tileKey, 1480, 450);
  addGroundRange(platforms, tileKey, 2060, 430);
  addGroundRange(platforms, tileKey, 2620, 620);
  platforms.push(
    platform(tileKey, 350, 420, 180, 24),
    platform(tileKey, 840, 382, 210, 24),
    platform(tileKey, 1085, 370, 190, 24),
    platform(tileKey, 1420, 330, 190, 24),
    platform(tileKey, 1740, 375, 250, 24),
    platform(tileKey, 2140, 325, 210, 24),
    platform(tileKey, 2520, 368, 250, 24),
    platform(tileKey, 2840, 350, 220, 24)
  );
  return {
    id: 4,
    title: 'Level 4: Hall of Supreme Harmony',
    subtitle: '皇宫之尊：中轴礼制与殿宇秩序',
    backgroundKey: 'bg_taihe',
    tileKey,
    worldWidth: 3240,
    worldHeight: 540,
    spawn: { x: 80, y: groundY - 56 },
    platforms,
    traps: [
      trap('fire', 692, 492, 108, 42),
      trap('spike', 1368, 492, 96, 42),
      trap('fire', 1848, 452, 88, 24),
      trap('spike', 2508, 492, 96, 42),
      trap('fire', 2700, 452, 92, 24)
    ],
    enemies: [
      enemy('palaceLion', 930, groundY - 42, 46, 42, 850, 1180),
      enemy('palaceLion', 2670, groundY - 42, 46, 42, 2635, 2865)
    ],
    pages: [page(395, 380), page(1130, 330), page(1480, 290), page(2185, 285), page(2885, 310)],
    goal: goal(3095, 380)
  };
}

export const levels = [level1(), level2(), level3(), level4()];

export function getLevel(levelId: number): LevelData {
  return levels[Math.max(0, Math.min(levels.length - 1, levelId - 1))];
}
