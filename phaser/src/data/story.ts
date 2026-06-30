export type StoryType = 'intro' | 'complete' | 'final';

export interface StoryPage {
  speaker?: string;
  text: string;
  portraitKey?: string;
  comicKey?: string;
}

export function getStoryPages(levelId: number, storyType: StoryType): StoryPage[] {
  if (storyType === 'final') {
    return [
      { comicKey: 'comic_final_1', speaker: '小研', text: '四组残页归入卷轴，斗拱、屋脊与台基重新连成一线。' },
      { comicKey: 'comic_final_2', speaker: '旁白', text: '图卷重合，千年回响。古人的营造之法，也成为她新的创作起点。' }
    ];
  }

  const intro: Record<number, StoryPage[]> = {
    1: [
      { comicKey: 'comic_opening_1', speaker: '旁白', text: '深夜的数字媒体实验室里，小研翻开一册残破的《营造法式》拓本。' },
      { comicKey: 'comic_opening_2', speaker: '小研', text: '残页散作四道时空裂隙。第一道光，落在一座古桥之上。' },
      { speaker: '提示', text: '沿桥面前进，找回桥梁篇残页。' }
    ],
    2: [
      { speaker: '旁白', text: '白墙黑瓦在晨雾中展开，马头墙把庭院切成层层光影。' },
      { speaker: '小研', text: '木梁与屋檐连成隐秘的路。民居篇残页，应该就散在檐下。' },
      { speaker: '提示', text: '登上屋檐，再回到庭院。低处木台为实体，高处屋檐可穿越。' }
    ],
    3: [
      { speaker: '旁白', text: '鼓声穿过县署门楼，青砖台阶把院落分出秩序。' },
      { speaker: '小研', text: '衙役巡逻、机关暗伏。我要借高台绕行，取回官署篇残页。' }
    ],
    4: [
      { speaker: '旁白', text: '最后的裂隙通向红墙金瓦，太和殿的台基在云光中升起。' },
      { speaker: '小研', text: '只差皇宫篇残页。穿过柱廊，完整图卷就能重合。' }
    ]
  };

  const complete: Record<number, StoryPage[]> = {
    1: [
      { comicKey: 'comic_level1_complete', speaker: '小研', text: '桥梁篇残页归位。桥洞映水，千年的通途仍在延伸。' }
    ],
    2: [
      { comicKey: 'comic_level2_complete', speaker: '小研', text: '民居篇残页归位。白墙黑瓦之间，院落把日常生活安放得井然有序。' }
    ],
    3: [
      { comicKey: 'comic_level3_complete', speaker: '小研', text: '官署篇残页归位。门、阶、堂层层递进，礼法有了可见的形状。' }
    ],
    4: [
      { comicKey: 'comic_level4_complete', speaker: '小研', text: '皇宫篇残页归位。中轴尽头，完整图卷开始展开。' },
      { comicKey: 'comic_final_1', speaker: '小研', text: '四组残页合为一卷，古桥、民居、县署与殿宇在光中相连。' },
      { comicKey: 'comic_final_2', speaker: '旁白', text: '现实与千年前的营造智慧，在这一刻重新相遇。' }
    ]
  };

  return storyType === 'intro' ? intro[levelId] : complete[levelId];
}
