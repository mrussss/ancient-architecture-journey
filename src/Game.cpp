#include "Game.h"

#include "Collision.h"
#include "Constants.h"

#include <SDL.h>

#include <algorithm>
#include <array>
#include <cctype>
#include <cmath>
#include <iostream>
#include <sstream>
#include <string_view>
#include <vector>

namespace {
constexpr float kPi = 3.14159265358979323846f;
constexpr float kWorldWidth = 2200.0f;
constexpr float kMaxStepUp = 22.0f;
constexpr SDL_FRect kNpcRect{420.0f, 156.0f, 64.0f, 96.0f};
constexpr SDL_FRect kPlayerSpawnRect{480.0f, 204.0f, kPlayerWidth, kPlayerHeight};
constexpr SDL_FRect kBridgeBackRect{520.0f, 120.0f, 900.0f, 300.0f};
constexpr SDL_FRect kBridgeFrontRect{520.0f, 188.0f, 900.0f, 120.0f};
constexpr SDL_FRect kDialogRect{40.0f, 370.0f, 880.0f, 140.0f};

float clampCamera(float cameraX) {
    return std::clamp(cameraX, 0.0f, kWorldWidth - static_cast<float>(kWindowWidth));
}

std::string levelPath() {
#ifdef ASSET_DIR
    return std::string(ASSET_DIR) + "/levels/level1.txt";
#else
    return "assets/levels/level1.txt";
#endif
}

std::string imagePath(const std::string& relativePath) {
#ifdef ASSET_DIR
    return std::string(ASSET_DIR) + "/images/" + relativePath;
#else
    return "assets/images/" + relativePath;
#endif
}

std::array<std::string_view, 7> glyphFor(char c) {
    switch (c) {
        case '0': return {"01110", "10001", "10011", "10101", "11001", "10001", "01110"};
        case '1': return {"00100", "01100", "00100", "00100", "00100", "00100", "01110"};
        case '2': return {"01110", "10001", "00001", "00010", "00100", "01000", "11111"};
        case '3': return {"11110", "00001", "00001", "01110", "00001", "00001", "11110"};
        case '4': return {"10010", "10010", "10010", "11111", "00010", "00010", "00010"};
        case '5': return {"11111", "10000", "10000", "11110", "00001", "00001", "11110"};
        case '6': return {"01110", "10000", "10000", "11110", "10001", "10001", "01110"};
        case '7': return {"11111", "00001", "00010", "00100", "01000", "01000", "01000"};
        case '8': return {"01110", "10001", "10001", "01110", "10001", "10001", "01110"};
        case '9': return {"01110", "10001", "10001", "01111", "00001", "00001", "01110"};
        case 'A': return {"01110", "10001", "10001", "11111", "10001", "10001", "10001"};
        case 'B': return {"11110", "10001", "10001", "11110", "10001", "10001", "11110"};
        case 'C': return {"01111", "10000", "10000", "10000", "10000", "10000", "01111"};
        case 'D': return {"11110", "10001", "10001", "10001", "10001", "10001", "11110"};
        case 'E': return {"11111", "10000", "10000", "11110", "10000", "10000", "11111"};
        case 'F': return {"11111", "10000", "10000", "11110", "10000", "10000", "10000"};
        case 'G': return {"01111", "10000", "10000", "10011", "10001", "10001", "01111"};
        case 'H': return {"10001", "10001", "10001", "11111", "10001", "10001", "10001"};
        case 'I': return {"11111", "00100", "00100", "00100", "00100", "00100", "11111"};
        case 'J': return {"00111", "00010", "00010", "00010", "00010", "10010", "01100"};
        case 'K': return {"10001", "10010", "10100", "11000", "10100", "10010", "10001"};
        case 'L': return {"10000", "10000", "10000", "10000", "10000", "10000", "11111"};
        case 'M': return {"10001", "11011", "10101", "10101", "10001", "10001", "10001"};
        case 'N': return {"10001", "11001", "10101", "10011", "10001", "10001", "10001"};
        case 'O': return {"01110", "10001", "10001", "10001", "10001", "10001", "01110"};
        case 'P': return {"11110", "10001", "10001", "11110", "10000", "10000", "10000"};
        case 'Q': return {"01110", "10001", "10001", "10001", "10101", "10010", "01101"};
        case 'R': return {"11110", "10001", "10001", "11110", "10100", "10010", "10001"};
        case 'S': return {"01111", "10000", "10000", "01110", "00001", "00001", "11110"};
        case 'T': return {"11111", "00100", "00100", "00100", "00100", "00100", "00100"};
        case 'U': return {"10001", "10001", "10001", "10001", "10001", "10001", "01110"};
        case 'V': return {"10001", "10001", "10001", "10001", "10001", "01010", "00100"};
        case 'W': return {"10001", "10001", "10001", "10101", "10101", "10101", "01010"};
        case 'X': return {"10001", "10001", "01010", "00100", "01010", "10001", "10001"};
        case 'Y': return {"10001", "10001", "01010", "00100", "00100", "00100", "00100"};
        case 'Z': return {"11111", "00001", "00010", "00100", "01000", "10000", "11111"};
        case ' ': return {"00000", "00000", "00000", "00000", "00000", "00000", "00000"};
        case '-': return {"00000", "00000", "00000", "11111", "00000", "00000", "00000"};
        default: return {"11111", "00001", "00010", "00100", "00100", "00000", "00100"};
    }
}

std::string normalizeText(std::string text) {
    for (char& c : text) {
        const unsigned char value = static_cast<unsigned char>(c);
        if (std::isalnum(value) || c == ' ' || c == '-') {
            c = static_cast<char>(std::toupper(value));
        } else {
            c = ' ';
        }
    }
    return text;
}

void setDrawColor(SDL_Renderer* renderer, SDL_Color color) {
    SDL_SetRenderDrawColor(renderer, color.r, color.g, color.b, color.a);
}

void fillRect(SDL_Renderer* renderer, float x, float y, float w, float h, SDL_Color color) {
    setDrawColor(renderer, color);
    SDL_FRect rect{x, y, w, h};
    SDL_RenderFillRectF(renderer, &rect);
}

void drawLine(SDL_Renderer* renderer, float x1, float y1, float x2, float y2, SDL_Color color) {
    setDrawColor(renderer, color);
    SDL_RenderDrawLineF(renderer, x1, y1, x2, y2);
}

void drawThickLine(SDL_Renderer* renderer, float x1, float y1, float x2, float y2, int thickness, SDL_Color color) {
    const int half = thickness / 2;
    for (int offset = -half; offset <= half; ++offset) {
        drawLine(renderer, x1, y1 + static_cast<float>(offset), x2, y2 + static_cast<float>(offset), color);
    }
}

void drawFilledCircle(SDL_Renderer* renderer, float cx, float cy, float radius, SDL_Color color) {
    setDrawColor(renderer, color);
    const int intRadius = static_cast<int>(radius);
    for (int y = -intRadius; y <= intRadius; ++y) {
        const float span = std::sqrt(std::max(0.0f, radius * radius - static_cast<float>(y * y)));
        SDL_RenderDrawLineF(renderer, cx - span, cy + static_cast<float>(y), cx + span, cy + static_cast<float>(y));
    }
}

void drawMountain(SDL_Renderer* renderer, float left, float baseY, float peakX, float peakY, float right, SDL_Color color) {
    setDrawColor(renderer, color);
    const int startY = static_cast<int>(std::floor(peakY));
    const int endY = static_cast<int>(std::ceil(baseY));

    for (int y = startY; y <= endY; ++y) {
        const float t = (static_cast<float>(y) - peakY) / (baseY - peakY);
        const float x1 = peakX + (left - peakX) * t;
        const float x2 = peakX + (right - peakX) * t;
        SDL_RenderDrawLineF(renderer, x1, static_cast<float>(y), x2, static_cast<float>(y));
    }
}

void drawCloud(SDL_Renderer* renderer, float x, float y, float scale) {
    const SDL_Color shadow{210, 220, 215, 190};
    const SDL_Color cloud{235, 240, 230, 210};

    fillRect(renderer, x + 10.0f * scale, y + 12.0f * scale, 78.0f * scale, 10.0f * scale, shadow);
    drawFilledCircle(renderer, x + 22.0f * scale, y + 15.0f * scale, 12.0f * scale, shadow);
    drawFilledCircle(renderer, x + 46.0f * scale, y + 9.0f * scale, 16.0f * scale, shadow);
    drawFilledCircle(renderer, x + 70.0f * scale, y + 15.0f * scale, 12.0f * scale, shadow);

    fillRect(renderer, x + 6.0f * scale, y + 8.0f * scale, 80.0f * scale, 8.0f * scale, cloud);
    drawFilledCircle(renderer, x + 20.0f * scale, y + 10.0f * scale, 11.0f * scale, cloud);
    drawFilledCircle(renderer, x + 42.0f * scale, y + 4.0f * scale, 15.0f * scale, cloud);
    drawFilledCircle(renderer, x + 66.0f * scale, y + 10.0f * scale, 11.0f * scale, cloud);

    drawLine(renderer, x + 4.0f * scale, y + 22.0f * scale, x + 92.0f * scale, y + 22.0f * scale, SDL_Color{190, 205, 198, 170});
}

void carveArch(SDL_Renderer* renderer, float centerX, float bottomY, float radiusX, float radiusY, SDL_Color fill, SDL_Color outline) {
    setDrawColor(renderer, fill);
    for (int offset = static_cast<int>(-radiusX); offset <= static_cast<int>(radiusX); ++offset) {
        const float dx = static_cast<float>(offset);
        const float normalized = 1.0f - (dx * dx) / (radiusX * radiusX);
        const float curveY = bottomY - std::sqrt(std::max(0.0f, normalized)) * radiusY;
        SDL_RenderDrawLineF(renderer, centerX + dx, curveY, centerX + dx, bottomY + 8.0f);
    }

    setDrawColor(renderer, outline);
    SDL_FPoint previous{centerX - radiusX, bottomY};
    for (int step = 1; step <= 96; ++step) {
        const float angle = kPi - (kPi * static_cast<float>(step) / 96.0f);
        const SDL_FPoint current{
            centerX + std::cos(angle) * radiusX,
            bottomY - std::sin(angle) * radiusY
        };
        SDL_RenderDrawLineF(renderer, previous.x, previous.y, current.x, current.y);
        previous = current;
    }
}

void renderStonePlatform(SDL_Renderer* renderer, const SDL_FRect& rect) {
    const SDL_Color body{115, 120, 115, 255};
    const SDL_Color edge{70, 75, 70, 255};
    const SDL_Color lightLine{150, 155, 150, 255};
    const SDL_Color darkLine{90, 95, 90, 255};

    fillRect(renderer, rect.x, rect.y, rect.w, rect.h, body);

    drawLine(renderer, rect.x, rect.y, rect.x + rect.w, rect.y, lightLine);
    drawLine(renderer, rect.x, rect.y, rect.x, rect.y + rect.h, lightLine);
    drawLine(renderer, rect.x, rect.y + rect.h - 1.0f, rect.x + rect.w, rect.y + rect.h - 1.0f, edge);
    drawLine(renderer, rect.x + rect.w - 1.0f, rect.y, rect.x + rect.w - 1.0f, rect.y + rect.h, edge);

    drawLine(renderer, rect.x + rect.w * 0.5f, rect.y + 4.0f, rect.x + rect.w * 0.5f, rect.y + rect.h - 5.0f, darkLine);
    drawLine(renderer, rect.x + 4.0f, rect.y + rect.h * 0.5f, rect.x + rect.w - 5.0f, rect.y + rect.h * 0.5f, lightLine);
}

}

