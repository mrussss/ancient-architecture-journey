#pragma once

#include <SDL.h>

enum class EntityType {
    Platform
};

struct Entity {
    SDL_FRect rect{};
    EntityType type{EntityType::Platform};
    bool active{true};
};
