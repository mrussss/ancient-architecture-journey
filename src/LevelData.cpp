#include "LevelData.h"

#include "Collision.h"
#include "Constants.h"

#include <algorithm>
#include <cmath>
#include <iostream>

namespace {
constexpr float kGroundY = 476.0f;
constexpr float kGroundHeight = 64.0f;
constexpr float kGroundSegment = 64.0f;
constexpr float kSafeTrapWidth = 140.0f;

Entity platform(float x, float y, float w, float h, const std::string& textureId) {
    return Entity{SDL_FRect{x, y, w, h}, EntityType::Platform, true, textureId};
}

Collectible page(float x, float y) {
    return Collectible{SDL_FRect{x, y, 26.0f, 30.0f}, CollectibleType::Page, false, "item_page"};
}

Trap trap(float x, float y, float w, float h, TrapType type, const std::string& textureId) {
    return Trap{SDL_FRect{x, y, w, h}, type, 1, true, textureId};
}

Entity goal(float x, float y) {
    return Entity{SDL_FRect{x, y, 56.0f, 96.0f}, EntityType::Goal, true, "ui_portal"};
}

void addGroundRange(LevelInfo& level, float x, float w) {
    for (float tileX = x; tileX < x + w; tileX += kGroundSegment) {
        const float tileW = std::min(kGroundSegment, x + w - tileX);
        level.platforms.push_back(platform(tileX, kGroundY, tileW, kGroundHeight, level.tileTextureId));
    }
}

bool trapBelowGap(const LevelInfo& level, float gapLeft, float gapRight) {
    const SDL_FRect gapRect{gapLeft, kGroundY - 8.0f, gapRight - gapLeft, 80.0f};
    return std::any_of(level.traps.begin(), level.traps.end(), [&](const Trap& current) {
        return current.active && checkAABB(gapRect, current.rect);
    });
}
}

