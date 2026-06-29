#include "Game.h"

#include "Collision.h"
#include "Constants.h"

#include <SDL.h>

#include <algorithm>
#include <array>
#include <cctype>
#include <cmath>
#include <iostream>
#include <string_view>

namespace {
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
        case ':': return {"00000", "00100", "00100", "00000", "00100", "00100", "00000"};
        case '/': return {"00001", "00010", "00010", "00100", "01000", "01000", "10000"};
        case '-': return {"00000", "00000", "00000", "11111", "00000", "00000", "00000"};
        case '.': return {"00000", "00000", "00000", "00000", "00000", "01100", "01100"};
        case ' ': return {"00000", "00000", "00000", "00000", "00000", "00000", "00000"};
        default: return {"11111", "00001", "00010", "00100", "00100", "00000", "00100"};
    }
}

std::string normalizeText(std::string text) {
    for (char& c : text) {
        const unsigned char value = static_cast<unsigned char>(c);
        if (std::isalnum(value) || c == ' ' || c == ':' || c == '/' || c == '-' || c == '.') {
            c = static_cast<char>(std::toupper(value));
        } else {
            c = ' ';
        }
    }
    return text;
}

SDL_Color backgroundTop(int id) {
    switch (id) {
        case 1: return SDL_Color{143, 188, 190, 255};
        case 2: return SDL_Color{172, 190, 181, 255};
        case 3: return SDL_Color{154, 169, 178, 255};
        case 4: return SDL_Color{177, 151, 132, 255};
        default: return SDL_Color{143, 188, 190, 255};
    }
}

SDL_Color themeColor(int id) {
    switch (id) {
        case 1: return SDL_Color{92, 106, 104, 255};
        case 2: return SDL_Color{62, 73, 67, 255};
        case 3: return SDL_Color{133, 54, 45, 255};
        case 4: return SDL_Color{154, 45, 34, 255};
        default: return SDL_Color{92, 106, 104, 255};
    }
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
        "Ancient Architecture Journey",
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

    loadLevel(1);
    state_ = GameState::MainMenu;
    rebuildButtons();
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
    input_.attackPressed = false;
    mouseDownConsumed_ = false;

    SDL_Event event;
    while (SDL_PollEvent(&event)) {
        if (event.type == SDL_QUIT) {
            running_ = false;
        } else if (event.type == SDL_KEYDOWN && event.key.repeat == 0) {
            handleKeyDown(event.key.keysym.sym);
        } else if (event.type == SDL_MOUSEMOTION) {
            handleMouseMove(event.motion.x, event.motion.y);
        } else if (event.type == SDL_MOUSEBUTTONDOWN && event.button.button == SDL_BUTTON_LEFT) {
            handleMouseClick(event.button.x, event.button.y);
        }
    }

    const Uint8* keys = SDL_GetKeyboardState(nullptr);
    input_.moveLeft = keys[SDL_SCANCODE_A] || keys[SDL_SCANCODE_LEFT];
    input_.moveRight = keys[SDL_SCANCODE_D] || keys[SDL_SCANCODE_RIGHT];
}

void Game::handleKeyDown(SDL_Keycode key) {
    if (key == SDLK_ESCAPE) {
        if (state_ == GameState::Playing) {
            previousPlayingState_ = state_;
            state_ = GameState::Paused;
            rebuildButtons();
        } else if (state_ == GameState::Paused) {
            state_ = GameState::Playing;
            rebuildButtons();
        } else if (state_ == GameState::GameOver || state_ == GameState::LevelComplete) {
            returnToLevelSelect();
        } else if (state_ == GameState::LevelSelect) {
            state_ = GameState::MainMenu;
            rebuildButtons();
        } else {
            running_ = false;
        }
        return;
    }

    if (state_ == GameState::Playing) {
        if (key == SDLK_SPACE) {
            input_.jumpPressed = true;
        } else if (key == SDLK_j) {
            input_.attackPressed = true;
        } else if (key == SDLK_r) {
            restartLevel();
        }
        return;
    }

    if (key == SDLK_r && (state_ == GameState::Paused || state_ == GameState::GameOver || state_ == GameState::LevelComplete)) {
        restartLevel();
        return;
    }

    if (key == SDLK_RETURN || key == SDLK_KP_ENTER) {
        if (state_ == GameState::FinalComplete) {
            state_ = GameState::MainMenu;
            rebuildButtons();
        } else {
            activateSelectedButton();
        }
        return;
    }

    if (buttons_.empty()) {
        return;
    }
    if (key == SDLK_UP || key == SDLK_LEFT || key == SDLK_w || key == SDLK_a) {
        selectedButton_ = (selectedButton_ + static_cast<int>(buttons_.size()) - 1) % static_cast<int>(buttons_.size());
    } else if (key == SDLK_DOWN || key == SDLK_RIGHT || key == SDLK_s || key == SDLK_d) {
        selectedButton_ = (selectedButton_ + 1) % static_cast<int>(buttons_.size());
    }
}

