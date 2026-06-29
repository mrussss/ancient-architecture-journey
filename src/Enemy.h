#pragma once

#include <SDL.h>

#include <string>

enum class EnemyType {
    StoneBeast,
    WoodenPuppet,
    YamenGuard,
    PalaceLion
};

class Enemy {
public:
    Enemy() = default;
    Enemy(EnemyType type, SDL_FRect rect, float leftLimit, float rightLimit);

    void update(float deltaTime);
    void damage(int amount);

    bool isAlive() const;
    SDL_FRect getRect() const;
    EnemyType type() const;
    int contactDamage() const;
    bool facingRight() const;
    const std::string& textureId() const;

private:
    EnemyType type_{EnemyType::StoneBeast};
    SDL_FRect rect_{};
    float vx_{75.0f};
    float leftLimit_{0.0f};
    float rightLimit_{0.0f};
    int hp_{1};
    int damage_{1};
    bool alive_{true};
    bool facingRight_{true};
    std::string textureId_{"enemy_stone_beast"};
};
