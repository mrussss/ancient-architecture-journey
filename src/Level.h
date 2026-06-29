#pragma once

#include "Entity.h"

#include <SDL.h>

#include <string>
#include <vector>

class Level {
public:
    bool loadFromFile(const std::string& path);
    void loadFallback();

    const std::vector<Entity>& platforms() const;
    SDL_FPoint playerSpawn() const;

private:
    void parseLines(const std::vector<std::string>& lines);

    std::vector<Entity> platforms_;
    SDL_FPoint playerSpawn_{64.0f, 384.0f};
};