void Game::handleMouseMove(int x, int y) {
    for (std::size_t i = 0; i < buttons_.size(); ++i) {
        buttons_[i].hovered = pointInRect(static_cast<float>(x), static_cast<float>(y), buttons_[i].rect);
        if (buttons_[i].hovered) {
            selectedButton_ = static_cast<int>(i);
        }
    }
}

void Game::handleMouseClick(int x, int y) {
    for (std::size_t i = 0; i < buttons_.size(); ++i) {
        if (pointInRect(static_cast<float>(x), static_cast<float>(y), buttons_[i].rect)) {
            selectedButton_ = static_cast<int>(i);
            activateSelectedButton();
            mouseDownConsumed_ = true;
            break;
        }
    }
}

void Game::activateSelectedButton() {
    if (selectedButton_ < 0 || selectedButton_ >= static_cast<int>(buttons_.size())) {
        return;
    }
    const std::string label = buttons_[selectedButton_].text;

    if (state_ == GameState::MainMenu) {
        if (label == "START GAME") {
            loadLevel(1);
            state_ = GameState::Playing;
        } else if (label == "SELECT LEVEL") {
            state_ = GameState::LevelSelect;
        } else if (label == "QUIT") {
            running_ = false;
        }
    } else if (state_ == GameState::LevelSelect) {
        if (label == "BACK") {
            state_ = GameState::MainMenu;
        } else {
            loadLevel(selectedButton_ + 1);
            state_ = GameState::Playing;
        }
    } else if (state_ == GameState::Paused) {
        if (label == "RESUME") {
            state_ = GameState::Playing;
        } else if (label == "RESTART") {
            restartLevel();
        } else if (label == "LEVEL SELECT") {
            returnToLevelSelect();
        } else if (label == "MAIN MENU") {
            state_ = GameState::MainMenu;
        }
    } else if (state_ == GameState::GameOver) {
        if (label == "RESTART") {
            restartLevel();
        } else if (label == "LEVEL SELECT") {
            returnToLevelSelect();
        } else if (label == "MAIN MENU") {
            state_ = GameState::MainMenu;
        }
    } else if (state_ == GameState::LevelComplete) {
        if (label == "NEXT LEVEL") {
            loadLevel(std::min(4, currentLevelId_ + 1));
            state_ = GameState::Playing;
        } else if (label == "RESTART") {
            restartLevel();
        } else if (label == "LEVEL SELECT") {
            returnToLevelSelect();
        }
    }
    rebuildButtons();
}

void Game::update(float deltaTime) {
    if (state_ == GameState::Playing) {
        updatePlaying(deltaTime);
    }
}

