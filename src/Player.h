#pragma once

#include <SDL.h>

struct InputState {
    bool moveLeft{false};
    bool moveRight{false};
    bool jumpPressed{false};
};

class Player {
public:
    Player();

    void reset(float x, float y);
    void handleInput(const InputState& input);
    void applyGravity(float deltaTime);
    void moveHorizontal(float deltaTime);
    void moveVertical(float deltaTime);
    void render(SDL_Renderer* renderer) const;

    SDL_FRect getRect() const;

    float velocityX() const;
    float velocityY() const;
    void setVelocityX(float velocityX);
    void setVelocityY(float velocityY);

    void setLeft(float left);
    void setRight(float right);
    void setTop(float top);
    void setBottom(float bottom);

    bool isOnGround() const;
    void setOnGround(bool onGround);

private:
    float x_{0.0f};
    float y_{0.0f};
    float velocityX_{0.0f};
    float velocityY_{0.0f};
    bool onGround_{false};
};

