#pragma once

#include <SDL.h>

#include <string>

enum class EntityType {
    Platform,
    Goal
};

struct Entity {
    SDL_FRect rect{};
    EntityType type{EntityType::Platform};
    bool active{true};
    std::string textureId;
};