Game::Game() = default;

Game::~Game() {
    clean();
}

bool Game::init() {
    SDL_SetHint(SDL_HINT_RENDER_SCALE_QUALITY, "0");

    if (SDL_Init(SDL_INIT_VIDEO | SDL_INIT_EVENTS) != 0) {
        std::cerr << "SDL_Init failed: " << SDL_GetError() << '\n';
        return false;
    }

    window_ = SDL_CreateWindow(
        "Mario-Like Platformer",
        SDL_WINDOWPOS_CENTERED,
        SDL_WINDOWPOS_CENTERED,
        kWindowWidth,
        kWindowHeight,
        SDL_WINDOW_SHOWN
    );

    if (!window_) {
        std::cerr << "SDL_CreateWindow failed: " << SDL_GetError() << '\n';
        return false;
    }

    renderer_ = SDL_CreateRenderer(window_, -1, SDL_RENDERER_ACCELERATED | SDL_RENDERER_PRESENTVSYNC);
    if (!renderer_) {
        renderer_ = SDL_CreateRenderer(window_, -1, SDL_RENDERER_SOFTWARE);
    }

    if (!renderer_) {
        std::cerr << "SDL_CreateRenderer failed: " << SDL_GetError() << '\n';
        return false;
    }

    SDL_SetRenderDrawBlendMode(renderer_, SDL_BLENDMODE_BLEND);

    if (textures_.init(renderer_)) {
        loadTextures();
    }

    level_.loadFromFile(levelPath());
    resetGame();
    running_ = true;
    return true;
}

