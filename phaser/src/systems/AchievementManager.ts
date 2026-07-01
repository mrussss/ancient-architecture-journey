export type AchievementId = 'all_pages_one_level' | 'no_damage_one_level';

export interface Achievement {
  id: AchievementId;
  title: string;
  description: string;
  unlocked: boolean;
}

const STORAGE_KEY = 'ancient_architecture_achievements';

const DEFINITIONS: Omit<Achievement, 'unlocked'>[] = [
  {
    id: 'all_pages_one_level',
    title: '残页无遗',
    description: '以 8 / 8 残页完成任意章节。'
  },
  {
    id: 'no_damage_one_level',
    title: '毫发无伤',
    description: '不扣血完成任意章节。'
  }
];

const DEFAULT_UNLOCKED: Record<AchievementId, boolean> = {
  all_pages_one_level: false,
  no_damage_one_level: false
};

function readUnlocked(): Record<AchievementId, boolean> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULT_UNLOCKED, ...JSON.parse(raw) } : { ...DEFAULT_UNLOCKED };
  } catch {
    return { ...DEFAULT_UNLOCKED };
  }
}

function writeUnlocked(value: Record<AchievementId, boolean>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export class AchievementManager {
  static list(): Achievement[] {
    const unlocked = readUnlocked();
    return DEFINITIONS.map((item) => ({
      ...item,
      unlocked: Boolean(unlocked[item.id])
    }));
  }

  static recordLevelComplete(pagesCollected: number, totalPages: number, damageTaken: number): AchievementId[] {
    const unlocked = readUnlocked();
    const newlyUnlocked: AchievementId[] = [];

    if (pagesCollected >= totalPages && !unlocked.all_pages_one_level) {
      unlocked.all_pages_one_level = true;
      newlyUnlocked.push('all_pages_one_level');
    }

    if (damageTaken <= 0 && !unlocked.no_damage_one_level) {
      unlocked.no_damage_one_level = true;
      newlyUnlocked.push('no_damage_one_level');
    }

    if (newlyUnlocked.length > 0) {
      writeUnlocked(unlocked);
    }

    return newlyUnlocked;
  }

  static reset(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
