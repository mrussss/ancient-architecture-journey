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
      { comicKey: 'comic_final_1', speaker: '旁白', text: '四类建筑记忆汇入古卷，散落的残页重新合为一幅完整图卷。' },
      { comicKey: 'comic_final_2', speaker: '小研', text: '光芒散去，她回到现实。平板屏幕上，古法并未远去，只是等待被重新看见。' }
    ];
  }

  const intro: Record<number, StoryPage[]> = {
    1: [
      { comicKey: 'comic_opening_1', speaker: '旁白', text: '一场古建筑数字化采集中，小研发现了一卷残破古籍。' },
      { comicKey: 'comic_opening_2', speaker: '旁白', text: '卷页微光闪动，散落的残页化作四段建筑记忆。' },
      { comicKey: 'comic_level1_intro', speaker: '小研', text: '水声漫过石拱，桥影连接两岸。第一段残页，藏在古桥的通途之间。' }
    ],
    2: [
      { comicKey: 'comic_level2_intro', speaker: '旁白', text: '白墙黑瓦之间，院落层层展开。屋檐、马头墙与天井，记录着民居的生活秩序。' },
      { comicKey: 'comic_level2_intro', speaker: '小研', text: '木梁与屋檐连成上层路线，第二段残页应当散在檐影之间。' }
    ],
    3: [
      { comicKey: 'comic_level3_intro', speaker: '旁白', text: '县署大门开启，台阶分明，礼法有序。这里的建筑，不只是空间，也是制度的形状。' },
      { comicKey: 'comic_level3_intro', speaker: '小研', text: '门、阶、堂层层推进。第三段残页，藏在规整的院落秩序之中。' }
    ],
    4: [
      { comicKey: 'comic_level4_intro', speaker: '旁白', text: '中轴铺展，重檐高起。最后的残页，藏在太和殿的庄严气象之中。' },
      { comicKey: 'comic_level4_intro', speaker: '小研', text: '穿过高台与柱廊，让古卷完成最后一次归卷。' }
    ]
  };

  const complete: Record<number, StoryPage[]> = {
    1: [
      { comicKey: 'comic_level1_complete', speaker: '旁白', text: '残页归位，石拱的弧线重新清晰。古桥不只连接道路，也连接着千年的营造智慧。' }
    ],
    2: [
      { comicKey: 'comic_level2_complete', speaker: '旁白', text: '残页归位，徽居的屋檐在光中重现。一砖一瓦之间，藏着人与家园的尺度。' }
    ],
    3: [
      { comicKey: 'comic_level3_complete', speaker: '旁白', text: '残页归位，门楼与堂屋的秩序重新显现。建筑承载的不只是居所，也承载着时代的规制。' }
    ],
    4: [
      { comicKey: 'comic_level4_complete', speaker: '旁白', text: '最后的残页归入古卷，金瓦与重檐在光中完整呈现。' },
      { comicKey: 'comic_final_1', speaker: '小研', text: '千年古法终于重新连成一幅完整图卷。' }
    ]
  };

  return storyType === 'intro' ? intro[levelId] : complete[levelId];
}