void Game::run() {
    Uint64 previousCounter = SDL_GetPerformanceCounter();
    const Uint64 frequency = SDL_GetPerformanceFrequency();
    const float targetFrameSeconds = 1.0f / static_cast<float>(kTargetFps);

    while (running_) {
        const Uint64 frameStart = SDL_GetPerformanceCounter();
        const Uint64 currentCounter = SDL_GetPerformanceCounter();
        float deltaTime = static_cast<float>(currentCounter - previousCounter) / static_cast<float>(frequency);
        previousCounter = currentCounter;
        deltaTime = std::min(deltaTime, kMaxDeltaTime);

        handleEvents();
        update(deltaTime);
        render();

        const Uint64 frameEnd = SDL_GetPerformanceCounter();
        const float frameSeconds = static_cast<float>(frameEnd - frameStart) / static_cast<float>(frequency);
        if (frameSeconds < targetFrameSeconds) {
            SDL_Delay(static_cast<Uint32>((targetFrameSeconds - frameSeconds) * 1000.0f));
        }
    }
}

void Game::runOneFrame(float deltaTime) {
    handleEvents();
    update(deltaTime);
    render();
}

void Game::clean() {
    textures_.clean();

    if (renderer_) {
        SDL_DestroyRenderer(renderer_);
        renderer_ = nullptr;
    }

    if (window_) {
        SDL_DestroyWindow(window_);
        window_ = nullptr;
    }

    SDL_Quit();
}

