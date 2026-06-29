import type { LevelData } from '../data/levels';

export function validateLevel(level: LevelData): void {
  if (level.pages.length !== 5) {
    console.warn(`[LevelValidation] ${level.title}: expected 5 pages, got ${level.pages.length}`);
  }

  for (const trap of level.traps) {
    if (trap.w > 140) {
      console.warn(`[LevelValidation] ${level.title}: trap at x=${trap.x} is ${trap.w}px wide`);
    }
  }

  const ground = level.platforms.filter((platform) => Math.abs(platform.y - 476) < 1).sort((a, b) => a.x - b.x);
  for (let i = 1; i < ground.length; i += 1) {
    const gap = ground[i].x - (ground[i - 1].x + ground[i - 1].w);
    if (gap > 170) {
      console.warn(`[LevelValidation] ${level.title}: large ground gap ${gap}px near x=${ground[i - 1].x}`);
    }
  }

  if (level.enemies.length < 1 || level.enemies.length > 3) {
    console.warn(`[LevelValidation] ${level.title}: unusual enemy count ${level.enemies.length}`);
  }

  const goalDistance = level.worldWidth - (level.goal.x + level.goal.w);
  if (goalDistance < 30 || goalDistance > 300) {
    console.warn(`[LevelValidation] ${level.title}: goal is ${goalDistance}px from world end`);
  }
}
