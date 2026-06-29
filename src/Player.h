#pragma once

#include "Constants.h"

#include <SDL.h>

struct InputState {
    bool moveLeft{false};
    bool moveRight{false};
    bool jumpPressed{false};
    bool attackPressed{false};
};

class Player {
public:
    Player();

    void reset(float x, float y);
    void handleInput(const InputState& input);
    void update(float deltaTime);
    void applyGravity(float deltaTime);
    void moveHorizontal(float deltaTime);
    void moveVertical(float deltaTime);

    void damage(int amount);
    void respawn(float x, float y);
    void updateInvincible(float deltaTime);

    void startAttack();
    void updateAttack(float deltaTime);

    SDL_FRect getRect() const;
    SDL_FRect getAttackRect() const;

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

    int hp() const;
    int maxHp() const;
    bool isDead() const;
    bool isAttacking() const;
    bool isInvincible() const;
    bool facingRight() const;

private:
    float x_{0.0f};
    float y_{0.0f};
    float velocityX_{0.0f};
    float velocityY_{0.0f};
    int hp_{kPlayerMaxHp};
    int maxHp_{kPlayerMaxHp};
    bool onGround_{false};
    bool facingRight_{true};
    bool invincible_{false};
    float invincibleTimer_{0.0f};
    bool attacking_{false};
    float attackTimer_{0.0f};
    float attackCooldownTimer_{0.0f};
};