void Game::handleEvents() {
    input_.jumpPressed = false;
    restartRequested_ = false;
    advanceRequested_ = false;

    SDL_Event event;
    while (SDL_PollEvent(&event)) {
        if (event.type == SDL_QUIT) {
            running_ = false;
        }

        if (event.type == SDL_KEYDOWN && event.key.repeat == 0) {
            switch (event.key.keysym.sym) {
                case SDLK_ESCAPE:
                    running_ = false;
                    break;
                case SDLK_SPACE:
                    input_.jumpPressed = true;
                    advanceRequested_ = true;
                    break;
                case SDLK_RETURN:
                case SDLK_KP_ENTER:
                    advanceRequested_ = true;
                    break;
                case SDLK_r:
                    restartRequested_ = true;
                    break;
                default:
                    break;
            }
        }

        if (event.type == SDL_MOUSEBUTTONDOWN && event.button.button == SDL_BUTTON_LEFT) {
            advanceRequested_ = true;
        }
    }

    const Uint8* keyboard = SDL_GetKeyboardState(nullptr);
    const bool canMove = state_ == GameState::Playing;
    input_.moveLeft = canMove && (keyboard[SDL_SCANCODE_A] || keyboard[SDL_SCANCODE_LEFT]);
    input_.moveRight = canMove && (keyboard[SDL_SCANCODE_D] || keyboard[SDL_SCANCODE_RIGHT]);
}

void Game::update(float deltaTime) {
    if (restartRequested_) {
        resetGame();
        return;
    }

    if (state_ == GameState::Dialog) {
        if (advanceRequested_) {
            advanceDialog();
        }
        return;
    }

    if (state_ == GameState::Cutscene) {
        updateCutscene(deltaTime);
        updateCamera(deltaTime);
        return;
    }

    if (state_ == GameState::LevelComplete) {
        return;
    }

    InputState movementInput = input_;
    movementInput.jumpPressed = false;
    player_.handleInput(movementInput);
    walkAnimationTimer_ += std::abs(player_.velocityX()) > 1.0f ? deltaTime : 0.0f;
    player_.moveHorizontal(deltaTime);
    resolveHorizontalCollisions();

    player_.setOnGround(false);
    player_.applyGravity(deltaTime);
    player_.moveVertical(deltaTime);
    resolveVerticalCollisions();

    checkTriggers();
    updateCamera(deltaTime);
}

void Game::render() {
    const bool hasBridgeBack = textures_.has("bridge_back");
    renderAncientBackground(!hasBridgeBack);
    renderCutsceneWater();
    renderBridgeBack();
    renderLevel();
    renderNpc();
    renderPlayer();
    renderBridgeFront();
    renderCutsceneOverlay();
    renderDialog();
    renderHud();
    renderStateOverlay();

    SDL_RenderPresent(renderer_);
}

void Game::resetGame() {
    level_.loadFromFile(levelPath());
    bridgePlatforms_ = {
        Entity{SDL_FRect{300.0f, 284.0f, 170.0f, 32.0f}, EntityType::Platform, true},
        Entity{SDL_FRect{470.0f, 252.0f, 220.0f, 32.0f}, EntityType::Platform, true},
        Entity{SDL_FRect{690.0f, 236.0f, 220.0f, 32.0f}, EntityType::Platform, true},
        Entity{SDL_FRect{910.0f, 220.0f, 260.0f, 32.0f}, EntityType::Platform, true},
        Entity{SDL_FRect{1170.0f, 236.0f, 220.0f, 32.0f}, EntityType::Platform, true},
        Entity{SDL_FRect{1390.0f, 252.0f, 250.0f, 32.0f}, EntityType::Platform, true},
        Entity{SDL_FRect{1640.0f, 284.0f, 220.0f, 32.0f}, EntityType::Platform, true},
    };
    player_.reset(kPlayerSpawnRect.x, kPlayerSpawnRect.y);
    state_ = GameState::Playing;
    dialogIndex_ = 0;
    cutscene_ = CutsceneState{};
    walkAnimationTimer_ = 0.0f;
    cameraX_ = 0.0f;
    resetTriggers();
    updateWindowTitle();
}

void Game::resolveHorizontalCollisions() {
    SDL_FRect playerRect = player_.getRect();
    for (const Entity& platform : bridgePlatforms_) {
        if (!checkAABB(playerRect, platform.rect)) {
            continue;
        }

        const float playerBottom = playerRect.y + playerRect.h;
        if (player_.velocityX() != 0.0f && playerBottom <= platform.rect.y + kMaxStepUp) {
            player_.setBottom(platform.rect.y);
            player_.setOnGround(true);
            playerRect = player_.getRect();
            continue;
        }

        if (player_.velocityX() > 0.0f) {
            player_.setRight(platform.rect.x);
        } else if (player_.velocityX() < 0.0f) {
            player_.setLeft(platform.rect.x + platform.rect.w);
        }

        player_.setVelocityX(0.0f);
        playerRect = player_.getRect();
    }
}

void Game::resolveVerticalCollisions() {
    SDL_FRect playerRect = player_.getRect();
    for (const Entity& platform : bridgePlatforms_) {
        if (!checkAABB(playerRect, platform.rect)) {
            continue;
        }

        if (player_.velocityY() > 0.0f) {
            player_.setBottom(platform.rect.y);
            player_.setOnGround(true);
        } else if (player_.velocityY() < 0.0f) {
            player_.setTop(platform.rect.y + platform.rect.h);
        }

        player_.setVelocityY(0.0f);
        playerRect = player_.getRect();
    }
}

