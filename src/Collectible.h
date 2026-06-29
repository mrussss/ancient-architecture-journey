#pragma once

#include <SDL.h>

#include <string>

enum class CollectibleType {
    Page
};

struct Collectible {
    SDL_FRect rect{};
    CollectibleType type{CollectibleType::Page};
    bool collected{false};
    std::string textureId;
};
