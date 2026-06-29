#pragma once

#include <SDL.h>

#include <string>

struct Button {
    SDL_FRect rect{};
    std::string text;
    bool hovered{false};
};
