#pragma once

#include <SDL.h>

#include <string>
#include <unordered_map>

class TextureManager {
public:
    TextureManager() = default;
    ~TextureManager();

    TextureManager(const TextureManager&) = delete;
    TextureManager& operator=(const TextureManager&) = delete;

    bool init(SDL_Renderer* renderer);
    void clean();

    bool load(const std::string& id, const std::string& path);
    SDL_Texture* get(const std::string& id) const;
    bool has(const std::string& id) const;
    bool querySize(const std::string& id, int& width, int& height) const;

    bool render(const std::string& id, const SDL_FRect& destination) const;
    bool render(const std::string& id, const SDL_Rect& source, const SDL_FRect& destination) const;

private:
    SDL_Renderer* renderer_{nullptr};
    bool imageInitialized_{false};
    std::unordered_map<std::string, SDL_Texture*> textures_;
};
