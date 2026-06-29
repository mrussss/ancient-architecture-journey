#pragma once

#include "LevelData.h"
#include "Player.h"
#include "TextureManager.h"
#include "UI.h"

#include <SDL.h>

#include <array>
#include <string>
#include <vector>

enum class GameState {
    MainMenu,
    LevelSelect,
    Story,
    Playing,
    Paused,
    LevelComplete,
    GameOver,
    FinalComplete
};

enum class StoryKind {
    Intro,
    Complete
};

class Game {
public:
    Game();
    ~Game();

    bool init();
    void run();
    void runOneFrame(float deltaTime);
    void clean();

private:
    void handleEvents();
    void handleKeyDown(SDL_Keycode key);
    void handleMouseMove(int x, int y);
    void handleMouseClick(int x, int y);
    void activateSelectedButton();

    void update(float deltaTime);
    void updatePlaying(float deltaTime);
    void render();

    void loadTextures();
    void loadLevel(int levelId);
    void startLevel(int levelId, bool showStory);
    void restartLevel();
    void completeLevel();
    void returnToLevelSelect();
    void startStory(StoryKind kind);
    void advanceStory();
    std::vector<std::string> buildStoryPages(StoryKind kind) const;

    void updateCamera();
    void resolveHorizontalCollisions();
    void resolveVerticalCollisions();
    int collectedPages() const;
    int totalPages() const;

    SDL_FRect toScreenRect(const SDL_FRect& worldRect) const;
    bool pointInRect(float x, float y, const SDL_FRect& rect) const;

    void rebuildButtons();
    void renderBackground() const;
    void renderLevel() const;
    void renderPlayer() const;
    void renderHud() const;
    void renderStory() const;
    void renderMenuLikeScreen(const std::string& title, const std::string& subtitle) const;
    void renderButtons() const;
    void renderButton(const Button& button, bool selected) const;
    void renderPanel(float x, float y, float w, float h) const;
    void drawText(const std::string& text, float x, float y, int scale, SDL_Color color) const;
    void drawWrappedText(const std::string& text, float x, float y, int scale, float maxWidth, SDL_Color color) const;
    void fillRect(const SDL_FRect& rect, SDL_Color color) const;
    void frameRect(const SDL_FRect& rect, SDL_Color color) const;

    SDL_Window* window_{nullptr};
    SDL_Renderer* renderer_{nullptr};
    bool running_{false};
    GameState state_{GameState::MainMenu};
    GameState previousPlayingState_{GameState::Playing};
    InputState input_{};
    Player player_{};
    LevelInfo level_{};
    TextureManager textures_{};
    std::vector<Button> buttons_{};
    int selectedButton_{0};
    int currentLevelId_{1};
    float cameraX_{0.0f};
    bool mouseDownConsumed_{false};
    StoryKind storyKind_{StoryKind::Intro};
    std::vector<std::string> storyPages_{};
    std::size_t storyIndex_{0};
};
