#pragma once

#include "Collectible.h"
#include "Enemy.h"
#include "Entity.h"
#include "Trap.h"

#include <SDL.h>

#include <string>
#include <vector>

struct LevelInfo {
    int id{1};
    std::string title;
    std::string subtitle;
    std::string backgroundTextureId;
    std::string tileTextureId;
    std::string enemyTextureId;
    SDL_FPoint playerSpawn{80.0f, 380.0f};
    float worldWidth{2800.0f};
    float worldHeight{540.0f};
    std::vector<Entity> platforms;
    std::vector<Collectible> pages;
    std::vector<Trap> traps;
    std::vector<Enemy> enemies;
    Entity goal;
};

LevelInfo createLevel1Bridge();
LevelInfo createLevel2Huizhou();
LevelInfo createLevel3Yamen();
LevelInfo createLevel4Taihe();
LevelInfo createLevelById(int id);
void validateLevelDesign(const LevelInfo& level);
