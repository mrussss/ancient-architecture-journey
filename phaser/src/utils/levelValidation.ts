import type { EnemyData, LevelData, PointData, RectData, TrapData } from '../data/levels';

export interface LevelValidationWarning {
  code: string;
  message: string;
  x?: number;
  y?: number;
}

export interface LevelValidationReport {
  levelTitle: string;
  platformCount: number;
  trapCount: number;
  enemyCount: number;
  pageCount: number;
  warnings: LevelValidationWarning[];
}

const groundY = 476;
const playerVisualHeight = 96;
const playerVisualTopOnGround = groundY - playerVisualHeight;

export function validateLevel(level: LevelData): LevelValidationReport {
  const report = buildLevelValidationReport(level);
  printLevelValidationReport(report);
  return report;
}

export function buildLevelValidationReport(level: LevelData): LevelValidationReport {
  const warnings: LevelValidationWarning[] = [];
  const mergedPlatforms = mergePlatformRuns(level.platforms);

  if (level.pages.length !== 5) {
    warnings.push({
      code: 'pages.count',
      message: `expected 5 pages, got ${level.pages.length}`
    });
  }

  for (const trap of level.traps) {
    if (trap.w > 140) {
      warnings.push({
        code: 'trap.width',
        message: `${trap.type} trap at x=${trap.x} is ${trap.w}px wide`,
        x: trap.x,
        y: trap.y
      });
    }
  }

  for (const platform of level.platforms) {
    if (!isGroundPlatform(platform) && groundY - platform.y < 35) {
      warnings.push({
        code: 'platform.low',
        message: `platform at x=${platform.x}, y=${platform.y} is too close to ground`,
        x: platform.x,
        y: platform.y
      });
    }
    if ((platform.kind ?? 'ground') === 'oneWay' && platform.y + platform.h > playerVisualTopOnGround - 8) {
      warnings.push({
        code: 'oneWay.visualOverlap',
        message: `oneWay platform at x=${platform.x} is too low and may visually overlap player walking on ground.`,
        x: platform.x,
        y: platform.y
      });
    }
  }

  checkPlatformGaps(mergedPlatforms, warnings);
  checkTrapLanding(mergedPlatforms, level.traps, warnings);
  checkEnemies(mergedPlatforms, level.traps, level.enemies, warnings);
  checkPages(mergedPlatforms, level.pages, warnings);

  const goalDistance = level.worldWidth - (level.goal.x + level.goal.w);
  if (goalDistance < 100 || goalDistance > 260) {
    warnings.push({
      code: 'goal.distance',
      message: `goal is ${goalDistance}px from world end; recommended 100-260`,
      x: level.goal.x,
      y: level.goal.y
    });
  }

  return {
    levelTitle: level.title,
    platformCount: level.platforms.length,
    trapCount: level.traps.length,
    enemyCount: level.enemies.length,
    pageCount: level.pages.length,
    warnings
  };
}

export function printLevelValidationReport(report: LevelValidationReport): void {
  console.groupCollapsed(`[Level Validation] ${report.levelTitle}`);
  console.info(`Platforms: ${report.platformCount}`);
  console.info(`Traps: ${report.trapCount}`);
  console.info(`Enemies: ${report.enemyCount}`);
  console.info(`Pages: ${report.pageCount}`);
  console.info(`Warnings: ${report.warnings.length}`);
  for (const warning of report.warnings) {
    console.warn(`[${warning.code}] ${warning.message}`);
  }
  console.groupEnd();
}

function checkPlatformGaps(platforms: RectData[], warnings: LevelValidationWarning[]): void {
  const sorted = [...platforms].sort((a, b) => a.x - b.x);
  for (let i = 1; i < sorted.length; i += 1) {
    const previous = sorted[i - 1];
    const current = sorted[i];
    const horizontalGap = current.x - (previous.x + previous.w);
    const upwardDelta = previous.y - current.y;
    if (horizontalGap > 160 && upwardDelta > 0) {
      warnings.push({
        code: 'platform.gap',
        message: `platform gap ${horizontalGap}px with upward delta ${upwardDelta}px near x=${previous.x}`,
        x: previous.x + previous.w,
        y: Math.min(previous.y, current.y)
      });
    }
    if (upwardDelta > 90) {
      warnings.push({
        code: 'platform.height',
        message: `upward platform delta ${upwardDelta}px near x=${current.x}`,
        x: current.x,
        y: current.y
      });
    }
  }
}