void Game::updatePlaying(float deltaTime) {
    player_.handleInput(input_);
    player_.update(deltaTime);
    player_.applyGravity(deltaTime);
    player_.moveHorizontal(deltaTime);
    resolveHorizontalCollisions();
    player_.moveVertical(deltaTime);
    resolveVerticalCollisions();

    for (Enemy& enemy : level_.enemies) {
        enemy.update(deltaTime);
        if (enemy.isAlive() && player_.isAttacking() && checkAABB(player_.getAttackRect(), enemy.getRect())) {
            enemy.damage(1);
        }
        if (enemy.isAlive() && checkAABB(player_.getRect(), enemy.getRect())) {
            player_.damage(enemy.contactDamage());
        }
    }

    for (Trap& trap : level_.traps) {
        if (trap.active && checkAABB(player_.getRect(), trap.rect)) {
            player_.damage(trap.damage);
        }
    }

    for (Collectible& page : level_.pages) {
        if (!page.collected && checkAABB(player_.getRect(), page.rect)) {
            page.collected = true;
        }
    }

    if (player_.getRect().y > level_.worldHeight + 80.0f) {
        player_.damage(1);
        if (!player_.isDead()) {
            player_.respawn(level_.playerSpawn.x, level_.playerSpawn.y);
        }
    }

    if (player_.isDead()) {
        state_ = GameState::GameOver;
        rebuildButtons();
        return;
    }

    if (level_.goal.active && checkAABB(player_.getRect(), level_.goal.rect)) {
        completeLevel();
        return;
    }

    updateCamera();
}

void Game::render() {
    SDL_SetRenderDrawColor(renderer_, 25, 28, 31, 255);
    SDL_RenderClear(renderer_);

    if (state_ == GameState::MainMenu) {
        renderBackground();
        renderMenuLikeScreen("ANCIENT ARCHITECTURE JOURNEY", "A 2D PLATFORM JOURNEY THROUGH OLD CHINA");
    } else if (state_ == GameState::LevelSelect) {
        renderBackground();
        renderMenuLikeScreen("SELECT LEVEL", "CHOOSE AN ARCHITECTURE CHAPTER");
    } else if (state_ == GameState::FinalComplete) {
        renderBackground();
        renderPanel(130.0f, 92.0f, 700.0f, 356.0f);
        drawText("JOURNEY COMPLETE", 230.0f, 126.0f, 4, SDL_Color{246, 226, 166, 255});
        drawWrappedText("YOU COLLECTED THE YINGZAO FASHI PAGES AND CROSSED BRIDGES HOMES YAMEN AND PALACES.", 180.0f, 205.0f, 2, 610.0f, SDL_Color{238, 238, 224, 255});
        drawText("PRESS ENTER TO MAIN MENU", 258.0f, 380.0f, 2, SDL_Color{213, 221, 209, 255});
    } else {
        renderBackground();
        renderLevel();
        renderPlayer();
        renderHud();

        if (state_ == GameState::Paused) {
            fillRect(SDL_FRect{0.0f, 0.0f, static_cast<float>(kWindowWidth), static_cast<float>(kWindowHeight)}, SDL_Color{0, 0, 0, 130});
            renderMenuLikeScreen("PAUSED", "ESC TO RESUME");
        } else if (state_ == GameState::GameOver) {
            fillRect(SDL_FRect{0.0f, 0.0f, static_cast<float>(kWindowWidth), static_cast<float>(kWindowHeight)}, SDL_Color{0, 0, 0, 150});
            renderMenuLikeScreen("GAME OVER", "R TO RESTART");
        } else if (state_ == GameState::LevelComplete) {
            fillRect(SDL_FRect{0.0f, 0.0f, static_cast<float>(kWindowWidth), static_cast<float>(kWindowHeight)}, SDL_Color{0, 0, 0, 135});
            renderMenuLikeScreen("LEVEL COMPLETE", "PAGES: " + std::to_string(collectedPages()) + " / " + std::to_string(totalPages()));
        }
    }

    SDL_RenderPresent(renderer_);
}

