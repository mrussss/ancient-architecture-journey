#include "TextureManager.h"

#include <SDL_image.h>

#include <iostream>

TextureManager::~TextureManager() {
    clean();
}

bool TextureManager::init(SDL_Renderer* renderer) {
    renderer_ = renderer;

    const int flags = IMG_INIT_PNG;
    const int initialized = IMG_Init(flags);
    imageInitialized_ = (initialized & flags) == flags;
    if (!imageInitialized_) {
        std::cerr << "SDL_image PNG initialization failed: " << IMG_GetError() << '\n';
        return false;
    }

    return true;
}

void TextureManager::clean() {
    for (auto& [id, texture] : textures_) {
        (void)id;
        if (texture) {
            SDL_DestroyTexture(texture);
        }
    }
    textures_.clear();

    if (imageInitialized_) {
        IMG_Quit();
        imageInitialized_ = false;
    }

    renderer_ = nullptr;
}

bool TextureManager::load(const std::string& id, const std::string& path) {
    if (!renderer_) {
        std::cerr << "Cannot load texture '" << id << "': TextureManager has no renderer.\n";
        return false;
    }

    SDL_Texture* texture = IMG_LoadTexture(renderer_, path.c_str());
    if (!texture) {
        std::cerr << "Failed to load PNG texture '" << id << "' from " << path << ": " << IMG_GetError() << '\n';
        return false;
    }

    SDL_SetTextureBlendMode(texture, SDL_BLENDMODE_BLEND);

    auto existing = textures_.find(id);
    if (existing != textures_.end() && existing->second) {
        SDL_DestroyTexture(existing->second);
    }
    textures_[id] = texture;
    return true;
}

SDL_Texture* TextureManager::get(const std::string& id) const {
    const auto found = textures_.find(id);
    if (found == textures_.end()) {
        return nullptr;
    }
    return found->second;
}

bool TextureManager::has(const std::string& id) const {
    return get(id) != nullptr;
}

bool TextureManager::render(const std::string& id, const SDL_FRect& destination) const {
    SDL_Texture* texture = get(id);
    if (!texture) {
        return false;
    }
    return SDL_RenderCopyF(renderer_, texture, nullptr, &destination) == 0;
}

bool TextureManager::render(const std::string& id, const SDL_Rect& source, const SDL_FRect& destination) const {
    SDL_Texture* texture = get(id);
    if (!texture) {
        return false;
    }
    return SDL_RenderCopyF(renderer_, texture, &source, &destination) == 0;
}
