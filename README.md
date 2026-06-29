# Mario-Like Platformer

C++17 + SDL2 + SDL_image + CMake MVP for a 2D platform jumping game.

The first level is a Zhaozhou Bridge narrative guide scene. The player starts
at the left side of the bridge, meets Li Chun, reads a short guide dialog,
walks to the bridge center, watches a flood-drainage demonstration, then exits
to a placeholder next level state.

## Features

- 960x540 SDL2 window
- A/D or arrow-key movement
- Guided walking with gravity and simple bridge collision
- AABB platform collision
- NPC dialog trigger
- Bridge-center flood demonstration cutscene
- Level-complete trigger at the right exit
- R restart
- ESC quit
- Text-file level in `assets/levels/level1.txt`
- Zhaozhou Bridge scene using PNG assets and code-drawn fallback visuals
- PNG texture loading through SDL_image with code-drawn fallbacks

## Build

```bash
cmake -S . -B build
cmake --build build
```

The CMake project first tries to use system SDL2 and SDL_image installs. If
they are not available, it fetches SDL2 and SDL_image source with CMake
FetchContent and builds them locally under `build/`.

On Ubuntu with administrator access, the system package route is:

```bash
sudo apt-get install cmake g++ pkg-config libsdl2-dev libsdl2-image-dev
```

## Run

```bash
./build/mario_like
```

Controls:

- A / Left: move left
- D / Right: move right
- Space / Enter / Left click: continue dialog
- R: restart
- ESC: quit

If running in a headless terminal where no desktop window can be opened, this
command can be used only as a smoke test:

```bash
SDL_VIDEODRIVER=dummy ./build/mario_like --smoke-test
```
