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
      { comicKey: 'comic_final_1', speaker: '小研', text: '四组残页在光芒中合为完整图卷。' },
      { comicKey: 'comic_final_2', speaker: '旁白', text: '《营造法式》的图卷回到现实，也把中国古代建筑的秩序与美留在了小研心中。' }
    ];
  }

  const intro: Record<number, StoryPage[]> = {
    1: [
      { comicKey: 'comic_opening_1', speaker: '旁白', text: '小研在数字媒体实验室中发现一本残破的《营造法式》拓本。' },
      { comicKey: 'comic_opening_2', speaker: '小研', text: '书页化作四道时空裂隙，第一道裂隙通向一座古桥。' },
      { speaker: '提示', text: '穿过石桥，收集桥梁篇残页。' }
    ],
    2: [
      { speaker: '旁白', text: '白墙黑瓦铺展开来，徽派古居的屋檐像阶梯一样延伸。' },
      { speaker: '小研', text: '这一次要沿木梁和屋顶前进，找回民居篇残页。' },
      { speaker: '提示', text: '第二关平台间距更保守，可以稳定从屋檐路线回到庭院。' }
    ],
    3: [
      { speaker: '旁白', text: '县署衙门的鼓声响起，台阶、公堂和院墙构成严整空间。' },
      { speaker: '小研', text: '这里的机关更多，我需要利用高台避开衙役巡逻。' }
    ],
    4: [
      { speaker: '旁白', text: '最后的裂隙通向红墙金瓦之间，太和殿台基高高升起。' },
      { speaker: '小研', text: '只差皇宫篇残页，完整图卷就能拼合。' }
    ]
  };

  const complete: Record<number, StoryPage[]> = {
    1: [
      { comicKey: 'comic_level1_complete', speaker: '小研', text: '桥梁篇残页归位了。古桥顺应水势，也连接了两岸生活。' }
    ],
    2: [
      { comicKey: 'comic_level2_complete', speaker: '小研', text: '民居篇残页归位了。院落、屋檐与马头墙中藏着生活秩序。' }
    ],
    3: [
      { comicKey: 'comic_level3_complete', speaker: '小研', text: '官府篇残页归位了。县署建筑把礼法和空间等级具象化。' }
    ],
    4: [
      { comicKey: 'comic_level4_complete', speaker: '小研', text: '皇宫篇残页也归位了。完整图卷正在展开。' },
      { comicKey: 'comic_final_1', speaker: '小研', text: '四组残页在光芒中合为完整图卷。' },
      { comicKey: 'comic_final_2', speaker: '旁白', text: '现实与千年前的营造智慧，在这一刻重新相连。' }
    ]
  };

  return storyType === 'intro' ? intro[levelId] : complete[levelId];
}
