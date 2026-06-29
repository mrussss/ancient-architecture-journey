#include "Player.h"

#include "Constants.h"

#include <algorithm>

Player::Player() = default;

void Player::reset(float x, float y) {
    x_ = x;
    y_ = y;
    velocityX_ = 0.0f;
    velocityY_ = 0.0f;
    hp_ = maxHp_;
    onGround_ = false;
    facingRight_ = true;
    invincible_ = false;
    invincibleTimer_ = 0.0f;
    attacking_ = false;
    attackTimer_ = 0.0f;
    attackCooldownTimer_ = 0.0f;
}

void Player::handleInput(const InputState& input) {
    int direction = 0;
    if (input.moveLeft) {
        --direction;
    }
    if (input.moveRight) {
        ++direction;
    }

    velocityX_ = static_cast<float>(direction) * kPlayerMoveSpeed;
    if (direction < 0) {
        facingRight_ = false;
    } else if (direction > 0) {
        facingRight_ = true;
    }

    if (input.jumpPressed && onGround_) {
        velocityY_ = kPlayerJumpVelocity;
        onGround_ = false;
    }

    if (input.attackPressed) {
        startAttack();
    }
}

void Player::update(float deltaTime) {
    updateInvincible(deltaTime);
    updateAttack(deltaTime);
}

void Player::applyGravity(float deltaTime) {
    velocityY_ = std::min(velocityY_ + kGravity * deltaTime, kMaxFallSpeed);
}

void Player::moveHorizontal(float deltaTime) {
    x_ += velocityX_ * deltaTime;
}

void Player::moveVertical(float deltaTime) {
    y_ += velocityY_ * deltaTime;
}

void Player::damage(int amount) {
    if (invincible_ || amount <= 0) {
        return;
    }
    hp_ = std::max(0, hp_ - amount);
    invincible_ = true;
    invincibleTimer_ = kInvincibleSeconds;
}

void Player::respawn(float x, float y) {
    x_ = x;
    y_ = y;
    velocityX_ = 0.0f;
    velocityY_ = 0.0f;
    onGround_ = false;
    invincible_ = true;
    invincibleTimer_ = kInvincibleSeconds;
}

void Player::updateInvincible(float deltaTime) {
    if (!invincible_) {
        return;
    }
    invincibleTimer_ -= deltaTime;
    if (invincibleTimer_ <= 0.0f) {
        invincibleTimer_ = 0.0f;
        invincible_ = false;
    }
}

void Player::startAttack() {
    if (attackCooldownTimer_ > 0.0f) {
        return;
    }
    attacking_ = true;
    attackTimer_ = kAttackDuration;
    attackCooldownTimer_ = kAttackCooldown;
}

void Player::updateAttack(float deltaTime) {
    if (attackCooldownTimer_ > 0.0f) {
        attackCooldownTimer_ = std::max(0.0f, attackCooldownTimer_ - deltaTime);
    }
    if (!attacking_) {
        return;
    }
    attackTimer_ -= deltaTime;
    if (attackTimer_ <= 0.0f) {
        attackTimer_ = 0.0f;
        attacking_ = false;
    }
}

SDL_FRect Player::getRect() const {
    return SDL_FRect{x_, y_, kPlayerWidth, kPlayerHeight};
}

SDL_FRect Player::getAttackRect() const {
    const float attackWidth = kPlayerWidth * 1.8f;
    const float attackHeight = kPlayerHeight * 0.75f;
    const float attackX = facingRight_ ? x_ + kPlayerWidth : x_ - attackWidth;
    return SDL_FRect{attackX, y_ + 7.0f, attackWidth, attackHeight};
}

float Player::velocityX() const {
    return velocityX_;
}

float Player::velocityY() const {
    return velocityY_;
}

void Player::setVelocityX(float velocityX) {
    velocityX_ = velocityX;
}

void Player::setVelocityY(float velocityY) {
    velocityY_ = velocityY;
}

void Player::setLeft(float left) {
    x_ = left;
}

void Player::setRight(float right) {
    x_ = right - kPlayerWidth;
}

void Player::setTop(float top) {
    y_ = top;
}

void Player::setBottom(float bottom) {
    y_ = bottom - kPlayerHeight;
}

bool Player::isOnGround() const {
    return onGround_;
}

void Player::setOnGround(bool onGround) {
    onGround_ = onGround;
}

int Player::hp() const {
    return hp_;
}

int Player::maxHp() const {
    return maxHp_;
}

bool Player::isDead() const {
    return hp_ <= 0;
}

bool Player::isAttacking() const {
    return attacking_;
}

bool Player::isInvincible() const {
    return invincible_;
}

bool Player::facingRight() const {
    return facingRight_;
}
