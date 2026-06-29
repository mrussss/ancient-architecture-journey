#include "LevelData.h"

#include "Constants.h"

#include <algorithm>

namespace {
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

void addGroundSegments(LevelInfo& level, const std::vector<SDL_FRect>& gaps) {
    const float groundY = 476.0f;
    const float segment = 64.0f;
    for (float x = 0.0f; x < level.worldWidth; x += segment) {
        SDL_FRect tile{x, groundY, segment, 64.0f};
        bool inGap = false;
        for (const SDL_FRect& gap : gaps) {
            if (tile.x < gap.x + gap.w && tile.x + tile.w > gap.x) {
                inGap = true;
                break;
            }
        }
        if (!inGap) {
            level.platforms.push_back(platform(tile.x, tile.y, tile.w, tile.h, level.tileTextureId));
        }
    }
}
}

LevelInfo createLevel1Bridge() {
    LevelInfo level;
    level.id = 1;
    level.title = "LEVEL 1 BRIDGE";
    level.subtitle = "Bridge wisdom over water";
    level.backgroundTextureId = "bg_bridge";
    level.tileTextureId = "tile_stone";
    level.enemyTextureId = "enemy_stone_beast";
    level.worldWidth = 2600.0f;
    level.playerSpawn = SDL_FPoint{80.0f, 428.0f};

    addGroundSegments(level, {SDL_FRect{640.0f, 0.0f, 170.0f, 0.0f}, SDL_FRect{1560.0f, 0.0f, 190.0f, 0.0f}});
    level.platforms.push_back(platform(420.0f, 390.0f, 180.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(850.0f, 410.0f, 260.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(1180.0f, 350.0f, 260.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(1780.0f, 395.0f, 280.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(2140.0f, 340.0f, 180.0f, 28.0f, level.tileTextureId));
    level.traps = {
        trap(650.0f, 492.0f, 150.0f, 42.0f, TrapType::Water, "trap_water"),
        trap(1570.0f, 492.0f, 170.0f, 42.0f, TrapType::Water, "trap_water"),
        trap(1320.0f, 452.0f, 80.0f, 24.0f, TrapType::Spike, "trap_spike"),
    };
    level.enemies = {
        Enemy(EnemyType::StoneBeast, SDL_FRect{930.0f, 434.0f, 44.0f, 42.0f}, 860.0f, 1110.0f),
        Enemy(EnemyType::StoneBeast, SDL_FRect{1850.0f, 434.0f, 44.0f, 42.0f}, 1780.0f, 2060.0f),
    };
    level.pages = {page(450.0f, 350.0f), page(910.0f, 368.0f), page(1260.0f, 310.0f), page(1900.0f, 355.0f), page(2190.0f, 300.0f)};
    level.goal = goal(2460.0f, 380.0f);
    return level;
}

LevelInfo createLevel2Huizhou() {
    LevelInfo level;
    level.id = 2;
    level.title = "LEVEL 2 HUIZHOU";
    level.subtitle = "White walls, black tiles, timber beams";
    level.backgroundTextureId = "bg_huizhou";
    level.tileTextureId = "tile_wood";
    level.enemyTextureId = "enemy_wooden_puppet";
    level.worldWidth = 2850.0f;
    level.playerSpawn = SDL_FPoint{80.0f, 428.0f};

    addGroundSegments(level, {SDL_FRect{760.0f, 0.0f, 150.0f, 0.0f}, SDL_FRect{1890.0f, 0.0f, 160.0f, 0.0f}});
    level.platforms.push_back(platform(360.0f, 390.0f, 170.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(610.0f, 330.0f, 170.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(990.0f, 410.0f, 250.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(1320.0f, 350.0f, 240.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(1640.0f, 300.0f, 180.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(2140.0f, 385.0f, 260.0f, 28.0f, level.tileTextureId));
    level.traps = {
        trap(785.0f, 492.0f, 105.0f, 42.0f, TrapType::Spike, "trap_spike"),
        trap(1210.0f, 452.0f, 70.0f, 24.0f, TrapType::FallingStone, "trap_falling_stone"),
        trap(1700.0f, 452.0f, 72.0f, 24.0f, TrapType::FallingStone, "trap_falling_stone"),
        trap(1915.0f, 492.0f, 120.0f, 42.0f, TrapType::Spike, "trap_spike"),
    };
    level.enemies = {
        Enemy(EnemyType::WoodenPuppet, SDL_FRect{1030.0f, 434.0f, 42.0f, 42.0f}, 990.0f, 1240.0f),
        Enemy(EnemyType::WoodenPuppet, SDL_FRect{2200.0f, 434.0f, 42.0f, 42.0f}, 2140.0f, 2400.0f),
    };
    level.pages = {page(395.0f, 350.0f), page(650.0f, 290.0f), page(1380.0f, 310.0f), page(1685.0f, 260.0f), page(2250.0f, 345.0f)};
    level.goal = goal(2700.0f, 380.0f);
    return level;
}

LevelInfo createLevel3Yamen() {
    LevelInfo level;
    level.id = 3;
    level.title = "LEVEL 3 YAMEN";
    level.subtitle = "Order, gatehouses, drums and red pillars";
    level.backgroundTextureId = "bg_yamen";
    level.tileTextureId = "tile_brick";
    level.enemyTextureId = "enemy_yamen_guard";
    level.worldWidth = 3000.0f;
    level.playerSpawn = SDL_FPoint{80.0f, 428.0f};

    addGroundSegments(level, {SDL_FRect{650.0f, 0.0f, 145.0f, 0.0f}, SDL_FRect{1460.0f, 0.0f, 165.0f, 0.0f}, SDL_FRect{2260.0f, 0.0f, 145.0f, 0.0f}});
    level.platforms.push_back(platform(320.0f, 390.0f, 170.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(850.0f, 385.0f, 240.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(1150.0f, 325.0f, 160.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(1680.0f, 390.0f, 270.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(2040.0f, 330.0f, 160.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(2460.0f, 380.0f, 240.0f, 28.0f, level.tileTextureId));
    level.traps = {
        trap(670.0f, 492.0f, 100.0f, 42.0f, TrapType::Spike, "trap_spike"),
        trap(1490.0f, 492.0f, 110.0f, 42.0f, TrapType::FallingStone, "trap_falling_stone"),
        trap(1780.0f, 452.0f, 82.0f, 24.0f, TrapType::Spike, "trap_spike"),
        trap(2280.0f, 492.0f, 105.0f, 42.0f, TrapType::FallingStone, "trap_falling_stone"),
    };
    level.enemies = {
        Enemy(EnemyType::YamenGuard, SDL_FRect{900.0f, 434.0f, 42.0f, 42.0f}, 850.0f, 1090.0f),
        Enemy(EnemyType::YamenGuard, SDL_FRect{2510.0f, 434.0f, 42.0f, 42.0f}, 2460.0f, 2700.0f),
    };
    level.pages = {page(360.0f, 350.0f), page(910.0f, 345.0f), page(1190.0f, 285.0f), page(2070.0f, 290.0f), page(2550.0f, 340.0f)};
    level.goal = goal(2840.0f, 380.0f);
    return level;
}

LevelInfo createLevel4Taihe() {
    LevelInfo level;
    level.id = 4;
    level.title = "LEVEL 4 TAIHE";
    level.subtitle = "Imperial axis, golden roofs and marble terraces";
    level.backgroundTextureId = "bg_taihe";
    level.tileTextureId = "tile_palace";
    level.enemyTextureId = "enemy_palace_lion";
    level.worldWidth = 3150.0f;
    level.playerSpawn = SDL_FPoint{80.0f, 428.0f};

    addGroundSegments(level, {SDL_FRect{710.0f, 0.0f, 150.0f, 0.0f}, SDL_FRect{1530.0f, 0.0f, 165.0f, 0.0f}, SDL_FRect{2380.0f, 0.0f, 150.0f, 0.0f}});
    level.platforms.push_back(platform(330.0f, 390.0f, 170.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(930.0f, 370.0f, 220.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(1220.0f, 310.0f, 170.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(1760.0f, 375.0f, 250.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(2070.0f, 315.0f, 190.0f, 28.0f, level.tileTextureId));
    level.platforms.push_back(platform(2600.0f, 360.0f, 270.0f, 28.0f, level.tileTextureId));
    level.traps = {
        trap(730.0f, 492.0f, 110.0f, 42.0f, TrapType::Fire, "trap_fire"),
        trap(1545.0f, 492.0f, 125.0f, 42.0f, TrapType::Spike, "trap_spike"),
        trap(1875.0f, 452.0f, 78.0f, 24.0f, TrapType::Fire, "trap_fire"),
        trap(2400.0f, 492.0f, 120.0f, 42.0f, TrapType::Spike, "trap_spike"),
    };
    level.enemies = {
        Enemy(EnemyType::PalaceLion, SDL_FRect{980.0f, 434.0f, 46.0f, 42.0f}, 930.0f, 1150.0f),
        Enemy(EnemyType::PalaceLion, SDL_FRect{2650.0f, 434.0f, 46.0f, 42.0f}, 2600.0f, 2870.0f),
    };
    level.pages = {page(365.0f, 350.0f), page(1000.0f, 330.0f), page(1260.0f, 270.0f), page(2120.0f, 275.0f), page(2690.0f, 320.0f)};
    level.goal = goal(3000.0f, 380.0f);
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