// 第一关：古桥
// 主题：赵州桥意象与石拱桥通途。
// 关卡节奏：新手关，地面和桥面为主，只有两个短水坑和少量低平台。
// 陷阱设计：两个 104px 河水坑加一个 76px 石刺，全部低于 140px 安全上限。
// 敌人设计：两只石兽在宽桥面巡逻，不覆盖窄跳跃点。
// 难度定位：简单，主要帮助玩家熟悉移动、跳跃、收集和攻击。
LevelInfo createLevel1Bridge() {
    LevelInfo level;
    level.id = 1;
    level.title = "LEVEL 1 BRIDGE";
    level.subtitle = "Bridge wisdom over water";
    level.backgroundTextureId = "bg_bridge";
    level.tileTextureId = "tile_stone";
    level.enemyTextureId = "enemy_stone_beast";
    level.worldWidth = 2680.0f;
    level.playerSpawn = SDL_FPoint{80.0f, kGroundY - kPlayerHeight};

    addGroundRange(level, 0.0f, 672.0f);
    addGroundRange(level, 776.0f, 734.0f);
    addGroundRange(level, 1622.0f, 1058.0f);
    level.platforms.push_back(platform(360.0f, 420.0f, 180.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(820.0f, 430.0f, 320.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(1210.0f, 400.0f, 260.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(1665.0f, 420.0f, 360.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(2150.0f, 395.0f, 220.0f, 24.0f, level.tileTextureId));
    level.traps = {
        trap(672.0f, 492.0f, 104.0f, 42.0f, TrapType::Water, "trap_water"),
        trap(1510.0f, 492.0f, 112.0f, 42.0f, TrapType::Water, "trap_water"),
        trap(1312.0f, 452.0f, 76.0f, 24.0f, TrapType::Spike, "trap_spike"),
    };
    level.enemies = {
        Enemy(EnemyType::StoneBeast, SDL_FRect{900.0f, kGroundY - 42.0f, 44.0f, 42.0f}, 820.0f, 1140.0f),
        Enemy(EnemyType::StoneBeast, SDL_FRect{1745.0f, kGroundY - 42.0f, 44.0f, 42.0f}, 1665.0f, 2025.0f),
    };
    level.pages = {
        page(405.0f, 380.0f),
        page(705.0f, 430.0f),
        page(960.0f, 390.0f),
        page(1265.0f, 360.0f),
        page(2195.0f, 355.0f),
    };
    level.goal = goal(2540.0f, 380.0f);
    return level;
}

// 第二关：徽派古居
// 主题：白墙黑瓦、马头墙、屋檐和木梁。
// 关卡节奏：屋檐 / 木梁跳跃关，先上屋檐，再通过高低木梁回到庭院。
// 陷阱设计：水井、坠瓦和短地刺均不超过 116px，避开连续高压跳跃。
// 敌人设计：一个木偶在地面庭院巡逻，一个木偶在宽屋檐平台巡逻。
// 难度定位：简单偏中，重点训练垂直平台路线。
LevelInfo createLevel2Huizhou() {
    LevelInfo level;
    level.id = 2;
    level.title = "LEVEL 2 HUIZHOU";
    level.subtitle = "Climb roofs and timber beams";
    level.backgroundTextureId = "bg_huizhou";
    level.tileTextureId = "tile_wood";
    level.enemyTextureId = "enemy_wooden_puppet";
    level.worldWidth = 2920.0f;
    level.playerSpawn = SDL_FPoint{80.0f, kGroundY - kPlayerHeight};

    addGroundRange(level, 0.0f, 704.0f);
    addGroundRange(level, 808.0f, 612.0f);
    addGroundRange(level, 1500.0f, 590.0f);
    addGroundRange(level, 2190.0f, 730.0f);
    level.platforms.push_back(platform(380.0f, 405.0f, 180.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(610.0f, 350.0f, 190.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(850.0f, 305.0f, 250.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(1160.0f, 315.0f, 190.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(1410.0f, 380.0f, 140.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(1600.0f, 410.0f, 230.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(1865.0f, 372.0f, 150.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(2070.0f, 350.0f, 210.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(2350.0f, 410.0f, 240.0f, 24.0f, level.tileTextureId));
    level.traps = {
        trap(704.0f, 492.0f, 104.0f, 42.0f, TrapType::Spike, "trap_spike"),
        trap(1320.0f, 452.0f, 72.0f, 24.0f, TrapType::FallingStone, "trap_falling_stone"),
        trap(1940.0f, 452.0f, 72.0f, 24.0f, TrapType::FallingStone, "trap_falling_stone"),
        trap(2090.0f, 492.0f, 100.0f, 42.0f, TrapType::Spike, "trap_spike"),
    };
    level.enemies = {
        Enemy(EnemyType::WoodenPuppet, SDL_FRect{1010.0f, kGroundY - 42.0f, 42.0f, 42.0f}, 880.0f, 1300.0f),
        Enemy(EnemyType::WoodenPuppet, SDL_FRect{940.0f, 263.0f, 42.0f, 42.0f}, 875.0f, 1085.0f),
    };
    level.pages = {
        page(420.0f, 365.0f),
        page(675.0f, 310.0f),
        page(1000.0f, 265.0f),
        page(1690.0f, 370.0f),
        page(2415.0f, 370.0f),
    };
    level.goal = goal(2760.0f, 380.0f);
    return level;
}

// 第三关：县署衙门
// 主题：县衙大门、公堂、台阶和机关。
// 关卡节奏：规整台阶和机关压力关，中段有安全高台可绕开敌人。
// 陷阱设计：地刺与滚木机关分散布置，宽度 80～116px，避免封锁唯一通路。
// 敌人设计：衙役位于宽台阶和后段庭院，给压力但留有跳台躲避。
// 难度定位：中等，强调观察机关和选择路线。
LevelInfo createLevel3Yamen() {
    LevelInfo level;
    level.id = 3;
    level.title = "LEVEL 3 YAMEN";
    level.subtitle = "Steps, traps and patrol guards";
    level.backgroundTextureId = "bg_yamen";
    level.tileTextureId = "tile_brick";
    level.enemyTextureId = "enemy_yamen_guard";
    level.worldWidth = 3060.0f;
    level.playerSpawn = SDL_FPoint{80.0f, kGroundY - kPlayerHeight};

    addGroundRange(level, 0.0f, 760.0f);
    addGroundRange(level, 900.0f, 650.0f);
    addGroundRange(level, 1660.0f, 500.0f);
    addGroundRange(level, 2280.0f, 780.0f);
    level.platforms.push_back(platform(360.0f, 428.0f, 160.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(560.0f, 392.0f, 160.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(920.0f, 440.0f, 220.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(1180.0f, 404.0f, 220.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(1430.0f, 360.0f, 190.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(1740.0f, 330.0f, 220.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(2030.0f, 390.0f, 190.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(2420.0f, 430.0f, 260.0f, 24.0f, level.tileTextureId));
    level.traps = {
        trap(778.0f, 492.0f, 104.0f, 42.0f, TrapType::Spike, "trap_spike"),
        trap(1285.0f, 452.0f, 80.0f, 24.0f, TrapType::FallingStone, "trap_falling_stone"),
        trap(1572.0f, 492.0f, 72.0f, 42.0f, TrapType::Spike, "trap_spike"),
        trap(2168.0f, 492.0f, 96.0f, 42.0f, TrapType::FallingStone, "trap_falling_stone"),
    };
    level.enemies = {
        Enemy(EnemyType::YamenGuard, SDL_FRect{970.0f, kGroundY - 42.0f, 42.0f, 42.0f}, 910.0f, 1250.0f),
        Enemy(EnemyType::YamenGuard, SDL_FRect{2490.0f, kGroundY - 42.0f, 42.0f, 42.0f}, 2320.0f, 2700.0f),
    };
    level.pages = {
        page(405.0f, 388.0f),
        page(610.0f, 352.0f),
        page(1480.0f, 320.0f),
        page(1805.0f, 290.0f),
        page(2515.0f, 390.0f),
    };
    level.goal = goal(2905.0f, 380.0f);
    return level;
}

// 第四关：太和殿
// 主题：红墙金瓦、白玉台基、柱廊和宫殿入口。
// 关卡节奏：最终综合关，台基逐步上升，包含两段平台跳跃和最终宽平台。
// 陷阱设计：火盆、断裂台阶和短刺坑控制在 88～124px，较难但不超过跳跃安全线。
// 敌人设计：石狮放在宽台基平台上，玩家可跳跃绕行或攻击。
// 难度定位：中等偏难，综合移动、跳跃、攻击和收集。
LevelInfo createLevel4Taihe() {
    LevelInfo level;
    level.id = 4;
    level.title = "LEVEL 4 TAIHE";
    level.subtitle = "Ascend the imperial terraces";
    level.backgroundTextureId = "bg_taihe";
    level.tileTextureId = "tile_palace";
    level.enemyTextureId = "enemy_palace_lion";
    level.worldWidth = 3240.0f;
    level.playerSpawn = SDL_FPoint{80.0f, kGroundY - kPlayerHeight};

    addGroundRange(level, 0.0f, 680.0f);
    addGroundRange(level, 812.0f, 540.0f);
    addGroundRange(level, 1480.0f, 450.0f);
    addGroundRange(level, 2060.0f, 430.0f);
    addGroundRange(level, 2620.0f, 620.0f);
    level.platforms.push_back(platform(350.0f, 420.0f, 180.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(820.0f, 420.0f, 220.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(1085.0f, 370.0f, 190.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(1420.0f, 330.0f, 190.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(1740.0f, 375.0f, 250.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(2140.0f, 325.0f, 210.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(2520.0f, 385.0f, 250.0f, 24.0f, level.tileTextureId));
    level.platforms.push_back(platform(2840.0f, 350.0f, 220.0f, 24.0f, level.tileTextureId));
    level.traps = {
        trap(692.0f, 492.0f, 108.0f, 42.0f, TrapType::Fire, "trap_fire"),
        trap(1368.0f, 492.0f, 96.0f, 42.0f, TrapType::Spike, "trap_spike"),
        trap(1848.0f, 452.0f, 88.0f, 24.0f, TrapType::Fire, "trap_fire"),
        trap(2508.0f, 492.0f, 96.0f, 42.0f, TrapType::Spike, "trap_spike"),
        trap(2700.0f, 452.0f, 92.0f, 24.0f, TrapType::Fire, "trap_fire"),
    };
    level.enemies = {
        Enemy(EnemyType::PalaceLion, SDL_FRect{900.0f, kGroundY - 42.0f, 46.0f, 42.0f}, 820.0f, 1160.0f),
        Enemy(EnemyType::PalaceLion, SDL_FRect{2665.0f, kGroundY - 42.0f, 46.0f, 42.0f}, 2620.0f, 2860.0f),
    };
    level.pages = {
        page(395.0f, 380.0f),
        page(1130.0f, 330.0f),
        page(1480.0f, 290.0f),
        page(2185.0f, 285.0f),
        page(2885.0f, 310.0f),
    };
    level.goal = goal(3095.0f, 380.0f);
    return level;
}

LevelInfo createLevelById(int id) {
    switch (std::clamp(id, 1, 4)) {
        case 1: return createLevel1Bridge();
        case 2: return createLevel2Huizhou();
        case 3: return createLevel3Yamen();
        case 4: return createLevel4Taihe();
    }
    return createLevel1Bridge();
}

void validateLevelDesign(const LevelInfo& level) {
    for (const Trap& current : level.traps) {
        if (current.rect.w > kSafeTrapWidth) {
            std::cerr << "[LevelDesign] Warning: " << level.title << " trap at x="
                      << current.rect.x << " is " << current.rect.w
                      << "px wide; safe max is " << kSafeTrapWidth << "px.\n";
        }
    }

    std::vector<SDL_FRect> ground;
    for (const Entity& current : level.platforms) {
        if (current.active && std::abs(current.rect.y - kGroundY) < 1.0f) {
            ground.push_back(current.rect);
        }
    }
    std::sort(ground.begin(), ground.end(), [](const SDL_FRect& a, const SDL_FRect& b) {
        return a.x < b.x;
    });
    for (std::size_t i = 1; i < ground.size(); ++i) {
        const float gap = ground[i].x - (ground[i - 1].x + ground[i - 1].w);
        if (gap > 160.0f && trapBelowGap(level, ground[i - 1].x + ground[i - 1].w, ground[i].x)) {
            std::cerr << "[LevelDesign] Warning: " << level.title << " has "
                      << gap << "px ground gap over a trap near x="
                      << (ground[i - 1].x + ground[i - 1].w) << ".\n";
        }
    }

    if (level.pages.size() != 5) {
        std::cerr << "[LevelDesign] Warning: " << level.title << " has "
                  << level.pages.size() << " pages; expected 5.\n";
    }

    if (level.enemies.empty()) {
        std::cerr << "[LevelDesign] Warning: " << level.title << " has no enemies.\n";
    }

    const float goalDistance = level.worldWidth - (level.goal.rect.x + level.goal.rect.w);
    if (goalDistance < 40.0f || goalDistance > 260.0f) {
        std::cerr << "[LevelDesign] Warning: " << level.title << " goal is "
                  << goalDistance << "px from world end; expected roughly 40-260px.\n";
    }
}
