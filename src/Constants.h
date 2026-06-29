#pragma once

constexpr int kWindowWidth = 960;
constexpr int kWindowHeight = 540;
constexpr int kTargetFps = 60;

constexpr float kTileSize = 32.0f;
constexpr float kPlayerWidth = 40.0f;
constexpr float kPlayerHeight = 56.0f;
constexpr float kPlayerMoveSpeed = 260.0f;
constexpr float kPlayerJumpVelocity = -760.0f;
constexpr float kGravity = 2000.0f;
constexpr float kMaxFallSpeed = 980.0f;
constexpr float kMaxDeltaTime = 1.0f / 20.0f;

constexpr int kPlayerMaxHp = 3;
constexpr float kInvincibleSeconds = 1.2f;

constexpr float kAttackDuration = 0.15f;
constexpr float kAttackCooldown = 0.35f;