void Game::updateWindowTitle() {
    std::string title = "Ancient Architecture Journey | Zhaozhou Bridge";
    if (state_ == GameState::Dialog) {
        title += " | Space Enter Continue";
    } else if (state_ == GameState::Cutscene) {
        title += " | Flood Demonstration";
    } else if (state_ == GameState::LevelComplete) {
        title += " | Level Complete | R Restart";
    } else {
        title += " | A/D Move | R Restart | ESC Quit";
    }
    SDL_SetWindowTitle(window_, title.c_str());
}

void Game::loadTextures() {
    textures_.load("player_idle", imagePath("characters/player_idle.png"));
    textures_.load("player_walk", imagePath("characters/player_walk.png"));
    textures_.load("player_observe", imagePath("characters/player_observe.png"));
    textures_.load("lichun_idle", imagePath("npc/lichun_idle.png"));
    textures_.load("lichun_portrait", imagePath("npc/lichun_portrait.png"));
    textures_.load("bridge_back", imagePath("bridge/zhaozhou_bridge_back.png"));
    textures_.load("bridge_front", imagePath("bridge/zhaozhou_bridge_front.png"));
    textures_.load("bridge_walkway_tile", imagePath("bridge/bridge_walkway_tile.png"));
    textures_.load("stone_tile", imagePath("bridge/stone_tile.png"));
    textures_.load("water_base", imagePath("water/water_base.png"));
    textures_.load("water_wave", imagePath("water/water_wave_strip.png"));
    textures_.load("dialog_box", imagePath("ui/dialog_box.png"));
    textures_.load("name_box", imagePath("ui/name_box.png"));
    textures_.load("next_arrow", imagePath("ui/next_arrow.png"));
}

void Game::resetTriggers() {
    triggers_ = {
        TriggerZone{SDL_FRect{382.0f, 138.0f, 150.0f, 140.0f}, TriggerType::NpcDialog, false},
        TriggerZone{SDL_FRect{930.0f, 168.0f, 170.0f, 120.0f}, TriggerType::BridgeCenterCutscene, false},
        TriggerZone{SDL_FRect{1780.0f, 220.0f, 90.0f, 120.0f}, TriggerType::LevelExit, false},
    };
}

void Game::checkTriggers() {
    const SDL_FRect playerRect = player_.getRect();
    for (TriggerZone& trigger : triggers_) {
        if (trigger.triggered || !checkAABB(playerRect, trigger.rect)) {
            continue;
        }

        trigger.triggered = true;
        switch (trigger.type) {
            case TriggerType::NpcDialog:
                startDialog();
                return;
            case TriggerType::BridgeCenterCutscene:
                startCutscene();
                return;
            case TriggerType::LevelExit:
                state_ = GameState::LevelComplete;
                player_.setVelocityX(0.0f);
                player_.setVelocityY(0.0f);
                updateWindowTitle();
                return;
        }
    }
}

void Game::startDialog() {
    dialogLines_ = {
        DialogLine{"LI CHUN", "YOU HAVE ARRIVED THIS IS ZHAOZHOU BRIDGE"},
        DialogLine{"LI CHUN", "IT WAS BUILT IN THE SUI DYNASTY UNDER THE CRAFTSMAN LI CHUN"},
        DialogLine{"LI CHUN", "ITS OPEN SPANDREL ARCHES MAKE THE STONE BRIDGE STRONG AND CLEVER"},
        DialogLine{"LI CHUN", "WALK TO THE CENTER AND WATCH HOW WATER PASSES THROUGH THE ARCHES"},
        DialogLine{"XIAO YAN", "ANCIENT BRIDGES HAD TO CARRY PEOPLE AND FOLLOW THE WATER"},
    };
    dialogIndex_ = 0;
    state_ = GameState::Dialog;
    player_.setVelocityX(0.0f);
    player_.setVelocityY(0.0f);
    updateWindowTitle();
}

void Game::advanceDialog() {
    if (dialogIndex_ + 1 < dialogLines_.size()) {
        ++dialogIndex_;
        return;
    }

    state_ = GameState::Playing;
    updateWindowTitle();
}

void Game::startCutscene() {
    state_ = GameState::Cutscene;
    cutscene_ = CutsceneState{};
    player_.setVelocityX(0.0f);
    player_.setVelocityY(0.0f);
    updateWindowTitle();
}

void Game::updateCutscene(float deltaTime) {
    cutscene_.timer += deltaTime;
    if (cutscene_.timer >= 6.4f) {
        cutscene_.finished = true;
        state_ = GameState::Playing;
        updateWindowTitle();
    }
}

void Game::updateCamera(float deltaTime) {
    float target = player_.getRect().x + player_.getRect().w * 0.5f - static_cast<float>(kWindowWidth) * 0.45f;
    if (state_ == GameState::Cutscene) {
        target = kBridgeBackRect.x + kBridgeBackRect.w * 0.5f - static_cast<float>(kWindowWidth) * 0.5f;
    }

    target = clampCamera(target);
    if (state_ == GameState::Cutscene) {
        const float blend = std::min(1.0f, deltaTime * 4.0f);
        cameraX_ += (target - cameraX_) * blend;
    } else {
        cameraX_ = target;
    }
    cameraX_ = clampCamera(cameraX_);
}