void Game::loadTextures() {
    textures_.load("bg_bridge", imagePath("backgrounds/level1_bridge.png"));
    textures_.load("bg_huizhou", imagePath("backgrounds/level2_huizhou.png"));
    textures_.load("bg_yamen", imagePath("backgrounds/level3_yamen.png"));
    textures_.load("bg_taihe", imagePath("backgrounds/level4_taihe.png"));
    textures_.load("player_idle", imagePath("player/xiaoyan_idle.png"));
    textures_.load("player_walk", imagePath("player/xiaoyan_walk.png"));
    textures_.load("player_jump", imagePath("player/xiaoyan_jump.png"));
    textures_.load("player_attack", imagePath("player/xiaoyan_attack.png"));
    textures_.load("tile_stone", imagePath("tiles/stone_tile.png"));
    textures_.load("tile_wood", imagePath("tiles/wood_tile.png"));
    textures_.load("tile_brick", imagePath("tiles/brick_tile.png"));
    textures_.load("tile_palace", imagePath("tiles/palace_tile.png"));
    textures_.load("item_page", imagePath("items/page.png"));
    textures_.load("trap_water", imagePath("traps/water.png"));
    textures_.load("trap_spike", imagePath("traps/spike.png"));
    textures_.load("trap_fire", imagePath("traps/fire.png"));
    textures_.load("trap_falling_stone", imagePath("traps/falling_stone.png"));
    textures_.load("enemy_stone_beast", imagePath("enemies/stone_beast.png"));
    textures_.load("enemy_wooden_puppet", imagePath("enemies/wooden_puppet.png"));
    textures_.load("enemy_yamen_guard", imagePath("enemies/yamen_guard.png"));
    textures_.load("enemy_palace_lion", imagePath("enemies/palace_lion.png"));
    textures_.load("ui_button", imagePath("ui/button.png"));
    textures_.load("ui_button_selected", imagePath("ui/button_selected.png"));
    textures_.load("ui_panel", imagePath("ui/panel.png"));
    textures_.load("ui_heart", imagePath("ui/heart.png"));
    textures_.load("ui_portal", imagePath("ui/portal.png"));
    textures_.load("ui_title_logo", imagePath("ui/title_logo.png"));
}

void Game::loadLevel(int levelId) {
    currentLevelId_ = std::clamp(levelId, 1, 4);
    level_ = createLevelById(currentLevelId_);
    validateLevelDesign(level_);
    player_.reset(level_.playerSpawn.x, level_.playerSpawn.y);
    cameraX_ = 0.0f;
}

void Game::restartLevel() {
    loadLevel(currentLevelId_);
    state_ = GameState::Playing;
    rebuildButtons();
}

void Game::completeLevel() {
    if (currentLevelId_ >= 4) {
        state_ = GameState::FinalComplete;
    } else {
        state_ = GameState::LevelComplete;
    }
    rebuildButtons();
}

void Game::returnToLevelSelect() {
    state_ = GameState::LevelSelect;
    rebuildButtons();
}

void Game::updateCamera() {
    const SDL_FRect playerRect = player_.getRect();
    cameraX_ = std::clamp(playerRect.x + playerRect.w * 0.5f - static_cast<float>(kWindowWidth) * 0.5f, 0.0f, std::max(0.0f, level_.worldWidth - static_cast<float>(kWindowWidth)));
}

