#include "Level.h"

#include "Constants.h"

#include <fstream>
#include <iostream>

bool Level::loadFromFile(const std::string& path) {
    std::ifstream file(path);
    if (!file) {
        std::cerr << "Could not open level file: " << path << ". Loading fallback level.\n";
        loadFallback();
        return false;
    }

    std::vector<std::string> lines;
    std::string line;
    while (std::getline(file, line)) {
        if (!line.empty() && line.back() == '\r') {
            line.pop_back();
        }
        if (!line.empty()) {
            lines.push_back(line);
        }
    }

    if (lines.empty()) {
        std::cerr << "Level file is empty: " << path << ". Loading fallback level.\n";
        loadFallback();
        return false;
    }

    parseLines(lines);
    return true;
}

void Level::loadFallback() {
    parseLines({
        "..............................",
        "..............................",
        "..............................",
        "..............................",
        "..............................",
        "..............................",
        "......................C.......",
        ".....................####.....",
        ".............C................",
        "............####..............",
        "..............................",
        ".....C...............####..F..",
        "....####..................####",
        ".P............................",
        "###########....###############",
        "##############################",
        "##############################",
    });
}

const std::vector<Entity>& Level::platforms() const {
    return platforms_;
}

SDL_FPoint Level::playerSpawn() const {
    return playerSpawn_;
}

void Level::parseLines(const std::vector<std::string>& lines) {
    platforms_.clear();
    playerSpawn_ = SDL_FPoint{64.0f, 384.0f};

    for (std::size_t row = 0; row < lines.size(); ++row) {
        for (std::size_t col = 0; col < lines[row].size(); ++col) {
            const float x = static_cast<float>(col) * kTileSize;
            const float y = static_cast<float>(row) * kTileSize;

            switch (lines[row][col]) {
                case '#':
                    platforms_.push_back(Entity{SDL_FRect{x, y, kTileSize, kTileSize}, EntityType::Platform, true});
                    break;
                case 'P':
                    playerSpawn_ = SDL_FPoint{x, y + kTileSize - kPlayerHeight};
                    break;
                default:
                    break;
            }
        }
    }
}