SDL_FRect Game::toScreenRect(const SDL_FRect& worldRect) const {
    return SDL_FRect{worldRect.x - cameraX_, worldRect.y, worldRect.w, worldRect.h};
}

void Game::renderAncientBackground(bool drawCodeBridge) const {
    const SDL_Color sky{180, 215, 220, 255};
    const SDL_Color farMountain{150, 180, 175, 120};
    const SDL_Color nearMountain{120, 155, 150, 150};
    const SDL_Color river{85, 155, 170, 255};
    const SDL_Color wave{150, 210, 215, 160};
    const SDL_Color stone{125, 130, 125, 255};
    const SDL_Color stoneDark{74, 82, 78, 255};
    const SDL_Color stoneLight{155, 160, 154, 255};

    setDrawColor(renderer_, sky);
    SDL_RenderClear(renderer_);

    drawMountain(renderer_, -40.0f, 355.0f, 150.0f, 145.0f, 360.0f, farMountain);
    drawMountain(renderer_, 170.0f, 360.0f, 390.0f, 120.0f, 650.0f, farMountain);
    drawMountain(renderer_, 540.0f, 352.0f, 760.0f, 155.0f, 1000.0f, farMountain);
    drawMountain(renderer_, 70.0f, 390.0f, 285.0f, 210.0f, 520.0f, nearMountain);
    drawMountain(renderer_, 430.0f, 392.0f, 620.0f, 225.0f, 865.0f, nearMountain);

    drawCloud(renderer_, 90.0f, 80.0f, 0.9f);
    drawCloud(renderer_, 720.0f, 92.0f, 0.8f);
    drawCloud(renderer_, 500.0f, 58.0f, 0.55f);

    const SDL_FRect waterRect{0.0f, 394.0f, static_cast<float>(kWindowWidth), 146.0f};
    if (!textures_.render("water_base", waterRect)) {
        fillRect(renderer_, waterRect.x, waterRect.y, waterRect.w, waterRect.h, river);
    }
    for (int i = 0; i < 9; ++i) {
        const float y = 414.0f + static_cast<float>(i) * 13.0f;
        drawThickLine(renderer_, 20.0f + static_cast<float>((i % 3) * 18), y, 220.0f + static_cast<float>((i % 2) * 24), y, 2, wave);
        drawThickLine(renderer_, 330.0f + static_cast<float>((i % 2) * 12), y + 4.0f, 560.0f, y + 4.0f, 2, wave);
        drawThickLine(renderer_, 655.0f, y + 2.0f, 910.0f - static_cast<float>((i % 3) * 16), y + 2.0f, 2, wave);
    }

    if (!drawCodeBridge) {
        return;
    }

    fillRect(renderer_, 80.0f, 326.0f, 800.0f, 30.0f, stone);
    fillRect(renderer_, 92.0f, 352.0f, 776.0f, 92.0f, stone);
    fillRect(renderer_, 78.0f, 316.0f, 804.0f, 10.0f, stoneLight);
    fillRect(renderer_, 84.0f, 444.0f, 792.0f, 8.0f, stoneDark);

    carveArch(renderer_, 480.0f, 452.0f, 152.0f, 108.0f, river, stoneDark);
    carveArch(renderer_, 248.0f, 434.0f, 62.0f, 43.0f, river, stoneDark);
    carveArch(renderer_, 712.0f, 434.0f, 62.0f, 43.0f, river, stoneDark);

    for (int x = 110; x <= 850; x += 46) {
        drawLine(renderer_, static_cast<float>(x), 356.0f, static_cast<float>(x) - 16.0f, 444.0f, SDL_Color{95, 102, 98, 120});
    }
    for (int y = 374; y <= 430; y += 18) {
        drawLine(renderer_, 104.0f, static_cast<float>(y), 856.0f, static_cast<float>(y), SDL_Color{150, 155, 150, 130});
    }

    for (int x = 106; x <= 846; x += 62) {
        fillRect(renderer_, static_cast<float>(x), 292.0f, 8.0f, 28.0f, stoneDark);
        fillRect(renderer_, static_cast<float>(x) - 3.0f, 286.0f, 14.0f, 6.0f, stoneLight);
    }
    drawThickLine(renderer_, 98.0f, 304.0f, 858.0f, 304.0f, 4, stoneDark);
}

void Game::renderLevel() const {
    for (const Entity& platform : bridgePlatforms_) {
        bool renderedTile = false;
        for (float x = platform.rect.x; x < platform.rect.x + platform.rect.w; x += kTileSize) {
            SDL_FRect tileRect{x - cameraX_, platform.rect.y, kTileSize, kTileSize};
            if (textures_.render("bridge_walkway_tile", tileRect)) {
                renderedTile = true;
            }
        }
        if (!renderedTile) {
            renderStonePlatform(renderer_, toScreenRect(platform.rect));
        }
    }
}

