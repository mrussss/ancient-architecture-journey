#include "Enemy.h"

#include <algorithm>

namespace {
std::string textureFor(EnemyType type) {
    switch (type) {
        case EnemyType::StoneBeast: return "enemy_stone_beast";
        case EnemyType::WoodenPuppet: return "enemy_wooden_puppet";
        case EnemyType::YamenGuard: return "enemy_yamen_guard";
        case EnemyType::PalaceLion: return "enemy_palace_lion";
    }
    return "enemy_stone_beast";
}
}

Enemy::Enemy(EnemyType type, SDL_FRect rect, float leftLimit, float rightLimit)
    : type_(type),
      rect_(rect),
      leftLimit_(leftLimit),
      rightLimit_(rightLimit),
      textureId_(textureFor(type)) {
}

void Enemy::update(float deltaTime) {
    if (!alive_) {
        return;
    }

    rect_.x += vx_ * deltaTime;
    if (rect_.x < leftLimit_) {
        rect_.x = leftLimit_;
        vx_ = std::abs(vx_);
        facingRight_ = true;
    } else if (rect_.x + rect_.w > rightLimit_) {
        rect_.x = rightLimit_ - rect_.w;
        vx_ = -std::abs(vx_);
        facingRight_ = false;
    }
}

void Enemy::damage(int amount) {
    if (!alive_ || amount <= 0) {
        return;
    }
    hp_ -= amount;
    if (hp_ <= 0) {
        alive_ = false;
    }
}

bool Enemy::isAlive() const {
    return alive_;
}

SDL_FRect Enemy::getRect() const {
    return rect_;
}

EnemyType Enemy::type() const {
    return type_;
}

int Enemy::contactDamage() const {
    return damage_;
}

bool Enemy::facingRight() const {
    return facingRight_;
}

const std::string& Enemy::textureId() const {
    return textureId_;
}