function mergePlatformRuns(platforms: RectData[]): RectData[] {
  const sorted = [...platforms].sort((a, b) => a.y - b.y || a.x - b.x);
  const merged: RectData[] = [];

  for (const platform of sorted) {
    const previous = merged[merged.length - 1];
    const sameRun =
      previous &&
      previous.y === platform.y &&
      previous.h === platform.h &&
      (previous.textureKey ?? '') === (platform.textureKey ?? '') &&
      Math.abs(previous.x + previous.w - platform.x) <= 1;

    if (sameRun) {
      previous.w += platform.w;
    } else {
      merged.push({ ...platform });
    }
  }

  return merged;
}

function checkTrapLanding(platforms: RectData[], traps: TrapData[], warnings: LevelValidationWarning[]): void {
  for (const trap of traps) {
    const leftLanding = platforms.some((platform) => overlapsY(platform, trap) && platform.x + platform.w <= trap.x && trap.x - (platform.x + platform.w) <= 150);
    const rightLanding = platforms.some((platform) => overlapsY(platform, trap) && platform.x >= trap.x + trap.w && platform.x - (trap.x + trap.w) <= 150);
    if (!leftLanding || !rightLanding) {
      warnings.push({
        code: 'trap.landing',
        message: `${trap.type} trap at x=${trap.x} does not have clear landings on both sides`,
        x: trap.x,
        y: trap.y
      });
    }
  }
}

function checkEnemies(
  platforms: RectData[],
  traps: TrapData[],
  enemies: EnemyData[],
  warnings: LevelValidationWarning[]
): void {
  if (enemies.length < 1) {
    warnings.push({ code: 'enemy.count', message: 'level has no enemies' });
  }

  for (const enemy of enemies) {
    const patrolWidth = enemy.rightLimit - enemy.leftLimit;
    if (patrolWidth < 180) {
      warnings.push({
        code: 'enemy.patrol.short',
        message: `${enemy.type} patrol width is ${patrolWidth}px`,
        x: enemy.x,
        y: enemy.y
      });
    }

    const hostPlatform = findPlatformUnder(platforms, { x: enemy.x, y: enemy.y + enemy.h });
    if (!hostPlatform) {
      warnings.push({
        code: 'enemy.platform',
        message: `${enemy.type} has no platform directly under its feet`,
        x: enemy.x,
        y: enemy.y
      });
    } else if (enemy.leftLimit < hostPlatform.x || enemy.rightLimit > hostPlatform.x + hostPlatform.w) {
      warnings.push({
        code: 'enemy.patrol.bounds',
        message: `${enemy.type} patrol [${enemy.leftLimit}, ${enemy.rightLimit}] exceeds host platform [${hostPlatform.x}, ${hostPlatform.x + hostPlatform.w}]`,
        x: enemy.x,
        y: enemy.y
      });
    }

    const overlapsTrap = traps.some((trap) => rangesOverlap(enemy.leftLimit, enemy.rightLimit, trap.x, trap.x + trap.w));
    if (overlapsTrap) {
      warnings.push({
        code: 'enemy.patrol.trap',
        message: `${enemy.type} patrol range overlaps a trap`,
        x: enemy.x,
        y: enemy.y
      });
    }
  }
}

function checkPages(platforms: RectData[], pages: PointData[], warnings: LevelValidationWarning[]): void {
  for (const page of pages) {
    const nearest = platforms.reduce<RectData | undefined>((best, platform) => {
      if (!pointHorizontallyNear(page, platform)) {
        return best;
      }
      if (!best) {
        return platform;
      }
      return Math.abs(platform.y - page.y) < Math.abs(best.y - page.y) ? platform : best;
    }, undefined);

    if (!nearest || nearest.y - page.y > 140 || nearest.y < page.y) {
      warnings.push({
        code: 'page.reach',
        message: `page at x=${page.x}, y=${page.y} may not have a reachable platform below`,
        x: page.x,
        y: page.y
      });
    }
  }
}

function isGroundPlatform(platform: RectData): boolean {
  return Math.abs(platform.y - groundY) < 1 || platform.h >= 56;
}

function overlapsY(a: RectData, b: RectData): boolean {
  return Math.abs((a.y + a.h) - (b.y + b.h)) < 70 || Math.abs(a.y - b.y) < 70;
}

function findPlatformUnder(platforms: RectData[], point: PointData): RectData | undefined {
  return platforms.find((platform) => point.x >= platform.x && point.x <= platform.x + platform.w && Math.abs(platform.y - point.y) <= 8);
}

function pointHorizontallyNear(point: PointData, platform: RectData): boolean {
  return point.x >= platform.x - 40 && point.x <= platform.x + platform.w + 40;
}

function rangesOverlap(a1: number, a2: number, b1: number, b2: number): boolean {
  return Math.max(a1, b1) < Math.min(a2, b2);
}