void Game::renderNpc() const {
    const SDL_FRect npcRect = toScreenRect(kNpcRect);
    if (textures_.render("lichun_idle", npcRect)) {
        return;
    }

    fillRect(renderer_, npcRect.x + 20.0f, npcRect.y + 36.0f, 24.0f, 44.0f, SDL_Color{108, 96, 79, 255});
    drawFilledCircle(renderer_, npcRect.x + 32.0f, npcRect.y + 24.0f, 13.0f, SDL_Color{235, 188, 145, 255});
    fillRect(renderer_, npcRect.x + 16.0f, npcRect.y + 12.0f, 32.0f, 8.0f, SDL_Color{72, 68, 60, 255});
    fillRect(renderer_, npcRect.x + 26.0f, npcRect.y + 34.0f, 12.0f, 18.0f, SDL_Color{225, 224, 207, 255});
}

void Game::renderPlayer() const {
    const SDL_FRect playerRect = player_.getRect();
    const SDL_FRect textureRect{
        playerRect.x - cameraX_ - 8.0f,
        playerRect.y - 16.0f,
        48.0f,
        64.0f
    };

    if (state_ == GameState::Cutscene && textures_.render("player_observe", textureRect)) {
        return;
    }

    if (std::abs(player_.velocityX()) > 1.0f && textures_.has("player_walk")) {
        const int frame = static_cast<int>(walkAnimationTimer_ * 8.0f) % 4;
        const SDL_Rect source{frame * 48, 0, 48, 64};
        if (textures_.render("player_walk", source, textureRect)) {
            return;
        }
    }

    if (textures_.render("player_idle", textureRect)) {
        return;
    }

    const SDL_FRect fallbackRect = toScreenRect(playerRect);
    fillRect(renderer_, fallbackRect.x, fallbackRect.y, fallbackRect.w, fallbackRect.h, SDL_Color{218, 58, 52, 255});
    fillRect(renderer_, fallbackRect.x + 8.0f, fallbackRect.y + 8.0f, 16.0f, 12.0f, SDL_Color{255, 220, 200, 255});
}

void Game::renderBridgeBack() const {
    textures_.render("bridge_back", toScreenRect(kBridgeBackRect));
}

void Game::renderBridgeFront() const {
    textures_.render("bridge_front", toScreenRect(kBridgeFrontRect));
}

void Game::renderDialog() const {
    if (state_ != GameState::Dialog || dialogLines_.empty()) {
        return;
    }

    if (!textures_.render("dialog_box", kDialogRect)) {
        fillRect(renderer_, kDialogRect.x, kDialogRect.y, kDialogRect.w, kDialogRect.h, SDL_Color{42, 36, 31, 210});
        fillRect(renderer_, kDialogRect.x + 10.0f, kDialogRect.y + 10.0f, kDialogRect.w - 20.0f, kDialogRect.h - 20.0f, SDL_Color{228, 200, 133, 224});
    }

    const SDL_FRect portraitRect{58.0f, 252.0f, 96.0f, 128.0f};
    textures_.render("lichun_portrait", portraitRect);

    const SDL_FRect nameRect{70.0f, 350.0f, 180.0f, 40.0f};
    if (!textures_.render("name_box", nameRect)) {
        fillRect(renderer_, nameRect.x, nameRect.y, nameRect.w, nameRect.h, SDL_Color{141, 50, 43, 230});
    }

    const DialogLine& line = dialogLines_[dialogIndex_];
    drawText(line.speaker, nameRect.x + 18.0f, nameRect.y + 13.0f, 3, SDL_Color{245, 224, 166, 255});
    drawWrappedText(line.text, kDialogRect.x + 180.0f, kDialogRect.y + 38.0f, 3, 660.0f, SDL_Color{48, 42, 36, 255});

    const SDL_FRect arrowRect{kDialogRect.x + kDialogRect.w - 56.0f, kDialogRect.y + kDialogRect.h - 46.0f, 32.0f, 32.0f};
    if (!textures_.render("next_arrow", arrowRect)) {
        fillRect(renderer_, arrowRect.x + 10.0f, arrowRect.y + 8.0f, 12.0f, 16.0f, SDL_Color{220, 170, 60, 255});
    }
}

void Game::renderCutsceneWater() const {
    if (state_ != GameState::Cutscene) {
        return;
    }

    const float t = cutscene_.timer;
    const float rise = std::min(t / 1.5f, 1.0f);
    const float waterTop = 405.0f - rise * 115.0f;
    fillRect(renderer_, 0.0f, waterTop, static_cast<float>(kWindowWidth), 540.0f - waterTop, SDL_Color{49, 111, 142, 165});

    if (t > 2.0f) {
        const int frame = static_cast<int>(t * 8.0f) % 4;
        const SDL_Rect source{frame * 96, 0, 96, 32};
        for (int i = 0; i < 5; ++i) {
            const float offset = std::fmod(t * 54.0f + static_cast<float>(i) * 42.0f, 190.0f);
            textures_.render(
                "water_wave",
                source,
                SDL_FRect{kBridgeBackRect.x + 355.0f + offset - cameraX_, kBridgeBackRect.y + 225.0f + static_cast<float>(i % 2) * 12.0f, 96.0f, 32.0f}
            );
            textures_.render(
                "water_wave",
                source,
                SDL_FRect{kBridgeBackRect.x + 160.0f + offset * 0.45f - cameraX_, kBridgeBackRect.y + 210.0f, 72.0f, 24.0f}
            );
            textures_.render(
                "water_wave",
                source,
                SDL_FRect{kBridgeBackRect.x + 625.0f + offset * 0.45f - cameraX_, kBridgeBackRect.y + 210.0f, 72.0f, 24.0f}
            );
        }
    }
}

