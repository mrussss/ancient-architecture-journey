#pragma once

#include "Level.h"
#include "Player.h"
#include "TextureManager.h"

#include <SDL.h>

#include <string>
#include <vector>

enum class GameState {
    Playing,
    Dialog,
    Cutscene,
    LevelComplete
};

enum class TriggerType {
    NpcDialog,
    BridgeCenterCutscene,
    LevelExit
};

struct TriggerZone {
    SDL_FRect rect{};
    TriggerType type{TriggerType::NpcDialog};
    bool triggered{false};
};

struct DialogLine {
    std::string speaker;
    std::string text;
};

struct CutsceneState {
    float timer{0.0f};
    bool finished{false};
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
    void update(float deltaTime);
    void render();
    void resetGame();

    void resolveHorizontalCollisions();
    void resolveVerticalCollisions();
    void updateWindowTitle();

    void loadTextures();
    void resetTriggers();
    void checkTriggers();
    void startDialog();
    void advanceDialog();
    void startCutscene();
    void updateCutscene(float deltaTime);
    void updateCamera(float deltaTime);
    SDL_FRect toScreenRect(const SDL_FRect& worldRect) const;

    void renderAncientBackground(bool drawCodeBridge) const;
    void renderLevel() const;
    void renderNpc() const;
    void renderPlayer() const;
    void renderBridgeBack() const;
    void renderBridgeFront() const;
    void renderDialog() const;
    void renderCutsceneWater() const;
    void renderCutsceneOverlay() const;
    void renderHud() const;
    void renderStateOverlay() const;
    void drawText(const std::string& text, float x, float y, int scale, SDL_Color color) const;
    void drawWrappedText(const std::string& text, float x, float y, int scale, float maxWidth, SDL_Color color) const;

    SDL_Window* window_{nullptr};
    SDL_Renderer* renderer_{nullptr};
    bool running_{false};
    bool restartRequested_{false};
    bool advanceRequested_{false};
    GameState state_{GameState::Playing};
    InputState input_{};
    Player player_{};
    Level level_{};
    TextureManager textures_{};
    std::vector<Entity> bridgePlatforms_{};
    std::vector<TriggerZone> triggers_{};
    std::vector<DialogLine> dialogLines_{};
    std::size_t dialogIndex_{0};
    CutsceneState cutscene_{};
    float walkAnimationTimer_{0.0f};
    float cameraX_{0.0f};
};
