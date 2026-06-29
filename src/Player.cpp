#include "Player.h"

#include "Constants.h"

#include <algorithm>

Player::Player() = default;

void Player::reset(float x, float y) {
    x_ = x;
    y_ = y;
    velocityX_ = 0.0f;
    velocityY_ = 0.0f;
    onGround_ = false;
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

    if (input.jumpPressed && onGround_) {
        velocityY_ = kPlayerJumpVelocity;
        onGround_ = false;
    }
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

void Player::render(SDL_Renderer* renderer) const {
    const SDL_FRect rect = getRect();
    SDL_SetRenderDrawColor(renderer, 218, 58, 52, 255);
    SDL_RenderFillRectF(renderer, &rect);

    SDL_SetRenderDrawColor(renderer, 255, 220, 200, 255);
    SDL_FRect face{rect.x + 8.0f, rect.y + 8.0f, 16.0f, 12.0f};
    SDL_RenderFillRectF(renderer, &face);
}

SDL_FRect Player::getRect() const {
    return SDL_FRect{x_, y_, kPlayerWidth, kPlayerHeight};
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