void Game::renderCutsceneOverlay() const {
    if (state_ != GameState::Cutscene) {
        return;
    }

    const float t = cutscene_.timer;
    const SDL_Color highlight{245, 210, 96, static_cast<Uint8>((std::sin(t * 6.0f) * 0.5f + 0.5f) * 95.0f + 110.0f)};
    if (t > 1.2f) {
        carveArch(renderer_, kBridgeBackRect.x + 450.0f - cameraX_, kBridgeBackRect.y + 231.0f, 152.0f, 108.0f, SDL_Color{0, 0, 0, 0}, highlight);
        carveArch(renderer_, kBridgeBackRect.x + 215.0f - cameraX_, kBridgeBackRect.y + 218.0f, 62.0f, 43.0f, SDL_Color{0, 0, 0, 0}, highlight);
        carveArch(renderer_, kBridgeBackRect.x + 685.0f - cameraX_, kBridgeBackRect.y + 218.0f, 62.0f, 43.0f, SDL_Color{0, 0, 0, 0}, highlight);
    }

    if (t > 3.2f) {
        fillRect(renderer_, 170.0f, 32.0f, 620.0f, 74.0f, SDL_Color{236, 218, 160, 220});
        drawWrappedText("WHEN THE WATER RISES THE MAIN ARCH AND SIDE ARCHES SHARE THE FLOW AND KEEP THE BRIDGE STEADY", 192.0f, 52.0f, 3, 574.0f, SDL_Color{45, 58, 54, 255});
    }
}

void Game::renderHud() const {
    drawText("ZHAOZHOU BRIDGE", 18.0f, 18.0f, 3, SDL_Color{45, 58, 54, 255});
}

void Game::renderStateOverlay() const {
    if (state_ != GameState::LevelComplete) {
        return;
    }

    SDL_SetRenderDrawColor(renderer_, 20, 24, 32, 160);
    SDL_FRect overlay{0.0f, 0.0f, static_cast<float>(kWindowWidth), static_cast<float>(kWindowHeight)};
    SDL_RenderFillRectF(renderer_, &overlay);

    drawText("LEVEL COMPLETE", 204.0f, 176.0f, 7, SDL_Color{255, 240, 150, 255});
    drawText("ZHAOZHOU BRIDGE", 246.0f, 250.0f, 5, SDL_Color{255, 255, 255, 255});
    drawText("NEXT HUIZHOU DWELLING", 232.0f, 314.0f, 4, SDL_Color{245, 224, 166, 255});
    drawText("PRESS R TO RESTART", 264.0f, 376.0f, 3, SDL_Color{255, 255, 255, 255});
}

void Game::drawText(const std::string& text, float x, float y, int scale, SDL_Color color) const {
    SDL_SetRenderDrawColor(renderer_, color.r, color.g, color.b, color.a);

    const std::string normalized = normalizeText(text);
    const float pixel = static_cast<float>(scale);
    const float gap = static_cast<float>(scale);
    float cursorX = x;

    for (char c : normalized) {
        const auto glyph = glyphFor(c);
        for (std::size_t row = 0; row < glyph.size(); ++row) {
            for (std::size_t col = 0; col < glyph[row].size(); ++col) {
                if (glyph[row][col] != '1') {
                    continue;
                }
                SDL_FRect block{
                    cursorX + static_cast<float>(col) * pixel,
                    y + static_cast<float>(row) * pixel,
                    pixel,
                    pixel
                };
                SDL_RenderFillRectF(renderer_, &block);
            }
        }
        cursorX += 5.0f * pixel + gap;
    }
}

void Game::drawWrappedText(const std::string& text, float x, float y, int scale, float maxWidth, SDL_Color color) const {
    std::istringstream stream(normalizeText(text));
    std::vector<std::string> lines;
    std::string current;
    std::string word;

    const float charWidth = static_cast<float>(scale) * 6.0f;
    const std::size_t maxChars = static_cast<std::size_t>(std::max(1.0f, maxWidth / charWidth));

    while (stream >> word) {
        const std::size_t nextSize = current.empty() ? word.size() : current.size() + 1 + word.size();
        if (!current.empty() && nextSize > maxChars) {
            lines.push_back(current);
            current = word;
        } else {
            if (!current.empty()) {
                current += ' ';
            }
            current += word;
        }
    }

    if (!current.empty()) {
        lines.push_back(current);
    }

    const float lineHeight = static_cast<float>(scale) * 9.0f;
    for (std::size_t i = 0; i < lines.size(); ++i) {
        drawText(lines[i], x, y + static_cast<float>(i) * lineHeight, scale, color);
    }
}
