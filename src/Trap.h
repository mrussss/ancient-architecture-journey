#pragma once

#include <SDL.h>

#include <string>

enum class TrapType {
    Water,
    Spike,
    Fire,
    FallingStone
};

struct Trap {
    SDL_FRect rect{};
    TrapType type{TrapType::Spike};
    int damage{1};
    bool active{true};
    std::string textureId;
};