void Game::resolveHorizontalCollisions() {
    SDL_FRect playerRect = player_.getRect();
    for (const Entity& platform : level_.platforms) {
        if (!platform.active || !checkAABB(playerRect, platform.rect)) {
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
    player_.setOnGround(false);
    SDL_FRect playerRect = player_.getRect();
    for (const Entity& platform : level_.platforms) {
        if (!platform.active || !checkAABB(playerRect, platform.rect)) {
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

int Game::collectedPages() const {
    return static_cast<int>(std::count_if(level_.pages.begin(), level_.pages.end(), [](const Collectible& page) {
        return page.collected;
    }));
}

int Game::totalPages() const {
    return static_cast<int>(level_.pages.size());
}

SDL_FRect Game::toScreenRect(const SDL_FRect& worldRect) const {
    return SDL_FRect{worldRect.x - cameraX_, worldRect.y, worldRect.w, worldRect.h};
}

bool Game::pointInRect(float x, float y, const SDL_FRect& rect) const {
    return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

void Game::rebuildButtons() {
    buttons_.clear();
    selectedButton_ = 0;
    if (state_ == GameState::MainMenu) {
        buttons_.push_back(Button{SDL_FRect{350.0f, 250.0f, 260.0f, 48.0f}, "START GAME"});
        buttons_.push_back(Button{SDL_FRect{350.0f, 312.0f, 260.0f, 48.0f}, "SELECT LEVEL"});
        buttons_.push_back(Button{SDL_FRect{350.0f, 374.0f, 260.0f, 48.0f}, "QUIT"});
    } else if (state_ == GameState::LevelSelect) {
        buttons_.push_back(Button{SDL_FRect{180.0f, 180.0f, 260.0f, 58.0f}, "LEVEL 1 BRIDGE"});
        buttons_.push_back(Button{SDL_FRect{520.0f, 180.0f, 260.0f, 58.0f}, "LEVEL 2 HUIZHOU"});
        buttons_.push_back(Button{SDL_FRect{180.0f, 282.0f, 260.0f, 58.0f}, "LEVEL 3 YAMEN"});
        buttons_.push_back(Button{SDL_FRect{520.0f, 282.0f, 260.0f, 58.0f}, "LEVEL 4 TAIHE"});
        buttons_.push_back(Button{SDL_FRect{350.0f, 405.0f, 260.0f, 48.0f}, "BACK"});
    } else if (state_ == GameState::Paused) {
        buttons_.push_back(Button{SDL_FRect{350.0f, 220.0f, 260.0f, 48.0f}, "RESUME"});
        buttons_.push_back(Button{SDL_FRect{350.0f, 278.0f, 260.0f, 48.0f}, "RESTART"});
        buttons_.push_back(Button{SDL_FRect{350.0f, 336.0f, 260.0f, 48.0f}, "LEVEL SELECT"});
        buttons_.push_back(Button{SDL_FRect{350.0f, 394.0f, 260.0f, 48.0f}, "MAIN MENU"});
    } else if (state_ == GameState::GameOver) {
        buttons_.push_back(Button{SDL_FRect{350.0f, 260.0f, 260.0f, 48.0f}, "RESTART"});
        buttons_.push_back(Button{SDL_FRect{350.0f, 320.0f, 260.0f, 48.0f}, "LEVEL SELECT"});
        buttons_.push_back(Button{SDL_FRect{350.0f, 380.0f, 260.0f, 48.0f}, "MAIN MENU"});
    } else if (state_ == GameState::LevelComplete) {
        buttons_.push_back(Button{SDL_FRect{350.0f, 250.0f, 260.0f, 48.0f}, "NEXT LEVEL"});
        buttons_.push_back(Button{SDL_FRect{350.0f, 310.0f, 260.0f, 48.0f}, "RESTART"});
        buttons_.push_back(Button{SDL_FRect{350.0f, 370.0f, 260.0f, 48.0f}, "LEVEL SELECT"});
    }
}

void Game::renderBackground() const {
    SDL_FRect full{0.0f, 0.0f, static_cast<float>(kWindowWidth), static_cast<float>(kWindowHeight)};
    if (textures_.render(level_.backgroundTextureId, full)) {
        return;
    }

    fillRect(full, backgroundTop(currentLevelId_));
    fillRect(SDL_FRect{0.0f, 360.0f, 960.0f, 180.0f}, SDL_Color{58, 91, 75, 255});
    const SDL_Color theme = themeColor(currentLevelId_);
    for (int i = 0; i < 7; ++i) {
        const float x = static_cast<float>(i * 170) - std::fmod(cameraX_ * 0.18f, 170.0f);
        fillRect(SDL_FRect{x, 265.0f - static_cast<float>((i % 3) * 18), 110.0f, 95.0f}, SDL_Color{theme.r, theme.g, theme.b, 150});
        fillRect(SDL_FRect{x - 12.0f, 245.0f - static_cast<float>((i % 3) * 18), 134.0f, 24.0f}, SDL_Color{63, 55, 48, 190});
    }
}

void Game::renderLevel() const {
    for (const Entity& platform : level_.platforms) {
        SDL_FRect dst = toScreenRect(platform.rect);
        if (dst.x > kWindowWidth || dst.x + dst.w < 0.0f) {
            continue;
        }
        if (!textures_.render(platform.textureId, dst)) {
            fillRect(dst, themeColor(currentLevelId_));
            frameRect(dst, SDL_Color{35, 38, 36, 255});
        }
    }

    for (const Trap& trap : level_.traps) {
        if (!trap.active) {
            continue;
        }
        SDL_FRect dst = toScreenRect(trap.rect);
        if (!textures_.render(trap.textureId, dst)) {
            SDL_Color color = SDL_Color{185, 58, 45, 255};
            if (trap.type == TrapType::Water) {
                color = SDL_Color{54, 132, 168, 255};
            } else if (trap.type == TrapType::Fire) {
                color = SDL_Color{223, 95, 35, 255};
            }
            fillRect(dst, color);
        }
    }

    for (const Collectible& page : level_.pages) {
        if (page.collected) {
            continue;
        }
        SDL_FRect dst = toScreenRect(page.rect);
        if (!textures_.render(page.textureId, dst)) {
            fillRect(dst, SDL_Color{230, 202, 124, 255});
            frameRect(dst, SDL_Color{110, 75, 38, 255});
        }
    }

    for (const Enemy& enemy : level_.enemies) {
        if (!enemy.isAlive()) {
            continue;
        }
        SDL_FRect dst = toScreenRect(enemy.getRect());
        if (!textures_.render(enemy.textureId(), dst)) {
            fillRect(dst, SDL_Color{112, 83, 70, 255});
            frameRect(dst, SDL_Color{52, 40, 38, 255});
        }
    }

    SDL_FRect goalRect = toScreenRect(level_.goal.rect);
    if (!textures_.render(level_.goal.textureId, goalRect)) {
        fillRect(goalRect, SDL_Color{92, 170, 185, 180});
        frameRect(goalRect, SDL_Color{232, 218, 120, 255});
    }
}

void Game::renderPlayer() const {
    const bool blinkOff = player_.isInvincible() && (static_cast<int>(SDL_GetTicks() / 120) % 2 == 0);
    if (blinkOff) {
        return;
    }

    SDL_FRect dst = toScreenRect(player_.getRect());
    const char* texture = player_.isAttacking() ? "player_attack" : (player_.isOnGround() ? "player_idle" : "player_jump");
    if (!textures_.render(texture, dst)) {
        fillRect(dst, SDL_Color{58, 108, 132, 255});
        fillRect(SDL_FRect{dst.x + 8.0f, dst.y + 7.0f, 16.0f, 13.0f}, SDL_Color{235, 188, 145, 255});
    }

    if (player_.isAttacking()) {
        SDL_FRect attack = toScreenRect(player_.getAttackRect());
        fillRect(attack, SDL_Color{245, 211, 83, 75});
    }
}

void Game::renderHud() const {
    renderPanel(14.0f, 12.0f, 250.0f, 96.0f);
    drawText("HP:", 28.0f, 28.0f, 2, SDL_Color{238, 238, 224, 255});
    for (int i = 0; i < player_.maxHp(); ++i) {
        SDL_FRect heart{76.0f + static_cast<float>(i * 26), 26.0f, 18.0f, 18.0f};
        if (i < player_.hp()) {
            if (!textures_.render("ui_heart", heart)) {
                fillRect(heart, SDL_Color{210, 52, 58, 255});
            }
        } else {
            frameRect(heart, SDL_Color{116, 116, 108, 255});
        }
    }
    drawText("PAGES: " + std::to_string(collectedPages()) + " / " + std::to_string(totalPages()), 28.0f, 58.0f, 2, SDL_Color{238, 238, 224, 255});
    drawText(level_.title, 28.0f, 84.0f, 1, SDL_Color{219, 223, 207, 255});
}

void Game::renderMenuLikeScreen(const std::string& title, const std::string& subtitle) const {
    const bool compactPanel = state_ == GameState::Paused || state_ == GameState::GameOver || state_ == GameState::LevelComplete;
    if (compactPanel) {
        renderPanel(285.0f, 140.0f, 390.0f, 340.0f);
        drawText(title, 350.0f, 170.0f, 3, SDL_Color{246, 226, 166, 255});
        drawText(subtitle, 350.0f, 210.0f, 1, SDL_Color{218, 224, 212, 255});
    } else {
        renderPanel(92.0f, 72.0f, 776.0f, 410.0f);
        drawText(title, 142.0f, 112.0f, 4, SDL_Color{246, 226, 166, 255});
        drawText(subtitle, 244.0f, 172.0f, 2, SDL_Color{218, 224, 212, 255});
        if (state_ == GameState::LevelSelect) {
            drawText("BRIDGE", 268.0f, 246.0f, 1, SDL_Color{204, 210, 196, 255});
            drawText("WHITE WALLS", 600.0f, 246.0f, 1, SDL_Color{204, 210, 196, 255});
            drawText("COUNTY OFFICE", 250.0f, 348.0f, 1, SDL_Color{204, 210, 196, 255});
            drawText("IMPERIAL HALL", 592.0f, 348.0f, 1, SDL_Color{204, 210, 196, 255});
        }
    }
    renderButtons();
}

void Game::renderButtons() const {
    for (std::size_t i = 0; i < buttons_.size(); ++i) {
        renderButton(buttons_[i], static_cast<int>(i) == selectedButton_);
    }
}

void Game::renderButton(const Button& button, bool selected) const {
    const std::string texture = selected || button.hovered ? "ui_button_selected" : "ui_button";
    if (!textures_.render(texture, button.rect)) {
        fillRect(button.rect, selected || button.hovered ? SDL_Color{196, 153, 76, 245} : SDL_Color{52, 74, 82, 235});
        frameRect(button.rect, selected || button.hovered ? SDL_Color{248, 226, 132, 255} : SDL_Color{168, 182, 173, 255});
    }
    const float textX = button.rect.x + 18.0f;
    const float textY = button.rect.y + (button.rect.h - 14.0f) * 0.5f;
    drawText(button.text, textX, textY, 2, SDL_Color{248, 246, 226, 255});
}

void Game::renderPanel(float x, float y, float w, float h) const {
    SDL_FRect rect{x, y, w, h};
    if (!textures_.render("ui_panel", rect)) {
        fillRect(rect, SDL_Color{22, 28, 30, 220});
        frameRect(rect, SDL_Color{198, 170, 91, 255});
    }
}

void Game::drawText(const std::string& text, float x, float y, int scale, SDL_Color color) const {
    const std::string normalized = normalizeText(text);
    float cursorX = x;
    for (char c : normalized) {
        const auto glyph = glyphFor(c);
        for (std::size_t row = 0; row < glyph.size(); ++row) {
            for (std::size_t col = 0; col < glyph[row].size(); ++col) {
                if (glyph[row][col] == '1') {
                    fillRect(SDL_FRect{cursorX + static_cast<float>(col * scale), y + static_cast<float>(row * scale), static_cast<float>(scale), static_cast<float>(scale)}, color);
                }
            }
        }
        cursorX += static_cast<float>(6 * scale);
    }
}

void Game::drawWrappedText(const std::string& text, float x, float y, int scale, float maxWidth, SDL_Color color) const {
    std::string line;
    float lineY = y;
    for (char c : text + " ") {
        if (c != ' ') {
            line.push_back(c);
            continue;
        }
        std::string candidate = line;
        if (!candidate.empty()) {
            candidate.push_back(' ');
        }
        const float candidateWidth = static_cast<float>(candidate.size() * 6 * scale);
        if (candidateWidth > maxWidth && !line.empty()) {
            drawText(line, x, lineY, scale, color);
            line.clear();
            lineY += static_cast<float>(10 * scale);
        } else {
            line = candidate;
        }
    }
    if (!line.empty()) {
        drawText(line, x, lineY, scale, color);
    }
}

void Game::fillRect(const SDL_FRect& rect, SDL_Color color) const {
    SDL_SetRenderDrawColor(renderer_, color.r, color.g, color.b, color.a);
    SDL_RenderFillRectF(renderer_, &rect);
}

void Game::frameRect(const SDL_FRect& rect, SDL_Color color) const {
    SDL_SetRenderDrawColor(renderer_, color.r, color.g, color.b, color.a);
    SDL_RenderDrawRectF(renderer_, &rect);
}
